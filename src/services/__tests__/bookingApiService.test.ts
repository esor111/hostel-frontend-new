import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookingApiService } from '../bookingApiService';
import { apiService } from '../apiService';

// Mock the apiService
vi.mock('../apiService', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('BookingApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllBookings', () => {
    it('should fetch all bookings successfully', async () => {
      const mockBookings = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          address: '123 Main St',
          preferredRoomType: 'Single',
          checkInDate: '2024-01-15',
          emergencyContact: 'Jane Doe',
          emergencyPhone: '+1234567891',
          status: 'PENDING',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      (apiService.get as any).mockResolvedValue(mockBookings);

      const result = await bookingApiService.getAllBookings();

      expect(apiService.get).toHaveBeenCalledWith('/booking-requests');
      expect(result).toEqual(mockBookings);
    });

    it('should handle API response with data wrapper', async () => {
      const mockBookings = [{ id: '1', name: 'John Doe' }];
      const mockResponse = { data: mockBookings };

      (apiService.get as any).mockResolvedValue(mockResponse);

      const result = await bookingApiService.getAllBookings();

      expect(result).toEqual(mockBookings);
    });
  });

  describe('approveBooking', () => {
    it('should approve booking successfully', async () => {
      const mockResponse = {
        booking: { id: '1', status: 'APPROVED' },
        student: { id: 'student-1', name: 'John Doe' },
        assignedRoom: { id: 'room-1', roomNumber: '101' },
      };

      (apiService.post as any).mockResolvedValue(mockResponse);

      const result = await bookingApiService.approveBooking('1');

      expect(apiService.post).toHaveBeenCalledWith('/booking-requests/1/approve', {});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('rejectBooking', () => {
    it('should reject booking with reason', async () => {
      const mockBooking = {
        id: '1',
        status: 'REJECTED',
        rejectionReason: 'No available rooms',
      };

      (apiService.post as any).mockResolvedValue(mockBooking);

      const result = await bookingApiService.rejectBooking('1', 'No available rooms');

      expect(apiService.post).toHaveBeenCalledWith('/booking-requests/1/reject', {
        reason: 'No available rooms',
      });
      expect(result).toEqual(mockBooking);
    });
  });

  describe('createBooking', () => {
    it('should create new booking successfully', async () => {
      const bookingData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        preferredRoomType: 'Single',
        checkInDate: '2024-01-15',
        emergencyContact: 'Jane Doe',
        emergencyPhone: '+1234567891',
      };

      const mockResponse = {
        id: '1',
        ...bookingData,
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiService.post as any).mockResolvedValue(mockResponse);

      const result = await bookingApiService.createBooking(bookingData);

      expect(apiService.post).toHaveBeenCalledWith('/booking-requests', bookingData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getBookingStats', () => {
    it('should fetch booking statistics successfully', async () => {
      const mockStats = {
        totalBookings: 100,
        pendingBookings: 25,
        approvedBookings: 60,
        rejectedBookings: 15,
        todayBookings: 5,
        weeklyBookings: 20,
        monthlyBookings: 80,
      };

      (apiService.get as any).mockResolvedValue(mockStats);

      const result = await bookingApiService.getBookingStats();

      expect(apiService.get).toHaveBeenCalledWith('/booking-requests/stats');
      expect(result).toEqual(mockStats);
    });
  });
});