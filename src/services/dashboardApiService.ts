import { ApiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  availableRooms: number;
  totalRooms: number;
  activeRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  monthlyRevenue: {
    value: string;
    amount: number;
  };
  outstandingDues: number;
  occupancyPercentage: number;
  attendanceCounters?: {
    checkIn: number;
    checkOut: number;
    date?: string;
  };
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'checkin' | 'checkout' | 'maintenance' | 'overdue';
  message: string;
  time: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedRecentActivities {
  data: RecentActivity[];
  pagination: PaginationInfo;
}

export interface CheckedOutWithDues {
  studentId: string;
  studentName: string;
  roomNumber: string;
  phone: string;
  email: string;
  outstandingDues: number;
  checkoutDate: string;
  status: string;
}

export interface MonthlyRevenueData {
  month: string;
  amount: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  checkedOutWithDues: CheckedOutWithDues[];
  monthlyRevenue: MonthlyRevenueData[];
  overdueInvoices: any[];
}

export class DashboardApiService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    console.log('📊 DashboardApiService.getDashboardStats called');
    
    const result = await this.apiService.get<DashboardStats>('/dashboard/stats');
    
    console.log('📊 Dashboard stats result:', result);
    return result;
  }

  /**
   * Get recent activities with pagination
   */
  async getRecentActivitiesPaginated(page: number = 1, limit: number = 10): Promise<PaginatedRecentActivities> {
    console.log('📋 DashboardApiService.getRecentActivitiesPaginated called with page:', page, 'limit:', limit);
    
    const queryParams = { page: page.toString(), limit: limit.toString() };
    const result = await this.apiService.get<PaginatedRecentActivities>('/dashboard/recent-activity', queryParams);
    
    console.log('📋 Paginated activities result:', result?.data?.length || 0, 'activities found, page:', result?.pagination?.page);
    return result || { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
  }

  /**
   * Get recent activities (legacy method for backward compatibility)
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    console.log('📋 DashboardApiService.getRecentActivities (legacy) called with limit:', limit);
    
    const queryParams = limit ? { limit: limit.toString() } : {};
    const result = await this.apiService.get<RecentActivity[]>('/dashboard/recent-activity/legacy', queryParams);
    
    console.log('📋 Recent activities result:', result?.length || 0, 'activities found');
    return result || [];
  }

  /**
   * Get students with outstanding dues after checkout
   */
  async getCheckedOutWithDues(): Promise<CheckedOutWithDues[]> {
    console.log('👥 DashboardApiService.getCheckedOutWithDues called');
    
    const response = await this.apiService.get<any>('/dashboard/checked-out-dues');
    const result = response.data || response;
    
    console.log('👥 Checked out with dues result:', result?.length || 0, 'students found');
    return result || [];
  }

  /**
   * Get ALL students with outstanding dues (active + inactive)
   */
  async getAllOutstandingDues(): Promise<CheckedOutWithDues[]> {
    console.log('👥 DashboardApiService.getAllOutstandingDues called');
    
    const response = await this.apiService.get<any>('/dashboard/all-outstanding-dues');
    const result = response.data || response;
    
    console.log('👥 All outstanding dues result:', result?.length || 0, 'students found');
    return result || [];
  }

  /**
   * Get monthly revenue data
   */
  async getMonthlyRevenue(months: number = 12): Promise<MonthlyRevenueData[]> {
    console.log('💰 DashboardApiService.getMonthlyRevenue called for months:', months);
    
    const response = await this.apiService.get<any>('/dashboard/monthly-revenue', {
      months: months.toString()
    });
    
    const result = response.data || response;
    console.log('💰 Monthly revenue result:', result?.length || 0, 'months found');
    return result || [];
  }

  /**
   * Get comprehensive dashboard summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    console.log('🏠 DashboardApiService.getDashboardSummary called');
    
    const response = await this.apiService.get<any>('/dashboard/summary');
    const result = response.data || response;
    
    console.log('🏠 Dashboard summary result:', result);
    return result;
  }

  /**
   * Get dashboard overview (combines stats and recent activities)
   */
  async getDashboardOverview(): Promise<{
    stats: DashboardStats;
    recentActivities: RecentActivity[];
    checkedOutWithDues: CheckedOutWithDues[];
  }> {
    console.log('🏠 DashboardApiService.getDashboardOverview called');
    
    try {
      const [stats, recentActivities, checkedOutWithDues] = await Promise.all([
        this.getDashboardStats(),
        this.getRecentActivities(8),
        this.getCheckedOutWithDues()
      ]);

      return {
        stats,
        recentActivities,
        checkedOutWithDues
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Calculate total collected amount from payments
   */
  async getTotalCollected(): Promise<number> {
    try {
      // This would ideally be a separate endpoint, but we can calculate from monthly revenue
      const monthlyData = await this.getMonthlyRevenue(24); // Get 2 years of data
      return monthlyData.reduce((total, month) => total + month.amount, 0);
    } catch (error) {
      console.error('❌ Error calculating total collected:', error);
      return 0;
    }
  }

  /**
   * Calculate total outstanding dues (ALL students - active + inactive)
   */
  async getTotalOutstandingDues(): Promise<{ amount: number; invoiceCount: number }> {
    try {
      const allOutstandingDues = await this.getAllOutstandingDues();
      const totalAmount = allOutstandingDues.reduce((total, student) => total + student.outstandingDues, 0);
      
      return {
        amount: totalAmount,
        invoiceCount: allOutstandingDues.length
      };
    } catch (error) {
      console.error('❌ Error calculating outstanding dues:', error);
      return { amount: 0, invoiceCount: 0 };
    }
  }

  /**
   * Refresh dashboard data (combines overview with timestamp)
   */
  async refreshDashboard(): Promise<{
    stats: DashboardStats;
    recentActivities: RecentActivity[];
    checkedOutWithDues: CheckedOutWithDues[];
    timestamp: number;
  }> {
    console.log('🔄 DashboardApiService.refreshDashboard called');
    
    try {
      const overview = await this.getDashboardOverview();
      
      return {
        ...overview,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Error refreshing dashboard:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardApiService = new DashboardApiService();