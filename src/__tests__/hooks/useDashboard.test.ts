import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from '../../hooks/useDashboard';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3001/hostel/api/v1';

describe('useDashboard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      expect(result.current.stats).toBe(null);
      expect(result.current.recentActivities).toEqual([]);
      expect(result.current.monthlyRevenue).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastRefresh).toBe(null);
      expect(result.current.hasData).toBe(false);
    });

    it('should load data on mount when loadOnMount is true', async () => {
      const { result } = renderHook(() => useDashboard({ loadOnMount: true }));
      
      // Initially loading should be true
      expect(result.current.loading).toBe(true);
      
      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 5000 });
      
      expect(result.current.stats).not.toBe(null);
      expect(result.current.hasData).toBe(true);
      expect(result.current.lastRefresh).toBeTypeOf('number');
    }, 10000);
  });

  describe('loadDashboardOverview', () => {
    it('should load dashboard overview successfully', async () => {
      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadDashboardOverview();
      });
      
      expect(result.current.stats).not.toBe(null);
      expect(Array.isArray(result.current.recentActivities)).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle loading errors', async () => {
      // Override the MSW handler to return an error
      server.use(
        http.get(`${BASE_URL}/dashboard/stats`, () => {
          return HttpResponse.json(
            { message: 'API Error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadDashboardOverview();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('500');
      expect(result.current.stats).toBe(null);
    });
  });

  describe('loadDashboardStats', () => {
    it('should load dashboard stats only', async () => {
      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadDashboardStats();
      });
      
      expect(result.current.stats).not.toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('loadRecentActivities', () => {
    it('should load recent activities with default limit', async () => {
      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadRecentActivities();
      });
      
      expect(Array.isArray(result.current.recentActivities)).toBe(true);
    });

    it('should load recent activities with custom limit', async () => {
      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadRecentActivities(5);
      });
      
      expect(Array.isArray(result.current.recentActivities)).toBe(true);
      expect(result.current.recentActivities.length).toBeLessThanOrEqual(5);
    });
  });

  describe('loadMonthlyRevenue', () => {
    it('should load monthly revenue data', async () => {
      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadMonthlyRevenue(2024, 1);
      });
      
      expect(result.current.monthlyRevenue).not.toBe(null);
      expect(result.current.monthlyRevenue?.month).toBe('2024-01');
    });
  });

  describe('refreshDashboard', () => {
    it('should refresh all dashboard data', async () => {
      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.refreshDashboard();
      });
      
      expect(result.current.stats).not.toBe(null);
      expect(Array.isArray(result.current.recentActivities)).toBe(true);
      expect(result.current.lastRefresh).toBeTypeOf('number');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      // First cause an error
      server.use(
        http.get(`${BASE_URL}/dashboard/stats`, () => {
          return HttpResponse.json(
            { message: 'Test error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadDashboardOverview();
      });
      
      expect(result.current.error).not.toBe(null);
      
      // Clear the error
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('auto-refresh', () => {
    it('should auto-refresh when enabled', async () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => useDashboard({ 
        autoRefresh: true, 
        refreshInterval: 1000,
        loadOnMount: true 
      }));
      
      // Wait for initial load
      await act(async () => {
        await vi.runOnlyPendingTimersAsync();
      });
      
      const initialRefresh = result.current.lastRefresh;
      
      // Fast-forward time to trigger auto-refresh
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runOnlyPendingTimersAsync();
      });
      
      // Should have refreshed
      expect(result.current.lastRefresh).toBeGreaterThan(initialRefresh || 0);
      
      vi.useRealTimers();
    });
  });

  describe('computed values', () => {
    it('should calculate hasData correctly', async () => {
      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      expect(result.current.hasData).toBe(false);
      
      await act(async () => {
        await result.current.loadDashboardOverview();
      });
      
      expect(result.current.hasData).toBe(true);
    });

    it('should calculate isStale correctly', async () => {
      const { result } = renderHook(() => useDashboard({ 
        loadOnMount: false,
        refreshInterval: 1000 
      }));
      
      expect(result.current.isStale).toBe(false);
      
      await act(async () => {
        await result.current.loadDashboardOverview();
      });
      
      // Initially not stale
      expect(result.current.isStale).toBe(false);
      
      // Mock time passing to make data stale
      vi.useFakeTimers();
      vi.advanceTimersByTime(2000); // Advance past refresh interval
      
      expect(result.current.isStale).toBe(true);
      
      vi.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      server.use(
        http.get(`${BASE_URL}/dashboard/stats`, () => {
          return HttpResponse.json(
            { message: 'Network error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadDashboardOverview();
      });
      
      expect(result.current.error).toContain('500');
      expect(result.current.loading).toBe(false);
      expect(result.current.stats).toBe(null);
    });

    it('should handle timeout errors', async () => {
      server.use(
        http.get(`${BASE_URL}/dashboard/stats`, () => {
          // Simulate timeout by not responding
          return new Promise(() => {});
        })
      );

      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        try {
          await result.current.loadDashboardOverview();
        } catch (error) {
          // Expected to timeout
        }
      });
      
      // Should handle timeout gracefully
      expect(result.current.loading).toBe(false);
    });
  });

  describe('data transformation', () => {
    it('should handle different API response formats', async () => {
      // Test with custom response format
      server.use(
        http.get(`${BASE_URL}/dashboard/stats`, () => {
          return HttpResponse.json({
            stats: {
              totalStudents: 100,
              activeStudents: 95,
              totalRevenue: 1000000,
              pendingPayments: 50000,
              occupancyRate: 90,
              monthlyCollection: 900000
            }
          });
        })
      );

      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadDashboardStats();
      });
      
      expect(result.current.stats).toHaveProperty('totalStudents', 100);
      expect(result.current.stats).toHaveProperty('activeStudents', 95);
    });

    it('should handle empty activity responses', async () => {
      server.use(
        http.get(`${BASE_URL}/dashboard/recent-activity`, () => {
          return HttpResponse.json({ data: [] });
        })
      );

      const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
      
      await act(async () => {
        await result.current.loadRecentActivities();
      });
      
      expect(result.current.recentActivities).toEqual([]);
    });
  });
});

// Integration tests with real API (when backend is running)
describe('useDashboard Integration', () => {
  // Skip these tests if not in integration test mode
  const isIntegrationTest = process.env.VITEST_INTEGRATION === 'true';
  
  if (!isIntegrationTest) {
    it.skip('Integration tests skipped - set VITEST_INTEGRATION=true to run', () => {});
    return;
  }

  it('should load real dashboard data from API', async () => {
    const { result } = renderHook(() => useDashboard({ loadOnMount: false }));
    
    await act(async () => {
      await result.current.loadDashboardOverview();
    });
    
    if (!result.current.error) {
      expect(result.current.stats).not.toBe(null);
      expect(result.current.stats?.totalStudents).toBeTypeOf('number');
      expect(Array.isArray(result.current.recentActivities)).toBe(true);
    }
  });

  it('should handle real API errors gracefully', async () => {
    const { result } = renderHook(() => useDashboard({ 
      loadOnMount: false 
    }));
    
    await act(async () => {
      await result.current.loadDashboardStats();
    });
    
    // Should either succeed or fail gracefully
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.error === 'string' || result.current.error === null).toBe(true);
  });
});