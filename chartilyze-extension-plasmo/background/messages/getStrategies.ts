import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getApiUrl, API_CONFIG } from "~lib/config"
import type { GetStrategiesRequest, StrategiesResponse } from "~lib/types"

const handler: PlasmoMessaging.MessageHandler<GetStrategiesRequest, StrategiesResponse> = async (req, res) => {
  console.log('Getting strategies from Convex')
  
  try {
    // Get stored auth token for Convex
    const authToken = await chrome.storage.local.get(['authToken'])
    
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.STRATEGIES), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available
        ...(authToken.authToken && { 'Authorization': `Bearer ${authToken.authToken}` })
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('Strategies loaded from Convex:', data)
      res.send({
        strategies: data.strategies || data || [],
        success: true
      })
    } else {
      console.error('Failed to fetch strategies from Convex:', response.status, response.statusText)
      res.send({
        strategies: [],
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      })
    }
  } catch (error) {
    console.error('Failed to fetch strategies from Convex:', error)
    res.send({
      strategies: [],
      success: false,
      error: error.message
    })
  }
}

export default handler