'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { RuleScenario } from './types'

type ScenarioTemplateKey = keyof typeof SCENARIO_TEMPLATES;

const SCENARIO_TEMPLATES = {
  bullish: {
    name: 'Bullish Market',
    description: 'Actions for uptrending market conditions',
    icon: TrendingUp,
    color: 'green'
  },
  bearish: {
    name: 'Bearish Market',
    description: 'Actions for downtrending market conditions',
    icon: TrendingDown,
    color: 'red'
  },
  sideways: {
    name: 'Sideways Market',
    description: 'Actions for ranging market conditions',
    icon: AlertTriangle,
    color: 'yellow'
  },
  high_volatility: {
    name: 'High Volatility',
    description: 'Actions during volatile market periods',
    icon: AlertTriangle,
    color: 'orange'
  }
} as const;

export function ScenarioManager({ scenarios, onChange }: {
  scenarios: RuleScenario[]
  onChange: (scenarios: RuleScenario[]) => void
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const addScenario = (template?: string) => {
    const templateData = template && template in SCENARIO_TEMPLATES 
      ? SCENARIO_TEMPLATES[template as ScenarioTemplateKey] 
      : null
    const newScenario: RuleScenario = {
      id: `scenario-${Date.now()}`,
      name: templateData?.name || 'New Scenario',
      description: templateData?.description || '',
      conditions: [],
      actions: [],
      weight: 1
    }
    onChange([...scenarios, newScenario])
  }

  const updateScenario = (id: string, updates: Partial<RuleScenario>) => {
    onChange(scenarios.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const removeScenario = (id: string) => {
    onChange(scenarios.filter(s => s.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Market Scenarios</h3>
          <p className="text-sm text-gray-400">Define different behaviors for various market conditions</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="">Custom Scenario</option>
            {Object.entries(SCENARIO_TEMPLATES).map(([key, template]) => (
              <option key={key} value={key}>{template.name}</option>
            ))}
          </select>
          <button
            onClick={() => addScenario(selectedTemplate || undefined)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Scenario
          </button>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">No scenarios defined</p>
          <p className="text-sm">Add scenarios to handle different market conditions</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scenarios.map((scenario) => {
            const template = Object.values(SCENARIO_TEMPLATES).find(t => t.name === scenario.name)
            const Icon = template?.icon || AlertTriangle
            
            return (
              <div key={scenario.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${template?.color || 'gray'}-600/20`}>
                      <Icon className={`h-4 w-4 text-${template?.color || 'gray'}-400`} />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={scenario.name}
                        onChange={(e) => updateScenario(scenario.id, { name: e.target.value })}
                        className="bg-transparent text-white font-medium border-none outline-none"
                      />
                      <p className="text-xs text-gray-400">{scenario.conditions.length} conditions, {scenario.actions.length} actions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={scenario.weight}
                      onChange={(e) => updateScenario(scenario.id, { weight: parseFloat(e.target.value) })}
                      className="w-20"
                    />
                    <span className="text-xs text-gray-400 w-8">{scenario.weight.toFixed(1)}x</span>
                    <button
                      onClick={() => removeScenario(scenario.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={scenario.description}
                  onChange={(e) => updateScenario(scenario.id, { description: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
                  rows={2}
                  placeholder="Describe this scenario..."
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}