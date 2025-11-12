import React, { useState } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  GraduationCap 
} from 'lucide-react';
import { ManualStudentCreation } from '@/components/admin/student-creation/ManualStudentCreation';

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState('manual-creation');

  // Placeholder components for other tabs
  const PendingConfiguration = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Pending Configuration View
          </h3>
          <p className="text-gray-500">
            This will show students awaiting configuration.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const ActiveStudents = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Active Students
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Active Students View
          </h3>
          <p className="text-gray-500">
            This will show all active students with management options.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout activeTab="students">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-1">
              Manage student creation, configuration, and administration
            </p>
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1295D0]">0</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#07A64F]">0</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
          </div>
        </div>

        {/* Main content tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="manual-creation" 
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Manual Creation
            </TabsTrigger>
            <TabsTrigger 
              value="pending-config" 
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Pending Configuration
              <Badge variant="secondary" className="ml-1">0</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="active-students" 
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Active Students
              <Badge variant="secondary" className="ml-1">0</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual-creation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-[#1295D0]" />
                  Manual Student Creation
                </CardTitle>
                <p className="text-gray-600">
                  Create students manually by selecting floor, room, and bed, then filling in their details.
                </p>
              </CardHeader>
              <CardContent>
                <ManualStudentCreation />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-config" className="mt-6">
            <PendingConfiguration />
          </TabsContent>

          <TabsContent value="active-students" className="mt-6">
            <ActiveStudents />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default StudentManagement;
