import type { PlasmoMessaging } from "@plasmohq/messaging"

interface TradeDetails {
  pair: string
  timeframe: string
  strategyId: string
  strategyComponent: string
  notes: string
  entryType: 'setup' | 'outcome'
}

interface CreateJournalEntryRequest {
  screenshot: string
  tradeDetails: TradeDetails
  timestamp: string
}

interface CreateJournalEntryResponse {
  success: boolean
  journalId?: string
  tradeId?: string
  error?: string
}

const handler: PlasmoMessaging.MessageHandler<CreateJournalEntryRequest, CreateJournalEntryResponse> = async (req, res) => {
  console.log('Creating journal entry')
  
  try {
    // Get stored auth token
    const result = await chrome.storage.local.get(['authToken'])
    const authToken = result.authToken
    
    if (!authToken) {
      res.send({
        success: false,
        error: 'Not authenticated'
      })
      return
    }

    // Send to backend API
    const response = await fetch('https://chartilyze-backend.convex.site/extension/journal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        screenshot: req.body.screenshot,
        tradeDetails: req.body.tradeDetails,
        timestamp: req.body.timestamp,
        source: 'extension'
      })
    })

    if (response.ok) {
      const data = await response.json()
      res.send({
        success: true,
        journalId: data.journalId,
        tradeId: data.tradeId
      })
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      res.send({
        success: false,
        error: errorData.error || 'Failed to create journal entry'
      })
    }
  } catch (error) {
    console.error('Journal entry creation error:', error)
    res.send({
      success: false,
      error: 'Network error'
    })
  }
}

export default handler