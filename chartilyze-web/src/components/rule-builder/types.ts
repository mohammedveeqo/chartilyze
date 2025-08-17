export interface VisualRule {
  id: string
  name: string
  enabled: boolean
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: 'high' | 'medium' | 'low'
  scenarios: RuleScenario[]
  metadata: {
    createdAt: string
    lastModified: string
    executionCount: number
    successRate: number
  }
}

export interface RuleCondition {
  id: string
  type: 'indicator' | 'price' | 'pattern' | 'time' | 'volume' | 'custom'
  operator: 'equals' | 'greater' | 'less' | 'between' | 'contains' | 'matches'
  value: any
  connector: 'AND' | 'OR'
  group?: string
}

export interface RuleAction {
  id: string
  type: 'entry' | 'exit' | 'alert' | 'position_size' | 'stop_loss' | 'take_profit' | 'custom'
  parameters: Record<string, any>
  delay?: number
  conditions?: string[]
}

export interface RuleScenario {
  id: string
  name: string
  description: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  weight: number
}

export interface StrategyComponent {
  id: string
  type: 'entry' | 'exit' | 'risk_management' | 'position_sizing' | 'market_condition' | 'level_marking' | 'confirmation'
  name: string
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
  timeframes?: string[]
  conditions?: string[]
}