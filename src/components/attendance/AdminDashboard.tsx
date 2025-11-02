import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  Calendar,
  Activity,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import { useDashboardData } from '@/hooks/useAttendance';
import { attendanceApiService } from '@/services/attendanceApiService';

/**
 * Admin Dashboard Component
 * Main overview page showing current status, today's stats, and quick actions
 */
export const AdminDashboard: React.FC = () => {
  const { currentStatus, todayReport, weeklyActivity, isLoading, hasError, refetchAll } = useDashboardData();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load attendance data</h3>
        <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
        <Button onClick={refetchAll} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const currentData = currentStatus.data;
  const todayData = todayReport.data;
  const weeklyData = weeklyActivity.data;

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Currently Checked In */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Currently In</p>
                <p className="text-3xl font-bold text-green-600">
                  {currentData?.currentlyCheckedIn || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Students in hostel
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Present */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Present Today</p>
                <p className="text-3xl font-bold text-blue-600">
                  {todayData?.summary.totalPresent || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {todayData?.summary.attendanceRate || '0%'} attendance rate
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-purple-600">
                  {todayData?.summary.totalStudents || 0}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Registered students
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData?.students.slice(0, 5).map((student, index) => (
                <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <UserCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.studentName}</p>
                      <p className="text-sm text-gray-500">
                        Checked in {student.durationSoFar} ago
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    In
                  </Badge>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-200"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Current Status</p>
                    <p className="text-sm text-gray-500">See who's in the hostel now</p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 hover:bg-green-50 hover:border-green-200"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Daily Report</p>
                    <p className="text-sm text-gray-500">Generate attendance reports</p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 hover:bg-purple-50 hover:border-purple-200"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-gray-500">View trends and insights</p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 hover:bg-orange-50 hover:border-orange-200"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Activity Log</p>
                    <p className="text-sm text-gray-500">Check-in/out timeline</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {weeklyData?.summary.totalCheckIns || 0}
              </p>
              <p className="text-sm text-gray-600">Total Check-ins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {weeklyData?.summary.totalCheckOuts || 0}
              </p>
              <p className="text-sm text-gray-600">Total Check-outs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(weeklyData?.summary.averageCheckInsPerDay || 0)}
              </p>
              <p className="text-sm text-gray-600">Avg Check-ins/Day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {weeklyData?.summary.currentlyCheckedIn || 0}
              </p>
              <p className="text-sm text-gray-600">Currently In</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        <Clock className="h-4 w-4 mr-2" />
        Data refreshes automatically every 30 seconds
      </div>
    </div>
  );
};