class ChartilyzeChat {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.currentStrategy = null;
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.setupAutoResize();
        this.setInitialTime();
        this.loadCurrentStrategy();
    }

    bindElements() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.quickActions = document.querySelectorAll('.quick-action');
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        
        this.quickActions.forEach(button => {
            button.addEventListener('click', () => this.handleQuickAction(button.dataset.action));
        });
    }

    setInitialTime() {
        const timeElement = document.getElementById('initialTime');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    setupAutoResize() {
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
    }

    async loadCurrentStrategy() {
        try {
            // Try to get current strategy from storage or API
            const result = await chrome.storage.local.get(['currentStrategy']);
            if (result.currentStrategy) {
                this.currentStrategy = result.currentStrategy;
                this.updateHeaderWithStrategy();
            }
        } catch (error) {
            console.log('No strategy context available:', error);
        }
    }

    updateHeaderWithStrategy() {
        if (this.currentStrategy) {
            const subtitle = document.querySelector('.header-subtitle');
            if (subtitle) {
                subtitle.textContent = `Active: ${this.currentStrategy.name}`;
            }
        }
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

    handleQuickAction(action) {
        const prompts = {
            analyze: "Can you help me analyze the current chart setup?",
            strategy: "I need guidance on my current trading strategy",
            journal: "How should I document this trade in my journal?"
        };
        
        if (prompts[action]) {
            this.messageInput.value = prompts[action];
            this.handleInputChange();
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
            const response = await this.sendToAPI(message);
            this.hideLoading();
            
            // Add bot message with enhanced formatting
            this.addMessage(response.message, 'bot', false, response);
            this.conversationHistory.push({ role: 'assistant', content: response.message });
            
            // Keep conversation history manageable (last 6 messages)
            if (this.conversationHistory.length > 6) {
                this.conversationHistory = this.conversationHistory.slice(-6);
            }
        } catch (error) {
            this.hideLoading();
            this.addMessage('Sorry, I encountered an error connecting to the server. Please try again.', 'bot', true);
            console.error('Chat error:', error);
        }
    }

    async sendToAPI(message) {
        // ✅ Fixed: Use the correct HTTP Actions URL with proper endpoint
        const API_URL = 'https://decisive-tapir-206.convex.site/extension/chat';
        
        const requestBody = {
            message: message,
            strategyContext: this.currentStrategy ? {
                name: this.currentStrategy.name,
                rules: this.currentStrategy.rules || [],
                components: this.currentStrategy.components,
                complexity: this.currentStrategy.complexity,
                riskProfile: this.currentStrategy.riskProfile
            } : undefined,
            conversationHistory: this.conversationHistory
        };
    
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
    
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
    
        return await response.json();
    }

    addMessage(content, type, isError = false, responseData = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}`;
        avatar.textContent = type === 'bot' ? '🤖' : '👤';
        
        const contentWrapper = document.createElement('div');
        
        const messageContent = document.createElement('div');
        messageContent.className = `message-content ${isError ? 'error-message' : ''}`;
        
        // Enhanced markdown formatting
        const formattedContent = this.formatMessage(content);
        messageContent.innerHTML = formattedContent;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        contentWrapper.appendChild(messageContent);
        
        // Add related rules if available (like in web app)
        if (responseData?.relatedRules && responseData.relatedRules.length > 0) {
            const rulesSection = document.createElement('div');
            rulesSection.style.cssText = 'margin-top: 12px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; border-left: 3px solid #3b82f6;';
            
            const rulesHeader = document.createElement('div');
            rulesHeader.style.cssText = 'font-size: 11px; color: #3b82f6; font-weight: 600; margin-bottom: 4px;';
            rulesHeader.textContent = '💡 Related Strategy Rules';
            
            const rulesList = document.createElement('ul');
            rulesList.style.cssText = 'font-size: 11px; color: #d1d5db; margin: 0; padding-left: 16px;';
            
            responseData.relatedRules.forEach(rule => {
                const listItem = document.createElement('li');
                listItem.style.cssText = 'margin: 2px 0;';
                listItem.textContent = rule;
                rulesList.appendChild(listItem);
            });
            
            rulesSection.appendChild(rulesHeader);
            rulesSection.appendChild(rulesList);
            contentWrapper.appendChild(rulesSection);
        }
        
        contentWrapper.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentWrapper);
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code style="background: rgba(59, 130, 246, 0.2); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
            .replace(/###\s*(.*?)(?=\n|$)/g, '<h3 style="font-size: 14px; font-weight: 600; margin: 8px 0 4px 0; color: #3b82f6;">$1</h3>')
            .replace(/•\s*(.*?)(?=\n|$)/g, '<div style="margin: 4px 0; padding-left: 16px; position: relative;"><span style="position: absolute; left: 0; color: #3b82f6;">•</span>$1</div>')
            .replace(/\n/g, '<br>');
    }

    showLoading() {
        this.isLoading = true;
        this.handleInputChange();
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-message';
        loadingDiv.id = 'loadingMessage';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar bot';
        avatar.textContent = '🤖';
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'loading-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-dot';
            dotsContainer.appendChild(dot);
        }
        
        loadingDiv.appendChild(avatar);
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

// Initialize chat when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ChartilyzeChat());
} else {
    new ChartilyzeChat();
}