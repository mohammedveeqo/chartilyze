export interface ChatMessageRequest {
  message: string
  context: string
  strategy?: string // Add optional strategy property
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
}

export interface ChatResponse {
  message: string
  success: boolean
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