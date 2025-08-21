import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getApiUrl, API_CONFIG } from "~lib/config"

interface OpenAuthFlowRequest {
  name: "openAuthFlow"
}

interface OpenAuthFlowResponse {
  success: boolean
  authUrl?: string
}

const handler: PlasmoMessaging.MessageHandler<OpenAuthFlowRequest, OpenAuthFlowResponse> = async (req, res) => {
  console.log('Opening authentication flow')
  
  try {
    // Use localhost sign-in page instead of Convex
    const authUrl = getApiUrl(API_CONFIG.ENDPOINTS.AUTH_LOGIN)
    
    // Open auth URL in a new tab
    await chrome.tabs.create({
      url: authUrl,
      active: true
    })
    
    res.send({ 
      success: true, 
      authUrl 
    })
  } catch (error) {
    console.error('Failed to open auth flow:', error)
    res.send({ 
      success: false 
    })
  }
}

export default handler