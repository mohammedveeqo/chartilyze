import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { ScreenshotRequest, ScreenshotResponse } from "~lib/types"

const handler: PlasmoMessaging.MessageHandler<ScreenshotRequest, ScreenshotResponse> = async (req, res) => {
  console.log('Capturing screenshot')
  
  try {
    // Get the current active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    if (!activeTab || !activeTab.id) {
      throw new Error('No active tab found')
    }
    
    // Use host_permissions instead of activeTab for sidepanel
    const screenshot = await chrome.tabs.captureVisibleTab(activeTab.windowId, {
      format: 'png',
      quality: 90
    })
    
    res.send({
      screenshot,
      success: true
    })
  } catch (error) {
    console.error('Screenshot error:', error)
    res.send({
      screenshot: '',
      success: false,
      error: error.message
    })
  }
}

export default handler