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

  // Fixed: Changed from function declaration to method declaration and added async
  async handleMessage(request, sender, sendResponse) {
    try {
      console.log('Background received message:', request);
      
      switch (request.action) {
        case 'openPopup':
          // For side panel, we open the side panel instead
          try {
            await chrome.sidePanel.open({ windowId: sender.tab.windowId });
            console.log('Side panel opened successfully');
            sendResponse({ success: true });
          } catch (error) {
            console.error('Failed to open side panel:', error);
            sendResponse({ success: false, error: error.message });
          }
          break;
              
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

// Add side panel setup
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });