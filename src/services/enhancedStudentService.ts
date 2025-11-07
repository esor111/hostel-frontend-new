import { studentsApiService } from './studentsApiService';
import { multiGuestBookingApiService, BookingGuest } from './multiGuestBookingApiService';
import { Student } from '../types/api';

export interface EnhancedStudent extends Student {
  // Enhanced fields from booking-guests
  assignedRoomNumber?: string;
  assignedBedNumber?: string;
  actualCheckInDate?: string | null;
  actualCheckOutDate?: string | null;
  bookingId?: string;
  bedId?: string;
  age?: number;
  gender?: string;
  idProofType?: string | null;
  idProofNumber?: string | null;
  // Override room/bed info with booking data
  roomNumber?: string;
  bedNumber?: string;
}

export const enhancedStudentService = {
  async getEnhancedStudents(): Promise<EnhancedStudent[]> {
    try {
      // Get students from the regular API
      const studentsResponse = await studentsApiService.getAllStudents();
      const students = studentsResponse.data || [];

      // Get all booking guests
      const bookingGuests = await multiGuestBookingApiService.getAllGuests();

      // Create a map of guest data by email for quick lookup
      const guestMap = new Map<string, BookingGuest>();
      bookingGuests.forEach(guest => {
        // Try to match by name first (more reliable)
        if (guest.guestName) {
          guestMap.set(guest.guestName.toLowerCase(), guest);
        }
        // Also try email if available
        if (guest.email) {
          guestMap.set(guest.email.toLowerCase(), guest);
        }
      });

      // Enhance students with booking guest data
      const enhancedStudents: EnhancedStudent[] = students.map(student => {
        // Try to find matching guest by name first
        let matchingGuest = guestMap.get(student.name.toLowerCase());
        
        // If not found by name, try by email
        if (!matchingGuest && student.email) {
          matchingGuest = guestMap.get(student.email.toLowerCase());
        }

        if (matchingGuest) {
          return {
            ...student,
            // Override with booking guest data
            roomNumber: matchingGuest.assignedRoomNumber || student.roomNumber,
            bedNumber: matchingGuest.assignedBedNumber || student.bedNumber,
            // Additional booking guest fields
            assignedRoomNumber: matchingGuest.assignedRoomNumber,
            assignedBedNumber: matchingGuest.assignedBedNumber,
            actualCheckInDate: matchingGuest.actualCheckInDate,
            actualCheckOutDate: matchingGuest.actualCheckOutDate,
            bookingId: matchingGuest.bookingId,
            bedId: matchingGuest.bedId,
            age: matchingGuest.age,
            gender: matchingGuest.gender,
            idProofType: matchingGuest.idProofType,
            idProofNumber: matchingGuest.idProofNumber,
            // Override optional fields only if student doesn't have them
            guardianName: matchingGuest.guardianName || student.guardianName,
            guardianPhone: matchingGuest.guardianPhone || student.guardianPhone,
            course: matchingGuest.course || student.course,
            institution: matchingGuest.institution || student.institution,
            address: matchingGuest.address || student.address,
            emergencyContact: matchingGuest.emergencyContact || student.emergencyContact,
            // NEVER override core identity fields - always use student's real data
            phone: student.phone,  // Don't use booking guest's generated phone
            email: student.email,  // Don't use booking guest's generated email
          };
        }

        return student;
      });

      console.log('🔍 Enhanced Students Debug:', {
        totalStudents: students.length,
        totalGuests: bookingGuests.length,
        enhancedWithRoomInfo: enhancedStudents.filter(s => s.assignedRoomNumber).length,
        sampleEnhanced: enhancedStudents.slice(0, 3).map(s => ({
          name: s.name,
          originalRoom: students.find(orig => orig.id === s.id)?.roomNumber,
          enhancedRoom: s.roomNumber,
          assignedRoom: s.assignedRoomNumber,
          bedNumber: s.bedNumber
        }))
      });

      return enhancedStudents;
    } catch (error) {
      console.error('Error enhancing students with booking data:', error);
      // Fallback to regular students if enhancement fails
      const studentsResponse = await studentsApiService.getAllStudents();
      return studentsResponse.data || [];
    }
  },

  async getEnhancedStudentById(studentId: string): Promise<EnhancedStudent | null> {
    try {
      const enhancedStudents = await this.getEnhancedStudents();
      return enhancedStudents.find(s => s.id === studentId) || null;
    } catch (error) {
      console.error('Error getting enhanced student by ID:', error);
      return null;
    }
  },

  async getActiveEnhancedStudents(): Promise<EnhancedStudent[]> {
    try {
      const enhancedStudents = await this.getEnhancedStudents();
      return enhancedStudents.filter(s => s.status === 'Active');
    } catch (error) {
      console.error('Error getting active enhanced students:', error);
      return [];
    }
  }
};