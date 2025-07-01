"use client";

import { useState, useEffect } from "react";
import { getAuthToken, setAuthToken } from "@/lib/client-auth";

// This is a simple component to test authentication
export default function TestAuth() {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<string | null>(null);
  
  // Check for token on load
  useEffect(() => {
    try {
      const currentToken = getAuthToken();
      setToken(currentToken);
      setIsLoading(false);
    } catch (error) {
      console.error("Error getting auth token:", error);
      setTestResult(`Error checking token: ${error}`);
      setIsLoading(false);
    }
  }, []);
  
  // Test setting a token
  const testSetToken = () => {
    try {
      const testToken = "test-token-" + Math.random().toString(36).substring(2, 10);
      setAuthToken(testToken);
      
      // Verify it was set correctly
      const retrievedToken = getAuthToken();
      
      if (retrievedToken === testToken) {
        setToken(retrievedToken);
        setTestResult("✅ Token storage working correctly!");
      } else {
        setTestResult(`❌ Token storage failed: Retrieved "${retrievedToken}" but expected "${testToken}"`);
      }
    } catch (error) {
      console.error("Error in token test:", error);
      setTestResult(`❌ Token test error: ${error}`);
    }
  };
  
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-lg shadow">
            <h2 className="text-lg font-semibold">Current Token Status</h2>
            {token ? (
              <div className="text-green-500 mt-2">
                Token found! First 10 chars: {token.substring(0, 10)}...
              </div>
            ) : (
              <div className="text-red-500 mt-2">
                No token found
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <button 
              onClick={testSetToken}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              Test Token Storage
            </button>
            
            {testResult && (
              <div className={`p-4 rounded-md ${testResult.includes("✅") ? "bg-green-100" : "bg-red-100"}`}>
                {testResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
