'use client'

import { useState } from 'react'
import { Plus, Target, CheckCircle, XCircle, Settings, Upload, Clock, Camera, ChevronDown, Edit3, Copy, Trash2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Trade {
  symbol: string
  rr: string
  outcome: 'win' | 'loss'
  rules: boolean[]
  time: string
  pnl: string
}

interface Strategy {
  pairs: string[]
  rules: string[]
  trades: Trade[]
  color: string
}

type StrategyName = 'Breakout Scalping' | 'Swing Trading' | 'News Trading'

export function QuickActions() {
  const [showAddTrade, setShowAddTrade] = useState<boolean>(false)
  const [showStrategyModal, setShowStrategyModal] = useState<boolean>(false)
  const [showStrategyDropdown, setShowStrategyDropdown] = useState<boolean>(false)
  const [editingStrategy, setEditingStrategy] = useState<StrategyName | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false)
  const [currentStrategy, setCurrentStrategy] = useState<StrategyName>('Breakout Scalping')
  
  const [strategies, setStrategies] = useState<Record<StrategyName, Strategy>>({
    'Breakout Scalping': {
      pairs: ['EURUSD', 'GBPJPY', 'AUDUSD', 'USDJPY'],
      rules: ['Trend confirmation', 'Volume spike present', 'Risk management sized'],
      color: 'blue',
      trades: [
        { symbol: 'EURUSD', rr: '1:2.3', outcome: 'win', rules: [true, true, false], time: '2h ago', pnl: '+$127' },
        { symbol: 'GBPJPY', rr: '1:1.8', outcome: 'loss', rules: [true, false, true], time: '4h ago', pnl: '-$85' },
        { symbol: 'AUDUSD', rr: '1:3.1', outcome: 'win', rules: [true, true, true], time: '1d ago', pnl: '+$156' },
        { symbol: 'USDJPY', rr: '1:1.5', outcome: 'win', rules: [true, true, false], time: '1d ago', pnl: '+$92' }
      ]
    },
    'Swing Trading': {
      pairs: ['XAUUSD', 'GBPUSD', 'EURJPY', 'USDCAD'],
      rules: ['Daily trend alignment', 'Support/Resistance level', 'RSI confirmation'],
      color: 'green',
      trades: [
        { symbol: 'XAUUSD', rr: '1:4.2', outcome: 'win', rules: [true, true, true], time: '1d ago', pnl: '+$284' },
        { symbol: 'GBPUSD', rr: '1:3.1', outcome: 'loss', rules: [true, false, true], time: '3d ago', pnl: '-$95' },
        { symbol: 'EURJPY', rr: '1:2.8', outcome: 'win', rules: [true, true, false], time: '5d ago', pnl: '+$167' }
      ]
    },
    'News Trading': {
      pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF'],
      rules: ['High impact news', 'Pre-news setup', 'Quick exit plan'],
      color: 'purple',
      trades: [
        { symbol: 'EURUSD', rr: '1:1.8', outcome: 'win', rules: [true, true, true], time: '6h ago', pnl: '+$143' },
        { symbol: 'GBPUSD', rr: '1:2.1', outcome: 'loss', rules: [true, true, false], time: '1d ago', pnl: '-$78' }
      ]
    }
  })
  
  const currentStrategyData = strategies[currentStrategy]
  const recentTrades = currentStrategyData.trades

const getColorClasses = (color: string): string => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20'
  }
  return colors[color as keyof typeof colors] || colors.blue
}


  const StrategyModal = () => {
    const [formData, setFormData] = useState({
      name: editingStrategy || '',
      pairs: editingStrategy ? strategies[editingStrategy].pairs.join(', ') : '',
      rules: editingStrategy ? strategies[editingStrategy].rules.join('\n') : '',
      color: editingStrategy ? strategies[editingStrategy].color : 'blue'
    })

    const handleSave = () => {
      // Logic to save strategy would go here
      console.log('Saving strategy:', formData)
      setShowStrategyModal(false)
      setEditingStrategy(null)
      setIsCreatingNew(false)
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {isCreatingNew ? 'Create New Strategy' : `Edit ${editingStrategy}`}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {isCreatingNew ? 'Define your trading approach' : 'Modify your strategy parameters'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowStrategyModal(false)
                  setEditingStrategy(null)
                  setIsCreatingNew(false)
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Strategy Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Strategy Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter strategy name"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color Theme</label>
              <div className="flex gap-2">
                {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({...formData, color})}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color 
                        ? 'border-white scale-110' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: {
                      blue: '#3b82f6',
                      green: '#10b981',
                      purple: '#8b5cf6',
                      orange: '#f59e0b',
                      red: '#ef4444'
                    }[color] }}
                  />
                ))}
              </div>
            </div>
            
            {/* Preferred Pairs */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Currency Pairs</label>
              <input 
                type="text" 
                value={formData.pairs}
                onChange={(e) => setFormData({...formData, pairs: e.target.value})}
                placeholder="EURUSD, GBPJPY, AUDUSD, USDJPY"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Separate pairs with commas</p>
            </div>
            
            {/* Strategy Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Strategy Rules</label>
              <textarea 
                value={formData.rules}
                onChange={(e) => setFormData({...formData, rules: e.target.value})}
                placeholder="Enter each rule on a new line&#10;Trend confirmation&#10;Volume spike present&#10;Risk management sized"
                rows={6}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Each line becomes a rule checkbox</p>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-700 flex gap-3">
            <button 
              onClick={() => {
                setShowStrategyModal(false)
                setEditingStrategy(null)
                setIsCreatingNew(false)
              }}
              className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isCreatingNew ? 'Create Strategy' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const AddTradeModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Add New Trade</h3>
          <p className="text-sm text-gray-400 mt-1">Capture your setup and reflect on execution</p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Chart Upload */}
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Upload chart screenshot</p>
            <p className="text-xs text-gray-500 mt-1">From TradingView or manual capture</p>
          </div>
          
          {/* Trade Details */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Entry</label>
              <input type="text" placeholder="1.0850" className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Stop Loss</label>
              <input type="text" placeholder="1.0830" className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Take Profit</label>
              <input type="text" placeholder="1.0890" className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
            </div>
          </div>
          
          {/* Strategy Rules */}
          <div>
            <label className="block text-sm text-gray-300 mb-3">Strategy Rules Followed</label>
            <div className="space-y-2">
              {currentStrategyData.rules.map((rule: string, i: number) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-600 bg-gray-800" />
                  <span className="text-sm text-gray-300">{rule}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button 
            onClick={() => setShowAddTrade(false)}
            className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
            Save Trade
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="w-80 h-screen sticky top-0">
        {/* Add Trade CTA */}
        <div className="p-4">
          <Button 
            onClick={() => setShowAddTrade(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Trade
          </Button>
        </div>

        {/* Active Strategy */}
        <div className="px-4 pb-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Header with edit button */}
                      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Active Strategy</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      setEditingStrategy(currentStrategy)
                      setShowStrategyModal(true)
                      setIsCreatingNew(false)
                    }}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title="Edit Strategy"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      setIsCreatingNew(true)
                      setShowStrategyModal(true)
                      setEditingStrategy(null)
                    }}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    title="Create New Strategy"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setShowStrategyDropdown(!showStrategyDropdown)}
                className="w-full flex items-center justify-between text-left mb-3 hover:bg-gray-700/50 rounded p-2 transition-colors"
              >
                <span className="text-sm text-gray-300">{currentStrategy}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showStrategyDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Strategy Dropdown */}
              {showStrategyDropdown && (
                <div className="absolute top-full left-4 right-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 mt-1">
                  {(Object.keys(strategies) as StrategyName[]).map((strategy) => (
                    <button
                      key={strategy}
                      onClick={() => {
                        setCurrentStrategy(strategy)
                        setShowStrategyDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        strategy === currentStrategy ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'
                      }`}
                    >
                      <div className="font-medium">{strategy}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {strategies[strategy].pairs.slice(0, 3).join(', ')}
                        {strategies[strategy].pairs.length > 3 && '...'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Preferred Pairs */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-2">Preferred Pairs</div>
                <div className="flex flex-wrap gap-1">
                  {currentStrategyData.pairs.map((pair, i) => (
                    <span key={i} className={`text-xs px-2 py-1 rounded border ${getColorClasses(currentStrategyData.color)}`}>
                      {pair}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Last trade adherence</span>
                <div className="flex gap-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <XCircle className="h-3 w-3 text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="px-4 flex-1">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Trades
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentTrades.map((trade: Trade, i: number) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 hover:bg-gray-800 transition-colors cursor-pointer">
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
                    {trade.rules.map((followed: boolean, j: number) => (
                      followed ? 
                        <CheckCircle key={j} className="h-3 w-3 text-green-400" /> :
                        <XCircle key={j} className="h-3 w-3 text-red-400" />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{trade.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Upload className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400">TradingView</span>
            </div>
          </div>
        </div>
      </div>

      {showAddTrade && <AddTradeModal />}
      {showStrategyModal && <StrategyModal />}
    </>
  )
}
