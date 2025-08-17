// Popup.js - Chat interface functionality
class ChartilyzeChat {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadChatHistory();
        this.setupAutoResize();
    }

    bindElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.captureBtn = document.getElementById('captureBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.quickActions = document.querySelectorAll('.quick-action');
    }

    bindEvents() {
        // Send button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send (Shift+Enter for new line)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input change to enable/disable send button
        this.messageInput.addEventListener('input', () => {
            this.updateSendButton();
        });

        // Capture button
        this.captureBtn.addEventListener('click', () => this.captureChart());

        // Quick actions
        this.quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    setupAutoResize() {
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
    }

    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText || this.isLoading;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.updateSendButton();
        this.messageInput.style.height = 'auto';

        // Show loading
        this.setLoading(true);

        try {
            // Get current tab info for context
            const tabInfo = await this.getCurrentTabInfo();
            
            // Send to background script
            const response = await this.sendToBackground({
                type: 'CHAT_MESSAGE',
                message: message,
                context: tabInfo
            });

            if (response.success) {
                this.addMessage(response.reply, 'ai');
            } else {
                this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage('Connection error. Please check your internet connection.', 'ai');
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'ai') {
            avatar.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
            `;
        } else {
            avatar.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
        }

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = `<p>${this.formatMessage(content)}</p>`;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Save to storage
        this.saveMessage({ content, sender, timestamp: Date.now() });
    }

    formatMessage(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.loadingIndicator.style.display = loading ? 'flex' : 'none';
        this.updateSendButton();
        
        if (loading) {
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    // Enhanced chart capture functionality
    async captureChart() {
        try {
            this.setLoading(true, 'Capturing chart...');
            
            // Get current tab info and chart data
            const tabInfo = await this.getTabInfo();
            const chartData = await this.getChartData();
            
            // Capture screenshot
            const screenshotResult = await chrome.runtime.sendMessage({
            action: 'captureScreenshot'
            });
            
            if (!screenshotResult.success) {
            throw new Error(screenshotResult.error);
            }
            
            // Analyze the chart with AI
            this.setLoading(true, 'Analyzing chart with AI...');
            const analysisResult = await chrome.runtime.sendMessage({
            action: 'analyzeChart',
            data: {
            imageBase64: screenshotResult.data.dataUrl,
            prompt: `Analyze this ${chartData.symbol || 'trading'} chart on ${chartData.timeframe || 'unknown'} timeframe`,
            analysisType: 'trade'
            }
            });
            
            if (analysisResult.success) {
            // Display analysis results
            const analysis = analysisResult.data;
            const analysisMessage = this.formatAnalysisMessage(analysis);
            this.addMessage(analysisMessage, 'ai');
            
            // Offer to create journal entry
            this.showJournalCreationPrompt({
            screenshot: screenshotResult.data,
            chartData,
            analysis
            });
            }
            
        } catch (error) {
            console.error('Chart capture error:', error);
            this.addMessage('❌ Failed to capture and analyze chart. Please try again.', 'ai');
        } finally {
            this.setLoading(false);
        }
    }
    
    // Format AI analysis for display
    formatAnalysisMessage(analysis) {
        let message = '📊 **Chart Analysis Results**\n\n';
        
        if (analysis.symbol) {
            message += `**Symbol:** ${analysis.symbol}\n`;
        }
        
        if (analysis.timeframe) {
            message += `**Timeframe:** ${analysis.timeframe}\n`;
        }
        
        if (analysis.type) {
            message += `**Setup Type:** ${analysis.type}\n`;
        }
        
        if (analysis.confidence) {
            message += `**Confidence:** ${Math.round(analysis.confidence * 100)}%\n`;
        }
        
        if (analysis.riskReward) {
            message += `**Risk/Reward:** ${analysis.riskReward}\n`;
        }
        
        message += `\n**Analysis:**\n${analysis.reasoning}`;
        
        if (analysis.strategyMatch) {
            message += `\n\n**Strategy Match:** ${Math.round(analysis.strategyMatch.matchConfidence * 100)}%`;
            if (analysis.strategyMatch.matchedComponents.length > 0) {
                message += `\n**Matched Components:** ${analysis.strategyMatch.matchedComponents.join(', ')}`;
            }
        }
        
        return message;
    }
    
    // Show journal creation prompt
    showJournalCreationPrompt(captureData) {
        const journalPrompt = document.createElement('div');
        journalPrompt.className = 'journal-prompt';
        journalPrompt.innerHTML = `
            <div class="journal-prompt-content">
              <h3>📝 Create Journal Entry</h3>
              <p>Would you like to save this analysis as a journal entry?</p>
              <div class="journal-prompt-buttons">
                <button class="btn-primary" id="createJournalBtn">Create Journal</button>
                <button class="btn-secondary" id="dismissJournalBtn">Not Now</button>
              </div>
            </div>
          `;
        
        this.chatMessages.appendChild(journalPrompt);
        this.scrollToBottom();
        
        // Handle journal creation
        document.getElementById('createJournalBtn').addEventListener('click', () => {
            this.createJournalEntry(captureData);
            journalPrompt.remove();
        });
        
        document.getElementById('dismissJournalBtn').addEventListener('click', () => {
            journalPrompt.remove();
        });
    }
    
    // Create journal entry
    async createJournalEntry(captureData) {
        try {
            this.setLoading(true, 'Creating journal entry...');
            
            const journalData = {
            name: `${captureData.chartData.symbol || 'Chart'} Analysis - ${new Date().toLocaleDateString()}`,
            description: `Trading analysis captured from TradingView on ${new Date().toLocaleString()}`,
            chartData: {
                ...captureData.chartData,
                screenshot: captureData.screenshot.dataUrl,
                analysis: captureData.analysis,
                capturedAt: captureData.screenshot.timestamp
            },
            userId: 'extension-user' // For development
            };
            
            const result = await chrome.runtime.sendMessage({
            action: 'createJournal',
            data: journalData
            });
            
            if (result.success) {
                this.addMessage('✅ **Journal entry created successfully!**\n\nYour chart analysis has been saved to your trading journal.', 'ai');
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Journal creation error:', error);
            this.addMessage('❌ Failed to create journal entry. Please try again.', 'ai');
        } finally {
            this.setLoading(false);
        }
    }
    
    // Get enhanced chart data
    async getChartData() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getChartData' }, (response) => {
                    resolve(response || {
                        symbol: null,
                        timeframe: null,
                        indicators: [],
                        viewport: null
                    });
                });
            });
        });
    }

    handleQuickAction(action) {
        const prompts = {
            analyze: "Please analyze the current chart and provide insights on potential trading opportunities.",
            strategy: "Can you help me develop a trading strategy based on the current market conditions?",
            journal: "Please capture the current chart and create a journal entry with my analysis."
        };

        if (prompts[action]) {
            this.messageInput.value = prompts[action];
            this.updateSendButton();
            this.messageInput.focus();
        }
    }

    async getCurrentTabInfo() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
            return {
                url: tab.url,
                title: tab.title,
                isTradingView: tab.url.includes('tradingview.com')
            };
        } catch (error) {
            console.error('Error getting tab info:', error);
            return { url: '', title: '', isTradingView: false };
        }
    }

    async sendToBackground(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(response || { success: false, error: 'No response' });
            });
        });
    }

    async loadChatHistory() {
        try {
            const result = await chrome.storage.local.get(['chatHistory']);
            const history = result.chatHistory || [];
            
            // Load last 20 messages
            const recentMessages = history.slice(-20);
            
            recentMessages.forEach(msg => {
                this.addMessageToDOM(msg.content, msg.sender);
            });
            
            this.scrollToBottom();
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    addMessageToDOM(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'ai') {
            avatar.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
            `;
        } else {
            avatar.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
        }

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = `<p>${this.formatMessage(content)}</p>`;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
    }

    async saveMessage(message) {
        try {
            const result = await chrome.storage.local.get(['chatHistory']);
            const history = result.chatHistory || [];
            
            history.push(message);
            
            // Keep only last 100 messages
            if (history.length > 100) {
                history.splice(0, history.length - 100);
            }
            
            await chrome.storage.local.set({ chatHistory: history });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    }
}

// Initialize chat when popup loads
document.addEventListener('DOMContentLoaded', () => {
    new ChartilyzeChat();
});

// Handle popup close/open events
window.addEventListener('beforeunload', () => {
    // Save any pending state
});