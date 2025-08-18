class AuthManager {
    constructor() {
        this.webAppUrl = 'https://app.chartilyze.com';
        this.backendUrl = 'https://decisive-tapir-206.convex.site';
        this.authCheckInterval = null;
        this.authWindow = null;
        
        // Add message listener for direct communication from web app
        this.setupMessageListener();
    }
    
    // Add communication channel between web app and extension
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // Make sure message is from a trusted source
            if (event.origin.includes('chartilyze.com') || 
                event.origin.includes('localhost')) {
                
                if (event.data && event.data.type === 'EXTENSION_AUTH_COMPLETE') {
                    console.log('✅ Received auth completion message from web app');
                    this.handleAuthComplete(event.data.clerkData);
                }
            }
        });
        
        // Listen for messages from content scripts
        chrome.runtime.onMessage.addListener((message, sender) => {
            if (message.type === 'EXTENSION_AUTH_AVAILABLE' && message.clerkData) {
                console.log('✅ Received auth data from content script');
                this.handleAuthComplete(message.clerkData);
                return true;
            }
        });
    }
    
    // Handle authentication completion from direct web app communication
    async handleAuthComplete(clerkData) {
        try {
            console.log('🔄 Processing auth completion with data:', clerkData);
            
            // Clear checking interval if it exists
            if (this.authCheckInterval) {
                clearInterval(this.authCheckInterval);
                this.authCheckInterval = null;
            }
            
            // Convert to extension token
            const token = await this.convertClerkToExtensionToken(clerkData);
            if (token) {
                await this.storeToken(token);
                
                // Close auth tab if it exists
                if (this.authWindow && this.authWindow.id) {
                    try {
                        await chrome.tabs.remove(this.authWindow.id);
                    } catch (e) {
                        console.log('Could not close auth tab:', e);
                    }
                }
                
                // Notify UI of successful authentication
                chrome.runtime.sendMessage({
                    type: 'AUTH_STATE_CHANGED',
                    authenticated: true
                });
            }
        } catch (error) {
            console.error('Failed to process authentication completion:', error);
        }
    }

    // 1. Session Detection - Check for existing Clerk session
    async checkAuthentication() {
        try {
            console.log('🔍 Checking authentication status...');
            
            // First check stored extension token
            const storedToken = await this.getStoredToken();
            if (storedToken && await this.validateStoredToken(storedToken)) {
                console.log('✅ Valid stored token found');
                return { authenticated: true, token: storedToken };
            }

            // Check for Clerk session in web app tabs
            const clerkSession = await this.detectClerkSession();
            if (clerkSession) {
                console.log('✅ Clerk session detected, converting to extension token');
                const extensionToken = await this.convertClerkToExtensionToken(clerkSession);
                if (extensionToken) {
                    await this.storeToken(extensionToken);
                    return { authenticated: true, token: extensionToken };
                }
            }
            
            // NEW: Check all tabs more aggressively
            const sessionFromAllTabs = await this.checkAuthInAllTabs();
            if (sessionFromAllTabs) {
                console.log('✅ Found session in another tab');
                if (sessionFromAllTabs.sessionId) {
                    const extensionToken = await this.convertClerkToExtensionToken(sessionFromAllTabs);
                    if (extensionToken) {
                        await this.storeToken(extensionToken);
                        return { authenticated: true, token: extensionToken };
                    }
                } else if (sessionFromAllTabs.hasStoredSession) {
                    const validationResult = await this.validateStoredSession(sessionFromAllTabs);
                    if (validationResult && validationResult.valid && validationResult.token) {
                        await this.storeToken(validationResult.token);
                        return { authenticated: true, token: validationResult.token };
                    }
                }
            }

            console.log('❌ No valid authentication found');
            return { authenticated: false };
        } catch (error) {
            console.error('Authentication check failed:', error);
            return { authenticated: false };
        }
    }
    
    // NEW: Check all open tabs for Clerk session data
    async checkAuthInAllTabs() {
        console.log('🔍 Checking all tabs for existing authentication...');
        
        // Get all tabs that might have your app open
        const tabs = await chrome.tabs.query({});
        
        for (const tab of tabs) {
            try {
                // Skip tabs that are definitely not your app
                if (!tab.url || 
                    (!tab.url.includes('chartilyze.com') && 
                     !tab.url.includes('localhost'))) {
                    continue;
                }
                
                console.log(`📋 Checking tab: ${tab.url}`);
                
                // Execute script to check for Clerk session
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        // Return object to store results
                        const result = {};
                        
                        // Check for active Clerk session
                        if (window.Clerk?.session?.id) {
                            result.sessionId = window.Clerk.session.id;
                            result.userId = window.Clerk.user?.id;
                            
                            // Try different methods to get token
                            if (typeof window.Clerk.session.getToken === 'function') {
                                try {
                                    result.token = window.Clerk.session.getToken();
                                } catch (e) {
                                    console.log('Error getting token from Clerk:', e);
                                }
                            }
                            
                            return result;
                        }
                        
                        // Check localStorage for session data
                        try {
                            result.hasStoredSession = false;
                            
                            // Check for Clerk data in localStorage
                            const clerkData = localStorage.getItem('__clerk_db_jwt');
                            const clerkSession = localStorage.getItem('__clerk_session');
                            
                            if (clerkData || clerkSession) {
                                result.hasStoredSession = true;
                                result.clerkData = clerkData;
                                result.clerkSession = clerkSession;
                                
                                // Try to extract user ID
                                try {
                                    if (clerkData) {
                                        const parsed = JSON.parse(clerkData);
                                        if (parsed.sessions?.[0]?.userId) {
                                            result.userId = parsed.sessions[0].userId;
                                        }
                                    }
                                } catch (e) {
                                    console.log('Error parsing clerk data:', e);
                                }
                            }
                            
                            return Object.keys(result).length > 0 ? result : null;
                        } catch (e) {
                            console.log('Error checking localStorage:', e);
                            return null;
                        }
                    }
                });
                
                if (results && results[0]?.result) {
                    console.log('✅ Found session data in tab:', tab.url);
                    console.log('Session data:', results[0].result);
                    return results[0].result;
                }
            } catch (error) {
                console.log(`⚠️ Could not check tab ${tab.url}:`, error);
            }
        }
        
        return null;
    }

    // Detect existing Clerk session from web app tabs
    async detectClerkSession() {
        try {
            console.log('🔍 Checking for existing Clerk session data...');
            
            // Method 1: Check if we can access Clerk session via content script injection
            // This only works if user has a Chartilyze tab open
            try {
                const tabs = await chrome.tabs.query({ 
                    url: [`${this.webAppUrl}/*`, "http://localhost:3000/*", "https://localhost:3000/*"] 
                });
                
                if (tabs.length > 0) {
                    console.log(`📋 Found ${tabs.length} Chartilyze tabs, checking for session...`);
                    
                    for (const tab of tabs) {
                        try {
                            const results = await chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                func: () => {
                                    // Check for active Clerk session
                                    if (window.Clerk?.session?.id) {
                                        return {
                                            sessionId: window.Clerk.session.id,
                                            userId: window.Clerk.session.user?.id,
                                            token: window.Clerk.session.getToken ? window.Clerk.session.getToken() : null
                                        };
                                    }
                                    
                                    // Check localStorage for Clerk session data
                                    try {
                                        const clerkData = localStorage.getItem('__clerk_db_jwt');
                                        const clerkSession = localStorage.getItem('__clerk_session');
                                        if (clerkData || clerkSession) {
                                            return { hasStoredSession: true, clerkData, clerkSession };
                                        }
                                    } catch (e) {
                                        console.log('Could not access localStorage:', e);
                                    }
                                    
                                    return null;
                                }
                            });
                            
                            const result = results[0]?.result;
                            if (result) {
                                if (result.sessionId) {
                                    console.log(`✅ Found active Clerk session: ${result.sessionId}`);
                                    return result;
                                }
                                if (result.hasStoredSession) {
                                    console.log('📦 Found stored Clerk session data');
                                    return result;
                                }
                            }
                        } catch (error) {
                            console.log(`❌ Could not check session in tab ${tab.url}:`, error.message);
                        }
                    }
                }
            } catch (error) {
                console.log('❌ Error checking tabs for session:', error);
            }
            
            // Method 2: Check cookies directly (if we have host permissions)
            try {
                const cookies = await chrome.cookies.getAll({
                    domain: '.chartilyze.com'
                });
                
                const clerkCookies = cookies.filter(cookie => 
                    cookie.name.includes('clerk') || 
                    cookie.name.includes('__session')
                );
                
                if (clerkCookies.length > 0) {
                    console.log(`🍪 Found ${clerkCookies.length} Clerk-related cookies`);
                    return { hasCookieSession: true, cookies: clerkCookies };
                }
            } catch (error) {
                console.log('❌ Could not access cookies:', error);
            }
            
            console.log('❌ No Clerk session found');
            return null;
        } catch (error) {
            console.error('Failed to detect Clerk session:', error);
            return null;
        }
    }

    // 2. Authentication Flow - Open web app for login
    // UPDATED: Modified to only open tab if necessary
    async initiateAuthentication() {
        return new Promise(async (resolve, reject) => {
            console.log('🚀 Starting authentication process...');
            
            // Clear any existing intervals
            if (this.authCheckInterval) {
                clearInterval(this.authCheckInterval);
            }
            
            // FIRST: Check for existing session data
            console.log('🔍 Checking for existing authentication...');
            try {
                // First try the new aggressive method
                const existingSession = await this.checkAuthInAllTabs();
                
                if (existingSession) {
                    if (existingSession.sessionId) {
                        // We have an active session, convert it
                        console.log('✅ Found active session, converting to extension token...');
                        const extensionToken = await this.convertClerkToExtensionToken(existingSession);
                        if (extensionToken) {
                            await this.storeToken(extensionToken);
                            console.log('✅ Successfully authenticated using existing session!');
                            resolve({ success: true, token: extensionToken });
                            return;
                        }
                    } else if (existingSession.hasStoredSession) {
                        // We have stored session data, try to validate it
                        console.log('📦 Found stored session data, validating with backend...');
                        const validationResult = await this.validateStoredSession(existingSession);
                        if (validationResult.valid) {
                            await this.storeToken(validationResult.token);
                            console.log('✅ Successfully authenticated using stored session!');
                            resolve({ success: true, token: validationResult.token });
                            return;
                        }
                    }
                }
                
                // Then try the original method
                const clerkSession = await this.detectClerkSession();
                if (clerkSession) {
                    if (clerkSession.sessionId) {
                        // We have an active session, convert it
                        console.log('✅ Found active session with original method, converting...');
                        const extensionToken = await this.convertClerkToExtensionToken(clerkSession);
                        if (extensionToken) {
                            await this.storeToken(extensionToken);
                            console.log('✅ Successfully authenticated!');
                            resolve({ success: true, token: extensionToken });
                            return;
                        }
                    } else if (clerkSession.hasCookieSession || clerkSession.hasStoredSession) {
                        console.log('📦 Found session data with original method, validating...');
                        const validationResult = await this.validateStoredSession(clerkSession);
                        if (validationResult.valid) {
                            await this.storeToken(validationResult.token);
                            console.log('✅ Successfully authenticated!');
                            resolve({ success: true, token: validationResult.token });
                            return;
                        }
                    }
                }
            } catch (error) {
                console.log('❌ Error checking existing session:', error);
            }
            
            // SECOND: Only open new tab if no existing session found
            console.log('🔗 No valid session found, opening authentication tab...');
            // Use extension_callback parameter for web app to recognize extension auth
            const loginUrl = `${this.webAppUrl}/sign-in?extension=true&extension_callback=true`;
            
            chrome.tabs.create({ url: loginUrl }, (tab) => {
                this.authWindow = tab;
                
                // Inject a content script to listen for authentication
                try {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            // Monitor for Clerk session establishment
                            const checkInterval = setInterval(() => {
                                if (window.Clerk?.session?.id) {
                                    // Send message back to extension
                                    window.postMessage({
                                        type: 'EXTENSION_AUTH_COMPLETE',
                                        clerkData: {
                                            sessionId: window.Clerk.session.id,
                                            userId: window.Clerk.user.id,
                                            token: window.Clerk.session.getToken ? window.Clerk.session.getToken() : null
                                        }
                                    }, '*');
                                    
                                    // Also notify via custom event for tab cleanup
                                    const event = new CustomEvent('chartilyze-auth-complete', {
                                        detail: {
                                            success: true,
                                            message: 'Authentication successful!'
                                        }
                                    });
                                    document.dispatchEvent(event);
                                    
                                    clearInterval(checkInterval);
                                }
                            }, 1000);
                            
                            // Let the user know extension is waiting
                            if (document.readyState === 'complete') {
                                const div = document.createElement('div');
                                div.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:10px;background:#4caf50;color:white;text-align:center;z-index:9999;';
                                div.textContent = 'Chartilyze Extension is waiting for authentication. Please sign in.';
                                document.body.appendChild(div);
                            } else {
                                window.addEventListener('load', () => {
                                    const div = document.createElement('div');
                                    div.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:10px;background:#4caf50;color:white;text-align:center;z-index:9999;';
                                    div.textContent = 'Chartilyze Extension is waiting for authentication. Please sign in.';
                                    document.body.appendChild(div);
                                });
                            }
                        }
                    });
                } catch (error) {
                    console.error('Failed to inject auth monitor script:', error);
                }
                
                // Set up periodic checking for authentication completion
                this.authCheckInterval = setInterval(async () => {
                    try {
                        // Check if tab still exists
                        try {
                            const tabInfo = await chrome.tabs.get(this.authWindow.id);
                            if (!tabInfo) {
                                console.log('⚠️ Auth tab closed by user');
                                clearInterval(this.authCheckInterval);
                                reject(new Error('Authentication cancelled - tab closed'));
                                return;
                            }
                        } catch (e) {
                            console.log('⚠️ Auth tab no longer exists');
                            clearInterval(this.authCheckInterval);
                            reject(new Error('Authentication cancelled - tab closed'));
                            return;
                        }
                        
                        // Execute script in the auth tab to check auth status
                        const checkResults = await chrome.scripting.executeScript({
                            target: { tabId: this.authWindow.id },
                            func: () => {
                                if (window.Clerk?.session?.id) {
                                    return {
                                        authenticated: true,
                                        sessionId: window.Clerk.session.id,
                                        userId: window.Clerk.user.id
                                    };
                                }
                                return { authenticated: false };
                            }
                        });
                        
                        if (checkResults[0]?.result?.authenticated) {
                            console.log('✅ Authentication detected in tab!');
                            clearInterval(this.authCheckInterval);
                            
                            const sessionData = checkResults[0].result;
                            const extensionToken = await this.convertClerkToExtensionToken(sessionData);
                            
                            if (extensionToken) {
                                await this.storeToken(extensionToken);
                                
                                // Close the auth tab
                                chrome.tabs.remove(this.authWindow.id);
                                
                                resolve({ success: true, token: extensionToken });
                            } else {
                                reject(new Error('Failed to generate extension token'));
                            }
                        }
                    } catch (error) {
                        console.error('Auth check error:', error);
                    }
                }, 2000);
                
                // 10 minute timeout
                setTimeout(() => {
                    if (this.authCheckInterval) {
                        clearInterval(this.authCheckInterval);
                        if (this.authWindow) {
                            chrome.tabs.remove(this.authWindow.id).catch(() => {});
                        }
                        reject(new Error('Authentication timeout - please try again'));
                    }
                }, 600000);
            });
        });
    }

    // 4. Convex Integration - Convert Clerk token to Convex-compatible JWT
    async convertClerkToExtensionToken(clerkSession) {
        try {
            console.log('🔄 Converting Clerk session to extension token:', clerkSession);
            
            // Make sure we have at least one of these values
            if (!clerkSession.sessionId && !clerkSession.userId) {
                console.error('Missing required session data');
                return null;
            }
            
            const response = await fetch(`${this.backendUrl}/auth/extension-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clerkSessionId: clerkSession.sessionId || 'unknown',
                    clerkUserId: clerkSession.userId || 'unknown',
                    clerkToken: clerkSession.token
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.extensionToken;
            } else {
                const errorText = await response.text();
                console.error('Failed to convert token:', response.status, response.statusText, errorText);
                return null;
            }
        } catch (error) {
            console.error('Token conversion failed:', error);
            return null;
        }
    }

    // 3. Token Management - Secure storage and validation
    async storeToken(token) {
        return new Promise((resolve) => {
            chrome.storage.local.set({
                'chartilyze_extension_token': token,
                'chartilyze_token_timestamp': Date.now()
            }, () => {
                console.log('🔐 Token stored securely');
                resolve();
            });
        });
    }

    async getStoredToken() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['chartilyze_extension_token'], (result) => {
                resolve(result.chartilyze_extension_token || null);
            });
        });
    }

    async validateStoredToken(token) {
        try {
            const response = await fetch(`${this.backendUrl}/auth/validate-extension-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.valid;
            }
            return false;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    }

    async validateStoredSession(sessionData) {
        try {
            console.log('🔄 Validating stored session with backend...');
            
            const response = await fetch(`${this.backendUrl}/auth/validate-stored-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionData: sessionData
                })
            });
    
            if (response.ok) {
                const data = await response.json();
                return { valid: data.valid, token: data.extensionToken };
            } else {
                console.log('❌ Stored session is invalid');
                return { valid: false };
            }
        } catch (error) {
            console.error('Session validation failed:', error);
            return { valid: false };
        }
    }

    // Get valid token for API requests
    async getValidToken() {
        const authResult = await this.checkAuthentication();
        if (!authResult.authenticated) {
            throw new Error('Not authenticated');
        }
        return authResult.token;
    }

    // 5. User Experience - Clear logout flow
    async signOut() {
        return new Promise((resolve) => {
            chrome.storage.local.remove([
                'chartilyze_extension_token',
                'chartilyze_token_timestamp'
            ], () => {
                console.log('🚪 Signed out successfully');
                
                // Clear any auth intervals
                if (this.authCheckInterval) {
                    clearInterval(this.authCheckInterval);
                }
                
                resolve();
            });
        });
    }

    // Periodic sync with web app auth state
    startAuthSync() {
        setInterval(async () => {
            const authResult = await this.checkAuthentication();
            if (!authResult.authenticated) {
                // Notify UI that authentication was lost
                chrome.runtime.sendMessage({ 
                    type: 'AUTH_STATE_CHANGED', 
                    authenticated: false 
                });
            }
        }, 60000); // Check every minute
    }

    // UPDATED: Complete rewrite of signIn method
    async signIn() {
        console.log('🔑 Starting sign-in process...');
        try {
            // Clear any existing stored tokens first
            await chrome.storage.local.remove([
                'chartilyze_extension_token',
                'chartilyze_token_timestamp'
            ]);
            
            // First, check for existing sessions in any tab
            const existingSession = await this.checkAuthInAllTabs();
            if (existingSession) {
                console.log('🎉 Found existing session, using it directly');
                
                let token = null;
                
                // If we have a sessionId, we can convert directly
                if (existingSession.sessionId) {
                    token = await this.convertClerkToExtensionToken(existingSession);
                } else if (existingSession.hasStoredSession) {
                    // Otherwise validate the stored session
                    const validationResult = await this.validateStoredSession(existingSession);
                    if (validationResult && validationResult.valid) {
                        token = validationResult.token;
                    }
                }
                
                if (token) {
                    await this.storeToken(token);
                    return { success: true, token };
                }
            }
            
            // No existing session found, proceed with normal authentication
            const result = await this.initiateAuthentication();
            console.log('✅ Sign-in successful:', result);
            return result;
        } catch (error) {
            console.error('❌ Sign-in failed:', error);
            throw error;
        }
    }
}