"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchWithAuth } from "@/lib/client-auth";

// Color palette for charts - improved for better visibility
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  
  // Load report data
  useEffect(() => {
    fetchReportData();
  }, [reportType, year]);
  
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`/api/reports?type=${reportType}&year=${year}`);
      
      if (!response || !response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      setReportData(data.data || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report data. Please try again.",
      });
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReportYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };
  
  // Format number as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-2">
          View and analyze your proposal performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="report-type">Report Type</Label>
          <Select 
            value={reportType} 
            onValueChange={setReportType}
          >
            <SelectTrigger id="report-type">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly Performance</SelectItem>
              <SelectItem value="statusDistribution">Status Distribution</SelectItem>
              <SelectItem value="priceAnalysis">Price Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="report-year">Year</Label>
          <Select 
            value={year} 
            onValueChange={setYear}
          >
            <SelectTrigger id="report-year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {generateReportYears().map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading report data...</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {reportType === 'monthly' && 'Monthly Performance'}
                {reportType === 'statusDistribution' && 'Proposal Status Distribution'}
                {reportType === 'priceAnalysis' && 'Average Price Analysis'}
              </CardTitle>
              <CardDescription>
                {reportType === 'monthly' && 'Proposal performance by month'}
                {reportType === 'statusDistribution' && 'Distribution of proposals by status'}
                {reportType === 'priceAnalysis' && 'Average proposal prices by month'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {reportData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                ) : reportType === 'monthly' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="applied" fill="#3b82f6" name="Applied" />
                      <Bar dataKey="viewed" fill="#10b981" name="Viewed" />
                      <Bar dataKey="interviewed" fill="#f59e0b" name="Interviewed" />
                      <Bar dataKey="hired" fill="#f97316" name="Hired" />
                      <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : reportType === 'statusDistribution' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({ status, count }) => `${status}: ${count}`}
                      >
                        {reportData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : reportType === 'priceAnalysis' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="avgPrice" fill="#00C49F" name="Average Price" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {reportType === 'monthly' && reportData.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Yearly Summary</CardTitle>
                <CardDescription>Summary of your proposal activity for {year}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center border">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {reportData.reduce((sum, month) => sum + (month.total || 0), 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Applied</h3>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">
                      {reportData.reduce((sum, month) => sum + (month.applied || 0), 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Viewed</h3>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-200">
                      {reportData.reduce((sum, month) => sum + (month.viewed || 0), 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-center border border-amber-200 dark:border-amber-800">
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Interviewed</h3>
                    <p className="text-3xl font-bold text-amber-700 dark:text-amber-200">
                      {reportData.reduce((sum, month) => sum + (month.interviewed || 0), 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-center border border-orange-200 dark:border-orange-800">
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300">Hired</h3>
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-200">
                      {reportData.reduce((sum, month) => sum + (month.hired || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      <div className="flex justify-end">
        <Button onClick={fetchReportData} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh Report"}
        </Button>
      </div>
    </div>
  );
}
