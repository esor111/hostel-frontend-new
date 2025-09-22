import { useState, useEffect, useCallback } from 'react';
import { bookingApiService } from '../services/bookingApiService';
import { BookingRequest } from '../types/api';

export interface UnifiedBookingFilters {
  status?: string;
  type?: 'single' | 'multi' | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UnifiedBookingStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  singleGuestBookings?: number;
  multiGuestBookings?: number;
  approvalRate: number;
  sourceBreakdown: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

export interface UseUnifiedBookingsReturn {
  // Data
  bookings: BookingRequest[];
  multiGuestBookings: any[];
  stats: UnifiedBookingStats | null;
  pendingBookings: BookingRequest[];
  
  // Loading states
  loading: boolean;
  statsLoading: boolean;
  pendingLoading: boolean;
  
  // Error states
  error: string | null;
  statsError: string | null;
  pendingError: string | null;
  
  // Actions
  fetchBookings: (filters?: UnifiedBookingFilters) => Promise<void>;
  fetchMultiGuestBookings: (filters?: any) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchPendingBookings: () => Promise<void>;
  createBooking: (bookingData: any) => Promise<BookingRequest>;
  createMultiGuestBooking: (bookingData: any) => Promise<any>;
  approveBooking: (id: string, data?: any) => Promise<any>;
  rejectBooking: (id: string, reason: string) => Promise<any>;
  confirmMultiGuestBooking: (id: string, processedBy?: string) => Promise<any>;
  cancelMultiGuestBooking: (id: string, reason: string, processedBy?: string) => Promise<any>;
  
  // Utilities
  refresh: () => Promise<void>;
  getBookingTypeLabel: (booking: any) => string;
  isMultiGuestBooking: (booking: any) => boolean;
}

export const useUnifiedBookings = (
  initialFilters?: UnifiedBookingFilters
): UseUnifiedBookingsReturn => {
  // State
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [multiGuestBookings, setMultiGuestBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<UnifiedBookingStats | null>(null);
  const [pendingBookings, setPendingBookings] = useState<BookingRequest[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);

  // Fetch all bookings (single guest, now served by unified system)
  const fetchBookings = useCallback(async (filters?: UnifiedBookingFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching unified bookings with filters:', filters);
      const result = await bookingApiService.getAllBookings();
      
      // Apply client-side filtering if needed
      let filteredBookings = result;
      
      if (filters?.status) {
        filteredBookings = filteredBookings.filter(booking => 
          booking.status.toLowerCase() === filters.status?.toLowerCase()
        );
      }
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredBookings = filteredBookings.filter(booking =>
          booking.name.toLowerCase().includes(searchTerm) ||
          booking.email.toLowerCase().includes(searchTerm) ||
          booking.phone.includes(searchTerm)
        );
      }
      
      setBookings(filteredBookings);
      console.log('✅ Unified bookings fetched successfully:', filteredBookings.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('❌ Error fetching unified bookings:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch multi-guest bookings
  const fetchMultiGuestBookings = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching multi-guest bookings with filters:', filters);
      const result = await bookingApiService.getMultiGuestBookings(filters);
      setMultiGuestBookings(result);
      console.log('✅ Multi-guest bookings fetched successfully:', result.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch multi-guest bookings';
      setError(errorMessage);
      console.error('❌ Error fetching multi-guest bookings:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch booking statistics
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      console.log('🔄 Fetching unified booking statistics');
      const result = await bookingApiService.getBookingStats();
      setStats(result);
      console.log('✅ Unified booking statistics fetched successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking statistics';
      setStatsError(errorMessage);
      console.error('❌ Error fetching unified booking statistics:', errorMessage);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch pending bookings
  const fetchPendingBookings = useCallback(async () => {
    setPendingLoading(true);
    setPendingError(null);
    
    try {
      console.log('🔄 Fetching pending bookings (unified system)');
      const result = await bookingApiService.getPendingBookings();
      setPendingBookings(result);
      console.log('✅ Pending bookings fetched successfully:', result.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pending bookings';
      setPendingError(errorMessage);
      console.error('❌ Error fetching pending bookings:', errorMessage);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  // Create single guest booking
  const createBooking = useCallback(async (bookingData: any): Promise<BookingRequest> => {
    try {
      console.log('🔄 Creating single guest booking (unified system)');
      const result = await bookingApiService.createBooking(bookingData);
      
      // Refresh bookings list
      await fetchBookings(initialFilters);
      await fetchStats();
      
      console.log('✅ Single guest booking created successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      console.error('❌ Error creating single guest booking:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBookings, fetchStats, initialFilters]);

  // Create multi-guest booking
  const createMultiGuestBooking = useCallback(async (bookingData: any): Promise<any> => {
    try {
      console.log('🔄 Creating multi-guest booking');
      const result = await bookingApiService.createMultiGuestBooking(bookingData);
      
      // Refresh bookings lists
      await fetchMultiGuestBookings();
      await fetchStats();
      
      console.log('✅ Multi-guest booking created successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create multi-guest booking';
      console.error('❌ Error creating multi-guest booking:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchMultiGuestBookings, fetchStats]);

  // Approve booking
  const approveBooking = useCallback(async (id: string, data?: any): Promise<any> => {
    try {
      console.log('🔄 Approving booking (unified system):', id);
      const result = await bookingApiService.approveBooking(id);
      
      // Refresh data
      await fetchBookings(initialFilters);
      await fetchPendingBookings();
      await fetchStats();
      
      console.log('✅ Booking approved successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve booking';
      console.error('❌ Error approving booking:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBookings, fetchPendingBookings, fetchStats, initialFilters]);

  // Reject booking
  const rejectBooking = useCallback(async (id: string, reason: string): Promise<any> => {
    try {
      console.log('🔄 Rejecting booking (unified system):', id);
      const result = await bookingApiService.rejectBooking(id, reason);
      
      // Refresh data
      await fetchBookings(initialFilters);
      await fetchPendingBookings();
      await fetchStats();
      
      console.log('✅ Booking rejected successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject booking';
      console.error('❌ Error rejecting booking:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBookings, fetchPendingBookings, fetchStats, initialFilters]);

  // Confirm multi-guest booking
  const confirmMultiGuestBooking = useCallback(async (id: string, processedBy?: string): Promise<any> => {
    try {
      console.log('🔄 Confirming multi-guest booking:', id);
      const result = await bookingApiService.confirmMultiGuestBooking(id, processedBy);
      
      // Clear students cache to ensure new students appear immediately
      const { studentsApiService } = await import('../services/studentsApiService');
      studentsApiService.clearCache();
      console.log('🔄 Cleared students cache in useUnifiedBookings hook');
      
      // Refresh data
      await fetchMultiGuestBookings();
      await fetchStats();
      
      console.log('✅ Multi-guest booking confirmed successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm multi-guest booking';
      console.error('❌ Error confirming multi-guest booking:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchMultiGuestBookings, fetchStats]);

  // Cancel multi-guest booking
  const cancelMultiGuestBooking = useCallback(async (id: string, reason: string, processedBy?: string): Promise<any> => {
    try {
      console.log('🔄 Cancelling multi-guest booking:', id);
      const result = await bookingApiService.cancelMultiGuestBooking(id, reason, processedBy);
      
      // Refresh data
      await fetchMultiGuestBookings();
      await fetchStats();
      
      console.log('✅ Multi-guest booking cancelled successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel multi-guest booking';
      console.error('❌ Error cancelling multi-guest booking:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchMultiGuestBookings, fetchStats]);

  // Refresh all data
  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing all unified booking data');
    await Promise.all([
      fetchBookings(initialFilters),
      fetchMultiGuestBookings(),
      fetchStats(),
      fetchPendingBookings()
    ]);
    console.log('✅ All unified booking data refreshed');
  }, [fetchBookings, fetchMultiGuestBookings, fetchStats, fetchPendingBookings, initialFilters]);

  // Utility functions
  const getBookingTypeLabel = useCallback((booking: any): string => {
    return bookingApiService.getBookingTypeLabel(booking);
  }, []);

  const isMultiGuestBooking = useCallback((booking: any): boolean => {
    return bookingApiService.isMultiGuestBooking(booking);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchBookings(initialFilters);
    fetchStats();
    fetchPendingBookings();
  }, [fetchBookings, fetchStats, fetchPendingBookings, initialFilters]);

  return {
    // Data
    bookings,
    multiGuestBookings,
    stats,
    pendingBookings,
    
    // Loading states
    loading,
    statsLoading,
    pendingLoading,
    
    // Error states
    error,
    statsError,
    pendingError,
    
    // Actions
    fetchBookings,
    fetchMultiGuestBookings,
    fetchStats,
    fetchPendingBookings,
    createBooking,
    createMultiGuestBooking,
    approveBooking,
    rejectBooking,
    confirmMultiGuestBooking,
    cancelMultiGuestBooking,
    
    // Utilities
    refresh,
    getBookingTypeLabel,
    isMultiGuestBooking
  };
};