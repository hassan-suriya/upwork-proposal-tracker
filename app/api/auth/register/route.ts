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
      console.log('Registration: Connecting to database...');
      await dbConnect();
      console.log('Registration: Database connected successfully');
    } catch (dbError: any) {
      console.error('Database connection error during registration:', dbError.message);
      return NextResponse.json(
        { message: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }
    
    try {
      // Check if user already exists
      console.log('Registration: Checking if email already exists...');
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        console.log('Registration: Email already in use');
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 409 }
        );
      }
    } catch (userCheckError: any) {
      console.error('Error checking existing user:', userCheckError.message);
      return NextResponse.json(
        { message: 'Database error while checking user. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    let savedUser;
    try {
      console.log('Registration: Creating new user record...');
      const newUser = new User({
        email: email.toLowerCase().trim(),
        hashedPassword,
        role: role || 'viewer' // Default to viewer if not specified
      });
      
      // Save with more detailed error handling
      try {
        savedUser = await newUser.save();
        console.log('Registration: User saved successfully');
      } catch (saveError: any) {
        // Check for duplicate key error (code 11000)
        if (saveError.code === 11000) {
          console.error('Registration: Duplicate email error:', saveError.message);
          return NextResponse.json(
            { message: 'Email address is already registered' },
            { status: 409 }
          );
        }
        
        console.error('Registration: Error saving user:', saveError.message);
        return NextResponse.json(
          { message: 'Failed to create user account. Database error.' },
          { status: 500 }
        );
      }
    } catch (userCreateError: any) {
      console.error('Registration: User creation error:', userCreateError.message);
      return NextResponse.json(
        { message: 'Error creating user account' },
        { status: 500 }
      );
    }
    
    // Generate token for auto-login (optional feature)
    let token;
    try {
      if (savedUser) {
        const tokenPayload = {
          userId: savedUser._id.toString(),
          email: savedUser.email,
          role: savedUser.role
        };
        token = signToken(tokenPayload);
        console.log('Registration: Token generated for new user');
      }
    } catch (tokenError) {
      console.error("Token generation failed during registration:", tokenError);
      // We continue without a token since this is registration
    }
    
    const response = NextResponse.json({
      message: 'User registered successfully',
      user: savedUser ? {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      } : undefined,
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
