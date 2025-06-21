// src/types/trade.ts
export interface Trade {
  id: string
  symbol: string
  type: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number
  date: string
  pnl: number
  riskRewardRatio: number
  adherenceScore: number
  status: 'WIN' | 'LOSS'
  chart: {
    imageUrl: string
    annotations: any[] // TradingView annotations
  }
  analysis: {
    technical: string
    psychological: string
    rulesFollowed: string[]
    lessonsLearned: string
    emotionalState: string
    confidenceLevel: number
  }
  metadata: {
    timeframe: string
    position: {
      size: number
      risk: number
    }
    strategy: string
    tags: string[]
  }
}
