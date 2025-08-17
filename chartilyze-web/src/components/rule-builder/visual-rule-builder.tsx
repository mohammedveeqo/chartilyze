'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { Plus, Trash2, Copy, Play, Save, Settings, Zap, Target, AlertTriangle } from 'lucide-react'
import { ConditionBuilder } from './condition-builder'
import { ActionBuilder } from './action-builder'
import { RuleValidator } from './rule-validator'
import { RuleEditor } from './rule-editor'
import { VisualRule, RuleCondition, RuleAction, RuleScenario, StrategyComponent } from './types'

// Remove duplicate interface definitions here (lines 11-50)
// Jump directly to:

export function VisualRuleBuilder({ strategyComponents, onSave }: {
  strategyComponents: StrategyComponent[]
  onSave: (rules: VisualRule[]) => void
}) {
  const [rules, setRules] = useState<VisualRule[]>([])
  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const [isTestMode, setIsTestMode] = useState(false)

  const createNewRule = useCallback(() => {
    const newRule: VisualRule = {
      id: `rule-${Date.now()}`,
      name: 'New Trading Rule',
      enabled: true,
      conditions: [], // This is line 27
      actions: [],
      priority: 'medium',
      scenarios: [],
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        executionCount: 0,
        successRate: 0
      }
    }
    setRules(prev => [...prev, newRule])
    setSelectedRule(newRule.id)
  }, [])

  const duplicateRule = useCallback((ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId)
    if (rule) {
      const duplicated = {
        ...rule,
        id: `rule-${Date.now()}`,
        name: `${rule.name} (Copy)`,
        metadata: {
          ...rule.metadata,
          createdAt: new Date().toISOString(),
          executionCount: 0,
          successRate: 0
        }
      }
      setRules(prev => [...prev, duplicated])
    }
  }, [rules])

  const deleteRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId))
    if (selectedRule === ruleId) {
      setSelectedRule(null)
    }
  }, [selectedRule])

  const updateRule = useCallback((ruleId: string, updates: Partial<VisualRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, ...updates, metadata: { ...rule.metadata, lastModified: new Date().toISOString() } }
        : rule
    ))
  }, [])

  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return

    const items = Array.from(rules)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setRules(items)
  }, [rules])

  return (
    <div className="h-full flex bg-gray-900">
      {/* Rules Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Trading Rules</h2>
            <button
              onClick={createNewRule}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTestMode(!isTestMode)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                isTestMode ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Play className="h-3 w-3" />
              {isTestMode ? 'Testing' : 'Test Mode'}
            </button>
            <button
              onClick={() => onSave(rules)}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm"
            >
              <Save className="h-3 w-3" />
              Save
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="rules">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2"
              >
                {rules.map((rule, index) => (
                  <Draggable key={rule.id} draggableId={rule.id} index={index}>
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedRule === rule.id
                            ? 'bg-blue-600/20 border-blue-500'
                            : 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                        } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        onClick={() => setSelectedRule(rule.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              rule.enabled ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                            <span className="text-white font-medium text-sm">{rule.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateRule(rule.id)
                              }}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteRule(rule.id)
                              }}
                              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-400 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>{rule.conditions.length} conditions</span>
                            <span>{rule.actions.length} actions</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              rule.priority === 'high' ? 'bg-red-600/20 text-red-300' :
                              rule.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-300' :
                              'bg-green-600/20 text-green-300'
                            }`}>
                              {rule.priority}
                            </span>
                            <span>{rule.metadata.successRate.toFixed(1)}% success</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {selectedRule ? (
          <RuleEditor
            rule={rules.find(r => r.id === selectedRule)!}
            strategyComponents={strategyComponents}
            onUpdate={(updates) => updateRule(selectedRule, updates)}
            isTestMode={isTestMode}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No rule selected</p>
              <p className="text-sm">Create a new rule or select an existing one to start building</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}