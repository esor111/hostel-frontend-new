import { getEnvironmentConfig } from '../config/environment';

const API_BASE_URL = getEnvironmentConfig().apiBaseUrl;

// Helper function to handle API requests (following hostel-ladger-frontend pattern)
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // API returns different formats, handle in individual methods
  } catch (error) {
    console.error('Room API Request Error:', error);
    throw error;
  }
}

export const roomsApiService = {
  // Get all rooms
  async getRooms(filters = {}) {
    try {
      console.log('🏠 Fetching rooms from API...');
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const endpoint = `/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(endpoint);
      console.log('✅ Rooms API response:', response);
      return response.result?.items || []; // API returns { status, result: { items, pagination } }
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      throw error;
    }
  },

  // Get room by ID
  async getRoomById(id: string) {
    try {
      console.log(`🏠 Fetching room ${id} from API...`);
      const response = await apiRequest(`/rooms/${id}`);
      console.log('✅ Room fetched successfully:', response);

      // Handle different API response formats
      const roomData = response.room || response.result || response;

      // Parse layout if it exists and is a string
      if (roomData.layout && typeof roomData.layout === 'string') {
        try {
          roomData.layout = JSON.parse(roomData.layout);
        } catch (error) {
          console.warn('Failed to parse room layout:', error);
          roomData.layout = null;
        }
      }

      return roomData;
    } catch (error) {
      console.error('❌ Error fetching room by ID:', error);
      throw error;
    }
  },

  // Create new room
  async createRoom(roomData: any) {
    try {
      console.log('🏠 Creating new room via API...');
      console.log('📤 Room data:', roomData);

      // Transform layout data if present
      if (roomData.layout) {
        console.log('🎨 Layout data detected - Transforming for backend');
        const transformedLayout = {
          layoutData: roomData.layout, // Store complete layout as layoutData
          dimensions: roomData.layout.dimensions,
          bedPositions: roomData.layout.elements?.filter(e =>
            e.type === 'single-bed' || e.type === 'bunk-bed'
          ).map(bed => ({
            id: bed.id,
            type: bed.type,
            x: bed.x,
            y: bed.y,
            width: bed.width,
            height: bed.height,
            rotation: bed.rotation,
            properties: bed.properties
          })),
          furnitureLayout: roomData.layout.elements?.filter(e =>
            e.type !== 'single-bed' && e.type !== 'bunk-bed'
          ).map(furniture => ({
            id: furniture.id,
            type: furniture.type,
            x: furniture.x,
            y: furniture.y,
            width: furniture.width,
            height: furniture.height,
            rotation: furniture.rotation
          })),
          layoutType: roomData.layout.theme?.name || 'standard'
        };

        roomData.layout = transformedLayout;
      }

      const response = await apiRequest('/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData),
      });
      console.log('✅ Room created successfully');
      return response.newRoom || response; // API returns { status, newRoom }
    } catch (error) {
      console.error('❌ Error creating room:', error);
      throw error;
    }
  },

  // Update room
  async updateRoom(id: string, updates: any) {
    try {
      console.log(`🏠 Updating room ${id} via API...`);
      console.log('📤 Update data:', updates);

      // Transform layout data to match backend expectations
      if (updates.layout) {
        console.log('🎨 Layout update detected - Transforming data for backend');
        console.log('📤 Original layout data:', updates.layout);

        // Transform frontend layout format to backend format
        const transformedLayout = {
          layoutData: updates.layout, // Store complete layout as layoutData
          dimensions: updates.layout.dimensions,
          bedPositions: updates.layout.elements?.filter(e =>
            e.type === 'single-bed' || e.type === 'bunk-bed'
          ).map(bed => ({
            id: bed.id,
            type: bed.type,
            x: bed.x,
            y: bed.y,
            width: bed.width,
            height: bed.height,
            rotation: bed.rotation,
            properties: bed.properties
          })),
          furnitureLayout: updates.layout.elements?.filter(e =>
            e.type !== 'single-bed' && e.type !== 'bunk-bed'
          ).map(furniture => ({
            id: furniture.id,
            type: furniture.type,
            x: furniture.x,
            y: furniture.y,
            width: furniture.width,
            height: furniture.height,
            rotation: furniture.rotation
          })),
          layoutType: updates.layout.theme?.name || 'standard'
        };

        console.log('🔄 Transformed layout for backend:', transformedLayout);
        updates.layout = transformedLayout;
      }

      const response = await apiRequest(`/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      console.log('✅ Room updated successfully');
      console.log('📥 Backend response:', response);

      return response.updatedRoom || response; // API returns { status, updatedRoom }
    } catch (error) {
      console.error('❌ Error updating room:', error);
      throw error;
    }
  },

  // Delete room (marks as inactive)
  async deleteRoom(id: string) {
    try {
      console.log(`🗑️ Deleting room ${id} via API...`);
      // For now, we'll update the room status to 'Inactive' instead of deleting
      const response = await apiRequest(`/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Inactive' }),
      });
      console.log('✅ Room deleted successfully');
      return response.updatedRoom || response;
    } catch (error) {
      console.error('❌ Error deleting room:', error);
      throw error;
    }
  },

  // Get available rooms
  async getAvailableRooms() {
    try {
      console.log('🏠 Fetching available rooms from API...');
      const response = await apiRequest('/rooms/available');
      console.log('✅ Available rooms fetched successfully');
      return response.data?.items || []; // API returns { status, data: { items, count } }
    } catch (error) {
      console.error('❌ Error fetching available rooms:', error);
      throw error;
    }
  },

  // Get room statistics
  async getRoomStats() {
    try {
      console.log('📊 Fetching room statistics from API...');
      const response = await apiRequest('/rooms/stats');
      console.log('✅ Room stats fetched successfully');
      return response.stats || response; // API returns { status, stats }
    } catch (error) {
      console.error('❌ Error fetching room stats:', error);
      throw error;
    }
  },

  // Assign student to room
  async assignStudentToRoom(roomId: string, studentId: string) {
    try {
      console.log(`🏠 Assigning student ${studentId} to room ${roomId}...`);
      const response = await apiRequest(`/rooms/${roomId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
      console.log('✅ Student assigned to room successfully');
      return response.data || response;
    } catch (error) {
      console.error('❌ Error assigning student to room:', error);
      throw error;
    }
  },

  // Vacate student from room
  async vacateStudentFromRoom(roomId: string, studentId: string) {
    try {
      console.log(`🏠 Vacating student ${studentId} from room ${roomId}...`);
      const response = await apiRequest(`/rooms/${roomId}/vacate`, {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
      console.log('✅ Student vacated from room successfully');
      return response.data || response;
    } catch (error) {
      console.error('❌ Error vacating student from room:', error);
      throw error;
    }
  },

  // Schedule room maintenance
  async scheduleRoomMaintenance(roomId: string, maintenanceData: any) {
    try {
      console.log(`🔧 Scheduling maintenance for room ${roomId}...`);
      const response = await apiRequest(`/rooms/${roomId}/maintenance`, {
        method: 'POST',
        body: JSON.stringify(maintenanceData),
      });
      console.log('✅ Room maintenance scheduled successfully');
      return response.data || response;
    } catch (error) {
      console.error('❌ Error scheduling room maintenance:', error);
      throw error;
    }
  },

  // Search rooms
  async searchRooms(searchTerm: string, filters = {}) {
    try {
      console.log(`🔍 Searching rooms: ${searchTerm}`);
      return await this.getRooms({ search: searchTerm, ...filters });
    } catch (error) {
      console.error('❌ Error searching rooms:', error);
      throw error;
    }
  },

  // Filter rooms by status
  async filterRoomsByStatus(status: string) {
    try {
      console.log(`🔍 Filtering rooms by status: ${status}`);
      return await this.getRooms({ status });
    } catch (error) {
      console.error('❌ Error filtering rooms by status:', error);
      throw error;
    }
  },

  // Filter rooms by type
  async filterRoomsByType(type: string) {
    try {
      console.log(`🔍 Filtering rooms by type: ${type}`);
      return await this.getRooms({ type });
    } catch (error) {
      console.error('❌ Error filtering rooms by type:', error);
      throw error;
    }
  },

  // Get room occupants
  async getRoomOccupants(roomId: string) {
    try {
      console.log(`👥 Fetching occupants for room ${roomId}...`);
      const room = await this.getRoomById(roomId);
      return room.occupants || [];
    } catch (error) {
      console.error('❌ Error fetching room occupants:', error);
      throw error;
    }
  }
};