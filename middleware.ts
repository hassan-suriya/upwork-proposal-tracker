import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/test', // Allow access to the auth test page
];

// API routes that don't require authentication
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (PUBLIC_PATHS.some(path => pathname === path) || 
      PUBLIC_API_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Skip middleware for API routes - we'll handle auth in the API routes themselves
  // This avoids the Edge runtime limitation with JWT verification
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // For protected pages, check if any auth indicator exists
  // Actual token verification happens in the API routes
  const hasToken = request.cookies.has('token');
  const hasAuthStatus = request.cookies.has('auth-status');
  
  // Check if there is any authentication indicator
  if (!hasToken && !hasAuthStatus) {
    // Redirect to login page with a return URL
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
