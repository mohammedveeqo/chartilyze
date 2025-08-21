import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { OpenSidePanelRequest } from "~lib/types"

const handler: PlasmoMessaging.MessageHandler<OpenSidePanelRequest> = async (req, res) => {
  try {
    // Open the side panel
    await chrome.sidePanel.open({
      tabId: req.sender?.tab?.id
    })
    
    console.log('✅ Side panel opened successfully')
    res.send({ success: true })
  } catch (error) {
    console.error('❌ Failed to open side panel:', error)
    res.send({ success: false, error: error.message })
  }
}

export default handler