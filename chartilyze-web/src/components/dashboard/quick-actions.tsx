'use client'

import { Plus, BarChart3, Brain, Settings, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

const actions = [
  {
    title: 'Add Trade',
    description: 'Manually log a trade',
    icon: <Plus className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    hoverColor: 'hover:bg-blue-500/20'
  },
  {
    title: 'View Analytics',
    description: 'Detailed performance metrics',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    hoverColor: 'hover:bg-green-500/20'
  },
  {
    title: 'Psychology Report',
    description: 'AI trading insights',
    icon: <Brain className="h-5 w-5" />,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    hoverColor: 'hover:bg-purple-500/20'
  },
  {
    title: 'Settings',
    description: 'Configure your journal',
    icon: <Settings className="h-5 w-5" />,
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    hoverColor: 'hover:bg-gray-500/20'
  },
  {
    title: 'Export Data',
    description: 'Download your trades',
    icon: <Download className="h-5 w-5" />,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    hoverColor: 'hover:bg-orange-500/20'
  },
  {
    title: 'Import Trades',
    description: 'Upload trade history',
    icon: <Upload className="h-5 w-5" />,
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    hoverColor: 'hover:bg-cyan-500/20'
  }
]

export function QuickActions() {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`
                w-full justify-start h-auto p-4 border transition-all
                ${action.color} ${action.hoverColor}
              `}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0">
                  {action.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-white text-sm">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">TradingView Extension</p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}