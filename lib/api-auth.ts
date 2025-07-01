import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { NextRequest, NextResponse } from 'next/server';

export async function withAuth(
  request: NextRequest,
  handler: (userId: string, role: string) => Promise<NextResponse>
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    // Check for authorization header if cookie is not present
    let authToken = token;
    if (!authToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7);
      }
    }

    // If no token found, return unauthorized
    if (!authToken) {
      console.log('No auth token found in request');
      return NextResponse.json(
        { message: 'Unauthorized', error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decodedToken = verifyToken(authToken);
    if (!decodedToken) {
      console.log('Invalid token provided');
      return NextResponse.json(
        { message: 'Unauthorized', error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Token is valid, execute handler with user information
    return await handler(decodedToken.userId, decodedToken.role);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
