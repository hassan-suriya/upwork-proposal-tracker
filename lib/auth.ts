import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Use environment variable for JWT_SECRET with a fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-should-be-changed-in-production';

// Check if JWT_SECRET is the default in production
if (JWT_SECRET === 'dev-jwt-secret-should-be-changed-in-production' && process.env.NODE_ENV === 'production') {
  console.error('WARNING: Using default JWT_SECRET in production environment! Please set a proper JWT_SECRET.');
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'freelancer' | 'viewer';
}

export function signToken(payload: TokenPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Extended to 7 days for better user experience
  } catch (error) {
    console.error('Failed to sign JWT token:', error);
    throw new Error('Authentication system error - token signing failed');
  }
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token || token === 'undefined' || token === 'null') {
      console.error('Invalid token provided for verification');
      return null;
    }
    
    console.log('Verifying token with secret available:', !!JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Validate that the decoded token has the required fields
    if (!decoded.userId || !decoded.email || !decoded.role) {
      console.error('Token is missing required fields');
      return null;
    }
    
    return decoded;
  } catch (error: any) {
    console.error('Token verification failed:', error?.message || 'Unknown error');
    return null;
  }
}

export async function setTokenCookie(token: string) {
  try {
    const cookieStore = await cookies();
    
    // Get domain for production - strip any protocol from COOKIE_DOMAIN if it exists
    let domain = undefined;
    if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
      domain = process.env.COOKIE_DOMAIN.replace(/^https?:\/\//, '');
    }
    
    console.log('Setting cookie with domain:', domain);
    
    cookieStore.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      domain: domain,
    });
    
    // Also set a non-HTTP-only cookie for client-side auth status checking
    cookieStore.set({
      name: 'auth-status',
      value: 'logged-in',
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      domain: domain,
    });
  } catch (error) {
    console.error('Failed to set auth cookies:', error);
  }
}

export function createCookieString(token: string): string {
  return `token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24}; ${
    process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  }SameSite=Lax`;
}

export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Check authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    console.log('Token found in Authorization header');
    return authHeader.substring(7);
  }
  
  // Then check for cookie
  const token = req.cookies.get('token')?.value;
  if (token) {
    console.log('Token found in cookies');
    return token;
  }
  
  // Legacy cookie parsing as fallback
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookieMap = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  if (cookieMap['token']) {
    console.log('Token found in cookie header');
    return cookieMap['token'];
  }
  
  console.log('No token found in request');
  return null;
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return null;
    }
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      console.log('No token found in cookies');
      return null;
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('Invalid token found in cookies');
      return null;
    }
    
    return decoded;
  } catch (error: any) {
    console.error('Error getting current user:', error?.message || 'Unknown error', error);
    return null;
  }
}
