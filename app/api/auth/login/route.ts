import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { signToken, setTokenCookie, createCookieString } from '@/lib/auth';

// Configure the runtime to use Node.js instead of Edge
export const runtime = 'nodejs';

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
    
    // Create response with user data AND token
    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      token: token, // Include token in response body for client-side storage
      success: true
    });
    
    // Get domain from host header for cookie settings
    const host = req.headers.get('host') || '';
    const isProduction = process.env.NODE_ENV === 'production';
    
    // In production, we may need to set the domain properly for cookies
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      secure: true, // Always use secure in production for HTTPS
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7 // 7 days for longer sessions
    };
    
    // Add token cookie to response using Next.js cookies
    response.cookies.set({
      name: 'token',
      value: token,
      ...cookieOptions
    });
    
    // Also set a non-httpOnly cookie for client-side access
    response.cookies.set({
      name: 'auth-status',
      value: 'logged-in',
      ...cookieOptions,
      httpOnly: false
    });
    
    // Additionally, include the token in the response JSON for immediate client access
    response.headers.set('Authorization', `Bearer ${token}`);
    
    // Log for debugging
    console.log("Cookie settings:", {
      secure: true,
      sameSite: 'lax',
      path: '/',
      domain: req.headers.get('host')
    });
    
    console.log("Login successful, cookies set");
    
    return response;
  } catch (error: any) {
    console.error('Login error:', error?.message || 'Unknown error', error);
    
    // Check specifically for JWT_SECRET errors
    if (error?.message === 'JWT_SECRET is not defined') {
      return NextResponse.json(
        { 
          message: 'Server configuration error', 
          error: process.env.NODE_ENV === 'development' ? 'JWT_SECRET is not defined' : 'Authentication error'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Authentication failed', 
        error: process.env.NODE_ENV === 'development' ? error?.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
