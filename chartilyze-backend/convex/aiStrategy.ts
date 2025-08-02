import { action } from "./_generated/server";
import { v } from "convex/values";

// API Response Types
interface DeepSeekMessage {
  role: string;
  content: string;
}

interface DeepSeekChoice {
  index: number;
  message: DeepSeekMessage;
  finish_reason: string;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Strategy Types
interface DetailedStrategyComponent {
  id: string;
  type: 'entry' | 'exit' | 'risk_management' | 'position_sizing' | 'market_condition' | 'level_marking' | 'confirmation';
  name: string;
  description: string;
  indicators?: Array<{
    name: string;
    condition: string;
    value: string;
    timeframe?: string;
  }>;
  patterns?: string[];
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  timeframes?: string[];
  conditions?: string[];
}

interface ParsedAdvancedStrategy {
  components: DetailedStrategyComponent[];
  globalTags: string[];
  suggestedName: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

interface TradeAnalysis {
  symbol: string | null;
  type: 'LONG' | 'SHORT' | null;
  riskReward: number | null;
  confidence: number;
  reasoning: string;
  timeframe: string | null;
  extractedData: {
    hasSymbol: boolean;
    hasRiskReward: boolean;
    hasTimeframe: boolean;
    hasDirection: boolean;
  };
  strategyMatch?: {
    matchedComponents: string[];
    suggestedRules: string[];
    matchConfidence: number;
  };
}

// Type Guards and Utilities
function isDeepSeekResponse(data: unknown): data is DeepSeekResponse {
  if (!data || typeof data !== 'object') return false;
  
  const response = data as DeepSeekResponse;
  return Array.isArray(response.choices) &&
         response.choices.length > 0 &&
         typeof response.choices[0]?.message?.content === 'string';
}

function generateStrategyPrompt(description: string): string {
  return `
Analyze this trading strategy description and extract detailed structured information:

"${description}"

Provide a detailed analysis with the following components:

1. Entry Rules
2. Exit Rules
3. Risk Management
4. Position Sizing
5. Market Conditions
6. Technical Indicators
7. Time Frames
8. Confirmation Signals

Format the response as a JSON object with the following structure:
{
  "components": [
    {
      "id": "unique-id",
      "type": "component-type",
      "name": "component-name",
      "description": "detailed-description",
      "indicators": [
        {
          "name": "indicator-name",
          "condition": "condition-description",
          "value": "value-setting",
          "timeframe": "timeframe-setting"
        }
      ],
      "patterns": ["pattern1", "pattern2"],
      "confidence": 0.95,
      "priority": "high/medium/low",
      "tags": ["tag1", "tag2"],
      "timeframes": ["timeframe1", "timeframe2"],
      "conditions": ["condition1", "condition2"]
    }
  ],
  "globalTags": ["tag1", "tag2"],
  "suggestedName": "strategy-name",
  "complexity": "simple/intermediate/advanced",
  "riskProfile": "conservative/moderate/aggressive"
}

Respond only with valid JSON, no additional text.`;
}

// Main Actions
export const parseStrategy = action({
  args: {
    description: v.string(),
    complexity: v.optional(v.string()),
    enhancedParsing: v.optional(v.boolean()),
  },
  handler: async (ctx, { description, complexity = 'basic', enhancedParsing = false }): Promise<ParsedAdvancedStrategy> => {
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    if (!DEEPSEEK_API_KEY) {
      console.error('❌ DEEPSEEK_API_KEY not found in environment variables');
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    console.log('🔥 Starting strategy analysis');
    
    try {
      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: generateStrategyPrompt(description)
          }
        ],
        temperature: 0.1,
        max_tokens: enhancedParsing ? 4000 : 2000
      };

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DeepSeek API error response:', errorText);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const rawData: unknown = await response.json();
      
      if (!isDeepSeekResponse(rawData)) {
        throw new Error('Invalid response format from DeepSeek API');
      }

      const data: DeepSeekResponse = rawData;
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from DeepSeek API');
      }

      // Clean and parse the content
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }

      const parsedStrategy = JSON.parse(cleanContent) as ParsedAdvancedStrategy;

      return {
        components: parsedStrategy.components || [],
        globalTags: parsedStrategy.globalTags || [],
        suggestedName: parsedStrategy.suggestedName || 'Custom Strategy',
        complexity: parsedStrategy.complexity || 'intermediate',
        riskProfile: parsedStrategy.riskProfile || 'moderate'
      };

    } catch (error) {
      console.error('💥 Strategy parsing error:', error);
      
      return {
        components: [{
          id: 'fallback-1',
          type: 'entry',
          name: 'Basic Entry Rule',
          description: 'Default entry rule due to parsing error',
          confidence: 0.5,
          priority: 'medium',
          tags: ['fallback', 'basic']
        }],
        globalTags: ['fallback'],
        suggestedName: 'Basic Strategy',
        complexity: 'simple',
        riskProfile: 'conservative'
      };
    }
  },
});

export const analyzeTradeImage = action({
  args: {
    imageBase64: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { imageBase64, prompt }): Promise<TradeAnalysis> => {
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

    if (!DEEPSEEK_API_KEY) {
      console.error('❌ DEEPSEEK_API_KEY not found in environment variables');
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    console.log('🔥 Starting trade image analysis');

    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Updated prompt to focus on specific details
const specificPrompt = `You are a trading chart analyst. 
Looking at this trading chart, please examine the top left corner and header area for the trading pair and timeframe information.

The chart appears to be from TradingView platform. Please provide:

1. Trading Symbol/Pair: Look at the top left corner for the currency pair (e.g., GBPUSD, EURUSD)
2. Timeframe: Look for timeframe indicators (1m, 5m, 15m, 1h, 4h, 1D, etc.)
3. Current Market Direction: Based on recent price action, is this a potential LONG or SHORT setup?
4. Risk/Reward Setup: If you can see any clear support/resistance levels, what's the potential risk/reward ratio?

Please respond in this exact JSON format:
{
  "symbol": "the trading pair from the top left",
  "timeframe": "the chart timeframe shown",
  "type": "LONG or SHORT",
  "riskReward": number or null if unclear,
  "confidence": number between 0 and 1,
  "reasoning": "brief explanation of your analysis"
}`;

const requestBody = {
  model: 'deepseek-chat',
  messages: [
    {
      role: 'system',
      content: 'You are a professional trading chart analyst. Pay special attention to text in the top left corner of TradingView charts, which always shows the trading pair and timeframe.'
    },
    {
      role: 'user',
      content: `This is a TradingView chart. The trading pair and timeframe are shown in the top left corner.

<image>${cleanBase64}</image>

${specificPrompt}`
    }
  ],
  temperature: 0.3,
  max_tokens: 1000
};

      console.log('📦 Request structure:', {
        model: requestBody.model,
        messageCount: requestBody.messages.length,
        temperature: requestBody.temperature,
        max_tokens: requestBody.max_tokens,
        promptLength: specificPrompt.length
      });

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DeepSeek API error response:', errorText);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const rawData: unknown = await response.json();
      console.log('📥 Raw API response:', rawData);
      
      if (!isDeepSeekResponse(rawData)) {
        throw new Error('Invalid response format from DeepSeek API');
      }

      const data: DeepSeekResponse = rawData;
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from DeepSeek API');
      }

      console.log('✨ Raw content:', content);

      // Try to extract JSON from the response
      try {
        // Find JSON object in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const parsedContent = JSON.parse(jsonMatch[0]) as TradeAnalysis;
        
        // Validate and clean up the response
        return {
          symbol: parsedContent.symbol || null,
          type: (parsedContent.type === 'LONG' || parsedContent.type === 'SHORT') ? parsedContent.type : null,
          riskReward: typeof parsedContent.riskReward === 'number' ? parsedContent.riskReward : null,
          confidence: typeof parsedContent.confidence === 'number' ? 
            Math.max(0, Math.min(1, parsedContent.confidence)) : 0.5,
          reasoning: parsedContent.reasoning || 'No explanation provided',
          timeframe: parsedContent.timeframe || null,
          extractedData: {
            hasSymbol: Boolean(parsedContent.symbol),
            hasRiskReward: Boolean(parsedContent.riskReward),
            hasTimeframe: Boolean(parsedContent.timeframe),
            hasDirection: Boolean(parsedContent.type)
          }
        };
      } catch (parseError) {
        console.error('💥 Error parsing JSON from response:', parseError);
        throw new Error('Failed to parse structured response');
      }

    } catch (error: unknown) {
      console.error('💥 Trade analysis error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';

      return {
        symbol: null,
        type: null,
        riskReward: null,
        confidence: 0.3,
        reasoning: `Analysis failed - ${errorMessage}`,
        timeframe: null,
        extractedData: {
          hasSymbol: false,
          hasRiskReward: false,
          hasTimeframe: false,
          hasDirection: false
        }
      };
    }
  },
});