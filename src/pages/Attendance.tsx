import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/contexts/SafeAppContext';
import { 
  UserCheck, 
  UserX, 
  Search, 
  Calendar,
  Clock,
  Users
} from 'lucide-react';

const Attendance = () => {
  const { state } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, in, out

  const allStudents = state.students || [];
  const checkedInStudents = allStudents.filter(s => s.status === 'active' && !s.isCheckedOut);
  const checkedOutStudents = allStudents.filter(s => s.isCheckedOut);

  // Filter students based on search and status
  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.phone.includes(searchTerm) ||
                         student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'in') return matchesSearch && !student.isCheckedOut;
    if (filterStatus === 'out') return matchesSearch && student.isCheckedOut;
    return matchesSearch;
  });

  return (
    <MainLayout activeTab="attendance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#231F20]">📋 Student Attendance</h1>
            <p className="text-gray-600 mt-1">Track student check-in and check-out status</p>
          </div>
          <div className="text-sm text-gray-500">
            <Clock className="inline h-4 w-4 mr-1" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Checked In</p>
                  <p className="text-3xl font-bold text-green-600">{checkedInStudents.length}</p>
                  <p className="text-xs text-green-600 mt-1">Currently in hostel</p>
                </div>
                <UserCheck className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Checked Out</p>
                  <p className="text-3xl font-bold text-red-600">{checkedOutStudents.length}</p>
                  <p className="text-xs text-red-600 mt-1">Not in hostel</p>
                </div>
                <UserX className="h-12 w-12 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-blue-600">{allStudents.length}</p>
                  <p className="text-xs text-blue-600 mt-1">All registered</p>
                </div>
                <Users className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, phone, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  All ({allStudents.length})
                </Button>
                <Button
                  variant={filterStatus === 'in' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('in')}
                  size="sm"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  In ({checkedInStudents.length})
                </Button>
                <Button
                  variant={filterStatus === 'out' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('out')}
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Out ({checkedOutStudents.length})
                </Button>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${student.isCheckedOut ? 'bg-red-100' : 'bg-green-100'}`}>
                      {student.isCheckedOut ? 
                        <UserX className="h-4 w-4 text-red-600" /> : 
                        <UserCheck className="h-4 w-4 text-green-600" />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">Room: {student.roomNumber} • {student.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={student.isCheckedOut ? "destructive" : "default"}
                      className={student.isCheckedOut ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}
                    >
                      {student.isCheckedOut ? 'Checked Out' : 'Checked In'}
                    </Badge>
                    {student.isCheckedOut && student.checkoutDate && (
                      <span className="text-xs text-gray-400">
                        Since: {new Date(student.checkoutDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No students found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Attendance;