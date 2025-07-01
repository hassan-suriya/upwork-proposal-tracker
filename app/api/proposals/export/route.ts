import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Proposal from '@/models/Proposal';
import { getCurrentUser } from '@/lib/auth';

// Configure the runtime to use Node.js instead of Edge
export const runtime = 'nodejs';

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
    const format = searchParams.get('format') || 'csv'; // Default to CSV if not specified
    
    // Get fields to include (comma-separated list)
    const fieldsParam = searchParams.get('fields');
    const fields = fieldsParam ? fieldsParam.split(',') : ['date', 'jobLink', 'status', 'price', 'notes', 'createdAt', 'updatedAt'];
    
    // Build base query
    const query: any = {};
    
    // Filter by user role
    if (user.role === 'freelancer') {
      query.userId = user.userId;
    } else if (user.role !== 'viewer') {
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
    
    // Get proposals
    const proposals = await Proposal.find(query).sort({ date: -1 });

    // Format output based on requested format
    if (format === 'json') {
      // For JSON format, return the proposals as JSON
      // Optionally filter fields if specified
      let formattedData = proposals;
      
      if (fieldsParam) {
        formattedData = proposals.map((proposal: any) => {
          const filtered: any = {};
          fields.forEach(field => {
            if (proposal[field] !== undefined) {
              filtered[field] = proposal[field];
            }
          });
          return filtered;
        });
      }
      
      return NextResponse.json({
        proposals: formattedData,
        count: formattedData.length,
        filters: { startDate, endDate, status, minPrice, maxPrice, search }
      });
    } else {
      // CSV Format
      // Generate header row with selected fields
      const headerRow = fields.join(',') + '\r\n';
      let csvContent = headerRow;
      
      // Helper function to sanitize CSV field values
      const sanitizeField = (value: string | number | Date | undefined) => {
        if (value === undefined || value === null) return '';
        
        const stringValue = String(value);
        // Escape quotes with double quotes and wrap field in quotes if it contains commas, quotes or newlines
        const escaped = stringValue.replace(/"/g, '""');
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
          return `"${escaped}"`;
        }
        return escaped;
      };
      
      // Format each proposal as a CSV row
      proposals.forEach((proposal: any) => {
        const row = fields.map(field => {
          let value = proposal[field];
          
          // Format dates
          if (field === 'date' || field === 'createdAt' || field === 'updatedAt') {
            value = value ? new Date(value).toISOString() : '';
          }
          
          return sanitizeField(value);
        }).join(',');
        
        csvContent += row + '\r\n';
      });
      
      // Set headers for CSV download
      const headers = new Headers();
      headers.set('Content-Type', 'text/csv');
      headers.set('Content-Disposition', `attachment; filename="proposals_${new Date().toISOString().split('T')[0]}.csv"`);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers
      });
    }
    
  } catch (error) {
    console.error('Error exporting proposals:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
