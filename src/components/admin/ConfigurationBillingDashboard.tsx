import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Calculator
} from 'lucide-react';
import { configurationBillingApiService, ConfigurationBillingStats } from '@/services/configurationBillingApiService';
import Pagination from '@/components/ui/pagination';

export const ConfigurationBillingDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<ConfigurationBillingStats | null>(null);
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

  // Reload timeline when page changes (skip initial load)
  useEffect(() => {
    // Skip the initial load (handled by first useEffect)
    if (timeline !== null) {
      loadDashboardData();
    }
  }, [timelinePage]);

  // Handle timeline page change
  const handleTimelinePageChange = (page: number) => {
    console.log(`📄 Timeline page changing from ${timelinePage} to ${page}`);
    setTimelinePage(page);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📊 Loading configuration billing dashboard data... (page: ${timelinePage}, limit: ${timelineLimit})`);

      // Load stats and timeline in parallel
      const [billingStats, billingTimeline] = await Promise.all([
        configurationBillingApiService.getConfigurationBillingStats(),
        configurationBillingApiService.getBillingTimeline(timelinePage, timelineLimit)
      ]);

      setStats(billingStats);
      setTimeline(billingTimeline);
      
      // Set pagination info if available
      if (billingTimeline?.pagination) {
        setTimelinePagination(billingTimeline.pagination);
      }

      console.log('✅ Dashboard data loaded:', {
        stats: billingStats,
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

      {/* Billing Timeline - Full Width */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#1295D0]/5 to-[#07A64F]/5 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6 text-[#1295D0]" />
            Upcoming Billing Events
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Track upcoming billing periods and invoice generation schedules</p>
        </CardHeader>
        <CardContent className="p-6">
          {timeline ? (
            <div className="space-y-6">
              {/* Upcoming Events - Grid Layout */}
              {timeline.upcoming && timeline.upcoming.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeline.upcoming.map((event: any) => (
                    <div 
                      key={event.id} 
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg"
                    >
                      {/* Event Card */}
                      <div className="p-5">
                        {/* Date Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-blue-500 text-white px-3 py-1">
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </Badge>
                          <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white shadow-sm"></div>
                        </div>

                        {/* Event Title */}
                        <h3 className="font-bold text-blue-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                          {event.title}
                        </h3>

                        {/* Event Description */}
                        <p className="text-sm text-blue-700 mb-3">
                          {event.description}
                        </p>

                        {/* Student List */}
                        {event.metadata?.students && event.metadata.students.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span className="text-xs font-semibold text-blue-800 uppercase">
                                Students ({event.metadata.students.length})
                              </span>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                              {event.metadata.students.map((student: any, idx: number) => (
                                <div 
                                  key={student.id} 
                                  className="flex items-center gap-2 text-sm bg-white/60 rounded-lg p-2 hover:bg-white transition-colors"
                                >
                                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </div>
                                  <span className="font-medium text-blue-900 truncate">
                                    {student.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
                  <p className="text-gray-600">There are no scheduled billing events at the moment</p>
                </div>
              )}

              {/* Today's Events */}
              {timeline.today && timeline.today.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                    Today's Events
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {timeline.today.map((event: any) => (
                      <div key={event.id} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all">
                        <div className="mt-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-green-900 mb-1">{event.title}</div>
                          <div className="text-sm text-green-700">{event.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {timelinePagination && timelinePagination.totalPages > 1 && (
                <div className="flex justify-center pt-6 mt-6 border-t border-gray-200">
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
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-gray-600 font-medium">Loading timeline data...</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ConfigurationBillingDashboard;