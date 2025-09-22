import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { 
  MonthlyRevenueData, 
  GuestTypeData, 
  PerformanceMetrics, 
  CollectionStats, 
  AnalyticsTrends, 
  DashboardAnalytics 
} from '../types/api';

export class AnalyticsApiService {
  private apiService = apiService;

  /**
   * Get comprehensive dashboard analytics data
   */
  async getDashboardData(): Promise<DashboardAnalytics> {
    console.log('🔍 AnalyticsApiService.getDashboardData called');
    console.log('🔍 API endpoint:', API_ENDPOINTS.ANALYTICS.DASHBOARD);

    const result = await this.apiService.get<DashboardAnalytics>(
      API_ENDPOINTS.ANALYTICS.DASHBOARD
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure: { status: 200, data: {...} }
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Get monthly revenue data for charts
   */
  async getMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
    console.log('🔍 AnalyticsApiService.getMonthlyRevenue called');
    console.log('🔍 API endpoint:', API_ENDPOINTS.ANALYTICS.MONTHLY_REVENUE);

    const result = await this.apiService.get<MonthlyRevenueData[]>(
      API_ENDPOINTS.ANALYTICS.MONTHLY_REVENUE
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure - return ONLY real data
    if (result.data) {
      return Array.isArray(result.data) ? result.data : [result.data];
    }
    
    return Array.isArray(result) ? result : [result];
  }

  /**
   * Get student status distribution data from real API
   */
  async getGuestTypeData(): Promise<GuestTypeData[]> {
    try {
      console.log('🔍 AnalyticsApiService.getGuestTypeData called');
      
      // Get real student data from API
      const studentsResult = await this.apiService.get('/students');
      const students = studentsResult?.data?.items || studentsResult?.items || [];
      
      console.log('🔍 Students data:', students.length, 'students found');
      
      // Count students by status
      const statusCounts = {
        'Active': 0,
        'Pending Configuration': 0,
        'Inactive': 0,
        'Graduated': 0
      };
      
      students.forEach((student: any) => {
        const status = student.status || 'Inactive';
        
        // Map different status values to our categories
        if (status === 'Active' || status === 'ACTIVE') {
          statusCounts['Active']++;
        } else if (status === 'Pending Configuration' || status === 'PENDING_CONFIGURATION' || status === 'Pending') {
          statusCounts['Pending Configuration']++;
        } else if (status === 'Graduated' || status === 'GRADUATED') {
          statusCounts['Graduated']++;
        } else {
          statusCounts['Inactive']++;
        }
      });
      
      console.log('🔍 Status counts:', statusCounts);
      
      // Convert to chart data format
      const chartData: GuestTypeData[] = [
        { name: "Active Students", value: statusCounts['Active'], color: "#07A64F" },
        { name: "Pending Configuration", value: statusCounts['Pending Configuration'], color: "#1295D0" },
        { name: "Graduated/Inactive", value: statusCounts['Graduated'] + statusCounts['Inactive'], color: "#FF6B6B" },
      ].filter(item => item.value > 0); // Only show categories with students
      
      console.log('🔍 Chart data:', chartData);
      
      return chartData;
    } catch (error) {
      console.error('❌ Error fetching student status data:', error);
      
      // Fallback to empty data instead of hardcoded values
      return [
        { name: "No Data Available", value: 1, color: "#9CA3AF" }
      ];
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    console.log('🔍 AnalyticsApiService.getPerformanceMetrics called');
    console.log('🔍 API endpoint:', API_ENDPOINTS.ANALYTICS.PERFORMANCE_METRICS);

    const result = await this.apiService.get<PerformanceMetrics>(
      API_ENDPOINTS.ANALYTICS.PERFORMANCE_METRICS
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<CollectionStats> {
    try {
      const performanceMetrics = await this.getPerformanceMetrics();
      
      // Return only real data from API
      return {
        collectionRate: performanceMetrics.collectionRate || 0,
        totalCollected: 0, // Will be calculated from real payment data when available
        totalOutstanding: 0, // Will be calculated from real invoice data when available
      };
    } catch (error) {
      console.error('Error getting collection stats:', error);
      return {
        collectionRate: 0,
        totalCollected: 0,
        totalOutstanding: 0,
      };
    }
  }

  /**
   * Calculate trends from monthly data - DISABLED for production
   */
  async calculateTrends(): Promise<AnalyticsTrends> {
    // Return zero trends - no percentage calculations needed
    return {
      revenueGrowth: 0,
      bookingGrowth: 0,
      occupancyGrowth: 0,
    };
  }

  /**
   * Get all analytics data (comprehensive)
   */
  async getAllAnalytics(): Promise<DashboardAnalytics> {
    return this.getDashboardData();
  }
}

// Export singleton instance
export const analyticsApiService = new AnalyticsApiService();