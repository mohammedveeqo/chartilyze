'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Camera, X, Upload, Wand2, CheckCircle, AlertTriangle, TrendingUp, Edit3, Heart, MessageSquare, Target } from 'lucide-react'
import { useCurrentStrategy } from '@/app/hooks/use-strategy'
import { useAction, useMutation } from 'convex/react'
import { api } from '/home/Rassell/chartilyze/chartilyze-backend/convex/_generated/api'
import { toast } from 'sonner'

async function compressImage(base64String: string, maxSizeKB: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64String}`;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      const maxDimension = 1024; // Maximum dimension
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

      // Start with high quality
      let quality = 0.7; // Reduced initial quality
      let output = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until file size is under maxSizeKB
      while (output.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1;
        output = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(output.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };

    img.onerror = () => reject(new Error('Failed to load image'));
  });
}


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

const analyzeImageWithDeepSeek = async (
  imageFile: File,
  currentStrategy: any,
  analyzeTradeImageAction: any,
  testMistralOCRAction: any
): Promise<AIAnalysisResult> => {
  try {
    console.log('🔍 Starting image analysis with Mistral OCR + DeepSeek...');
    
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

    // Step 1: Extract text using Mistral OCR
    const ocrResult = await testMistralOCRAction({ 
      imageBase64: base64
    });
    
    console.log('🔍 Mistral OCR Result:', ocrResult);
    console.log('📝 Extracted Text:', ocrResult.extractedText);
    
    // Step 2: Use extracted text to inform DeepSeek analysis
    const strategyContext = currentStrategy ? `
Active Strategy: ${currentStrategy.name}
Strategy Components: ${currentStrategy.components?.map((c: any) => c.name).join(', ') || 'None'}
Strategy Rules: ${currentStrategy.rules?.join(', ') || 'None'}` : '';
    
    const enhancedPrompt = `Based on the following extracted text from a trading chart, analyze and identify the trade information:

EXTRACTED TEXT FROM CHART:
${ocrResult.extractedText}

${strategyContext}

Please identify from the extracted text:
1. Trading symbol/pair (look for currency pairs like GBP/USD, EUR/USD, etc.)
2. Trade direction (LONG/SHORT) 
3. Risk/reward ratio (if mentioned)
4. Timeframe (look for 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, etc.)
5. How this trade relates to the active strategy

Respond in JSON format:
{
  "symbol": "extracted symbol or null",
  "type": "LONG or SHORT or null", 
  "riskReward": "number or null",
  "timeframe": "timeframe or null",
  "confidence": 0.85,
  "reasoning": "detailed analysis based on extracted text",
  "extractedData": {
    "hasSymbol": true/false,
    "hasRiskReward": true/false, 
    "hasTimeframe": true/false,
    "hasDirection": true/false
  },
  "strategyMatch": {
    "matchedComponents": ["component names that match"],
    "suggestedRules": ["relevant strategy rules"],
    "matchConfidence": 0.8
  }
}`;

    // Step 3: Get DeepSeek analysis based on OCR text
    const deepSeekResult = await analyzeTradeImageAction({
      imageBase64: base64,
      prompt: enhancedPrompt
    });
    
    console.log('🤖 DeepSeek Result:', deepSeekResult);
    
    // Step 4: Combine results and create comprehensive notes
    let combinedNotes = deepSeekResult.reasoning || '';
    
    // Add Mistral OCR data to notes
    if (ocrResult.extractedText) {
      combinedNotes += `\n\n--- Extracted Chart Data ---\n${ocrResult.extractedText}`;
    }
    
    // Add strategy analysis to notes
    if (currentStrategy && deepSeekResult.strategyMatch) {
      combinedNotes += `\n\n--- Strategy Analysis ---\nStrategy: ${currentStrategy.name}`;
      if (deepSeekResult.strategyMatch.matchedComponents?.length > 0) {
        combinedNotes += `\nMatched Components: ${deepSeekResult.strategyMatch.matchedComponents.join(', ')}`;
      }
      if (deepSeekResult.strategyMatch.suggestedRules?.length > 0) {
        combinedNotes += `\nRelevant Rules: ${deepSeekResult.strategyMatch.suggestedRules.join(', ')}`;
      }
    }

    return {
      symbol: deepSeekResult.symbol,
      type: deepSeekResult.type,
      riskReward: deepSeekResult.riskReward,
      confidence: deepSeekResult.confidence || 0.85,
      reasoning: combinedNotes,
      timeframe: deepSeekResult.timeframe,
      extractedData: {
        hasSymbol: !!deepSeekResult.symbol,
        hasRiskReward: !!deepSeekResult.riskReward,
        hasTimeframe: !!deepSeekResult.timeframe,
        hasDirection: !!deepSeekResult.type
      },
      strategyMatch: deepSeekResult.strategyMatch
    };
  } catch (error) {
    console.error('❌ Error in image analysis:', error);
    return {
      symbol: null,
      type: null,
      riskReward: null,
      confidence: 0.3,
      reasoning: 'Analysis failed - please try again',
      timeframe: null,
      extractedData: {
        hasSymbol: false,
        hasRiskReward: false,
        hasTimeframe: false,
        hasDirection: false
      }
    };
  }
};

export function AddTradeModal({ onClose }: AddTradeModalProps) {
  // Add both action imports
  const analyzeTradeImageAction = useAction(api.aiStrategy.analyzeTradeImage);
  const testMistralOCRAction = useAction(api.aiStrategy.testMistralOCR);
  
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
  }, [currentStrategy?.id]) // Add dependency to prevent infinite loop

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
    // Wherever you call analyzeImageWithDeepSeek, update it to:
    const analysis = await analyzeImageWithDeepSeek(
      selectedImage,
      currentStrategy,
      analyzeTradeImageAction,
      testMistralOCRAction  // Add this parameter
    );
    setAiAnalysis(analysis)
    
    // Update trade data with AI analysis
    setTradeData(prev => ({
      ...prev,
      symbol: analysis.symbol || prev.symbol,
      type: analysis.type || prev.type,
      riskReward: analysis.riskReward || prev.riskReward,
      timeframe: analysis.timeframe || prev.timeframe,
      notes: analysis.reasoning || prev.notes,
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
    <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] my-8"> {/* Added my-8 and max-h-[90vh] */}
      {/* Header - fixed */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <h1 className="text-xl font-semibold text-white">Add New Trade</h1>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Content - scrollable */}
      <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}> {/* Adjusted for header height + margins */}
        {renderCurrentStep()}
      </div>
    </div>
  </div>,
  document.body
)
}
