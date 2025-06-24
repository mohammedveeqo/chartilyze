import type { Trade } from './trade'

export type StrategyName = 'Breakout Scalping' | 'Swing Trading' | 'News Trading'

export interface Strategy {
  pairs: string[]
  rules: string[]
  trades: Trade[]
  color: string
}

export interface StrategyFormData {
  name: string
  pairs: string
  rules: string
  color: string
}

export type StrategiesRecord = Record<StrategyName, Strategy>
