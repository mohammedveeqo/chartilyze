import { create } from 'zustand'
import type { StrategiesRecord, StrategyName, Strategy } from '@/types/strategy'
import type { Trade } from '@/types/trade'

interface StrategyStore {
  currentStrategy: StrategyName
  editingStrategy: StrategyName | null
  strategies: StrategiesRecord
  setCurrentStrategy: (strategy: StrategyName) => void
  setEditingStrategy: (strategy: StrategyName | null) => void
  updateStrategy: (name: StrategyName, data: Strategy) => void
}

const initialStrategies: StrategiesRecord = {
  'Breakout Scalping': {
    pairs: ['EURUSD', 'GBPJPY', 'AUDUSD', 'USDJPY'],
    rules: ['Trend confirmation', 'Volume spike present', 'Risk management sized'],
    color: 'blue',
    trades: [
      {
        id: '1',
        symbol: 'EURUSD',
        rr: '1:2.3',
        outcome: 'win',
        rules: [true, true, false],
        time: '2h ago',
        type: 'LONG',
        entryPrice: 1.0850,
        exitPrice: 1.0895,
        date: '2023-06-24T10:30:00Z',
        pnl: 127,
        riskRewardRatio: 2.3,
        adherenceScore: 0.67,
        status: 'WIN',
        chart: {
          imageUrl: 'https://example.com/chart1.png',
          annotations: []
        },
        analysis: {
          technical: 'Strong uptrend on higher timeframe',
          psychological: 'Confident in setup',
          rulesFollowed: ['Trend confirmation', 'Volume spike present'],
          lessonsLearned: 'Stick to risk management next time',
          emotionalState: 'Calm',
          confidenceLevel: 8
        },
        metadata: {
          timeframe: '15m',
          position: {
            size: 1,
            risk: 50
          },
          strategy: 'Breakout Scalping',
          tags: ['NFP', 'High Impact News']
        }
      },
      // Add more trades with similar structure...
    ]
  },
  'Swing Trading': {
    pairs: ['XAUUSD', 'GBPUSD', 'EURJPY', 'USDCAD'],
    rules: ['Daily trend alignment', 'Support/Resistance level', 'RSI confirmation'],
    color: 'green',
    trades: [
      // Add trades with the new structure...
    ]
  },
  'News Trading': {
    pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF'],
    rules: ['High impact news', 'Pre-news setup', 'Quick exit plan'],
    color: 'purple',
    trades: [
      // Add trades with the new structure...
    ]
  }
}

export const useStrategy = create<StrategyStore>((set) => ({
  currentStrategy: 'Breakout Scalping',
  editingStrategy: null,
  strategies: initialStrategies,
  setCurrentStrategy: (strategy) => set({ currentStrategy: strategy }),
  setEditingStrategy: (strategy) => set({ editingStrategy: strategy }),
  updateStrategy: (name, data) => set((state) => ({
    strategies: {
      ...state.strategies,
      [name]: data
    }
  }))
}))

export const useCurrentStrategyData = () => {
  const { currentStrategy, strategies } = useStrategy()
  return strategies[currentStrategy]
}
