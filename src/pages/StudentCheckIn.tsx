import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  LogOut, 
  Clock, 
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TokenPayload {
  id: string;
  kahaId: string;
  businessId?: string;
}

export default function StudentCheckIn() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>('');
  const [tokenInfo, setTokenInfo] = useState<TokenPayload | null>(null);
  const [hostelId, setHostelId] = useState<string>('');

  // Decode JWT token
  const decodeToken = (token: string): TokenPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Get token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      setTokenInfo(decoded);
      
      // Get hostelId from context or localStorage
      const storedHostelId = localStorage.getItem('hostelId');
      if (storedHostelId) {
        setHostelId(storedHostelId);
      }
    }
  }, []);

  // Update duration every second when checked in
  useEffect(() => {
    if (isCheckedIn && checkInTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const checkIn = new Date(checkInTime);
        const diff = now.getTime() - checkIn.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          setDuration(`${hours}h ${minutes}m`);
        } else {
          setDuration(`${minutes}m`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isCheckedIn, checkInTime]);

  // Check-In Handler
  const handleCheckIn = async () => {
    if (!hostelId) {
      toast({
        title: 'Error',
        description: 'Hostel ID not found. Please login again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/hostel/api/v1/attendance/student/check-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostelId,
          notes: 'Check-in from student portal',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCheckedIn(true);
        setCheckInTime(data.checkIn.checkInTime);
        toast({
          title: 'Checked In Successfully!',
          description: `Welcome! Check-in time: ${new Date(data.checkIn.checkInTime).toLocaleTimeString()}`,
        });
      } else {
        toast({
          title: 'Check-In Failed',
          description: data.message || 'Unable to check in. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check-Out Handler
  const handleCheckOut = async () => {
    if (!hostelId) {
      toast({
        title: 'Error',
        description: 'Hostel ID not found. Please login again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/hostel/api/v1/attendance/student/check-out', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostelId,
          notes: 'Check-out from student portal',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCheckedIn(false);
        setCheckInTime(null);
        toast({
          title: 'Checked Out Successfully!',
          description: `Duration: ${data.checkOut.duration}`,
        });
      } else {
        toast({
          title: 'Check-Out Failed',
          description: data.message || 'Unable to check out. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout activeTab="student-checkin">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg text-white">
              <UserCheck className="h-6 w-6" />
            </div>
            Student Check-In/Out
          </h1>
          <p className="text-gray-600 mt-2">
            Quick check-in and check-out for students
          </p>
        </div>

        {/* User Info Card */}
        {tokenInfo && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-green-50">
            <CardHeader>
              <CardTitle className="text-lg">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User ID:</span>
                <Badge variant="outline">{tokenInfo.kahaId}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant={isCheckedIn ? 'default' : 'secondary'}>
                  {isCheckedIn ? 'Checked In' : 'Checked Out'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Check-In/Out Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Status Icon */}
              <div className="flex justify-center">
                {isCheckedIn ? (
                  <div className="p-6 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                ) : (
                  <div className="p-6 bg-gray-100 rounded-full">
                    <XCircle className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Status Text */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isCheckedIn ? 'You are Checked In' : 'You are Checked Out'}
                </h2>
                {isCheckedIn && checkInTime && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Since: {new Date(checkInTime).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Duration: {duration}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                {isCheckedIn ? (
                  <Button
                    size="lg"
                    onClick={handleCheckOut}
                    disabled={isLoading}
                    className="w-full max-w-md bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Checking Out...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-5 w-5" />
                        Check Out
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleCheckIn}
                    disabled={isLoading}
                    className="w-full max-w-md bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Checking In...
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-5 w-5" />
                        Check In
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Info Text */}
              <p className="text-sm text-gray-500">
                {isCheckedIn
                  ? 'Click "Check Out" when you leave the hostel'
                  : 'Click "Check In" when you arrive at the hostel'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg">How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Check In</h4>
                <p className="text-sm text-gray-600">
                  Click "Check In" when you arrive at the hostel. Your attendance will be automatically recorded.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <LogOut className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Check Out</h4>
                <p className="text-sm text-gray-600">
                  Click "Check Out" when you leave. The system will calculate your stay duration.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Auto-Tracking</h4>
                <p className="text-sm text-gray-600">
                  Your student ID is automatically detected from your login. No manual entry needed!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
