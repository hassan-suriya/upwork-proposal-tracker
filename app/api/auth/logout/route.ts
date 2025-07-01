import { NextRequest, NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

// Configure the runtime to use Node.js instead of Edge
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Clear the token cookie
  removeTokenCookie();
  
  return NextResponse.json({
    message: 'Logged out successfully'
  });
}
