import { apiService } from './apiService';
import { FloorData, RoomData, BedData, CreateManualStudentDto } from '@/types/manualStudent';

export class ManualStudentApiService {
  private apiService = apiService;

  /**
   * Get available floors with bed statistics
   */
  async getAvailableFloors(): Promise<FloorData[]> {
    console.log('🏢 Fetching available floors...');
    
    const response = await this.apiService.get<any>('/students/manual-create/floors');
    
    console.log('🏢 Floors response:', response);
    
    // The apiService already extracts data.data, so response is the actual array
    if (Array.isArray(response)) {
      console.log('🏢 Floors data received:', response.length, 'floors');
      return response;
    }
    
    console.log('🏢 Unexpected response format:', response);
    return [];
  }

  /**
   * Get available rooms on a specific floor
   */
  async getRoomsByFloor(floor: number): Promise<RoomData[]> {
    console.log(`🏠 Fetching rooms for floor ${floor}...`);
    
    const response = await this.apiService.get<any>(`/students/manual-create/floors/${floor}/rooms`);
    
    console.log(`🏠 Rooms response for floor ${floor}:`, response);
    
    // The apiService already extracts data.data, so response is the actual array
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  }

  /**
   * Get available beds in a specific room
   */
  async getBedsByRoom(roomId: string): Promise<BedData[]> {
    console.log(`🛏️ Fetching beds for room ${roomId}...`);
    
    const response = await this.apiService.get<any>(`/students/manual-create/rooms/${roomId}/beds`);
    
    console.log(`🛏️ Beds response for room ${roomId}:`, response);
    
    // The apiService already extracts data.data, so response is the actual array
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  }

  /**
   * Create student manually with bed assignment
   */
  async createManualStudent(data: CreateManualStudentDto): Promise<any> {
    console.log('👤 Creating manual student:', data);
    
    const response = await this.apiService.post<any>('/students/manual-create', data);
    
    console.log('👤 Manual student creation response:', response);
    
    // The apiService already extracts data.data, so response is the actual data
    if (response) {
      return response;
    }
    
    throw new Error('Failed to create manual student');
  }
}

export const manualStudentApiService = new ManualStudentApiService();
