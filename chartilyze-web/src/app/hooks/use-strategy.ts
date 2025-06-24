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
      {
        id: '2',
        symbol: 'GBPJPY',
        rr: '1:1.8',
        outcome: 'loss',
        rules: [true, true, true],
        time: '5h ago',
        type: 'SHORT',
        entryPrice: 157.50,
        exitPrice: 157.80,
        date: '2023-06-24T07:45:00Z',
        pnl: -85,
        riskRewardRatio: 1.8,
        adherenceScore: 1,
        status: 'LOSS',
        chart: {
          imageUrl: 'https://example.com/chart2.png',
          annotations: []
        },
        analysis: {
          technical: 'False breakout on resistance',
          psychological: 'Slightly overconfident',
          rulesFollowed: ['Trend confirmation', 'Volume spike present', 'Risk management sized'],
          lessonsLearned: 'Wait for clearer confirmation before entry',
          emotionalState: 'Frustrated',
          confidenceLevel: 6
        },
        metadata: {
          timeframe: '5m',
          position: {
            size: 0.5,
            risk: 30
          },
          strategy: 'Breakout Scalping',
          tags: ['London Session', 'False Breakout']
        }
      }
    ]
  },
  'Swing Trading': {
    pairs: ['XAUUSD', 'GBPUSD', 'EURJPY', 'USDCAD'],
    rules: ['Daily trend alignment', 'Support/Resistance level', 'RSI confirmation'],
    color: 'green',
    trades: [
      {
        id: '3',
        symbol: 'XAUUSD',
        rr: '1:3.5',
        outcome: 'win',
        rules: [true, true, true],
        time: '2d ago',
        type: 'LONG',
        entryPrice: 1920.50,
        exitPrice: 1955.25,
        date: '2023-06-22T14:00:00Z',
        pnl: 347,
        riskRewardRatio: 3.5,
        adherenceScore: 1,
        status: 'WIN',
        chart: {
          imageUrl: 'https://example.com/chart3.png',
          annotations: []
        },
        analysis: {
          technical: 'Strong support level with bullish divergence',
          psychological: 'Patient and disciplined',
          rulesFollowed: ['Daily trend alignment', 'Support/Resistance level', 'RSI confirmation'],
          lessonsLearned: 'Patience pays off in swing trading',
          emotionalState: 'Satisfied',
          confidenceLevel: 9
        },
        metadata: {
          timeframe: '4h',
          position: {
            size: 0.25,
            risk: 100
          },
          strategy: 'Swing Trading',
          tags: ['Gold', 'Bullish Divergence']
        }
      }
    ]
  },
  'News Trading': {
    pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF'],
    rules: ['High impact news', 'Pre-news setup', 'Quick exit plan'],
    color: 'purple',
    trades: [
      {
        id: '4',
        symbol: 'USDJPY',
        rr: '1:2.1',
        outcome: 'win',
        rules: [true, false, true],
        time: '1d ago',
        type: 'SHORT',
        entryPrice: 143.20,
        exitPrice: 142.55,
        date: '2023-06-23T13:30:00Z',
        pnl: 195,
        riskRewardRatio: 2.1,
        adherenceScore: 0.67,
        status: 'WIN',
        chart: {
          imageUrl: 'https://example.com/chart4.png',
          annotations: []
        },
        analysis: {
          technical: 'Sharp reaction to BOJ announcement',
          psychological: 'Slightly nervous but focused',
          rulesFollowed: ['High impact news', 'Quick exit plan'],
          lessonsLearned: 'Need to improve pre-news setup',
          emotionalState: 'Excited',
          confidenceLevel: 7
        },
        metadata: {
          timeframe: '1m',
          position: {
            size: 1,
            risk: 60
          },
          strategy: 'News Trading',
          tags: ['BOJ', 'Interest Rate Decision']
        }
      }
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
