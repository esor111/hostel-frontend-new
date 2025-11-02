import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  UserCheck, 
  UserX, 
  Users,
  Download,
  Search,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

import { useDailyReport } from '@/hooks/useAttendance';
import { attendanceApiService } from '@/services/attendanceApiService';

/**
 * Daily Report Component
 * Shows attendance report for a specific date
 */
export const DailyReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(attendanceApiService.getTodayDate());
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error, refetch } = useDailyReport(selectedDate);

  // Filter students based on search term
  const filteredPresentStudents = data?.presentStudents.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredAbsentStudents = data?.absentStudents?.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load daily report</h3>
        <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
        <Button onClick={() => refetch()} className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting daily report for', selectedDate);
  };

  const attendanceRate = parseFloat(data?.summary.attendanceRate.replace('%', '') || '0');
  const isGoodAttendance = attendanceRate >= 80;

  return (
    <div className="space-y-6">
      {/* Date Selection and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(attendanceApiService.getTodayDate())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday.toISOString().split('T')[0]);
              }}
            >
              Yesterday
            </Button>
          </div>
        </div>
        
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">
                  {data?.summary.totalStudents || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Present</p>
                <p className="text-3xl font-bold text-green-600">
                  {data?.summary.totalPresent || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Absent</p>
                <p className="text-3xl font-bold text-red-600">
                  {data?.summary.totalAbsent || 0}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg bg-gradient-to-br ${
          isGoodAttendance 
            ? 'from-emerald-50 to-emerald-100' 
            : 'from-orange-50 to-orange-100'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isGoodAttendance ? 'text-emerald-600' : 'text-orange-600'
                }`}>
                  Attendance Rate
                </p>
                <p className={`text-3xl font-bold ${
                  isGoodAttendance ? 'text-emerald-600' : 'text-orange-600'
                }`}>
                  {data?.summary.attendanceRate || '0%'}
                </p>
              </div>
              {isGoodAttendance ? (
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-orange-500" />
              )}
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
              placeholder="Search students by name, ID, or room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Present Students */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-5 w-5" />
              Present Students ({filteredPresentStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPresentStudents.length > 0 ? (
                filteredPresentStudents.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>First check-in: {student.firstCheckInTime}</span>
                        {student.roomNumber && (
                          <span>Room: {student.roomNumber}</span>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Present
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    {searchTerm 
                      ? `No present students match "${searchTerm}"` 
                      : 'No students were present on this date'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Absent Students */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <UserX className="h-5 w-5" />
              Absent Students ({filteredAbsentStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAbsentStudents.length > 0 ? (
                filteredAbsentStudents.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {student.lastSeenDate && (
                          <span>Last seen: {student.lastSeenDate}</span>
                        )}
                        {student.roomNumber && (
                          <span>Room: {student.roomNumber}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                      Absent
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>
                    {searchTerm 
                      ? `No absent students match "${searchTerm}"` 
                      : 'No students were absent on this date'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Info */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Report for: {new Date(selectedDate).toLocaleDateString()}</span>
            <span>Generated at: {new Date().toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};