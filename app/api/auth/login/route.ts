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
    
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }
    
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
    
    let token;
    try {
      token = signToken(tokenPayload);
      console.log("Token generated successfully");
    } catch (tokenError) {
      console.error("Token generation failed:", tokenError);
      return NextResponse.json(
        { message: 'Authentication system error' },
        { status: 500 }
      );
    }
    
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
    
    // Determine domain for cookies
    let domain;
    if (isProduction) {
      // Use COOKIE_DOMAIN env var or extract from host
      domain = process.env.COOKIE_DOMAIN || (host.includes('.') ? host.split(':')[0] : undefined);
    }
    
    // Set cookie options with improved security and cross-domain support
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days for longer sessions
      domain: domain
    };
    
    // Add token cookie to response
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
    
    // Include the token in headers
    response.headers.set('Authorization', `Bearer ${token}`);
    
    console.log("Login successful, cookies and headers set");
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
