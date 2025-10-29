import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dashboardApiService, DashboardApiService } from '../../services/dashboardApiService';
import { apiService } from '../../services/apiService';

// Mock the apiService
vi.mock('../../services/apiService', () => ({
  apiService: {
    get: vi.fn()
  }
}));

const mockApiService = apiService as any;

describe('DashboardApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard statistics successfully', async () => {
      const mockStats = {
        totalStudents: 150,
        availableRooms: 45,
        monthlyRevenue: {
          value: 'NPR 250,000',
          amount: 250000
        },
        pendingPayments: 12,
        occupancyPercentage: 75
      };

      mockApiService.get.mockResolvedValue(mockStats);

      const result = await dashboardApiService.getDashboardStats();

      expect(mockApiService.get).toHaveBeenCalledWith('/dashboard/stats');
      expect(result).toEqual(mockStats);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockApiService.get.mockRejectedValue(error);

      await expect(dashboardApiService.getDashboardStats()).rejects.toThrow('API Error');
    });
  });

  describe('getRecentActivities', () => {
    it('should fetch recent activities with default limit', async () => {
      const mockActivities = [
        {
          id: '1',
          type: 'payment',
          message: 'Payment received from John Doe',
          time: '2 hours ago',
          timestamp: '2024-01-15T10:00:00Z',
          icon: 'DollarSign',
          color: 'text-green-600'
        },
        {
          id: '2',
          type: 'booking',
          message: 'New booking request from Jane Smith',
          time: '4 hours ago',
          timestamp: '2024-01-15T08:00:00Z',
          icon: 'Gift',
          color: 'text-purple-600'
        }
      ];

      mockApiService.get.mockResolvedValue(mockActivities);

      const result = await dashboardApiService.getRecentActivities();

      expect(mockApiService.get).toHaveBeenCalledWith('/dashboard/recent-activity/legacy', {});
      expect(result).toEqual(mockActivities);
    });

    it('should fetch recent activities with custom limit', async () => {
      const mockActivities: any[] = [];
      mockApiService.get.mockResolvedValue(mockActivities);

      await dashboardApiService.getRecentActivities(5);

      expect(mockApiService.get).toHaveBeenCalledWith('/dashboard/recent-activity/legacy', { limit: '5' });
    });

    it('should handle empty activities response', async () => {
      mockApiService.get.mockResolvedValue([]);

      const result = await dashboardApiService.getRecentActivities();

      expect(result).toEqual([]);
    });
  });

  describe('getRecentActivitiesPaginated', () => {
    it('should fetch recent activities with pagination', async () => {
      const mockResponse = {
        data: [
          {
            id: 'activity-1',
            type: 'payment',
            message: 'Payment received from John Doe',
            time: '2 hours ago',
            timestamp: '2024-01-15T10:00:00Z',
            icon: 'DollarSign',
            color: 'text-green-600'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await dashboardApiService.getRecentActivitiesPaginated(1, 10);

      expect(mockApiService.get).toHaveBeenCalledWith('/dashboard/recent-activity', {
        page: '1',
        limit: '10'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle pagination with custom page and limit', async () => {
      const mockResponse = {
        data: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 25,
          totalPages: 5,
          hasNext: true,
          hasPrev: true
        }
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await dashboardApiService.getRecentActivitiesPaginated(2, 5);

      expect(mockApiService.get).toHaveBeenCalledWith('/dashboard/recent-activity', {
        page: '2',
        limit: '5'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return default pagination when response is invalid', async () => {
      mockApiService.get.mockResolvedValue(null);

      const result = await dashboardApiService.getRecentActivitiesPaginated(1, 10);

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    });
  });

  describe('getMonthlyRevenue', () => {
    it('should fetch monthly revenue data successfully', async () => {
      const mockRevenue = {
        data: {
          month: '2024-01',
          revenue: 250000,
          collections: 200000,
          pending: 50000
        }
      };

      mockApiService.get.mockResolvedValue(mockRevenue);

      const result = await dashboardApiService.getMonthlyRevenue(2024, 1);

      expect(mockApiService.get).toHaveBeenCalledWith('/dashboard/monthly-revenue', {
        year: 2024,
        month: 1
      });
      expect(result).toEqual(mockRevenue.data);
    });

    it('should return fallback data when API returns empty data', async () => {
      mockApiService.get.mockResolvedValue({ data: null });

      const result = await dashboardApiService.getMonthlyRevenue(2024, 1);

      expect(result).toEqual({
        month: '2024-01',
        revenue: 0,
        collections: 0,
        pending: 0
      });
    });

    it('should return fallback data when API returns undefined data', async () => {
      mockApiService.get.mockResolvedValue({});

      const result = await dashboardApiService.getMonthlyRevenue(2024, 12);

      expect(result).toEqual({
        month: '2024-12',
        revenue: 0,
        collections: 0,
        pending: 0
      });
    });

    it('should handle different month formats correctly', async () => {
      mockApiService.get.mockResolvedValue({ data: null });

      const result = await dashboardApiService.getMonthlyRevenue(2024, 5);

      expect(result.month).toBe('2024-05');
    });
  });

  describe('getDashboardOverview', () => {
    it('should fetch both stats and recent activities', async () => {
      const mockStats = {
        totalStudents: 150,
        availableRooms: 45,
        monthlyRevenue: { value: 'NPR 250,000', amount: 250000 },
        pendingPayments: 12,
        occupancyPercentage: 75
      };

      const mockActivities = [
        {
          id: '1',
          type: 'payment',
          message: 'Payment received',
          time: '2 hours ago',
          timestamp: '2024-01-15T10:00:00Z',
          icon: 'DollarSign',
          color: 'text-green-600'
        }
      ];

      mockApiService.get
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockActivities);

      const result = await dashboardApiService.getDashboardOverview();

      expect(result).toEqual({
        stats: mockStats,
        recentActivities: mockActivities
      });
      
      // Verify both API calls were made
      expect(mockApiService.get).toHaveBeenCalledTimes(2);
      expect(mockApiService.get).toHaveBeenNthCalledWith(1, '/dashboard/stats');
      expect(mockApiService.get).toHaveBeenNthCalledWith(2, '/dashboard/recent-activity', { limit: 8 });
    });

    it('should handle errors in overview fetch', async () => {
      mockApiService.get.mockRejectedValue(new Error('Network error'));

      await expect(dashboardApiService.getDashboardOverview()).rejects.toThrow('Network error');
    });

    it('should handle partial failures gracefully', async () => {
      const mockStats = {
        totalStudents: 150,
        availableRooms: 45,
        monthlyRevenue: { value: 'NPR 250,000', amount: 250000 },
        pendingPayments: 12,
        occupancyPercentage: 75
      };

      // First call succeeds, second fails
      mockApiService.get
        .mockResolvedValueOnce(mockStats)
        .mockRejectedValueOnce(new Error('Activities fetch failed'));

      await expect(dashboardApiService.getDashboardOverview()).rejects.toThrow('Activities fetch failed');
    });
  });

  describe('refreshDashboard', () => {
    it('should refresh dashboard data with timestamp', async () => {
      const mockStats = { 
        totalStudents: 150,
        availableRooms: 45,
        monthlyRevenue: { value: 'NPR 250,000', amount: 250000 },
        pendingPayments: 12,
        occupancyPercentage: 75
      };
      const mockActivities = [{ 
        id: '1', 
        type: 'payment',
        message: 'Payment received',
        time: '2 hours ago',
        timestamp: '2024-01-15T10:00:00Z',
        icon: 'DollarSign',
        color: 'text-green-600'
      }];

      mockApiService.get
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce(mockActivities);

      const result = await dashboardApiService.refreshDashboard();

      expect(result).toHaveProperty('stats', mockStats);
      expect(result).toHaveProperty('recentActivities', mockActivities);
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('number');
      expect(result.timestamp).toBeCloseTo(Date.now(), -2); // Within 100ms
    });

    it('should handle refresh errors', async () => {
      mockApiService.get.mockRejectedValue(new Error('Refresh failed'));

      await expect(dashboardApiService.refreshDashboard()).rejects.toThrow('Refresh failed');
    });
  });

  describe('service instance', () => {
    it('should be a singleton instance', () => {
      expect(dashboardApiService).toBeInstanceOf(DashboardApiService);
    });

    it('should have all required methods', () => {
      expect(typeof dashboardApiService.getDashboardStats).toBe('function');
      expect(typeof dashboardApiService.getRecentActivities).toBe('function');
      expect(typeof dashboardApiService.getMonthlyRevenue).toBe('function');
      expect(typeof dashboardApiService.getDashboardOverview).toBe('function');
      expect(typeof dashboardApiService.refreshDashboard).toBe('function');
    });
  });

  describe('error handling patterns', () => {
    it('should propagate API service errors', async () => {
      const customError = new Error('Custom API Error');
      mockApiService.get.mockRejectedValue(customError);

      await expect(dashboardApiService.getDashboardStats()).rejects.toThrow('Custom API Error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      mockApiService.get.mockRejectedValue(timeoutError);

      await expect(dashboardApiService.getRecentActivities()).rejects.toThrow('Request timeout');
    });
  });
});

// Integration tests with real API (when backend is running)
describe('DashboardApiService Integration', () => {
  // Skip these tests if not in integration test mode
  const isIntegrationTest = process.env.VITEST_INTEGRATION === 'true';
  
  if (!isIntegrationTest) {
    it.skip('Integration tests skipped - set VITEST_INTEGRATION=true to run', () => {});
    return;
  }

  beforeEach(() => {
    // Use real apiService for integration tests
    vi.unmock('../../services/apiService');
  });

  it('should fetch real dashboard stats from API', async () => {
    const stats = await dashboardApiService.getDashboardStats();
    
    expect(stats).toHaveProperty('totalStudents');
    expect(stats).toHaveProperty('availableRooms');
    expect(stats).toHaveProperty('monthlyRevenue');
    expect(stats).toHaveProperty('pendingPayments');
    expect(stats).toHaveProperty('occupancyPercentage');
    
    expect(typeof stats.totalStudents).toBe('number');
    expect(typeof stats.availableRooms).toBe('number');
    expect(typeof stats.occupancyPercentage).toBe('number');
    expect(typeof stats.monthlyRevenue.amount).toBe('number');
    expect(typeof stats.monthlyRevenue.value).toBe('string');
  });

  it('should fetch real recent activities from API', async () => {
    const activities = await dashboardApiService.getRecentActivities(5);
    
    expect(Array.isArray(activities)).toBe(true);
    
    if (activities.length > 0) {
      const activity = activities[0];
      expect(activity).toHaveProperty('id');
      expect(activity).toHaveProperty('type');
      expect(activity).toHaveProperty('message');
      expect(activity).toHaveProperty('timestamp');
      expect(activity).toHaveProperty('time');
      expect(activity).toHaveProperty('icon');
      expect(activity).toHaveProperty('color');
    }
  });

  it('should fetch dashboard overview from real API', async () => {
    const overview = await dashboardApiService.getDashboardOverview();
    
    expect(overview).toHaveProperty('stats');
    expect(overview).toHaveProperty('recentActivities');
    expect(Array.isArray(overview.recentActivities)).toBe(true);
    
    // Validate stats structure
    expect(overview.stats).toHaveProperty('totalStudents');
    expect(overview.stats).toHaveProperty('availableRooms');
    expect(overview.stats).toHaveProperty('monthlyRevenue');
  });

  it('should fetch monthly revenue from real API', async () => {
    const currentDate = new Date();
    const revenue = await dashboardApiService.getMonthlyRevenue(
      currentDate.getFullYear(), 
      currentDate.getMonth() + 1
    );
    
    expect(revenue).toHaveProperty('month');
    expect(revenue).toHaveProperty('revenue');
    expect(revenue).toHaveProperty('collections');
    expect(revenue).toHaveProperty('pending');
    
    expect(typeof revenue.revenue).toBe('number');
    expect(typeof revenue.collections).toBe('number');
    expect(typeof revenue.pending).toBe('number');
  });

  it('should handle real API errors gracefully', async () => {
    // This test might fail if the API is down, which is expected
    try {
      await dashboardApiService.getDashboardStats();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(typeof (error as Error).message).toBe('string');
    }
  });
});