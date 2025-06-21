// src/components/dashboard/trade-analysis.tsx
'use client'

import { Trade } from '@/types/trade'
import { Card } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Clock,
  Tag
} from 'lucide-react'

interface TradeAnalysisProps {
  trade: Trade
}

export function TradeAnalysis({ trade }: TradeAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Trade on {trade.symbol}
          </h1>
          <p className="text-gray-400">
            {new Date(trade.date).toLocaleDateString()}
          </p>
        </div>
        <div className={`text-2xl font-bold ${
          trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
        </div>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {trade.symbol} Price Chart
        </h2>
        <div className="aspect-video bg-gray-800 rounded-lg">
          {/* Chart component goes here */}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Entry Price</h3>
          <p className="text-2xl font-bold text-white">{trade.entryPrice}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Exit Price</h3>
          <p className="text-2xl font-bold text-white">{trade.exitPrice}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profit/Loss</h3>
          <p className={`text-2xl font-bold ${
            trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
          </p>
        </Card>
      </div>

      {/* Analysis */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Trade Analysis</h2>
        <div className="prose prose-invert max-w-none">
          <p>{trade.analysis.technical}</p>
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5" />
              Psychological Analysis
            </h3>
            <p>{trade.analysis.psychological}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5" />
              Rules Followed
            </h3>
            <ul>
              {trade.analysis.rulesFollowed.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5" />
              Emotional State
            </h3>
            <div className="flex items-center gap-4">
              <p>{trade.analysis.emotionalState}</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Confidence:</span>
                <span className="text-white">{trade.analysis.confidenceLevel}%</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5" />
              Lessons Learned
            </h3>
            <p>{trade.analysis.lessonsLearned}</p>
          </div>
        </div>
      </Card>

      {/* Metadata */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Trade Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Timeframe</p>
            <p className="text-white">{trade.metadata.timeframe}</p>
          </div>
          <div>
            <p className="text-gray-400">Strategy</p>
            <p className="text-white">{trade.metadata.strategy}</p>
          </div>
          <div>
            <p className="text-gray-400">Position Size</p>
            <p className="text-white">{trade.metadata.position.size}</p>
          </div>
          <div>
            <p className="text-gray-400">Risk</p>
            <p className="text-white">{trade.metadata.position.risk}%</p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-400 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {trade.metadata.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 rounded-full bg-gray-800 text-gray-300 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
