import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

// Configure the runtime to use Node.js instead of Edge
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {

  return withAuth(req, async (userId, role) => {
    try {
      console.log(`GET /api/auth/me - Fetching user data for userId: ${userId}`);
      
      // Connect to database to get fresh user data
      await dbConnect();
      
      console.log(`GET /api/auth/me - Database connected, looking up user: ${userId}`);
      const user = await User.findById(userId).select('-hashedPassword');
      
      if (!user) {
        console.log(`GET /api/auth/me - User not found in database for userId: ${userId}`);
        return NextResponse.json({ 
          authenticated: false, 
          error: 'User not found in database'
        }, { status: 401 });
      }
      
      console.log(`GET /api/auth/me - User authenticated: ${user.email}, role: ${user.role}`);
      return NextResponse.json({ 
        authenticated: true, 
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          // Include any other non-sensitive user fields here
        }
      });
    } catch (error: any) {
      console.error('Error in /api/auth/me:', error?.message || 'Unknown error', error);
      return NextResponse.json(
        { 
          message: 'Internal server error', 
          authenticated: false,
          error: process.env.NODE_ENV === 'development' ? error?.message : 'Error retrieving user data'
        },
        { status: 500 }
      );
    }
  });
}
