'use client'

import { useState } from 'react'
import { Plus, Trash2, Target, AlertTriangle, DollarSign, Shield } from 'lucide-react'
import { RuleAction, StrategyComponent } from './types'

const ACTION_TYPES = {
  entry: {
    label: 'Enter Position',
    icon: Target,
    color: 'green',
    parameters: ['direction', 'size', 'orderType', 'price']
  },
  exit: {
    label: 'Exit Position',
    icon: Target,
    color: 'red',
    parameters: ['percentage', 'orderType', 'price']
  },
  alert: {
    label: 'Send Alert',
    icon: AlertTriangle,
    color: 'yellow',
    parameters: ['message', 'channel', 'priority']
  },
  position_size: {
    label: 'Adjust Position Size',
    icon: DollarSign,
    color: 'blue',
    parameters: ['newSize', 'method']
  },
  stop_loss: {
    label: 'Set Stop Loss',
    icon: Shield,
    color: 'red',
    parameters: ['price', 'type', 'trailing']
  },
  take_profit: {
    label: 'Set Take Profit',
    icon: Target,
    color: 'green',
    parameters: ['price', 'type', 'partial']
  },
  custom: {
    label: 'Custom Action',
    icon: Target,
    color: 'purple',
    parameters: ['name', 'value', 'type']
  }
} as const;

// Move the type definition outside the component
type ActionTypeKey = keyof typeof ACTION_TYPES;

export function ActionBuilder({ actions, strategyComponents, onChange }: {
  actions: RuleAction[]
  strategyComponents: StrategyComponent[]
  onChange: (actions: RuleAction[]) => void
}) {
  const addAction = () => {
    const newAction: RuleAction = {
      id: `action-${Date.now()}`,
      type: 'alert',
      parameters: {}
    }
    onChange([...actions, newAction])
  }

  const updateAction = (id: string, updates: Partial<RuleAction>) => {
    onChange(actions.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const removeAction = (id: string) => {
    onChange(actions.filter(a => a.id !== id))
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Execute These Actions</h3>
        <button
          onClick={addAction}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Action
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-4">No actions defined</p>
          <p className="text-sm">Add actions to specify what should happen when conditions are met</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action, index) => {
            // Fix the type safety check
            const actionType = (action.type in ACTION_TYPES) 
              ? ACTION_TYPES[action.type as ActionTypeKey]
              : ACTION_TYPES.custom; // fallback to custom
            const Icon = actionType.icon
            
            return (
              <div key={action.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${actionType.color}-600/20`}>
                      <Icon className={`h-4 w-4 text-${actionType.color}-400`} />
                    </div>
                    <div>
                      <select
                        value={action.type}
                        onChange={(e) => updateAction(action.id, { type: e.target.value as any })}
                        className="bg-transparent text-white font-medium border-none outline-none"
                      >
                        {Object.entries(ACTION_TYPES).map(([key, type]) => (
                          <option key={key} value={key} className="bg-gray-700">{type.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400">Action {index + 1}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAction(action.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Action Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  {actionType.parameters.map(param => (
                    <div key={param}>
                      <label className="block text-xs font-medium text-gray-400 mb-1 capitalize">
                        {param.replace('_', ' ')}
                      </label>
                      <input
                        type="text"
                        value={action.parameters[param] || ''}
                        onChange={(e) => updateAction(action.id, {
                          parameters: { ...action.parameters, [param]: e.target.value }
                        })}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        placeholder={`Enter ${param}...`}
                      />
                    </div>
                  ))}
                </div>

                {/* Delay Option */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={action.delay !== undefined}
                      onChange={(e) => updateAction(action.id, {
                        delay: e.target.checked ? 0 : undefined
                      })}
                      className="rounded"
                    />
                    Add delay before execution
                  </label>
                  {action.delay !== undefined && (
                    <input
                      type="number"
                      value={action.delay}
                      onChange={(e) => updateAction(action.id, { delay: parseInt(e.target.value) })}
                      className="mt-2 w-32 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      placeholder="Seconds"
                      min="0"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}