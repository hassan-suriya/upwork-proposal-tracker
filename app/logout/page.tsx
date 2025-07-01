"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();
  
  useEffect(() => {
    async function performLogout() {
      try {
        // Clear client-side storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_timestamp');
          localStorage.removeItem('is_authenticated');
          localStorage.removeItem('user_email');
          
          // Clear cookies
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'auth-status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          
          // Domain-specific cookies
          if (window.location.hostname.includes('.')) {
            const domain = window.location.hostname;
            document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${domain};`;
            document.cookie = `auth-status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${domain};`;
          }
        }
        
        // Call the API
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
        
        // Use auth context logout
        await logout();
        
        // Hard redirect to login page
        window.location.href = '/auth/login';
      } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect to login even if there's an error
        window.location.href = '/auth/login';
      }
    }
    
    performLogout();
  }, [logout, router]);
  
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Logging out...</h1>
        <p className="text-muted-foreground mt-2">Please wait while we log you out.</p>
      </div>
    </div>
  );
}
