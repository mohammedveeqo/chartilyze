import type { PlasmoMessaging } from "@plasmohq/messaging"

interface AuthCompleteRequest {
  success: boolean
}

interface AuthCompleteResponse {
  received: boolean
}

const handler: PlasmoMessaging.MessageHandler<AuthCompleteRequest, AuthCompleteResponse> = async (req, res) => {
  console.log('🎉 Authentication completed successfully')
  
  // You could trigger a refresh of the popup or sidepanel here
  // or send notifications to open tabs
  
  res.send({ received: true })
}

export default handler