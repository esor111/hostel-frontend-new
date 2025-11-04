import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MealPlanManagement } from '@/components/admin/MealPlanManagement';

const MealPlans = () => {
  return (
    <MainLayout activeTab="meal-plans">
      <MealPlanManagement />
    </MainLayout>
  );
};

export default MealPlans;
