// src/types/trade.ts

// Trade outcome and status types
export type TradeOutcome = 'win' | 'loss'
export type TradeStatus = 'WIN' | 'LOSS'
export type TradeType = 'LONG' | 'SHORSST'
export type TradeTimeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w'

// Chart related interfaces
export interface ChartAnnotation {
  type: string
  coordinates: {
    x: number
    y: number
  }
  content: string
  style?: {
    color?: string
    size?: number
  }
}

export interface TradeChart {
  imageUrl: string
  annotations: ChartAnnotation[]
}

// Analysis related interfaces
export interface TradeAnalysis {
  technical: string
  psychological: string
  rulesFollowed: string[]
  lessonsLearned: string
  emotionalState: string
  confidenceLevel: number // 1-10
}

// Position and metadata interfaces
export interface TradePosition {
  size: number
  risk: number // in base currency
}

export interface TradeMetadata {
  timeframe: TradeTimeframe
  position: TradePosition
  strategy: string
  tags: string[]
}

// Main Trade interface
export interface Trade {
  id: string
  symbol: string // e.g., 'EURUSD', 'GBPJPY'
  rr: string // Risk-to-reward ratio as string (e.g., '1:2.3')
  outcome: TradeOutcome
  rules: boolean[] // Array of boolean flags for rule adherence
  time: string // Relative time (e.g., '2h ago')
  type: TradeType
  entryPrice: number
  exitPrice: number
  date: string // ISO date string
  pnl: number // Profit/Loss in base currency
  riskRewardRatio: number // Numerical R:R ratio
  adherenceScore: number // 0-1 representing rule adherence
  status: TradeStatus
  chart: TradeChart
  analysis: TradeAnalysis
  metadata: TradeMetadata
}

// Optional interfaces for creating/updating trades
export interface CreateTradeDTO {
  symbol: string
  type: TradeType
  entryPrice: number
  stopLoss: number
  takeProfit: number
  position: {
    size: number
    risk: number
  }
  timeframe: TradeTimeframe
  strategy: string
  rulesFollowed: string[]
  analysis?: {
    technical?: string
    psychological?: string
    emotionalState?: string
    confidenceLevel?: number
  }
}

export interface UpdateTradeDTO {
  exitPrice?: number
  status?: TradeStatus
  pnl?: number
  analysis?: Partial<TradeAnalysis>
  chart?: Partial<TradeChart>
}

// Helper type for trade statistics
export interface TradeStatistics {
  totalTrades: number
  winRate: number
  averageRR: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  adherenceScore: number
  consecutiveWins: number
  consecutiveLosses: number
}

// Trade filter options
export interface TradeFilterOptions {
  timeframe?: TradeTimeframe
  strategy?: string
  outcome?: TradeOutcome
  symbol?: string
  dateRange?: {
    start: string
    end: string
  }
  tags?: string[]
  adherenceScoreRange?: {
    min: number
    max: number
  }
}

// Trade sort options
export type TradeSortField = 
  | 'date'
  | 'pnl'
  | 'riskRewardRatio'
  | 'adherenceScore'
  | 'symbol'

export interface TradeSortOptions {
  field: TradeSortField
  direction: 'asc' | 'desc'
}

// Trade validation
export interface TradeValidationResult {
  isValid: boolean
  errors: {
    field: string
    message: string
  }[]
}

// Trade risk metrics
export interface TradeRiskMetrics {
  riskAmount: number
  potentialReward: number
  riskPercentage: number
  positionSize: number
  stopDistance: number
  targetDistance: number
}

// Trade execution states
export type TradeExecutionStatus = 
  | 'PENDING'
  | 'OPEN'
  | 'CLOSED'
  | 'CANCELLED'
  | 'PARTIALLY_FILLED'

// Trade notifications
export interface TradeNotification {
  id: string
  tradeId: string
  type: 'ENTRY' | 'EXIT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'RULE_VIOLATION'
  message: string
  timestamp: string
  read: boolean
}
