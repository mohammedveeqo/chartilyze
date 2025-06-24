import { CheckCircle, XCircle } from 'lucide-react'
import { Trade } from '@/types/trade'

interface TradeCardProps {
  trade: Trade
}

export function TradeCard({ trade }: TradeCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 hover:bg-gray-800 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm text-white">{trade.symbol}</span>
        <span className={`text-xs px-2 py-1 rounded ${
          trade.outcome === 'win' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {trade.pnl}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">R:R {trade.rr}</span>
        <div className="flex gap-1">
          {trade.rules.map((followed, j) => (
            followed ? 
              <CheckCircle key={j} className="h-3 w-3 text-green-400" /> :
              <XCircle key={j} className="h-3 w-3 text-red-400" />
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{trade.time}</div>
    </div>
  )
}
