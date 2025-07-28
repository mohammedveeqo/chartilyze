import type { Trade } from './trade'

export type StrategyName = 'Breakout Scalping' | 'Swing Trading' | 'News Trading'

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
