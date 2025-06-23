'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const performanceData = [
{ date: 'Jan 1', value: 0, trades: 0 },
{ date: 'Jan 8', value: 234, trades: 12 },
{ date: 'Jan 15', value: 456, trades: 25 },
{ date: 'Jan 22', value: 378, trades: 38 },
{ date: 'Jan 29', value: 612, trades: 51 },
{ date: 'Feb 5', value: 789, trades: 63 },
{ date: 'Feb 12', value: 945, trades: 78 },
{ date: 'Feb 19', value: 1123, trades: 89 },
{ date: 'Feb 26', value: 1456, trades: 102 },
{ date: 'Mar 5', value: 1689, trades: 115 },
{ date: 'Mar 12', value: 2012, trades: 128 },
{ date: 'Mar 19', value: 2234, trades: 141 },
{ date: 'Mar 26', value: 2567, trades: 156 },
{ date: 'Apr 2', value: 2847, trades: 169 }
]

export function PerformanceChart() {
return (
<div className="bg-gray-900 rounded-lg border border-gray-800">
<div className="p-6 border-b border-gray-800">
<div className="flex items-center justify-between mb-4">
<h2 className="text-xl font-semibold text-white">Performance Overview</h2>
<div className="flex items-center gap-2">
<Button variant="ghost" size="sm" className="text-gray-400">
<Calendar className="h-4 w-4 mr-2" />
Last 3 months
</Button>
</div>
</div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-green-400" />
        <span className="text-green-400 font-medium">+$2,847.32</span>
        <span className="text-gray-400 text-sm">Total P&L</span>
      </div>
      <div className="text-gray-400 text-sm">
        169 trades • 68.5% win rate
      </div>
    </div>
  </div>
  
  <div className="p-6">
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer>
        <AreaChart data={performanceData}>
          <defs>
            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value: any, name: string) => [
              name === 'value' ? `$${value}` : value,
              name === 'value' ? 'P&L' : 'Trades'
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPnL)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    
    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
      <div className="text-center">
        <p className="text-2xl font-bold text-white">$2,847</p>
        <p className="text-sm text-gray-400">Total P&L</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-white">169</p>
        <p className="text-sm text-gray-400">Total Trades</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-white">68.5%</p>
        <p className="text-sm text-gray-400">Win Rate</p>
      </div>
    </div>
  </div>
</div>
)
}