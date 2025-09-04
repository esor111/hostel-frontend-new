import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/SafeAppContext';
import { notificationService } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Bell, 
  Gift, 
  Zap,
  Home,
  CheckCircle,
  Clock,
  Smartphone,
  UserCheck,
  UserX,
  Bed,
  AlertCircle
} from 'lucide-react';

export const SystemDashboard = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [notificationStats, setNotificationStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const notifications = await notificationService.getNotificationStats();
      setNotificationStats(notifications);

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'payment',
          message: 'Payment received from John Doe - NPR 8,500',
          time: '2 minutes ago',
          icon: DollarSign,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'discount',
          message: 'Discount applied to Sarah Wilson - NPR 1,000',
          time: '15 minutes ago',
          icon: Gift,
          color: 'text-purple-600'
        },
        {
          id: 3,
          type: 'charge',
          message: 'Late fee charged to Mike Johnson - NPR 500',
          time: '1 hour ago',
          icon: Zap,
          color: 'text-orange-600'
        },
        {
          id: 4,
          type: 'notification',
          message: 'Welcome notification sent to new student',
          time: '2 hours ago',
          icon: Smartphone,
          color: 'text-blue-600'
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Calculate key metrics with null checks
  const allStudents = state.students || [];
  const activeStudents = allStudents.filter(s => s.status === 'active' && !s.isCheckedOut);
  const checkedInStudents = activeStudents.length;
  const checkedOutStudents = allStudents.filter(s => s.isCheckedOut).length;
  const lifetimeStudents = allStudents.length; // Total students served throughout hostel lifespan
  
  // Outstanding calculations
  const studentsWithDues = allStudents.filter(s => (s.currentBalance || 0) > 0);
  const totalOutstanding = studentsWithDues.reduce((sum, s) => sum + (s.currentBalance || 0), 0);
  
  // Occupancy calculations (assuming 50 total beds for demo)
  const totalBeds = 50;
  const occupiedBeds = checkedInStudents;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#231F20]">🏠 Hostel Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of your hostel operations</p>
        </div>
        
        {/* Students Count Header */}
        <div className="flex items-center gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-green-200 bg-green-50"
            onClick={() => navigate('/attendance')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">In</p>
                  <p className="text-xl font-bold text-green-600">{checkedInStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-red-200 bg-red-50"
            onClick={() => navigate('/attendance')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">Out</p>
                  <p className="text-xl font-bold text-red-600">{checkedOutStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#1295D0]/10 to-[#1295D0]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1295D0] font-medium">Total Students</p>
                <p className="text-3xl font-bold text-[#1295D0]">{lifetimeStudents}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-[#1295D0]">Lifetime: {lifetimeStudents}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-[#1295D0]">Active: {checkedInStudents}</p>
                </div>
              </div>
              <Users className="h-12 w-12 text-[#1295D0]" />
            </div>
          </CardContent>
        </Card>

        {/* Outstanding - Red Color */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Outstanding</p>
                <p className="text-3xl font-bold text-red-600">NPR {totalOutstanding.toLocaleString()}</p>
                <p className="text-xs text-red-600 mt-1">From {studentsWithDues.length} students</p>
              </div>
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Rate for Beds */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#07A64F]/10 to-[#07A64F]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#07A64F] font-medium">Occupancy Rate</p>
                <p className="text-3xl font-bold text-[#07A64F]">{occupancyRate}%</p>
                <p className="text-xs text-[#07A64F] mt-1">{occupiedBeds}/{totalBeds} beds occupied</p>
              </div>
              <Bed className="h-12 w-12 text-[#07A64F]" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Today */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#1295D0]/10 to-[#07A64F]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#1295D0] font-medium">Notifications Today</p>
                <p className="text-3xl font-bold text-[#1295D0]">{notificationStats?.todaySent || 12}</p>
                <p className="text-xs text-[#1295D0] mt-1">{notificationStats?.deliveryRate || 95}% delivered</p>
              </div>
              <Bell className="h-12 w-12 text-[#1295D0]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full bg-white ${activity.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};