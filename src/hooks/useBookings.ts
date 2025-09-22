import { useState, useEffect, useCallback } from 'react';
import { bookingApiService } from '../services/bookingApiService';
import { 
  BookingRequest, 
  CreateBookingRequest, 
  UpdateBookingRequest, 
  BookingStats,
  BookingStatus,
  ApproveBookingResponse,
  MultiGuestBooking,
  CreateMultiGuestBookingDto,
  BookingGuest
} from '../types/api';

export interface BookingFilters {
  status?: string;
  type?: 'single' | 'multi' | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UseBookingsReturn {
  // Data
  bookings: BookingRequest[];
  multiGuestBookings: MultiGuestBooking[];
  pendingBookings: BookingRequest[];
  bookingStats: BookingStats;
  
  // Loading states
  loading: boolean;
  statsLoading: boolean;
  pendingLoading: boolean;
  error: string | null;
  actionLoading: string | null;
  
  // Single guest booking actions (legacy compatibility)
  createBooking: (bookingData: CreateBookingRequest | CreateMultiGuestBookingDto) => Promise<BookingRequest>;
  updateBooking: (id: string, bookingData: UpdateBookingRequest) => Promise<BookingRequest>;
  approveBooking: (id: string) => Promise<ApproveBookingResponse>;
  rejectBooking: (id: string, reason: string) => Promise<BookingRequest>;
  deleteBooking: (id: string) => Promise<void>;
  
  // Multi-guest booking actions
  createMultiGuestBooking: (bookingData: CreateMultiGuestBookingDto) => Promise<MultiGuestBooking>;
  confirmMultiGuestBooking: (id: string, processedBy?: string) => Promise<ApproveBookingResponse>;
  cancelMultiGuestBooking: (id: string, reason: string, processedBy?: string) => Promise<BookingRequest>;
  getMultiGuestBookings: (filters?: any) => Promise<MultiGuestBooking[]>;
  
  // Guest management
  getAllGuests: () => Promise<BookingGuest[]>;
  getGuestById: (guestId: string) => Promise<BookingGuest | null>;
  getActiveGuests: () => Promise<BookingGuest[]>;
  
  // Utility methods
  isMultiGuestBooking: (booking: BookingRequest | MultiGuestBooking) => boolean;
  isSingleGuestBooking: (booking: BookingRequest | MultiGuestBooking) => boolean;
  getBookingTypeLabel: (booking: BookingRequest | MultiGuestBooking) => string;
  
  // Data management
  loadBookings: (filters?: BookingFilters) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useBookings = (initialFilters?: BookingFilters): UseBookingsReturn => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [multiGuestBookings, setMultiGuestBookings] = useState<MultiGuestBooking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingRequest[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    cancelledBookings: 0,
    approvalRate: 0,
    sourceBreakdown: {},
    monthlyTrend: [],
    todayBookings: 0,
    weeklyBookings: 0,
    monthlyBookings: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadBookings = useCallback(async (filters?: BookingFilters) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useBookings: Loading unified bookings data...', filters);

      // Load all bookings data in parallel
      const [
        allBookingsResult,
        multiGuestResult,
        pendingBookingsResult,
        statsResult
      ] = await Promise.all([
        bookingApiService.getAllBookings().catch(err => {
          console.warn('All bookings failed:', err);
          return [];
        }),
        bookingApiService.getMultiGuestBookings(filters).catch(err => {
          console.warn('Multi-guest bookings failed:', err);
          return [];
        }),
        bookingApiService.getPendingBookings().catch(err => {
          console.warn('Pending bookings failed:', err);
          return [];
        }),
        bookingApiService.getBookingStats().catch(err => {
          console.warn('Booking stats failed:', err);
          return {
            totalBookings: 0,
            pendingBookings: 0,
            approvedBookings: 0,
            rejectedBookings: 0,
            cancelledBookings: 0,
            approvalRate: 0,
            sourceBreakdown: {},
            monthlyTrend: [],
            todayBookings: 0,
            weeklyBookings: 0,
            monthlyBookings: 0,
          };
        })
      ]);

      // Apply client-side filtering if needed
      let filteredBookings = allBookingsResult;
      
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

      console.log('🔍 useBookings: Unified data loaded successfully');

      setBookings(filteredBookings);
      setMultiGuestBookings(multiGuestResult);
      setPendingBookings(pendingBookingsResult);
      setBookingStats(statsResult);

    } catch (err) {
      console.error('Error loading unified bookings data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings data');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (bookingData: CreateBookingRequest | CreateMultiGuestBookingDto): Promise<BookingRequest> => {
    try {
      setActionLoading('create');
      setError(null);

      console.log('🔍 useBookings: Creating unified booking...', bookingData);

      const newBooking = await bookingApiService.createBooking(bookingData);
      
      // Refresh bookings list
      await loadBookings(initialFilters);
      
      console.log('🔍 useBookings: Unified booking created successfully');
      return newBooking;
    } catch (err) {
      console.error('Error creating unified booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, [loadBookings, initialFilters]);

  const updateBooking = useCallback(async (id: string, bookingData: UpdateBookingRequest): Promise<BookingRequest> => {
    try {
      setActionLoading(`update-${id}`);
      setError(null);

      console.log('🔍 useBookings: Updating booking...', id, bookingData);

      const updatedBooking = await bookingApiService.updateBooking(id, bookingData);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === id ? updatedBooking : booking
      ));
      setPendingBookings(prev => prev.map(booking => 
        booking.id === id ? updatedBooking : booking
      ));
      
      console.log('🔍 useBookings: Booking updated successfully');
      return updatedBooking;
    } catch (err) {
      console.error('Error updating booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const approveBooking = useCallback(async (id: string): Promise<ApproveBookingResponse> => {
    try {
      setActionLoading(`approve-${id}`);
      setError(null);

      console.log('🔍 useBookings: Approving booking...', id);

      const result = await bookingApiService.approveBooking(id);
      
      // Refresh data to get updated booking status
      await loadBookings(initialFilters);
      
      console.log('🔍 useBookings: Booking approved successfully');
      return result;
    } catch (err) {
      console.error('Error approving booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, [loadBookings, initialFilters]);

  const rejectBooking = useCallback(async (id: string, reason: string): Promise<BookingRequest> => {
    try {
      setActionLoading(`reject-${id}`);
      setError(null);

      console.log('🔍 useBookings: Rejecting booking...', id, reason);

      const rejectedBooking = await bookingApiService.rejectBooking(id, reason);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === id ? rejectedBooking : booking
      ));
      setPendingBookings(prev => prev.filter(booking => booking.id !== id));
      
      // Update stats
      setBookingStats(prev => ({
        ...prev,
        pendingBookings: prev.pendingBookings - 1,
        rejectedBookings: prev.rejectedBookings + 1,
      }));
      
      console.log('🔍 useBookings: Booking rejected successfully');
      return rejectedBooking;
    } catch (err) {
      console.error('Error rejecting booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const deleteBooking = useCallback(async (id: string): Promise<void> => {
    try {
      setActionLoading(`delete-${id}`);
      setError(null);

      console.log('🔍 useBookings: Deleting booking...', id);

      await bookingApiService.deleteBooking(id);
      
      // Update local state
      setBookings(prev => prev.filter(booking => booking.id !== id));
      setPendingBookings(prev => prev.filter(booking => booking.id !== id));
      
      console.log('🔍 useBookings: Booking deleted successfully');
    } catch (err) {
      console.error('Error deleting booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadBookings(initialFilters);
  }, [loadBookings, initialFilters]);

  // Multi-guest booking methods
  const createMultiGuestBooking = useCallback(async (bookingData: CreateMultiGuestBookingDto): Promise<MultiGuestBooking> => {
    try {
      setActionLoading('create-multi');
      setError(null);

      console.log('🔍 useBookings: Creating multi-guest booking...', bookingData);

      const newBooking = await bookingApiService.createMultiGuestBooking(bookingData);
      
      // Refresh bookings list
      await loadBookings(initialFilters);
      
      console.log('🔍 useBookings: Multi-guest booking created successfully');
      return newBooking;
    } catch (err) {
      console.error('Error creating multi-guest booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create multi-guest booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, [loadBookings, initialFilters]);

  const confirmMultiGuestBooking = useCallback(async (id: string, processedBy?: string): Promise<ApproveBookingResponse> => {
    try {
      setActionLoading(`confirm-${id}`);
      setError(null);

      console.log('🔍 useBookings: Confirming multi-guest booking...', id);

      const result = await bookingApiService.confirmMultiGuestBooking(id, processedBy);
      
      // Clear students cache to ensure new students appear immediately
      const { studentsApiService } = await import('../services/studentsApiService');
      studentsApiService.clearCache();
      console.log('🔄 Cleared students cache in useBookings hook');
      
      // Refresh data
      await loadBookings(initialFilters);
      
      console.log('🔍 useBookings: Multi-guest booking confirmed successfully');
      return result;
    } catch (err) {
      console.error('Error confirming multi-guest booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm multi-guest booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, [loadBookings, initialFilters]);

  const cancelMultiGuestBooking = useCallback(async (id: string, reason: string, processedBy?: string): Promise<BookingRequest> => {
    try {
      setActionLoading(`cancel-${id}`);
      setError(null);

      console.log('🔍 useBookings: Cancelling multi-guest booking...', id, reason);

      const result = await bookingApiService.cancelMultiGuestBooking(id, reason, processedBy);
      
      // Refresh data
      await loadBookings(initialFilters);
      
      console.log('🔍 useBookings: Multi-guest booking cancelled successfully');
      return result;
    } catch (err) {
      console.error('Error cancelling multi-guest booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel multi-guest booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  }, [loadBookings, initialFilters]);

  const getMultiGuestBookings = useCallback(async (filters?: any): Promise<MultiGuestBooking[]> => {
    try {
      console.log('🔍 useBookings: Getting multi-guest bookings with filters:', filters);
      return await bookingApiService.getMultiGuestBookings(filters);
    } catch (err) {
      console.error('Error getting multi-guest bookings:', err);
      throw err;
    }
  }, []);

  // Guest management methods
  const getAllGuests = useCallback(async (): Promise<BookingGuest[]> => {
    try {
      console.log('🔍 useBookings: Getting all guests...');
      return await bookingApiService.getAllGuests();
    } catch (err) {
      console.error('Error getting all guests:', err);
      throw err;
    }
  }, []);

  const getGuestById = useCallback(async (guestId: string): Promise<BookingGuest | null> => {
    try {
      console.log('🔍 useBookings: Getting guest by ID:', guestId);
      return await bookingApiService.getGuestById(guestId);
    } catch (err) {
      console.error('Error getting guest by ID:', err);
      throw err;
    }
  }, []);

  const getActiveGuests = useCallback(async (): Promise<BookingGuest[]> => {
    try {
      console.log('🔍 useBookings: Getting active guests...');
      return await bookingApiService.getActiveGuests();
    } catch (err) {
      console.error('Error getting active guests:', err);
      throw err;
    }
  }, []);

  // Utility methods
  const isMultiGuestBooking = useCallback((booking: BookingRequest | MultiGuestBooking): boolean => {
    return bookingApiService.isMultiGuestBooking(booking);
  }, []);

  const isSingleGuestBooking = useCallback((booking: BookingRequest | MultiGuestBooking): boolean => {
    return bookingApiService.isSingleGuestBooking(booking);
  }, []);

  const getBookingTypeLabel = useCallback((booking: BookingRequest | MultiGuestBooking): string => {
    return bookingApiService.getBookingTypeLabel(booking);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadBookings(initialFilters);
  }, [loadBookings, initialFilters]);

  return {
    // Data
    bookings,
    multiGuestBookings,
    pendingBookings,
    bookingStats,
    
    // Loading states
    loading,
    statsLoading,
    pendingLoading,
    error,
    actionLoading,
    
    // Single guest booking actions (legacy compatibility)
    createBooking,
    updateBooking,
    approveBooking,
    rejectBooking,
    deleteBooking,
    
    // Multi-guest booking actions
    createMultiGuestBooking,
    confirmMultiGuestBooking,
    cancelMultiGuestBooking,
    getMultiGuestBookings,
    
    // Guest management
    getAllGuests,
    getGuestById,
    getActiveGuests,
    
    // Utility methods
    isMultiGuestBooking,
    isSingleGuestBooking,
    getBookingTypeLabel,
    
    // Data management
    loadBookings,
    refreshData,
  };
};