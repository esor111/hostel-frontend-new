import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Search, 
  RefreshCw,
  Clock,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';

import { useCurrentStatus } from '@/hooks/useAttendance';

/**
 * Current Status Component
 * Shows real-time list of students currently checked in
 */
export const CurrentStatus: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error, refetch, dataUpdatedAt } = useCurrentStatus();

  // Filter students based on search term
  const filteredStudents = data?.students.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load current status</h3>
        <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
        <Button onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const lastUpdated = new Date(dataUpdatedAt).toLocaleTimeString();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Currently Checked In</p>
                <p className="text-3xl font-bold text-green-600">
                  {data?.currentlyCheckedIn || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">Students in hostel</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Last Updated</p>
                <p className="text-lg font-bold text-blue-600">{lastUpdated}</p>
                <p className="text-xs text-blue-600 mt-1">Auto-refresh: 30s</p>
              </div>
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Filtered Results</p>
                <p className="text-3xl font-bold text-purple-600">
                  {filteredStudents.length}
                </p>
                <p className="text-xs text-purple-600 mt-1">Matching search</p>
              </div>
              <Search className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Students Currently In Hostel
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Students List */}
          <div className="space-y-3">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{student.studentName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Checked in: {new Date(student.checkInTime).toLocaleTimeString()}
                        </span>
                        {student.roomNumber && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Room: {student.roomNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        {student.durationSoFar}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Duration</p>
                    </div>
                    
                    {student.contactInfo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        title="Contact student"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                {searchTerm ? (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                    <p className="text-gray-600">
                      No students match your search criteria "{searchTerm}"
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
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students checked in</h3>
                    <p className="text-gray-600">
                      All students are currently checked out of the hostel
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Update Indicator */}
      <div className="flex items-center justify-center text-sm text-gray-500 bg-green-50 p-3 rounded-lg border border-green-200">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 h-2 w-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span>Live data - Updates automatically every 30 seconds</span>
        </div>
      </div>
    </div>
  );
};