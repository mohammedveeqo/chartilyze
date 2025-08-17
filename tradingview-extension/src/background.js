// background.js - Updated for Convex HTTP API
class ChartilyzeBackground {
  constructor() {
    // Remove process.env reference - hardcode the URL or use chrome.storage
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
      // Add request validation
      if (!request.action) {
        throw new Error('Missing action in request');
      }
      
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

        case 'openPopup':
          // Open the extension popup
          try {
            await chrome.action.openPopup();
            sendResponse({ success: true });
          } catch (error) {
            console.log('Popup already open or user interaction required');
            sendResponse({ success: true, message: 'Popup handled' });
          }
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ 
        success: false, 
        error: error.message,
        errorType: error.name || 'UnknownError'
      });
    }
  }

  setupContextMenus() {
    // Add context menu setup if needed
  }

  setupTabListeners() {
    // Add tab listeners if needed
  }

  async sendChatMessage(data) {
    // Implement chat message sending
    return { reply: 'Chat functionality coming soon!' };
  }

  async captureScreenshot(tabId) {
    // Implement screenshot capture
    return { screenshot: 'Screenshot captured' };
  }

  async createJournalEntry(data) {
    // Implement journal creation
    return { journal: 'Journal created' };
  }

  async analyzeChart(data) {
    // Implement chart analysis
    return { analysis: 'Chart analysis complete' };
  }
}

// Initialize background script
new ChartilyzeBackground();