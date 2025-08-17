class ChartilyzeAssistant {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.setupAutoResize();
        this.showWelcomeMessage();
    }

    bindElements() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        this.messageInput.addEventListener('input', () => this.handleInputChange());
    }

    setupAutoResize() {
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
    }

    showWelcomeMessage() {
        // Show a simple notification that the assistant is ready
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = 'Assistant ready. Ask me about the current chart.';
        this.messagesContainer.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    handleInputChange() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isLoading;
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage();
        }
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;

        // Add user message
        this.addMessage(message, 'user');
        this.conversationHistory.push({ role: 'user', content: message });
        
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.handleInputChange();

        // Show loading
        this.showLoading();

        try {
            // Get chart data from the current tab
            const chartData = await this.getChartData();
            
            // Send to API with chart context
            const response = await this.sendToAPI(message, chartData);
            this.hideLoading();
            
            this.addMessage(response.message || response, 'bot');
            this.conversationHistory.push({ role: 'assistant', content: response.message || response });
            
            // Keep conversation history manageable
            if (this.conversationHistory.length > 6) {
                this.conversationHistory = this.conversationHistory.slice(-6);
            }
        } catch (error) {
            this.hideLoading();
            this.addMessage('I\'m having trouble analyzing the chart right now. Please try again.', 'bot', true);
            console.error('Chat error:', error);
        }
    }

    async getChartData() {
        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Execute script to get chart data
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    // Extract chart information from TradingView
                    const symbol = document.querySelector('[data-name="legend-source-item"]')?.textContent || 
                                 document.querySelector('.js-symbol-link')?.textContent ||
                                 'Unknown';
                    
                    const timeframe = document.querySelector('[data-name="time-interval"]')?.textContent ||
                                    'Unknown';
                    
                    return {
                        symbol: symbol.trim(),
                        timeframe: timeframe.trim(),
                        url: window.location.href,
                        timestamp: new Date().toISOString()
                    };
                }
            });
            
            return results[0]?.result || { symbol: 'Unknown', timeframe: 'Unknown' };
        } catch (error) {
            console.error('Error getting chart data:', error);
            return { symbol: 'Unknown', timeframe: 'Unknown' };
        }
    }

    async sendToAPI(message, chartData) {
        // For now, provide intelligent responses based on the message content
        // You can replace this with your actual API call later
        return this.generateResponse(message, chartData);
    }

    generateResponse(message, chartData) {
        const lowerMessage = message.toLowerCase();
        const symbol = chartData.symbol !== 'Unknown' ? chartData.symbol : 'this chart';
        
        if (lowerMessage.includes('analyze') || lowerMessage.includes('chart')) {
            return `Looking at ${symbol}, I can help you analyze the current setup. What specific aspect would you like me to focus on - price action, support/resistance levels, or trend analysis?`;
        } else if (lowerMessage.includes('strategy') || lowerMessage.includes('trade')) {
            return `For ${symbol}, I can help you evaluate potential trade setups. What's your trading strategy or what signals are you looking for?`;
        } else if (lowerMessage.includes('support') || lowerMessage.includes('resistance')) {
            return `I can help identify key support and resistance levels on ${symbol}. Are you looking at any specific price levels or time frames?`;
        } else if (lowerMessage.includes('trend')) {
            return `Let me help you analyze the trend on ${symbol}. Are you looking at the overall trend direction or specific trend reversal signals?`;
        } else {
            return `I'm here to help you analyze ${symbol}. You can ask me about chart patterns, support/resistance levels, trend analysis, or trading strategies.`;
        }
    }

    addMessage(content, type, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = `message-content ${isError ? 'error-message' : ''}`;
        messageContent.innerHTML = this.formatMessage(content);
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showLoading() {
        this.isLoading = true;
        this.handleInputChange();
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-message';
        loadingDiv.id = 'loadingMessage';
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'loading-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-dot';
            dotsContainer.appendChild(dot);
        }
        
        loadingDiv.appendChild(dotsContainer);
        this.messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    hideLoading() {
        this.isLoading = false;
        this.handleInputChange();
        
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize assistant when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ChartilyzeAssistant());
} else {
    new ChartilyzeAssistant();
}