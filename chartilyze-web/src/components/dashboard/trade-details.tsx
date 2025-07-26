'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle, XCircle } from 'lucide-react'

interface TradeRule {
  rule: string
  followed: boolean
  notes?: string
}

interface TradeStep {
  step: string
  executed: boolean
  notes?: string
  timestamp?: string
}

interface TradeDetails {
  pair: string
  date: string
  type: 'LONG' | 'SHORT'
  outcome: 'win' | 'loss'
  pnl: string
  rules: TradeRule[]
  steps: TradeStep[]
  beforeImage: string
  afterImage?: string
  notes: string
  tags: string[]
}

const sampleTrade: TradeDetails = {
  pair: 'EURUSD',
  date: '2024-04-15 09:30 EST',
  type: 'LONG',
  outcome: 'win',
  pnl: '+$127',
  rules: [
    { rule: 'Trend confirmation', followed: true, notes: 'Clear uptrend on higher timeframe' },
    { rule: 'Volume spike present', followed: true },
    { rule: 'Risk management sized', followed: false, notes: 'Position size slightly larger than planned' }
  ],
  steps: [
    { step: 'Market structure analysis', executed: true, notes: 'Higher highs and higher lows confirmed', timestamp: '09:15' },
    { step: 'Wait for pullback to support', executed: true, notes: 'Price pulled back to 0.618 fib level', timestamp: '09:25' },
    { step: 'Entry on bullish engulfing candle', executed: true, notes: 'Strong volume confirmation', timestamp: '09:30' },
    { step: 'Set initial stop loss', executed: true, timestamp: '09:30' },
    { step: 'Move SL to breakeven at 1:1 RR', executed: true, notes: 'Moved at 09:45', timestamp: '09:45' },
    { step: 'Trail stop with ATR', executed: false, notes: 'Decided to hold for full target instead' }
  ],
  beforeImage: 'https://i.ibb.co/yFxg7gPf/Screenshot-2025-06-23-at-16-15-04.png',
  afterImage: 'https://i.ibb.co/yFxg7gPf/Screenshot-2025-06-23-at-16-15-04.png',
  notes: 'Strong momentum after NFP data. Managed trade well despite larger position size. Next time will stick to original position sizing rules.',
  tags: ['NFP', 'Breakout', 'High Volume']
}

export default function TradeDetails() {
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before')

  const rulesFollowed = sampleTrade.rules.filter(r => r.followed).length
  const rulesTotal = sampleTrade.rules.length
  const rrPlanned = '2.5'
  const rrAchieved = '1.8'
  const disciplineRating = rulesFollowed / rulesTotal > 0.8 ? 'Disciplined Trade' : 'Needs Review'

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column - Chart */}
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                {sampleTrade.pair}
                <span className={`text-sm px-2 py-1 rounded ${sampleTrade.type === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {sampleTrade.type}
                </span>
              </h2>
              <p className="text-sm text-gray-400">{sampleTrade.date}</p>
            </div>
            <div className={`text-lg font-semibold ${sampleTrade.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
              {sampleTrade.pnl}
            </div>
          </div>
          
          {sampleTrade.afterImage && (
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setActiveTab('before')} 
                className={`px-3 py-1.5 rounded text-sm ${activeTab === 'before' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Entry Setup
              </button>
              <button 
                onClick={() => setActiveTab('after')} 
                className={`px-3 py-1.5 rounded text-sm ${activeTab === 'after' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Trade Result
              </button>
            </div>
          )}
          
          <div className="relative aspect-[16/10] bg-gray-800 rounded-lg overflow-hidden">
            <img 
              src={activeTab === 'before' ? sampleTrade.beforeImage : sampleTrade.afterImage || sampleTrade.beforeImage} 
              alt="Trade Chart" 
          
            />
          </div>
        </div>

        {/* Right Column - Summary & Rules */}
        <div className="p-6 space-y-6">
          <div className="bg-gray-800/40 rounded-lg p-4 text-sm text-gray-200 space-y-2">
            <p><strong>Planned R:R:</strong> {rrPlanned} | <strong>Achieved R:R:</strong> {rrAchieved}</p>
            <p><strong>Rules Followed:</strong> {rulesFollowed}/{rulesTotal}</p>
            <p><strong>Status:</strong> {disciplineRating}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">✅ Followed Rules</h3>
            <ul className="space-y-2">
              {sampleTrade.rules.filter(r => r.followed).map((rule, idx) => (
                <li key={idx} className="text-sm text-green-400">{rule.rule}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">❌ Broken Rules</h3>
            <ul className="space-y-2">
              {sampleTrade.rules.filter(r => !r.followed).map((rule, idx) => (
                <li key={idx} className="text-sm text-red-400">
                  {rule.rule} - <span className="text-gray-400">{rule.notes}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-400 mb-1">🧠 Trader Notes</h4>
            <p className="text-sm text-gray-300">{sampleTrade.notes}</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm rounded-lg p-3">
            <p>Suggestion: You followed your setup well, but broke risk rules. Stick to position sizing discipline for long-term consistency.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
