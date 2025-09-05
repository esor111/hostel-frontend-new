import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { 
  BookingRequest, 
  CreateBookingRequest, 
  UpdateBookingRequest, 
  BookingStats,
  ApproveBookingResponse,
  RejectBookingRequest
} from '../types/api';

export class BookingApiService {
  private apiService = apiService;

  /**
   * Get all booking requests (now served by unified MultiGuestBookingService)
   */
  async getAllBookings(): Promise<BookingRequest[]> {
    console.log('🔍 BookingApiService.getAllBookings called (unified system)');
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.LIST);

    const result = await this.apiService.get<{ items: BookingRequest[]; pagination: any }>(
      API_ENDPOINTS.BOOKINGS.LIST
    );
    
    console.log('🔍 Raw API result (unified system):', result);
    
    // Handle unified system response structure - maintains backward compatibility
    if (result && result.data && result.data.items) {
      return result.data.items;
    }
    
    // Handle direct items response
    if (result && result.items) {
      return result.items;
    }
    
    // Fallback for different response structures
    if (Array.isArray(result)) {
      return result;
    }
    
    return [];
  }

  /**
   * Get booking statistics (now includes single and multi-guest bookings)
   */
  async getBookingStats(): Promise<BookingStats> {
    console.log('🔍 BookingApiService.getBookingStats called (unified system)');
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.STATS);

    const result = await this.apiService.get<BookingStats>(
      API_ENDPOINTS.BOOKINGS.STATS
    );
    
    console.log('🔍 Raw API result (unified system):', result);
    
    // Handle unified system response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Get pending booking requests (now includes both single and multi-guest)
   */
  async getPendingBookings(): Promise<BookingRequest[]> {
    console.log('🔍 BookingApiService.getPendingBookings called (unified system)');
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.PENDING);

    const result = await this.apiService.get<BookingRequest[]>(
      API_ENDPOINTS.BOOKINGS.PENDING
    );
    
    console.log('🔍 Raw API result (unified system):', result);
    
    // Handle unified system response structure
    if (result && result.data && Array.isArray(result.data)) {
      return result.data;
    }
    
    // Handle direct array response
    if (Array.isArray(result)) {
      return result;
    }
    
    return [];
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.getBookingById called with ID:', id);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.BY_ID.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.get<BookingRequest>(endpoint);
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Create new booking request
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.createBooking called with data:', bookingData);
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.CREATE);

    const result = await this.apiService.post<BookingRequest>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      bookingData
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Update booking request
   */
  async updateBooking(id: string, bookingData: UpdateBookingRequest): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.updateBooking called with ID:', id, 'data:', bookingData);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.UPDATE.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.put<BookingRequest>(endpoint, bookingData);
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Approve booking request
   */
  async approveBooking(id: string): Promise<ApproveBookingResponse> {
    console.log('🔍 BookingApiService.approveBooking called with ID:', id);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.APPROVE.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    // Include createStudent flag to ensure student profiles are created
    const approvalData = {
      createStudent: true,
      processedBy: 'admin'
    };
    
    console.log('🔍 Approval data:', approvalData);

    const result = await this.apiService.post<ApproveBookingResponse>(
      endpoint,
      approvalData
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Clear students cache after approving booking to ensure newly created students appear
    const { studentsApiService } = await import('./studentsApiService');
    studentsApiService.clearCache();
    console.log('🔄 Cleared students cache after booking approval');
    
    return result;
  }

  /**
   * Reject booking request
   */
  async rejectBooking(id: string, reason: string): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.rejectBooking called with ID:', id, 'reason:', reason);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.REJECT.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    const rejectData: RejectBookingRequest = { reason };

    const result = await this.apiService.post<BookingRequest>(endpoint, rejectData);
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Delete booking request (if needed)
   */
  async deleteBooking(id: string): Promise<void> {
    console.log('🔍 BookingApiService.deleteBooking called with ID:', id);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.BY_ID.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    await this.apiService.delete(endpoint);
    
    console.log('🔍 Booking deleted successfully');
  }

  // Multi-Guest Booking Methods

  /**
   * Create multi-guest booking
   */
  async createMultiGuestBooking(bookingData: any): Promise<any> {
    console.log('🔍 BookingApiService.createMultiGuestBooking called with data:', bookingData);
    console.log('🔍 API endpoint: /booking-requests/multi-guest');

    const result = await this.apiService.post<any>(
      '/booking-requests/multi-guest',
      bookingData
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Get all multi-guest bookings
   */
  async getMultiGuestBookings(filters?: any): Promise<any[]> {
    console.log('🔍 BookingApiService.getMultiGuestBookings called with filters:', filters);
    
    let endpoint = '/booking-requests/multi-guest';
    if (filters) {
      const params = new URLSearchParams(filters).toString();
      endpoint += `?${params}`;
    }
    
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.get<{ items: any[]; pagination: any }>(endpoint);
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result && result.data && result.data.items) {
      return result.data.items;
    }
    
    if (result && result.items) {
      return result.items;
    }
    
    return [];
  }

  /**
   * Get multi-guest booking by ID
   */
  async getMultiGuestBookingById(id: string): Promise<any> {
    console.log('🔍 BookingApiService.getMultiGuestBookingById called with ID:', id);
    
    const endpoint = `/booking-requests/multi-guest/${id}`;
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.get<any>(endpoint);
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Confirm multi-guest booking
   */
  async confirmMultiGuestBooking(id: string, processedBy?: string): Promise<any> {
    console.log('🔍 BookingApiService.confirmMultiGuestBooking called with ID:', id);
    
    const endpoint = `/booking-requests/multi-guest/${id}/confirm`;
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.post<any>(endpoint, { processedBy });
    
    console.log('🔍 Raw API result:', result);
    
    // Clear students cache after confirming multi-guest booking
    // This ensures the frontend shows newly created students in pending configuration
    const { studentsApiService } = await import('./studentsApiService');
    studentsApiService.clearCache();
    console.log('🔄 Cleared students cache after multi-guest booking confirmation');
    
    return result;
  }

  /**
   * Cancel multi-guest booking
   */
  async cancelMultiGuestBooking(id: string, reason: string, processedBy?: string): Promise<any> {
    console.log('🔍 BookingApiService.cancelMultiGuestBooking called with ID:', id, 'reason:', reason);
    
    const endpoint = `/booking-requests/multi-guest/${id}/cancel`;
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.post<any>(endpoint, { reason, processedBy });
    
    console.log('🔍 Raw API result:', result);
    
    return result;
  }

  /**
   * Get multi-guest booking statistics
   */
  async getMultiGuestBookingStats(): Promise<any> {
    console.log('🔍 BookingApiService.getMultiGuestBookingStats called');
    console.log('🔍 API endpoint: /booking-requests/multi-guest/stats');

    const result = await this.apiService.get<any>('/booking-requests/multi-guest/stats');
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure
    if (result.data) {
      return result.data;
    }
    
    return result;
  }

  /**
   * Check if booking is multi-guest type
   */
  isMultiGuestBooking(booking: any): boolean {
    return booking.totalGuests > 1 || booking.guests?.length > 1;
  }

  /**
   * Get booking type label
   */
  getBookingTypeLabel(booking: any): string {
    if (this.isMultiGuestBooking(booking)) {
      const guestCount = booking.totalGuests || booking.guests?.length || 0;
      return `Multi-Guest (${guestCount})`;
    }
    return 'Single Guest';
  }
}

// Export singleton instance
export const bookingApiService = new BookingApiService();