'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, Bot, User, Loader2, Lightbulb, Info, Minus } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useCurrentStrategy } from '@/app/hooks/use-strategy'
import { useAction } from 'convex/react'
import { api } from '../../../../chartilyze-backend/convex/_generated/api'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  confidence?: number
  relatedRules?: string[]
  suggestedActions?: string[]
}

interface ChatbotModalProps {
  isOpen: boolean
  onClose: () => void
  onMinimize?: () => void
  onNewAIResponse?: () => void
  isMinimized?: boolean
}

export function ChatbotModal({ isOpen, onClose, onMinimize, onNewAIResponse, isMinimized }: ChatbotModalProps) {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { currentStrategy } = useCurrentStrategy()
  const chatWithStrategy = useAction(api.aiStrategy.chatWithStrategy)

  // Initialize messages on client side only
  useEffect(() => {
    if (!isInitialized) {
      setMessages([
        {
          id: '1',
          type: 'bot',
          content: 'Hi! I\'m your strategy assistant. I can help you understand your trading strategy, answer questions about your rules, and provide guidance when you\'re stuck. What would you like to know?',
          timestamp: new Date()
        }
      ])
      setIsInitialized(true)
    }
  }, [])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Build conversation history
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      // Prepare strategy context
      const strategyContext = currentStrategy ? {
        name: currentStrategy.name,
        rules: currentStrategy.rules || [],
        components: currentStrategy.components,
        complexity: currentStrategy.complexity,
        riskProfile: currentStrategy.riskProfile
      } : undefined

      const response = await chatWithStrategy({
        message: inputValue.trim(),
        strategyContext,
        conversationHistory
      })
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        confidence: response.confidence,
        relatedRules: response.relatedRules,
        suggestedActions: response.suggestedActions
      }

      setMessages(prev => [...prev, botMessage])
      
      // Notify parent about new AI response
      if (onNewAIResponse) {
        onNewAIResponse()
      }
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Also notify about error responses
      if (onNewAIResponse) {
        onNewAIResponse()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Don't render if neither open nor minimized
  if (!isOpen && !isMinimized) return null

  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 ${
      isMinimized ? 'pointer-events-none opacity-0' : ''
    }`}>
      {/* Backdrop - only show when not minimized */}
      {!isMinimized && (
        <div 
          className="absolute inset-0 bg-black/20" 
          onClick={handleBackdropClick}
        />
      )}
      
      {/* Modal */}
      <div className={`relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-full flex flex-col overflow-hidden ${
        isMinimized ? 'hidden' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Bot className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-sm sm:text-base">Strategy Assistant</h3>
              {currentStrategy && (
                <p className="text-xs text-gray-400 truncate">{currentStrategy.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onMinimize && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMinimize}
                className="text-gray-400 hover:text-white flex-shrink-0 h-8 w-8"
                title="Minimize (keeps conversation)"
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white flex-shrink-0 h-8 w-8"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages - Proper scrolling container */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex gap-2 sm:gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] sm:max-w-[75%] p-2 sm:p-3 rounded-lg break-words ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <div className="text-xs sm:text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown 
                        components={{
                          p: ({children}) => <p className="my-1">{children}</p>,
                          strong: ({children}) => <strong className="text-blue-300 font-semibold">{children}</strong>,
                          em: ({children}) => <em className="text-gray-300">{children}</em>,
                          ul: ({children}) => <ul className="my-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="my-2 space-y-1">{children}</ol>,
                          li: ({children}) => (
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 mt-1 text-xs">•</span>
                              <span className="flex-1">{children}</span>
                            </li>
                          ),
                          h3: ({children}) => <h3 className="text-sm font-semibold text-blue-300 mt-2 mb-1">{children}</h3>,
                          code: ({children}) => <code className="bg-gray-700 px-1 py-0.5 rounded text-xs">{children}</code>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user?.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt={user.fullName || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Related Rules Section */}
                {message.relatedRules && message.relatedRules.length > 0 && (
                  <div className="ml-8 sm:ml-11 mr-8 sm:mr-11">
                    <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-2 sm:p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-medium text-yellow-400">Related Strategy Rules</span>
                        <div className="group relative">
                          <Info className="w-3 h-3 text-yellow-400/70 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Rules from your strategy that relate to your question
                          </div>
                        </div>
                      </div>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {message.relatedRules.map((rule, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">•</span>
                            <span className="break-words">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="bg-gray-800 p-2 sm:p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input - Fixed at bottom */}
        <div className="p-3 sm:p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your strategy..."
              className="flex-1 bg-gray-800 text-white px-3 py-2 text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 flex-shrink-0 h-10 w-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}