import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Use environment variable for JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || '';

// Check if JWT_SECRET is missing in production
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('WARNING: JWT_SECRET is not set in production environment!');
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'freelancer' | 'viewer';
}

export function signToken(payload: TokenPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return null;
    }
    
    console.log('Verifying token with secret length:', JWT_SECRET.length);
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Validate that the decoded token has the required fields
    if (!decoded.userId || !decoded.email || !decoded.role) {
      console.error('Token is missing required fields:', decoded);
      return null;
    }
    
    console.log('Token verified successfully:', decoded.email);
    return decoded;
  } catch (error: any) {
    console.error('Token verification failed:', error?.message || 'Unknown error');
    return null;
  }
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
  });
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
