import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getApiUrl, API_CONFIG } from "~lib/config"
import type { ChatMessageRequest, ChatResponse } from "~lib/types"

const handler: PlasmoMessaging.MessageHandler<ChatMessageRequest, ChatResponse> = async (req, res) => {
  console.log('Sending chat message to Convex')
  
  try {
    const { message, strategyContext, conversationHistory } = req.body
    
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
        strategyContext,
        conversationHistory
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('🤖 AI Response received:', data)
      
      // The backend returns a ChatbotResponse with { message, confidence, suggestedActions?, relatedRules? }
      // Match the web implementation's response handling but exclude confidence
      res.send({
        message: data.message,
        success: true,
        suggestedActions: data.suggestedActions,
        relatedRules: data.relatedRules
      })
    } else {
      console.error('Chat request failed:', response.status)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      
      // Try to parse error as JSON for better error messages
      let errorMessage = `Failed to send message (${response.status})`
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error || errorData.details) {
          errorMessage = errorData.error || errorData.details
        }
      } catch {
        // Keep default error message if parsing fails
      }
      
      res.send({
        message: errorMessage,
        success: false
      })
    }
  } catch (error) {
    console.error('Error sending chat message:', error)
    res.send({
      message: 'Failed to send message. Please check your connection.',
      success: false
    })
  }
}

export default handler