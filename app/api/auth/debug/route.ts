import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';

// This route provides debugging information for authentication issues
// IMPORTANT: Only enable this in a protected environment for debugging purposes
// Disable or remove this file before final deployment

export async function GET(req: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { message: 'Debug endpoint only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Check if JWT_SECRET is defined
    const jwtSecretDefined = !!process.env.JWT_SECRET;
    
    // Get cookie
    const cookie = req.cookies.get('token')?.value;
    
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      jwtSecretDefined,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      cookiePresent: !!cookie,
      cookieLength: cookie ? cookie.length : 0,
      authHeaderPresent: !!authHeader,
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      // Add any other debug info that might be helpful
    });
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { message: 'Error in debug endpoint', error: error?.message },
      { status: 500 }
    );
  }
}
