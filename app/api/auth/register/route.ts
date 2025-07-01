import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

// Configure the runtime to use Node.js instead of Edge
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();
    
    // Validate request
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ['freelancer', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }
    
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error during registration:', dbError);
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 409 }
      );
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      hashedPassword,
      role: role || 'viewer' // Default to viewer if not specified
    });
    
    try {
      await newUser.save();
    } catch (saveError) {
      console.error('Error saving new user:', saveError);
      return NextResponse.json(
        { message: 'Failed to create user account' },
        { status: 500 }
      );
    }
    
    // Generate token for auto-login (optional feature)
    const tokenPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role
    };
    
    let token;
    try {
      token = signToken(tokenPayload);
    } catch (tokenError) {
      console.error("Token generation failed during registration:", tokenError);
      // We continue without a token since this is registration
    }
    
    const response = NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      },
      // Include token if auto-login is desired
      token: token || undefined
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
    
    console.log("Registration successful");
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
