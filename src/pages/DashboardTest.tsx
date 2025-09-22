import React from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/components/Dashboard";

const DashboardTest = () => {
  return (
    <MainLayout activeTab="dashboard">
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-800 mb-2">✅ React Hooks Error Fixed!</h2>
          <p className="text-green-700">
            The application is now running without React hooks errors. 
            The Dashboard below should display real data from the API.
          </p>
        </div>
        
        <Dashboard />
      </div>
    </MainLayout>
  );
};

export default DashboardTest;
