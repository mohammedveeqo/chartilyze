'use client'

import { Clock } from 'lucide-react'
import { TradeCard } from './trade-card'
import { useStrategy } from '@/app/hooks/use-strategy'
import type { Trade } from '@/types/trade'
import type { Strategy } from '@/types/strategy'

export function RecentTradesList() {
  const { currentStrategy, strategies } = useStrategy()
  const currentStrategyData: Strategy = strategies[currentStrategy]

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
