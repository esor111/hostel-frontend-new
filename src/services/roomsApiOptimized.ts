import { apiService } from './apiService';

// Helper function to get hostelId from auth context
const getHostelId = (): string | null => {
  try {
    const selectedBusinessData = localStorage.getItem('kaha_selected_business');
    if (selectedBusinessData) {
      const selectedBusiness = JSON.parse(selectedBusinessData);
      return selectedBusiness.id;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get hostelId from auth context:', error);
    return null;
  }
};

// OPTIMIZED rooms API service with separate endpoints for better performance
export const roomsApiOptimized = {
  // FAST: Get lightweight room list for UI cards (no layout/bed data)
  async getRoomsLightweight(filters = {}, hostelId?: string) {
    try {
      console.log('🚀 Fetching lightweight rooms from optimized API...');
      const queryParams = new URLSearchParams();

      // Add hostelId to query parameters
      const effectiveHostelId = hostelId || getHostelId();
      if (effectiveHostelId) {
        queryParams.append('hostelId', effectiveHostelId);
        console.log('🏨 Added hostelId to lightweight query:', effectiveHostelId);
      }

      // Add filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      console.log('📤 Lightweight query params:', Object.fromEntries(queryParams));
      const response = await apiService.get('/rooms-optimized/lightweight', Object.fromEntries(queryParams));
      console.log('✅ Lightweight rooms API response:', response);

      // Extract rooms from response
      let rooms = [];
      if (response && response.items) {
        rooms = response.items;
      } else if (Array.isArray(response)) {
        rooms = response;
      } else {
        rooms = [];
      }

      return rooms;
    } catch (error) {
      console.error('❌ Error fetching lightweight rooms:', error);
      throw error;
    }
  },

  // SEPARATE: Get room layout data for design view only when needed
  async getRoomLayout(roomId: string, hostelId?: string) {
    try {
      console.log(`🎨 Fetching layout for room ${roomId} from optimized API...`);
      
      const queryParams = new URLSearchParams();
      const effectiveHostelId = hostelId || getHostelId();
      if (effectiveHostelId) {
        queryParams.append('hostelId', effectiveHostelId);
      }

      const response = await apiService.get(`/rooms-optimized/${roomId}/layout`, Object.fromEntries(queryParams));
      console.log('✅ Room layout fetched:', response);

      return response;
    } catch (error) {
      console.error('❌ Error fetching room layout:', error);
      throw error;
    }
  },

  // FAST: Get bed status for quick checks
  async getRoomBedStatus(roomId: string, hostelId?: string) {
    try {
      console.log(`🛏️ Fetching bed status for room ${roomId} from optimized API...`);
      
      const queryParams = new URLSearchParams();
      const effectiveHostelId = hostelId || getHostelId();
      if (effectiveHostelId) {
        queryParams.append('hostelId', effectiveHostelId);
      }

      const response = await apiService.get(`/rooms-optimized/${roomId}/bed-status`, Object.fromEntries(queryParams));
      console.log('✅ Room bed status fetched:', response);

      return response;
    } catch (error) {
      console.error('❌ Error fetching room bed status:', error);
      throw error;
    }
  }
};