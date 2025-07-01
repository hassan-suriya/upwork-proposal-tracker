import { NextRequest, NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';
import { cookies } from 'next/headers';

// Configure the runtime to use Node.js instead of Edge
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log('Logout requested');
  
  try {
    // Get domain from host header for cookie settings
    const host = req.headers.get('host') || '';
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Determine domain for cookies
    let domain;
    if (isProduction && process.env.COOKIE_DOMAIN) {
      // Strip any protocol if it exists
      domain = process.env.COOKIE_DOMAIN.replace(/^https?:\/\//, '');
      console.log('Using cookie domain for logout:', domain);
    }
    
    // Clear all auth cookies
    const cookieStore = cookies();
    
    // Clear the httpOnly token cookie
    cookieStore.delete({
      name: 'token',
      path: '/',
      domain: domain,
    });
    
    // Clear the auth status cookie
    cookieStore.delete({
      name: 'auth-status',
      path: '/',
      domain: domain,
    });
    
    // Create response with proper headers
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });
    
    // Also explicitly clear cookies in the response
    response.cookies.delete({
      name: 'token',
      path: '/',
      domain: domain,
    });
    
    response.cookies.delete({
      name: 'auth-status',
      path: '/',
      domain: domain,
    });
    
    // Clear Authorization header
    response.headers.delete('Authorization');
    
    console.log('Logout cookies cleared successfully');
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({
      message: 'Logout process completed with issues'
    });
  }
}
