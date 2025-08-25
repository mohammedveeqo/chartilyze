export interface ChatMessageRequest {
  message: string
  strategyContext?: {
    name: string
    description?: string // ← Add description field
    rules?: string[]
    components?: any
    complexity?: string
    riskProfile?: string
  }
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface AuthCheckRequest {
  // Empty for now, can be extended later
}

export interface ScreenshotRequest {
  // Empty for now, can be extended later
}

export interface OpenSidePanelRequest {
  // Empty for now, can be extended later
}

export interface GetStrategiesRequest {
  // Empty for now, can be extended later
}

export interface Strategy {
  id: string
  name: string
  description: string
  rules?: string[]
  components?: any
  complexity?: string
  riskProfile?: string
}

export interface ChatResponse {
  message: string
  success: boolean
  suggestedActions?: string[]
  relatedRules?: string[]
  rawResponse?: any // Keep for debugging
}

export interface AuthResponse {
  isAuthenticated: boolean
  user?: {
    id: string
    email: string
  }
}

export interface ScreenshotResponse {
  screenshot: string
  success: boolean
  error?: string // Add optional error property
}

export interface StrategiesResponse {
  strategies: Strategy[]
  success: boolean
  error?: string // Add optional error property
}

export interface OpenAuthFlowRequest {
  name: "openAuthFlow"
}

export interface OpenAuthFlowResponse {
  success: boolean
  authUrl?: string
}

export interface PageData {
  url: string
  title: string
  domain: string
  timestamp: string
  selectedText: string
  pageContent: string
}

export interface CreateJournalEntryRequest {
  screenshot: string
  tradeDetails: {
    pair: string
    timeframe: string
    strategyId: string
    strategyComponent: string
    notes: string
    entryType: 'setup' | 'outcome'
    direction?: 'long' | 'short'
    entryPrice?: string
    stopLoss?: string
    takeProfit?: string
  }
  timestamp: string
}

export interface CreateJournalEntryResponse {
  success: boolean
  journalId?: string
  tradeId?: string
  error?: string
}