import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { ScreenshotRequest, ScreenshotResponse } from "~lib/types"

const handler: PlasmoMessaging.MessageHandler<ScreenshotRequest, ScreenshotResponse> = async (req, res) => {
  console.log('Capturing screenshot')
  
  try {
    const screenshot = await chrome.tabs.captureVisibleTab(undefined, {
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
      success: false
    })
  }
}

export default handler