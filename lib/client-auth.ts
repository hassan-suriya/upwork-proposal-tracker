"use client";

// Token storage in memory (for current session only)
let inMemoryToken: string | null = null;

// Helper to check if code is running in browser
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

// Set the in-memory token
export function setAuthToken(token: string): void {
  if (isBrowser()) {
    console.log("Setting auth token in memory, token length:", token.length);
    inMemoryToken = token;
    // Also try to set in localStorage for persistence (may not work in all browsers)
    try {
      localStorage.setItem('auth_token', token); // Store the actual token
      localStorage.setItem('auth_token_timestamp', Date.now().toString());
      console.log("Auth token stored in localStorage");
    } catch (e) {
      console.warn('Could not access localStorage', e);
    }
  }
}

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
  
  // First check in-memory token
  if (inMemoryToken) return true;
  
  // Then check cookies
  const hasStatusCookie = getCookie('auth-status') === 'logged-in';
  
  // Also check localStorage timestamp as a backup
  let hasValidTimestamp = false;
  try {
    const timestamp = localStorage.getItem('auth_token_timestamp');
    if (timestamp) {
      const tokenTime = parseInt(timestamp, 10);
      const now = Date.now();
      // Token is valid for 7 days
      hasValidTimestamp = now - tokenTime < 7 * 24 * 60 * 60 * 1000;
    }
  } catch (e) {
    console.warn('Could not access localStorage', e);
  }
  
  return hasStatusCookie || hasValidTimestamp;
}

// Get auth token
export function getAuthToken(): string | undefined {
  if (!isBrowser()) return undefined;
  
  // First check in-memory token
  if (inMemoryToken) {
    console.log("Retrieved token from memory");
    return inMemoryToken;
  }
  
  // Then check localStorage (useful after page refresh)
  try {
    const localToken = localStorage.getItem('auth_token');
    if (localToken) {
      console.log("Retrieved token from localStorage");
      inMemoryToken = localToken; // Restore to memory
      return localToken;
    }
  } catch (e) {
    console.warn('Could not access localStorage', e);
  }
  
  // Finally fallback to cookie
  const cookieToken = getCookie('token');
  if (cookieToken) {
    console.log("Retrieved token from cookie");
    return cookieToken;
  }
  
  console.warn("No auth token found in client");
  return undefined;
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
