class ChartilyzeChat {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.setupAutoResize();
        this.setInitialTime();
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
            analyze: "Can you help me analyze the current chart?",
            strategy: "I need help with my trading strategy",
            journal: "How should I document this trade?"
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
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.handleInputChange();

        // Show loading
        this.showLoading();

        try {
            // For now, simulate AI response since we need to fix the backend connection
            const response = await this.simulateAIResponse(message);
            this.hideLoading();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideLoading();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot', true);
            console.error('Chat error:', error);
        }
    }

    async simulateAIResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Simple response logic for demo
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('analyze') || lowerMessage.includes('chart')) {
            return "I can see you're interested in chart analysis. To provide better insights, I would need to connect to the chart data from TradingView. This feature is currently being enhanced to work with your trading strategy.";
        } else if (lowerMessage.includes('strategy')) {
            return "Great question about strategy! A solid trading strategy should include:\n\n• **Entry criteria** - Clear signals for when to enter\n• **Exit rules** - Both profit targets and stop losses\n• **Risk management** - Position sizing and maximum risk per trade\n• **Market conditions** - When your strategy works best\n\nWhat specific aspect of your strategy would you like to discuss?";
        } else if (lowerMessage.includes('journal')) {
            return "Excellent! Keeping a trading journal is crucial for improvement. Here's what you should document:\n\n• **Trade setup** - Why you entered the trade\n• **Market context** - What was happening in the market\n• **Emotions** - How you felt before, during, and after\n• **Outcome** - What happened and why\n• **Lessons** - What you learned for next time\n\nWould you like help setting up a specific journal entry?";
        } else {
            return "I'm here to help with your trading questions! I can assist with chart analysis, strategy development, risk management, and trade journaling. What specific trading topic would you like to explore?";
        }
    }

    addMessage(content, type, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}`;
        avatar.textContent = type === 'bot' ? '🤖' : '👤';
        
        const contentWrapper = document.createElement('div');
        
        const messageContent = document.createElement('div');
        messageContent.className = `message-content ${isError ? 'error-message' : ''}`;
        
        // Simple markdown-like formatting
        const formattedContent = this.formatMessage(content);
        messageContent.innerHTML = formattedContent;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        contentWrapper.appendChild(messageContent);
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