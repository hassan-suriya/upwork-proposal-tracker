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
  if (inMemoryToken) {
    console.log('Auth token found in memory');
    return true;
  }
  
  // Then check if there's an actual token in localStorage
  try {
    const localToken = localStorage.getItem('auth_token');
    if (localToken) {
      console.log('Auth token found in localStorage');
      // Restore token to memory
      inMemoryToken = localToken;
      return true;
    }
  } catch (e) {
    console.warn('Could not access localStorage', e);
  }
  
  // Then check cookies
  const cookieToken = getCookie('token');
  if (cookieToken) {
    console.log('Auth token found in cookie');
    // Restore token to memory
    inMemoryToken = cookieToken;
    return true;
  }
  
  // If no actual token found, check secondary indicators
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
  
  console.log('No auth token found, status cookie:', hasStatusCookie, 'valid timestamp:', hasValidTimestamp);
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
export function logout(redirectToLogin = true) {
  if (!isBrowser()) return;
  
  console.log('Logging out user, clearing all auth tokens');
  
  // Clear in-memory token
  inMemoryToken = null;
  
  // Clear localStorage
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_timestamp');
    console.log('Cleared localStorage auth tokens');
  } catch (e) {
    console.warn('Could not access localStorage during logout', e);
  }
  
  // Clear cookies - use secure way to clear cookies
  const cookiesToClear = ['token', 'auth-status'];
  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  
  console.log('Cleared auth cookies');
  
  // Only redirect if requested (to prevent infinite loops)
  if (redirectToLogin) {
    // Don't redirect if we're already on login page or home page
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/auth/login') && currentPath !== '/') {
      console.log('Redirecting to login page');
      window.location.href = "/auth/login";
    } else {
      console.log('Already on login or home page, not redirecting');
    }
  } else {
    console.log('Logout complete, no redirect requested');
  }
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
      console.log(`fetchWithAuth to ${url} with token (length: ${token.length})`);
    } else {
      console.log(`fetchWithAuth to ${url} without token`);
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
    
    // For auth checks, don't clear tokens on 401 to prevent loops
    if (response.status === 401 && isBrowser()) {
      if (url.includes('/api/auth/me')) {
        console.log('Auth check returned 401 - normal for logged out users');
      } else {
        console.warn('Authentication error in fetch request to:', url);
        // Clear tokens but don't redirect automatically
        logout(false);
      }
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
