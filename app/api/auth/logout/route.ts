import { NextRequest, NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // Clear the token cookie
  removeTokenCookie();
  
  return NextResponse.json({
    message: 'Logged out successfully'
  });
}
