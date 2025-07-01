import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'freelancer' | 'viewer';
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
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
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    
    return verifyToken(token);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
