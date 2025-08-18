class AuthManager {
    constructor() {
        this.webAppUrl = 'https://app.chartilyze.com';
        this.backendUrl = 'https://decisive-tapir-206.convex.site';
        this.authCheckInterval = null;
        this.authWindow = null;
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

            console.log('❌ No valid authentication found');
            return { authenticated: false };
        } catch (error) {
            console.error('Authentication check failed:', error);
            return { authenticated: false };
        }
    }

    // Detect existing Clerk session from web app tabs
    async detectClerkSession() {
        try {
            const tabs = await chrome.tabs.query({ 
                url: [`${this.webAppUrl}/*`, "*://localhost:3000/*"] 
            });

            for (const tab of tabs) {
                try {
                    // Inject script to check for Clerk session
                    const results = await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            // Check for Clerk session data
                            const clerkSession = window.Clerk?.session;
                            if (clerkSession) {
                                return {
                                    sessionId: clerkSession.id,
                                    userId: clerkSession.user?.id,
                                    token: clerkSession.getToken ? clerkSession.getToken() : null
                                };
                            }
                            
                            // Fallback: check localStorage for Clerk data
                            const clerkData = localStorage.getItem('clerk-session');
                            if (clerkData) {
                                try {
                                    return JSON.parse(clerkData);
                                } catch (e) {
                                    return null;
                                }
                            }
                            
                            return null;
                        }
                    });

                    if (results[0]?.result) {
                        return results[0].result;
                    }
                } catch (error) {
                    console.log(`Could not check session in tab ${tab.url}:`, error);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Failed to detect Clerk session:', error);
            return null;
        }
    }

    // 2. Authentication Flow - Open web app for login
    async initiateAuthentication() {
        return new Promise((resolve, reject) => {
            console.log('🚀 Initiating authentication flow...');
            
            // Open web app login page
            const loginUrl = `${this.webAppUrl}/sign-in?extension=true`;
            
            chrome.tabs.create({ url: loginUrl }, (tab) => {
                this.authWindow = tab;
                
                // Set up periodic checking for authentication completion
                this.authCheckInterval = setInterval(async () => {
                    try {
                        const session = await this.detectClerkSession();
                        if (session) {
                            console.log('✅ Authentication completed!');
                            clearInterval(this.authCheckInterval);
                            
                            // Convert Clerk session to extension token
                            const extensionToken = await this.convertClerkToExtensionToken(session);
                            if (extensionToken) {
                                await this.storeToken(extensionToken);
                                resolve({ success: true, token: extensionToken });
                            } else {
                                reject(new Error('Failed to convert session to extension token'));
                            }
                        }
                    } catch (error) {
                        console.error('Auth check error:', error);
                    }
                }, 2000); // Check every 2 seconds
                
                // Timeout after 5 minutes
                setTimeout(() => {
                    if (this.authCheckInterval) {
                        clearInterval(this.authCheckInterval);
                        reject(new Error('Authentication timeout'));
                    }
                }, 300000);
            });
        });
    }

    // 4. Convex Integration - Convert Clerk token to Convex-compatible JWT
    async convertClerkToExtensionToken(clerkSession) {
        try {
            console.log('🔄 Converting Clerk session to extension token...');
            
            const response = await fetch(`${this.backendUrl}/auth/extension-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clerkSessionId: clerkSession.sessionId,
                    clerkUserId: clerkSession.userId,
                    clerkToken: clerkSession.token
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.extensionToken;
            } else {
                console.error('Failed to convert token:', response.statusText);
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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
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

    // Add this method after the initiateAuthentication method
    async signIn() {
        console.log('🔑 Starting sign-in process...');
        try {
            const result = await this.initiateAuthentication();
            console.log('✅ Sign-in successful:', result);
            return result;
        } catch (error) {
            console.error('❌ Sign-in failed:', error);
            throw error;
        }
    }
}