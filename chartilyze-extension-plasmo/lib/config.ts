// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development'

export const API_CONFIG = {
  // Use localhost for development, production URLs for production
  BASE_URL: isDevelopment ? 'http://localhost:3000' : 'https://app.chartilyze.com',
  CONVEX_URL: 'https://decisive-tapir-206.convex.site', // Updated to new deployment URL
  
  // API endpoints
  ENDPOINTS: {
    AUTH_LOGIN: '/sign-in',
    AUTH_VERIFY: '/api/auth/session',
    CHAT: '/extension/chat', // Changed from '/api/chat' to '/extension/chat'
    STRATEGIES: '/extension/strategies'
  }
}

// Helper function to get full URL
export const getApiUrl = (endpoint: string) => {
  if (endpoint.startsWith('http')) {
    return endpoint // Already a full URL
  }
  
  // Use Convex for chat and strategies, web app for auth verification
  if (endpoint === API_CONFIG.ENDPOINTS.STRATEGIES || endpoint === API_CONFIG.ENDPOINTS.CHAT) {
    return `${API_CONFIG.CONVEX_URL}${endpoint}`
  }
  
  return `${API_CONFIG.BASE_URL}${endpoint}`
}