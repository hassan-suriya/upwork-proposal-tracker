"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { hasAuthToken, setAuthToken, getAuthToken } from "@/lib/client-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  // Client-side only auth check
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check if user is already logged in - client-side only
  useEffect(() => {
    // This will only run in the browser
    const checkAuth = async () => {
      if (hasAuthToken()) {
        try {
          // Make an actual auth check request
          const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${getAuthToken()}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
              console.log("Auth check confirmed user is logged in, redirecting to dashboard");
              setIsLoggedIn(true);
              router.push('/dashboard');
              return;
            }
          }
          
          // If we get here, the token is invalid or expired
          console.log("Auth token exists but is invalid");
        } catch (error) {
          console.error("Error checking authentication status:", error);
        }
      } else {
        console.log("No auth token found, staying on login page");
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Include cookies in request/response
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Get token from multiple possible sources (in order of preference)
        let token = null;
        
        // 1. Try Authorization header
        const authHeader = response.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
          console.log("Token found in Authorization header");
        } 
        // 2. Try response body
        else if (data.token) {
          token = data.token;
          console.log("Token found in response body");
        }
        
        if (token) {
          // Store token in memory and localStorage
          setAuthToken(token);
          console.log("Token stored successfully, length:", token.length);
          
          // Also set a backup flag in localStorage
          try {
            localStorage.setItem('is_authenticated', 'true');
            localStorage.setItem('user_email', email);
          } catch (storageError) {
            console.warn('Could not save auth data to localStorage:', storageError);
          }
          
          // Force a refresh to validate token is accessible
          const checkToken = getAuthToken();
          console.log("Token verification check:", checkToken ? "Token available" : "Token NOT available");
        } else {
          console.warn("No token found in response. Attempting to continue with cookie-based auth.");
          // Set backup authentication indicators
          try {
            localStorage.setItem('is_authenticated', 'true');
            localStorage.setItem('user_email', email);
          } catch (storageError) {
            console.warn('Could not save auth data to localStorage:', storageError);
          }
        }
        
        toast({
          title: "Success",
          description: "Login successful! Redirecting...",
        });
        
        console.log("Login successful, redirecting to dashboard...");
        
        // Short delay to ensure token is stored properly
        setTimeout(() => {
          try {
            router.push("/dashboard");
            router.refresh();
          } catch (e) {
            console.error("Router navigation failed, using fallback:", e);
            // Use window.location as fallback
            window.location.href = "/dashboard";
          }
        }, 300);
      } else {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: data.message || "Invalid email or password",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Yoodule Upwork Proposal Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to your account
        </p>
        {isLoggedIn && (
          <p className="text-xs text-primary mt-1">
            You appear to already be logged in. 
            <button 
              onClick={() => router.push('/dashboard')}
              className="underline ml-1"
            >
              Go to dashboard
            </button>
          </p>
        )}
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
