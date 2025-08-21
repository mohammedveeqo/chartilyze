import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getApiUrl, API_CONFIG } from "~lib/config"
import type { AuthCheckRequest, AuthResponse } from "~lib/types"

const handler: PlasmoMessaging.MessageHandler<AuthCheckRequest, AuthResponse> = async (req, res) => {
  try {
    // Use localhost auth verification endpoint
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH_VERIFY), {
      method: 'GET',
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const user = await response.json()
      res.send({
        isAuthenticated: true,
        user
      })
    } else {
      res.send({ isAuthenticated: false })
    }
  } catch (error) {
    console.error('Auth check error:', error)
    res.send({ isAuthenticated: false })
  }
}

export default handler