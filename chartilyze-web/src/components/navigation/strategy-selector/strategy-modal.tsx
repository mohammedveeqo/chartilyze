'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  Save, 
  X, 
  Wand2, 
  Plus, 
  Trash2, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Tag 
} from 'lucide-react'
import { useStrategies } from '@/app/hooks/use-strategy'
import { useAction, useMutation } from 'convex/react'
import { api } from '../../../../../chartilyze-backend/convex/_generated/api'
import { toast } from 'sonner'
import type { 
  StrategyDataState, 
  FlowchartNode, 
  FlowchartGroup, 
  FlowchartRelationship 
} from '@/types/strategy'

interface StrategyModalProps {
  isCreatingNew: boolean
  onClose: () => void
  isWelcomeFlow?: boolean
}

// Test strategy template
const TEST_STRATEGY = `# Identify Storyline (Trend Bias)
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

export function StrategyModal({ isCreatingNew, onClose, isWelcomeFlow = false }: StrategyModalProps) {
  // API Actions
  const parseStrategyAction = useAction(api.aiStrategy.parseStrategy)
  const createJournal = useMutation(api.journals.create)
  
  // Modal State
  const [step, setStep] = useState<'input' | 'processing' | 'review'>('input')
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showOriginalText, setShowOriginalText] = useState(false)
  
  // Strategy Data State
  const [strategyData, setStrategyData] = useState<StrategyDataState>({
    name: '',
    originalDescription: TEST_STRATEGY, // Use the test strategy as default
    description: TEST_STRATEGY, // Use the test strategy as default
    pairs: [],
    components: [],
    flowchart: {
      nodes: [],
      groups: [],
      relationships: []
    },
    globalTags: [],
    color: 'blue'
  })

 

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])
    // Utility Functions
  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  // Strategy Processing Handler
const handleProcessStrategy = async () => {
  if (!strategyData.description.trim() || isProcessing) return
  
  try {
    setIsProcessing(true)
    setStep('processing')

    const result = await parseStrategyAction({
      description: strategyData.description
    })

    setStrategyData(prev => ({
      ...prev,
      name: result.title || prev.name,
      flowchart: {
        nodes: result.nodes || [],
        groups: result.groups || [],
        relationships: result.relationships || []
      },
      globalTags: result.globalTags || []
    }))

    setStep('review')
  } catch (error) {
    console.error('Strategy parsing failed:', error)
    toast.error('Failed to parse strategy')
  } finally {
    setIsProcessing(false)
  }
}

  // Node Management
  const addNode = (groupId: string) => {
    const newNode: FlowchartNode = {
      id: `node-${Date.now()}`,
      name: 'New Node',
      shape: 'rectangle',
      icon: 'circle',
      color: 'gray',
      group: groupId
    }

    setStrategyData(prev => ({
      ...prev,
      flowchart: {
        ...prev.flowchart,
        nodes: [...prev.flowchart.nodes, newNode],
        groups: prev.flowchart.groups.map(g => 
          g.name === groupId 
            ? { ...g, nodes: [...g.nodes, newNode.id] }
            : g
        )
      }
    }))
  }

  const updateNode = (nodeId: string, updates: Partial<FlowchartNode>) => {
    setStrategyData(prev => ({
      ...prev,
      flowchart: {
        ...prev.flowchart,
        nodes: prev.flowchart.nodes.map(node => 
          node.id === nodeId ? { ...node, ...updates } : node
        )
      }
    }))
  }

  const removeNode = (nodeId: string, groupId: string) => {
    setStrategyData(prev => ({
      ...prev,
      flowchart: {
        ...prev.flowchart,
        nodes: prev.flowchart.nodes.filter(node => node.id !== nodeId),
        relationships: prev.flowchart.relationships.filter(
          rel => rel.from !== nodeId && rel.to !== nodeId
        ),
        groups: prev.flowchart.groups.map(g => 
          g.name === groupId 
            ? { ...g, nodes: g.nodes.filter(id => id !== nodeId) }
            : g
        )
      }
    }))
  }

  // Save Handler
  const handleSave = async () => {
    if (!strategyData.name.trim()) {
      toast.error('Please enter a strategy name')
      return
    }

    try {
      setIsProcessing(true)
      
      const journalData = {
        name: strategyData.name,
        description: strategyData.description,
        strategy: {
          name: strategyData.name,
          rules: [strategyData.originalDescription],
          flowchart: strategyData.flowchart,
          globalTags: strategyData.globalTags
        },
        settings: {
          defaultRiskPercentage: 1,
          defaultPositionSize: 100
        }
      }

      await createJournal(journalData)
      
      if (isWelcomeFlow) {
        toast.success('Welcome! Your first strategy has been created successfully!')
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
    // Render Input Step
  const renderInputStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-white mb-3">
          Strategy Description
        </label>
        <textarea
          value={strategyData.description}
          onChange={(e) => setStrategyData(prev => ({ 
            ...prev, 
            description: e.target.value 
          }))}
          placeholder="Describe your complete trading strategy in detail..."
          rows={20}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 
                     text-white placeholder-gray-400 focus:border-blue-500 
                     focus:outline-none resize-none font-mono text-sm"
        />
        <p className="text-sm text-gray-400 mt-2">
          💡 Use markdown-style headers (# ## ###) to organize your strategy. 
          The AI will convert these into flowchart groups and nodes.
        </p>
      </div>
      
      <button 
        onClick={handleProcessStrategy}
        disabled={!strategyData.description.trim() || isProcessing}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg 
                   hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed 
                   transition-colors font-medium flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Processing Strategy...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            Generate Flowchart
          </>
        )}
      </button>
    </div>
  )

  // Render Processing Step
  const renderProcessingStep = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6" />
      <h3 className="text-xl font-semibold text-white mb-2">
        Processing Your Strategy
      </h3>
      <p className="text-gray-400 text-center max-w-md">
        Our AI is analyzing your strategy and creating a flowchart structure...
      </p>
    </div>
  )

  // Render Review Step
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
          onChange={(e) => setStrategyData(prev => ({ 
            ...prev, 
            name: e.target.value 
          }))}
          placeholder="Enter strategy name"
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 
                     text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Original Text Toggle */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <button
          onClick={() => setShowOriginalText(!showOriginalText)}
          className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
        >
          <FileText className="h-4 w-4" />
          {showOriginalText ? 'Hide' : 'Show'} Original Text
        </button>
        {showOriginalText && (
          <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-600">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {strategyData.originalDescription}
            </pre>
            <button
              onClick={() => {
                setStrategyData(prev => ({ 
                  ...prev, 
                  description: prev.originalDescription 
                }))
                setStep('input')
              }}
              className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded 
                        hover:bg-blue-500 transition-colors"
            >
              Edit Original Text
            </button>
          </div>
        )}
      </div>

      {/* Flowchart Groups */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Strategy Flowchart</h3>
        {strategyData.flowchart.groups.map((group) => (
          <div key={group.name} className="bg-gray-800 rounded-lg border border-gray-700">
            {/* Group Header */}
            <div 
              className="p-4 cursor-pointer flex items-center justify-between 
                         hover:bg-gray-750 transition-colors"
              onClick={() => toggleGroupExpansion(group.name)}
            >
              <div className="flex items-center gap-3">
                {expandedGroups.has(group.name) ? 
                  <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                }
                <div>
                  <h4 className="text-white font-medium">{group.name}</h4>
                  <p className="text-sm text-gray-400">
                    {group.nodes.length} nodes
                  </p>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  addNode(group.name)
                }}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Group Nodes */}
            {expandedGroups.has(group.name) && (
              <div className="px-4 pb-4 border-t border-gray-700">
                {strategyData.flowchart.nodes
                  .filter(node => node.group === group.name)
                  .map(node => (
                    <div key={node.id} 
                         className="mt-4 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                      <div>
                        <input
                          value={node.name}
                          onChange={(e) => updateNode(node.id, { name: e.target.value })}
                          className="bg-transparent text-white text-sm font-medium focus:outline-none"
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full 
                                         bg-${node.color}-600/20 text-${node.color}-300`}>
                            {node.shape}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeNode(node.id, group.name)}
                        className="p-1 hover:bg-red-600/20 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global Tags */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Global Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {strategyData.globalTags.map((tag, index) => (
            <span key={index} 
                  className="px-3 py-1 bg-blue-600/20 text-blue-300 text-sm 
                            rounded-full border border-blue-600/30">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
    // Modal Content Structure
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
                {isCreatingNew ? 'Create New Strategy' : 'Edit Strategy'}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {step === 'input' && 'Describe your strategy to generate a flowchart'}
                {step === 'processing' && 'Analyzing your strategy'}
                {step === 'review' && 'Review and customize your strategy flowchart'}
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
            <div className="w-8 h-px bg-gray-600" />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              step === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              2. Processing
            </div>
            <div className="w-8 h-px bg-gray-600" />
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
              className="py-3 px-4 bg-gray-700 text-white rounded-lg 
                       hover:bg-gray-600 transition-colors font-medium"
            >
              Back to Edit
            </button>
          )}
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg 
                     hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          {step === 'review' && (
            <button 
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-500 transition-colors font-medium 
                       flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isCreatingNew ? 'Create Strategy' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // Final Render with Portal
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
}

// Utility function for node type styling
const getNodeTypeStyle = (shape: 'oval' | 'rectangle' | 'diamond') => {
  switch (shape) {
    case 'oval':
      return 'bg-green-600/20 text-green-300'
    case 'diamond':
      return 'bg-blue-600/20 text-blue-300'
    case 'rectangle':
    default:
      return 'bg-purple-600/20 text-purple-300'
  }
}