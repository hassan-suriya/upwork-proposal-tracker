import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('GET /api/auth/me - No user found');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    console.log(`GET /api/auth/me - User: ${user.email}`);
    return NextResponse.json({ 
      authenticated: true, 
      user: {
        email: user.email,
        userId: user.userId,
        role: user.role 
      }
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { message: 'Internal server error', authenticated: false },
      { status: 500 }
    );
  }
}
