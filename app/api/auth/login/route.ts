import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { signToken, setTokenCookie, createCookieString } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Validate request
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Generate token with user info
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    console.log("Creating token with payload:", JSON.stringify(tokenPayload));
    const token = signToken(tokenPayload);
    console.log("Token generated, length:", token.length);
    
    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      success: true
    });
    
    // Add token cookie to response using Next.js cookies
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    // Also set a non-httpOnly cookie for client-side access
    response.cookies.set({
      name: 'auth-status',
      value: 'logged-in',
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    console.log("Login successful, cookies set");
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
