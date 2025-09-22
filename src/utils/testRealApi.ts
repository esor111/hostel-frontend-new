import { studentsApiService } from '../services/studentsApiService';

/**
 * Test script to validate real API connection
 * Run this to test against the actual NestJS server
 */
export const testRealApiConnection = async () => {
  console.log('🔍 Testing connection to real NestJS server...');
  
  try {
    // Test basic connectivity first
    console.log('1. Testing basic connectivity...');
    const baseResponse = await fetch('http://localhost:3001/hostel/api');
    console.log('Base API check:', baseResponse.ok ? '✅ OK' : '❌ Failed');
    
    // Test students endpoint
    console.log('2. Testing students endpoint...');
    const studentsResponse = await fetch('http://localhost:3001/hostel/api/v1/students');
    console.log('Students endpoint response:', studentsResponse.status, studentsResponse.statusText);
    
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      console.log('✅ Students API working! Response:', studentsData);
      
      // Test using our service
      console.log('3. Testing via our StudentsApiService...');
      const students = await studentsApiService.getStudents();
      console.log('✅ StudentsApiService working! Found', students.length, 'students');
      
      return {
        success: true,
        studentsCount: students.length,
        rawResponse: studentsData,
        sampleStudent: students[0]
      };
    } else {
      throw new Error(`Students API failed: ${studentsResponse.status} ${studentsResponse.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Real API connection failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Auto-run if in development mode
if (import.meta.env.DEV) {
  console.log('🚀 Real API test available. Call testRealApiConnection() in console.');
}