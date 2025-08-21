import type { PlasmoContentScript } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import { API_CONFIG } from "../lib/config"

// Extend Window interface to include custom Chartilyze functions
declare global {
  interface Window {
    chartilyzeExtractPageData: () => {
      url: string
      title: string
      domain: string
      timestamp: string
      selectedText: string
      pageContent: string
    }
  }
}

export const config: PlasmoContentScript = {
  matches: ["<all_urls>"]
}

// Add authentication detection
function detectAuthentication() {
  // Check if we're on a Chartilyze domain
  const isChartilyzeApp = window.location.hostname.includes('chartilyze.com') || 
                         window.location.hostname.includes('localhost')
  
  if (!isChartilyzeApp) return
  
  console.log('🔍 Authentication detection initialized on:', window.location.hostname)
  
  // Listen for authentication events from the website
  window.addEventListener('message', async (event) => {
    console.log('📨 Received message:', event.data)
    
    if (event.data.type === 'EXTENSION_AUTH_COMPLETE' && event.data.clerkData) {
      console.log('🔑 Authentication detected from website')
      
      try {
        // Fix: Use BASE_URL instead of CONVEX_URL for the extension-token endpoint
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/extension-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkSessionId: event.data.clerkData.sessionId,
            clerkUserId: event.data.clerkData.userId,
            clerkToken: event.data.clerkData.token
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // Store the token in extension storage
          await chrome.storage.local.set({
            authToken: data.extensionToken,
            userId: data.userId
          })
          
          console.log('✅ Authentication token stored successfully')
          
          // Notify the extension that auth is complete
          sendToBackground({
            name: "authComplete",
            body: { success: true }
          })
        }
      } catch (error) {
        console.error('❌ Failed to process authentication:', error)
      }
    }
  })
  
  // Also check for existing authentication on page load
  setTimeout(() => {
    // Trigger auth detection if we're on the auth page
    if (window.location.search.includes('extension=true')) {
      window.postMessage({ type: 'CHECK_AUTH_STATUS' }, '*')
    }
  }, 1000)
}

// Define the page data extraction function
window.chartilyzeExtractPageData = () => {
  return {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    timestamp: new Date().toISOString(),
    selectedText: getSelectedText(),
    pageContent: getPageSummary()
  }
}

function getSelectedText(): string {
  return window.getSelection()?.toString() || ''
}

function getPageSummary(): string {
  // Get main content, avoiding navigation and ads
  const content = document.querySelector('main, article, .content, #content')?.textContent ||
                 document.body.textContent || ''
  return content.slice(0, 2000) // Limit to 2000 characters
}

// No UI injection - users will click the extension icon instead
export default function ChartilyzeContent() {
  // Initialize authentication detection
  detectAuthentication()
  
  return null
}