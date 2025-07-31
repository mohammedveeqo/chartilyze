'use client'

import { useCurrentStrategy } from '@/app/hooks/use-strategy'
import { useQuery } from 'convex/react'
import { api } from '/home/Rassell/chartilyze/chartilyze-backend/convex/_generated/api'

export function StrategyDetails() {
  const { currentStrategy } = useCurrentStrategy()
  const trades = useQuery(api.trades.listByJournal, 
    currentStrategy ? { journalId: currentStrategy.journalId } : 'skip'
  )

  if (!currentStrategy) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400 text-sm">No strategy selected</p>
      </div>
    )
  }

  const recentTrades = trades?.slice(0, 3) || []

  return (
    <div className="space-y-3">
      {/* Strategy Info */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Strategy Details</div>
        <div className="text-sm text-gray-300">
          <div className="mb-1">
            <span className="text-gray-400">Rules:</span> {currentStrategy.rules?.length || 0}
          </div>
          {currentStrategy.complexity && (
            <div className="mb-1">
              <span className="text-gray-400">Complexity:</span> 
              <span className="ml-1 text-xs px-2 py-0.5 bg-gray-700 rounded capitalize">
                {currentStrategy.complexity}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Recent Trades</div>
        {recentTrades.length > 0 ? (
          <div className="space-y-2">
            {recentTrades.map((trade) => (
              <div key={trade._id} className="text-xs bg-gray-700/30 rounded p-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{trade.symbol}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    trade.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                    trade.status === 'closed' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {trade.status}
                  </span>
                </div>
                <div className="text-gray-400 mt-1">
                  Entry: ${trade.entry.toFixed(2)}
                  {trade.exit && ` | Exit: $${trade.exit.toFixed(2)}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-xs">No trades yet</div>
        )}
      </div>
    </div>
  )
}
