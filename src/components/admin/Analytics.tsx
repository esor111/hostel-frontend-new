
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, BarChart3, UserPlus } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export const Analytics = () => {
  const {
    monthlyData,
    guestTypeData,
    loading,
    error,
    refreshData
  } = useAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="text-red-500 mb-2">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Analytics</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentMonth = monthlyData[monthlyData.length - 1] || { bookings: 0, occupancy: 0 };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#231F20] flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            Monthly Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monthly performance insights and revenue trends</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Monthly Revenue</p>
                <p className="text-xs text-gray-500 mb-2">Total revenue earned per month on average</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs {(monthlyData.reduce((sum, month) => sum + (month.revenue || 0), 0) / Math.max(monthlyData.length, 1)).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onboarded Users This Month</p>
                <p className="text-xs text-gray-500 mb-2">New students who joined the hostel this month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentMonth.bookings || 0}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Occupancy Rate</p>
                <p className="text-xs text-gray-500 mb-2">Percentage of beds currently occupied</p>
                <p className="text-2xl font-bold text-gray-900">{currentMonth.occupancy || 0}%</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              Monthly Revenue Trend
            </CardTitle>
            <p className="text-sm text-gray-500">Track revenue performance across different months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#07A64F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Bookings Per Month Trend
            </CardTitle>
            <p className="text-sm text-gray-500">Monitor new student onboarding trends over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} bookings`, 'New Students']} />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#1295D0" 
                  strokeWidth={3}
                  dot={{ fill: '#1295D0', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              Student Status Distribution
            </CardTitle>
            <p className="text-sm text-gray-500">Breakdown of students by their current status in the hostel</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={guestTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {guestTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} students`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              Occupancy Rate Trend
            </CardTitle>
            <p className="text-sm text-gray-500">Track how occupancy rates change over different months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Occupancy Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#07A64F" 
                  strokeWidth={3}
                  dot={{ fill: '#07A64F', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
