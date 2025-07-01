"use client";

// Token storage in memory (for current session only)
let inMemoryToken: string | null = null;

// Helper to check if code is running in browser
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

// Set the in-memory token
export function setAuthToken(token: string): void {
  if (!token || token === 'undefined' || token === 'null') {
    console.warn("Attempted to set invalid auth token");
    return;
  }
  
  if (isBrowser()) {
    console.log("Setting auth token in memory");
    inMemoryToken = token;
    // Also try to set in localStorage for persistence (may not work in all browsers)
    try {
      localStorage.setItem('auth_token', token); // Store the actual token
      localStorage.setItem('auth_token_timestamp', Date.now().toString());
      
      // Also set a secondary flag that's easier to read
      localStorage.setItem('is_authenticated', 'true');
      console.log("Auth token stored in localStorage");
    } catch (e) {
      console.warn('Could not access localStorage', e);
    }
  }
}

// Clear the auth token (for logout)
export function clearAuthToken(): void {
  if (isBrowser()) {
    inMemoryToken = null;
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token_timestamp');
      localStorage.removeItem('is_authenticated');
    } catch (e) {
      console.warn('Could not access localStorage', e);
    }
    
    // Also clear any auth cookies
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'auth-status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // If in production, also try to clear domain cookies
    if (window.location.hostname.includes('.')) {
      const domain = window.location.hostname;
      document.cookie = `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${domain};`;
      document.cookie = `auth-status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${domain};`;
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
    return true;
  }
  
  // Then check if there's an actual token in localStorage
  try {
    const localToken = localStorage.getItem('auth_token');
    if (localToken && localToken !== 'undefined' && localToken !== 'null') {
      // Restore token to memory
      inMemoryToken = localToken;
      return true;
    }
    
    // Check for secondary auth flag
    if (localStorage.getItem('is_authenticated') === 'true') {
      return true;
    }
  } catch (e) {
    console.warn('Could not access localStorage', e);
  }
  
  // Then check cookies
  const cookieToken = getCookie('token');
  if (cookieToken && cookieToken !== 'undefined' && cookieToken !== 'null') {
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
  
  console.log('Auth status check - status cookie:', hasStatusCookie, 'valid timestamp:', hasValidTimestamp);
  return hasStatusCookie || hasValidTimestamp;
}

// Get auth token
export function getAuthToken(): string | undefined {
  if (!isBrowser()) return undefined;
  
  // First check in-memory token
  if (inMemoryToken) {
    return inMemoryToken;
  }
  
  // Then check localStorage (useful after page refresh)
  try {
    const localToken = localStorage.getItem('auth_token');
    if (localToken && localToken !== 'undefined' && localToken !== 'null') {
      inMemoryToken = localToken; // Restore to memory
      return localToken;
    }
  } catch (e) {
    console.warn('Could not access localStorage', e);
  }
  
  // Finally check for httpOnly cookie through an API call
  // This is a fallback and will trigger an API request
  const hasStatusCookie = getCookie('auth-status') === 'logged-in';
  if (hasStatusCookie) {
    console.log('Auth status cookie found, but no token in memory or localStorage');
    // Will need to rely on cookie-based auth for API calls
    return 'cookie-based-auth';
  }
  
  return undefined;
}

// Fetch with auth token
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Properly type the headers
  const headers: Record<string, string> = { 
    ...options.headers as Record<string, string>,
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  const token = getAuthToken();
  if (token && token !== 'cookie-based-auth') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Always include credentials for cookie-based auth
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include' // Always include credentials for cookie-based auth
  };
  
  return fetch(url, fetchOptions);
}
