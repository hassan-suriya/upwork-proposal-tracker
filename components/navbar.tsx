"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      
      // First clear client-side tokens for immediate feedback
      try {
        // Clear localStorage items
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_timestamp');
        localStorage.removeItem('is_authenticated');
        localStorage.removeItem('user_email');
        
        // Clear cookies using multiple approaches to ensure they're gone
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
        document.cookie = 'auth-status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
        
        // If in production, also try domain-specific cookie clearing
        if (window.location.hostname.includes('.')) {
          const domain = window.location.hostname;
          document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${domain}; SameSite=Lax;`;
          document.cookie = `auth-status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${domain}; SameSite=Lax;`;
        }
        
        console.log("Client-side auth data cleared");
      } catch (clientError) {
        console.error("Error clearing client-side auth:", clientError);
      }
      
      // Show logout toast for better UX
      toast({
        title: "Logging out...",
        description: "Please wait while we log you out.",
      });
      
      // Use the auth provider logout for consistent handling
      await logout();
      
      // Force a complete page reload to ensure clean state
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout properly. Please try clearing your cookies manually.",
      });
      
      // Even if API call fails, try to redirect to login
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Yoodule Upwork Proposal Tracker</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/logout">
            <Button variant="outline">
              Logout
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
