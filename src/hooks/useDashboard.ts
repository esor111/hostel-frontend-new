import { useState, useEffect, useCallback } from 'react';
import { dashboardApiService, DashboardStats, RecentActivity, MonthlyRevenueData, PaginatedRecentActivities, PaginationInfo } from '../services/dashboardApiService';

interface UseDashboardState {
  stats: DashboardStats | null;
  recentActivities: RecentActivity[];
  activitiesPagination: PaginationInfo | null;
  monthlyRevenue: MonthlyRevenueData[] | null;
  loading: boolean;
  activitiesLoading: boolean;
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
    activitiesPagination: null,
    monthlyRevenue: null,
    loading: false,
    activitiesLoading: false,
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

  // Load recent activities with pagination
  const loadRecentActivitiesPaginated = useCallback(async (page: number = 1, limit: number = 6) => {
    console.log('📋 useDashboard.loadRecentActivitiesPaginated called with page:', page, 'limit:', limit);
    
    setState(prev => ({ ...prev, activitiesLoading: true, error: null }));
    
    try {
      const result = await dashboardApiService.getRecentActivitiesPaginated(page, limit);
      
      setState(prev => ({
        ...prev,
        recentActivities: result.data,
        activitiesPagination: result.pagination,
        activitiesLoading: false,
        lastRefresh: Date.now()
      }));
      
      console.log('✅ Recent activities loaded successfully with pagination');
    } catch (error) {
      console.error('❌ Error loading recent activities:', error);
      setState(prev => ({
        ...prev,
        activitiesLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load recent activities'
      }));
    }
  }, []);

  // Load recent activities only (legacy method)
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
  const loadMonthlyRevenue = useCallback(async (months: number = 12) => {
    console.log('💰 useDashboard.loadMonthlyRevenue called for months:', months);
    
    try {
      const monthlyRevenue = await dashboardApiService.getMonthlyRevenue(months);
      
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
    activitiesPagination: state.activitiesPagination,
    monthlyRevenue: state.monthlyRevenue,
    loading: state.loading,
    activitiesLoading: state.activitiesLoading,
    error: state.error,
    lastRefresh: state.lastRefresh,
    
    // Actions
    loadDashboardOverview,
    loadDashboardStats,
    loadRecentActivities,
    loadRecentActivitiesPaginated,
    loadMonthlyRevenue,
    refreshDashboard,
    clearError,
    
    // Computed values
    hasData: !!state.stats,
    isStale: state.lastRefresh ? (Date.now() - state.lastRefresh) > refreshInterval : false
  };
};