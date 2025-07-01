import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  // Development shortcut - always authenticate in dev mode
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({ 
      authenticated: true, 
      user: {
        email: "dev@example.com",
        userId: "dev-user-id",
        role: "freelancer" 
      }
    });
  }

  return withAuth(req, async (userId, role) => {
    try {
      // Connect to database to get fresh user data
      await dbConnect();
      const user = await User.findById(userId).select('-hashedPassword');
      
      if (!user) {
        console.log('GET /api/auth/me - User not found in database');
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
      
      console.log(`GET /api/auth/me - User authenticated: ${user.email}`);
      return NextResponse.json({ 
        authenticated: true, 
        user: {
          id: user._id,
          email: user.email,
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
  });
}
