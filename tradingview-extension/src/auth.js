// auth.js
class AuthManager {
    constructor(config = {}) {
        this.webAppUrl = config.webAppUrl || 'https://chartilyze.com';
        this.backendUrl = config.backendUrl || 'https://decisive-tapir-206.convex.site';
        this.authWindow = null;
        this.authCheckInterval = null;
        
        console.log('🔧 AuthManager initialized with:', {
            webAppUrl: this.webAppUrl,
            backendUrl: this.backendUrl
        });
        
        this.checkWebsiteSession();
    }
        async checkWebsiteSession() {
        try {
            const response = await fetch(`${this.webAppUrl}/api/auth/session`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const sessionData = await response.json();
                console.log('✅ Found active website session');
                
                // Store the session data
                localStorage.setItem('chartilyze_token', sessionData.token);
                localStorage.setItem('chartilyze_user_id', sessionData.userId);
                
                // Also store in chrome.storage
                await this.storeToken(sessionData.token);
            }
        } catch (error) {
            console.log('⚠️ Could not check website session:', error);
        }
    }


    setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.origin.includes('chartilyze.com') || 
                event.origin.includes('localhost')) {
                
                if (event.data && event.data.type === 'EXTENSION_AUTH_COMPLETE') {
                    console.log('✅ Received auth completion message from web app');
                    this.handleAuthComplete(event.data.clerkData);
                }
            }
        });

        chrome.runtime.onMessage.addListener((message, sender) => {
            if (message.type === 'EXTENSION_AUTH_AVAILABLE' && message.clerkData) {
                console.log('✅ Received auth data from content script');
                this.handleAuthComplete(message.clerkData);
                return true;
            }
        });
    }

    async handleAuthComplete(clerkData) {
        try {
            console.log('🔄 Processing auth completion with data:', clerkData);
            
            if (this.authCheckInterval) {
                clearInterval(this.authCheckInterval);
                this.authCheckInterval = null;
            }
            
            const token = await this.convertClerkToExtensionToken(clerkData);
            if (token) {
                await this.storeToken(token);
                
                if (this.authWindow && this.authWindow.id) {
                    try {
                        await chrome.tabs.remove(this.authWindow.id);
                    } catch (e) {
                        console.log('Could not close auth tab:', e);
                    }
                }
                
                chrome.runtime.sendMessage({
                    type: 'AUTH_STATE_CHANGED',
                    authenticated: true
                });
            }
        } catch (error) {
            console.error('Failed to process authentication completion:', error);
        }
    }

async checkExistingSession() {
    try {
        console.log('🔍 Checking for existing session...');
        
        // Check if user has Clerk cookies (indicates they're logged in)
        const cookies = await chrome.cookies.getAll({
            domain: '.chartilyze.com'
        });
        
        const clerkCookies = cookies.filter(cookie => 
            cookie.name.startsWith('__clerk') || 
            cookie.name.startsWith('__session')
        );
        
        if (clerkCookies.length > 0) {
            console.log('✅ Found Clerk cookies, user appears to be logged in');
            
            // Try to get session from the website API
            try {
                const response = await fetch('https://chartilyze.com/api/auth/session', {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const sessionData = await response.json();
                    console.log('✅ Found active website session:', sessionData);
                    return {
                        source: 'website',
                        sessionId: sessionData.sessionId,
                        userId: sessionData.userId,
                        token: sessionData.token
                    };
                }
            } catch (apiError) {
                console.log('⚠️ API call failed, but cookies suggest user is logged in');
                // Could implement fallback logic here
            }
        }
        
        // First try to get the session from the website
        try {
            const response = await fetch('https://chartilyze.com/api/auth/session', {
                credentials: 'include', // Important: include cookies
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const sessionData = await response.json();
                console.log('✅ Found active website session:', sessionData);
                
                // Store the session data in localStorage for future use
                localStorage.setItem('chartilyze_token', sessionData.token);
                localStorage.setItem('chartilyze_user_id', sessionData.userId);

                return {
                    source: 'website',
                    sessionId: sessionData.sessionId || 'website-session',
                    userId: sessionData.userId,
                    token: sessionData.token
                };
            }
        } catch (webError) {
            console.log('⚠️ Could not fetch website session:', webError);
        }

        // Then check localStorage
        const storedToken = localStorage.getItem('chartilyze_token');
        const storedUserId = localStorage.getItem('chartilyze_user_id');
        
        if (storedToken && storedUserId) {
            console.log('✅ Found localStorage session');
            return {
                source: 'localStorage',
                sessionId: 'localStorage-session',
                userId: storedUserId,
                token: storedToken
            };
        }

        // Finally check chrome.storage
        const storageData = await new Promise(resolve => {
            chrome.storage.local.get([
                'chartilyze_extension_token',
                'chartilyze_user_id'
            ], result => resolve(result));
        });

        if (storageData.chartilyze_extension_token && storageData.chartilyze_user_id) {
            console.log('✅ Found chrome.storage session');
            return {
                source: 'extension',
                sessionId: 'extension-session',
                userId: storageData.chartilyze_user_id,
                token: storageData.chartilyze_extension_token
            };
        }

        // If we get here, no session was found
        console.log('❌ No stored session found');
        return null;
    } catch (error) {
        console.error('Error checking existing session:', error);
        return null;
    }
}

    async checkAuthentication() {
        try {
            console.log('🔍 === STARTING AUTHENTICATION CHECK ===');
            
            // Step 1: Check for existing Clerk session
            console.log('📋 Step 1: Checking for existing Clerk session...');
            const existingSession = await this.checkExistingSession();
            
            if (existingSession && existingSession.sessionId) {
                console.log('🎉 Found existing session, attempting to convert...');
                try {
                    const extensionToken = await this.convertClerkToExtensionToken(existingSession);
                    if (extensionToken) {
                        await this.storeToken(extensionToken);
                        console.log('✅ === AUTHENTICATION SUCCESS: Converted existing session ===');
                        return { authenticated: true, token: extensionToken };
                    }
                } catch (conversionError) {
                    console.error('⚠️ Session conversion failed:', conversionError);
                    await this.removeStoredToken();
                    localStorage.removeItem('chartilyze_token');
                    localStorage.removeItem('chartilyze_user_id');
                }
            }
            
            // Step 2: Check stored token
            console.log('📋 Step 2: Checking stored extension token...');
            const storedToken = await this.getStoredToken();
            
            if (storedToken) {
                console.log('🔑 Found stored token, validating...');
                const isValid = await this.validateStoredToken(storedToken);
                
                if (isValid) {
                    console.log('✅ === AUTHENTICATION SUCCESS: Valid stored token ===');
                    return { authenticated: true, token: storedToken };
                } else {
                    console.log('❌ Stored token is invalid, removing...');
                    await this.removeStoredToken();
                }
            }
            
            console.log('❌ === AUTHENTICATION FAILED: No valid token or session found ===');
            return { authenticated: false };
        } catch (error) {
            console.error('💥 Authentication check failed:', error);
            return { authenticated: false, error: error.message };
        }
    }

    async initiateAuthentication() {
        return new Promise(async (resolve, reject) => {
            console.log('🚀 Starting authentication process...');
            
            if (this.authCheckInterval) {
                clearInterval(this.authCheckInterval);
            }
            
            console.log('🔗 Opening authentication tab...');
            const loginUrl = `${this.webAppUrl}/sign-in?extension=true&extension_callback=true`;
            
            chrome.tabs.create({ url: loginUrl }, (tab) => {
                this.authWindow = tab;
                
                try {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            const checkInterval = setInterval(() => {
                                if (window.Clerk?.session?.id) {
                                    window.postMessage({
                                        type: 'EXTENSION_AUTH_COMPLETE',
                                        clerkData: {
                                            sessionId: window.Clerk.session.id,
                                            userId: window.Clerk.user.id,
                                            token: window.Clerk.session.getToken ? window.Clerk.session.getToken() : null
                                        }
                                    }, '*');
                                    
                                    clearInterval(checkInterval);
                                }
                            }, 1000);
                            
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
                
                this.authCheckInterval = setInterval(async () => {
                    try {
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
                
                setTimeout(() => {
                    if (this.authCheckInterval) {
                        clearInterval(this.authCheckInterval);
                        if (this.authWindow) {
                            chrome.tabs.remove(this.authWindow.id).catch(() => {});
                        }
                        reject(new Error('Authentication timeout - please try again'));
                    }
                }, 600000); // 10 minute timeout
            });
        });
    }

async convertClerkToExtensionToken(sessionData) {
    try {
        console.log('🔄 Converting session to extension token:', {
            source: sessionData.source,
            userId: sessionData.userId
        });

        // If we already have a localStorage session, we can use it directly
        if (sessionData.source === 'localStorage') {
            const extensionToken = {
                userId: sessionData.userId,
                token: sessionData.token,
                type: 'localStorage',
                timestamp: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };
            
            // Store the token in extension storage
            await this.storeToken(extensionToken);
            
            return extensionToken;
        }

        // Only make API call if it's not a localStorage session
        const response = await fetch(`${this.backendUrl}/auth/extension-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clerkSessionId: sessionData.sessionId,
                clerkUserId: sessionData.userId,
                clerkToken: sessionData.token
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to convert token:', response.status, errorText);
            throw new Error(`Token conversion failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Successfully converted token');
        return data.extensionToken;
    } catch (error) {
        console.error('Token conversion failed:', error);
        throw error;
    }
}

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

    async removeStoredToken() {
        return new Promise((resolve) => {
            chrome.storage.local.remove([
                'chartilyze_extension_token',
                'chartilyze_token_timestamp'
            ], () => {
                console.log('🗑️ Token removed');
                resolve();
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

    async getValidToken() {
        const authResult = await this.checkAuthentication();
        if (!authResult.authenticated) {
            throw new Error('Not authenticated');
        }
        return authResult.token;
    }

    async signOut() {
        return new Promise((resolve) => {
            chrome.storage.local.remove([
                'chartilyze_extension_token',
                'chartilyze_token_timestamp'
            ], () => {
                console.log('🚪 Signed out successfully');
                
                if (this.authCheckInterval) {
                    clearInterval(this.authCheckInterval);
                }
                
                resolve();
            });
        });
    }

    async signIn() {
        console.log('🔑 Starting sign-in process...');
        try {
            await this.removeStoredToken();
            
            const result = await this.initiateAuthentication();
            console.log('✅ Sign-in successful:', result);
            return result;
        } catch (error) {
            console.error('❌ Sign-in failed:', error);
            throw error;
        }
    }

    startAuthSync() {
        setInterval(async () => {
            const authResult = await this.checkAuthentication();
            if (!authResult.authenticated) {
                chrome.runtime.sendMessage({ 
                    type: 'AUTH_STATE_CHANGED', 
                    authenticated: false 
                });
            }
        }, 60000); // Check every minute
    }
}

export default AuthManager;