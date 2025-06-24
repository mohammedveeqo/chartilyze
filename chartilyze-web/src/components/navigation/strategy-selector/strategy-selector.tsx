'use client'

import { useState } from 'react'
import { Target, Edit3, Plus } from 'lucide-react'
import { StrategyModal } from './strategy-modal'
import { StrategyDropdown } from './strategy-dropdown'
import { StrategyDetails } from './strategy-details'
import { useStrategy } from '@/app/hooks/use-strategy'
 
export function StrategySelector() {
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const { currentStrategy, setEditingStrategy } = useStrategy()

  return (
    <div className="px-4 flex-shrink-0">
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-visible">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Active Strategy</span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => {
                  setEditingStrategy(currentStrategy)
                  setShowModal(true)
                  setIsCreatingNew(false)
                }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => {
                  setIsCreatingNew(true)
                  setShowModal(true)
                  setEditingStrategy(null)
                }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <StrategyDropdown 
            isOpen={showDropdown}
            onToggle={() => setShowDropdown(!showDropdown)}
          />
          <StrategyDetails />
        </div>
      </div>

      {showModal && (
        <StrategyModal 
          isCreatingNew={isCreatingNew}
          onClose={() => {
            setShowModal(false)
            setIsCreatingNew(false)
          }}
        />
      )}
    </div>
  )
}
