'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export function ExtensionAuthDetector() {
  const { isSignedIn, sessionId, userId } = useAuth();

  useEffect(() => {
    function notifyExtensionOfAuth() {
      if (isSignedIn && sessionId && userId) {
        console.log('Found Clerk session, notifying extension');
        
        // Send to extension via window message
        window.postMessage({
          type: 'EXTENSION_AUTH_COMPLETE',
          clerkData: {
            sessionId,
            userId,
            token: null // Will be fetched by extension
          }
        }, '*');
        
        // Dispatch custom event
        const authEvent = new CustomEvent('chartilyze-auth-detected', {
          detail: { sessionId, userId }
        });
        document.dispatchEvent(authEvent);
      }
    }

    // Check when auth state changes
    if (isSignedIn) {
      notifyExtensionOfAuth();
    }

    // Handle extension auth flow UI
    if (typeof window !== 'undefined' && window.location.search.includes('extension=true')) {
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:10px;background:#4caf50;color:white;text-align:center;z-index:9999;';
      div.textContent = isSignedIn 
        ? 'Authentication successful! You can close this tab.'
        : 'Chartilyze Extension is waiting for authentication. Please sign in.';
      
      if (isSignedIn) {
        div.style.background = '#2196F3';
        setTimeout(() => window.close(), 2000);
      }
      
      document.body.appendChild(div);
      
      return () => {
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
      };
    }
  }, [isSignedIn, sessionId, userId]);

  return null; // This component doesn't render anything
}