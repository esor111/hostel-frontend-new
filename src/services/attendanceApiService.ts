import { apiService } from './apiService';
import type {
  CurrentStatusResponse,
  DailyReportResponse,
  ActivityReportResponse,
  SummaryReportResponse,
  StudentHistoryResponse,
  AttendanceFilters,
} from '../types/attendance';

/**
 * Attendance API Service
 * Handles all API communications for the attendance system
 * Follows existing apiService patterns for consistency
 */
export class AttendanceApiService {
  private static instance: AttendanceApiService;

  static getInstance(): AttendanceApiService {
    if (!AttendanceApiService.instance) {
      AttendanceApiService.instance = new AttendanceApiService();
    }
    return AttendanceApiService.instance;
  }

  /**
   * Get current status - who's checked in right now
   * GET /attendance/current-status?hostelId={hostelId}
   */
  async getCurrentStatus(hostelId: string): Promise<CurrentStatusResponse> {
    try {
      const response = await apiService.get<CurrentStatusResponse>(
        '/attendance/current-status',
        { hostelId }
      );
      return response;
    } catch (error) {
      console.error('Error fetching current status:', error);
      throw error;
    }
  }

  /**
   * Get daily attendance report
   * GET /attendance/reports/daily?hostelId={hostelId}&date={date}
   */
  async getDailyReport(hostelId: string, date: string): Promise<DailyReportResponse> {
    try {
      const response = await apiService.get<DailyReportResponse>(
        '/attendance/reports/daily',
        { hostelId, date }
      );
      return response;
    } catch (error) {
      console.error('Error fetching daily report:', error);
      throw error;
    }
  }

  /**
   * Get activity report - check-in/out movements
   * GET /attendance/reports/activity?hostelId={hostelId}&dateFrom={dateFrom}&dateTo={dateTo}
   */
  async getActivityReport(
    hostelId: string, 
    filters: AttendanceFilters = {}
  ): Promise<ActivityReportResponse> {
    try {
      const params = {
        hostelId,
        ...filters,
      };
      
      const response = await apiService.get<ActivityReportResponse>(
        '/attendance/reports/activity',
        params
      );
      return response;
    } catch (error) {
      console.error('Error fetching activity report:', error);
      throw error;
    }
  }

  /**
   * Get summary report - analytics over date range
   * GET /attendance/reports/summary?hostelId={hostelId}&dateFrom={dateFrom}&dateTo={dateTo}
   */
  async getSummaryReport(
    hostelId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<SummaryReportResponse> {
    try {
      const response = await apiService.get<SummaryReportResponse>(
        '/attendance/reports/summary',
        { hostelId, dateFrom, dateTo }
      );
      return response;
    } catch (error) {
      console.error('Error fetching summary report:', error);
      throw error;
    }
  }

  /**
   * Get student attendance history
   * GET /attendance/my-history?studentId={studentId}&hostelId={hostelId}&dateFrom={dateFrom}&dateTo={dateTo}
   */
  async getStudentHistory(
    studentId: string,
    hostelId: string,
    filters: AttendanceFilters = {}
  ): Promise<StudentHistoryResponse> {
    try {
      const params = {
        studentId,
        hostelId,
        ...filters,
      };
      
      const response = await apiService.get<StudentHistoryResponse>(
        '/attendance/my-history',
        params
      );
      return response;
    } catch (error) {
      console.error('Error fetching student history:', error);
      throw error;
    }
  }

  /**
   * Health check for attendance endpoints
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Use a simple endpoint to check if attendance API is working
      // This will help with debugging connection issues
      await apiService.get('/attendance/current-status', { 
        hostelId: 'health-check' 
      });
      return true;
    } catch (error) {
      console.warn('Attendance API health check failed:', error);
      return false;
    }
  }

  /**
   * Get today's date in YYYY-MM-DD format (Nepal timezone)
   */
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Get date range for common periods
   */
  getDateRange(period: 'today' | 'week' | 'month' | 'year'): { from: string; to: string } {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (period) {
      case 'today':
        return { from: todayStr, to: todayStr };
      
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return { 
          from: weekAgo.toISOString().split('T')[0], 
          to: todayStr 
        };
      }
      
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return { 
          from: monthAgo.toISOString().split('T')[0], 
          to: todayStr 
        };
      }
      
      case 'year': {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        return { 
          from: yearAgo.toISOString().split('T')[0], 
          to: todayStr 
        };
      }
      
      default:
        return { from: todayStr, to: todayStr };
    }
  }

  /**
   * Format duration string to human readable format
   */
  formatDuration(duration: string): string {
    // Handle "In progress" and other special cases
    if (duration === 'In progress' || !duration) {
      return duration || 'Unknown';
    }
    
    // Parse duration like "2h 30m" and ensure consistent formatting
    const match = duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      
      if (hours === 0) {
        return `${minutes}m`;
      } else if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
    
    return duration;
  }

  /**
   * Calculate attendance rate percentage
   */
  calculateAttendanceRate(present: number, total: number): string {
    if (total === 0) return '0%';
    const rate = (present / total) * 100;
    return `${rate.toFixed(1)}%`;
  }
}

// Export singleton instance
export const attendanceApiService = AttendanceApiService.getInstance();