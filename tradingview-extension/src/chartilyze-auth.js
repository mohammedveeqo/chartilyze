// chartilyze-auth.js - Runs ONLY on your Chartilyze web app
(function() {
    console.log('Chartilyze auth detection script loaded');
    
    // Function to check and notify extension of Clerk auth
    function notifyExtensionOfAuth() {
        console.log('Checking for Clerk session...');
        
        if (window.Clerk && window.Clerk.session) {
            console.log('Found active Clerk session, notifying extension');
            
            const clerkData = {
                sessionId: window.Clerk.session.id,
                userId: window.Clerk.user.id,
                // Try different ways of getting a token
                token: null
            };
            
            // Try to get token using getToken method
            if (typeof window.Clerk.session.getToken === 'function') {
                try {
                    // Try with convex template first
                    clerkData.token = window.Clerk.session.getToken({ template: 'convex' });
                } catch (e) {
                    console.log('Error getting token with template:', e);
                    try {
                        // Fallback to no template
                        clerkData.token = window.Clerk.session.getToken();
                    } catch (e2) {
                        console.log('Error getting any token:', e2);
                    }
                }
            }
            
            // Send to extension via runtime message
            chrome.runtime.sendMessage({
                type: 'EXTENSION_AUTH_AVAILABLE',
                clerkData: clerkData
            });
            
            return true;
        }
        return false;
    }
    
    // Check immediately if Clerk is already loaded
    let found = notifyExtensionOfAuth();
    
    // If not found immediately, set up a polling check
    if (!found) {
        let checkCount = 0;
        const clerkCheckInterval = setInterval(() => {
            if (notifyExtensionOfAuth() || checkCount > 10) {
                clearInterval(clerkCheckInterval);
            }
            checkCount++;
        }, 1000);
    }
    
    // Special handling for extension auth flow
    if (window.location.search.includes('extension=true')) {
        // Add notification banner
        const banner = document.createElement('div');
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:10px;background:#4caf50;color:white;text-align:center;z-index:9999;';
        banner.innerHTML = 'Chartilyze Extension is waiting for authentication. Please sign in.';
        
        if (document.body) {
            document.body.appendChild(banner);
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(banner);
            });
        }
        
        // Update banner when auth is detected
        const updateBanner = () => {
            if (window.Clerk && window.Clerk.session) {
                banner.innerHTML = 'Authentication successful! You can close this tab.';
                banner.style.background = '#2196F3';
                
                // Notify extension
                chrome.runtime.sendMessage({
                    type: 'EXTENSION_AUTH_COMPLETE',
                    clerkData: {
                        sessionId: window.Clerk.session.id,
                        userId: window.Clerk.user.id
                    }
                });
                
                // Close tab after delay
                setTimeout(() => {
                    window.close();
                }, 2000);
                
                return true;
            }
            return false;
        };
        
        // Check periodically for auth completion
        let checkCount = 0;
        const authCheckInterval = setInterval(() => {
            if (updateBanner() || checkCount > 20) {
                clearInterval(authCheckInterval);
            }
            checkCount++;
        }, 1000);
    }
})();