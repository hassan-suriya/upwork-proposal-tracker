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

    // Get current date and calculate date ranges
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Base query - filter by user if freelancer
    const baseQuery: any = {};
    if (user.role === 'freelancer') {
      baseQuery.userId = user.userId;
    }
    
    // Get stats for different time periods
    const [
      totalCount,
      weeklyCount,
      monthlyCount,
      yearlyCount,
      byStatus,
      byMonth,
      recentActivity,
      responseRates
    ] = await Promise.all([
      // Total proposals count
      Proposal.countDocuments(baseQuery),
      
      // Weekly count
      Proposal.countDocuments({
        ...baseQuery,
        date: { $gte: startOfWeek }
      }),
      
      // Monthly count
      Proposal.countDocuments({
        ...baseQuery,
        date: { $gte: startOfMonth }
      }),
      
      // Yearly count
      Proposal.countDocuments({
        ...baseQuery,
        date: { $gte: startOfYear }
      }),
      
      // Group by status
      Proposal.aggregate([
        { $match: baseQuery },
        { $group: { 
          _id: "$status", 
          count: { $sum: 1 },
          totalValue: { $sum: "$price" }
        }}
      ]),
      
      // Group by month for current year
      Proposal.aggregate([
        { 
          $match: {
            ...baseQuery,
            date: { $gte: startOfYear }
          }
        },
        {
          $group: {
            _id: { $month: "$date" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      
      // Recent activity (10 most recent proposals)
      Proposal.find(baseQuery)
        .sort({ date: -1 })
        .limit(10)
        .select('date jobLink status price'),
        
      // Response rates
      Proposal.aggregate([
        { $match: baseQuery },
        { $group: { 
          _id: null, 
          total: { $sum: 1 },
          viewed: { 
            $sum: { 
              $cond: [
                { $in: ["$status", ["viewed", "interviewed", "hired"]] }, 
                1, 
                0
              ] 
            }
          },
          interviewed: { 
            $sum: { 
              $cond: [
                { $in: ["$status", ["interviewed", "hired"]] }, 
                1, 
                0
              ] 
            }
          },
          hired: { 
            $sum: { 
              $cond: [
                { $eq: ["$status", "hired"] }, 
                1, 
                0
              ] 
            }
          }
        }}
      ])
    ]);
    
    // Calculate response rates
    const rates = responseRates.length > 0 ? responseRates[0] : { total: 0, viewed: 0, interviewed: 0, hired: 0 };
    const responseRateData = {
      viewRate: rates.total > 0 ? (rates.viewed / rates.total) * 100 : 0,
      interviewRate: rates.total > 0 ? (rates.interviewed / rates.total) * 100 : 0,
      hireRate: rates.total > 0 ? (rates.hired / rates.total) * 100 : 0
    };
    
    // Format status data
    const statusData = byStatus.reduce((acc: any, item: any) => {
      acc[item._id] = {
        count: item.count,
        totalValue: item.totalValue
      };
      return acc;
    }, {});
    
    // Format month data (fill in missing months with 0)
    const monthData = Array(12).fill(0);
    byMonth.forEach((item: any) => {
      monthData[item._id - 1] = item.count;
    });
    
    // Calculate average proposal value
    const avgProposalValue = statusData.applied?.totalValue 
      ? statusData.applied.totalValue / statusData.applied.count
      : 0;
    
    return NextResponse.json({
      counts: {
        total: totalCount,
        weekly: weeklyCount,
        monthly: monthlyCount,
        yearly: yearlyCount
      },
      statusData,
      monthData,
      recentActivity,
      responseRates: responseRateData,
      avgProposalValue
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
