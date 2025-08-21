import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getApiUrl, API_CONFIG } from "~lib/config"
import type { AuthCheckRequest, AuthResponse } from "~lib/types"

const handler: PlasmoMessaging.MessageHandler<AuthCheckRequest, AuthResponse> = async (req, res) => {
  try {
    console.log('🔍 [checkAuth] Starting auth check...') // Debug log
    
    // Get stored auth token
    const result = await chrome.storage.local.get(['authToken'])
    const token = result.authToken
    
    console.log('🔍 [checkAuth] Token from storage:', token ? 'Found' : 'Not found') // Debug log
    
    if (!token) {
      console.log('❌ [checkAuth] No token found, returning unauthenticated') // Debug log
      res.send({ isAuthenticated: false })
      return
    }
    
    const verifyUrl = `${getApiUrl(API_CONFIG.ENDPOINTS.AUTH_VERIFY)}?token=${encodeURIComponent(token)}`
    console.log('🔍 [checkAuth] Verifying token at:', verifyUrl) // Debug log
    
    // Pass token as query parameter to match Convex backend expectation
    const response = await fetch(verifyUrl, {
      method: 'GET'
    })
    
    console.log('🔍 [checkAuth] Verification response status:', response.status) // Debug log
    
    if (response.ok) {
      const result = await response.json()
      console.log('🔍 [checkAuth] Verification result:', result) // Debug log
      
      const isValid = result.authenticated === true
      console.log('✅ [checkAuth] Authentication result:', isValid ? 'Valid' : 'Invalid') // Debug log
      
      res.send({
        isAuthenticated: isValid,
        user: { 
          id: result.userId,
          email: result.email || ''
        }
      })
    } else {
      console.log('❌ [checkAuth] Verification failed with status:', response.status) // Debug log
      res.send({ isAuthenticated: false })
    }
  } catch (error) {
    console.error('❌ [checkAuth] Auth check error:', error)
    res.send({ isAuthenticated: false })
  }
}

export default handler