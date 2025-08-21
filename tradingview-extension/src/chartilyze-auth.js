// chartilyze-auth.js - Universal auth detection for sidepanel
(function() {
    console.log('Chartilyze universal auth detection script loaded on:', window.location.hostname);
    
    // Function to check and notify extension of Clerk auth
    async function notifyExtensionOfAuth() {
        console.log('🔍 Checking for Clerk session...');
        
        if (window.Clerk && window.Clerk.session) {
            console.log('✅ Found active Clerk session, notifying extension');
            
            const clerkData = {
                sessionId: window.Clerk.session.id,
                userId: window.Clerk.user.id,
                domain: window.location.hostname,
                token: null
            };
            
            // Try to get token using getToken method - PROPERLY AWAIT
            if (typeof window.Clerk.session.getToken === 'function') {
                try {
                    console.log('🔑 Attempting to get Clerk token with convex template...');
                    // Try with convex template first - AWAIT THIS
                    clerkData.token = await window.Clerk.session.getToken({ template: 'convex' });
                    console.log('✅ Got token with convex template');
                } catch (e) {
                    console.log('⚠️ Error getting token with template:', e);
                    try {
                        console.log('🔑 Attempting to get Clerk token without template...');
                        // Fallback to no template - AWAIT THIS TOO
                        clerkData.token = await window.Clerk.session.getToken();
                        console.log('✅ Got token without template');
                    } catch (e2) {
                        console.log('❌ Error getting any token:', e2);
                    }
                }
            }
            
            console.log('📤 Sending Clerk data to extension:', {
                sessionId: clerkData.sessionId,
                userId: clerkData.userId,
                hasToken: !!clerkData.token,
                domain: clerkData.domain
            });
            
            // Send to extension via runtime message
            chrome.runtime.sendMessage({
                type: 'EXTENSION_AUTH_AVAILABLE',
                clerkData: clerkData
            });
            
            return true;
        }
        console.log('❌ No Clerk session found');
        return false;
    }
    
    // Check immediately if Clerk is already loaded
    notifyExtensionOfAuth().then(found => {
        console.log('Initial auth check result:', found);
        
        // If not found immediately, set up a polling check
        if (!found) {
            console.log('🔄 Setting up polling for Clerk session...');
            let attempts = 0;
            const maxAttempts = 30; // 30 seconds max
            
            const pollInterval = setInterval(async () => {
                attempts++;
                console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}`);
                
                const authFound = await notifyExtensionOfAuth();
                
                if (authFound || attempts >= maxAttempts) {
                    console.log(authFound ? '✅ Auth found via polling' : '⏰ Polling timeout reached');
                    clearInterval(pollInterval);
                }
            }, 1000); // Check every second
        }
    });
})();