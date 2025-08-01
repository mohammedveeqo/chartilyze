'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Camera, X, Upload, Wand2, CheckCircle, AlertTriangle, TrendingUp, Edit3, Heart, MessageSquare, Target } from 'lucide-react'
import { useCurrentStrategy } from '@/app/hooks/use-strategy'
import { useAction, useMutation } from 'convex/react'
import { api } from '/home/Rassell/chartilyze/chartilyze-backend/convex/_generated/api'
import { toast } from 'sonner'

// Types
interface AddTradeModalProps {
  onClose: () => void
}

type TradeType = 'LONG' | 'SHORT'
type ModalStep = 'upload' | 'processing' | 'review' | 'confirm'
type EmotionalState = 'confident' | 'nervous' | 'excited' | 'cautious' | 'frustrated' | 'calm'

interface AIAnalysisResult {
  symbol: string | null
  type: TradeType | null
  riskReward: number | null
  confidence: number
  reasoning: string
  timeframe: string | null
  extractedData: {
    hasSymbol: boolean
    hasRiskReward: boolean
    hasTimeframe: boolean
    hasDirection: boolean
  }
  strategyMatch?: {
    matchedComponents: string[]
    suggestedRules: string[]
    matchConfidence: number
  }
}

interface TradeData {
  symbol: string
  type: TradeType
  riskReward: number
  riskAmount: number
  timeframe: string
  selectedComponents: string[]
  followedRules: string[]
  emotionalState: EmotionalState
  notes: string
  imageUrl?: string
}

const INITIAL_TRADE_DATA: TradeData = {
  symbol: '',
  type: 'LONG',
  riskReward: 2.0, // Default 1:2 RR
  riskAmount: 100,
  timeframe: '1h',
  selectedComponents: [],
  followedRules: [],
  emotionalState: 'confident',
  notes: '',
  imageUrl: ''
}

const EMOTIONAL_STATES: { value: EmotionalState; label: string; color: string }[] = [
  { value: 'confident', label: 'Confident', color: 'text-green-400' },
  { value: 'nervous', label: 'Nervous', color: 'text-yellow-400' },
  { value: 'excited', label: 'Excited', color: 'text-blue-400' },
  { value: 'cautious', label: 'Cautious', color: 'text-orange-400' },
  { value: 'frustrated', label: 'Frustrated', color: 'text-red-400' },
  { value: 'calm', label: 'Calm', color: 'text-purple-400' }
]

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']
const COMMON_RR_RATIOS = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0]

// DeepSeek AI Analysis Function (Updated for RR focus)
const analyzeImageWithDeepSeek = async (imageFile: File, currentStrategy: any): Promise<AIAnalysisResult> => {
  const base64Image = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(imageFile)
  })

  const strategyContext = currentStrategy ? `
Current Strategy Context:
- Name: ${currentStrategy.name}
- Rules: ${currentStrategy.rules?.join(', ')}
- Components: ${currentStrategy.components?.map((c: any) => c.name).join(', ')}
- Risk Profile: ${currentStrategy.riskProfile}
` : ''

  const prompt = `Analyze this trading chart image and extract the following information:

1. Symbol/Currency Pair
2. Trade Direction (LONG/SHORT)
3. Risk-Reward Ratio (focus on this - calculate from visible levels)
4. Timeframe (if visible)
5. Trading setup reasoning

${strategyContext}

Focus primarily on identifying the Risk-Reward ratio rather than specific price levels.
If you can see entry, stop loss, and take profit levels, calculate the RR ratio.

Respond in JSON format:
{
  "symbol": "string|null",
  "type": "LONG|SHORT|null",
  "riskReward": "number|null",
  "timeframe": "string|null",
  "confidence": "number",
  "reasoning": "string",
  "extractedData": {
    "hasSymbol": "boolean",
    "hasRiskReward": "boolean",
    "hasTimeframe": "boolean",
    "hasDirection": "boolean"
  },
  "strategyMatch": {
    "matchedComponents": ["string"],
    "suggestedRules": ["string"],
    "matchConfidence": "number"
  }
}`

  try {
    const response = await fetch('/api/analyze-trade-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, prompt })
    })

    if (!response.ok) throw new Error('Analysis failed')
    return await response.json()
  } catch (error) {
    console.error('DeepSeek analysis failed:', error)
    // Return fallback analysis
    return {
      symbol: null,
      type: null,
      riskReward: null,
      confidence: 0,
      reasoning: 'Failed to analyze image automatically. Please enter details manually.',
      timeframe: null,
      extractedData: {
        hasSymbol: false,
        hasRiskReward: false,
        hasTimeframe: false,
        hasDirection: false
      }
    }
  }
}

export function AddTradeModal({ onClose }: AddTradeModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('upload')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [tradeData, setTradeData] = useState<TradeData>(INITIAL_TRADE_DATA)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set())

  const { currentStrategy } = useCurrentStrategy()
  const createTrade = useMutation(api.trades.create)

  // Auto-populate strategy data when component mounts
  useEffect(() => {
    if (currentStrategy) {
      setTradeData(prev => ({
        ...prev,
        selectedComponents: currentStrategy.components?.map((c: any) => c.id) || [],
        followedRules: currentStrategy.rules || []
      }))
    }
  }, [currentStrategy])

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }, [])

  const handleProcessImage = async () => {
    if (!selectedImage) return
    
    setIsProcessing(true)
    setCurrentStep('processing')
    
    try {
      const analysis = await analyzeImageWithDeepSeek(selectedImage, currentStrategy)
      setAiAnalysis(analysis)
      
      // Update trade data with AI analysis (with null checks)
      setTradeData(prev => ({
        ...prev,
        symbol: analysis.symbol || prev.symbol,
        type: analysis.type || prev.type,
        riskReward: analysis.riskReward || prev.riskReward,
        timeframe: analysis.timeframe || prev.timeframe,
        notes: analysis.reasoning,
        selectedComponents: analysis.strategyMatch?.matchedComponents || prev.selectedComponents,
        followedRules: analysis.strategyMatch?.suggestedRules || prev.followedRules
      }))
      
      // Mark fields that need user input
      const fieldsToEdit = new Set<string>()
      if (!analysis.extractedData.hasSymbol) fieldsToEdit.add('symbol')
      if (!analysis.extractedData.hasRiskReward) fieldsToEdit.add('riskReward')
      if (!analysis.extractedData.hasTimeframe) fieldsToEdit.add('timeframe')
      if (!analysis.extractedData.hasDirection) fieldsToEdit.add('type')
      setEditableFields(fieldsToEdit)
      
      setCurrentStep('review')
    } catch (error) {
      console.error('Failed to analyze image:', error)
      toast.error('Failed to analyze image. Please try again.')
      setCurrentStep('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitTrade = async () => {
    if (!currentStrategy) {
      toast.error('No active strategy found')
      return
    }

    if (!tradeData.symbol || !tradeData.riskReward) {
      toast.error('Please provide symbol and risk-reward ratio')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Calculate dummy prices based on RR ratio for backend compatibility
      const dummyEntry = 100 // Base price
      const riskDistance = 10 // Risk distance
      const rewardDistance = riskDistance * tradeData.riskReward
      
      const entry = dummyEntry
      const stopLoss = tradeData.type === 'LONG' ? entry - riskDistance : entry + riskDistance
      const takeProfit = tradeData.type === 'LONG' ? entry + rewardDistance : entry - rewardDistance
      
      await createTrade({
        journalId: currentStrategy.journalId,
        symbol: tradeData.symbol,
        entry,
        stopLoss,
        takeProfit,
        notes: tradeData.notes,
        screenshots: imagePreview ? [imagePreview] : [],
        metadata: {
          timeframe: tradeData.timeframe,
          setup: aiAnalysis?.reasoning || 'RR-focused trade entry',
          tags: [
            tradeData.type,
            tradeData.emotionalState,
            `RR_${tradeData.riskReward}`,
            ...tradeData.selectedComponents,
            ...tradeData.followedRules
          ]
        }
      })
      
      toast.success('Trade added successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to create trade:', error)
      toast.error('Failed to create trade')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Upload Trade Screenshot</h2>
        <p className="text-gray-400">AI will analyze your chart and extract Risk-Reward ratio</p>
      </div>

      {imagePreview ? (
        <div className="relative">
          <img src={imagePreview} alt="Trade preview" className="w-full h-64 object-cover rounded-lg" />
          <button
            onClick={() => {
              setSelectedImage(null)
              setImagePreview('')
            }}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Drag and drop or click to upload</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
          >
            Choose Image
          </label>
        </div>
      )}

      {selectedImage && (
        <button
          onClick={handleProcessImage}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Analyze with AI
        </button>
      )}
    </div>
  )

  const renderProcessingStep = () => (
    <div className="text-center py-12">
      <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
      <h2 className="text-lg font-semibold text-white mb-2">Analyzing Chart...</h2>
      <p className="text-gray-400">AI is extracting trade information and Risk-Reward ratio</p>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="h-5 w-5 text-green-400" />
        <h2 className="text-lg font-semibold text-white">Review & Confirm Trade</h2>
      </div>

      {aiAnalysis && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-white mb-2">AI Analysis</h3>
          <p className="text-gray-300 text-sm mb-2">{aiAnalysis.reasoning}</p>
          <div className="text-xs text-gray-400">
            Confidence: {Math.round(aiAnalysis.confidence * 100)}%
          </div>
        </div>
      )}

      {/* Symbol */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Symbol {editableFields.has('symbol') && <span className="text-yellow-400">(Requires input)</span>}
        </label>
        <input
          type="text"
          value={tradeData.symbol}
          onChange={(e) => setTradeData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g., EURUSD, BTCUSD"
        />
      </div>

      {/* Trade Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Direction {editableFields.has('type') && <span className="text-yellow-400">(Requires input)</span>}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['LONG', 'SHORT'] as TradeType[]).map(type => (
            <button
              key={type}
              onClick={() => setTradeData(prev => ({ ...prev, type }))}
              className={`p-3 rounded-lg border transition-colors ${
                tradeData.type === type
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Risk-Reward Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <TrendingUp className="inline h-4 w-4 mr-1" />
          Risk-Reward Ratio {editableFields.has('riskReward') && <span className="text-yellow-400">(Requires input)</span>}
        </label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {COMMON_RR_RATIOS.map(ratio => (
            <button
              key={ratio}
              onClick={() => setTradeData(prev => ({ ...prev, riskReward: ratio }))}
              className={`p-2 rounded-lg border text-sm transition-colors ${
                tradeData.riskReward === ratio
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              1:{ratio}
            </button>
          ))}
        </div>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={tradeData.riskReward}
          onChange={(e) => setTradeData(prev => ({ ...prev, riskReward: parseFloat(e.target.value) || 0 }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          placeholder="Custom RR ratio"
        />
      </div>

      {/* Timeframe */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Timeframe {editableFields.has('timeframe') && <span className="text-yellow-400">(Requires input)</span>}
        </label>
        <select
          value={tradeData.timeframe}
          onChange={(e) => setTradeData(prev => ({ ...prev, timeframe: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
        >
          {TIMEFRAMES.map(tf => (
            <option key={tf} value={tf}>{tf}</option>
          ))}
        </select>
      </div>

      {/* Risk Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Risk Amount ($)
        </label>
        <input
          type="number"
          value={tradeData.riskAmount}
          onChange={(e) => setTradeData(prev => ({ ...prev, riskAmount: parseFloat(e.target.value) || 0 }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          placeholder="Amount you're risking"
        />
      </div>

      {/* Emotional State */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Heart className="inline h-4 w-4 mr-1" />
          Emotional State
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EMOTIONAL_STATES.map(state => (
            <button
              key={state.value}
              onClick={() => setTradeData(prev => ({ ...prev, emotionalState: state.value }))}
              className={`p-2 rounded-lg border text-sm transition-colors ${
                tradeData.emotionalState === state.value
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              {state.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <MessageSquare className="inline h-4 w-4 mr-1" />
          Additional Notes (Optional)
        </label>
        <textarea
          value={tradeData.notes}
          onChange={(e) => setTradeData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
          rows={3}
          placeholder="Add any additional thoughts, observations, or context about this trade..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setCurrentStep('upload')}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmitTrade}
          disabled={isSubmitting || !tradeData.symbol || !tradeData.riskReward}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding Trade...' : 'Add Trade'}
        </button>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return renderUploadStep()
      case 'processing':
        return renderProcessingStep()
      case 'review':
        return renderReviewStep()
      default:
        return renderUploadStep()
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h1 className="text-xl font-semibold text-white">Add New Trade (RR-Focused)</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {renderCurrentStep()}
        </div>
      </div>
    </div>,
    document.body
  )
}