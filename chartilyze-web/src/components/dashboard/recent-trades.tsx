'use client'

import { MoreHorizontal, TrendingUp, TrendingDown, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Trade {
  id: string
  symbol: string
  type: 'long' | 'short'
  entry: number
  exit: number
  pnl: number
  rr: string
  adherence: number
  date: string
  status: 'win' | 'loss'
}

const trades: Trade[] = [
  {
    id: '1',
    symbol: 'EURUSD',
    type: 'long',
    entry: 1.0842,
    exit: 1.0891,
    pnl: 247.50,
    rr: '2.3:1',
    adherence: 95,
    date: '2h ago',
    status: 'win'
  },
  {
    id: '2',
    symbol: 'GBPJPY',
    type: 'short',
    entry: 191.45,
    exit: 190.82,
    pnl: 315.20,
    rr: '1.8:1',
    adherence: 88,
    date: '4h ago',
    status: 'win'
  },
  {
    id: '3',
    symbol: 'XAUUSD',
    type: 'long',
    entry: 2034.50,
    exit: 2028.30,
    pnl: -124.00,
    rr: '0.5:1',
    adherence: 72,
    date: '1d ago',
    status: 'loss'
  },
  {
    id: '4',
    symbol: 'USDJPY',
    type: 'short',
    entry: 149.82,
    exit: 149.15,
    pnl: 201.30,
    rr: '1.9:1',
    adherence: 92,
    date: '1d ago',
    status: 'win'
  },
  {
    id: '5',
    symbol: 'BTCUSD',
    type: 'long',
    entry: 43250.00,
    exit: 42890.00,
    pnl: -180.00,
    rr: '0.8:1',
    adherence: 65,
    date: '2d ago',
    status: 'loss'
  }
]

export function RecentTrades() {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Trades</h2>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
            View All
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left p-4 text-sm font-medium text-gray-400">Symbol</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Type</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Entry/Exit</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">P&L</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">R:R</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Adherence</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Time</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{trade.symbol}</span>
                    {trade.status === 'win' ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trade.type === 'long' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-gray-300">
                  <div className="text-sm">
                    <div>{trade.entry}</div>
                    <div className="text-gray-500">{trade.exit}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`font-medium ${
                    trade.pnl > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                </td>
                <td className="p-4 text-gray-300">{trade.rr}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      trade.adherence >= 90 ? 'bg-green-400' :
                      trade.adherence >= 75 ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="text-gray-300 text-sm">{trade.adherence}%</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400 text-sm">{trade.date}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}