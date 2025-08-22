import { action } from "./_generated/server";
import { v } from "convex/values";
import { jsonrepair } from 'jsonrepair';
import JSON5 from 'json5';

// Flowchart Types
interface FlowchartNode {
  id: string;
  name: string;
  shape: 'oval' | 'rectangle' | 'diamond';
  icon: string;
  color: string;
  group?: string;
}

interface FlowchartGroup {
  name: string;
  icon: string;
  color: string;
  nodes: string[];
}

interface FlowchartRelationship {
  from: string;
  to: string;
  condition: string;
}

// Add this type definition
type FlowchartDirection = 'right' | 'down';

interface ParsedFlowchartStrategy {
  title: string;
  direction: FlowchartDirection;  // Update to use the type
  groups: FlowchartGroup[];
  nodes: FlowchartNode[];
  relationships: FlowchartRelationship[];
  globalTags: string[];
}

// Chatbot Types
interface ChatbotResponse {
  message: string;
  confidence: number;
  suggestedActions?: string[];
  relatedRules?: string[];
}

// API Response Types
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

interface RawJsonNode {
  id?: string;
  name?: string;
  shape?: string;
  icon?: string;
  color?: string;
  group?: string;
}

interface RawJsonGroup {
  name?: string;
  icon?: string;
  color?: string;
  nodes?: string[];
}

interface RawJsonRelationship {
  from: string;
  to: string;
  condition?: string;
}

interface RawJsonResult {
  title?: string;
  direction?: string;
  groups?: RawJsonGroup[];
  nodes?: RawJsonNode[];
  relationships?: RawJsonRelationship[];
  globalTags?: string[];
}


// Type guard for Mistral API response
function isMistralResponse(data: unknown): data is MistralResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'choices' in data &&
    Array.isArray((data as any).choices)
  );
}
// Replace the existing fixTruncatedJson function
function fixTruncatedJson(content: string): string {
  // Early size check to prevent memory overflow
  if (content.length > 3000) {
    console.log('⚠️ Content too large for JSON fixing, truncating to 3000 chars');
    content = content.substring(0, 3000);
  }

  try {
    // Remove markdown first
    let cleaned = content
      .replace(/```json\s*|\s*```/g, '')
      .replace(/```\s*|\s*```/g, '')
      .trim();
    
    // Use jsonrepair to fix the malformed JSON
    const repaired = jsonrepair(cleaned);
    console.log('🔧 JSON repaired successfully');
    return repaired;
  } catch (error) {
    console.error('JSON repair failed:', error);
    // Fallback to basic cleanup
    let cleaned = content
      .replace(/```json\s*|\s*```/g, '')
      .trim();
    
    if (!cleaned.startsWith('{')) {
      cleaned = '{' + cleaned;
    }
    if (!cleaned.endsWith('}')) {
      cleaned += '}';
    }
    
    return cleaned;
  }
}

// Strategy flowchart prompt generator
function generateStrategyPrompt(description: string): string {
  return `${description}

Create a flowchart JSON with title, groups, nodes, and relationships.`;
}

// Property parser for node attributes
function parseProperties(propsString: string): Record<string, string> {
  const props: Record<string, string> = {};
  
  try {
    const propPairs = propsString.split(',').map(p => p.trim());
    
    for (const pair of propPairs) {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value) {
        props[key] = value;
      }
    }
  } catch (error) {
    console.error('Error parsing properties:', error);
  }
  
  return props;
}

// Shape validator
function validateShape(shape: string): 'oval' | 'rectangle' | 'diamond' {
  if (shape === 'oval' || shape === 'rectangle' || shape === 'diamond') {
    return shape;
  }
  return 'rectangle'; // Default shape if invalid
}

// Direction validator
function validateDirection(direction: string): FlowchartDirection {
  return direction === 'down' ? 'down' : 'right'; // Default to 'right' if invalid
}

// Flowchart syntax parser
function parseFlowchartSyntax(text: string): ParsedFlowchartStrategy {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  const flowchart: ParsedFlowchartStrategy = {
    title: '',
    direction: 'right',
    groups: [],
    nodes: [],
    relationships: [],
    globalTags: []
  };

  let currentGroup: FlowchartGroup | null = null;

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Parse title
      if (line.startsWith('title')) {
        flowchart.title = line.replace('title', '').trim().replace(/[\[\]]/g, '');
        continue;
      }

      // Parse direction
      if (line.startsWith('direction')) {
        flowchart.direction = line.includes('right') ? 'right' : 'down';
        continue;
      }

      // Parse group
      if (line.startsWith('// GROUP:')) {
        const groupMatch = line.match(/\/\/ GROUP:\s*([^\[]+)\s*(?:\[([^\]]+)\])?/);
        if (groupMatch) {
          const groupName = groupMatch[1].trim();
          const groupProps = groupMatch[2] ? parseProperties(groupMatch[2]) : { icon: 'folder', color: 'gray' };
          
          currentGroup = {
            name: groupName,
            icon: groupProps.icon || 'folder',
            color: groupProps.color || 'gray',
            nodes: []
          };
          
          flowchart.groups.push(currentGroup);
        }
        continue;
      }

      // Parse relationships
      if (line.includes('>')) {
        const [from, rest] = line.split('>').map(s => s.trim());
        const [to, condition] = rest.split(':').map(s => s.trim());
        
        flowchart.relationships.push({
          from: from.replace(/[\[\]]/g, ''),
          to: to.replace(/[\[\]]/g, ''),
          condition: condition || ''
        });
        continue;
      }

      // Parse nodes
      const nodeMatch = line.match(/([^\[]+)\s*\[([^\]]+)\]/);
      if (nodeMatch) {
        const nodeName = nodeMatch[1].trim();
        const nodeProps = parseProperties(nodeMatch[2]);
        
        const node: FlowchartNode = {
          id: nodeName,
          name: nodeName,
          shape: validateShape(nodeProps.shape || 'rectangle'),
          icon: nodeProps.icon || 'circle',
          color: nodeProps.color || 'gray',
          group: currentGroup?.name
        };
        
        flowchart.nodes.push(node);
        if (currentGroup) {
          currentGroup.nodes.push(node.id);
        }
      }
    }

    return flowchart;

  } catch (error) {
    console.error('Error parsing flowchart syntax:', error);
    return {
      title: 'Error parsing strategy',
      direction: 'right',
      groups: [],
      nodes: [],
      relationships: [],
      globalTags: []
    };
  }
}
export const parseStrategy = action({
  args: {
    description: v.string(),
    enhancedParsing: v.optional(v.boolean()),
  },
  handler: async (ctx, { description, enhancedParsing = false }): Promise<ParsedFlowchartStrategy> => {
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
    
    if (!MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY not configured');
    }

    try {
      // Limit input size but keep it reasonable
      const truncatedDescription = description.substring(0, 800);
      
      console.log('🚀 Starting strategy parsing for:', truncatedDescription.substring(0, 100));
      
      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-medium',
          messages: [
            {
              role: 'system',
              content: 'You are a JSON generator. Always return valid, complete JSON only. No explanations, no markdown, just pure JSON. '
            },
            {
              role: 'user',
              content: `Create a trading strategy flowchart in this EXACT JSON format:
{
  "title": "Strategy Name",
  "direction": "right",
  "groups": [{"name": "Group Name", "icon": "folder", "color": "blue", "nodes": ["node1"]}],
  "nodes": [{"id": "node1", "name": "Node Name", "shape": "rectangle", "icon": "circle", "color": "gray", "group": "Group Name"}],
  "relationships": [{"from": "node1", "to": "node2", "condition": "condition"}],
  "globalTags": ["tag1"]
}

Strategy: ${truncatedDescription}`
            }
          ],
          temperature: 0.1,
          max_tokens: 1000, // Increased for complete JSON
        })
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!isMistralResponse(data)) {
        console.error('❌ Invalid response format');
        throw new Error('Invalid response format from Mistral API');
      }

      const content = data.choices[0]?.message?.content;
      if (!content) {
        console.error('❌ No content received');
        throw new Error('No content received from Mistral API');
      }

      // Convert content to string first, then use substring
      const contentString = typeof content === 'string' ? 
        content : 
        Array.isArray(content) ? 
          content.map(item => item.text || '').join('') : 
          '';

      // Early memory check - reject responses that are too large
      if (contentString.length > 3000) {
        console.log('⚠️ Response too large, truncating to prevent memory overflow');
        const truncatedContent = contentString.substring(0, 3000);
        console.log('📤 Truncated AI response:', truncatedContent.substring(0, 200));
      } else {
        console.log('📤 Raw AI response:', contentString.substring(0, 200));
      }
      
      console.log('📊 Token usage:', data.usage);
      console.log('📏 Content length:', contentString.length);

      // Use truncated content if necessary
      const workingContent = contentString.length > 3000 ? 
        contentString.substring(0, 3000) : 
        contentString;

      // Clean content more carefully
      const cleanedContent = typeof content === 'string' ? content : 
        Array.isArray(content) ? content.map(item => item.text || '').join('') : '';

      console.log('📝 Content length:', cleanedContent.length);
      console.log('📝 Raw content preview:', cleanedContent.substring(0, 200));

      // Apply JSON repair BEFORE parsing
      const fixedContent = fixTruncatedJson(cleanedContent);
      console.log('🔧 Fixed content preview:', fixedContent.substring(0, 200));

      try {
      const parsedResult = JSON5.parse(fixedContent) as RawJsonResult;
      console.log('✅ Successfully parsed JSON');
        
        // Create result with validation
        const result = {
          title: (parsedResult.title || 'Trading Strategy').substring(0, 50),
          direction: validateDirection(parsedResult.direction || 'right'),
          groups: (parsedResult.groups || []).slice(0, 3).map((group: RawJsonGroup) => ({
            name: (group.name || 'Group').substring(0, 30),
            icon: group.icon || 'folder',
            color: group.color || 'gray',
            nodes: (group.nodes || []).slice(0, 5)
          })),
          nodes: (parsedResult.nodes || []).slice(0, 5).map((node: RawJsonNode) => ({
            id: (node.id || `n${Math.random().toString(36).substring(2, 6)}`).substring(0, 15),
            name: (node.name || 'Node').substring(0, 30),
            shape: validateShape(node.shape || 'rectangle'),
            icon: node.icon || 'circle',
            color: node.color || 'gray',
            group: (node.group || '').substring(0, 30)
          })),
          relationships: (parsedResult.relationships || []).slice(0, 5).map((rel: RawJsonRelationship) => ({
            from: rel.from.substring(0, 15),
            to: rel.to.substring(0, 15),
            condition: (rel.condition || '').substring(0, 30)
          })),
          globalTags: (parsedResult.globalTags || []).slice(0, 5).map(tag => 
            tag.substring(0, 20)
          )
        };
        
        console.log('🎯 Returning parsed result with', result.nodes.length, 'nodes');
        return result;

      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        console.error('❌ Problematic content:', cleanedContent);
        
        // Return fallback with logging
        console.log('🔄 Returning JSON parse fallback');
        return {
          title: 'Trading Strategy',
          direction: 'right',
          groups: [{
            name: 'Strategy',
            icon: 'folder',
            color: 'blue',
            nodes: ['start']
          }],
          nodes: [{
            id: 'start',
            name: 'Start',
            shape: 'oval',
            icon: 'play',
            color: 'green',
            group: 'Strategy'
          }],
          relationships: [],
          globalTags: []
        };
      }

    } catch (error) {
      console.error('💥 Strategy parsing failed:', error);
      
      // Return fallback with logging
      console.log('🔄 Returning API error fallback');
      return {
        title: 'Basic Strategy',
        direction: 'right',
        groups: [{
          name: 'Steps',
          icon: 'folder',
          color: 'blue',
          nodes: ['start']
        }],
        nodes: [{
          id: 'start',
          name: 'Start',
          shape: 'oval',
          icon: 'play',
          color: 'green',
          group: 'Steps'
        }],
        relationships: [],
        globalTags: []
      };
    }
  },
});

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
      description: v.optional(v.string()),
      rules: v.optional(v.array(v.string())), // ← Change from v.array(v.string()) to v.optional(v.array(v.string()))
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
    let systemPrompt = `You are a specialized trading strategy assistant. You MUST provide strategy-specific advice based on the provided context.

FORMATTING REQUIREMENTS:
- Use **bold** for key concepts and important terms
- Use *italic* for emphasis
- Use bullet points (-) for lists
- Use numbered lists for sequential steps
- Use \`code\` formatting for technical indicators
- Keep responses well-structured and scannable

CRITICAL INSTRUCTIONS:
- You MUST reference the specific strategy rules when answering
- NEVER give generic trading advice
- ALWAYS relate your response to the current strategy context
- If no strategy context is provided, ask the user to select a strategy first
`;

    if (strategyContext) {
      systemPrompt += `\n**CURRENT STRATEGY: "${strategyContext.name}"**\n`;
      systemPrompt += `**Complexity:** ${strategyContext.complexity || 'Not specified'}\n`;
      systemPrompt += `**Risk Profile:** ${strategyContext.riskProfile || 'Not specified'}\n\n`;
      
      if (strategyContext.rules && strategyContext.rules.length > 0) {
        systemPrompt += `**STRATEGY RULES YOU MUST REFERENCE:**\n${strategyContext.rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}\n\n`;
      }
      
      systemPrompt += `**MANDATORY RESPONSE REQUIREMENTS:**\n`;
      systemPrompt += `- You MUST explicitly reference at least one strategy rule in your response\n`;
      systemPrompt += `- You MUST relate your advice specifically to the "${strategyContext.name}" strategy\n`;
      systemPrompt += `- You MUST avoid generic trading advice\n`;
      systemPrompt += `- Start your response by mentioning the strategy name\n`;
      systemPrompt += `- Keep responses under 150 words but strategy-specific\n`;
    } else {
      systemPrompt += `\n**NO STRATEGY SELECTED:**\nYou must ask the user to select a trading strategy first before you can provide specific advice.`;
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
      // Around line 560-570, enhance the existing logging:
      console.log('🤖 Mistral Chatbot request details:', {
        messageLength: message.length,
        hasStrategyContext: !!strategyContext,
        strategyName: strategyContext?.name,
        strategyRulesCount: strategyContext?.rules?.length || 0,
        conversationLength: conversationHistory.length,
        timestamp: new Date().toISOString()
      });
      
      // Add logging for the system prompt
      if (strategyContext) {
        console.log('📋 Strategy context details:', {
          name: strategyContext.name,
          complexity: strategyContext.complexity,
          riskProfile: strategyContext.riskProfile,
          rulesCount: strategyContext.rules?.length || 0,
          rulesPreview: strategyContext.rules?.[0]?.substring(0, 100) + '...',
          fullRules: strategyContext.rules // Add this to see the actual rules content
        });
      }
      
      console.log('💬 System prompt preview:', systemPrompt.substring(0, 200) + '...');
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

