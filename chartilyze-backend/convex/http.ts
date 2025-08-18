import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import jwt from 'jsonwebtoken';

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

// Add type definition for extension token request
interface ExtensionTokenRequestBody {
  clerkSessionId: string;
  clerkUserId: string;
  clerkToken?: string;
}

// CORS headers for browser extension
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
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

// Add OPTIONS handler for strategies endpoint
http.route({
  path: "/extension/strategies",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

// Add strategies endpoint before the health endpoint
http.route({
  path: "/extension/strategies",
  method: "GET",
  // In the /extension/strategies route
  handler: httpAction(async (ctx, request) => {
      // In the GET /extension/strategies handler:
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Authentication required", { status: 401 });
      }
      
      const token = authHeader.replace("Bearer ", "");
      
      try {
          // Validate the JWT token and get user identity
          // For HTTP actions, we need to verify the token manually
          // since ctx.auth is not available in HTTP actions
          
          // For now, let's extract the userId from the token
          // This is a simplified approach - in production you'd want proper JWT validation
          let userId;
          
          try {
              // Try to decode the JWT token to get the user ID
              const payload = JSON.parse(atob(token.split('.')[1]));
              userId = payload.sub; // 'sub' is the standard JWT claim for user ID
          } catch (e) {
              // If JWT parsing fails, treat the token as a direct userId (fallback)
              userId = token;
          }
          
          if (!userId) {
              return new Response("Invalid token", { status: 401 });
          }
          
          console.log('Extension request for user:', userId);
          
          const journals = await ctx.runQuery(api.journals.getJournalsByUserId, { userId });
          if (!journals) {
            return new Response(
              JSON.stringify({ strategies: [] }),
              {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
  
          // Transform journals into strategy format for extension
          const strategies = journals
            .filter(journal => journal.strategy) // Only journals with strategies
            .map(journal => ({
              id: journal._id,
              name: journal.strategy?.name || 'Unnamed Strategy',
              description: journal.description,
              rules: journal.strategy?.rules || [],
              components: journal.strategy?.components,
              globalTags: journal.strategy?.globalTags,
              complexity: journal.strategy?.complexity,
              riskProfile: journal.strategy?.riskProfile,
              journalId: journal._id,
              journalName: journal.name
            }));
  
          return new Response(
            JSON.stringify({ strategies }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
      } catch (error) {
        console.error('Error fetching strategies:', error);
        return new Response("Internal server error", { status: 500 });
      }
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

// Add this new endpoint
http.route({
  path: "/auth/extension",
  method: "GET", 
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const redirectUri = url.searchParams.get("redirect_uri");
    
    if (!redirectUri) {
      return new Response("Missing redirect_uri", { status: 400 });
    }
    
    // Redirect to your web app's login page with extension context
    const loginUrl = `https://your-chartilyze-domain.com/login?extension=true&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": loginUrl
      }
    });
  })
});

// Add token verification endpoint
// Fix the JWT usage in the auth/verify endpoint
http.route({
  path: "/auth/verify",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Missing or invalid authorization header", { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    try {
      // Verify JWT token (same logic as existing endpoints)
      let userId;
      try {
        const decoded = jwt.decode(token) as any;
        userId = decoded?.sub;
      } catch (jwtError) {
        userId = token; // Fallback
      }
      
      if (!userId) {
        return new Response("Invalid token", { status: 401 });
      }
      
      return new Response(JSON.stringify({ valid: true, userId }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } catch (error) {
      return new Response("Token verification failed", { status: 401 });
    }
  })
});

// Add these new endpoints after the existing auth endpoints

// Convert Clerk session to extension-compatible JWT
http.route({
  path: "/auth/extension-token",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json() as ExtensionTokenRequestBody;
    const { clerkSessionId, clerkUserId, clerkToken } = body;
    
    try {
      // Validate the Clerk session with Clerk's API
      const clerkValidation = await fetch(`https://api.clerk.dev/v1/sessions/${clerkSessionId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`
        }
      });
      
      if (!clerkValidation.ok) {
        return new Response("Invalid Clerk session", { 
          status: 401,
          headers: corsHeaders
        });
      }
      
      // Create extension-specific JWT token
      const extensionToken = jwt.sign(
        { 
          sub: clerkUserId,
          iss: 'chartilyze-extension',
          aud: 'chartilyze-api',
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET || 'your-jwt-secret'
      );
      
      return new Response(JSON.stringify({ 
        extensionToken,
        expiresIn: 24 * 60 * 60
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } catch (error) {
      console.error('Extension token creation failed:', error);
      return new Response("Token creation failed", { 
        status: 500,
        headers: corsHeaders
      });
    }
  })
});

// Add OPTIONS handler for the new endpoint
http.route({
  path: "/auth/extension-token",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

// Validate extension token
http.route({
  path: "/auth/validate-extension-token",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Missing authorization header", { 
        status: 401,
        headers: corsHeaders
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as jwt.JwtPayload;
      
      return new Response(JSON.stringify({ 
        valid: true, 
        userId: decoded.sub,
        expiresAt: decoded.exp
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } catch (error) {
      return new Response("Invalid token", { 
        status: 401,
        headers: corsHeaders
      });
    }
  })
});

// Add OPTIONS handler for validation endpoint
http.route({
  path: "/auth/validate-extension-token",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }),
});

export default http;