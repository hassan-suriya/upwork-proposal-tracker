import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Proposal from '@/models/Proposal';
import { getCurrentUser } from '@/lib/auth';

// Configure the runtime to use Node.js instead of Edge
export const runtime = 'nodejs';

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
    
    // Only freelancer can create proposals
    if (user.role !== 'freelancer') {
      return NextResponse.json(
        { message: 'Only freelancer can create proposals' },
        { status: 403 }
      );
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.date || !data.jobLink || !data.price) {
      return NextResponse.json(
        { message: 'Date, job link, and price are required' },
        { status: 400 }
      );
    }
    
    // Create new proposal
    const newProposal = new Proposal({
      userId: user.userId,
      date: new Date(data.date),
      jobLink: data.jobLink,
      status: data.status || 'applied',
      price: data.price,
      notes: data.notes || ''
    });
    
    await newProposal.save();
    
    return NextResponse.json(newProposal);
    
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
