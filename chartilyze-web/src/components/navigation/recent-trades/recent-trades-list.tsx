'use client'

import { Clock } from 'lucide-react'
import { TradeCard } from './trade-card'
import { useStrategy } from '@/app/hooks/use-strategy'
import type { Trade } from '@/types/trade'
import type { Strategy } from '@/types/strategy'

export function RecentTradesList() {
  const { currentStrategy, strategies } = useStrategy()
  const currentStrategyData: Strategy = strategies[currentStrategy]

  // Early return if no strategy data is available
  if (!currentStrategyData || !currentStrategyData.trades) {
    return (
      <div className="px-4 flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-medium text-gray-300 my-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Trades
        </h3>
        <div className="space-y-2 overflow-y-auto flex-1 pr-2">
          <p className="text-gray-500 text-sm">No trades available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 flex-1 overflow-hidden flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 my-4 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Recent Trades
      </h3>
      <div className="space-y-2 overflow-y-auto flex-1 pr-2">
        {currentStrategyData.trades.map((trade: Trade, i: number) => (
          <TradeCard key={i} trade={trade} />
        ))}
      </div>
    </div>
  )
}
