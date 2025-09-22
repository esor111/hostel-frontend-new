import { API_BASE_URL, apiClient } from './apiClient';

export interface MyBookingDetail {
  roomInfo: {
    id: string;
    name: string;
    roomNumber: string;
    gender: string;
    monthlyRate: number;
  };
  bedInfo: {
    id: string;
    bedNumber: string;
    bedType: string;
    isOccupied: boolean;
  };
  guestInfo: {
    id: string;
    guestName: string;
    phone: string;
    email: string;
    age: number;
    gender: string;
    status: string;
  };
}

export interface MyBooking {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';
  userEmail: string;
  hostelInfo: {
    name: string;
    address: string;
    contactPhone: string;
    contactEmail: string;
  };
  details: MyBookingDetail[];
}

export interface MyBookingsResponse {
  data: MyBooking[];
  userEmail: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetMyBookingsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';
}

export interface CancelBookingParams {
  reason: string;
}

class MyBookingsApiService {
  private baseUrl = `${API_BASE_URL}/booking-requests`;

  /**
   * Get current user's bookings
   * In production: JWT token will be automatically included
   * In development: requires user-email header
   */
  async getMyBookings(params: GetMyBookingsParams = {}): Promise<MyBookingsResponse> {
    const { page = 1, limit = 20, status } = params;
    
    // TODO: In production, remove this and use JWT token
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });

    const response = await apiClient.get(
      `${this.baseUrl}/my-bookings?${queryParams}`,
      {
        headers: {
          // TODO: In production, replace with JWT authorization
          'user-email': userEmail
        }
      }
    );

    return response.data;
  }

  /**
   * Cancel a user's booking
   * In production: JWT token will be automatically included
   * In development: requires user-email header
   */
  async cancelMyBooking(bookingId: string, params: CancelBookingParams): Promise<any> {
    // TODO: In production, remove this and use JWT token
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

    const response = await apiClient.post(
      `${this.baseUrl}/my-bookings/${bookingId}/cancel`,
      params,
      {
        headers: {
          // TODO: In production, replace with JWT authorization
          'user-email': userEmail
        }
      }
    );

    return response.data;
  }

  /**
   * Filter bookings by status
   */
  async getBookingsByStatus(status: MyBooking['status']): Promise<MyBookingsResponse> {
    return this.getMyBookings({ status });
  }

  /**
   * Get booking pagination info
   */
  async getBookingsPage(page: number, limit: number = 20): Promise<MyBookingsResponse> {
    return this.getMyBookings({ page, limit });
  }
}

export const myBookingsApiService = new MyBookingsApiService();
export default myBookingsApiService;
