import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Proposal from '@/models/Proposal';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const proposal = await Proposal.findById(params.id);
    
    if (!proposal) {
      return NextResponse.json(
        { message: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to this proposal
    if (user.role === 'freelancer' && proposal.userId.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(proposal);
    
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only freelancer can update
    if (user.role !== 'freelancer') {
      return NextResponse.json(
        { message: 'Only freelancer can update proposals' },
        { status: 403 }
      );
    }
    
    const proposal = await Proposal.findById(params.id);
    
    if (!proposal) {
      return NextResponse.json(
        { message: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this proposal
    if (proposal.userId.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const updates = await request.json();
    
    // Update the proposal
    const updatedProposal = await Proposal.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true }
    );
    
    return NextResponse.json(updatedProposal);
    
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only freelancer can delete
    if (user.role !== 'freelancer') {
      return NextResponse.json(
        { message: 'Only freelancer can delete proposals' },
        { status: 403 }
      );
    }
    
    const proposal = await Proposal.findById(params.id);
    
    if (!proposal) {
      return NextResponse.json(
        { message: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this proposal
    if (proposal.userId.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await Proposal.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: 'Proposal deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
