'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Save, X, Edit3, Tag, Trash2, Plus } from 'lucide-react'
import { useStrategies } from '@/app/hooks/use-strategy'
import { useMutation } from 'convex/react'
import { api } from '../../../../../chartilyze-backend/convex/_generated/api'
import { toast } from 'sonner'

interface EditStrategyModalProps {
  strategyId: string
  onClose: () => void
}

export function EditStrategyModal({ strategyId, onClose }: EditStrategyModalProps) {
  const { strategies } = useStrategies() // Use useStrategies instead of useStrategy
  const updateJournal = useMutation(api.journals.update)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [newRule, setNewRule] = useState('')
  
  // Get the strategy data from the strategies array
  const strategy = strategies.find(s => s.id === strategyId)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [] as string[],
    globalTags: [] as string[],
    complexity: 'intermediate' as 'simple' | 'intermediate' | 'advanced',
    riskProfile: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    color: 'blue'
  })

  // Pre-populate form with existing strategy data
  useEffect(() => {
    if (strategy) {
      setFormData({
        name: strategy.name || '',
        description: strategy.description || '',
        rules: strategy.rules || [],
        globalTags: strategy.globalTags || [],
        complexity: strategy.complexity || 'intermediate',
        riskProfile: strategy.riskProfile || 'moderate',
        color: 'blue' // You might want to add color to the strategy interface
      })
    }
  }, [strategy])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a strategy name')
      return
    }

    if (!strategy) {
      toast.error('Strategy not found')
      return
    }

    try {
      setIsProcessing(true)
      
      const updateData = {
        name: formData.name,
        description: formData.description,
        strategy: {
          name: formData.name,
          rules: formData.rules,
          globalTags: formData.globalTags,
          complexity: formData.complexity,
          riskProfile: formData.riskProfile,
          // Preserve existing components if any
          components: strategy.components || []
        }
      }

      await updateJournal({ id: strategy.journalId, ...updateData })
      toast.success('Strategy updated successfully!')
      onClose()
    } catch (error) {
      console.error('Error updating strategy:', error)
      toast.error('Failed to update strategy')
    } finally {
      setIsProcessing(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.globalTags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        globalTags: [...prev.globalTags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      globalTags: prev.globalTags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }))
      setNewRule('')
    }
  }

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }))
  }

  const updateRule = (index: number, newValue: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? newValue : rule)
    }))
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!strategy) {
    return null
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999] p-4 pt-8 pb-8 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl min-h-[80vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Edit Strategy: {strategy.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Modify your strategy details, rules, and tags
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
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Strategy Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Strategy Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Enter strategy name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Describe your strategy..."
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Strategy Rules
            </label>
            <div className="space-y-2">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    rows={2}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Enter rule..."
                  />
                  <button
                    onClick={() => removeRule(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <textarea
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  rows={2}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Add new rule..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault()
                      addRule()
                    }
                  }}
                />
                <button
                  onClick={addRule}
                  disabled={!newRule.trim()}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags
            </label>
            <div className="space-y-3">
              {/* Existing Tags */}
              <div className="flex flex-wrap gap-2">
                {formData.globalTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm border border-blue-600/30"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-400 hover:text-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              {/* Add New Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Add new tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <button
                  onClick={addTag}
                  disabled={!newTag.trim() || formData.globalTags.includes(newTag.trim())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Complexity & Risk Profile */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Complexity
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as any }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="simple">Simple</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Risk Profile
              </label>
              <select
                value={formData.riskProfile}
                onChange={(e) => setFormData(prev => ({ ...prev, riskProfile: e.target.value as any }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-700 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isProcessing || !formData.name.trim()}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
}