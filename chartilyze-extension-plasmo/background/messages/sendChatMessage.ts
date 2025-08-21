import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getApiUrl, API_CONFIG } from "~lib/config"
import type { ChatMessageRequest, ChatResponse } from "~lib/types"

const handler: PlasmoMessaging.MessageHandler<ChatMessageRequest, ChatResponse> = async (req, res) => {
  console.log('Sending chat message to Convex')
  
  try {
    const { message, context, strategy } = req.body
    
    // Get stored auth token
    const authToken = await chrome.storage.local.get(['authToken'])
    
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CHAT), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken.authToken && { 'Authorization': `Bearer ${authToken.authToken}` })
      },
      body: JSON.stringify({
        message,
        context,
        strategy
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      res.send({
        message: data.message || data.response || 'Response received',
        success: true
      })
    } else {
      console.error('Chat request failed:', response.status)
      res.send({
        message: `Failed to send message (${response.status})`,
        success: false
      })
    }
  } catch (error) {
    console.error('Error sending chat message:', error)
    res.send({
      message: 'Failed to send message',
      success: false
    })
  }
}

export default handler