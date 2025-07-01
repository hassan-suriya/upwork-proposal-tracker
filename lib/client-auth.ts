"use client";

// Helper to check if code is running in browser
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

// Client-side utility to get cookies
export function getCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

// Check if token exists
export function hasAuthToken(): boolean {
  if (!isBrowser()) return false;
  return !!getCookie('token');
}

// Get auth token
export function getAuthToken(): string | undefined {
  return getCookie('token');
}

// Logout function
export function logout() {
  if (!isBrowser()) return;
  
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/auth/login";
}

// Enhanced fetch function that includes credentials and auth token
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Ensure headers object exists
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  // Include auth token if it exists and we're in a browser
  if (isBrowser()) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Merge options with defaults
  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials, // Always include credentials
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Only handle 401 errors with redirect in the browser
    if (response.status === 401 && isBrowser()) {
      console.error('Authentication error, redirecting to login');
      // Handle token expiration or auth issues
      logout();
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
