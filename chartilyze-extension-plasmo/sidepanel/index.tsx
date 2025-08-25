import { sendToBackground } from "@plasmohq/messaging"
import { useState, useEffect, useRef } from "react"
import { Storage } from "@plasmohq/storage"
import type { Strategy } from "~lib/types"
import { JournalEntry } from "~components/JournalEntry"
import "../style.css"

// Simple markdown-like formatting function
const formatMessage = (text: string) => {
  // Split by double asterisks for bold
  const parts = text.split(/\*\*(.*?)\*\*/g)
  
  return parts.map((part, index) => {
    // Every odd index is bold text
    if (index % 2 === 1) {
      return <strong key={index} className="font-semibold">{part}</strong>
    }
    return part
  })
}

function SidePanel() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false)
  const [strategySearch, setStrategySearch] = useState("")
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false)
  const [showJournalEntry, setShowJournalEntry] = useState(false)
  const storage = new Storage()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuthStatus()
    loadStrategies()
    loadCurrentStrategy()
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStrategyDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-select first strategy when strategies are loaded
  useEffect(() => {
    if (strategies.length > 0 && !currentStrategy) {
      const firstStrategy = strategies[0]
      selectStrategy(firstStrategy)
    }
  }, [strategies, currentStrategy])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const checkAuthStatus = async () => {
    try {
      const authResult = await sendToBackground({
        name: "checkAuth"
      })
      setIsAuthenticated(authResult.isAuthenticated)
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStrategies = async () => {
    try {
      const result = await sendToBackground({
        name: "getStrategies"
      })
      if (result.success) {
        setStrategies(result.strategies)
        console.log('Loaded strategies:', result.strategies)
      } else {
        console.error('Failed to load strategies:', result)
      }
    } catch (error) {
      console.error("Failed to load strategies:", error)
    }
  }

  const loadCurrentStrategy = async () => {
    try {
      const stored = await storage.get('currentStrategy')
      if (stored) {
        const strategy = typeof stored === 'string' ? JSON.parse(stored) : stored
        setCurrentStrategy(strategy)
      }
    } catch (error) {
      console.error("Failed to load current strategy:", error)
    }
  }

  const selectStrategy = async (strategy: Strategy) => {
    setCurrentStrategy(strategy)
    setShowStrategyDropdown(false)
    await storage.set('currentStrategy', strategy)
    
    // Add welcome message with strategy-specific knowledge
    const welcomeMessage = {
      id: Date.now().toString(),
      content: `Hello! I'm here to help you with your **${strategy.name}** strategy. ${strategy.description ? `\n\n${strategy.description}` : ''} \n\nWhat would you like to know about this strategy?`,
      type: 'bot',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, welcomeMessage])
  }

  const filteredStrategies = strategies.filter(strategy =>
    strategy.name.toLowerCase().includes(strategySearch.toLowerCase()) ||
    strategy.description?.toLowerCase().includes(strategySearch.toLowerCase())
  )

  const handleSendMessage = async () => {
    if (!message.trim()) return
  
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setMessage("")
    setIsChatLoading(true)
  
    try {
      // Build conversation history
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
  
      // Prepare strategy context
  const strategyContext = currentStrategy ? {
    name: currentStrategy.name,
    description: currentStrategy.description, // ← This is the key field with actual strategy content!
    rules: currentStrategy.rules || [],
    components: currentStrategy.components,
    complexity: currentStrategy.complexity,
    riskProfile: currentStrategy.riskProfile
  } : undefined
  
  console.log('🎯 Strategy context being sent:', strategyContext)
  
      const result = await sendToBackground({
        name: "sendChatMessage",
        body: { 
          message, 
          strategyContext,
          conversationHistory
        }
      })
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: result.success ? result.message : "❌ Error: " + result.message,
        type: 'bot',
        timestamp: new Date(),
        isError: !result.success
      }
      
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "❌ Failed to send message. Please check if the server is running.",
        type: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleAuth = async () => {
    try {
      await sendToBackground({
        name: "openAuthFlow"
      })
    } catch (error) {
      console.error("Auth flow failed:", error)
    }
  }

  const handleCaptureScreenshot = async () => {
    setIsCapturingScreenshot(true)
    try {
      const result = await sendToBackground({
        name: "captureScreenshot"
      })
      
      if (result.success && result.screenshot) {
        // Add screenshot message to chat
        const screenshotMessage = {
          id: Date.now().toString(),
          content: `📸 Screenshot captured successfully!`,
          type: 'system',
          timestamp: new Date(),
          screenshot: result.screenshot // Add the screenshot data
        }
        setMessages(prev => [...prev, screenshotMessage])
        
        // Add follow-up message with journal option
        const journalPromptMessage = {
          id: (Date.now() + 1).toString(),
          content: "Would you like to journal this trade? Click the button below to add trade details.",
          type: 'bot',
          timestamp: new Date(),
          showJournalButton: true // Flag to show journal button
        }
        setMessages(prev => [...prev, journalPromptMessage])
      } else {
        throw new Error(result.error || 'Failed to capture screenshot')
      }
    } catch (error) {
      console.error("Screenshot capture failed:", error)
      const errorMessage = {
        id: Date.now().toString(),
        content: "❌ Failed to capture screenshot. Please try again.",
        type: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsCapturingScreenshot(false)
    }
  }

  const handleOpenJournalEntry = () => {
    setShowJournalEntry(true)
  }

  const handleJournalSuccess = (message: string) => {
    setShowJournalEntry(false)
    const successMessage = {
      id: Date.now().toString(),
      content: message || "📝 Journal entry created successfully!",
      type: 'system',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, successMessage])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen p-4 bg-gray-50 text-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading Chartilyze...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-gray-50 text-gray-800">
        <div className="text-center mb-6 max-w-md">
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📈</span>
          </div>
          <h1 className="text-xl font-semibold mb-2 text-gray-900">
            Chartilyze Assistant
          </h1>
          <p className="text-gray-600 text-sm">
            Your AI-powered trading strategy companion. Please authenticate to access features.
          </p>
        </div>
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          onClick={handleAuth}>
          Sign In to Continue
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-sm">📈</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              Strategy Assistant
            </h1>
            <p className="text-xs text-gray-500">Chartilyze Extension</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Connected</span>
        </div>
      </div>

      {/* Strategy Selector */}
      <div className="p-4 border-b border-gray-200 bg-gray-50" ref={dropdownRef}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">Active Strategy</span>
          <span className="text-xs text-blue-500">{strategies.length} available</span>
        </div>
        <div className="relative">
          <button
            className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            onClick={() => setShowStrategyDropdown(!showStrategyDropdown)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                currentStrategy ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium truncate">
                {currentStrategy ? currentStrategy.name : "Loading strategy..."}
              </span>
            </div>
            <span className={`text-sm transition-transform duration-200 ${
              showStrategyDropdown ? 'rotate-180' : ''
            }`}>⌄</span>
          </button>
          
          {showStrategyDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search strategies..."
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={strategySearch}
                  onChange={(e) => setStrategySearch(e.target.value)}
                />
              </div>
              
              {/* Strategy List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredStrategies.length > 0 ? (
                  filteredStrategies.map((strategy) => (
                    <button
                      key={strategy.id}
                      className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                        currentStrategy?.id === strategy.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : ''
                      }`}
                      onClick={() => selectStrategy(strategy)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          currentStrategy?.id === strategy.id ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{strategy.name}</div>
                          {strategy.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {strategy.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    {strategies.length === 0 
                      ? 'No strategies available. Make sure the server is running.' 
                      : 'No strategies match your search'
                    }
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-base font-medium mb-2">Ready to analyze</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              {currentStrategy 
                ? `Ask me anything about your ${currentStrategy.name} strategy.`
                : 'Loading your strategy...'}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${
                msg.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  msg.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : msg.type === 'system'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : msg.isError
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {/* Screenshot display */}
                  {msg.screenshot && (
                    <div className="mb-2">
                      <img 
                        src={msg.screenshot} 
                        alt="Screenshot" 
                        className="w-full rounded-md border border-gray-300"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                  
                  <div className="text-sm">
                    {msg.type === 'bot' && !msg.isError ? (
                      <div className="whitespace-pre-wrap">
                        {formatMessage(msg.content)}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  
                  {/* Journal button for messages that have showJournalButton flag */}
                  {msg.showJournalButton && (
                    <div className="mt-2">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                        onClick={handleOpenJournalEntry}
                      >
                        📝 Journal Trade
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Chat Loading Indicator */}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700"
            onClick={handleCaptureScreenshot}
            disabled={isCapturingScreenshot || isChatLoading}
          >
            {isCapturingScreenshot ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>📸</span>
            )}
            <span>{isCapturingScreenshot ? 'Capturing...' : 'Screenshot'}</span>
          </button>
          
          <button
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700"
            onClick={handleOpenJournalEntry}
            disabled={isChatLoading}
          >
            <span>📝</span>
            <span>Journal Entry</span>
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={currentStrategy ? `Ask about ${currentStrategy.name}...` : "Ask about trading strategies..."}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          />
          <button
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            onClick={handleSendMessage}
            disabled={isChatLoading || !message.trim()}
          >
            {isChatLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '→'
            )}
          </button>
        </div>
        {currentStrategy && (
          <div className="mt-2 text-xs text-gray-500">
            Using strategy: <span className="text-blue-600 font-medium">{currentStrategy.name}</span>
          </div>
        )}
      </div>

      {/* Journal Entry Modal */}
      {showJournalEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
            <JournalEntry 
              onSuccess={handleJournalSuccess}
              onCancel={() => setShowJournalEntry(false)}
              onClose={() => setShowJournalEntry(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SidePanel