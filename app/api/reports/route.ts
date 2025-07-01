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

    // Get query parameters
    const url = new URL(req.url);
    const reportType = url.searchParams.get('type') || 'monthly';
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
    
    // Base query - filter by user if freelancer
    const baseQuery: any = {};
    if (user.role === 'freelancer') {
      baseQuery.userId = user.userId;
    }
    
    // Define date range based on report type
    const startDate = new Date(year, 0, 1); // January 1st of the selected year
    const endDate = new Date(year + 1, 0, 0); // December 31st of the selected year
    
    baseQuery.date = { $gte: startDate, $lte: endDate };

    // Get proposals within date range
    const proposals = await Proposal.find(baseQuery).sort({ date: 1 });

    // Process data based on report type
    if (reportType === 'monthly') {
      // Group by month and status
      const monthlyData = Array(12).fill(0).map((_, i) => {
        const month = new Date(year, i, 1).toLocaleString('default', { month: 'short' });
        return {
          month,
          applied: 0,
          viewed: 0,
          interviewed: 0,
          hired: 0,
          rejected: 0,
          total: 0
        };
      });
      
      // Process proposals
      proposals.forEach(proposal => {
        const month = new Date(proposal.date).getMonth();
        monthlyData[month].total++;
        
        // Type-safe status increment
        const status = proposal.status as 'applied' | 'viewed' | 'interviewed' | 'hired' | 'rejected';
        if (status in monthlyData[month]) {
          monthlyData[month][status]++;
        }
      });

      return NextResponse.json({
        reportType,
        year,
        data: monthlyData
      });
    } 
    
    else if (reportType === 'statusDistribution') {
      // Count proposals by status
      const statusCounts: Record<string, number> = {
        applied: 0,
        viewed: 0,
        interviewed: 0,
        hired: 0,
        rejected: 0
      };
      
      proposals.forEach(proposal => {
        const status = proposal.status as 'applied' | 'viewed' | 'interviewed' | 'hired' | 'rejected';
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });
      
      // Convert to array format for charts
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));

      return NextResponse.json({
        reportType,
        year,
        data: statusData
      });
    }
    
    else if (reportType === 'priceAnalysis') {
      // Calculate average price per month
      const priceByMonth = Array(12).fill(0).map((_, i) => {
        const month = new Date(year, i, 1).toLocaleString('default', { month: 'short' });
        return {
          month,
          avgPrice: 0,
          totalProposals: 0
        };
      });
      
      // Process proposals
      const monthCounters = Array(12).fill(0).map(() => ({ sum: 0, count: 0 }));
      
      proposals.forEach(proposal => {
        const month = new Date(proposal.date).getMonth();
        monthCounters[month].sum += proposal.price;
        monthCounters[month].count++;
      });
      
      // Calculate averages
      monthCounters.forEach((counter, index) => {
        if (counter.count > 0) {
          priceByMonth[index].avgPrice = Math.round(counter.sum / counter.count);
          priceByMonth[index].totalProposals = counter.count;
        }
      });

      return NextResponse.json({
        reportType,
        year,
        data: priceByMonth
      });
    }
    
    else {
      return NextResponse.json(
        { message: 'Invalid report type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { message: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
