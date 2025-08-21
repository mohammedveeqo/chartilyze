'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Save, X, Plus, Trash2, Edit3, Tag, ChevronDown, ChevronRight, FileText, Settings } from 'lucide-react'
import { useStrategies } from '@/app/hooks/use-strategy'
import { useMutation } from 'convex/react'
import { api } from '../../../../../chartilyze-backend/convex/_generated/api'
import { toast } from 'sonner'

interface StrategyComponent {
  id: string
  type: 'entry' | 'exit' | 'risk_management' | 'position_sizing' | 'market_condition' | 'level_marking' | 'confirmation'
  name: string
  description: string
  tags: string[]
  indicators?: Array<{
    name: string
    condition: string
    value: string
    timeframe?: string
  }>
  patterns?: string[]
  confidence: number
  priority: 'high' | 'medium' | 'low'
  timeframes?: string[]
  conditions?: string[]
}

interface EditStrategyModalProps {
  strategyId: string
  onClose: () => void
}

export function EditStrategyModal({ strategyId, onClose }: EditStrategyModalProps) {
  const { strategies } = useStrategies()
  const updateJournal = useMutation(api.journals.update)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'original' | 'components'>('original')
  
  // Get the strategy data from the strategies array
  const strategy = strategies.find(s => s.id === strategyId)
  
  const [strategyData, setStrategyData] = useState({
    name: '',
    description: '',
    originalDescription: '',
    components: [] as StrategyComponent[],
    globalTags: [] as string[],
    complexity: 'intermediate' as 'simple' | 'intermediate' | 'advanced',
    riskProfile: 'moderate' as 'conservative' | 'moderate' | 'aggressive'
  })

  // Pre-populate form with existing strategy data
useEffect(() => {
  if (strategy) {
    setStrategyData({
      name: strategy.name || '',
      description: strategy.description || '',
      originalDescription: strategy.rules?.[0] || '',
      components: strategy.components || [],
      globalTags: strategy.globalTags || [],
      complexity: strategy.complexity || 'intermediate',
      riskProfile: strategy.riskProfile || 'moderate'
    })
  }
}, [strategy])

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

  const toggleComponentExpansion = (componentId: string) => {
    const newExpanded = new Set(expandedComponents)
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId)
    } else {
      newExpanded.add(componentId)
    }
    setExpandedComponents(newExpanded)
  }

  const addCustomComponent = () => {
    const newComponent: StrategyComponent = {
      id: `custom-${Date.now()}`,
      type: 'entry',
      name: 'Custom Component',
      description: '',
      tags: [],
      confidence: 0.5,
      priority: 'medium'
    }
    
    setStrategyData(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }))
  }

  const updateComponent = (componentId: string, updates: Partial<StrategyComponent>) => {
    setStrategyData(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === componentId ? { ...comp, ...updates } : comp
      )
    }))
  }

  const removeComponent = (componentId: string) => {
    setStrategyData(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== componentId)
    }))
  }

  const handleSave = async () => {
    if (!strategyData.name.trim()) {
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
        name: strategyData.name,
        description: strategyData.description,
        strategy: {
          name: strategyData.name,
          rules: strategyData.originalDescription ? [strategyData.originalDescription] : [],
          components: strategyData.components,
          globalTags: strategyData.globalTags,
          complexity: strategyData.complexity,
          riskProfile: strategyData.riskProfile
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!strategy) {
    return null
  }

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-8 pb-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-5xl max-h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Strategy</h2>
            <p className="text-sm text-gray-400 mt-1">
              Modify your strategy components and settings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Strategy Name */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <label className="block text-lg font-medium text-white mb-3">
            Strategy Name
          </label>
          <input
            value={strategyData.name}
            onChange={(e) => setStrategyData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Enter strategy name..."
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 flex-shrink-0">
          <button
            onClick={() => setActiveTab('original')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'original'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            <FileText className="h-4 w-4" />
            Original Rule
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'components'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            <Settings className="h-4 w-4" />
            Components ({strategyData.components.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'original' && (
            <div className="p-6">
              <div className="space-y-6">
                {/* Original Strategy Text */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Original Strategy Rule
                  </h3>
                  <textarea
                    value={strategyData.originalDescription}
                    onChange={(e) => setStrategyData(prev => ({ ...prev, originalDescription: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm font-mono leading-relaxed"
                    rows={15}
                    placeholder="Enter your original strategy description..."
                  />
                </div>

                {/* Global Tags */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Global Strategy Tags
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {strategyData.globalTags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-600/30 flex items-center gap-2">
                        {tag}
                        <button
                          onClick={() => {
                            setStrategyData(prev => ({
                              ...prev,
                              globalTags: prev.globalTags.filter((_, i) => i !== index)
                            }))
                          }}
                          className="hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add new tag..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim()
                          if (value && !strategyData.globalTags.includes(value)) {
                            setStrategyData(prev => ({
                              ...prev,
                              globalTags: [...prev.globalTags, value]
                            }))
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Strategy Components</h3>
                  <button
                    onClick={addCustomComponent}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Component
                  </button>
                </div>
                
                {strategyData.components.map((component) => (
                  <div key={component.id} className="bg-gray-800 rounded-lg border border-gray-700">
                    <div 
                      className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-750 transition-colors"
                      onClick={() => toggleComponentExpansion(component.id)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedComponents.has(component.id) ? 
                          <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        }
                        <div>
                          <p className="text-white font-medium mb-2">{component.name}</p>
                          <div className="flex flex-wrap gap-1">
                            {component.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded border border-blue-600/30">
                                {tag}
                              </span>
                            ))}
                            {component.tags.length === 0 && (
                              <span className="text-xs text-gray-500">No tags</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{component.tags.length} tags</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeComponent(component.id)
                          }}
                          className="p-1 hover:bg-red-600/20 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    {expandedComponents.has(component.id) && (
                      <div className="px-4 pb-4 border-t border-gray-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Component Name</label>
                            <input
                              value={component.name}
                              onChange={(e) => updateComponent(component.id, { name: e.target.value })}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-3"
                            />
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                              value={component.description}
                              onChange={(e) => updateComponent(component.id, { description: e.target.value })}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Component Type</label>
                            <select
                              value={component.type}
                              onChange={(e) => updateComponent(component.id, { type: e.target.value as any })}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-3"
                            >
                              <option value="entry">Entry</option>
                              <option value="exit">Exit</option>
                              <option value="risk_management">Risk Management</option>
                              <option value="position_sizing">Position Sizing</option>
                              <option value="market_condition">Market Condition</option>
                              <option value="level_marking">Level Marking</option>
                              <option value="confirmation">Confirmation</option>
                            </select>
                            
                            <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                            <select
                              value={component.priority}
                              onChange={(e) => updateComponent(component.id, { priority: e.target.value as any })}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-3"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                            
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confidence</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={component.confidence}
                              onChange={(e) => updateComponent(component.id, { confidence: parseFloat(e.target.value) })}
                              className="w-full"
                            />
                            <span className="text-sm text-gray-400">{Math.round(component.confidence * 100)}%</span>
                          </div>
                        </div>
                        
                        {/* Component Tags */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Component Tags</label>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {component.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded flex items-center gap-1">
                                {tag}
                                <button
                                  onClick={() => {
                                    const newTags = component.tags.filter((_, i) => i !== tagIndex)
                                    updateComponent(component.id, { tags: newTags })
                                  }}
                                  className="hover:text-red-300"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Add tag..."
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const value = e.currentTarget.value.trim()
                                if (value && !component.tags.includes(value)) {
                                  updateComponent(component.id, { tags: [...component.tags, value] })
                                  e.currentTarget.value = ''
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-900 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isProcessing ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}