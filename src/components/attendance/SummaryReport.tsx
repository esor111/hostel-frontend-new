import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  Activity,
  Download,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { useSummaryReport } from '@/hooks/useAttendance';
import { attendanceApiService } from '@/services/attendanceApiService';

/**
 * Summary Report Component
 * Shows analytics and trends over a date range
 */
export const SummaryReport: React.FC = () => {
  const [dateRange, setDateRange] = useState(() => {
    const range = attendanceApiService.getDateRange('month');
    return {
      from: range.from,
      to: range.to,
    };
  });

  const { data, isLoading, error, refetch } = useSummaryReport(dateRange.from, dateRange.to);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load analytics</h3>
        <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
        <Button onClick={() => refetch()} className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const handleDateRangeChange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    const newRange = attendanceApiService.getDateRange(range);
    setDateRange({
      from: newRange.from,
      to: newRange.to,
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting summary report', dateRange);
  };

  // Prepare chart data
  const chartData = data?.dailyBreakdown.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    present: day.present,
    checkIns: day.checkIns,
    checkOuts: day.checkOuts,
    attendanceRate: day.present > 0 ? ((day.present / (day.present + (50 - day.present))) * 100).toFixed(1) : 0
  })) || [];

  // Pie chart data for check-in/out distribution
  const pieData = [
    { name: 'Check-ins', value: data?.summary.totalCheckIns || 0, color: '#10B981' },
    { name: 'Check-outs', value: data?.summary.totalCheckOuts || 0, color: '#EF4444' },
  ];

  const averageCheckIns = Math.round(data?.summary.averageCheckInsPerDay || 0);
  const totalDays = data?.dailyBreakdown.length || 0;

  return (
    <div className="space-y-6">
      {/* Date Range Selection */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateRangeChange('week')}
            >
              This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateRangeChange('month')}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateRangeChange('year')}
            >
              This Year
            </Button>
          </div>
        </div>
        
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Analytics
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Check-ins</p>
                <p className="text-3xl font-bold text-blue-600">
                  {data?.summary.totalCheckIns || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {totalDays} days period
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Check-outs</p>
                <p className="text-3xl font-bold text-green-600">
                  {data?.summary.totalCheckOuts || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Completed sessions
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Check-ins/Day</p>
                <p className="text-3xl font-bold text-purple-600">
                  {averageCheckIns}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Daily average
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Active Days</p>
                <p className="text-3xl font-bold text-orange-600">
                  {totalDays}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Days with activity
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="present" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Present Students"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Check-in/out Activity Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="checkIns" fill="#3B82F6" name="Check-ins" />
                  <Bar dataKey="checkOuts" fill="#EF4444" name="Check-outs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in/out Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Activity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Activity Level</span>
                </div>
                <p className="text-sm text-blue-700">
                  Average of {averageCheckIns} check-ins per day over {totalDays} days
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Completion Rate</span>
                </div>
                <p className="text-sm text-green-700">
                  {data?.summary.totalCheckOuts || 0} completed sessions out of {data?.summary.totalCheckIns || 0} check-ins
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Peak Activity</span>
                </div>
                <p className="text-sm text-purple-700">
                  {chartData.length > 0 && (
                    <>
                      Highest activity: {Math.max(...chartData.map(d => d.checkIns))} check-ins in a day
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-900">Period Summary</span>
                </div>
                <p className="text-sm text-orange-700">
                  Analysis covers {totalDays} days from {new Date(dateRange.from).toLocaleDateString()} to {new Date(dateRange.to).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Info */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Analytics period: {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
            </span>
            <span>Generated at: {new Date().toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};