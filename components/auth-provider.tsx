'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { hasAuthToken, fetchWithAuth, clearAuthToken } from '@/lib/client-auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  // Logout functionality
  const logout = async () => {
    console.log('AuthProvider: Logging out user');
    try {
      // Clear client-side auth state
      clearAuthToken();
      
      // Update auth state
      setIsAuthenticated(false);
      setUser(null);
      
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('AuthProvider: Logout error:', error);
      // Even if API call fails, clear local state
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      if (!hasAuthToken()) {
        console.log('No auth token found in client');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false); // Make sure we set loading to false
        return;
      }

      console.log('Auth token found, checking with API...');
      const response = await fetchWithAuth('/api/auth/me');
      
      if (response && response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          console.log('User authenticated:', data.user);
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          console.log('User not authenticated from API response');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('Auth check failed, status:', response?.status);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, checkAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
