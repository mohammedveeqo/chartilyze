// Content.js - Inject Chartilyze functionality into TradingView
class ChartilyzeInjector {
    constructor() {
        this.isInjected = false;
        this.chartData = null;
        this.init();
    }

    init() {
        // Wait for TradingView to load
        this.waitForTradingView();
        this.setupMessageListener();
    }

    waitForTradingView() {
        const checkInterval = setInterval(() => {
            // Look for TradingView's main chart container
            const chartContainer = document.querySelector('[data-name="legend-source-item"]') || 
                                 document.querySelector('.chart-container') ||
                                 document.querySelector('#header-toolbar-intervals');
            
            if (chartContainer && !this.isInjected) {
                clearInterval(checkInterval);
                this.injectChartilyzeButton();
                this.isInjected = true;
            }
        }, 1000);

        // Stop checking after 30 seconds
        setTimeout(() => clearInterval(checkInterval), 30000);
    }

    injectChartilyzeButton() {
        // Find the toolbar area
        const toolbar = document.querySelector('#header-toolbar-intervals') ||
                       document.querySelector('.toolbar') ||
                       document.querySelector('[data-name="header-toolbar"]');

        if (!toolbar) {
            console.log('Chartilyze: Could not find toolbar, trying alternative injection');
            this.injectFloatingButton();
            return;
        }

        // Create Chartilyze button
        const chartilyzeBtn = this.createChartilyzeButton();
        
        // Insert button into toolbar
        toolbar.appendChild(chartilyzeBtn);
        console.log('Chartilyze: Button injected into toolbar');
    }

    injectFloatingButton() {
        // Create floating button as fallback
        const floatingBtn = this.createChartilyzeButton(true);
        floatingBtn.classList.add('chartilyze-floating');
        
        // Add floating styles
        floatingBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: #1a1a1a;
            border: 2px solid #00d4aa;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
            transition: all 0.3s ease;
        `;

        floatingBtn.addEventListener('mouseenter', () => {
            floatingBtn.style.transform = 'scale(1.1)';
            floatingBtn.style.boxShadow = '0 212, 170, 0.5)';
        });

        floatingBtn.addEventListener('mouseleave', () => {
            floatingBtn.style.transform = 'scale(1)';
            floatingBtn.style.boxShadow = '0 4px 12px rgba(0, 212, 170, 0.3)';
        });

        document.body.appendChild(floatingBtn);
        console.log('Chartilyze: Floating button injected');
    }

    createChartilyzeButton(isFloating = false) {
        const button = document.createElement('button');
        button.id = 'chartilyze-btn';
        button.title = 'Open Chartilyze Chat';
        
        if (!isFloating) {
            button.className = 'chartilyze-toolbar-btn';
            button.style.cssText = `
                background: transparent;
                border: 1px solid #00d4aa;
                color: #00d4aa;
                padding: 6px 12px;
                margin: 0 4px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            `;
        }

        // Create icon
        const icon = document.createElement('span');
        icon.innerHTML = '📊'; // Chart emoji as fallback
        icon.style.fontSize = isFloating ? '20px' : '14px';

        // Create text (only for toolbar button)
        if (!isFloating) {
            const text = document.createElement('span');
            text.textContent = 'Chartilyze';
            button.appendChild(icon);
            button.appendChild(text);
        } else {
            button.appendChild(icon);
        }

        // Add hover effects for toolbar button
        if (!isFloating) {
            button.addEventListener('mouseenter', () => {
                button.style.background = '#00d4aa';
                button.style.color = '#1a1a1a';
            });

            button.addEventListener('mouseleave', () => {
                button.style.background = 'transparent';
                button.style.color = '#00d4aa';
            });
        }

        // Add click handler
        button.addEventListener('click', () => this.openChartilyzeChat());

        return button;
    }

    openChartilyzeChat() {
        // Send message to background script to open popup
        chrome.runtime.sendMessage({
            action: 'openPopup',
            chartData: this.captureChartData()
        }).catch(error => {
            console.error('Failed to send openPopup message:', error);
        });
    }

    captureChartData() {
        const chartData = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            symbol: this.extractSymbol(),
            timeframe: this.extractTimeframe(),
            indicators: this.extractIndicators(),
            drawings: this.extractDrawings(),
            viewport: this.getViewportInfo()
        };

        console.log('Chartilyze: Captured chart data', chartData);
        return chartData;
    }

    extractSymbol() {
        // Try multiple selectors for symbol
        const symbolSelectors = [
            '[data-name="legend-source-title"]',
            '.js-symbol-title',
            '[class*="symbol"]',
            '.tv-symbol-header__text'
        ];

        for (const selector of symbolSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }

        // Fallback: extract from URL
        const urlMatch = window.location.href.match(/symbol=([^&]+)/);
        return urlMatch ? decodeURIComponent(urlMatch[1]) : 'Unknown';
    }

    extractTimeframe() {
        // Look for active timeframe button
        const timeframeSelectors = [
            '[data-name="header-toolbar-intervals"] .isActive',
            '.interval-item.active',
            '[class*="interval"][class*="active"]'
        ];

        for (const selector of timeframeSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }

        return 'Unknown';
    }

    extractIndicators() {
        const indicators = [];
        
        // Look for indicator legend items
        const indicatorElements = document.querySelectorAll('[data-name="legend-source-item"]');
        
        indicatorElements.forEach(element => {
            const titleElement = element.querySelector('[data-name="legend-source-title"]');
            if (titleElement && titleElement.textContent.trim()) {
                const name = titleElement.textContent.trim();
                // Skip the main symbol
                if (!name.includes('/') && !name.includes(':')) {
                    indicators.push(name);
                }
            }
        });

        return indicators;
    }

    extractDrawings() {
        // This is more complex and would require deeper TradingView integration
        // For now, return placeholder
        return {
            count: document.querySelectorAll('[data-name="drawing"]').length,
            types: [] // Would need more specific selectors
        };
    }

    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollX: window.scrollX,
            scrollY: window.scrollY
        };
    }

    async setupMessageListener() {
        // Add message listener for strategy requests
        chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
            if (request.type === 'GET_CURRENT_STRATEGY') {
                try {
                    // Try to get current strategy from the web app
                    const getCurrentStrategy = () => {
                        // Method 1: Try to access Zustand store if exposed
                        if (window.__ZUSTAND_STORE__) {
                            const store = window.__ZUSTAND_STORE__;
                            const currentStrategyId = store.currentStrategyId;
                            if (currentStrategyId && window.__STRATEGIES__) {
                                return window.__STRATEGIES__.find(s => s.id === currentStrategyId);
                            }
                        }
                        
                        // Method 2: Try to find strategy data in DOM
                        const strategyElement = document.querySelector('[data-strategy-name]');
                        if (strategyElement) {
                            return {
                                name: strategyElement.getAttribute('data-strategy-name'),
                                id: strategyElement.getAttribute('data-strategy-id'),
                                // Add more attributes as needed
                            };
                        }
                        
                        // Method 3: Try localStorage
                        const strategyData = localStorage.getItem('currentStrategy');
                        if (strategyData) {
                            return JSON.parse(strategyData);
                        }
                        
                        return null;
                    };
                    
                    const strategy = getCurrentStrategy();
                    sendResponse({ strategy });
                } catch (error) {
                    console.log('Error getting strategy:', error);
                    sendResponse({ strategy: null });
                }
                return true; // Keep message channel open for async response
            } else if (request.action === 'GET_USER_TOKEN') {
                try {
                    let token = null;
                    let userId = null;
                    
                    // Method 1: Check window object
                    if (window.__CHARTILYZE_USER__) {
                        token = window.__CHARTILYZE_USER__.token;
                        userId = window.__CHARTILYZE_USER__.userId;
                        console.log('Found user data in window object:', { userId, hasToken: !!token });
                    }
                    
                    // Method 2: Check localStorage
                    if (!token || !userId) {
                        userId = localStorage.getItem('chartilyze_user_id');
                        token = localStorage.getItem('chartilyze_token');
                        console.log('Found user data in localStorage:', { userId, hasToken: !!token });
                    }
                    
                    // Method 3: Try to get from Clerk (if available)
                    if (!token && window.Clerk) {
                        try {
                            const session = await window.Clerk.session;
                            if (session) {
                                token = await session.getToken({ template: 'convex' });
                                userId = session.user?.id;
                                console.log('Found user data from Clerk:', { userId, hasToken: !!token });
                            }
                        } catch (clerkError) {
                            console.log('Clerk method failed:', clerkError);
                        }
                    }
                    
                    // Method 4: Fallback to other Clerk methods
                    if (!userId) {
                        // Try to get user ID from Clerk
                        if (window.__CLERK_USER_ID__) {
                            userId = window.__CLERK_USER_ID__;
                        }
                        
                        // Try to get user data from localStorage
                        const clerkUser = localStorage.getItem('clerk-user') || 
                            sessionStorage.getItem('clerk-user');
                        
                        if (clerkUser) {
                            try {
                                const userData = JSON.parse(clerkUser);
                                userId = userData.id || userData.userId;
                            } catch (e) {
                                console.log('Failed to parse clerk user data:', e);
                            }
                        }
                        
                        // Try to get JWT token from Clerk
                        if (!token && window.__CLERK_USER_TOKEN__) {
                            token = window.__CLERK_USER_TOKEN__;
                        }
                        
                        // Try to get token from localStorage/sessionStorage
                        if (!token) {
                            const clerkToken = localStorage.getItem('clerk-db-jwt') || 
                                sessionStorage.getItem('clerk-db-jwt') ||
                                localStorage.getItem('__clerk_client_jwt') ||
                                sessionStorage.getItem('__clerk_client_jwt');
                            
                            if (clerkToken) {
                                token = clerkToken;
                            }
                        }
                    }
                    
                    if (token && userId) {
                        sendResponse({ 
                            success: true, 
                            token: token, // ✅ CORRECT: Send actual JWT token
                            userId: userId 
                        });
                    } else {
                        console.error('No user authentication found');
                        sendResponse({ 
                            success: false, 
                            error: 'No user authentication found' 
                        });
                    }
                } catch (error) {
                    console.error('Error getting user token:', error);
                    sendResponse({ 
                        success: false, 
                        error: error.message 
                    });
                }
                return true; // Keep message channel open for async response
            } else if (request.action === 'captureChart') {
                const chartData = this.captureChartData();
                sendResponse({ success: true, data: chartData });
            } else if (request.action === 'captureScreenshot') {
                this.captureScreenshot().then(screenshot => {
                    sendResponse({ success: true, screenshot });
                }).catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
                return true; // Keep message channel open for async response
            }
        });
        
        // Listen for strategy changes in the web app
        const observeStrategyChanges = () => {
            // Watch for changes in strategy selector or strategy name elements
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        // Check if strategy-related elements changed
                        const strategyElements = document.querySelectorAll('[data-strategy-name], .strategy-name, .current-strategy');
                        if (strategyElements.length > 0) {
                            // Strategy might have changed, clear cached data
                            chrome.storage.local.remove(['currentStrategy']);
                        }
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-strategy-name', 'data-strategy-id']
            });
        };
        
        // Start observing when page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', observeStrategyChanges);
        } else {
            observeStrategyChanges();
        }
    }

    async captureScreenshot() {
        try {
            // Request screenshot from background script
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    { action: 'captureScreenshot' },
                    (response) => {
                        if (response.success) {
                            resolve(response.screenshot);
                        } else {
                            reject(new Error(response.error));
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Chartilyze: Screenshot capture failed', error);
            throw error;
        }
    }

    // Method to update chart data when chart changes
    observeChartChanges() {
        // Create observer for chart updates
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                // Check if symbol or timeframe changed
                if (mutation.target.matches('[data-name="legend-source-title"]') ||
                    mutation.target.matches('[data-name="header-toolbar-intervals"]')) {
                    shouldUpdate = true;
                }
            });

            if (shouldUpdate) {
                this.chartData = this.captureChartData();
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChartilyzeInjector();
    });
} else {
    new ChartilyzeInjector();
}

// Also initialize on dynamic page changes (SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        // Reinitialize on navigation
        setTimeout(() => {
            if (!document.getElementById('chartilyze-btn')) {
                new ChartilyzeInjector();
            }
        }, 2000);
    }
}).observe(document, { subtree: true, childList: true });

// Enhanced chart data extraction
function getChartData() {
    const data = {
        symbol: extractSymbol(),
        timeframe: extractTimeframe(),
        indicators: extractIndicators(),
        viewport: extractViewport(),
        price: extractCurrentPrice(),
        volume: extractVolume(),
        timestamp: Date.now()
    };
    
    console.log('📊 Extracted chart data:', data);
    return data;
}

// Extract current price
function extractCurrentPrice() {
    try {
        // Look for price displays in various locations
        const priceSelectors = [
            '[data-name="legend-source-item"] [class*="price"]',
            '[class*="price-axis"] [class*="price"]',
            '[class*="symbol-info"] [class*="price"]',
            '.tv-symbol-price-quote__value'
        ];
        
        for (const selector of priceSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent) {
                const price = element.textContent.trim();
                if (price && !isNaN(parseFloat(price.replace(/[^0-9.-]/g, '')))) {
                    return price;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error extracting price:', error);
        return null;
    }
}

// Extract volume data
function extractVolume() {
    try {
        const volumeSelectors = [
            '[data-name="legend-source-item"][data-title*="Volume"]',
            '[class*="volume"]',
            '[title*="Volume"]'
        ];
        
        for (const selector of volumeSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent) {
                const volume = element.textContent.trim();
                if (volume && volume.toLowerCase().includes('vol')) {
                    return volume;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error extracting volume:', error);
        return null;
    }
}

// Extract viewport information
function extractViewport() {
    try {
        const chart = document.querySelector('[data-name="chart"], .chart-container, #tv_chart_container');
        if (chart) {
            const rect = chart.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left
            };
        }
        return null;
    } catch (error) {
        console.error('Error extracting viewport:', error);
        return null;
    }
}