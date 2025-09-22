import { useState, useEffect, useCallback } from 'react';
import { dashboardApiService, DashboardStats, RecentActivity, MonthlyRevenueData } from '../services/dashboardApiService';

interface UseDashboardState {
  stats: DashboardStats | null;
  recentActivities: RecentActivity[];
  monthlyRevenue: MonthlyRevenueData | null;
  loading: boolean;
  error: string | null;
  lastRefresh: number | null;
}

interface UseDashboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  loadOnMount?: boolean;
}

export const useDashboard = (options: UseDashboardOptions = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    loadOnMount = true
  } = options;

  const [state, setState] = useState<UseDashboardState>({
    stats: null,
    recentActivities: [],
    monthlyRevenue: null,
    loading: false,
    error: null,
    lastRefresh: null
  });

  // Load dashboard overview (stats + recent activities)
  const loadDashboardOverview = useCallback(async () => {
    console.log('🏠 useDashboard.loadDashboardOverview called');
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const overview = await dashboardApiService.getDashboardOverview();
      
      setState(prev => ({
        ...prev,
        stats: overview.stats,
        recentActivities: overview.recentActivities,
        loading: false,
        lastRefresh: Date.now()
      }));
      
      console.log('✅ Dashboard overview loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard overview:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      }));
    }
  }, []);

  // Load dashboard stats only
  const loadDashboardStats = useCallback(async () => {
    console.log('📊 useDashboard.loadDashboardStats called');
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const stats = await dashboardApiService.getDashboardStats();
      
      setState(prev => ({
        ...prev,
        stats,
        loading: false,
        lastRefresh: Date.now()
      }));
      
      console.log('✅ Dashboard stats loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard stats:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard stats'
      }));
    }
  }, []);

  // Load recent activities only
  const loadRecentActivities = useCallback(async (limit?: number) => {
    console.log('📋 useDashboard.loadRecentActivities called with limit:', limit);
    
    try {
      const activities = await dashboardApiService.getRecentActivities(limit);
      
      setState(prev => ({
        ...prev,
        recentActivities: activities,
        lastRefresh: Date.now()
      }));
      
      console.log('✅ Recent activities loaded successfully');
    } catch (error) {
      console.error('❌ Error loading recent activities:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load recent activities'
      }));
    }
  }, []);

  // Load monthly revenue data
  const loadMonthlyRevenue = useCallback(async (year: number, month: number) => {
    console.log('💰 useDashboard.loadMonthlyRevenue called for:', { year, month });
    
    try {
      const monthlyRevenue = await dashboardApiService.getMonthlyRevenue(year, month);
      
      setState(prev => ({
        ...prev,
        monthlyRevenue,
        lastRefresh: Date.now()
      }));
      
      console.log('✅ Monthly revenue loaded successfully');
    } catch (error) {
      console.error('❌ Error loading monthly revenue:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load monthly revenue'
      }));
    }
  }, []);

  // Refresh all dashboard data
  const refreshDashboard = useCallback(async () => {
    console.log('🔄 useDashboard.refreshDashboard called');
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const refreshedData = await dashboardApiService.refreshDashboard();
      
      setState(prev => ({
        ...prev,
        stats: refreshedData.stats,
        recentActivities: refreshedData.recentActivities,
        loading: false,
        lastRefresh: refreshedData.timestamp
      }));
      
      console.log('✅ Dashboard refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing dashboard:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh dashboard'
      }));
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load data on mount
  useEffect(() => {
    if (loadOnMount) {
      loadDashboardOverview();
    }
  }, [loadOnMount, loadDashboardOverview]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      refreshDashboard();
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, refreshDashboard]);

  return {
    // State
    stats: state.stats,
    recentActivities: state.recentActivities,
    monthlyRevenue: state.monthlyRevenue,
    loading: state.loading,
    error: state.error,
    lastRefresh: state.lastRefresh,
    
    // Actions
    loadDashboardOverview,
    loadDashboardStats,
    loadRecentActivities,
    loadMonthlyRevenue,
    refreshDashboard,
    clearError,
    
    // Computed values
    hasData: !!state.stats,
    isStale: state.lastRefresh ? (Date.now() - state.lastRefresh) > refreshInterval : false
  };
};