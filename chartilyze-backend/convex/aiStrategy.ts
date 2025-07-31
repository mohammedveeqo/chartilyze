import { action } from "./_generated/server";
import { v } from "convex/values";

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

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

// Replace with:
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const parseStrategy = action({
  args: {
    description: v.string(),
    complexity: v.optional(v.string()),
    enhancedParsing: v.optional(v.boolean()),
  },
  handler: async (ctx, { description, complexity = 'basic', enhancedParsing = false }): Promise<ParsedAdvancedStrategy> => {
    // Get the API key from Convex environment
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      console.error('❌ DEEPSEEK_API_KEY not found in environment variables');
      throw new Error('DEEPSEEK_API_KEY not configured');
    }
    
    const isAdvanced = complexity === 'advanced' || enhancedParsing;
    
    console.log('🔥 DeepSeek API Call Started');
    console.log('📝 Input description length:', description.length);
    console.log('⚙️ Complexity:', complexity);
    console.log('🚀 Enhanced parsing:', enhancedParsing);
    console.log('🎯 Is advanced:', isAdvanced);
    
    const enhancedPrompt = `
Analyze this trading strategy description and extract detailed structured information with enhanced component recognition:

"${description}"

For ENHANCED ADVANCED analysis, break down the strategy into detailed components with special attention to:

1. **Multi-timeframe strategies** (Monthly, Weekly, Daily, 4h, 1h)
2. **Level marking systems** (OCL, STFL, TTFL, key levels)
3. **Entry construction models** (14B, D1W4, confirmation entries)
4. **Risk management protocols** (position sizing, stop loss rules)
5. **Session-based trading** (London, New York, Asian sessions)
6. **Market condition filters** (trending, ranging, volatile)

Component types to recognize:
- 'entry': Entry signals and conditions
- 'exit': Exit strategies and profit targets
- 'risk_management': Stop loss and risk rules
- 'position_sizing': Position size calculations
- 'market_condition': Market filters and conditions
- 'level_marking': Key level identification (OCL, STFL, TTFL)
- 'confirmation': Confirmation patterns and signals

For each component, provide:
- id: unique identifier
- type: component type from above
- name: Short descriptive name (e.g., "Mark Key Levels", "OCL Identification")
- description: detailed description
- tags: Comprehensive tags including:
  * Component-specific tags (e.g., "OCL", "STFL", "TTFL" for level marking)
  * Timeframe tags (e.g., "timeframe:monthly", "timeframe:1h")
  * Condition tags (e.g., "condition:breakout", "condition:rejection")
  * Signal tags (e.g., "signal:bullish", "signal:bearish")
- indicators: Technical indicators with conditions
- timeframes: Relevant timeframes for this component
- conditions: Specific conditions or rules
- confidence: 0-1 score
- priority: 'high' | 'medium' | 'low'

Global tags should include:
- "strategy-type:multi-timeframe/breakout/reversal/scalping"
- "complexity:simple/intermediate/advanced"
- "session:london/new-york/asian"
- "automation:manual/semi-auto/fully-auto"
- "risk-level:low/medium/high"
- "timeframe-analysis:single/multi"
- "level-system:ocl-stfl-ttfl/support-resistance/fibonacci"

Example enhanced response for multi-timeframe strategy:
{
  "components": [
    {
      "id": "storyline-1",
      "type": "market_condition",
      "name": "Identify Storyline (Trend Bias)",
      "description": "Determine market bias using Monthly rejection + Weekly breakout patterns",
      "tags": [
        "storyline", "trend-bias", "monthly-rejection", "weekly-breakout",
        "timeframe:monthly", "timeframe:weekly", "bias:bullish", "bias:bearish"
      ],
      "timeframes": ["Monthly", "Weekly"],
      "conditions": [
        "Monthly rejection + Weekly breakout = Monthly turns bearish",
        "Monthly rejection + Weekly breakout = Monthly turns bullish"
      ],
      "confidence": 0.9,
      "priority": "high"
    },
    {
      "id": "levels-1",
      "type": "level_marking",
      "name": "Mark Key Levels",
      "description": "Identify and mark OCL, STFL, and TTFL levels for entry construction",
      "tags": [
        "OCL", "STFL", "TTFL", "key-levels", "origin-candle",
        "second-timeframe-level", "third-timeframe-level", "level-marking"
      ],
      "conditions": [
        "OCL - Origin Candle Level (rejection candle + adjacent wick)",
        "STFL - Second Timeframe Level (key level inside OCL; must be fresh)",
        "TTFL - Third Timeframe Level (refinement inside STFL)"
      ],
      "confidence": 0.95,
      "priority": "high"
    }
  ],
  "globalTags": [
    "strategy-type:multi-timeframe",
    "complexity:advanced",
    "level-system:ocl-stfl-ttfl",
    "timeframe-analysis:multi",
    "automation:manual",
    "risk-level:medium"
  ],
  "suggestedName": "Multi-Timeframe OCL/STFL/TTFL Strategy",
  "complexity": "advanced",
  "riskProfile": "moderate",
  "sessionTimes": ["london", "new-york"],
  "marketConditions": ["trending", "breakout"],
  "automationLevel": "manual"
}

Respond only with valid JSON, no additional text.`;

    console.log('📤 Sending request to DeepSeek API...');
    console.log('🔗 API URL:', DEEPSEEK_API_URL);
    console.log('🔑 API Key present:', !!DEEPSEEK_API_KEY);
    
    try {
      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: isAdvanced ? 4000 : 2000
      };
      
      console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DeepSeek API error response:', errorText);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as DeepSeekResponse;
      console.log('📦 Raw DeepSeek response:', JSON.stringify(data, null, 2));
      
      const content = data.choices[0]?.message?.content;
      console.log('📄 Content from DeepSeek:', content);
      
      if (!content) {
        console.error('❌ No content received from DeepSeek API');
        throw new Error('No content received from DeepSeek API');
      }

      console.log('🔍 Attempting to parse JSON content...');
      
      // Strip markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        console.log('🧹 Stripped markdown wrapper from content');
      }
      
      const parsed = JSON.parse(cleanContent);
      console.log('✅ Successfully parsed JSON:', JSON.stringify(parsed, null, 2));
      
      if (isAdvanced) {
        const result = {
          components: parsed.components || [],
          globalTags: parsed.globalTags || [],
          suggestedName: parsed.suggestedName || 'Advanced Strategy',
          complexity: parsed.complexity || 'intermediate',
          riskProfile: parsed.riskProfile || 'moderate'
        };
        console.log('🎯 Returning advanced result:', JSON.stringify(result, null, 2));
        return result;
      } else {
        // Convert basic format to advanced format for compatibility
        const components = (parsed.structuredRules || []).map((rule: any, index: number) => ({
          id: `component-${index + 1}`,
          type: 'entry' as const,
          name: rule.pattern || rule.context || 'Trading rule',
          description: rule.pattern || rule.context || 'Trading rule',
          confidence: rule.confidence || 0.7,
          priority: 'medium' as const,
          tags: [`rule-${index + 1}`, ...(rule.tags || [])]
        }));
        
        const result = {
          components,
          globalTags: parsed.tags || [],
          suggestedName: parsed.suggestedName || 'Custom Strategy',
          complexity: 'simple' as const,
          riskProfile: 'moderate' as const
        };
        console.log('🎯 Returning basic result:', JSON.stringify(result, null, 2));
        return result;
      }
      
    } catch (error) {
      console.error('💥 Error in DeepSeek API call:', error);
      console.error('🔍 Error type:', typeof error);
      console.error('🔍 Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Enhanced fallback
      const fallbackResult = {
        components: [{
          id: 'fallback-1',
          type: 'entry' as const,
          name: 'Manual strategy component',
          description: 'Manual strategy component',
          confidence: 0.5,
          priority: 'medium' as const,
          tags: ['manual', 'fallback']
        }],
        globalTags: ['strategy-type:manual', 'source:fallback'],
        suggestedName: 'Custom Strategy',
        complexity: 'simple' as const,
        riskProfile: 'moderate' as const
      };
      
      console.log('🆘 Returning fallback result:', JSON.stringify(fallbackResult, null, 2));
      return fallbackResult;
    }
  },
});