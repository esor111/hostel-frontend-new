import { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/contexts/SafeAppContext';
import { 
  UserX, 
  Search, 
  AlertCircle,
  DollarSign,
  Calendar,
  Phone,
  MapPin,
  Users,
  FileText
} from 'lucide-react';

const InactiveStudents = () => {
  const { state } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('inactive');

  // Filter inactive students
  const inactiveStudents = state.students?.filter(s => s.isCheckedOut) || [];
  
  // Separate inactive students with and without dues
  const inactiveWithDues = inactiveStudents.filter(s => s.currentBalance && s.currentBalance > 0);
  const inactiveWithoutDues = inactiveStudents.filter(s => !s.currentBalance || s.currentBalance <= 0);

  // Filter based on search term
  const filterStudents = (students: any[]) => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredInactiveWithDues = filterStudents(inactiveWithDues);
  const filteredInactiveWithoutDues = filterStudents(inactiveWithoutDues);

  const StudentCard = ({ student, showDues = false }: { student: any, showDues?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${showDues ? 'bg-red-100' : 'bg-gray-100'}`}>
              <UserX className={`h-6 w-6 ${showDues ? 'text-red-600' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
              <div className="space-y-1 mt-2">
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {student.phone}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Room: {student.roomNumber}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Checkout: {student.checkoutDate ? new Date(student.checkoutDate).toLocaleDateString() : 'N/A'}
                </p>
                {student.checkoutReason && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Reason: {student.checkoutReason}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {showDues && student.currentBalance > 0 ? (
              <div className="space-y-2">
                <Badge variant="destructive" className="bg-red-100 text-red-700">
                  Outstanding
                </Badge>
                <p className="text-lg font-bold text-red-600">
                  NPR {student.currentBalance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Total Paid: NPR {student.totalPaid?.toLocaleString() || '0'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="default" className="bg-green-100 text-green-700">
                  Cleared
                </Badge>
                <p className="text-sm text-gray-600">
                  Total Paid: NPR {student.totalPaid?.toLocaleString() || '0'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Course:</span>
              <span className="ml-2 font-medium">{student.course || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Institution:</span>
              <span className="ml-2 font-medium">{student.institution || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Join Date:</span>
              <span className="ml-2 font-medium">
                {student.joinDate ? new Date(student.joinDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Duration:</span>
              <span className="ml-2 font-medium">
                {student.joinDate && student.checkoutDate ? 
                  Math.ceil((new Date(student.checkoutDate).getTime() - new Date(student.joinDate).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline">
            View Details
          </Button>
          {showDues && student.currentBalance > 0 && (
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              Follow Up Payment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout activeTab="inactive">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#231F20]">👥 Inactive Students</h1>
            <p className="text-gray-600 mt-1">Manage students who have checked out from the hostel</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Inactive</p>
                  <p className="text-3xl font-bold text-gray-700">{inactiveStudents.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Students checked out</p>
                </div>
                <Users className="h-12 w-12 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">With Outstanding Dues</p>
                  <p className="text-3xl font-bold text-red-600">{inactiveWithDues.length}</p>
                  <p className="text-xs text-red-600 mt-1">
                    NPR {inactiveWithDues.reduce((sum, s) => sum + (s.currentBalance || 0), 0).toLocaleString()} total
                  </p>
                </div>
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Cleared Students</p>
                  <p className="text-3xl font-bold text-green-600">{inactiveWithoutDues.length}</p>
                  <p className="text-xs text-green-600 mt-1">No outstanding dues</p>
                </div>
                <DollarSign className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search inactive students by name, phone, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Inactive Students */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inactive" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Inactive ({inactiveWithoutDues.length})
            </TabsTrigger>
            <TabsTrigger value="inactive-with-dues" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Inactive with Dues ({inactiveWithDues.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inactive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Inactive Students - Cleared ({filteredInactiveWithoutDues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInactiveWithoutDues.map(student => (
                    <StudentCard key={student.id} student={student} showDues={false} />
                  ))}
                  
                  {filteredInactiveWithoutDues.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No inactive students found without dues</p>
                      {searchTerm && (
                        <p className="text-sm mt-2">Try adjusting your search criteria</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive-with-dues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Inactive Students - With Outstanding Dues ({filteredInactiveWithDues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInactiveWithDues.map(student => (
                    <StudentCard key={student.id} student={student} showDues={true} />
                  ))}
                  
                  {filteredInactiveWithDues.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No inactive students found with outstanding dues</p>
                      {searchTerm && (
                        <p className="text-sm mt-2">Try adjusting your search criteria</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default InactiveStudents;