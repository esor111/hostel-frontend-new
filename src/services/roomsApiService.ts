import { apiService } from './apiService';

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

      const response = await apiService.get('/rooms', Object.fromEntries(queryParams));
      console.log('✅ Rooms API response:', response);
      
      // The apiService already extracts the data, so response is the actual result
      let rooms = [];
      if (response && response.items) {
        rooms = response.items; // Direct access to items
      } else if (Array.isArray(response)) {
        rooms = response; // Fallback for direct array response
      } else {
        rooms = []; // Empty array if no items found
      }

      // Parse layout data for each room (same as getRoomById)
      rooms = rooms.map(room => {
        if (room.layout && typeof room.layout === 'string') {
          try {
            room.layout = JSON.parse(room.layout);
            console.log(`🎨 Parsed layout for room ${room.id}:`, room.layout);
          } catch (error) {
            console.warn(`Failed to parse room layout for room ${room.id}:`, error);
            room.layout = null;
          }
        }
        return room;
      });

      return rooms;
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      throw error;
    }
  },

  // Get room by ID
  async getRoomById(id: string) {
    try {
      console.log(`🏠 Fetching room ${id} from API...`);
      const response = await apiService.get(`/rooms/${id}`);
      console.log('✅ Room fetched successfully:', response);

      // The apiService already extracts the data, so response is the actual room data
      const roomData = response;

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
      console.log('📤 Room data received:', JSON.stringify(roomData, null, 2));

      // Transform layout data if present
      if (roomData.layout) {
        console.log('🎨 Layout data detected - Transforming for backend');
        console.log('📐 Original layout structure:', {
          hasElements: !!roomData.layout.elements,
          elementsCount: roomData.layout.elements?.length || 0,
          hasDimensions: !!roomData.layout.dimensions,
          hasTheme: !!roomData.layout.theme
        });
        
        // Log all elements before filtering
        if (roomData.layout.elements) {
          console.log('📋 All elements before filtering:', roomData.layout.elements.map(e => ({
            id: e.id,
            type: e.type,
            x: e.x,
            y: e.y
          })));
        }
        
        // Extract bed positions from elements
        const bedPositions = roomData.layout.elements?.filter(e =>
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
        })) || [];

        console.log(`🛏️ Extracted ${bedPositions.length} bed positions:`, bedPositions);

        // Extract furniture layout from elements
        const furnitureLayout = roomData.layout.elements?.filter(e =>
          e.type !== 'single-bed' && e.type !== 'bunk-bed'
        ).map(furniture => ({
          id: furniture.id,
          type: furniture.type,
          x: furniture.x,
          y: furniture.y,
          width: furniture.width,
          height: furniture.height,
          rotation: furniture.rotation
        })) || [];

        console.log(`🪑 Extracted ${furnitureLayout.length} furniture items:`, furnitureLayout);

        // Keep the original structure but add the extracted data
        roomData.layout = {
          ...roomData.layout, // Keep original layout data
          bedPositions: bedPositions,
          furnitureLayout: furnitureLayout,
          layoutType: roomData.layout.theme?.name || 'standard'
        };

        console.log('🔄 Transformed layout for backend:', JSON.stringify(roomData.layout, null, 2));
        console.log('📊 Final layout summary:', {
          bedPositions: bedPositions.length,
          furnitureLayout: furnitureLayout.length,
          totalElements: roomData.layout.elements?.length || 0
        });
      } else {
        console.log('⚠️ No layout data in roomData');
      }

      console.log('📤 Sending to backend - Final payload:', JSON.stringify(roomData, null, 2));
      const response = await apiService.post('/rooms', roomData);
      console.log('✅ Room created successfully');
      console.log('📥 Backend response:', response);
      return response; // apiService already extracts the data
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

        // Extract bed positions from elements
        const bedPositions = updates.layout.elements?.filter(e =>
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
        })) || [];

        // Extract furniture layout from elements
        const furnitureLayout = updates.layout.elements?.filter(e =>
          e.type !== 'single-bed' && e.type !== 'bunk-bed'
        ).map(furniture => ({
          id: furniture.id,
          type: furniture.type,
          x: furniture.x,
          y: furniture.y,
          width: furniture.width,
          height: furniture.height,
          rotation: furniture.rotation
        })) || [];

        // Keep the original structure but add the extracted data
        updates.layout = {
          ...updates.layout, // Keep original layout data
          bedPositions: bedPositions,
          furnitureLayout: furnitureLayout,
          layoutType: updates.layout.theme?.name || 'standard'
        };

        console.log('🔄 Transformed layout for backend:', updates.layout);
      }

      const response = await apiService.put(`/rooms/${id}`, updates);

      console.log('✅ Room updated successfully');
      console.log('📥 Backend response:', response);

      return response; // apiService already extracts the data
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
      const response = await apiService.put(`/rooms/${id}`, { status: 'Inactive' });
      console.log('✅ Room deleted successfully');
      return response; // apiService already extracts the data
    } catch (error) {
      console.error('❌ Error deleting room:', error);
      throw error;
    }
  },

  // Get available rooms
  async getAvailableRooms() {
    try {
      console.log('🏠 Fetching available rooms from API...');
      const response = await apiService.get('/rooms/available');
      console.log('✅ Available rooms fetched successfully');
      
      // The apiService already extracts the data
      if (response && response.items) {
        return response.items;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching available rooms:', error);
      throw error;
    }
  },

  // Get room statistics
  async getRoomStats() {
    try {
      console.log('📊 Fetching room statistics from API...');
      const response = await apiService.get('/rooms/stats');
      console.log('✅ Room stats fetched successfully');
      return response; // apiService already extracts the data
    } catch (error) {
      console.error('❌ Error fetching room stats:', error);
      throw error;
    }
  },

  // Assign student to room
  async assignStudentToRoom(roomId: string, studentId: string) {
    try {
      console.log(`🏠 Assigning student ${studentId} to room ${roomId}...`);
      const response = await apiService.post(`/rooms/${roomId}/assign`, { studentId });
      console.log('✅ Student assigned to room successfully');
      return response; // apiService already extracts the data
    } catch (error) {
      console.error('❌ Error assigning student to room:', error);
      throw error;
    }
  },

  // Vacate student from room
  async vacateStudentFromRoom(roomId: string, studentId: string) {
    try {
      console.log(`🏠 Vacating student ${studentId} from room ${roomId}...`);
      const response = await apiService.post(`/rooms/${roomId}/vacate`, { studentId });
      console.log('✅ Student vacated from room successfully');
      return response; // apiService already extracts the data
    } catch (error) {
      console.error('❌ Error vacating student from room:', error);
      throw error;
    }
  },

  // Schedule room maintenance
  async scheduleRoomMaintenance(roomId: string, maintenanceData: any) {
    try {
      console.log(`🔧 Scheduling maintenance for room ${roomId}...`);
      const response = await apiService.post(`/rooms/${roomId}/maintenance`, maintenanceData);
      console.log('✅ Room maintenance scheduled successfully');
      return response; // apiService already extracts the data
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