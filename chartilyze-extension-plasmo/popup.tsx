import React, { useState, useEffect, useRef } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import "./style.css"

interface Message {
  id: string
  content: string
  type: 'user' | 'bot'
  timestamp: Date
  isError?: boolean
}

function Popup() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your strategy assistant. I can help analyze charts, discuss strategies, and provide trading guidance. What would you like to know?",
      type: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    checkAuthStatus()
    scrollToBottom()
  }, [messages])

  const checkAuthStatus = async () => {
    try {
      const result = await sendToBackground({ name: "checkAuth" })
      setIsAuthenticated(result.isAuthenticated)
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await sendToBackground({
        name: "sendChatMessage",
        body: {
          message: inputValue,
          context: await getPageContext()
        }
      })

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message || 'Sorry, I encountered an error.',
        type: 'bot',
        timestamp: new Date(),
        isError: !response.success
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Failed to send message. Please try again.',
        type: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getPageContext = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        const result = await chrome.tabs.sendMessage(tab.id, { action: 'getPageData' })
        return result || ''
      }
    } catch (error) {
      console.log('Could not get page context:', error)
    }
    return ''
  }

  const handleQuickAction = (action: string) => {
    const prompts = {
      analyze: "Can you help me analyze the current chart setup?",
      strategy: "I need guidance on my current trading strategy",
      journal: "How should I document this trade in my journal?"
    }
    
    if (prompts[action]) {
      setInputValue(prompts[action])
      textareaRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const openSidePanel = async () => {
    try {
      await sendToBackground({ name: "openSidePanel" })
      window.close()
    } catch (error) {
      console.error('Failed to open side panel:', error)
    }
  }

  const openAuthFlow = async () => {
    try {
      await sendToBackground({ name: "openAuthFlow" })
      window.close()
    } catch (error) {
      console.error('Failed to open auth flow:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="w-96 h-96 bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            🤖
          </div>
          <h1 className="text-xl font-bold mb-2">Chartilyze Assistant</h1>
          <p className="text-gray-400 text-sm">Please sign in to continue</p>
        </div>
        <button
          onClick={openAuthFlow}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="w-96 h-[600px] bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center gap-2">
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">
          🤖
        </div>
        <div>
          <h1 className="text-base font-semibold">Strategy Assistant</h1>
          <div className="text-xs text-gray-400">TradingView Extension</div>
        </div>
        <button
          onClick={openSidePanel}
          className="ml-auto text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
        >
          Open Panel
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              message.type === 'bot' ? 'bg-blue-500' : 'bg-gray-600'
            }`}>
              {message.type === 'bot' ? '🤖' : '👤'}
            </div>
            <div className={`max-w-[75%] p-3 rounded-xl text-sm ${
              message.type === 'bot' 
                ? message.isError 
                  ? 'bg-red-900 border border-red-700 text-red-200'
                  : 'bg-gray-800 border border-gray-700'
                : 'bg-blue-500'
            }`}>
              <div>{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">🤖</div>
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-gray-700 flex gap-2 flex-wrap">
        <button
          onClick={() => handleQuickAction('analyze')}
          className="text-xs border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded-full transition-colors"
        >
          📈 Analyze Chart
        </button>
        <button
          onClick={() => handleQuickAction('strategy')}
          className="text-xs border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded-full transition-colors"
        >
          🎯 Strategy Help
        </button>
        <button
          onClick={() => handleQuickAction('journal')}
          className="text-xs border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded-full transition-colors"
        >
          📝 Journal Entry
        </button>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about trading, charts, or strategies..."
            className="flex-1 bg-gray-800 border border-gray-600 text-white p-3 rounded-2xl text-sm resize-none focus:outline-none focus:border-blue-500 min-h-[44px] max-h-[120px]"
            rows={1}
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="w-11 h-11 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Popup
