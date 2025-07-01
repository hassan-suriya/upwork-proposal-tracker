"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  useEffect(() => {
    // Only redirect if explicitly authenticated and auth check is complete
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log("User authenticated, redirecting to dashboard");
        router.push('/dashboard');
      } else {
        // Auth check is complete and user is not authenticated
        console.log("User not authenticated, staying on home page");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // If still checking authentication, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading authentication status...</p>
      </div>
    );
  }
  
  // If authenticated but somehow still on this page
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <p className="text-lg">You are logged in. Redirecting to dashboard...</p>
        <Button onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center max-w-3xl text-center">
        <div className="space-y-6">
          <Image
            className="dark:invert mx-auto"
            src="/next.svg"
            alt="Upwork Proposal Tracker"
            width={220}
            height={46}
            priority
          />
          <h1 className="text-4xl font-bold">Yoodule Upwork Proposal Tracker</h1>
          <p className="text-xl text-muted-foreground">
            Track, manage and analyze your Upwork proposals to maximize your success rate
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <Button 
            className="rounded-full h-12 px-8 text-base"
            asChild
          >
            <a href="/auth/login">Login</a>
          </Button>
          <Button 
            className="rounded-full h-12 px-8 text-base"
            variant="outline"
            asChild
          >
            <a href="/auth/register">Register</a>
          </Button>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Track Proposals</h3>
              <p>Keep a record of all your Upwork proposals with details on status, pricing, and client info.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Analyze Performance</h3>
              <p>Get insights into your success rates, interview rates, and other key metrics.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Set Goals</h3>
              <p>Establish weekly targets and track your progress towards meeting them.</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="row-start-3 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Yoodule Upwork Proposal Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}
