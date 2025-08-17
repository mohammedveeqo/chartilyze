// background.js - Updated for Convex HTTP API
class ChartilyzeBackground {
  constructor() {
    // Use your actual Convex deployment URL
    this.apiBaseUrl = 'https://decisive-tapir-206.convex.site';
    
    
    this.init();
  }

  init() {
    this.setupMessageListeners();
    this.setupContextMenus();
    this.setupTabListeners();
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'sendChatMessage':
          const chatResponse = await this.sendChatMessage(request.data);
          sendResponse({ success: true, data: chatResponse });
          break;

        case 'captureScreenshot':
          const screenshot = await this.captureScreenshot(sender.tab.id);
          sendResponse({ success: true, data: screenshot });
          break;

        case 'createJournal':
          const journal = await this.createJournalEntry(request.data);
          sendResponse({ success: true, data: journal });
          break;

        case 'analyzeChart':
          const analysis = await this.analyzeChart(request.data);
          sendResponse({ success: true, data: analysis });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async sendChatMessage({ message, strategyContext, conversationHistory }) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          strategyContext,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      return {
        message: "I'm having trouble connecting to the AI service. Please try again.",
        confidence: 0.1
      };
    }
  }

  async createJournalEntry({ name, description, strategy, chartData, userId }) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          strategy,
          chartData,
          userId: userId || 'extension-user' // Default for development
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Journal creation error:', error);
      throw new Error('Failed to create journal entry');
    }
  }

  async analyzeChart({ imageBase64, prompt, analysisType = 'trade' }) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          prompt,
          analysisType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chart analysis error:', error);
      throw new Error('Failed to analyze chart');
    }
  }

  async captureScreenshot(tabId) {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: 'png',
        quality: 90
      });
      
      return {
        dataUrl,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Screenshot capture error:', error);
      throw new Error('Failed to capture screenshot');
    }
  }

  setupContextMenus() {
    chrome.contextMenus.create({
      id: 'chartilyze-analyze',
      title: 'Analyze with Chartilyze',
      contexts: ['page'],
      documentUrlPatterns: ['*://*.tradingview.com/*']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'chartilyze-analyze') {
        chrome.tabs.sendMessage(tab.id, { action: 'openChartilyze' });
      }
    });
  }

  setupTabListeners() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && 
          tab.url && 
          tab.url.includes('tradingview.com')) {
        // Inject content script if not already injected
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['src/content.js']
        }).catch(() => {
          // Script might already be injected, ignore error
        });
      }
    });
  }
}

// Initialize background script
new ChartilyzeBackground();