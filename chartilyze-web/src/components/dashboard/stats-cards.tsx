'use client'

import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Percent } from 'lucide-react'

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

const stats: StatCard[] = [
  {
    title: 'Total P&L',
    value: '$2,847.32',
    change: '+12.4%',
    changeType: 'positive',
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    title: 'Win Rate',
    value: '68.5%',
    change: '+5.2%',
    changeType: 'positive',
    icon: <Target className="h-5 w-5" />
  },
  {
    title: 'Avg R:R',
    value: '2.3:1',
    change: '+0.3',
    changeType: 'positive',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    title: 'Strategy Adherence',
    value: '82%',
    change: '-3.1%',
    changeType: 'negative',
    icon: <Percent className="h-5 w-5" />
  }
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <div className="text-blue-400">
                {stat.icon}
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              stat.changeType === 'positive' 
                ? 'text-green-400' 
                : stat.changeType === 'negative' 
                ? 'text-red-400' 
                : 'text-gray-400'
            }`}>
              {stat.changeType === 'positive' ? (
                <TrendingUp className="h-3 w-3" />
              ) : stat.changeType === 'negative' ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              {stat.change}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}