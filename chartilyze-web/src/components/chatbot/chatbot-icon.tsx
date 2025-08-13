'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { ChatbotModal } from './chatbot-modal'

export function ChatbotIcon() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleMinimize = () => {
    setIsOpen(false)
    setIsMinimized(true)
  }

  return (
    <>
      {/* Floating Chatbot Icon */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpen}
          className={`bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 relative ${
            isMinimized ? 'ring-2 ring-yellow-400' : ''
          }`}
          aria-label="Open strategy chatbot"
        >
          <MessageCircle className="w-6 h-6" />
          {isMinimized && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Chatbot Modal */}
      {isOpen && (
        <ChatbotModal 
          isOpen={isOpen} 
          onClose={handleClose}
          onMinimize={handleMinimize}
        />
      )}
    </>
  )
}