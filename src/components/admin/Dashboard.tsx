
import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Bed,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Zap,
  Target,
  Activity,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { useAppContext } from "@/contexts/AppContext";
import { useNavigation } from "@/hooks/useNavigation";
import { useBookings } from "@/hooks/useBookings";
import { KahaLogo } from "@/components/ui/KahaLogo";
import { ledgerService } from "@/services/ledgerService";
import { studentService } from "@/services/studentService";
import { dashboardApiService, DashboardStats, RecentActivity } from "@/services/dashboardApiService";

export const Dashboard = () => {
  const { } = useLanguage();
  const { state } = useAppContext();
  const { goToBookings, goToLedger, goToStudentLedger } = useNavigation();
  const { bookingStats } = useBookings();

  // Dashboard API state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [checkedOutWithDues, setCheckedOutWithDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch dashboard data from API - NO CACHE
  const fetchDashboardData = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching dashboard data - NO CACHE');

      // Direct API calls with no-cache headers
      const API_BASE = 'http://localhost:3001/hostel/api/v1';

      const [statsResponse, activitiesResponse, performanceResponse, checkedOutResponse] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`${API_BASE}/dashboard/recent-activity?limit=8`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`${API_BASE}/analytics/performance-metrics`, {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`${API_BASE}/dashboard/checked-out-dues`, {
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      const stats = await statsResponse.json();
      const activities = await activitiesResponse.json();
      const performance = await performanceResponse.json();
      const checkedOut = await checkedOutResponse.json();

      console.log('📊 Fresh API data received:', { stats, activities, performance, checkedOut });

      setDashboardStats(stats);
      setRecentActivities(activities.data || activities || []);
      setPerformanceMetrics(performance.data || performance);
      setCheckedOutWithDues(checkedOut.data || checkedOut || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Use ONLY API data - no AppContext fallbacks
  const totalStudents = dashboardStats?.totalStudents || 0;
  const activeStudents = dashboardStats?.totalStudents || 0;
  const pendingBookings = dashboardStats?.pendingPayments || 0;
  const totalDues = 0; // Will be calculated from API
  const monthlyRevenue = dashboardStats?.monthlyRevenue?.amount || 0;
  const occupancyRate = dashboardStats?.occupancyPercentage?.toString() || "0";
  const availableRooms = dashboardStats?.availableRooms || 0;

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      change: `${activeStudents} active`,
      icon: Users,
      color: "text-blue-600",
      onClick: () => goToLedger('students')
    },
    {
      title: "Monthly Revenue",
      value: dashboardStats?.monthlyRevenue?.value ?? `NPR ${monthlyRevenue.toLocaleString()}`,
      change: "Current month",
      icon: DollarSign,
      color: "text-green-600",
      onClick: () => goToLedger('invoices')
    },
    {
      title: "Available Rooms",
      value: availableRooms.toString(),
      change: `${occupancyRate}% occupancy rate`,
      icon: Bed,
      color: "text-orange-600",
      onClick: goToBookings
    },
    {
      title: "Pending Payments",
      value: dashboardStats?.pendingPayments?.toString() ?? "0",
      change: "No pending payments",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  // Get students with highest dues from API - use checked out students with dues
  const studentsWithDues = checkedOutWithDues.filter(student => student.outstandingDues > 0);

  // Use API recent activities instead of bookings hook
  const displayActivities = recentActivities.slice(0, 6);

  // Performance metrics from API
  const collectionRate = performanceMetrics?.collectionRate || 0;
  const averageStayDuration = performanceMetrics?.averageStayDuration || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleBookPaymentForCheckedOutStudent = async (studentId, amount) => {
    try {
      // Book payment with "Paid post-checkout" remark
      const payment = await ledgerService.bookCheckoutPayment(studentId, amount, "Paid post-checkout");

      // Update student's total paid
      const student = await studentService.getStudentById(studentId);
      if (student) {
        const updatedStudent = await studentService.updateStudent(studentId, {
          totalPaid: student.totalPaid + amount,
          lastPaymentDate: new Date().toISOString().split('T')[0]
        });

        // Refresh the dashboard data
        // In a real implementation, this would update the context state
        console.log("Payment booked for checked out student:", payment);
        alert(`Payment of NPR ${amount} successfully booked for student ${updatedStudent.name}`);
      }
    } catch (error) {
      console.error("Error booking payment for checked out student:", error);
      alert("Error booking payment. Please try again.");
    }
  };

  // Show error state if API calls failed
  if (error && !dashboardStats) {
    return (
      <div className="space-y-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Dashboard Error</h3>
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={fetchDashboardData}
                  size="sm"
                  className="mt-2 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header with Kaha Branding */}
      <div className="bg-gradient-to-r from-green-500 via-blue-500 to-green-600 rounded-2xl p-8 text-white relative overflow-hidden kaha-shadow-brand">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <KahaLogo size="lg" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl font-bold">
                    Welcome back! Here's what's happening at your hostel.
                  </h1>
                  <Button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <p className="text-green-100 text-lg font-medium">
                  Last updated: {lastUpdated.toLocaleTimeString()} • Managing {totalStudents} students • Live API Data (No Cache)
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Analytics Ready</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-medium">All Services Active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-1">{occupancyRate}%</div>
                <div className="text-sm text-green-100">Occupancy Rate</div>
                <div className="w-16 h-2 bg-white/30 rounded-full mt-2 mx-auto">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const gradients = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600',
            'from-orange-500 to-orange-600',
            'from-purple-500 to-purple-600'
          ];

          return (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:scale-105 relative overflow-hidden"
              onClick={stat.onClick}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[index]} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-gray-600">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Students with Outstanding Dues */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Students with Overdue Payments ({studentsWithDues.length})</h3>
                  <p className="text-sm text-gray-600">NPR {studentsWithDues.reduce((total, student) => total + (student.outstandingDues || 0), 0).toLocaleString()} total outstanding</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white shadow-md"
                onClick={() => goToLedger('payments')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Record Payments
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentsWithDues.length > 0 ? (
                studentsWithDues.map((student, index) => (
                  <div key={student.id} className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {student.roomNumber}
                            </span>
                            <span>{student.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 text-xl">
                          NPR {(student.outstandingDues || 0).toLocaleString()}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => goToStudentLedger(student.id)}
                          className="mt-2 group-hover:bg-red-50 border-red-200 text-red-700 hover:text-red-800"
                        >
                          View Ledger
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-600">All students are up to date with payments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activities */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                  <p className="text-sm text-gray-600">Latest updates and notifications</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchDashboardData}
                disabled={loading}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayActivities.length > 0 ? (
                displayActivities.map((activity, index) => {
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'booking': return Calendar;
                      case 'payment': return DollarSign;
                      case 'checkin': return Users;
                      case 'checkout': return ArrowUpRight;
                      default: return Activity;
                    }
                  };

                  const getActivityColor = (type: string) => {
                    switch (type) {
                      case 'booking': return 'from-purple-500 to-purple-600';
                      case 'payment': return 'from-green-500 to-green-600';
                      case 'checkin': return 'from-blue-500 to-blue-600';
                      case 'checkout': return 'from-orange-500 to-orange-600';
                      default: return 'from-gray-500 to-gray-600';
                    }
                  };

                  const ActivityIcon = getActivityIcon(activity.type);

                  return (
                    <div key={activity.id} className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-white`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.message}</p>
                          <p className="text-sm text-gray-600">{activity.time}</p>
                        </div>
                        <Badge className={`${activity.type === 'payment' ? 'bg-green-100 text-green-700' : activity.type === 'booking' ? 'bg-purple-100 text-purple-700' : activity.type === 'checkout' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'} font-medium px-2 py-1 rounded-full text-xs`}>
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No Recent Activities</h3>
                  <p className="text-gray-600">Recent activities will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Target className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Streamline your daily operations</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              {
                icon: Users,
                label: "Manage Students",
                description: "View & edit profiles",
                color: "from-blue-500 to-blue-600",
                onClick: () => goToLedger('students')
              },
              {
                icon: DollarSign,
                label: "Monthly Billing",
                description: "Generate monthly bills",
                color: "from-green-500 to-green-600",
                onClick: () => window.location.href = '/admin/monthly-billing'
              },
              {
                icon: Zap,
                label: "Admin Charges",
                description: "Add flexible charges",
                color: "from-purple-500 to-purple-600",
                onClick: () => window.location.href = '/admin/charging'
              },
              {
                icon: Calendar,
                label: "Record Payments",
                description: "Track transactions",
                color: "from-orange-500 to-orange-600",
                onClick: () => goToLedger('payments')
              },
              {
                icon: Bed,
                label: "Review Bookings",
                description: "Approve requests",
                color: "from-pink-500 to-pink-600",
                onClick: goToBookings
              },
              {
                icon: TrendingUp,
                label: "Analytics",
                description: "View reports",
                color: "from-indigo-500 to-indigo-600",
                onClick: () => window.location.href = '/analytics'
              }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  onClick={action.onClick}
                  className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{action.label}</h4>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 px-3 py-1">Real Data</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Collection Rate</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Rate</span>
                <span className="font-medium">{collectionRate}%</span>
              </div>
              <Progress value={collectionRate} className="h-2" />
              <p className="text-xs text-gray-600">NPR {monthlyRevenue.toLocaleString()} collected</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1">Active</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Occupancy</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current</span>
                <span className="font-medium">{occupancyRate}%</span>
              </div>
              <Progress value={parseFloat(occupancyRate)} className="h-2" />
              <p className="text-xs text-gray-600">{activeStudents} of 100 beds occupied</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 px-3 py-1">Real Data</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Average Stay Duration</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Average</span>
                <span className="font-medium">{averageStayDuration} days</span>
              </div>
              <Progress value={Math.min((averageStayDuration / 365) * 100, 100)} className="h-2" />
              <p className="text-xs text-gray-600">Based on {totalStudents} students</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
