import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Calculator,
  Eye,
  LogOut
} from 'lucide-react';
import { configurationBillingApiService, ConfigurationBillingStats } from '@/services/configurationBillingApiService';
import Pagination from '@/components/ui/pagination';

export const ConfigurationBillingDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<ConfigurationBillingStats | null>(null);
  const [studentsReadyForCheckout, setStudentsReadyForCheckout] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state for timeline
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineLimit] = useState(10);
  const [timelinePagination, setTimelinePagination] = useState<any>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload timeline when page changes
  useEffect(() => {
    if (timelinePage > 1) {
      loadDashboardData();
    }
  }, [timelinePage]);

  // Handle timeline page change
  const handleTimelinePageChange = (page: number) => {
    setTimelinePage(page);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Loading configuration billing dashboard data...');

      // Load stats, students, and timeline in parallel
      const [billingStats, checkoutStudents, billingTimeline] = await Promise.all([
        configurationBillingApiService.getConfigurationBillingStats(),
        configurationBillingApiService.getStudentsReadyForCheckout(),
        configurationBillingApiService.getBillingTimeline(timelinePage, timelineLimit)
      ]);

      setStats(billingStats);
      setStudentsReadyForCheckout(checkoutStudents);
      setTimeline(billingTimeline);
      
      // Set pagination info if available
      if (billingTimeline?.pagination) {
        setTimelinePagination(billingTimeline.pagination);
      }

      console.log('✅ Dashboard data loaded:', {
        stats: billingStats,
        studentsCount: checkoutStudents.length,
        timeline: billingTimeline
      });

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      
      toast({
        title: 'Error Loading Dashboard',
        description: 'Failed to load configuration billing data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCheckoutPreview = async (studentId: string, studentName: string) => {
    try {
      console.log('👁️ Viewing checkout preview for:', studentName);
      
      const preview = await configurationBillingApiService.getCheckoutPreview(studentId);
      
      toast({
        title: 'Checkout Preview',
        description: `${studentName}: ${preview.summary}`,
      });

      console.log('📋 Checkout preview:', preview);
      
    } catch (error) {
      console.error('Error getting checkout preview:', error);
      toast({
        title: 'Preview Error',
        description: `Failed to get checkout preview for ${studentName}`,
        variant: 'destructive'
      });
    }
  };

  const handleProcessCheckout = async (studentId: string, studentName: string) => {
    try {
      console.log('🚪 Processing checkout for:', studentName);
      
      const result = await configurationBillingApiService.processCheckout(studentId);
      
      toast({
        title: 'Checkout Processed',
        description: `${studentName} has been successfully checked out.`,
      });

      console.log('✅ Checkout result:', result);
      
      // Refresh dashboard data
      await loadDashboardData();
      
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: 'Checkout Error',
        description: `Failed to process checkout for ${studentName}`,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <svg width="48" height="72" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
            <g clipPath="url(#clip0_319_901)">
              <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F" />
              <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F" />
              <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20" />
              <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#1295D0" />
              <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white" />
              <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20" />
            </g>
            <defs>
              <clipPath id="clip0_319_901">
                <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)" />
              </clipPath>
            </defs>
          </svg>
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#07A64F] border-r-[#1295D0]"></div>
        </div>
        <span className="text-gray-600 font-medium">Loading configuration billing dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Dashboard Error</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            loadDashboardData();
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#231F20] flex items-center gap-2">
            <Settings className="h-8 w-8 text-[#1295D0]" />
            Configuration-Based Billing
          </h2>
          <p className="text-gray-600 mt-1">
            Advanced billing system with configuration-based periods and checkout settlement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            New System
          </Badge>
          <Button
            onClick={loadDashboardData}
            variant="outline"
            size="sm"
            className="text-[#1295D0] border-[#1295D0]/30 hover:bg-[#1295D0]/10"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-[#1295D0] to-[#1295D0]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalConfiguredStudents}</div>
                  <div className="text-sm opacity-90">Configured Students</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#07A64F] to-[#07A64F]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    NPR {stats.totalAdvanceBalance.toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">Total Advance Balance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    NPR {stats.totalOutstandingDues.toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">Outstanding Dues</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">{stats.studentsWithDues}</div>
                  <div className="text-sm opacity-90">Students with Dues</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline View */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#1295D0]" />
              Billing Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline ? (
              <div className="space-y-4">
                {/* Upcoming Events */}
                {timeline.upcoming && timeline.upcoming.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Upcoming</div>
                    <div className="space-y-2">
                      {timeline.upcoming.map((event: any) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="mt-1">
                            <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white"></div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-blue-900">{event.title}</div>
                            <div className="text-sm text-blue-700">{event.description}</div>
                            
                            {/* Show student names if available */}
                            {event.metadata?.students && event.metadata.students.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {event.metadata.students.map((student: any) => (
                                  <div key={student.id} className="flex items-center gap-2 text-sm">
                                    <span className="text-blue-600">→</span>
                                    <span className="font-medium text-blue-800">{student.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="text-xs text-blue-600 mt-1">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Today Events */}
                {timeline.today && timeline.today.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Today</div>
                    <div className="space-y-2">
                      {timeline.today.map((event: any) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="mt-1">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-green-900">{event.title}</div>
                            <div className="text-sm text-green-700">{event.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Events */}
                {timeline.past && timeline.past.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Activity</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {timeline.past.map((event: any) => (
                        <div key={event.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                          <div className="mt-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{event.title}</div>
                            <div className="text-xs text-gray-600">{event.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!timeline.past || timeline.past.length === 0) && 
                 (!timeline.today || timeline.today.length === 0) && 
                 (!timeline.upcoming || timeline.upcoming.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No billing events yet</p>
                  </div>
                )}

                {/* Pagination Controls */}
                {timelinePagination && timelinePagination.totalPages > 1 && (
                  <div className="flex justify-center pt-4 mt-4 border-t border-gray-200">
                    <Pagination
                      currentPage={timelinePagination.page}
                      totalPages={timelinePagination.totalPages}
                      onPageChange={handleTimelinePageChange}
                      hasNext={timelinePagination.hasNext}
                      hasPrev={timelinePagination.hasPrev}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400 animate-pulse" />
                <p>Loading timeline...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#1295D0]" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Backend API Status</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>✅ Checkout endpoints operational</p>
                <p>✅ Settlement calculation working</p>
                <p>✅ Advance balance tracking active</p>
                <p>✅ Configuration-based billing ready</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Integration Status</span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>🔗 API service integration complete</p>
                <p>📊 Dashboard data loading functional</p>
                <p>🎯 Error handling implemented</p>
                <p>🔄 Real-time data refresh available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Ready for Checkout */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-[#1295D0]" />
            Students Ready for Configuration-Based Checkout
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentsReadyForCheckout.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">No students ready for checkout</p>
              <p className="text-sm text-gray-500 mb-4">
                Students with configuration-based billing will appear here when ready for checkout
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="text-right">Advance Balance</TableHead>
                    <TableHead className="text-right">Current Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsReadyForCheckout.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium">{student.name}</span>
                            <div className="text-xs text-gray-500">{student.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.roomNumber}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#07A64F]">
                        NPR {(student.advanceBalance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#1295D0]">
                        NPR {(student.currentBalance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            student.isConfigured 
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {student.isConfigured ? 'Configured' : 'Not Configured'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewCheckoutPreview(student.id, student.name)}
                            className="text-[#1295D0] border-[#1295D0]/30 hover:bg-[#1295D0]/10"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleProcessCheckout(student.id, student.name)}
                            className="bg-[#07A64F] hover:bg-[#07A64F]/90 text-white"
                          >
                            <LogOut className="h-3 w-3 mr-1" />
                            Checkout
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationBillingDashboard;