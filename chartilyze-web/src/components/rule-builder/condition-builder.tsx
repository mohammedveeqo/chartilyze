'use client'

import { useState } from 'react'
import { Plus, Trash2, Move, Link } from 'lucide-react'
import { RuleCondition, StrategyComponent } from './types'

const CONDITION_TYPES = {
  indicator: {
    label: 'Technical Indicator',
    options: ['RSI', 'MACD', 'Moving Average', 'Bollinger Bands', 'Stochastic', 'Custom']
  },
  price: {
    label: 'Price Action',
    options: ['Price Above', 'Price Below', 'Price Between', 'Breakout', 'Breakdown', 'Support/Resistance']
  },
  pattern: {
    label: 'Chart Pattern',
    options: ['Head & Shoulders', 'Triangle', 'Flag', 'Pennant', 'Double Top/Bottom', 'Custom Pattern']
  },
  time: {
    label: 'Time Condition',
    options: ['Market Open', 'Market Close', 'Specific Time', 'Time Range', 'Day of Week']
  },
  volume: {
    label: 'Volume',
    options: ['Volume Above Average', 'Volume Spike', 'Volume Dry Up', 'Volume Profile']
  },
  custom: {
    label: 'Custom Condition',
    options: ['Custom Script', 'External Signal', 'Manual Trigger', 'API Call']
  }
} as const;

const OPERATORS = {
  equals: '=',
  greater: '>',
  less: '<',
  between: 'between',
  contains: 'contains',
  matches: 'matches'
}

export function ConditionBuilder({ conditions, strategyComponents, onChange }: {
  conditions: RuleCondition[]
  strategyComponents: StrategyComponent[]
  onChange: (conditions: RuleCondition[]) => void
}) {
  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: `condition-${Date.now()}`,
      type: 'indicator',
      operator: 'greater',
      value: '',
      connector: 'AND'
    }
    onChange([...conditions, newCondition])
  }

  const updateCondition = (id: string, updates: Partial<RuleCondition>) => {
    onChange(conditions.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const removeCondition = (id: string) => {
    onChange(conditions.filter(c => c.id !== id))
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">When These Conditions Are Met</h3>
        <button
          onClick={addCondition}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Condition
        </button>
      </div>

      {conditions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-4">No conditions set</p>
          <p className="text-sm">Add conditions to define when this rule should trigger</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <div key={condition.id} className="bg-gray-800 rounded-lg border border-gray-700">
              {index > 0 && (
                <div className="flex items-center justify-center py-2">
                  <select
                    value={condition.connector}
                    onChange={(e) => updateCondition(condition.id, { connector: e.target.value as 'AND' | 'OR' })}
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </div>
              )}
              
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  {/* Condition Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                    <select
                      value={condition.type}
                      onChange={(e) => updateCondition(condition.id, { type: e.target.value as any })}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      {Object.entries(CONDITION_TYPES).map(([key, type]) => (
                        <option key={key} value={key}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Specific Condition */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Condition</label>
                    <select
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      {CONDITION_TYPES[condition.type]?.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Operator */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Operator</label>
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(condition.id, { operator: e.target.value as any })}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      {Object.entries(OPERATORS).map(([key, symbol]) => (
                        <option key={key} value={key}>{symbol}</option>
                      ))}
                    </select>
                  </div>

                  {/* Value */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Value</label>
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        placeholder="Enter value..."
                      />
                    </div>
                    <button
                      onClick={() => removeCondition(condition.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Add this type definition after the CONDITION_TYPES object
type ConditionTypeKey = keyof typeof CONDITION_TYPES;

// In the component where you access CONDITION_TYPES, add a type guard
const getConditionType = (type: string) => {
  return (type in CONDITION_TYPES) 
    ? CONDITION_TYPES[type as ConditionTypeKey]
    : CONDITION_TYPES.custom; // fallback to custom
};