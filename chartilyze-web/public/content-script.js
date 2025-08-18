// content-script.js - Inject into web app domain
(function() {
    // Function to check and notify extension of Clerk auth
    function notifyExtensionOfAuth() {
        if (window.Clerk && window.Clerk.session) {
            console.log('Found Clerk session, notifying extension');
            
            // Send to extension via window message (for popup/sidepanel)
            window.postMessage({
                type: 'EXTENSION_AUTH_COMPLETE',
                clerkData: {
                    sessionId: window.Clerk.session.id,
                    userId: window.Clerk.user.id,
                    token: window.Clerk.session.getToken ? window.Clerk.session.getToken() : null
                }
            }, '*');
            
            // Also dispatch a custom event for content scripts
            const authEvent = new CustomEvent('chartilyze-auth-detected', {
                detail: {
                    sessionId: window.Clerk.session.id,
                    userId: window.Clerk.user.id
                }
            });
            document.dispatchEvent(authEvent);
        }
    }
    
    // Check immediately if Clerk is already loaded
    if (window.Clerk && window.Clerk.session) {
        notifyExtensionOfAuth();
    }
    
    // Also set up an observer to detect when Clerk becomes available
    let checkCount = 0;
    const maxChecks = 10;
    
    const checkClerkInterval = setInterval(() => {
        if (window.Clerk && window.Clerk.session) {
            notifyExtensionOfAuth();
            clearInterval(checkClerkInterval);
        }
        
        checkCount++;
        if (checkCount >= maxChecks) {
            clearInterval(checkClerkInterval);
        }
    }, 1000);
    
    // Special handling for extension auth flow
    if (window.location.search.includes('extension=true')) {
        // Add a notification banner
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:10px;background:#4caf50;color:white;text-align:center;z-index:9999;';
        div.textContent = 'Chartilyze Extension is waiting for authentication. Please sign in.';
        
        // Add banner when DOM is ready
        if (document.readyState !== 'loading') {
            document.body.appendChild(div);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(div);
            });
        }
        
        // Listen for auth events to update UI
        document.addEventListener('chartilyze-auth-detected', () => {
            // Update banner
            div.textContent = 'Authentication successful! You can close this tab.';
            div.style.background = '#2196F3';
            
            // Auto-close tab after delay
            setTimeout(() => {
                window.close();
            }, 2000);
        });
    }
})();