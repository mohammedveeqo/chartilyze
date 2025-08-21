// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development'

export const API_CONFIG = {
  // Use localhost for development, production URLs for production
  BASE_URL: isDevelopment ? 'http://localhost:3000' : 'https://app.chartilyze.com',
  CONVEX_URL: 'https://decisive-tapir-206.convex.site', // Your Convex deployment
  
  // API endpoints
  ENDPOINTS: {
    AUTH_LOGIN: '/sign-in',
    AUTH_VERIFY: '/api/auth/session',
    CHAT: '/api/chat',
    STRATEGIES: '/api/strategies' // This will use Convex
  }
}

// Helper function to get full URL
export const getApiUrl = (endpoint: string) => {
  if (endpoint.startsWith('http')) {
    return endpoint // Already a full URL
  }
  
  // Use Convex for strategies, localhost for others
  if (endpoint === API_CONFIG.ENDPOINTS.STRATEGIES) {
    return `${API_CONFIG.CONVEX_URL}${endpoint}`
  }
  
  return `${API_CONFIG.BASE_URL}${endpoint}`
}