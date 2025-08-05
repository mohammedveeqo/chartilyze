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

interface AIAnalysis {
  symbol: string | null;
  timeframe: string | null;
  confidence: number;
  reasoning: string;
  extractedData: {
    hasSymbol: boolean;
    hasTimeframe: boolean;
    hasDirection: boolean;
  };
  strategyMatch?: {
    matchedComponents: string[];
    applicableRules: string[];
    analysis: string;
    suggestions: string[];
  };
}

type TradeType = 'LONG' | 'SHORT'
type ModalStep = 'upload' | 'processing' | 'review' | 'confirm'
type EmotionalState = 'confident' | 'nervous' | 'excited' | 'cautious' | 'frustrated' | 'calm'

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
  riskReward: 2.0,
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

const TIMEFRAMES = ['1m', '5m', '15m', '30M', '1H', '4H', '1D', '1W']
const COMMON_RR_RATIOS = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0]

// Image compression utility
async function compressImage(base64String: string, maxSizeKB: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64String}`;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const maxDimension = 1024;
      if (width > height && width > maxDimension) {
        height *= maxDimension / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width *= maxDimension / height;
        height = maxDimension;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.7;
      let output = canvas.toDataURL('image/jpeg', quality);
      
      while (output.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1;
        output = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(output.split(',')[1]);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
  });
}

// Main analysis function
const analyzeImageWithDeepSeek = async (
  imageFile: File,
  currentStrategy: any,
  analyzeTradeImageAction: any,
  testMistralOCRAction: any
): Promise<AIAnalysis> => {
  try {
    // Convert image to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        try {
          const compressedBase64 = await compressImage(base64String, 800);
          resolve(compressedBase64);
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError);
          resolve(base64String);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    // First get OCR data from Mistral
    const ocrResult = await testMistralOCRAction({ 
      imageBase64: base64
    });
    
    console.log('🔍 OCR Extracted Text:', ocrResult.extractedText);

    // Extract symbol and timeframe from OCR data
    const symbolMatch = ocrResult.extractedText.match(/Trading Pair\/Symbol.*?([A-Z]{3}\/[A-Z]{3})/);
    const timeframeMatch = ocrResult.extractedText.match(/Timeframe Information.*?(\d+[DHMWYmh])/i);

    const extractedSymbol = symbolMatch ? symbolMatch[1] : null;
    const extractedTimeframe = timeframeMatch ? timeframeMatch[1] : null;

    console.log('📊 Extracted Chart Info:', {
      symbol: extractedSymbol,
      timeframe: extractedTimeframe
    });

    if (!extractedSymbol || !extractedTimeframe) {
      throw new Error('Could not extract symbol or timeframe from chart');
    }

    // Create dynamic prompt based on current strategy and OCR data
    const strategyContext = currentStrategy ? `
Active Strategy: ${currentStrategy.name}
Strategy Components: ${currentStrategy.components?.map((c: any) => c.name).join(', ') || 'None'}
Strategy Rules: ${currentStrategy.rules?.join(', ') || 'None'}` : '';
    
    const enhancedPrompt = `Based on the following extracted text from a trading chart:

EXTRACTED TEXT:
${ocrResult.extractedText}

IMPORTANT - This is a ${extractedSymbol} chart on the ${extractedTimeframe} timeframe.

${strategyContext}

Please analyze how this specific ${extractedSymbol} ${extractedTimeframe} setup relates to the current strategy.
Focus on:
1. Which strategy components are relevant to this setup?
2. Which strategy rules apply here?
3. What actions are suggested based on the strategy?

Respond in JSON format:
{
  "symbol": "${extractedSymbol}",
  "timeframe": "${extractedTimeframe}",
  "strategyMatch": {
    "matchedComponents": ["list of relevant strategy components"],
    "applicableRules": ["relevant rules from the strategy"],
    "analysis": "how this setup fits the strategy",
    "suggestions": ["suggested actions based on strategy rules"]
  }
}`;

    // Get DeepSeek analysis
    const deepSeekResult = await analyzeTradeImageAction({
      imageBase64: base64,
      prompt: enhancedPrompt
    });

    console.log('🤖 DeepSeek Analysis:', deepSeekResult);

    // Ensure we use the correct symbol and timeframe from OCR
    return {
      symbol: extractedSymbol,
      timeframe: extractedTimeframe,
      confidence: deepSeekResult.confidence || 0.5,
      reasoning: `
Analysis based on ${extractedSymbol} ${extractedTimeframe} chart:
${deepSeekResult.strategyMatch?.analysis || ''}

Matched Components:
${deepSeekResult.strategyMatch?.matchedComponents?.join(', ') || 'None'}

Applicable Rules:
${deepSeekResult.strategyMatch?.applicableRules?.join(', ') || 'None'}

Suggestions:
${deepSeekResult.strategyMatch?.suggestions?.join('\n') || 'None'}

Raw Chart Data:
${ocrResult.extractedText}
      `,
      extractedData: {
        hasSymbol: true,  // We got these from OCR
        hasTimeframe: true,
        hasDirection: !!deepSeekResult.strategyMatch?.suggestions?.length
      },
      strategyMatch: {
        matchedComponents: deepSeekResult.strategyMatch?.matchedComponents || [],
        applicableRules: deepSeekResult.strategyMatch?.applicableRules || [],
        analysis: deepSeekResult.strategyMatch?.analysis || '',
        suggestions: deepSeekResult.strategyMatch?.suggestions || []
      }
    };

  } catch (error) {
    console.error('Analysis failed:', error);
    return {
      symbol: null,
      timeframe: null,
      confidence: 0,
      reasoning: 'Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      extractedData: {
        hasSymbol: false,
        hasTimeframe: false,
        hasDirection: false
      }
    };
  }
};

// Main component
export function AddTradeModal({ onClose }: AddTradeModalProps) {
  const analyzeTradeImageAction = useAction(api.aiStrategy.analyzeTradeImage);
  const testMistralOCRAction = useAction(api.aiStrategy.testMistralOCR);
  
  const [currentStep, setCurrentStep] = useState<ModalStep>('upload')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [tradeData, setTradeData] = useState<TradeData>(INITIAL_TRADE_DATA)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set())

  const { currentStrategy } = useCurrentStrategy()
  const createTrade = useMutation(api.trades.create)

  // Auto-populate strategy data
  useEffect(() => {
    if (currentStrategy) {
      setTradeData(prev => ({
        ...prev,
        selectedComponents: currentStrategy.components?.map((c: any) => c.id) || [],
        followedRules: currentStrategy.rules || []
      }))
    }
  }, [currentStrategy?.id])

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
      const analysis = await analyzeImageWithDeepSeek(
        selectedImage,
        currentStrategy,
        analyzeTradeImageAction,
        testMistralOCRAction
      );

      setAiAnalysis(analysis)
      
      setTradeData(prev => ({
        ...prev,
        symbol: analysis.symbol || prev.symbol,
        timeframe: analysis.timeframe || prev.timeframe,
        notes: analysis.reasoning || prev.notes,
        selectedComponents: analysis.strategyMatch?.matchedComponents || prev.selectedComponents,
        followedRules: analysis.strategyMatch?.applicableRules || prev.followedRules
      }))
      
      const fieldsToEdit = new Set<string>()
      if (!analysis.extractedData.hasSymbol) fieldsToEdit.add('symbol')
      if (!analysis.extractedData.hasTimeframe) fieldsToEdit.add('timeframe')
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
      const dummyEntry = 100
      const riskDistance = 10
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
          setup: aiAnalysis?.reasoning || 'Strategy-based trade entry',
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
      <p className="text-gray-400">AI will analyze your chart and match it to your strategy</p>
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
    <p className="text-gray-400">AI is analyzing your chart and matching it to your strategy</p>
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
      <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
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
        Risk-Reward Ratio
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
      <label className="block text-sm font-medium text-gray-300 mb-2">Risk Amount ($)</label>
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

    {/* Notes */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        <MessageSquare className="inline h-4 w-4 mr-1" />
        Additional Notes
      </label>
      <textarea
        value={tradeData.notes}
        onChange={(e) => setTradeData(prev => ({ ...prev, notes: e.target.value }))}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
        rows={3}
        placeholder="Add any additional thoughts or context..."
      />
    </div>

    {/* Submit Buttons */}
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
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h1 className="text-xl font-semibold text-white">Add New Trade</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {renderCurrentStep()}
        </div>
      </div>
    </div>,
    document.body
  )
}