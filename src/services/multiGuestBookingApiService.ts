import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/hostel/api/v1';

export interface BookingGuest {
  id: string;
  createdAt: string;
  updatedAt: string;
  bookingId: string;
  bedId: string;
  guestName: string;
  age: number;
  gender: string;
  status: string;
  idProofType: string | null;
  idProofNumber: string | null;
  emergencyContact: string | null;
  notes: string | null;
  actualCheckInDate: string | null;
  actualCheckOutDate: string | null;
  assignedRoomNumber: string;
  assignedBedNumber: string;
  guardianName: string | null;
  guardianPhone: string | null;
  course: string | null;
  institution: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface MultiGuestBooking {
  id: string;
  createdAt: string;
  updatedAt: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  checkInDate: string | null;
  duration: string | null;
  status: string;
  notes: string | null;
  emergencyContact: string | null;
  source: string;
  totalGuests: number;
  confirmedGuests: number;
  bookingReference: string;
  processedBy: string;
  processedDate: string;
  cancellationReason: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  preferredRoom: string | null;
  course: string | null;
  institution: string | null;
  requestDate: string;
  address: string | null;
  idProofType: string | null;
  idProofNumber: string | null;
  approvedDate: string;
  rejectionReason: string | null;
  assignedRoom: string | null;
  priorityScore: number;
  guests: BookingGuest[];
}

export interface MultiGuestBookingResponse {
  status: number;
  data: {
    items: MultiGuestBooking[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export const multiGuestBookingApiService = {
  async getAllMultiGuestBookings(): Promise<MultiGuestBookingResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/booking-requests/multi-guest`);
      return response.data;
    } catch (error) {
      console.error('Error fetching multi-guest bookings:', error);
      throw error;
    }
  },

  async getGuestById(guestId: string): Promise<BookingGuest | null> {
    try {
      const response = await this.getAllMultiGuestBookings();
      
      for (const booking of response.data.items) {
        const guest = booking.guests.find(g => g.id === guestId);
        if (guest) {
          return guest;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching guest by ID:', error);
      throw error;
    }
  },

  async getAllGuests(): Promise<BookingGuest[]> {
    try {
      const response = await this.getAllMultiGuestBookings();
      const allGuests: BookingGuest[] = [];
      
      response.data.items.forEach(booking => {
        allGuests.push(...booking.guests);
      });
      
      return allGuests;
    } catch (error) {
      console.error('Error fetching all guests:', error);
      throw error;
    }
  },

  async getActiveGuests(): Promise<BookingGuest[]> {
    try {
      const allGuests = await this.getAllGuests();
      return allGuests.filter(guest => guest.status === 'Confirmed');
    } catch (error) {
      console.error('Error fetching active guests:', error);
      throw error;
    }
  }
};