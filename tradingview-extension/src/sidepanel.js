import AuthManager from './auth.js';

class ChartilyzeAssistant {
    constructor() {
        console.log('🚀 ChartilyzeAssistant constructor started');
        this.messages = [];
        this.isLoading = false;
        this.conversationHistory = [];
        this.currentStrategy = null;
        this.backendUrl = 'https://decisive-tapir-206.convex.site';
        
        try {
// Around line 13-14, replace the AuthManager creation with:
console.log('🔧 Creating AuthManager instance...');
this.authManager = new AuthManager({
    webAppUrl: 'http://localhost:3000',
    backendUrl: 'https://decisive-tapir-206.convex.site'
});
            console.log('✅ AuthManager created successfully');
        } catch (error) {
            console.error('❌ Failed to create AuthManager:', error);
            console.error('Make sure auth.js is loaded before sidepanel.js');
            return;
        }
        
        console.log('🔄 Starting initialization...');
        this.init();
    }

    async init() {
        console.log('📋 Binding elements and events...');
        this.bindElements();
        this.bindEvents();
        this.setupAutoResize();
        
        // Check authentication first
        console.log('🔍 Starting authentication check...');
        try {
            const authResult = await this.authManager.checkAuthentication();
            console.log('🔍 Auth result:', authResult);
            console.log('🔍 Auth result type:', typeof authResult);
            console.log('🔍 Auth result.authenticated:', authResult?.authenticated);
            
            if (authResult && authResult.authenticated) {
                console.log('✅ User is authenticated, showing main UI');
                this.showMainUI();
                this.loadCurrentStrategy();
                this.loadAvailableStrategies();
                this.showWelcomeMessage();
            } else {
                console.log('❌ User is not authenticated, showing sign-in UI');
                this.showSignInUI();
            }
        } catch (error) {
            console.error('💥 Error during authentication check:', error);
            console.log('🔄 Falling back to sign-in UI');
            this.showSignInUI();
        }
    }

    bindElements() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.quickActions = document.querySelectorAll('.quick-action');
        this.strategySubtitle = document.getElementById('strategySubtitle');
        this.strategyDropdownBtn = document.getElementById('strategyDropdownBtn');
        this.strategyDropdown = document.getElementById('strategyDropdown');
        this.selectedStrategySpan = document.getElementById('selectedStrategy');
        this.strategyList = document.getElementById('strategyList');
        this.strategySearch = document.getElementById('strategySearch');
        
        // Authentication elements
        this.authContainer = document.getElementById('authContainer');
        this.signInButton = document.getElementById('signInButton');
        this.authLoading = document.getElementById('authLoading');
        this.authError = document.getElementById('authError');
        
        // Main UI containers
        this.quickActionsContainer = document.querySelector('.quick-actions');
        this.strategySelectorContainer = document.querySelector('.strategy-selector');
        this.inputContainer = document.querySelector('.input-container');
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.messageInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        
        // Bind quick action buttons
        this.quickActions.forEach(button => {
            button.addEventListener('click', () => this.handleQuickAction(button.dataset.action));
        });
        
        // Authentication events
        if (this.signInButton) {
            this.signInButton.addEventListener('click', () => this.handleSignIn());
        }
        
        // Strategy selector events
        if (this.strategyDropdownBtn) {
            this.strategyDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleStrategyDropdown();
            });
        }

        if (this.strategySearch) {
            this.strategySearch.addEventListener('input', (e) => {
                this.filterStrategies(e.target.value);
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeStrategyDropdown();
        });

        if (this.strategyDropdown) {
            this.strategyDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

async loadAvailableStrategies() {
    console.log('Loading strategies from:', `${this.backendUrl}/extension/strategies`);
    try {
        // Get user token from storage or web app
        const userToken = await this.getUserToken();
        
        const response = await fetch(`${this.backendUrl}/extension/strategies`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Strategies data:', data);
            this.availableStrategies = data.strategies || [];
            this.renderStrategyList();
        } else {
            const errorText = await response.text();
            console.error('Failed to fetch strategies:', response.status, response.statusText, errorText);
            // Show user-friendly error message
            this.showAuthenticationError();
        }
    } catch (error) {
        console.error('Failed to load strategies:', error);
        this.showAuthenticationError();
    }
}

showAuthenticationError() {
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Authentication failed. Please make sure you are logged in to Chartilyze in another tab.';
    
    // Clear existing content and show error
    if (this.strategyList) {
        this.strategyList.innerHTML = '';
        this.strategyList.appendChild(errorDiv);
    }
}

    showAuthenticationError() {
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Authentication failed. Please make sure you are logged in to Chartilyze in another tab.';
        
        // Clear existing content and show error
        if (this.strategyList) {
            this.strategyList.innerHTML = '';
            this.strategyList.appendChild(errorDiv);
        }
    }

async getUserToken() {
    // Use AuthManager's built-in token management instead of tab communication
    try {
        console.log('🔑 Getting token from AuthManager...');
        const token = await this.authManager.getValidToken();
        console.log('✅ Successfully retrieved token from AuthManager');
        return token;
    } catch (error) {
        console.error('❌ Failed to get token from AuthManager:', error);
        throw new Error('No authentication found. Please make sure you are logged in to Chartilyze.');
    }
}

    renderStrategyList() {
        if (!this.strategyList) return;
    
        this.strategyList.innerHTML = '';
        
        // Update the dropdown button text
        const dropdownBtn = document.querySelector('.strategy-dropdown-btn');
        
        if (this.availableStrategies.length === 0) {
            this.strategyList.innerHTML = '<div class="strategy-item">No strategies found</div>';
            if (dropdownBtn) dropdownBtn.textContent = 'No strategies available';
            return;
        }

        this.availableStrategies.forEach(strategy => {
            const item = document.createElement('div');
            item.className = 'strategy-item';
            if (strategy.id === this.selectedStrategyId) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <div class="strategy-name">${strategy.name}</div>
                <div class="strategy-meta">
                    <span>${strategy.rules?.length || 0} rules</span>
                    ${strategy.complexity ? `<span class="strategy-complexity">${strategy.complexity}</span>` : ''}
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectStrategy(strategy);
            });
            
            this.strategyList.appendChild(item);
        });
    }

    filterStrategies(searchTerm) {
        const items = this.strategyList.querySelectorAll('.strategy-item');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const name = item.querySelector('.strategy-name')?.textContent.toLowerCase() || '';
            const visible = name.includes(term);
            item.style.display = visible ? 'block' : 'none';
        });
    }

    selectStrategy(strategy) {
        this.selectedStrategyId = strategy.id;
        this.currentStrategy = strategy;
        this.selectedStrategySpan.textContent = strategy.name;
        this.updateHeaderWithStrategy();
        this.renderStrategyList(); // Re-render to update selection
        this.closeStrategyDropdown();
        
        // Store selected strategy
        chrome.storage.local.set({ 
            currentStrategy: strategy,
            selectedStrategyId: strategy.id 
        });
        
        // Add message about strategy switch
        this.addMessage(`Switched to strategy: **${strategy.name}**\n\n*${strategy.rules?.length || 0} rules • ${strategy.complexity || 'Unknown'} complexity*`, 'bot');
    }

    toggleStrategyDropdown() {
        const isOpen = this.strategyDropdown.style.display === 'block';
        if (isOpen) {
            this.closeStrategyDropdown();
        } else {
            this.openStrategyDropdown();
        }
    }

    openStrategyDropdown() {
        this.strategyDropdown.style.display = 'block';
        this.strategyDropdownBtn.classList.add('open');
        if (this.strategySearch) {
            this.strategySearch.focus();
        }
        
        // Load strategies when dropdown is opened for the first time
        if (!this.availableStrategies || this.availableStrategies.length === 0) {
            this.loadAvailableStrategies();
        }
    }

    closeStrategyDropdown() {
        this.strategyDropdown.style.display = 'none';
        this.strategyDropdownBtn.classList.remove('open');
        if (this.strategySearch) {
            this.strategySearch.value = '';
            this.filterStrategies('');
        }
    }

    async loadCurrentStrategy() {
        try {
            // Check if we have a selected strategy ID
            const result = await chrome.storage.local.get(['selectedStrategyId', 'currentStrategy']);
            
            if (result.selectedStrategyId && result.currentStrategy) {
                this.selectedStrategyId = result.selectedStrategyId;
                this.currentStrategy = result.currentStrategy;
                this.selectedStrategySpan.textContent = this.currentStrategy.name;
                this.updateHeaderWithStrategy();
                return;
            }

            // If no strategy selected, try to get the first available one
            if (this.availableStrategies.length > 0) {
                this.selectStrategy(this.availableStrategies[0]);
            } else {
                this.selectedStrategySpan.textContent = 'No strategies available';
            }
        } catch (error) {
            console.log('No strategy context available:', error);
            this.selectedStrategySpan.textContent = 'No strategy selected';
        }
    }

    async requestStrategyFromWebApp(tabId) {
        try {
            // Send message to content script to request current strategy
            const response = await chrome.tabs.sendMessage(tabId, {
                type: 'GET_CURRENT_STRATEGY'
            });
            
            if (response && response.strategy) {
                this.currentStrategy = response.strategy;
                this.updateHeaderWithStrategy();
                await chrome.storage.local.set({ currentStrategy: this.currentStrategy });
            }
        } catch (error) {
            console.log('Could not communicate with web app:', error);
        }
    }

    updateHeaderWithStrategy() {
        if (this.currentStrategy && this.strategySubtitle) {
            this.strategySubtitle.textContent = `Active: ${this.currentStrategy.name}`;
        }
    }

    handleQuickAction(action) {
        if (action === 'journal') {
            this.showJournalWorkflow();
        } else if (action === 'strategy') {
            this.showStrategyWorkflow();
        }
    }

    showJournalWorkflow() {
        const workflowContent = `Here's your **Journal Workflow** for documenting trades:

**Pre-Trade Documentation:**
• Screenshot the chart setup
• Note your entry reasoning
• Define risk/reward ratio
• Set stop loss and take profit levels

**During Trade:**
• Monitor price action
• Note any strategy deviations
• Document emotional state

**Post-Trade Analysis:**
• Record actual vs planned results
• Analyze what worked/didn't work
• Update strategy rules if needed
• Rate trade execution (1-10)`;

        this.addMessage(workflowContent, 'bot', false, {
            type: 'workflow',
            title: 'Journal Workflow',
            steps: [
                'Take chart screenshot',
                'Document entry reasoning', 
                'Set risk management',
                'Monitor execution',
                'Post-trade analysis'
            ]
        });
    }

    showStrategyWorkflow() {
        if (!this.currentStrategy) {
            const noStrategyContent = `**No Active Strategy Found**

To use strategy-specific workflows:

1. **Open your Chartilyze web app**
2. **Select an active strategy**
3. **Return to this extension**

I'll then show you the specific workflow for your active strategy with:
• Your actual strategy rules
• Custom entry/exit criteria
• Risk management guidelines
• Performance tracking steps`;

            this.addMessage(noStrategyContent, 'bot', false, {
                type: 'workflow',
                title: 'Strategy Setup Required',
                steps: [
                    'Open Chartilyze web app',
                    'Select active strategy',
                    'Return to extension',
                    'Access strategy workflow'
                ]
            });
            return;
        }

        const strategyName = this.currentStrategy.name;
        const rules = this.currentStrategy.rules || [];
        const complexity = this.currentStrategy.complexity || 'Not specified';
        const riskProfile = this.currentStrategy.riskProfile || 'Not specified';

        let workflowContent = `**${strategyName} Workflow**\n\n`;
        workflowContent += `**Strategy Details:**\n`;
        workflowContent += `• Complexity: ${complexity}\n`;
        workflowContent += `• Risk Profile: ${riskProfile}\n`;
        workflowContent += `• Rules: ${rules.length} defined\n\n`;

        if (rules.length > 0) {
            workflowContent += `**Your Strategy Rules:**\n`;
            rules.slice(0, 5).forEach((rule, index) => {
                workflowContent += `${index + 1}. ${rule}\n`;
            });
            if (rules.length > 5) {
                workflowContent += `... and ${rules.length - 5} more rules\n`;
            }
            workflowContent += `\n`;
        }

        workflowContent += `**Execution Workflow:**\n`;
        workflowContent += `• **Setup**: Identify patterns matching your rules\n`;
        workflowContent += `• **Entry**: Execute when all conditions align\n`;
        workflowContent += `• **Management**: Follow your risk profile guidelines\n`;
        workflowContent += `• **Exit**: Stick to predetermined targets\n`;
        workflowContent += `• **Review**: Document adherence to strategy rules`;

        this.addMessage(workflowContent, 'bot', false, {
            type: 'workflow',
            title: `${strategyName} Execution Guide`,
            steps: [
                'Scan for strategy patterns',
                'Verify all entry conditions',
                'Execute with proper sizing',
                'Manage according to rules',
                'Exit at predetermined levels',
                'Document trade in journal'
            ]
        });
    }

    showJournalWorkflow() {
        const strategyName = this.currentStrategy?.name || 'Current Strategy';
        
        const workflowContent = `**Journal Entry Workflow** for ${strategyName}:

**Pre-Trade Documentation:**
• Screenshot the chart setup
• Note which strategy rules triggered entry
• Document market context and timeframe
• Define risk/reward ratio
• Set stop loss and take profit levels

**During Trade:**
• Monitor adherence to strategy rules
• Note any deviations and reasons
• Document emotional state and decision-making
• Track key price levels and reactions

**Post-Trade Analysis:**
• Record actual vs planned results
• Analyze rule adherence (1-10 scale)
• Document what worked/didn't work
• Note lessons learned for strategy improvement
• Rate overall execution quality`;

        this.addMessage(workflowContent, 'bot', false, {
            type: 'workflow',
            title: 'Trade Documentation Process',
            steps: [
                'Take chart screenshot',
                'Document strategy reasoning',
                'Set risk management levels',
                'Monitor rule adherence',
                'Complete post-trade analysis',
                'Update strategy insights'
            ]
        });
    }

    setupAutoResize() {
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
    }

    async showWelcomeMessage() {
        try {
            // Get user token
            const userToken = await this.getUserToken();
            
            // Fetch user info from backend
            const response = await fetch(`${this.backendUrl}/extension/user-info`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            let userName = "Trader";
            
            if (response.ok) {
                const data = await response.json();
                console.log('User data:', data);
                userName = data.user?.name || "Trader";
            }
            
            // Show a personalized welcome message
            const notification = document.createElement('div');
            notification.className = 'success-notification';
            notification.textContent = `Hi ${userName}, how can I help you today?`;
            this.messagesContainer.appendChild(notification);
            
            // Add a message to the chat
            this.addSystemMessage(`Welcome ${userName}! I'm your Chartilyze Assistant. How can I help with your trading today?`);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.remove();
            }, 3000);
        } catch (error) {
            console.error('Failed to load user info:', error);
            // Fallback to generic welcome message
            const notification = document.createElement('div');
            notification.className = 'success-notification';
            notification.textContent = 'Assistant ready. Use the buttons above for quick workflows.';
            this.messagesContainer.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
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
            
            if (!tab || !tab.url.includes('tradingview.com')) {
                return { error: 'Not on TradingView' };
            }

            // Execute script to extract chart data
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    // Extract basic chart information
                    const symbol = document.querySelector('[data-name="legend-source-item"]')?.textContent || 'Unknown';
                    const timeframe = document.querySelector('[data-name="resolution"]')?.textContent || 'Unknown';
                    
                    return {
                        symbol,
                        timeframe,
                        url: window.location.href,
                        timestamp: new Date().toISOString()
                    };
                }
            });

            return results[0]?.result || { error: 'Could not extract chart data' };
        } catch (error) {
            console.error('Error getting chart data:', error);
            return { error: 'Failed to access chart data' };
        }
    }

    async sendToAPI(message, chartData) {
        try {
            // Prepare strategy context
            const strategyContext = this.currentStrategy ? {
                name: this.currentStrategy.name,
                rules: this.currentStrategy.rules || [],
                components: this.currentStrategy.components,
                complexity: this.currentStrategy.complexity,
                riskProfile: this.currentStrategy.riskProfile
            } : undefined;

            // Build conversation history (last 6 messages)
            const conversationHistory = this.conversationHistory.slice(-6).map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));

            const response = await fetch(`${this.backendUrl}/extension/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    strategyContext,
                    conversationHistory,
                    chartData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.message || data.response || 'Sorry, I encountered an error processing your request.';
        } catch (error) {
            console.error('API Error:', error);
            return 'Sorry, I\'m having trouble connecting to the server. Please check your internet connection and try again.';
        }
    }

    addSystemMessage(text) {
        const message = {
            role: 'system',
            content: text
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.conversationHistory.push(message);
    }

    generateResponse(message, chartData) {
        // Simple response generation based on keywords
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('strategy')) {
            return 'I can help you with your trading strategy. What specific aspect would you like to discuss?';
        } else if (lowerMessage.includes('journal')) {
            return 'For journaling this trade, make sure to document your entry reasoning, risk management, and emotional state.';
        } else if (lowerMessage.includes('chart') || lowerMessage.includes('analysis')) {
            const symbol = chartData?.symbol || 'this chart';
            return `Looking at ${symbol}, I can help you analyze the setup. What specific patterns or signals are you seeing?`;
        } else {
            return 'I\'m here to help with your trading analysis and strategy. What would you like to know?';
        }
    }

    addMessage(content, type, isError = false, responseData = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = `message-content ${isError ? 'error-message' : ''}`;
        contentDiv.innerHTML = this.formatMessage(content);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        // Add workflow steps if provided
        if (responseData?.type === 'workflow') {
            const workflowDiv = document.createElement('div');
            workflowDiv.className = 'strategy-workflow';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'workflow-title';
            titleDiv.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,11 12,14 22,4"></polyline>
                    <path d="M21,12v7a2,2 0,0 1,-2,2H5a2,2 0,0 1,-2,-2V5a2,2 0,0 1,2,-2h11"></path>
                </svg>
                ${responseData.title}
            `;
            
            const stepsList = document.createElement('ul');
            stepsList.className = 'workflow-steps';
            
            responseData.steps.forEach((step, index) => {
                const stepItem = document.createElement('li');
                stepItem.className = 'workflow-step';
                stepItem.innerHTML = `
                    <span class="step-number">${index + 1}</span>
                    <span>${step}</span>
                `;
                stepsList.appendChild(stepItem);
            });
            
            workflowDiv.appendChild(titleDiv);
            workflowDiv.appendChild(stepsList);
            messageDiv.appendChild(workflowDiv);
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(content) {
        // Simple markdown-like formatting
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
        
        const dotsDiv = document.createElement('div');
        dotsDiv.className = 'loading-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-dot';
            dotsDiv.appendChild(dot);
        }
        
        loadingDiv.appendChild(dotsDiv);
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

    showSignInUI() {
        console.log('showSignInUI called');
        console.log('authContainer element:', this.authContainer);
        
        // Hide main UI elements
        if (this.quickActionsContainer) this.quickActionsContainer.style.display = 'none';
        if (this.strategySelectorContainer) this.strategySelectorContainer.style.display = 'none';
        if (this.messagesContainer) this.messagesContainer.style.display = 'none';
        if (this.inputContainer) this.inputContainer.style.display = 'none';
        
        // Show authentication UI
        if (this.authContainer) {
            this.authContainer.style.display = 'flex';
            console.log('Auth container should now be visible');
        } else {
            console.error('Auth container not found!');
        }
        
        // Update header subtitle
        if (this.strategySubtitle) this.strategySubtitle.textContent = 'Please sign in to continue';
    }

    showMainUI() {
        // Hide authentication UI
        if (this.authContainer) this.authContainer.style.display = 'none';
        
        // Show main UI elements
        if (this.quickActionsContainer) this.quickActionsContainer.style.display = 'block';
        if (this.strategySelectorContainer) this.strategySelectorContainer.style.display = 'block';
        if (this.messagesContainer) this.messagesContainer.style.display = 'flex';
        if (this.inputContainer) this.inputContainer.style.display = 'block';
        
        // Update header subtitle
        if (this.strategySubtitle) this.strategySubtitle.textContent = 'Ready to assist';
    }

    async handleSignIn() {
        try {
            // Show loading state
            this.signInButton.disabled = true;
            this.authLoading.style.display = 'flex';
            this.authError.style.display = 'none';
            
            // Attempt sign in with timeout
            const signInPromise = this.authManager.signIn();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Sign-in timeout after 60 seconds')), 60000)
            );
            
            const result = await Promise.race([signInPromise, timeoutPromise]);
            
            console.log('✅ Sign-in successful:', result);
            
            // Success - switch to main UI
            this.showMainUI();
            this.loadCurrentStrategy();
            this.loadAvailableStrategies();
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            
            // Show specific error messages
            let errorMessage = 'Sign in failed. Please try again.';
            
            if (error.message.includes('timeout')) {
                errorMessage = 'Sign-in timed out. Please check your connection and try again.';
            } else if (error.message.includes('tab closed')) {
                errorMessage = 'Sign-in was cancelled. Please try again.';
            } else if (error.message.includes('token')) {
                errorMessage = 'Authentication token error. Please try signing in again.';
            }
            
            this.authError.textContent = errorMessage;
            this.authError.style.display = 'block';
            
        } finally {
            // Reset loading state
            this.signInButton.disabled = false;
            this.authLoading.style.display = 'none';
        }
    }
}

// Add error handling for script loading
console.log('📄 sidepanel.js loaded');

if (document.readyState === 'loading') {
    console.log('⏳ Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 DOMContentLoaded fired, creating ChartilyzeAssistant');
        new ChartilyzeAssistant();
    });
} else {
    console.log('✅ Document ready, creating ChartilyzeAssistant immediately');
    new ChartilyzeAssistant();
}