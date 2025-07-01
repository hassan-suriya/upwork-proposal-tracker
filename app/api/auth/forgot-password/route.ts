import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // For security reasons, we don't want to reveal if the email exists or not
    if (!user) {
      // We still return 200 to avoid email enumeration attacks
      return NextResponse.json({
        message: 'If your email exists in our system, you will receive a password reset link shortly.'
      });
    }
    
    // Generate a reset token
    const resetToken = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // In a real application, you would send an email with the reset link
    // For this implementation, we'll just return the token
    // In production, NEVER return the token in the response
    
    // For a real app, you would:
    // 1. Store the token in the database with an expiry time
    // 2. Send an email with a link containing the token
    
    return NextResponse.json({
      message: 'If your email exists in our system, you will receive a password reset link shortly.',
      // This is for development purposes only. Remove in production!
      resetToken,
      resetLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
