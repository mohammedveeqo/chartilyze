'use client'

import { useState } from 'react'
import { Settings, Zap, AlertTriangle, TestTube, Target } from 'lucide-react'
import { ConditionBuilder } from './condition-builder'
import { ActionBuilder } from './action-builder'
import { ScenarioManager } from './scenario-manager'
import { RuleValidator } from './rule-validator'
import { VisualRule, StrategyComponent } from './types'

interface RuleEditorProps {
  rule: VisualRule
  strategyComponents: StrategyComponent[]
  onUpdate: (updates: Partial<VisualRule>) => void
  isTestMode: boolean
}

export function RuleEditor({ rule, strategyComponents, onUpdate, isTestMode }: RuleEditorProps) {
  const [activeTab, setActiveTab] = useState<'conditions' | 'actions' | 'scenarios' | 'settings'>('conditions')
  const [testResults, setTestResults] = useState<any>(null)

  const tabs = [
    { id: 'conditions', label: 'If This Happens', icon: Zap },
    { id: 'actions', label: 'Then Do This', icon: Target },
    { id: 'scenarios', label: 'Scenarios', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={rule.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="text-xl font-semibold bg-transparent text-white border-none outline-none"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(e) => onUpdate({ enabled: e.target.checked })}
                className="rounded"
              />
              Enabled
            </label>
            {isTestMode && (
              <button
                onClick={() => {/* Test rule logic */}}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm"
              >
                <TestTube className="h-3 w-3" />
                Test Rule
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'conditions' && (
          <ConditionBuilder
            conditions={rule.conditions}
            strategyComponents={strategyComponents}
            onChange={(conditions) => onUpdate({ conditions })}
          />
        )}
        
        {activeTab === 'actions' && (
          <ActionBuilder
            actions={rule.actions}
            strategyComponents={strategyComponents}
            onChange={(actions) => onUpdate({ actions })}
          />
        )}
        
        {activeTab === 'scenarios' && (
          <ScenarioManager
            scenarios={rule.scenarios}
            onChange={(scenarios) => onUpdate({ scenarios })}
          />
        )}
        
        {activeTab === 'settings' && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={rule.priority}
                onChange={(e) => onUpdate({ priority: e.target.value as any })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            <RuleValidator rule={rule} />
          </div>
        )}
      </div>
    </div>
  )
}