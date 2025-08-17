import type { Trade } from './trade'

export type StrategyName = 'Breakout Scalping' | 'Swing Trading' | 'News Trading'

// Strategy Component interface for rule builder
export interface StrategyComponent {
  id: string
  type: 'rule' | 'condition' | 'action' | 'indicator_check' | 'pattern_match'
  name: string
  description: string
  
  // Rule logic
  ruleType: 'entry_condition' | 'exit_condition' | 'risk_check' | 'confirmation'
  logic: {
    operator: 'AND' | 'OR' | 'NOT'
    conditions: Array<{
      indicator?: string
      pattern?: string
      comparison: '>' | '<' | '=' | '>=' | '<=' | 'crosses_above' | 'crosses_below'
      value: number | string
      timeframe?: string
    }>
  }
  
  // Actions when rule is triggered
  actions?: Array<{
    type: 'enter_long' | 'enter_short' | 'exit_position' | 'set_stop_loss' | 'take_profit'
    parameters: Record<string, any>
  }>
  
  // Flow connections
  nextRules?: string[] // IDs of rules to evaluate next
  parentRules?: string[] // Rules that must be true before this one
  
  confidence: number
  priority: 'high' | 'medium' | 'low'
}

// New structured rule interface
export interface StructuredRule {
  id: string
  pattern?: string
  indicator?: {
    type: string
    condition: string
    value: number | string
  }
  context?: string
  direction?: 'long' | 'short'
  timeframe?: string
  confidence?: number
}

// Enhanced strategy interface
export interface Strategy {
  pairs: string[]
  rules: string[] // Keep for backward compatibility
  structuredRules?: StructuredRule[] // New structured rules
  tags?: string[] // Auto-generated tags
  trades: Trade[]
  color: string
  description?: string // Free-form description
}

// Updated form data for new flow
export interface StrategyFormData {
  name: string
  pairs: string
  rules: string
  color: string
  description: string // Natural language description
  structuredRules: StructuredRule[]
  tags: string[]
}

export type StrategiesRecord = Record<StrategyName, Strategy>
