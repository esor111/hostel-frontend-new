import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Activity, 
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react';

// Import our attendance components
import { AdminDashboard } from './AdminDashboard';
import { CurrentStatus } from './CurrentStatus';
import { DailyReport } from './DailyReport';
import { ActivityReport } from './ActivityReport';
import { SummaryReport } from './SummaryReport';

import type { AttendanceTab } from '@/types/attendance';

/**
 * Main Attendance Page Component
 * Provides tabbed interface for all attendance management features
 */
export const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AttendanceTab>('dashboard');

  const tabs = [
    {
      id: 'dashboard' as AttendanceTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview and quick stats'
    },
    {
      id: 'current-status' as AttendanceTab,
      label: 'Current Status',
      icon: Users,
      description: 'Who\'s checked in now'
    },
    {
      id: 'daily-report' as AttendanceTab,
      label: 'Daily Report',
      icon: Calendar,
      description: 'Daily attendance reports'
    },
    {
      id: 'activity-report' as AttendanceTab,
      label: 'Activity Log',
      icon: Activity,
      description: 'Check-in/out timeline'
    },
    {
      id: 'summary-report' as AttendanceTab,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Trends and insights'
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'current-status':
        return <CurrentStatus />;
      case 'daily-report':
        return <DailyReport />;
      case 'activity-report':
        return <ActivityReport />;
      case 'summary-report':
        return <SummaryReport />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <MainLayout activeTab="attendance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#231F20] flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg text-white">
                <Users className="h-6 w-6" />
              </div>
              Attendance Management
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor student attendance, generate reports, and analyze patterns
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AttendanceTab)}>
              <TabsList className="grid w-full grid-cols-5 bg-gray-50">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Tab Description */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700 flex items-center gap-2">
                {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon || LayoutDashboard, { 
                  className: "h-4 w-4 text-blue-600" 
                })}
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {renderTabContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};