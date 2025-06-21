// components/auth-test.tsx
"use client";

import { useState } from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../chartilyze-backend/convex/_generated/api.js";
import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
// components/debug-auth.tsx


export function DebugAuth() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const identity = useQuery(api.debug.whoAmI);
  const createJournal = useMutation(api.journals.create);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  
const testToken = async () => {
    try {
      const token = await getToken({ template: "convex" });
      // Decode the token to see its contents
      const tokenParts = token?.split('.');
      if (tokenParts && tokenParts.length > 1) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log("Token payload:", payload);
        setLastTestResult({ 
          type: 'token', 
          success: true, 
          payload
        });
      }
    } catch (error) {
      console.error("Token error:", error);
      setLastTestResult({ 
        type: 'token', 
        success: false, 
        error 
      });
    }
  };

  const testAuth = async () => {
    try {
      console.log("Testing auth:");
      console.log("- Clerk signed in:", isSignedIn);
      console.log("- User:", user?.id);
      console.log("- Convex identity:", identity);
      
      const token = await getToken({ template: "convex" });
      console.log("- JWT token present:", !!token);
      
      setLastTestResult({ 
        type: 'auth',
        success: true,
        data: {
          clerkSignedIn: isSignedIn,
          userId: user?.id,
          convexIdentity: identity,
          hasToken: !!token
        }
      });
    } catch (error) {
      console.error("Auth test failed:", error);
      setLastTestResult({ 
        type: 'auth',
        success: false, 
        error 
      });
    }
  };

  const testCreate = async () => {
    try {
      console.log("Testing journal creation...");
      const token = await getToken({ template: "convex" });
      console.log("Has token:", !!token);
      
      const result = await createJournal({
        name: "Test Journal",
        description: "Testing auth",
        settings: {
          defaultRiskPercentage: 1,
          defaultPositionSize: 100
        }
      });
      
      setLastTestResult({ 
        type: 'create', 
        success: true, 
        data: result 
      });
    } catch (error) {
      console.error("Create error:", error);
      setLastTestResult({ 
        type: 'create', 
        success: false, 
        error 
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 p-4 bg-gray-800 rounded text-white">
      <div className="space-y-4">
        <div>
          <div className="font-bold mb-1">Auth Status:</div>
          <div>Clerk: {isSignedIn ? "✅" : "❌"}</div>
          <div>Convex: {identity ? "✅" : "❌"}</div>
          <div>User ID: {user?.id}</div>
        </div>

        <div>
          <div className="font-bold mb-1">Convex Identity:</div>
          <pre className="text-xs bg-gray-900 p-2 rounded">
            {JSON.stringify(identity, null, 2)}
          </pre>
        </div>

        {lastTestResult && (
          <div>
            <div className="font-bold mb-1">Last Test:</div>
            <div className={lastTestResult.success ? "text-green-400" : "text-red-400"}>
              {lastTestResult.type}: {lastTestResult.success ? "Success" : "Failed"}
            </div>
            <pre className="text-xs bg-gray-900 p-2 rounded mt-1">
              {JSON.stringify(lastTestResult.data || lastTestResult.error, null, 2)}
            </pre>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={testToken} 
            disabled={!isSignedIn}
            size="sm"
            className="w-fullull"
          >
            1. Test Token
          </Button>
          <Button 
            onClick={testAuth} 
            disabled={!isSignedIn}
            size="sm"
            className="w-full"
          >
            2. Test Auth
          </Button>
          <Button 
            onClick={testCreate} 
            disabled={!isSignedIn}
            size="sm"
            className="w-full"
          >
            3. Test Create
          </Button>
        </div>
      </div>
    </div>
  );
}
