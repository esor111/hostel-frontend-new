import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDashboard } from '../hooks/useDashboard';
import { useStudents } from '../hooks/useStudents';
import { useNavigation } from '../hooks/useNavigation';
import Pagination from './ui/pagination';
import {
  Users,
  Bed,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Calendar,
  Bell,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  RefreshCw,
  Gift,
  Loader2
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { navigateTo } = useNavigation();

  // Use new dashboard hook with auto-refresh and pagination
  const {
    stats,
    recentActivities,
    activitiesPagination,
    activitiesLoading,
    loading: dashboardLoading,
    error: dashboardError,
    refreshDashboard,
    loadRecentActivitiesPaginated,
    clearError,
    lastRefresh,
    hasData
  } = useDashboard({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    loadOnMount: true
  });

  // Handle pagination change
  const handlePageChange = (page: number) => {
    loadRecentActivitiesPaginated(page, 6);
  };

  // Use students hook for additional student data
  const {
    students,
    stats: studentStats,
    loading: studentsLoading
  } = useStudents();

  const handleRefresh = async () => {
    try {
      await refreshDashboard();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  };

  // Calculate statistics from real API data
  const totalStudents = stats?.totalStudents || studentStats?.total || students.length;
  const activeStudents = studentStats?.active || students.filter(s => s.status === 'Active').length;
  const availableRooms = stats?.availableRooms || 0;
  const occupancyRate = stats?.occupancyPercentage || stats?.occupancyRate || 0;

  const monthlyRevenue = stats?.monthlyRevenue?.amount || stats?.totalRevenue || stats?.monthlyCollection || 0;
  const revenueDisplay = stats?.monthlyRevenue?.value || `NPR ${monthlyRevenue.toLocaleString()}`;

  const outstandingDues = stats?.outstandingDues || studentStats?.totalDues || 0;

  // Loading state
  const isLoading = dashboardLoading || studentsLoading;

  // Format last refresh time
  const lastRefreshTime = lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : null;

  // Handle navigation to students page
  const handleStudentsClick = () => {
    navigateTo('/ledger?section=students');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your hostel.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastRefreshTime && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastRefreshTime}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {dashboardError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error loading dashboard data: {dashboardError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Students Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleStudentsClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{activeStudents}</span> active
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Available Beds and Rooms Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Beds and Rooms</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.availableBeds || availableRooms}</div>
                <p className="text-xs text-muted-foreground">
                  {availableRooms} rooms available • {occupancyRate}% occupied
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{revenueDisplay}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">Current month</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Dues Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateTo('/ledger')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {typeof outstandingDues === 'number' && outstandingDues > 0
                    ? `NPR ${outstandingDues.toLocaleString()}`
                    : 'NPR 0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {typeof outstandingDues === 'number' && outstandingDues > 0
                    ? `Unpaid invoices`
                    : 'All cleared'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Attendance Counters Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {stats?.attendanceCounters?.checkIn || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {stats?.attendanceCounters?.checkOut || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Check-out</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadRecentActivitiesPaginated(1, 6)}
                disabled={activitiesLoading}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${activitiesLoading ? 'animate-spin' : ''}`} />
                Load Paginated
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {activitiesLoading || dashboardLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading activities...</span>
                  </div>
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    // Get icon component based on activity type
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'booking':
                          return <Gift className="h-4 w-4" />;
                        case 'payment':
                          return <DollarSign className="h-4 w-4" />;
                        case 'checkin':
                        case 'checkout':
                        case 'student':
                          return <Users className="h-4 w-4" />;
                        default:
                          return <Activity className="h-4 w-4" />;
                      }
                    };

                    // Get color based on activity type
                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case 'booking':
                          return 'bg-purple-500';
                        case 'payment':
                          return 'bg-green-500';
                        case 'checkin':
                        case 'student':
                          return 'bg-blue-500';
                        case 'checkout':
                          return 'bg-orange-500';
                        default:
                          return 'bg-gray-500';
                      }
                    };

                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">
                              {getActivityIcon(activity.type)}
                            </span>
                            <p className="text-sm font-medium capitalize">{activity.type}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.message || activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time || new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activities</p>
                  </div>
                </div>
              )}
            </ScrollArea>
            
            {/* Pagination Controls */}
            {activitiesPagination && activitiesPagination.totalPages > 1 && (
              <div className="flex justify-center pt-4 border-t">
                <Pagination
                  currentPage={activitiesPagination.page}
                  totalPages={activitiesPagination.totalPages}
                  onPageChange={handlePageChange}
                  hasNext={activitiesPagination.hasNext}
                  hasPrev={activitiesPagination.hasPrev}
                  className="scale-90"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigateTo('/ledger?section=students')}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Students
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigateTo('/ledger?section=payments')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigateTo('/ledger?section=students')}
            >
              <Search className="h-4 w-4 mr-2" />
              Search Students
            </Button>

          </CardContent>
        </Card>
      </div>

      {/* Status Indicators */}
      {hasData && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>API Connected</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Auto-refresh: 30s</span>
            </div>
          </div>
          <div>
            Dashboard loaded with real-time data
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;