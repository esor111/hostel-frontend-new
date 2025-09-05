// Test utility to verify enhanced student service
import { enhancedStudentService } from '../services/enhancedStudentService';

export const testEnhancedStudents = async () => {
  try {
    console.log('🧪 Testing Enhanced Student Service...');
    
    const enhancedStudents = await enhancedStudentService.getEnhancedStudents();
    
    console.log('📊 Enhanced Students Results:', {
      totalStudents: enhancedStudents.length,
      studentsWithRoomInfo: enhancedStudents.filter(s => s.assignedRoomNumber).length,
      studentsWithBedInfo: enhancedStudents.filter(s => s.assignedBedNumber).length,
      sampleStudents: enhancedStudents.slice(0, 3).map(s => ({
        name: s.name,
        originalRoom: s.roomNumber,
        assignedRoom: s.assignedRoomNumber,
        assignedBed: s.assignedBedNumber,
        hasEnhancedData: !!(s.assignedRoomNumber || s.assignedBedNumber)
      }))
    });
    
    return enhancedStudents;
  } catch (error) {
    console.error('❌ Enhanced Student Service Test Failed:', error);
    throw error;
  }
};

// Call this in browser console to test: testEnhancedStudents()
(window as any).testEnhancedStudents = testEnhancedStudents;