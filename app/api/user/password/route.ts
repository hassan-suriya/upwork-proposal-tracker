import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Configure the runtime to use Node.js instead of Edge
export const runtime = 'nodejs';

// Update user password
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Find user with password
    const userDoc = await User.findById(user.userId);
    
    if (!userDoc) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userDoc.hashedPassword);
    
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(
      user.userId,
      { hashedPassword }
    );

    return NextResponse.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { message: 'Failed to update password' },
      { status: 500 }
    );
  }
}
