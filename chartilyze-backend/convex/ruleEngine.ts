import { action } from "./_generated/server";
import { v } from "convex/values";

// Add the missing type definitions
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

interface MarketData {
  symbol: string
  price: number
  volume: number
  timestamp: number
  indicators: Record<string, number>
}

interface RuleExecutionResult {
  ruleId: string
  triggered: boolean
  actions: Array<{
    type: string
    parameters: Record<string, any>
    executed: boolean
    result?: any
    error?: string
  }>
  timestamp: number
}

export const executeRules = action({
  args: {
    rules: v.array(v.any()),
    marketData: v.object({
      symbol: v.string(),
      price: v.number(),
      volume: v.number(),
      timestamp: v.number(),
      indicators: v.any()
    })
  },
  handler: async (ctx, { rules, marketData }): Promise<RuleExecutionResult[]> => {
    const results: RuleExecutionResult[] = []
    
    for (const rule of rules) {
      if (!rule.enabled) continue
      
      const conditionsMet = await evaluateConditions(rule.conditions, marketData)
      
      if (conditionsMet) {
        const actionResults = await executeActions(rule.actions, marketData)
        
        results.push({
          ruleId: rule.id,
          triggered: true,
          actions: actionResults,
          timestamp: Date.now()
        })
      }
    }
    
    return results
  }
})

async function evaluateConditions(conditions: RuleCondition[], marketData: MarketData): Promise<boolean> {
  if (conditions.length === 0) return false
  
  let result = true
  let currentConnector = 'AND'
  
  for (const condition of conditions) {
    const conditionResult = evaluateCondition(condition, marketData)
    
    if (currentConnector === 'AND') {
      result = result && conditionResult
    } else {
      result = result || conditionResult
    }
    
    currentConnector = condition.connector
  }
  
  return result
}

function evaluateCondition(condition: RuleCondition, marketData: MarketData): boolean {
  const { type, operator, value } = condition
  
  switch (type) {
    case 'price':
      return evaluatePriceCondition(operator, value, marketData.price)
    case 'volume':
      return evaluateVolumeCondition(operator, value, marketData.volume)
    case 'indicator':
      return evaluateIndicatorCondition(condition, marketData.indicators)
    default:
      return false
  }
}

function evaluatePriceCondition(operator: string, value: any, currentPrice: number): boolean {
  const targetPrice = parseFloat(value)
  
  switch (operator) {
    case 'greater': return currentPrice > targetPrice
    case 'less': return currentPrice < targetPrice
    case 'equals': return Math.abs(currentPrice - targetPrice) < 0.01
    default: return false
  }
}

function evaluateVolumeCondition(operator: string, value: any, currentVolume: number): boolean {
  const targetVolume = parseFloat(value)
  
  switch (operator) {
    case 'greater': return currentVolume > targetVolume
    case 'less': return currentVolume < targetVolume
    default: return false
  }
}

function evaluateIndicatorCondition(condition: RuleCondition, indicators: Record<string, number>): boolean {
  // Implementation for indicator-based conditions
  return true // Placeholder
}

async function executeActions(actions: RuleAction[], marketData: MarketData): Promise<any[]> {
  const results = []
  
  for (const action of actions) {
    try {
      const result = await executeAction(action, marketData)
      results.push({
        type: action.type,
        parameters: action.parameters,
        executed: true,
        result
      })
    } catch (error: unknown) {
      results.push({
        type: action.type,
        parameters: action.parameters,
        executed: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
  
  return results
}

async function executeAction(action: RuleAction, marketData: MarketData): Promise<any> {
  switch (action.type) {
    case 'alert':
      return await sendAlert(action.parameters)
    case 'entry':
      return await enterPosition(action.parameters, marketData)
    case 'exit':
      return await exitPosition(action.parameters)
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

async function sendAlert(parameters: Record<string, any>): Promise<any> {
  // Implementation for sending alerts
  console.log('Alert sent:', parameters.message)
  return { sent: true }
}

async function enterPosition(parameters: Record<string, any>, marketData: MarketData): Promise<any> {
  // Implementation for entering positions
  console.log('Position entered:', parameters)
  return { positionId: `pos-${Date.now()}` }
}

async function exitPosition(parameters: Record<string, any>): Promise<any> {
  // Implementation for exiting positions
  console.log('Position exited:', parameters)
  return { closed: true }
}