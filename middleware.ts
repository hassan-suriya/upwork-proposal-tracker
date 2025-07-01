import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, getTokenFromRequest } from './lib/auth';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
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
  
  // Skip middleware in development for testing
  if (process.env.NODE_ENV === 'development' && pathname.startsWith('/dashboard')) {
    console.log(`Development mode: Skipping auth check for dashboard`);
    return NextResponse.next();
  }
  
  console.log(`Middleware processing: ${pathname}`);
  
  // Allow access to public pages
  if (PUBLIC_PATHS.some(path => pathname === path) || 
      PUBLIC_API_PATHS.some(path => pathname.startsWith(path))) {
    console.log(`Public path allowed: ${pathname}`);
    return NextResponse.next();
  }
  
  // Check for API routes
  if (pathname.startsWith('/api')) {
    const token = getTokenFromRequest(request);
    
    if (!token || !verifyToken(token)) {
      console.log(`API unauthorized: ${pathname}`);
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log(`API authorized: ${pathname}`);
    return NextResponse.next();
  }
  
  // Check for protected pages
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log(`No token found for path: ${pathname}`);
    // Redirect to login page with a return URL
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  const user = verifyToken(token);
  if (!user) {
    console.log(`Invalid token for path: ${pathname}`);
    // Redirect to login page with a return URL
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  console.log(`User authenticated for path: ${pathname}, userId: ${user.userId}`);
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
