'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useStrategies, useCurrentStrategy } from '@/app/hooks/use-strategy'

interface StrategyDropdownProps {
  onClose: () => void
}

export function StrategyDropdown({ onClose }: StrategyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { strategies } = useStrategies()
  const { currentStrategy, setCurrentStrategy } = useCurrentStrategy()

  const handleStrategySelect = (strategyId: string) => {
    setCurrentStrategy(strategyId)
    setIsOpen(false)
    onClose()
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  // Helper function to truncate long strategy names
  const truncateStrategyName = (name: string, maxLength: number = 30) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between text-left mb-3 px-3 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm text-white truncate" title={currentStrategy?.name}>
          {currentStrategy?.name ? truncateStrategyName(currentStrategy.name) : 'Select Strategy'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => handleStrategySelect(strategy.id)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                strategy.id === currentStrategy?.id ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'
              }`}
            >
              <div className="font-medium" title={strategy.name}>
                {truncateStrategyName(strategy.name)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
