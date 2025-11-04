import { useState, useEffect, useCallback } from 'react';
import { analyticsApiService } from '../services/analyticsApiService';
import { 
  MonthlyRevenueData, 
  GuestTypeData, 
  PerformanceMetrics, 
  CollectionStats, 
  AnalyticsTrends, 
  DashboardAnalytics 
} from '../types/api';

export const useAnalytics = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenueData[]>([]);
  const [guestTypeData, setGuestTypeData] = useState<GuestTypeData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({});
  const [collectionStats, setCollectionStats] = useState<CollectionStats>({
    collectionRate: 0,
    totalCollected: 0,
    totalOutstanding: 0,
  });
  const [trends, setTrends] = useState<AnalyticsTrends>({
    revenueGrowth: 0,
    bookingGrowth: 0,
    occupancyGrowth: 0,
  });
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [currentOccupancy, setCurrentOccupancy] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useAnalytics: Loading analytics data...');

      // Load all analytics data in parallel
      const [
        dashboardResult,
        monthlyResult,
        guestTypesResult,
        performanceResult,
        collectionResult,
        dashboardStatsResult
      ] = await Promise.all([
        analyticsApiService.getDashboardData().catch(err => {
          console.warn('Dashboard data failed:', err);
          return null;
        }),
        analyticsApiService.getMonthlyRevenue().catch(err => {
          console.warn('Monthly revenue failed:', err);
          return [];
        }),
        analyticsApiService.getGuestTypeData().catch(err => {
          console.warn('Guest type data failed:', err);
          return [];
        }),
        analyticsApiService.getPerformanceMetrics().catch(err => {
          console.warn('Performance metrics failed:', err);
          return {};
        }),
        analyticsApiService.getCollectionStats().catch(err => {
          console.warn('Collection stats failed:', err);
          return { collectionRate: 0, totalCollected: 0, totalOutstanding: 0 };
        }),
        analyticsApiService.getDashboardStats().catch(err => {
          console.warn('Dashboard stats failed:', err);
          return null;
        })
      ]);

      console.log('🔍 useAnalytics: Data loaded successfully');

      // Update state with results
      if (dashboardResult) {
        setDashboardData(dashboardResult);
        // If dashboard data includes monthly data, use it
        if (dashboardResult.monthlyData) {
          setMonthlyData(dashboardResult.monthlyData);
        }
        if (dashboardResult.guestTypeData) {
          setGuestTypeData(dashboardResult.guestTypeData);
        }
        if (dashboardResult.performanceMetrics) {
          setPerformanceMetrics(dashboardResult.performanceMetrics);
        }
      }

      // Use individual results if dashboard didn't provide them
      if (monthlyResult.length > 0) {
        setMonthlyData(monthlyResult);
      }
      if (guestTypesResult.length > 0) {
        setGuestTypeData(guestTypesResult);
      }
      if (Object.keys(performanceResult).length > 0) {
        setPerformanceMetrics(performanceResult);
      }
      
      setCollectionStats(collectionResult);
      // No trends - set to zero
      setTrends({ revenueGrowth: 0, bookingGrowth: 0, occupancyGrowth: 0 });

      // Set real-time occupancy from dashboard stats
      if (dashboardStatsResult && dashboardStatsResult.occupancyPercentage !== undefined) {
        setCurrentOccupancy(dashboardStatsResult.occupancyPercentage);
        console.log('🔍 Real-time occupancy set:', dashboardStatsResult.occupancyPercentage);
      }

    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Load data on mount
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  return {
    // Data
    monthlyData,
    guestTypeData,
    performanceMetrics,
    collectionStats,
    trends,
    dashboardData,
    currentOccupancy,
    
    // State
    loading,
    error,
    
    // Actions
    refreshData,
    loadAnalyticsData,
  };
};