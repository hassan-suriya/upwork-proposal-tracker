"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IProposal, ProposalStatus } from "@/models/Proposal";
import { fetchWithAuth } from "@/lib/client-auth";

// Dashboard stats interface
interface DashboardStats {
  weeklyTotal: number;
  weeklyTarget: number;
  statusBreakdown: { name: string; value: number; color: string }[];
  successRates: {
    viewRate: number;
    interviewRate: number;
    hireRate: number;
  };
  dailyProposals: { name: string; value: number }[];
  fourWeekHistory: { name: string; value: number }[];
  recentProposals: IProposal[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetchWithAuth('/api/auth/me');
        if (response && response.ok) {
          const data = await response.json();
          setUser(data.user);
          console.log("User authenticated:", data.user);
        } else {
          console.log("User not authenticated");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetchWithAuth("/api/proposals/dashboard");
        if (!response || !response.ok) throw new Error("Failed to fetch dashboard data");
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-lg">No data available. Start adding proposals!</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your proposal statistics and performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              {stats.weeklyTotal} of {stats.weeklyTarget} proposals this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress
              value={(stats.weeklyTotal / stats.weeklyTarget) * 100}
              className="h-2"
            />
            <div className="mt-6 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyProposals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>
              Distribution of proposal statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {stats.statusBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rates</CardTitle>
            <CardDescription>Conversion metrics for proposals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">View Rate</span>
                  <span className="text-sm font-medium">
                    {stats.successRates.viewRate.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={stats.successRates.viewRate}
                  className="h-2 mt-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Interview Rate</span>
                  <span className="text-sm font-medium">
                    {stats.successRates.interviewRate.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={stats.successRates.interviewRate}
                  className="h-2 mt-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hire Rate</span>
                  <span className="text-sm font-medium">
                    {stats.successRates.hireRate.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={stats.successRates.hireRate}
                  className="h-2 mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>4-Week History</CardTitle>
            <CardDescription>Weekly proposal totals</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.fourWeekHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Proposals" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 10 proposals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentProposals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left pb-2">Date</th>
                        <th className="text-left pb-2">Status</th>
                        <th className="text-left pb-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentProposals.map((proposal) => (
                        <tr key={proposal._id.toString()}>
                          <td className="py-2">
                            {new Date(proposal.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 capitalize">{proposal.status}</td>
                          <td className="py-2">${proposal.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent proposals
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
