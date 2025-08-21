import type { Trade } from './trade'

// Flowchart Types (new)
export interface FlowchartNode {
  id: string;
  name: string;
  shape: 'oval' | 'rectangle' | 'diamond';
  icon: string;
  color: string;
  group?: string;
}

export interface FlowchartGroup {
  name: string;
  icon: string;
  color: string;
  nodes: string[];
}

export interface FlowchartRelationship {
  from: string;
  to: string;
  condition: string;
}

// Strategy Component interface for rule builder
export interface StrategyComponent {
  id: string
  type: 'rule' | 'condition' | 'action' | 'indicator_check' | 'pattern_match'
  name: string
  description: string
  tags?: string[]
  
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
  
  actions?: Array<{
    type: 'enter_long' | 'enter_short' | 'exit_position' | 'set_stop_loss' | 'take_profit'
    parameters: Record<string, any>
  }>
  
  nextRules?: string[]
  parentRules?: string[]
  
  confidence: number
  priority: 'high' | 'medium' | 'low'
}

// Enhanced strategy interface with flowchart
export interface Strategy {
  pairs: string[]
  rules: string[]
  structuredRules?: StructuredRule[]
  tags?: string[]
  trades: Trade[]
  color: string
  description?: string
  flowchart?: {
    nodes: FlowchartNode[]
    groups: FlowchartGroup[]
    relationships: FlowchartRelationship[]
  }
}

// Updated form data to include flowchart
export interface StrategyFormData {
  name: string
  pairs: string
  rules: string
  color: string
  description: string
  structuredRules: StructuredRule[]
  tags: string[]
  flowchart?: {
    nodes: FlowchartNode[]
    groups: FlowchartGroup[]
    relationships: FlowchartRelationship[]
  }
}

// Keep your existing types
export type StrategyName = 'Breakout Scalping' | 'Swing Trading' | 'News Trading'
export type StrategiesRecord = Record<StrategyName, Strategy>

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

// New type for strategy data state in modal
export interface StrategyDataState {
  name: string
  originalDescription: string
  description: string
  pairs: string[]
  components: StrategyComponent[]
  flowchart: {
    nodes: FlowchartNode[]
    groups: FlowchartGroup[]
    relationships: FlowchartRelationship[]
  }
  globalTags: string[]
  color: string
}