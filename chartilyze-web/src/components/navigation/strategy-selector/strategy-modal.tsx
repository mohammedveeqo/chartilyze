'use client'

import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { useStrategy } from '@/app/hooks/use-strategy'
import type { StrategyFormData } from '@/types/strategy'

interface StrategyModalProps {
  isCreatingNew: boolean
  onClose: () => void
}

export function StrategyModal({ isCreatingNew, onClose }: StrategyModalProps) {
  const { editingStrategy, strategies } = useStrategy()
  
  const [formData, setFormData] = useState<StrategyFormData>({
    name: editingStrategy || '',
    pairs: editingStrategy ? strategies[editingStrategy].pairs.join(', ') : '',
    rules: editingStrategy ? strategies[editingStrategy].rules.join('\n') : '',
    color: editingStrategy ? strategies[editingStrategy].color : 'blue'
  })

  const handleSave = () => {
    // Add your save logic here
    console.log('Saving strategy:', formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isCreatingNew ? 'Create New Strategy' : `Edit ${editingStrategy}`}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {isCreatingNew ? 'Define your trading approach' : 'Modify your strategy parameters'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Strategy Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Strategy Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter strategy name"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color Theme</label>
            <div className="flex gap-2">
              {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({...formData, color})}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color 
                      ? 'border-white scale-110' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: {
                    blue: '#3b82f6',
                    green: '#10b981',
                    purple: '#8b5cf6',
                    orange: '#f59e0b',
                    red: '#ef4444'
                  }[color] }}
                />
              ))}
            </div>
          </div>
          
          {/* Preferred Pairs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Currency Pairs</label>
            <input 
              type="text" 
              value={formData.pairs}
              onChange={(e) => setFormData({...formData, pairs: e.target.value})}
              placeholder="EURUSD, GBPJPY, AUDUSD, USDJPY"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Separate pairs with commas</p>
          </div>
          
          {/* Strategy Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Strategy Rules</label>
            <textarea 
              value={formData.rules}
              onChange={(e) => setFormData({...formData, rules: e.target.value})}
              placeholder="Enter each rule on a new line&#10;Trend confirmation&#10;Volume spike present&#10;Risk management sized"
              rows={6}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Each line becomes a rule checkbox</p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isCreatingNew ? 'Create Strategy' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
