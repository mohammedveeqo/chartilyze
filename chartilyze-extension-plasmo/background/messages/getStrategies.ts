import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getApiUrl, API_CONFIG } from "~lib/config"
import type { GetStrategiesRequest, StrategiesResponse } from "~lib/types"

const handler: PlasmoMessaging.MessageHandler<GetStrategiesRequest, StrategiesResponse> = async (req, res) => {
  console.log('🔍 [getStrategies] Starting strategy fetch...')
  
  try {
    // Get stored auth token for Convex
    const authToken = await chrome.storage.local.get(['authToken'])
    console.log('🔍 [getStrategies] Token found:', !!authToken.authToken)
    console.log('🔍 [getStrategies] Token preview:', authToken.authToken?.substring(0, 50) + '...')
    
    const url = getApiUrl(API_CONFIG.ENDPOINTS.STRATEGIES)
    console.log('🔍 [getStrategies] Fetching from:', url)
    
    const headers = {
      'Content-Type': 'application/json',
      // Include auth token if available
      ...(authToken.authToken && { 'Authorization': `Bearer ${authToken.authToken}` })
    }
    
    console.log('🔍 [getStrategies] Request headers:', headers)
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    console.log('🔍 [getStrategies] Response status:', response.status)
    console.log('🔍 [getStrategies] Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('🔍 [getStrategies] Strategies loaded:', data)
      res.send({
        strategies: data.strategies || data || [],
        success: true
      })
    } else {
      const errorText = await response.text()
      console.error('Failed to fetch strategies from Convex:', response.status, response.statusText)
      console.error('Error response body:', errorText)
      res.send({
        strategies: [],
        success: false,
        error: `HTTP ${response.status}: ${response.statusText} - ${errorText}`
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