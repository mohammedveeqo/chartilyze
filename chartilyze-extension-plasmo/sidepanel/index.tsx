import { sendToBackground } from "@plasmohq/messaging"
import { useState, useEffect, useRef } from "react"
import { Storage } from "@plasmohq/storage"
import type { Strategy } from "~lib/types"
import "../style.css"

function SidePanel() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false)
  const [strategySearch, setStrategySearch] = useState("")
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
        // Parse stored strategy if it's a string, or use directly if it's already a Strategy object
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
    
    // Add system message about strategy change
    const systemMessage = {
      id: Date.now().toString(),
      content: `✅ Strategy changed to: ${strategy.name}`,
      type: 'system',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, systemMessage])
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
    setIsLoading(true)

    try {
      const result = await sendToBackground({
        name: "sendChatMessage",
        body: { 
          message, 
          context: "",
          strategy: currentStrategy 
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
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading Chartilyze...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="text-center mb-8 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-2xl">📈</span>
          </div>
          <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Chartilyze Assistant
          </h1>
          <p className="text-gray-400 leading-relaxed">
            Your AI-powered trading strategy companion. Please authenticate to access advanced features.
          </p>
        </div>
        <button
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-200 shadow-lg font-medium"
          onClick={handleAuth}>
          🔐 Sign In to Continue
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg">📈</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Strategy Assistant
            </h1>
            <p className="text-xs text-gray-400">Chartilyze Extension</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Connected</span>
        </div>
      </div>

      {/* Strategy Selector */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50" ref={dropdownRef}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Active Strategy</span>
          <span className="text-xs text-blue-400">{strategies.length} available</span>
        </div>
        <div className="relative">
          <button
            className="w-full flex items-center justify-between p-4 bg-gray-700/80 border border-gray-600/50 rounded-xl hover:bg-gray-600/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 shadow-sm"
            onClick={() => setShowStrategyDropdown(!showStrategyDropdown)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                currentStrategy ? 'bg-green-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-sm font-medium truncate">
                {currentStrategy ? currentStrategy.name : "Select a strategy"}
              </span>
            </div>
            <span className={`text-sm transition-transform duration-200 ${
              showStrategyDropdown ? 'rotate-180' : ''
            }`}>⌄</span>
          </button>
          
          {showStrategyDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700/95 border border-gray-600/50 rounded-xl shadow-2xl z-50 max-h-80 overflow-hidden backdrop-blur-sm">
              {/* Search */}
              <div className="p-4 border-b border-gray-600/50">
                <input
                  type="text"
                  placeholder="🔍 Search strategies..."
                  className="w-full p-3 bg-gray-600/80 border border-gray-500/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
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
                      className={`w-full text-left p-4 hover:bg-gray-600/80 border-b border-gray-600/30 last:border-b-0 transition-all duration-200 ${
                        currentStrategy?.id === strategy.id 
                          ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white' 
                          : ''
                      }`}
                      onClick={() => selectStrategy(strategy)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          currentStrategy?.id === strategy.id ? 'bg-white' : 'bg-blue-400'
                        }`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{strategy.name}</div>
                          {strategy.description && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {strategy.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-sm text-gray-400 text-center">
                    <div className="text-2xl mb-2">🔍</div>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <div className="text-6xl mb-6">💬</div>
            <h3 className="text-lg font-medium mb-2">Ready to analyze</h3>
            <p className="text-sm leading-relaxed max-w-sm mx-auto">
              Start a conversation about your trading strategies. I'm here to help with analysis, insights, and recommendations.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${
                msg.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  msg.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : msg.type === 'system'
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    : msg.isError
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                    : 'bg-gray-700/80 text-gray-100 border border-gray-600/50'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-800/50">
        <div className="flex gap-3">
          <input
            type="text"
            className="flex-1 p-4 bg-gray-700/80 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 transition-all duration-200"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about trading strategies..."
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          />
          <button
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-medium"
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '📤'
            )}
          </button>
        </div>
        {currentStrategy && (
          <div className="mt-2 text-xs text-gray-400">
            Using strategy: <span className="text-blue-400 font-medium">{currentStrategy.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SidePanel