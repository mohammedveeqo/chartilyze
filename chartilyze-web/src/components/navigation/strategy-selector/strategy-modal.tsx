'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Save, X, Wand2, Plus, Trash2, Edit3, Tag, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { useStrategy } from '@/app/hooks/use-strategy'
import { useAction, useMutation } from 'convex/react'
import { api } from '../../../../../chartilyze-backend/convex/_generated/api'
import type { StrategyFormData } from '@/types/strategy'
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

interface StrategyModalProps {
  isCreatingNew: boolean
  onClose: () => void
  isWelcomeFlow?: boolean
}

export function StrategyModal({ isCreatingNew, onClose, isWelcomeFlow = false }: StrategyModalProps) {
  const { editingStrategy, strategies } = useStrategy()
  const parseStrategyAction = useAction(api.aiStrategy.parseStrategy)
  const createJournal = useMutation(api.journals.create)
  
  const [step, setStep] = useState<'input' | 'processing' | 'review' | 'edit'>('input')
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())
  const [showOriginalText, setShowOriginalText] = useState(false)
  
  // Pre-filled strategy for testing
  const testStrategy = `# Identify Storyline (Trend Bias)
If Monthly rejection + Weekly breakout, then Monthly turns bearish ($$B$$)
If Monthly rejection + Weekly breakout, then Monthly turns bullish ($$b$$)
Record bias per timeframe (Monthly, Weekly, Daily) in a log with last update date/time

# Mark Key Levels
OCL - Origin Candle Level (usually the rejection candle + adjacent wick)
STFL - Second Timeframe Level (key level inside OCL; must be fresh)
TTFL - Third Timeframe Level (refinement inside STFL; use support/resistance or 50% equilibrium)

# Entry Construction
Draw box from OCL body to wick, extend one step right
Identify first fresh key level (support, resistance, QM, SBR/SBR) inside box → this is STFL
Go one timeframe lower, mark TTFL at next clear key level or STFL box equilibrium
Place entry on TTFL line
Set SL: 5.5 or 7 pips for USDJPY, 3 pips for gold
Add 0.5-1 pip spread buffer toward SL to guarantee fill

# Risk Management
Normal risk on strong FTFL (previous candle formed it and next candle tapped it)
Reduce risk to ~20% on weak/aged FTFL (price skips FTFL for 1 full period)

# Target Placement
If no obstacle on entry timeframe, let trade run to previous period extreme
If obstacles exist, manage with partial TP or stop adjust

# Confirmation Entries (when FTFL not tapped promptly)
Wait for continuation/reversal pattern on current timeframe before trading
New trade targets previous period extreme on that (current) timeframe

# 14B Entry Model (Continuation/Confirmation)
1h path: 1h reject → 1h S/R → 1h breakout → enter at 1h mid-wick
4h path: 4h reject → 4h S/R → 4h breakout → enter at 1h equilibrium inside 4h S/R

# D1W4 Entry Model (Pullback/Confirmation)
Daily: 1h mitigates Daily key level, 1h breakout
Weekly: 4h mitigates Weekly key level, 4h breakout
Entries: 1h S/R equilibrium, 1h QM equilibrium (smaller size)`
  
  const [strategyData, setStrategyData] = useState({
    name: '',
    originalDescription: testStrategy, // Pre-filled for testing
    description: testStrategy, // Pre-filled for testing
    components: [] as StrategyComponent[],
    globalTags: [] as string[],
    complexity: 'intermediate' as 'simple' | 'intermediate' | 'advanced',
    color: editingStrategy ? strategies[editingStrategy].color : 'blue'
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

  const handleProcessStrategy = async () => {
    if (!strategyData.description.trim()) return
    
    setIsProcessing(true)
    setStep('processing')
    
    try {
      console.log('🚀 Starting enhanced strategy parsing with description:', strategyData.description)
      console.log('📊 Strategy data before parsing:', strategyData)
      
      // Store original description
      setStrategyData(prev => ({
        ...prev,
        originalDescription: prev.description
      }))
      
      console.log('📡 Calling DeepSeek API with params:', {
        description: strategyData.description,
        complexity: 'advanced',
        enhancedParsing: true
      })
      
      // Always use advanced parsing with enhanced prompting
      const result = await parseStrategyAction({ // Changed from parseStrategyMutation to parseStrategyAction
        description: strategyData.description,
        complexity: 'advanced',
        enhancedParsing: true
      })
      
      console.log('✅ Received enhanced result from AI:', result)
      console.log('🔍 Result components count:', result.components?.length || 0)
      console.log('🏷️ Result global tags:', result.globalTags)
      console.log('📝 Result suggested name:', result.suggestedName)
      
      // Convert AI result to enhanced components
      const components: StrategyComponent[] = result.components.map((comp: any) => {
        console.log('🔧 Processing component:', comp)
        return {
          id: comp.id,
          type: comp.type,
          name: comp.name || comp.description.substring(0, 50) + '...',
          description: comp.description,
          tags: comp.tags || [],
          indicators: comp.indicators || [],
          patterns: comp.patterns || [],
          confidence: comp.confidence || 0.7,
          priority: comp.priority || 'medium',
          timeframes: comp.timeframes || [],
          conditions: comp.conditions || []
        }
      })
      
      console.log('🎯 Processed enhanced components:', components)
      
      const newStrategyData = {
        ...strategyData,
        name: result.suggestedName || 'Multi-Timeframe Strategy',
        components,
        globalTags: result.globalTags,
        complexity: result.complexity
      }
      
      console.log('💾 Setting new strategy data:', newStrategyData)
      
      setStrategyData(newStrategyData)
      setStep('review')
      setIsProcessing(false)
      
      console.log('✨ Strategy parsing completed successfully')
    } catch (error) {
      console.error('❌ Failed to process strategy:', error)
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error
      })
      alert(`Strategy parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsProcessing(false)
      setStep('input')
    }
  }

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

    try {
      setIsProcessing(true)
      
      // Create journal with enhanced strategy data
      const journalData = {
        name: strategyData.name,
        description: strategyData.description || `AI-enhanced trading strategy: ${strategyData.name}`,
        strategy: {
          name: strategyData.name,
          rules: strategyData.originalDescription ? [strategyData.originalDescription] : [],
          // Include AI-enhanced data
          components: strategyData.components,
          globalTags: strategyData.globalTags,
          complexity: strategyData.complexity,
     
        },
        settings: {
          defaultRiskPercentage: 1,
          defaultPositionSize: 100
        }
      }

      await createJournal(journalData)
      
      if (isWelcomeFlow) {
        toast.success('Welcome! Your first strategy has been created successfully!')
        // Refresh the page to show the dashboard with data
        window.location.reload()
      } else {
        toast.success('Strategy saved successfully!')
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving strategy:', error)
      toast.error('Failed to save strategy')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const renderInputStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-white mb-3">
          Strategy Description
        </label>
        <textarea
          value={strategyData.description}
          onChange={(e) => setStrategyData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your complete trading strategy in detail..."
          rows={20}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
        />
        <p className="text-sm text-gray-400 mt-2">
          💡 Use markdown-style headers (# ## ###) to organize complex strategies. The AI will parse these into separate components.
        </p>
      </div>
      
      <button 
        onClick={handleProcessStrategy}
        disabled={!strategyData.description.trim() || isProcessing}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing with Enhanced AI...
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

  const renderProcessingStep = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6"></div>
      <h3 className="text-xl font-semibold text-white mb-2">Processing Your Strategy</h3>
      <p className="text-gray-400 text-center max-w-md">
        Our AI is analyzing your strategy description and breaking it down into actionable components with detailed tags.
      </p>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Strategy Name Input */}
      <div>
        <label className="block text-lg font-medium text-white mb-3">
          Strategy Name
        </label>
        <input
          type="text"
          value={strategyData.name}
          onChange={(e) => setStrategyData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter strategy name"
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Original Strategy Text Toggle */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <button
          onClick={() => setShowOriginalText(!showOriginalText)}
          className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
        >
          <FileText className="h-4 w-4" />
          {showOriginalText ? 'Hide' : 'Show'} Original Strategy Text
        </button>
        {showOriginalText && (
          <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-600">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {strategyData.originalDescription}
            </pre>
            <button
              onClick={() => {
                setStrategyData(prev => ({ ...prev, description: prev.originalDescription }))
                setStep('input')
              }}
              className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors"
            >
              Edit Original Text
            </button>
          </div>
        )}
      </div>

      {/* Strategy Overview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Strategy Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-400">Complexity</span>
            <p className="text-white font-medium capitalize">{strategyData.complexity}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Components</span>
            <p className="text-white font-medium">{strategyData.components.length}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Total Tags</span>
            <p className="text-white font-medium">
              {strategyData.components.reduce((acc, comp) => acc + comp.tags.length, 0) + strategyData.globalTags.length}
            </p>
          </div>
        </div>
      </div>

      {/* Global Tags */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Global Strategy Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {strategyData.globalTags.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-full border border-blue-600/30">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Strategy Components */}
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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      component.type === 'entry' ? 'bg-green-600/20 text-green-300' :
                      component.type === 'exit' ? 'bg-red-600/20 text-red-300' :
                      component.type === 'risk_management' ? 'bg-orange-600/20 text-orange-300' :
                      component.type === 'position_sizing' ? 'bg-purple-600/20 text-purple-300' :
                      component.type === 'level_marking' ? 'bg-yellow-600/20 text-yellow-300' :
                      component.type === 'confirmation' ? 'bg-cyan-600/20 text-cyan-300' :
                      'bg-blue-600/20 text-blue-300'
                    }`}>
                      {component.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      component.priority === 'high' ? 'bg-red-600/20 text-red-300' :
                      component.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-300' :
                      'bg-gray-600/20 text-gray-300'
                    }`}>
                      {component.priority} priority
                    </span>
                  </div>
                  <p className="text-white font-medium mt-1">{component.name}</p>
                  <p className="text-sm text-gray-400">Confidence: {Math.round(component.confidence * 100)}%</p>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Component Tags</label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {component.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded flex items-center gap-1">
                          {tag}
                          <button
                            onClick={() => {
                              const newTags = component.tags.filter((_, i) => i !== tagIndex)
                              updateComponent(component.id, { tags: newTags })
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add tags (comma separated)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const newTags = (e.target as HTMLInputElement).value.split(',').map(t => t.trim()).filter(Boolean)
                          updateComponent(component.id, { tags: [...component.tags, ...newTags] })
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
                
                {component.conditions && component.conditions.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Conditions</label>
                    <div className="space-y-1">
                      {component.conditions.map((condition, condIndex) => (
                        <div key={condIndex} className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
                          {condition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Color Theme</label>
        <div className="flex gap-2">
          {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
            <button
              key={color}
              onClick={() => setStrategyData(prev => ({ ...prev, color }))}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                strategyData.color === color 
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
    </div>
  )

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999] p-4 pt-8 pb-8 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-5xl min-h-[80vh] max-h-none flex flex-col my-auto">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {isCreatingNew ? 'Create New Strategy' : `Edit ${editingStrategy}`}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {step === 'input' && 'Describe your strategy in detail for AI analysis'}
                {step === 'processing' && 'AI is analyzing your strategy'}
                {step === 'review' && 'Review and customize your strategy components'}
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
              step === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              1. Input
            </div>
            <div className="w-8 h-px bg-gray-600"></div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              step === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              2. Processing
            </div>
            <div className="w-8 h-px bg-gray-600"></div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              3. Review
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' && renderInputStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'review' && renderReviewStep()}
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-700 flex gap-3">
          {step === 'review' && (
            <button 
              onClick={() => setStep('input')}
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
