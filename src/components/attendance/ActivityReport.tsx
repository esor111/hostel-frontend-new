import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  UserCheck, 
  UserX, 
  Clock,
  Download,
  Search,
  Filter,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { useActivityReport } from '@/hooks/useAttendance';
import { attendanceApiService } from '@/services/attendanceApiService';
import type { AttendanceFilters } from '@/types/attendance';

/**
 * Activity Report Component
 * Shows detailed check-in/out activity timeline
 */
export const ActivityReport: React.FC = () => {
  const [filters, setFilters] = useState<AttendanceFilters>({
    dateFrom: attendanceApiService.getDateRange('week').from,
    dateTo: attendanceApiService.getDateRange('week').to,
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error, refetch } = useActivityReport(filters);

  // Filter activities based on search term
  const filteredActivities = data?.activities.filter(activity =>
    activity.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load activity report</h3>
        <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
        <Button onClick={() => refetch()} className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const handleDateRangeChange = (range: 'today' | 'week' | 'month') => {
    const dateRange = attendanceApiService.getDateRange(range);
    setFilters(prev => ({
      ...prev,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting activity report', filters);
  };

  const totalPages = data?.pagination?.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value, page: 1 }))}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value, page: 1 }))}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateRangeChange('today')}
            >
              Today
            </Button>
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
          </div>
        </div>
        
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Check-ins</p>
                <p className="text-3xl font-bold text-blue-600">
                  {data?.summary.totalCheckIns || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-500" />
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
              </div>
              <UserX className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Currently In</p>
                <p className="text-3xl font-bold text-purple-600">
                  {data?.summary.currentlyCheckedIn || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Activity Timeline ({filteredActivities.length} students)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div
                  key={activity.studentId}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{activity.studentName}</h4>
                    {activity.totalDuration && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Total: {activity.totalDuration}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {activity.sessions.map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-green-100 rounded-full">
                              <UserCheck className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(session.checkInTime).toLocaleString()}
                            </span>
                          </div>
                          
                          {session.checkOutTime && (
                            <>
                              <div className="w-8 h-px bg-gray-300"></div>
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-red-100 rounded-full">
                                  <UserX className="h-3 w-3 text-red-600" />
                                </div>
                                <span className="text-sm text-gray-600">
                                  {new Date(session.checkOutTime).toLocaleString()}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {session.duration}
                          </span>
                          {!session.checkOutTime && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                {searchTerm ? (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                    <p className="text-gray-600">
                      No activities match your search criteria "{searchTerm}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Clear search
                    </Button>
                  </>
                ) : (
                  <>
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
                    <p className="text-gray-600">
                      No check-in/out activity for the selected date range
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
                {data?.pagination && (
                  <span className="ml-2">
                    ({data.pagination.total} total records)
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Info */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Date range: {new Date(filters.dateFrom || '').toLocaleDateString()} - {new Date(filters.dateTo || '').toLocaleDateString()}
            </span>
            <span>Generated at: {new Date().toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};