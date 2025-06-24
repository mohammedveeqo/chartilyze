'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { useStrategy } from '@/app/hooks/use-strategy'
import type { Strategy } from '@/types/strategy'
import type { CreateTradeDTO, TradeType, TradeTimeframe } from '@/types/trade'

interface AddTradeModalProps {
  onClose: () => void
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: CreateTradeDTO = {
  symbol: '',
  type: 'LONG',
  entryPrice: 0,
  stopLoss: 0,
  takeProfit: 0,
  position: {
    size: 0,
    risk: 0
  },
  timeframe: '15m',
  strategy: '',
  rulesFollowed: [],
  analysis: {
    technical: '',
    psychological: '',
    emotionalState: '',
    confidenceLevel: 5
  }
}

const timeframes: TradeTimeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']
const tradeTypes: TradeType[] = ['LONG', 'SHORT']

export function AddTradeModal({ onClose }: AddTradeModalProps) {
  const { currentStrategy, strategies } = useStrategy()
  const currentStrategyData: Strategy = strategies[currentStrategy]

  const [formData, setFormData] = useState<CreateTradeDTO>({
    ...initialFormData,
    strategy: currentStrategy
  })
  const [rulesFollowed, setRulesFollowed] = useState<boolean[]>(
    currentStrategyData.rules.map(() => false)
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.entryPrice) {
      newErrors.entryPrice = 'Entry price is required'
    }
    if (!formData.stopLoss) {
      newErrors.stopLoss = 'Stop loss is required'
    }
    if (!formData.takeProfit) {
      newErrors.takeProfit = 'Take profit is required'
    }
    if (!formData.position.size) {
      newErrors.positionSize = 'Position size is required'
    }

    // Validate R:R ratio
    const riskDistance = Math.abs(formData.entryPrice - formData.stopLoss)
    const rewardDistance = Math.abs(formData.takeProfit - formData.entryPrice)
    if (riskDistance && rewardDistance) {
      const rr = rewardDistance / riskDistance
      if (rr < 1) {
        newErrors.riskReward = 'Risk to reward ratio should be at least 1:1'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      
      if (field === 'positionSize' || field === 'risk') {
        newData.position = {
          ...newData.position,
          [field === 'positionSize' ? 'size' : 'risk']: Number(value)
        }
      } else if (field === 'technical') {
        newData.analysis = {
          ...newData.analysis,
          technical: value
        }
      } else if (field in newData) {
        (newData as any)[field] = value
      }
      
      return newData
    })
  }

  const handleRuleCheck = (index: number) => {
    const newRulesFollowed = [...rulesFollowed]
    newRulesFollowed[index] = !newRulesFollowed[index]
    setRulesFollowed(newRulesFollowed)

    const selectedRules = currentStrategyData.rules.filter((_, i) => newRulesFollowed[i])
    setFormData(prev => ({
      ...prev,
      rulesFollowed: selectedRules
    }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Add your API call or state update logic here
      console.log('Submitting trade:', {
        ...formData,
        rulesFollowed: currentStrategyData.rules.filter((_, i) => rulesFollowed[i])
      })
      onClose()
    } catch (error) {
      console.error('Error adding trade:', error)
      setErrors({ submit: 'Failed to add trade. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Add New Trade</h3>
          <p className="text-sm text-gray-400 mt-1">Capture your setup and reflect on execution</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Chart Upload */}
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Upload chart screenshot</p>
            <p className="text-xs text-gray-500 mt-1">From TradingView or manual capture</p>
          </div>

          {/* Trade Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Trade Type</label>
            <div className="flex gap-2">
              {tradeTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleInputChange('type', type)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    formData.type === type
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Trade Details */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Entry</label>
              <input 
                type="number" 
                step="0.00001"
                value={formData.entryPrice || ''}
                onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value))}
                placeholder="1.0850" 
                className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm text-white ${
                  errors.entryPrice ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.entryPrice && (
                <p className="text-xs text-red-500 mt-1">{errors.entryPrice}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Stop Loss</label>
              <input 
                type="number"
                step="0.00001"
                value={formData.stopLoss || ''}
                onChange={(e) => handleInputChange('stopLoss', parseFloat(e.target.value))}
                placeholder="1.0830" 
                className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm text-white ${
                  errors.stopLoss ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.stopLoss && (
                <p className="text-xs text-red-500 mt-1">{errors.stopLoss}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Take Profit</label>
              <input 
                type="number"
                step="0.00001"
                value={formData.takeProfit || ''}
                onChange={(e) => handleInputChange('takeProfit', parseFloat(e.target.value))}
                placeholder="1.0890" 
                className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm text-white ${
                  errors.takeProfit ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.takeProfit && (
                <p className="text-xs text-red-500 mt-1">{errors.takeProfit}</p>
              )}
            </div>
          </div>

          {/* Position Size and Risk */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Position Size</label>
              <input 
                type="number"
                step="0.01"
                value={formData.position.size || ''}
                onChange={(e) => handleInputChange('positionSize', parseFloat(e.target.value))}
                placeholder="0.10" 
                className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm text-white ${
                  errors.positionSize ? 'border-red-500' : 'border-gray-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Risk Amount</label>
              <input 
                type="number"
                step="0.01"
                value={formData.position.risk || ''}
                onChange={(e) => handleInputChange('risk', parseFloat(e.target.value))}
                placeholder="50" 
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Timeframe</label>
            <select
              value={formData.timeframe}
              onChange={(e) => handleInputChange('timeframe', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
            >
              {timeframes.map((tf) => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          </div>
          
          {/* Strategy Rules */}
          <div>
            <label className="block text-sm text-gray-300 mb-3">Strategy Rules Followed</label>
            <div className="space-y-2">
              {currentStrategyData.rules.map((rule: string, i: number) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={rulesFollowed[i]}
                    onChange={() => handleRuleCheck(i)}
                    className="rounded border-gray-600 bg-gray-800" 
                  />
                  <span className="text-sm text-gray-300">{rule}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Analysis */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Technical Analysis</label>
            <textarea
              value={formData.analysis?.technical || ''}
              onChange={(e) => handleInputChange('technical', e.target.value)}
              placeholder="Describe your technical analysis..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white h-20 resize-none"
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Save Trade'}
          </button>
        </div>

        {errors.submit && (
          <div className="px-6 pb-4">
            <p className="text-sm text-red-500">{errors.submit}</p>
          </div>
        )}
      </div>
    </div>
  )
}
