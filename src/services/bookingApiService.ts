import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { 
  BookingRequest, 
  CreateBookingRequest, 
  UpdateBookingRequest, 
  BookingStats,
  ApproveBookingResponse,
  RejectBookingRequest,
  MultiGuestBooking,
  CreateMultiGuestBookingDto,
  BookingGuest,
  isMultiGuestBooking,
  isSingleGuestBooking
} from '../types/api';

export class BookingApiService {
  private apiService = apiService;

  /**
   * Get all booking requests (unified system - includes both single and multi-guest)
   * Now returns MultiGuestBooking[] but maintains BookingRequest compatibility
   */
  async getAllBookings(): Promise<BookingRequest[]> {
    console.log('🔍 BookingApiService.getAllBookings called (unified system)');
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.LIST);

    const result = await this.apiService.get<{ items: BookingRequest[]; pagination: any }>(
      API_ENDPOINTS.BOOKINGS.LIST
    );
    
    console.log('🔍 Raw API result (unified system):', result);
    
    // API service handles response extraction, result is the actual data
    if (result && (result as any).items) {
      return (result as any).items;
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
    
    // API service handles response extraction, result is the actual data
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
    
    // API service handles response extraction, result is the actual data
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
    
    // API service handles response extraction, result is the actual data
    return result;
  }

  /**
   * Create unified booking request (supports both single and multi-guest)
   * Automatically creates multi-guest booking structure even for single guests
   */
  async createBooking(bookingData: CreateBookingRequest | CreateMultiGuestBookingDto): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.createBooking called with data:', bookingData);
    console.log('🔍 API endpoint:', API_ENDPOINTS.BOOKINGS.CREATE);

    // The unified backend expects multi-guest format, so transform if needed
    let unifiedBookingData: CreateMultiGuestBookingDto;
    
    // Check if it's already in multi-guest format
    if ('data' in bookingData && 'contactPerson' in bookingData.data && 'guests' in bookingData.data) {
      unifiedBookingData = bookingData as CreateMultiGuestBookingDto;
    } else {
      // Transform single guest booking to multi-guest format
      const singleBooking = bookingData as CreateBookingRequest;
      unifiedBookingData = {
        data: {
          contactPerson: {
            name: singleBooking.name,
            phone: singleBooking.phone,
            email: singleBooking.email || ''
          },
          guests: [{
            bedId: 'auto-assign', // Let backend handle bed assignment
            guestName: singleBooking.name,
            age: 18, // Default age, should be provided in actual usage
            gender: 'Male' as const, // Default gender, should be provided in actual usage
            idProofType: singleBooking.idProofType,
            idProofNumber: singleBooking.idProofNumber,
            emergencyContact: singleBooking.emergencyContact,
            notes: singleBooking.notes
          }],
          checkInDate: singleBooking.checkInDate,
          duration: singleBooking.duration,
          source: singleBooking.source || 'Direct',
          notes: singleBooking.notes,
          emergencyContact: singleBooking.emergencyContact
        }
      };
    }

    const result = await this.apiService.post<BookingRequest>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      unifiedBookingData
    );
    
    console.log('🔍 Raw API result:', result);
    
    // API service handles response extraction, result is the actual data
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
    
    // API service handles response extraction, result is the actual data
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
    
    // API service handles response extraction, result is the actual data
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

  // UNIFIED MULTI-GUEST BOOKING METHODS
  // These methods now work with the unified backend system

  /**
   * Create multi-guest booking (direct method for multi-guest bookings)
   */
  async createMultiGuestBooking(bookingData: CreateMultiGuestBookingDto): Promise<MultiGuestBooking> {
    console.log('🔍 BookingApiService.createMultiGuestBooking called with data:', bookingData);
    console.log('🔍 Using unified endpoint:', API_ENDPOINTS.BOOKINGS.CREATE);

    const result = await this.apiService.post<MultiGuestBooking>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      bookingData
    );
    
    console.log('🔍 Raw API result:', result);
    
    // API service handles response extraction, result is the actual data
    return result;
  }

  /**
   * Get all multi-guest bookings (unified endpoint)
   */
  async getMultiGuestBookings(filters?: any): Promise<MultiGuestBooking[]> {
    console.log('🔍 BookingApiService.getMultiGuestBookings called with filters:', filters);
    
    // Use unified endpoint - all bookings are now multi-guest format
    let endpoint = API_ENDPOINTS.BOOKINGS.LIST;
    if (filters) {
      const params = new URLSearchParams(filters).toString();
      endpoint += `?${params}`;
    }
    
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.get<{ items: MultiGuestBooking[]; pagination: any }>(endpoint);
    
    console.log('🔍 Raw API result:', result);
    
    // API service handles response extraction, result is the actual data
    if (result && (result as any).items) {
      return (result as any).items;
    }
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return [];
  }

  /**
   * Get multi-guest booking by ID (unified endpoint)
   */
  async getMultiGuestBookingById(id: string): Promise<MultiGuestBooking> {
    console.log('🔍 BookingApiService.getMultiGuestBookingById called with ID:', id);
    
    const endpoint = API_ENDPOINTS.BOOKINGS.BY_ID.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    const result = await this.apiService.get<MultiGuestBooking>(endpoint);
    
    console.log('🔍 Raw API result:', result);
    
    // API service handles response extraction, result is the actual data
    return result;
  }

  /**
   * Confirm/approve multi-guest booking (unified endpoint)
   */
  async confirmMultiGuestBooking(id: string, processedBy?: string): Promise<ApproveBookingResponse> {
    console.log('🔍 BookingApiService.confirmMultiGuestBooking called with ID:', id);
    
    // Use unified approve endpoint
    const endpoint = API_ENDPOINTS.BOOKINGS.APPROVE.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    // Include createStudent flag to ensure student profiles are created
    const approvalData = {
      createStudent: true,
      processedBy: processedBy || 'admin'
    };

    const result = await this.apiService.post<ApproveBookingResponse>(endpoint, approvalData);
    
    console.log('🔍 Raw API result:', result);
    
    // Clear students cache after confirming multi-guest booking
    const { studentsApiService } = await import('./studentsApiService');
    studentsApiService.clearCache();
    console.log('🔄 Cleared students cache after multi-guest booking confirmation');
    
    return result;
  }

  /**
   * Cancel/reject multi-guest booking (unified endpoint)
   */
  async cancelMultiGuestBooking(id: string, reason: string, processedBy?: string): Promise<BookingRequest> {
    console.log('🔍 BookingApiService.cancelMultiGuestBooking called with ID:', id, 'reason:', reason);
    
    // Use unified reject endpoint
    const endpoint = API_ENDPOINTS.BOOKINGS.REJECT.replace(':id', id);
    console.log('🔍 API endpoint:', endpoint);

    const rejectData: RejectBookingRequest = { reason };

    const result = await this.apiService.post<BookingRequest>(endpoint, rejectData);
    
    console.log('🔍 Raw API result:', result);
    
    return result;
  }

  /**
   * Get multi-guest booking statistics (unified endpoint)
   */
  async getMultiGuestBookingStats(): Promise<BookingStats> {
    console.log('🔍 BookingApiService.getMultiGuestBookingStats called');
    console.log('🔍 Using unified stats endpoint:', API_ENDPOINTS.BOOKINGS.STATS);

    const result = await this.apiService.get<BookingStats>(API_ENDPOINTS.BOOKINGS.STATS);
    
    console.log('🔍 Raw API result:', result);
    
    // API service handles response extraction, result is the actual data
    return result;
  }

  // UTILITY METHODS FOR UNIFIED BOOKING SYSTEM

  /**
   * Check if booking is multi-guest type
   */
  isMultiGuestBooking(booking: BookingRequest | MultiGuestBooking): boolean {
    return isMultiGuestBooking(booking);
  }

  /**
   * Check if booking is single-guest type
   */
  isSingleGuestBooking(booking: BookingRequest | MultiGuestBooking): boolean {
    return isSingleGuestBooking(booking);
  }

  /**
   * Get booking type label
   */
  getBookingTypeLabel(booking: BookingRequest | MultiGuestBooking): string {
    if (this.isMultiGuestBooking(booking)) {
      const guestCount = (booking as MultiGuestBooking).totalGuests || (booking as any).guests?.length || 0;
      return `Multi-Guest (${guestCount})`;
    }
    return 'Single Guest';
  }

  /**
   * Get all guests from bookings (unified method)
   */
  async getAllGuests(): Promise<BookingGuest[]> {
    try {
      const bookings = await this.getMultiGuestBookings();
      const allGuests: BookingGuest[] = [];
      
      bookings.forEach(booking => {
        if (booking.guests && Array.isArray(booking.guests)) {
          allGuests.push(...booking.guests);
        }
      });
      
      return allGuests;
    } catch (error) {
      console.error('Error fetching all guests:', error);
      throw error;
    }
  }

  /**
   * Get guest by ID (unified method)
   */
  async getGuestById(guestId: string): Promise<BookingGuest | null> {
    try {
      const allGuests = await this.getAllGuests();
      return allGuests.find(guest => guest.id === guestId) || null;
    } catch (error) {
      console.error('Error fetching guest by ID:', error);
      throw error;
    }
  }

  /**
   * Get active guests (confirmed status)
   */
  async getActiveGuests(): Promise<BookingGuest[]> {
    try {
      const allGuests = await this.getAllGuests();
      return allGuests.filter(guest => guest.status === 'Confirmed');
    } catch (error) {
      console.error('Error fetching active guests:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bookingApiService = new BookingApiService();