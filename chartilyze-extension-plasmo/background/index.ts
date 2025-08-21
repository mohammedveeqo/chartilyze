import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { 
  ChatMessageRequest, 
  AuthCheckRequest, 
  ScreenshotRequest, 
  OpenSidePanelRequest,
  GetStrategiesRequest,
  ChatResponse,
  AuthResponse,
  ScreenshotResponse,
  StrategiesResponse
} from "~lib/types"
import { getApiUrl, API_CONFIG } from "~lib/config"

// Define message handlers type interface
type MessageHandlers = {
  sendChatMessage: PlasmoMessaging.MessageHandler<ChatMessageRequest, ChatResponse>,
  checkAuth: PlasmoMessaging.MessageHandler<AuthCheckRequest, AuthResponse>,
  captureScreenshot: PlasmoMessaging.MessageHandler<ScreenshotRequest, ScreenshotResponse>,
  openSidePanel: PlasmoMessaging.MessageHandler<OpenSidePanelRequest, { success: boolean }>,
  getStrategies: PlasmoMessaging.MessageHandler<GetStrategiesRequest, StrategiesResponse>
}

// Main message handler
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log('Background received message:', req.name, req.body)
  
  try {
    switch (req.name) {
      case 'openSidePanel':
        await chrome.sidePanel.open({ windowId: req.sender?.tab?.windowId })
        res.send({ success: true })
        break
        
      case 'sendChatMessage':
        const chatResponse = await sendChatMessage(req.body as ChatMessageRequest)
        res.send(chatResponse)
        break
        
      case 'checkAuth':
        const authResult = await checkAuthentication()
        res.send(authResult)
        break
        
      case 'captureScreenshot':
        const screenshot = await captureScreenshot(req.sender?.tab?.id)
        res.send({ success: true, screenshot })
        break
        
      case 'getStrategies':
        const strategies = await getStrategies()
        res.send({ success: true, strategies })
        break
        
      default:
        res.send({ success: false, error: 'Unknown action' })
    }
  } catch (error) {
    console.error('Background script error:', error)
    res.send({ success: false, error: error.message })
  }
}

async function sendChatMessage(data: ChatMessageRequest): Promise<ChatResponse> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CHAT), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getStoredToken()}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return {
      message: result.message || 'No response received',
      success: true
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return {
      message: 'Failed to send message',
      success: false
    }
  }
}

async function checkAuthentication(): Promise<AuthResponse> {
  try {
    const token = await getStoredToken()
    if (!token) {
      return { isAuthenticated: false }
    }
    
    // Verify token with backend - pass token as query parameter
    const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.AUTH_VERIFY)}?token=${encodeURIComponent(token)}`, {
      method: 'GET'
    })
    
    if (response.ok) {
      const result = await response.json()
      return {
        isAuthenticated: result.valid === true,
        user: { 
          id: result.userId, // Changed from userId to id to match AuthResponse type
          email: result.email || '' // Add email field as required by type
        }
      }
    } else {
      return { isAuthenticated: false }
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return { isAuthenticated: false }
  }
}

async function getStoredToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(['authToken'])
  return result.authToken || null
}

async function captureScreenshot(tabId?: number): Promise<string> {
  if (!tabId) {
    throw new Error('No tab ID provided')
  }
  
  const screenshot = await chrome.tabs.captureVisibleTab(undefined, {
    format: 'png',
    quality: 90
  })
  
  return screenshot
}

async function getStrategies(): Promise<any[]> {
  try {
    const token = await getStoredToken()
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.STRATEGIES), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.strategies || []
    }
    
    return []
  } catch (error) {
    console.error('Failed to fetch strategies:', error)
    return []
  }
}

// Set up side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "chartilyze-analyze",
    title: "Analyze with Chartilyze",
    contexts: ["page"]
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "chartilyze-analyze" && tab?.id) {
    chrome.sidePanel.open({ windowId: tab.windowId })
  }
})

export default handler