'use client'

import { Brain, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const insights = [
  {
    type: 'warning',
    icon: <AlertTriangle className="h-5 w-5" />,
    title: 'Revenge Trading Detected',
    description: 'You took 3 consecutive trades after a loss yesterday. Consider taking a break.',
    severity: 'high',
    color: 'text-red-400'
  },
  {
    type: 'success',
    icon: <CheckCircle className="h-5 w-5" />,
    title: 'Excellent Risk Management',
    description: 'Your last 10 trades maintained consistent position sizing.',
    severity: 'positive',
    color: 'text-green-400'
  },
  {
    type: 'info',
    icon: <Clock className="h-5 w-5" />,
    title: 'Optimal Trading Hours',
    description: 'Your win rate is 15% higher between 8-11 AM EST.',
    severity: 'medium',
    color: 'text-blue-400'
  },
  {
    type: 'warning',
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Strategy Deviation',
    description: 'Strategy adherence dropped to 72% this week vs 85% average.',
    severity: 'medium',
    color: 'text-yellow-400'
  }
]

const psychologyScore = 78
const adherenceScore = 82
const disciplineScore = 85

export function PsychologyInsights() {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Psychology Insights</h2>
        </div>
        
        {/* Psychology Scores */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-2">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeDasharray={`${psychologyScore}, 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {psychologyScore}
              </span>
            </div>
            <p className="text-xs text-gray-400">Psychology</p>
          </div>
          
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-2">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray={`${adherenceScore}, 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {adherenceScore}
              </span>
            </div>
            <p className="text-xs text-gray-400">Adherence</p>
          </div>
          
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-2">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeDasharray={`${disciplineScore}, 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {disciplineScore}
              </span>
            </div>
            <p className="text-xs text-gray-400">Discipline</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className={`flex-shrink-0 ${insight.color}`}>
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white mb-1">
                  {insight.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
        >
          View Detailed Analysis
        </Button>
      </div>
    </div>
  )
}