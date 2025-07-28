'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Save, X, Wand2, Check, Edit3, Tag } from 'lucide-react'
import { useStrategy } from '@/app/hooks/use-strategy'
import type { StrategyFormData, StructuredRule } from '@/types/strategy'

interface StrategyModalProps {
  isCreatingNew: boolean
  onClose: () => void
}

export function StrategyModal({ isCreatingNew, onClose }: StrategyModalProps) {
  const { editingStrategy, strategies } = useStrategy()
  
  const [step, setStep] = useState<'description' | 'review' | 'edit'>('description')
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<StrategyFormData>({
    name: editingStrategy || '',
    pairs: editingStrategy ? strategies[editingStrategy].pairs.join(', ') : '',
    rules: editingStrategy ? strategies[editingStrategy].rules.join('\n') : '',
    color: editingStrategy ? strategies[editingStrategy].color : 'blue',
    description: '',
    structuredRules: [],
    tags: []
  })

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Mock AI parsing function (replace with actual AI service)
  const parseStrategyDescription = async (description: string): Promise<{
    structuredRules: StructuredRule[],
    tags: string[],
    suggestedName: string
  }> => {
    setIsProcessing(true)
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock parsing logic - replace with actual AI service
    const mockRules: StructuredRule[] = [
      {
        id: '1',
        pattern: 'bullish engulfing',
        indicator: {
          type: 'RSI',
          condition: '<',
          value: 30
        },
        context: 'support',
        direction: 'long',
        confidence: 0.85
      }
    ]
    
    const mockTags = [
      'pattern:bullish-engulfing',
      'indicator:rsi<30',
      'context:support',
      'direction:long'
    ]
    
    setIsProcessing(false)
    return {
      structuredRules: mockRules,
      tags: mockTags,
      suggestedName: 'RSI Oversold Reversal'
    }
  }

  const handleProcessDescription = async () => {
    if (!formData.description.trim()) return
    
    try {
      const result = await parseStrategyDescription(formData.description)
      setFormData(prev => ({
        ...prev,
        structuredRules: result.structuredRules,
        tags: result.tags,
        name: prev.name || result.suggestedName
      }))
      setStep('review')
    } catch (error) {
      console.error('Failed to parse strategy:', error)
    }
  }

  const handleSave = () => {
    console.log('Saving strategy:', formData)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const renderDescriptionStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Describe Your Trading Strategy
        </label>
        <textarea 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder={`Describe your strategy in plain language...

Example: "I buy when RSI is below 30 and there's a bullish engulfing pattern at a support level. I target 2:1 risk-reward and use 1% position sizing."`}
          rows={8}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Be specific about indicators, patterns, entry/exit conditions, and risk management
        </p>
      </div>
      
      <button 
        onClick={handleProcessDescription}
        disabled={!formData.description.trim() || isProcessing}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing with AI...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            Parse Strategy with AI
          </>
        )}
      </button>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-4">
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

      {/* Parsed Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">Parsed Rules</label>
          <button 
            onClick={() => setStep('edit')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </button>
        </div>
        <div className="space-y-2">
          {formData.structuredRules.map((rule, index) => (
            <div key={rule.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Rule {index + 1}</span>
                <span className="text-xs text-gray-400">
                  {Math.round((rule.confidence || 0) * 100)}% confidence
                </span>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                {rule.pattern && <div><span className="text-gray-400">Pattern:</span> {rule.pattern}</div>}
                {rule.indicator && (
                  <div>
                    <span className="text-gray-400">Indicator:</span> {rule.indicator.type} {rule.indicator.condition} {rule.indicator.value}
                  </div>
                )}
                {rule.context && <div><span className="text-gray-400">Context:</span> {rule.context}</div>}
                {rule.direction && <div><span className="text-gray-400">Direction:</span> {rule.direction}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-generated Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Tag className="h-4 w-4 inline mr-1" />
          Auto-generated Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded border border-blue-600/30"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          These tags will be used for filtering and performance analysis
        </p>
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
    </div>
  )

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isCreatingNew ? 'Create New Strategy' : `Edit ${editingStrategy}`}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {step === 'description' && 'Describe your strategy in natural language'}
                {step === 'review' && 'Review AI-parsed rules and tags'}
                {step === 'edit' && 'Fine-tune your strategy rules'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              step === 'description' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              1. Describe
            </div>
            <div className="w-8 h-px bg-gray-600"></div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              2. Review
            </div>
            <div className="w-8 h-px bg-gray-600"></div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              step === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              3. Save
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'description' && renderDescriptionStep()}
          {step === 'review' && renderReviewStep()}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex gap-3">
          {step === 'review' && (
            <button 
              onClick={() => setStep('description')}
              className="py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Back
            </button>
          )}
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          {step === 'review' && (
            <button 
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isCreatingNew ? 'Create Strategy' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
}
