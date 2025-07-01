import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Proposal from '@/models/Proposal';
import { getCurrentUser } from '@/lib/auth';

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

    // Get query parameters for filtering
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    
    // Filter by user role
    if (user.role === 'freelancer') {
      // Freelancers can see their own proposals
      query.userId = user.userId;
    } else if (user.role === 'viewer') {
      // Viewers can see all proposals, no additional filter needed
    } else {
      return NextResponse.json(
        { message: 'Invalid user role' },
        { status: 403 }
      );
    }
    
    // Apply filters
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (minPrice && maxPrice) {
      query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice) {
      query.price = { $gte: Number(minPrice) };
    } else if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }
    
    if (search) {
      query.$or = [
        { jobLink: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const [proposals, total] = await Promise.all([
      Proposal.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Proposal.countDocuments(query)
    ]);
    
    return NextResponse.json({
      proposals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
