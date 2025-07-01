"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { hasAuthToken } from "@/lib/client-auth";

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
    if (hasAuthToken()) {
      console.log("Already logged in, redirecting to dashboard");
      setIsLoggedIn(true);
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
        toast({
          title: "Success",
          description: "Login successful! Redirecting...",
        });
        
        console.log("Login successful, redirecting to dashboard...");
        
        // First try regular navigation
        try {
          router.push("/dashboard");
          router.refresh();
        } catch (e) {
          console.error("Router navigation failed, using fallback:", e);
          // Use window.location as fallback
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        }
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
          Upwork Proposal Tracker
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
