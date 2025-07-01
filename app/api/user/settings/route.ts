import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Configure the runtime to use Node.js instead of Edge
export const runtime = 'nodejs';

// GET current user's settings
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the complete user document from the database
    const userDoc = await User.findById(user.userId).select('-hashedPassword');
    
    if (!userDoc) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // For viewer role, get weekly target from primary freelancer
    let settings = userDoc.settings || {
      weeklyTarget: 10,
      defaultView: 'list',
      currency: 'USD'
    };

    if (userDoc.role === 'viewer') {
      // Find primary freelancer to get their weekly target
      const primaryFreelancer = await User.findOne({ role: 'freelancer' }).select('settings');
      if (primaryFreelancer && primaryFreelancer.settings) {
        // Use the freelancer's weekly target, but viewer's own settings for other preferences
        settings = {
          ...settings,
          weeklyTarget: primaryFreelancer.settings.weeklyTarget || 10
        };
      }
    }

    // Return user data including settings
    return NextResponse.json({
      user: {
        id: userDoc._id,
        email: userDoc.email,
        name: userDoc.name || '',
        role: userDoc.role,
        settings: settings
      }
    });
  } catch (error) {
    console.error('Error getting user settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
}

// Update user profile and settings
export async function PUT(req: NextRequest) {
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
    const { name, email, settings } = body;

    // Check if email is being changed, and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Prevent viewer from changing weeklyTarget
    let updatedSettings = settings;
    if (user.role === 'viewer' && settings) {
      // If user is a viewer, ensure they can't update weeklyTarget
      const currentUser = await User.findById(user.userId);
      updatedSettings = {
        ...settings,
        weeklyTarget: currentUser?.settings?.weeklyTarget || 10
      };
    }
    
    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { 
        ...(name && { name }),
        ...(email && { email }),
        ...(settings && { settings: updatedSettings })
      },
      { new: true }
    ).select('-hashedPassword');

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User settings updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name || '',
        role: updatedUser.role,
        settings: updatedUser.settings
      }
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { message: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}
