import React, { useState, useEffect } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import type { Strategy } from "~lib/types"

interface JournalEntryProps {
  onClose: () => void
  onSuccess: (message?: string) => void
  onCancel: () => void
}

interface TradeDetails {
  pair: string
  timeframe: string
  strategyId: string
  strategyComponent: string
  notes: string
  entryType: 'setup' | 'outcome'
  direction?: 'long' | 'short'
  entryPrice?: string
  stopLoss?: string
  takeProfit?: string
}

export function JournalEntry({ onClose, onSuccess }: JournalEntryProps) {
  const [screenshot, setScreenshot] = useState<string>('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [tradeDetails, setTradeDetails] = useState<TradeDetails>({
    pair: '',
    timeframe: '',
    strategyId: '',
    strategyComponent: '',
    notes: '',
    entryType: 'setup',
    direction: undefined,
    entryPrice: '',
    stopLoss: '',
    takeProfit: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadStrategies()
    captureScreenshot()
    extractPageDetails()
  }, [])

  const loadStrategies = async () => {
    try {
      const response = await sendToBackground({ name: "getStrategies" })
      if (response.success && response.strategies.length > 0) {
        setStrategies(response.strategies)
        // Auto-select first strategy
        setTradeDetails(prev => ({ ...prev, strategyId: response.strategies[0].id }))
      }
    } catch (error) {
      console.error('Failed to load strategies:', error)
    }
  }

  const captureScreenshot = async () => {
    setIsCapturing(true)
    try {
      const response = await sendToBackground({ name: "captureScreenshot" })
      if (response.success) {
        setScreenshot(response.screenshot)
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
    } finally {
      setIsCapturing(false)
    }
  }

  const extractPageDetails = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id && tab.url?.includes('tradingview.com')) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Extract trading pair and timeframe from TradingView
            const symbolElement = document.querySelector('[data-name="legend-source-item"]')
            const timeframeElement = document.querySelector('[data-name="resolution"]')
            
            return {
              pair: symbolElement?.textContent?.trim() || '',
              timeframe: timeframeElement?.textContent?.trim() || ''
            }
          }
        })
        
        // Type the result properly
        const result = results[0]?.result as { pair: string; timeframe: string } | undefined
        
        if (result) {
          setTradeDetails(prev => ({
            ...prev,
            pair: result.pair,
            timeframe: result.timeframe
          }))
        }
      }
    } catch (error) {
      console.error('Failed to extract page details:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!tradeDetails.pair.trim()) {
      newErrors.pair = 'Trading pair is required'
    }
    
    if (!tradeDetails.strategyId) {
      newErrors.strategyId = 'Strategy selection is required'
    }
    
    if (!screenshot) {
      newErrors.screenshot = 'Screenshot is required'
    }
    
    if (tradeDetails.entryPrice && isNaN(parseFloat(tradeDetails.entryPrice))) {
      newErrors.entryPrice = 'Entry price must be a valid number'
    }
    
    if (tradeDetails.stopLoss && isNaN(parseFloat(tradeDetails.stopLoss))) {
      newErrors.stopLoss = 'Stop loss must be a valid number'
    }
    
    if (tradeDetails.takeProfit && isNaN(parseFloat(tradeDetails.takeProfit))) {
      newErrors.takeProfit = 'Take profit must be a valid number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await sendToBackground({
        name: "createJournalEntry",
        body: {
          screenshot,
          tradeDetails,
          timestamp: new Date().toISOString()
        }
      })
      
      if (response.success) {
        onSuccess()
        onClose()
      } else {
        setErrors({ submit: 'Failed to create journal entry' })
      }
    } catch (error) {
      console.error('Failed to create journal entry:', error)
      setErrors({ submit: 'Failed to create journal entry' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedStrategy = strategies.find(s => s.id === tradeDetails.strategyId)
  const strategyComponents = selectedStrategy?.components || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add to Journal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Screenshot Preview */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Screenshot *</label>
          {isCapturing ? (
            <div className="w-full h-32 bg-gray-800 rounded flex items-center justify-center">
              <div className="text-gray-400">Capturing screenshot...</div>
            </div>
          ) : screenshot ? (
            <div className="relative">
              <img 
                src={screenshot} 
                alt="Chart screenshot" 
                className="w-full h-32 object-cover rounded"
              />
              <button
                onClick={captureScreenshot}
                className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
              >
                Retake
              </button>
            </div>
          ) : (
            <button
              onClick={captureScreenshot}
              className="w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded flex items-center justify-center hover:border-blue-500 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📸</div>
                <div className="text-sm text-gray-400">Capture Screenshot</div>
              </div>
            </button>
          )}
          {errors.screenshot && (
            <p className="text-red-400 text-xs mt-1">{errors.screenshot}</p>
          )}
        </div>

        {/* Trade Details Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Trading Pair *</label>
              <input
                type="text"
                value={tradeDetails.pair}
                onChange={(e) => {
                  setTradeDetails(prev => ({ ...prev, pair: e.target.value.toUpperCase() }))
                  if (errors.pair) setErrors(prev => ({ ...prev, pair: '' }))
                }}
                className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${
                  errors.pair ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="EURUSD"
              />
              {errors.pair && (
                <p className="text-red-400 text-xs mt-1">{errors.pair}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Timeframe</label>
              <select
                value={tradeDetails.timeframe}
                onChange={(e) => setTradeDetails(prev => ({ ...prev, timeframe: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Auto-detected</option>
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1H">1 Hour</option>
                <option value="4H">4 Hours</option>
                <option value="1D">1 Day</option>
                <option value="1W">1 Week</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Strategy *</label>
            <select
              value={tradeDetails.strategyId}
              onChange={(e) => {
                setTradeDetails(prev => ({ ...prev, strategyId: e.target.value, strategyComponent: '' }))
                if (errors.strategyId) setErrors(prev => ({ ...prev, strategyId: '' }))
              }}
              className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${
                errors.strategyId ? 'border-red-500' : 'border-gray-600'
              }`}
            >
              {strategies.length === 0 && <option value="">Loading strategies...</option>}
              {strategies.length > 0 && (
                <>
                  <option value="">Select a strategy</option>
                  {strategies.map(strategy => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.strategyId && (
              <p className="text-red-400 text-xs mt-1">{errors.strategyId}</p>
            )}
          </div>

          {selectedStrategy && strategyComponents.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Strategy Component</label>
              <select
                value={tradeDetails.strategyComponent}
                onChange={(e) => setTradeDetails(prev => ({ ...prev, strategyComponent: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Select component (optional)</option>
                {strategyComponents.map((component, index) => (
                  <option key={index} value={component}>
                    {component}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Entry Type</label>
              <select
                value={tradeDetails.entryType}
                onChange={(e) => setTradeDetails(prev => ({ ...prev, entryType: e.target.value as 'setup' | 'outcome' }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="setup">Setup</option>
                <option value="outcome">Outcome</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Direction</label>
              <select
                value={tradeDetails.direction || ''}
                onChange={(e) => setTradeDetails(prev => ({ ...prev, direction: e.target.value as 'long' | 'short' | undefined }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Select direction</option>
                <option value="long">Long (Buy)</option>
                <option value="short">Short (Sell)</option>
              </select>
            </div>
          </div>

          {tradeDetails.entryType === 'setup' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Entry Price</label>
                <input
                  type="text"
                  value={tradeDetails.entryPrice || ''}
                  onChange={(e) => {
                    setTradeDetails(prev => ({ ...prev, entryPrice: e.target.value }))
                    if (errors.entryPrice) setErrors(prev => ({ ...prev, entryPrice: '' }))
                  }}
                  className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${
                    errors.entryPrice ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="1.2345"
                />
                {errors.entryPrice && (
                  <p className="text-red-400 text-xs mt-1">{errors.entryPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stop Loss</label>
                <input
                  type="text"
                  value={tradeDetails.stopLoss || ''}
                  onChange={(e) => {
                    setTradeDetails(prev => ({ ...prev, stopLoss: e.target.value }))
                    if (errors.stopLoss) setErrors(prev => ({ ...prev, stopLoss: '' }))
                  }}
                  className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${
                    errors.stopLoss ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="1.2300"
                />
                {errors.stopLoss && (
                  <p className="text-red-400 text-xs mt-1">{errors.stopLoss}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Take Profit</label>
                <input
                  type="text"
                  value={tradeDetails.takeProfit || ''}
                  onChange={(e) => {
                    setTradeDetails(prev => ({ ...prev, takeProfit: e.target.value }))
                    if (errors.takeProfit) setErrors(prev => ({ ...prev, takeProfit: '' }))
                  }}
                  className={`w-full bg-gray-800 border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${
                    errors.takeProfit ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="1.2400"
                />
                {errors.takeProfit && (
                  <p className="text-red-400 text-xs mt-1">{errors.takeProfit}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={tradeDetails.notes}
              onChange={(e) => setTradeDetails(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20 resize-none"
              placeholder="Add any additional notes about this trade..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Add to Journal'}
          </button>
        </div>
      </div>
    </div>
  )
}