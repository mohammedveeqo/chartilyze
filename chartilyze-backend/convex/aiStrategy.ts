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

// Mistral API Response Types
interface MistralMessage {
  role: string;
  content: string | Array<{
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

interface MistralChoice {
  index: number;
  message: MistralMessage;
  finish_reason: string;
}

interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: MistralChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

function isMistralResponse(data: unknown): data is MistralResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'choices' in data &&
    Array.isArray((data as any).choices)
  );
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
      
      // First, let's have DeepSeek identify the symbol and timeframe from OCR data
      const initialPrompt = `
From this OCR text of a trading chart, identify the symbol and timeframe:

${prompt}

Focus on the "Top Left Corner" section which contains the trading pair and timeframe information.
Return only a JSON response in this format:
{
  "symbol": "the trading pair (e.g., GBP/USD)",
  "timeframe": "the timeframe (e.g., 1D, 1H)",
  "confidence": number between 0 and 1
}`;

      const initialRequestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a trading chart analyzer. Extract the symbol and timeframe from the OCR data.'
          },
          {
            role: 'user',
            content: initialPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      };

      // Get initial analysis for symbol and timeframe
      const initialResponse = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(initialRequestBody)
      });

      if (!initialResponse.ok) {
        throw new Error(`Initial DeepSeek API error: ${initialResponse.status}`);
      }

      const initialData: unknown = await initialResponse.json();
      
      if (!isDeepSeekResponse(initialData)) {
        throw new Error('Invalid response format from initial DeepSeek API call');
      }

      const initialContent = initialData.choices[0]?.message?.content;
      if (!initialContent) {
        throw new Error('No content received from initial DeepSeek API call');
      }

      interface ChartInfo {
        symbol: string;
        timeframe: string;
        confidence: number;
      }

      const chartInfo = JSON.parse(initialContent) as ChartInfo;

      console.log('📊 DeepSeek Chart Info:', chartInfo);

      if (!chartInfo.symbol || !chartInfo.timeframe) {
        throw new Error('Could not identify symbol or timeframe from chart');
      }

      // Now get the full analysis with the identified symbol and timeframe
      const enhancedPrompt = `
You are analyzing a ${chartInfo.symbol} chart on the ${chartInfo.timeframe} timeframe.

Chart Information from OCR:
${prompt}

Strategy Context:
${prompt.includes('Active Strategy:') ? prompt.split('Active Strategy:')[1] : 'No strategy provided'}

Based on this specific ${chartInfo.symbol} ${chartInfo.timeframe} setup, provide a detailed analysis.

Respond in this exact JSON format:
{
  "symbol": "${chartInfo.symbol}",
  "timeframe": "${chartInfo.timeframe}",
  "type": "LONG or SHORT based on the setup",
  "riskReward": number or null,
  "confidence": number between 0 and 1,
  "reasoning": "detailed analysis of this specific setup",
  "strategyMatch": {
    "matchedComponents": ["list relevant strategy components that apply to this setup"],
    "suggestedRules": ["list strategy rules that are applicable"],
    "matchConfidence": number between 0 and 1
  }
}`;

      const fullAnalysisRequestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are analyzing a ${chartInfo.symbol} ${chartInfo.timeframe} chart. Provide specific analysis for this setup.`
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      };

      const fullAnalysisResponse = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(fullAnalysisRequestBody)
      });

      if (!fullAnalysisResponse.ok) {
        throw new Error(`Full analysis DeepSeek API error: ${fullAnalysisResponse.status}`);
      }

      const fullAnalysisData: unknown = await fullAnalysisResponse.json();
      
      if (!isDeepSeekResponse(fullAnalysisData)) {
        throw new Error('Invalid response format from full analysis DeepSeek API call');
      }

      const fullAnalysisContent = fullAnalysisData.choices[0]?.message?.content;
      if (!fullAnalysisContent) {
        throw new Error('No content received from full analysis DeepSeek API call');
      }

      console.log('✨ Full Analysis:', fullAnalysisContent);

      // Clean the response to remove markdown code blocks if present
      let cleanedContent = fullAnalysisContent;
      if (fullAnalysisContent.includes('```json')) {
        // Extract JSON from markdown code blocks
        const jsonMatch = fullAnalysisContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          cleanedContent = jsonMatch[1].trim();
        }
      } else if (fullAnalysisContent.includes('```')) {
        // Handle generic code blocks
        const codeMatch = fullAnalysisContent.match(/```[\s\S]*?([\s\S]*?)\s*```/);
        if (codeMatch && codeMatch[1]) {
          cleanedContent = codeMatch[1].trim();
        }
      }
      
      const parsedResult = JSON.parse(cleanedContent);

      return {
        symbol: chartInfo.symbol,
        type: parsedResult.type || null,
        riskReward: parsedResult.riskReward || null,
        confidence: chartInfo.confidence || 0.5,
        reasoning: parsedResult.reasoning || 'Analysis completed',
        timeframe: chartInfo.timeframe,
        extractedData: {
          hasSymbol: true,
          hasRiskReward: !!parsedResult.riskReward,
          hasTimeframe: true,
          hasDirection: !!parsedResult.type
        },
        strategyMatch: {
          matchedComponents: parsedResult.strategyMatch?.matchedComponents || [],
          suggestedRules: parsedResult.strategyMatch?.suggestedRules || [],
          matchConfidence: parsedResult.strategyMatch?.matchConfidence || 0.5
        }
      };

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

// Add this new action after the parseStrategy action (around line 232)

export const testMistralOCR = action({
  args: {
    imageBase64: v.string(),
  },
  handler: async (ctx, { imageBase64 }): Promise<{ extractedText: string; rawResponse: string }> => {
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

    if (!MISTRAL_API_KEY) {
      console.error('❌ MISTRAL_API_KEY not found in environment variables');
      throw new Error('MISTRAL_API_KEY not configured');
    }

    console.log('🔍 Testing Mistral OCR extraction');

    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const requestBody = {
        model: 'pixtral-12b-2409',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract ALL visible text from this trading chart image. Focus especially on:\n\n1. Trading pair/symbol (usually in top left corner)\n2. Timeframe information\n3. Price levels and numbers\n4. Any indicators or labels\n5. Menu items or interface text\n\nProvide the extracted text in a clear, organized format. Be thorough and include everything you can read.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${cleanBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      };

      console.log('📦 Mistral request structure:', {
        model: requestBody.model,
        messageCount: requestBody.messages.length,
        temperature: requestBody.temperature,
        max_tokens: requestBody.max_tokens
      });

      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mistral API error response:', errorText);
        throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
      }

      const rawData: unknown = await response.json();
      console.log('📥 Raw Mistral API response:', rawData);
      
      if (!isMistralResponse(rawData)) {
        throw new Error('Invalid response format from Mistral API');
      }

      const data: MistralResponse = rawData;
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from Mistral API');
      }

      const extractedText = typeof content === 'string' ? content : JSON.stringify(content);
      
      console.log('✨ Extracted text from Mistral:', extractedText);

      return {
        extractedText,
        rawResponse: JSON.stringify(rawData, null, 2)
      };

    } catch (error: unknown) {
      console.error('💥 Mistral OCR error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';

      throw new Error(`Mistral OCR failed: ${errorMessage}`);
    }
  },
});

export const analyzeOCRText = action({
  args: {
    extractedText: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { extractedText, prompt }): Promise<TradeAnalysis> => {
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'; // Fixed URL

    if (!DEEPSEEK_API_KEY) {
      console.error('❌ DEEPSEEK_API_KEY not found in environment variables');
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    console.log('🔍 Analyzing OCR text with DeepSeek');
    console.log('📝 Extracted text to analyze:', extractedText);

    try {
      // Enhanced prompt for better symbol/timeframe extraction and strategy comparison
      const enhancedPrompt = `
Analyze this OCR text from a trading chart and compare it to the active strategy:

OCR TEXT:
${extractedText}

STRATEGY CONTEXT:
${prompt}

Please extract the following information and provide analysis:
1. Trading symbol/pair (look for pairs like GBP/USD, EUR/USD, etc.)
2. Timeframe (look for 1D, 1H, 4H, etc.)
3. Current price and key levels
4. How this setup compares to the active strategy rules
5. Trade direction suggestion (LONG/SHORT) if applicable

Respond in this exact JSON format:
{
  "symbol": "extracted trading pair or null",
  "timeframe": "extracted timeframe or null",
  "type": "LONG or SHORT or null",
  "riskReward": "estimated risk reward ratio or null",
  "confidence": "number between 0 and 1",
  "reasoning": "detailed analysis comparing OCR data to strategy",
  "strategyMatch": {
    "matchedComponents": ["list of strategy components that match this setup"],
    "suggestedRules": ["applicable strategy rules for this setup"],
    "matchConfidence": "number between 0 and 1"
  }
}`;

      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional trading analyst. Extract trading information from OCR text and compare it to strategy rules. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500
      };

      console.log('📦 DeepSeek request structure:', {
        model: requestBody.model,
        messageCount: requestBody.messages.length,
        temperature: requestBody.temperature,
        max_tokens: requestBody.max_tokens
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
      console.log('📥 Raw DeepSeek API response:', rawData);
      
      if (!isDeepSeekResponse(rawData)) {
        throw new Error('Invalid response format from DeepSeek API');
      }

      const data: DeepSeekResponse = rawData;
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from DeepSeek API');
      }

      console.log('✨ DeepSeek analysis result:', content);

      try {
        // Clean the response to remove markdown code blocks if present
        let cleanedContent = content;
        if (content.includes('```json')) {
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            cleanedContent = jsonMatch[1].trim();
          }
        } else if (content.includes('```')) {
          const codeMatch = content.match(/```[\s\S]*?([\s\S]*?)\s*```/);
          if (codeMatch && codeMatch[1]) {
            cleanedContent = codeMatch[1].trim();
          }
        }
        
        const analysisResult = JSON.parse(cleanedContent);
        
        return {
          symbol: analysisResult.symbol || null,
          type: analysisResult.type || null,
          riskReward: analysisResult.riskReward || null,
          confidence: analysisResult.confidence || 0,
          reasoning: analysisResult.reasoning || 'No reasoning provided',
          timeframe: analysisResult.timeframe || null,
          extractedData: {
            hasSymbol: Boolean(analysisResult.symbol),
            hasRiskReward: Boolean(analysisResult.riskReward),
            hasTimeframe: Boolean(analysisResult.timeframe),
            hasDirection: Boolean(analysisResult.type)
          },
          strategyMatch: analysisResult.strategyMatch
        };
      } catch (parseError) {
        console.error('❌ Failed to parse DeepSeek response as JSON:', parseError);
        console.log('📄 Raw content:', content);
        
        return {
          symbol: null,
          type: null,
          riskReward: null,
          confidence: 0,
          reasoning: `Analysis failed to parse: ${content}`,
          timeframe: null,
          extractedData: {
            hasSymbol: false,
            hasRiskReward: false,
            hasTimeframe: false,
            hasDirection: false
          }
        };
      }
    } catch (error: unknown) {
      console.error('💥 DeepSeek analysis error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';

      throw new Error(`DeepSeek analysis failed: ${errorMessage}`);
    }
  },
});

// Add this interface near the top with other interfaces (around line 115)
interface ChatbotResponse {
  message: string;
  confidence: number;
  suggestedActions?: string[];
  relatedRules?: string[];
}

// Add this action at the end of the file (after the analyzeOCRText action)
export const chatWithStrategy = action({
  args: {
    message: v.string(),
    strategyContext: v.optional(v.object({
      name: v.string(),
      rules: v.array(v.string()),
      components: v.optional(v.array(v.any())),
      complexity: v.optional(v.string()),
      riskProfile: v.optional(v.string())
    })),
    conversationHistory: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string()
    })))
  },
  handler: async (ctx, { message, strategyContext, conversationHistory = [] }): Promise<ChatbotResponse> => {
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
    
    if (!MISTRAL_API_KEY) {
      throw new Error('Mistral API key not configured');
    }

    // Build context-aware prompt
    let systemPrompt = `You are a helpful trading strategy assistant. Provide clear, well-formatted advice using markdown.

FORMATTING GUIDELINES:
- Use **bold** for important terms and key concepts
- Use *italic* for emphasis
- Use bullet points with - for lists
- Use numbered lists (1. 2. 3.) for sequential steps
- Use ### for section headers when appropriate
- Keep responses concise but well-structured
- Use \`code\` formatting for technical terms like indicators
- Make text scannable and easy to read

`;

    if (strategyContext) {
      systemPrompt += `Current Strategy: "${strategyContext.name}"\n`;
      systemPrompt += `Complexity: ${strategyContext.complexity || 'Not specified'}\n`;
      systemPrompt += `Risk Profile: ${strategyContext.riskProfile || 'Not specified'}\n\n`;
      
      if (strategyContext.rules && strategyContext.rules.length > 0) {
        systemPrompt += `Strategy Rules:\n${strategyContext.rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}\n\n`;
      }
    }

    systemPrompt += `Response Guidelines:
- Provide specific, actionable advice
- Reference strategy rules when relevant
- Use markdown formatting for better readability
- Keep under 150 words but well-structured
- Use formatting to highlight key points`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    try {
      console.log('🤖 Mistral Chatbot request details:', {
        messageLength: message.length,
        hasStrategyContext: !!strategyContext,
        conversationLength: conversationHistory.length,
        timestamp: new Date().toISOString()
      });
      
      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages,
          temperature: 0.7,
          max_tokens: 200  // Further reduced for concise responses
        })
      });
  
      console.log('📡 Mistral API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mistral API error response:', errorText);
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!isMistralResponse(data)) {
        throw new Error('Invalid response format from Mistral API');
      }

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from Mistral API');
      }

      // Handle both string and array content types from Mistral
      const messageContent = typeof content === 'string' ? content : 
        (Array.isArray(content) ? content.map(item => item.text || '').join('') : String(content));

      // Minimal formatting - preserve markdown but clean up excessive whitespace
      const cleanedMessage = messageContent
        .replace(/\n\n\n+/g, '\n\n') // Remove excessive line breaks (3+ becomes 2)
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .trim();

      // Extract suggested actions and related rules (simple keyword matching)
      const suggestedActions: string[] = [];
      const relatedRules: string[] = [];
      
      // Comment out or remove this entire section:
      /*
      if (strategyContext?.rules) {
        strategyContext.rules.forEach((rule, index) => {
          // Simple keyword matching to find related rules
          const keywords = message.toLowerCase().split(' ');
          const ruleWords = rule.toLowerCase().split(' ');
          
          const hasMatch = keywords.some(keyword => 
            ruleWords.some(word => word.includes(keyword) && keyword.length > 3)
          );
          
          if (hasMatch) {
            relatedRules.push(rule);
          }
        });
      }
      */

      // Simple confidence scoring based on strategy context availability
      let confidence = 0.7; // Base confidence
      if (strategyContext) confidence += 0.2;
      if (relatedRules.length > 0) confidence += 0.1;
      confidence = Math.min(confidence, 1.0);

      return {
        message: cleanedMessage,
        confidence,
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
        relatedRules: relatedRules.length > 0 ? relatedRules : undefined
      };
      
    } catch (error) {
      console.error('Mistral Chatbot error:', error);
      
      // More specific error handling
      let errorMessage = "I'm sorry, I encountered an error. Please try again.";
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('mistral_api_key') || errorMsg.includes('api key')) {
          errorMessage = "Mistral API key is not configured properly. Please check your environment variables.";
        } else if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
          errorMessage = "I'm currently experiencing high demand. Please wait a moment and try again.";
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
          errorMessage = "I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
        } else if (errorMsg.includes('timeout')) {
          errorMessage = "The request took too long to process. Please try with a shorter message.";
        } else if (errorMsg.includes('invalid') || errorMsg.includes('format')) {
          errorMessage = "There was an issue processing your request. Please try rephrasing your question.";
        } else {
          // Include the actual error for debugging
          errorMessage = `I encountered an issue: ${error.message}. Please try rephrasing your question or contact support if this persists.`;
        }
      }
      
      return {
        message: errorMessage,
        confidence: 0.1
      };
    }
  }
});