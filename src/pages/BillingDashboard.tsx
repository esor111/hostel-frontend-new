import React from 'react';
import { BillingDashboard as BillingDashboardComponent } from '../components/admin/BillingDashboard';
import { ToastNotifications } from '../components/common/NotificationCenter';

const BillingDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BillingDashboardComponent />
      <ToastNotifications />
    </div>
  );
};

export default BillingDashboard;