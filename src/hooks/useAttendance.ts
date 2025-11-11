import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { attendanceApiService } from '../services/attendanceApiService';
import { useAppContext } from '../contexts/SafeAppContext';
import type {
  CurrentStatusResponse,
  DailyReportResponse,
  ActivityReportResponse,
  SummaryReportResponse,
  StudentHistoryResponse,
  AttendanceFilters,
} from '../types/attendance';

/**
 * Custom React Query hooks for attendance data management
 * Provides caching, background updates, and error handling
 */

/**
 * Get current hostel ID from localStorage (like roomsApiService) with fallback to app context
 * This is a React hook, so it can use other hooks
 */
const useHostelId = (): string | null => {
  // Get context (must be called unconditionally due to hooks rules)
  const { state } = useAppContext();
  
  try {
    // Primary: Get from localStorage (same approach as roomsApiService)
    const selectedBusinessData = localStorage.getItem('kaha_selected_business');
    if (selectedBusinessData) {
      const selectedBusiness = JSON.parse(selectedBusinessData);
      if (selectedBusiness?.id) {
        console.log('🏨 Attendance: Using hostelId from localStorage:', selectedBusiness.id);
        return selectedBusiness.id;
      }
    }
    
    // Fallback: Get from app context
    const contextHostelId = state.hostelProfile?.id || null;
    if (contextHostelId) {
      console.log('🏨 Attendance: Using hostelId from context:', contextHostelId);
      return contextHostelId;
    }
    
    console.warn('⚠️ Attendance: No hostelId found in localStorage or context');
    return null;
  } catch (error) {
    console.error('❌ Attendance: Failed to get hostelId:', error);
    return null;
  }
};

/**
 * Hook for current status data with auto-refresh
 * Updates every 30 seconds to show real-time data
 */
export const useCurrentStatus = (
  page: number = 1,
  limit: number = 20,
  search?: string
): UseQueryResult<CurrentStatusResponse, Error> => {
  const hostelId = useHostelId();

  return useQuery({
    queryKey: ['attendance', 'current-status', hostelId, page, limit, search],
    queryFn: () => {
      if (!hostelId) {
        throw new Error('Hostel ID not available');
      }
      return attendanceApiService.getCurrentStatus(hostelId, page, limit, search);
    },
    enabled: !!hostelId,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 25000, // Consider data stale after 25 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook for daily attendance report
 */
export const useDailyReport = (
  date: string,
  page: number = 1,
  limit: number = 20,
  search?: string
): UseQueryResult<DailyReportResponse, Error> => {
  const hostelId = useHostelId();

  return useQuery({
    queryKey: ['attendance', 'daily-report', hostelId, date, page, limit, search],
    queryFn: () => {
      if (!hostelId) {
        throw new Error('Hostel ID not available');
      }
      if (!date) {
        throw new Error('Date is required for daily report');
      }
      return attendanceApiService.getDailyReport(hostelId, date, page, limit, search);
    },
    enabled: !!hostelId && !!date,
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  });
};

/**
 * Hook for activity report with filters
 */
export const useActivityReport = (
  filters: AttendanceFilters = {}
): UseQueryResult<ActivityReportResponse, Error> => {
  const hostelId = useHostelId();

  return useQuery({
    queryKey: ['attendance', 'activity-report', hostelId, filters],
    queryFn: () => {
      if (!hostelId) {
        throw new Error('Hostel ID not available');
      }
      return attendanceApiService.getActivityReport(hostelId, filters);
    },
    enabled: !!hostelId,
    staleTime: 1 * 60 * 1000, // Consider stale after 1 minute
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: 2,
  });
};

/**
 * Hook for summary report (analytics)
 */
export const useSummaryReport = (
  dateFrom: string,
  dateTo: string
): UseQueryResult<SummaryReportResponse, Error> => {
  const hostelId = useHostelId();

  return useQuery({
    queryKey: ['attendance', 'summary-report', hostelId, dateFrom, dateTo],
    queryFn: () => {
      if (!hostelId) {
        throw new Error('Hostel ID not available');
      }
      if (!dateFrom || !dateTo) {
        throw new Error('Date range is required for summary report');
      }
      return attendanceApiService.getSummaryReport(hostelId, dateFrom, dateTo);
    },
    enabled: !!hostelId && !!dateFrom && !!dateTo,
    staleTime: 5 * 60 * 1000, // Consider stale after 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
  });
};

/**
 * Hook for individual student history
 */
export const useStudentHistory = (
  studentId: string,
  filters: AttendanceFilters = {}
): UseQueryResult<StudentHistoryResponse, Error> => {
  const hostelId = useHostelId();

  return useQuery({
    queryKey: ['attendance', 'student-history', hostelId, studentId, filters],
    queryFn: () => {
      if (!hostelId) {
        throw new Error('Hostel ID not available');
      }
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      return attendanceApiService.getStudentHistory(studentId, hostelId, filters);
    },
    enabled: !!hostelId && !!studentId,
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
    gcTime: 20 * 60 * 1000, // Keep in cache for 20 minutes
    retry: 2,
  });
};

/**
 * Hook for today's daily report (convenience hook)
 */
export const useTodayReport = (): UseQueryResult<DailyReportResponse, Error> => {
  const todayDate = attendanceApiService.getTodayDate();
  return useDailyReport(todayDate);
};

/**
 * Hook for this week's activity report (convenience hook)
 */
export const useWeeklyActivity = (): UseQueryResult<ActivityReportResponse, Error> => {
  const dateRange = attendanceApiService.getDateRange('week');
  return useActivityReport({
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
  });
};

/**
 * Hook for this month's summary report (convenience hook)
 */
export const useMonthlySummary = (): UseQueryResult<SummaryReportResponse, Error> => {
  const dateRange = attendanceApiService.getDateRange('month');
  return useSummaryReport(dateRange.from, dateRange.to);
};

/**
 * Combined hook for dashboard data
 * Fetches multiple data sources needed for the main dashboard
 */
export const useDashboardData = () => {
  const currentStatus = useCurrentStatus();
  const todayReport = useTodayReport();
  const weeklyActivity = useWeeklyActivity();

  return {
    currentStatus: {
      data: currentStatus.data,
      loading: currentStatus.isLoading,
      error: currentStatus.error,
      refetch: currentStatus.refetch,
    },
    todayReport: {
      data: todayReport.data,
      loading: todayReport.isLoading,
      error: todayReport.error,
      refetch: todayReport.refetch,
    },
    weeklyActivity: {
      data: weeklyActivity.data,
      loading: weeklyActivity.isLoading,
      error: weeklyActivity.error,
      refetch: weeklyActivity.refetch,
    },
    // Combined loading state
    isLoading: currentStatus.isLoading || todayReport.isLoading || weeklyActivity.isLoading,
    // Combined error state
    hasError: !!currentStatus.error || !!todayReport.error || !!weeklyActivity.error,
    // Refetch all data
    refetchAll: () => {
      currentStatus.refetch();
      todayReport.refetch();
      weeklyActivity.refetch();
    },
  };
};

/**
 * Hook for attendance API health check
 */
export const useAttendanceHealth = () => {
  return useQuery({
    queryKey: ['attendance', 'health'],
    queryFn: () => attendanceApiService.healthCheck(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};