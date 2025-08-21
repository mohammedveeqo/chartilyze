import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";


const http = httpRouter();

// Type definitions
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

interface ExtensionTokenRequestBody {
  clerkSessionId: string;
  clerkUserId: string;
  clerkToken?: string;
}

interface ValidateStoredSessionRequestBody {
  sessionData: {
    hasCookieSession?: boolean;
    hasStoredSession?: boolean;
    cookies?: Array<{ name: string; value: string; domain: string }>;
    clerkData?: any;
    clerkSession?: any;
  };
}

interface ValidateExtensionTokenRequestBody {
  token: string;
}

interface ClerkErrorResponse {
  status: number;
  error: string;
  userMessage: string;
}

interface AuthError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

interface TokenValidationResult {
  valid: boolean;
  error?: string;
  data?: {
    userId: string;
    type: 'clerk' | 'localStorage';
    sessionId: string;
    [key: string]: any;
  };
}

interface RefreshTokenRequestBody {
  refreshToken: string;
}

// Constants
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'fallback-secret-key';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

// Utility Functions
const logAuthEvent = (
  event: string, 
  details: Record<string, any>, 
  level: 'info' | 'warn' | 'error' = 'info'
) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    level,
    ...details
  };
  
  if (details.error instanceof Error) {
    logEntry.error = {
      message: details.error.message,
      name: details.error.name,
      stack: details.error.stack
    };
  }
  
  console.log(`[AUTH-${level.toUpperCase()}]`, JSON.stringify(logEntry, null, 2));
};

const createSecureToken = (payload: any, expiresIn: number = TOKEN_EXPIRY) => {
  const tokenData = {
    ...payload,
    timestamp: Date.now(),
    expiresAt: Date.now() + expiresIn,
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  const tokenString = JSON.stringify(tokenData);
  const signature = crypto.createHmac('sha256', TOKEN_SECRET)
    .update(tokenString)
    .digest('hex');
  
  const secureToken = {
    data: tokenString,
    signature
  };
  
  return Buffer.from(JSON.stringify(secureToken)).toString('base64');
};

const validateSecureToken = (token: string): TokenValidationResult => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (!decoded.data || !decoded.signature) {
      return {
        valid: false,
        error: 'Invalid token structure'
      };
    }
    
    const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET)
      .update(decoded.data)
      .digest('hex');
    
    if (decoded.signature !== expectedSignature) {
      return {
        valid: false,
        error: 'Invalid token signature'
      };
    }
    
    const tokenData = JSON.parse(decoded.data);
    
    if (Date.now() > tokenData.expiresAt) {
      return {
        valid: false,
        error: 'Token expired'
      };
    }
    
    return { 
      valid: true, 
      data: tokenData 
    };
  } catch (err) {
    const error = err as Error;
    return { 
      valid: false, 
      error: error.message || 'Token validation failed'
    };
  }
};

const handleClerkError = (response: Response, context: string): ClerkErrorResponse => {
  const errorMessages: Record<number, string> = {
    400: 'Invalid request parameters',
    401: 'Invalid or expired Clerk session',
    403: 'Insufficient permissions',
    404: 'Session not found',
    429: 'Rate limit exceeded',
    500: 'Clerk service unavailable'
  };
  
  const message = errorMessages[response.status] || 'Unknown Clerk API error';
  
  logAuthEvent('clerk_api_error', {
    context,
    status: response.status,
    message,
    url: response.url
  }, 'error');
  
  return {
    error: message,
    status: response.status,
    userMessage: response.status === 401 
      ? 'Your session has expired. Please sign in again.'
      : 'Authentication service temporarily unavailable. Please try again.'
  };
};
// OPTIONS Routes
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

http.route({
  path: "/auth/extension-token",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }),
});

// Health Check Endpoint
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

// Basic Auth Extension Endpoint
http.route({
  path: "/auth/extension",
  method: "GET", 
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const redirectUri = url.searchParams.get("redirect_uri");
    
    if (!redirectUri) {
      return new Response("Missing redirect_uri", { status: 400 });
    }
    
    const loginUrl = `https://your-chartilyze-domain.com/login?extension=true&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": loginUrl
      }
    });
  })
});

http.route({
  path: "/extension/strategies",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Authentication required", { status: 401 });
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    try {
      let userId;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub;
      } catch (e) {
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

      // Filter journals to only include those with strategies (like the web app does)
      const strategies = journals
        .filter(journal => journal?.strategy) // Add this filter line
        .map(journal => ({
          id: journal._id,
          name: journal.strategy!.name || journal.name || 'Untitled Journal',
          description: journal.description,
          rules: journal.strategy!.rules || [],
          components: journal.strategy!.components || [],
          globalTags: journal.strategy!.globalTags || [],
          complexity: journal.strategy!.complexity || 'simple',
          riskProfile: journal.strategy!.riskProfile || 'moderate',
          journalId: journal._id,
          journalName: journal.name
        }));

      // Return the strategies
      return new Response(
        JSON.stringify({ strategies }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Strategies endpoint error:", error);
      return new Response(
        JSON.stringify({ 
          strategies: [],
          error: "Failed to fetch strategies",
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

// Chat Endpoint
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

// Journal Endpoint
http.route({
  path: "/extension/journal",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as JournalRequestBody;
      const { name, description, strategy, settings, userId, chartData } = body;

      if (!name || !userId) {
        return new Response(
          JSON.stringify({ error: "Name and userId are required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const journalData = {
        name,
        description: description || `Journal entry created from TradingView - ${new Date().toLocaleString()}`,
        strategy,
        settings: settings || {
          defaultRiskPercentage: 2,
          defaultPositionSize: 1000,
        },
        ...(chartData && {
          metadata: {
            source: "tradingview-extension",
            chartData,
            createdAt: Date.now(),
          }
        })
      };

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

// Analyze Endpoint
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
        response = await ctx.runAction(api.aiStrategy.analyzeTradeImage, {
          imageBase64,
          prompt: prompt || "Analyze this trading chart",
        });
      } else if (analysisType === "ocr") {
        const ocrResult = await ctx.runAction(api.aiStrategy.testMistralOCR, {
          imageBase64,
        });
        
        response = await ctx.runAction(api.aiStrategy.analyzeOCRText, {
          extractedText: ocrResult.extractedText,
          prompt: prompt || "Analyze this trading chart data",
        });
      } else {
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

http.route({
  path: "/auth/verify",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response("Token required", { status: 400 });
    }
    
    try {
      let userId;
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        userId = decoded?.userId;
      } catch (decodeError) {
        userId = token;
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
      console.error('Token verification error:', error);
      return new Response("Invalid token", { 
        status: 401,
        headers: { ...corsHeaders }
      });
    }
  })
});

// Stored Session Validation Endpoint
http.route({
  path: "/auth/validate-stored-session",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as ValidateStoredSessionRequestBody;
      const { sessionData } = body;
      
      if (sessionData.hasCookieSession && sessionData.cookies) {
        const sessionCookie = sessionData.cookies.find(cookie => 
          cookie.name.includes('__session') || cookie.name.includes('clerk')
        );
        
        if (sessionCookie) {
          const extensionToken = {
            source: 'cookie',
            timestamp: Date.now(),
            cookieData: sessionCookie.value
          };
          
          const encodedToken = Buffer.from(JSON.stringify(extensionToken)).toString('base64');
          
          return new Response(JSON.stringify({ 
            valid: true,
            extensionToken: encodedToken
          }), {
            status: 200,
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
      }
      
      if (sessionData.hasStoredSession) {
        const extensionToken = {
          source: 'stored',
          timestamp: Date.now(),
          storedData: sessionData.clerkData || sessionData.clerkSession
        };
        
        const encodedToken = Buffer.from(JSON.stringify(extensionToken)).toString('base64');
        
        return new Response(JSON.stringify({ 
          valid: true,
          extensionToken: encodedToken
        }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } catch (error) {
      console.error('Session validation error:', error);
      return new Response(JSON.stringify({ valid: false }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  })
});

// Extension Token Validation Endpoint
http.route({
  path: "/auth/validate-extension-token",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const requestId = crypto.randomUUID();
    
    try {
      const body = await request.json() as ValidateExtensionTokenRequestBody;
      const { token } = body;
      
      if (!token) {
        logAuthEvent('token_validation_failed', {
          requestId,
          reason: 'Missing token'
        }, 'warn');
        
        return new Response(JSON.stringify({ 
          valid: false, 
          reason: 'Missing token' 
        }), {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        });
      }

      const validation = validateSecureToken(token);
      
      if (!validation.valid) {
        logAuthEvent('token_validation_failed', {
          requestId,
          reason: validation.error
        }, 'warn');
        
        return new Response(JSON.stringify({ 
          valid: false, 
          reason: validation.error,
          userMessage: 'Session expired. Please sign in again.'
        }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        });
      }

      logAuthEvent('token_validation_success', {
        requestId,
        userId: validation.data?.userId,
        tokenType: validation.data?.type
      }, 'info');
      
      return new Response(JSON.stringify({ 
        valid: true,
        userId: validation.data?.userId,
        sessionId: validation.data?.sessionId,
        tokenType: validation.data?.type
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      });
    } catch (err) {
      const error = err as AuthError;
      
      logAuthEvent('token_validation_error', {
        requestId,
        error: error.message || 'Unknown error',
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 'error');
      
      return new Response(JSON.stringify({ 
        valid: false,
        userMessage: "Authentication error. Please try again.",
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code
        } : undefined
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      });
    }
  })
});

// Extension Token Creation Endpoint
http.route({
  path: "/auth/extension-token",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json() as ExtensionTokenRequestBody;
      const { clerkSessionId, clerkUserId, clerkToken } = body;
      
      if (clerkSessionId === 'localStorage-session') {
        if (!clerkToken || !clerkUserId) {
          return new Response(JSON.stringify({ 
            error: "Invalid localStorage session data" 
          }), {
            status: 401,
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders 
            }
          });
        }

        const extensionToken = createSecureToken({
          userId: clerkUserId,
          type: 'localStorage',
          sessionId: clerkSessionId,
          originalToken: clerkToken
        });

        return new Response(JSON.stringify({ 
          extensionToken,
          userId: clerkUserId
        }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        });
      }

      // Handle regular Clerk sessions
      const clerkResponse = await fetch(`https://api.clerk.com/v1/sessions/${clerkSessionId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!clerkResponse.ok) {
        const error = handleClerkError(clerkResponse, 'extension-token');
        return new Response(JSON.stringify(error), {
          status: error.status,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        });
      }

      const extensionToken = createSecureToken({
        userId: clerkUserId,
        type: 'clerk',
        sessionId: clerkSessionId
      });

      return new Response(JSON.stringify({ 
        extensionToken,
        userId: clerkUserId
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      });
    } catch (err) {
      const error = err as AuthError;
      
      logAuthEvent('extension_token_error', {
        error: error.message || 'Unknown error',
        stack: error.stack,
        code: error.code,
        details: error.details
      }, 'error');

      return new Response(JSON.stringify({ 
        error: "Internal server error",
        userMessage: "Authentication failed. Please try again.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      });
    }
  })
});

// Add this after the other extension endpoints
http.route({
  path: "/extension/user-info",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }),
});

http.route({
  path: "/extension/user-info",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response("Authentication required", { status: 401 });
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    try {
      let userId;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub;
      } catch (e) {
        userId = token;
      }
      
      if (!userId) {
        return new Response("Invalid token", { status: 401 });
      }
      
      // Get user information
      const user = await ctx.runQuery(api.users.getUserById, { userId });
      
      return new Response(
        JSON.stringify({ 
          user: {
            id: userId,
            name: user?.name || "Trader",
            email: user?.email
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error('Error fetching user info:', error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user information" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;