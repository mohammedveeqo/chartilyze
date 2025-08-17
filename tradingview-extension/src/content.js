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
            floatingBtn.style.boxShadow = '0 6px 20px rgba(0, 212, 170, 0.5)';
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

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'captureChart') {
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