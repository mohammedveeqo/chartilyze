import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// Type definitions for request bodies
interface ChatRequestBody {
  message: string;
  strategyContext?: any;
  conversationHistory?: Array<{ role: string; content: string }>;
}

interface JournalRequestBody {
  name: string;
  description?: string;
  strategy?: any;
  settings?: any;
  userId: string;
  chartData?: any;
}

interface AnalyzeRequestBody {
  imageBase64: string;
  prompt?: string;
  analysisType?: string;
}

// CORS headers for browser extension
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight requests
http.route({
  path: "/extension/chat",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/extension/journal",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

http.route({
  path: "/extension/analyze",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

// Chat endpoint for extension
http.route({
  path: "/extension/chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as ChatRequestBody;
      const { message, strategyContext, conversationHistory } = body;

      if (!message) {
        return new Response(
          JSON.stringify({ error: "Message is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Call the existing chatWithStrategy action
      const response = await ctx.runAction(api.aiStrategy.chatWithStrategy, {
        message,
        strategyContext,
        conversationHistory: conversationHistory || [],
      });

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Chat endpoint error:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to process chat message",
          details: error instanceof Error ? error.message : "Unknown error"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Journal creation endpoint
http.route({
  path: "/extension/journal",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as JournalRequestBody;
      const { 
        name, 
        description, 
        strategy, 
        settings, 
        userId,
        chartData 
      } = body;

      if (!name || !userId) {
        return new Response(
          JSON.stringify({ error: "Name and userId are required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create journal entry with chart data
      const journalData = {
        name,
        description: description || `Journal entry created from TradingView - ${new Date().toLocaleString()}`,
        strategy,
        settings: settings || {
          defaultRiskPercentage: 2,
          defaultPositionSize: 1000,
        },
        // Add chart data if provided
        ...(chartData && {
          metadata: {
            source: "tradingview-extension",
            chartData,
            createdAt: Date.now(),
          }
        })
      };

      // Note: For development, we'll store without authentication
      // In production, you'd want to validate the userId
      const journalId = await ctx.runMutation(api.journals.create, journalData);

      return new Response(
        JSON.stringify({ 
          success: true, 
          journalId,
          message: "Journal entry created successfully"
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Journal creation error:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create journal entry",
          details: error instanceof Error ? error.message : "Unknown error"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Chart analysis endpoint
http.route({
  path: "/extension/analyze",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as AnalyzeRequestBody;
      const { imageBase64, prompt, analysisType } = body;

      if (!imageBase64) {
        return new Response(
          JSON.stringify({ error: "Image data is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      let response;
      
      if (analysisType === "trade") {
        // Use the existing trade analysis action
        response = await ctx.runAction(api.aiStrategy.analyzeTradeImage, {
          imageBase64,
          prompt: prompt || "Analyze this trading chart",
        });
      } else if (analysisType === "ocr") {
        // First extract text using Mistral OCR, then analyze with DeepSeek
        const ocrResult = await ctx.runAction(api.aiStrategy.testMistralOCR, {
          imageBase64,
        });
        
        // Then analyze the extracted text
        response = await ctx.runAction(api.aiStrategy.analyzeOCRText, {
          extractedText: ocrResult.extractedText,
          prompt: prompt || "Analyze this trading chart data",
        });
      } else {
        // Default to trade analysis
        response = await ctx.runAction(api.aiStrategy.analyzeTradeImage, {
          imageBase64,
          prompt: prompt || "Analyze this trading chart",
        });
      }

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Analysis endpoint error:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to analyze chart",
          details: error instanceof Error ? error.message : "Unknown error"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Health check endpoint
http.route({
  path: "/extension/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        service: "chartilyze-extension-api"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;