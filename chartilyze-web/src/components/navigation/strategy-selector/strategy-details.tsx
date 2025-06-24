'use client'

import { useStrategy } from '@/app/hooks/use-strategy'
import { getColorClasses } from '@/lib/utils'
import type { Strategy } from '@/types/strategy'

export function StrategyDetails() {
  const { currentStrategy, strategies } = useStrategy()
  const currentStrategyData: Strategy = strategies[currentStrategy]

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-gray-400 mb-2">Preferred Pairs</div>
        <div className="flex flex-wrap gap-1">
          {currentStrategyData.pairs.map((pair: string, i: number) => (
            <span 
              key={i} 
              className={`text-xs px-2 py-1 rounded border ${
                getColorClasses(currentStrategyData.color)
              }`}
            >
              {pair}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
