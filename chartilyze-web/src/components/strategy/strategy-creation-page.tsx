'use client'

import { useState, useEffect } from 'react'
import { Save, X, Wand2, Plus, Trash2, Edit3, Tag, ChevronDown, ChevronRight } from 'lucide-react'
import { useAction } from 'convex/react'
import { api } from '../../../../chartilyze-backend/convex/_generated/api'

interface StrategyComponent {
  id: string
  type: 'entry' | 'exit' | 'risk_management' | 'position_sizing' | 'market_condition'
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
}

interface StrategyData {
  name: string
  description: string
  components: StrategyComponent[]
  globalTags: string[]
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  timeframes: string[]
  markets: string[]
  complexity: 'simple' | 'intermediate' | 'advanced'
}

export function StrategyCreationPage({ onClose }: { onClose: () => void }) {
  const parseStrategyAction = useAction(api.aiStrategy.parseStrategy)
  
  const [step, setStep] = useState<'input' | 'processing' | 'review' | 'edit'>('input')
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())
  
  const [strategyData, setStrategyData] = useState<StrategyData>({
    name: '',
    description: '',
    components: [],
    globalTags: [],
    riskProfile: 'moderate',
    timeframes: [],
    markets: [],
    complexity: 'intermediate'
  })

  const handleProcessStrategy = async () => {
    if (!strategyData.description.trim()) return
    
    setIsProcessing(true)
    setStep('processing')
    
    try {
      // Enhanced AI parsing for complex strategies
      const result = await parseStrategyAction({ 
        description: strategyData.description,
        complexity: 'advanced' // Flag for detailed parsing
      })
      
      // Convert AI result to detailed components
      const components: StrategyComponent[] = result.components.map((comp: any) => ({
        id: comp.id,
        type: comp.type,
        description: comp.description,
        tags: comp.tags || [],
        indicators: comp.indicators || [],
        patterns: comp.patterns || [],
        confidence: comp.confidence || 0.7,
        priority: comp.priority || 'medium'
      }))
      
      setStrategyData(prev => ({
        ...prev,
        name: prev.name || result.suggestedName,
        components,
        globalTags: result.globalTags,
        complexity: result.complexity
      }))
      
      setStep('review')
    } catch (error) {
      console.error('Failed to process strategy:', error)
    } finally {
      setIsProcessing(false)
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

  const renderInputStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-white mb-3">
          Strategy Name
        </label>
        <input
          type="text"
          value={strategyData.name}
          onChange={(e) => setStrategyData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter a descriptive name for your strategy"
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none text-lg"
        />
      </div>
      
      <div>
        <label className="block text-lg font-medium text-white mb-3">
          Complete Strategy Description
        </label>
        <textarea
          value={strategyData.description}
          onChange={(e) => setStrategyData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={`Describe your complete trading strategy in detail...

Include:
• Entry conditions and signals
• Exit strategies and profit targets
• Stop loss and risk management
• Position sizing rules
• Market conditions and timeframes
• Any specific indicators or patterns
• Risk-reward ratios
• Trade management rules

Example: "I trade the London session breakout strategy on EURUSD 15-minute charts. I enter long when price breaks above the London session high with RSI above 50 and volume 20% above average. My stop loss is 20 pips below the breakout level. I take partial profits at 1:1 and let the rest run to 1:3 risk-reward. I only trade this during high volatility periods and avoid major news events. Position size is 1% of account per trade."`}
          rows={20}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
        />
        <p className="text-sm text-gray-400 mt-2">
          💡 The more detailed your description, the better the AI can break it down into actionable components
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Risk Profile</label>
          <select
            value={strategyData.riskProfile}
            onChange={(e) => setStrategyData(prev => ({ ...prev, riskProfile: e.target.value as any }))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Primary Timeframes</label>
          <input
            type="text"
            value={strategyData.timeframes.join(', ')}
            onChange={(e) => setStrategyData(prev => ({ ...prev, timeframes: e.target.value.split(',').map(s => s.trim()) }))}
            placeholder="1h, 4h, 1d"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Markets/Pairs</label>
          <input
            type="text"
            value={strategyData.markets.join(', ')}
            onChange={(e) => setStrategyData(prev => ({ ...prev, markets: e.target.value.split(',').map(s => s.trim()) }))}
            placeholder="EURUSD, GBPJPY, SPY"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )

  const renderProcessingStep = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-6"></div>
      <h3 className="text-xl font-semibold text-white mb-2">Processing Your Strategy</h3>
      <p className="text-gray-400 text-center max-w-md">
        Our AI is analyzing your strategy description and breaking it down into actionable components with detailed tags for future analysis.
      </p>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Strategy Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-400">Complexity</span>
            <p className="text-white font-medium capitalize">{strategyData.complexity}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Components</span>
            <p className="text-white font-medium">{strategyData.components.length}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Risk Profile</span>
            <p className="text-white font-medium capitalize">{strategyData.riskProfile}</p>
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
                      'bg-blue-600/20 text-blue-300'
                    }`}>
                      {component.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      component.priority === 'high' ? 'bg-red-600/20 text-red-300' :
                      component.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-300' :
                      'bg-gray-600/20 text-gray-300'
                    }`}>
                      {component.priority} priority
                    </span>
                  </div>
                  <p className="text-white font-medium mt-1">{component.description}</p>
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
                        <span key={tagIndex} className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded">
                          {tag}
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
                
                {component.indicators && component.indicators.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Indicators</label>
                    <div className="space-y-2">
                      {component.indicators.map((indicator, indIndex) => (
                        <div key={indIndex} className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">{indicator.name}</span>
                          <span className="text-white">{indicator.condition} {indicator.value}</span>
                          {indicator.timeframe && (
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                              {indicator.timeframe}
                            </span>
                          )}
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
    </div>
  )

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Create Advanced Strategy</h1>
              <p className="text-gray-400 mt-1">
                {step === 'input' && 'Describe your complete trading strategy'}
                {step === 'processing' && 'AI is analyzing your strategy'}
                {step === 'review' && 'Review and refine your strategy components'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              step === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              1. Input Strategy
            </div>
            <div className="w-12 h-px bg-gray-600"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              step === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              2. AI Processing
            </div>
            <div className="w-12 h-px bg-gray-600"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}>
              3. Review & Save
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {step === 'input' && renderInputStep()}
            {step === 'processing' && renderProcessingStep()}
            {step === 'review' && renderReviewStep()}
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-800 border-t border-gray-700 p-6">
          <div className="max-w-6xl mx-auto flex justify-between">
            <div>
              {step === 'review' && (
                <button
                  onClick={() => setStep('input')}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Edit
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              
              {step === 'input' && (
                <button
                  onClick={handleProcessStrategy}
                  disabled={!strategyData.description.trim() || isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Process with AI
                </button>
              )}
              
              {step === 'review' && (
                <button
                  onClick={() => {
                    console.log('Saving advanced strategy:', strategyData)
                    onClose()
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Strategy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}