import { apiService } from './apiService';

export interface BookingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  requestDate: string;
  approvedDate?: string;
  assignedRoom?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface MultiGuestBooking {
  id: string;
  bookingReference: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: string;
  totalGuests: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  guests: Array<{
    id: string;
    guestName: string;
    bedId: string;
    status: string;
  }>;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
}

export interface ApprovalResult {
  success: boolean;
  message: string;
  bookingId: string;
  confirmedGuests?: number;
  createdStudents?: number;
  students?: any[];
  failedAssignments?: string[];
}

export class BookingApiService {
  private static instance: BookingApiService;

  static getInstance(): BookingApiService {
    if (!BookingApiService.instance) {
      BookingApiService.instance = new BookingApiService();
    }
    return BookingApiService.instance;
  }

  // Get all booking requests (unified endpoint)
  async getAllBookings(): Promise<(BookingRequest | MultiGuestBooking)[]> {
    return apiService.get<(BookingRequest | MultiGuestBooking)[]>('/booking-requests');
  }

  // Get booking request by ID
  async getBookingById(id: string): Promise<BookingRequest | MultiGuestBooking | null> {
    try {
      return await apiService.get<BookingRequest | MultiGuestBooking>(`/booking-requests/${id}`);
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  }

  // Approve booking request (unified endpoint)
  async approveBooking(bookingId: string, processedBy: string = 'admin'): Promise<ApprovalResult> {
    return apiService.post<ApprovalResult>(`/booking-requests/${bookingId}/approve`, {
      processedBy,
      createStudent: true
    });
  }

  // Confirm multi-guest booking
  async confirmMultiGuestBooking(bookingId: string, processedBy: string = 'admin'): Promise<ApprovalResult> {
    return apiService.post<ApprovalResult>(`/booking-requests/multi-guest/${bookingId}/confirm`, {
      processedBy
    });
  }

  // Reject booking request
  async rejectBooking(bookingId: string, reason: string, processedBy: string = 'admin'): Promise<any> {
    return apiService.post(`/booking-requests/${bookingId}/reject`, {
      reason,
      processedBy
    });
  }

  // Get booking statistics
  async getBookingStats(): Promise<BookingStats> {
    return apiService.get<BookingStats>('/booking-requests/stats');
  }

  // Create new booking request
  async createBookingRequest(requestData: any): Promise<BookingRequest> {
    return apiService.post<BookingRequest>('/booking-requests', requestData);
  }

  // Update booking status
  async updateBookingStatus(id: string, status: string, notes?: string): Promise<BookingRequest | null> {
    try {
      return await apiService.patch<BookingRequest>(`/booking-requests/${id}`, {
        status,
        ...(notes && { notes })
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      return null;
    }
  }

  // Filter requests by status
  async filterRequestsByStatus(status: string): Promise<(BookingRequest | MultiGuestBooking)[]> {
    const params = status === 'all' ? {} : { status };
    return apiService.get<(BookingRequest | MultiGuestBooking)[]>('/booking-requests', params);
  }

  // Additional methods needed by useBookings hook
  async createBooking(bookingData: any): Promise<BookingRequest> {
    return apiService.post<BookingRequest>('/booking-requests', bookingData);
  }

  async updateBooking(id: string, bookingData: any): Promise<BookingRequest> {
    return apiService.patch<BookingRequest>(`/booking-requests/${id}`, bookingData);
  }

  async deleteBooking(id: string): Promise<void> {
    return apiService.delete(`/booking-requests/${id}`);
  }

  async getPendingBookings(): Promise<BookingRequest[]> {
    return apiService.get<BookingRequest[]>('/booking-requests', { status: 'pending' });
  }

  async getMultiGuestBookings(filters?: any): Promise<MultiGuestBooking[]> {
    return apiService.get<MultiGuestBooking[]>('/booking-requests', { ...filters, type: 'multi' });
  }

  async createMultiGuestBooking(bookingData: any): Promise<MultiGuestBooking> {
    return apiService.post<MultiGuestBooking>('/booking-requests', bookingData);
  }

  async cancelMultiGuestBooking(id: string, reason: string, processedBy?: string): Promise<BookingRequest> {
    return apiService.post<BookingRequest>(`/booking-requests/${id}/cancel`, {
      reason,
      processedBy: processedBy || 'admin'
    });
  }

  async getAllGuests(): Promise<any[]> {
    return apiService.get<any[]>('/booking-requests/guests');
  }

  async getGuestById(guestId: string): Promise<any | null> {
    try {
      return await apiService.get<any>(`/booking-requests/guests/${guestId}`);
    } catch (error) {
      console.error('Error fetching guest:', error);
      return null;
    }
  }

  async getActiveGuests(): Promise<any[]> {
    return apiService.get<any[]>('/booking-requests/guests', { status: 'active' });
  }

  // Utility methods
  isMultiGuestBooking(booking: BookingRequest | MultiGuestBooking): boolean {
    // Check if it's a multi-guest booking entity (has contactName, contactEmail, contactPhone)
    // Even if totalGuests is 1, it's still a multi-guest booking entity
    return 'contactName' in booking && 'contactEmail' in booking && 'contactPhone' in booking;
  }

  isSingleGuestBooking(booking: BookingRequest | MultiGuestBooking): boolean {
    return !this.isMultiGuestBooking(booking);
  }

  getBookingTypeLabel(booking: BookingRequest | MultiGuestBooking): string {
    return this.isMultiGuestBooking(booking) ? 'Multi-Guest' : 'Single Guest';
  }
}

// Export singleton instance
export const bookingApiService = BookingApiService.getInstance();