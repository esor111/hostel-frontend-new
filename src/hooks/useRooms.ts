import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { roomsApiService } from '../services/roomsApiService';

export interface Room {
  id: string;
  name: string;
  type: string;
  bedCount: number;
  occupancy: number;
  gender: string;
  monthlyRate: number;
  dailyRate: number;
  amenities: string[];
  status: string;
  layout: any;
  floor: string;
  roomNumber: string;
  occupants: any[];
  availableBeds: number;
  lastCleaned: string | null;
  maintenanceStatus: string;
  pricingModel: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomStats {
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
  inactiveRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
}

export interface CreateRoomData {
  name: string;
  roomNumber: string;
  type: string;
  capacity: number;
  rent: number;
  status?: string;
  amenities?: string[];
  isActive?: boolean;
  description?: string;
  gender?: string;
}

export interface UpdateRoomData {
  name?: string;
  roomNumber?: string;
  type?: string;
  capacity?: number;
  rent?: number;
  status?: string;
  amenities?: string[];
  description?: string;
  gender?: string;
  layout?: any;
}

export const useRooms = () => {
  // State management (following hostel-ladger-frontend pattern)
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  // Fetch rooms from API
  const fetchRooms = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏠 Fetching rooms from API...');
      const roomsData = await roomsApiService.getRooms(filters);
      console.log('✅ Rooms fetched:', roomsData);
      
      // Parse numeric fields and layout (API returns strings)
      const parsedRooms = roomsData.map((room: any) => {
        let parsedLayout = null;
        
        // Parse layout if it exists
        if (room.layout) {
          try {
            // Handle different layout formats from backend
            if (typeof room.layout === 'string') {
              // If it's a string, try to parse it as JSON
              parsedLayout = JSON.parse(room.layout);
            } else if (typeof room.layout === 'object' && room.layout !== null) {
              // Backend returns layout as layoutData field, extract it
              parsedLayout = room.layout.layoutData || room.layout;
              
              // If layoutData doesn't exist, reconstruct from separate fields
              if (!room.layout.layoutData && (room.layout.dimensions || room.layout.bedPositions || room.layout.furnitureLayout)) {
                parsedLayout = {
                  dimensions: room.layout.dimensions,
                  elements: [
                    ...(room.layout.bedPositions || []),
                    ...(room.layout.furnitureLayout || [])
                  ],
                  theme: {
                    name: room.layout.layoutType || 'Default',
                    wallColor: '#e5e7eb',
                    floorColor: '#f8f9fa'
                  },
                  createdAt: room.layout.createdAt || new Date().toISOString()
                };
              }
              
              // Handle nested string objects (PowerShell format issue)
              if (parsedLayout && parsedLayout.dimensions && typeof parsedLayout.dimensions === 'string') {
                try {
                  // Parse dimensions if they're in string format like "@{width=8; height=3; length=10}"
                  const dimensionsStr = parsedLayout.dimensions.replace(/@{|}/g, '');
                  const dimensionsPairs = dimensionsStr.split(';').map(pair => pair.trim().split('='));
                  const dimensionsObj = {};
                  dimensionsPairs.forEach(([key, value]) => {
                    if (key && value) {
                      dimensionsObj[key.trim()] = parseInt(value.trim()) || 0;
                    }
                  });
                  parsedLayout.dimensions = dimensionsObj;
                } catch (error) {
                  console.warn('Failed to parse dimensions string:', error);
                }
              }
            }
          } catch (error) {
            console.warn(`Failed to parse layout for room ${room.id}:`, error);
            parsedLayout = null;
          }
        }
        
        return {
          ...room,
          monthlyRate: parseFloat(room.monthlyRate) || 0,
          dailyRate: parseFloat(room.dailyRate) || 0,
          bedCount: parseInt(room.bedCount) || 0,
          occupancy: parseInt(room.occupancy) || 0,
          availableBeds: parseInt(room.availableBeds) || 0,
          layout: parsedLayout, // Properly parsed layout object
        };
      });
      
      setRooms(parsedRooms);
    } catch (error: any) {
      console.error('❌ Error fetching rooms:', error);
      setError('Failed to load rooms. Please try again.');
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch room statistics
  const fetchRoomStats = async () => {
    try {
      console.log('📊 Fetching room statistics...');
      const statsData = await roomsApiService.getRoomStats();
      console.log('✅ Room stats fetched:', statsData);
      setStats(statsData);
    } catch (error: any) {
      console.error('❌ Error fetching room stats:', error);
      toast.error('Failed to load room statistics');
    }
  };

  // Fetch available rooms
  const fetchAvailableRooms = async () => {
    try {
      console.log('🏠 Fetching available rooms...');
      const availableData = await roomsApiService.getAvailableRooms();
      console.log('✅ Available rooms fetched:', availableData);
      
      // Parse numeric fields
      const parsedAvailable = availableData.map((room: any) => ({
        ...room,
        monthlyRate: parseFloat(room.monthlyRate) || 0,
        dailyRate: parseFloat(room.dailyRate) || 0,
        bedCount: parseInt(room.bedCount) || 0,
        occupancy: parseInt(room.occupancy) || 0,
        availableBeds: parseInt(room.availableBeds) || 0,
      }));
      
      setAvailableRooms(parsedAvailable);
    } catch (error: any) {
      console.error('❌ Error fetching available rooms:', error);
      toast.error('Failed to load available rooms');
    }
  };

  // Create new room
  const createRoom = async (roomData: CreateRoomData) => {
    try {
      console.log('🏠 Creating new room...');
      const createdRoom = await roomsApiService.createRoom(roomData);
      console.log('✅ Room created:', createdRoom);
      
      // Refresh rooms list
      await fetchRooms();
      await fetchRoomStats();
      
      toast.success('Room created successfully!');
      return createdRoom;
    } catch (error: any) {
      console.error('❌ Error creating room:', error);
      const errorMessage = error.message || 'Failed to create room. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update room
  const updateRoom = async (roomId: string, updates: UpdateRoomData) => {
    try {
      console.log(`🏠 Updating room ${roomId}...`);
      
      const updatedRoom = await roomsApiService.updateRoom(roomId, updates);
      console.log('✅ Room updated:', updatedRoom);
      
      // Refresh rooms list
      await fetchRooms();
      await fetchRoomStats();
      
      // Show appropriate success message based on update type
      if (updates.layout) {
        toast.success('Room layout saved successfully!', {
          description: 'Complete layout with elements and theme has been saved.',
        });
      } else {
        toast.success('Room updated successfully!');
      }
      
      return updatedRoom;
    } catch (error: any) {
      console.error('❌ Error updating room:', error);
      const errorMessage = error.message || 'Failed to update room. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete room
  const deleteRoom = async (roomId: string) => {
    try {
      console.log(`🗑️ Deleting room ${roomId}...`);
      await roomsApiService.deleteRoom(roomId);
      console.log('✅ Room deleted');
      
      // Refresh rooms list
      await fetchRooms();
      await fetchRoomStats();
      
      toast.success('Room deleted successfully!');
    } catch (error: any) {
      console.error('❌ Error deleting room:', error);
      const errorMessage = error.message || 'Failed to delete room. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Assign student to room
  const assignStudentToRoom = async (roomId: string, studentId: string) => {
    try {
      console.log(`👤 Assigning student ${studentId} to room ${roomId}...`);
      const result = await roomsApiService.assignStudentToRoom(roomId, studentId);
      console.log('✅ Student assigned to room');
      
      // Refresh rooms list
      await fetchRooms();
      await fetchRoomStats();
      
      toast.success('Student assigned to room successfully!');
      return result;
    } catch (error: any) {
      console.error('❌ Error assigning student to room:', error);
      const errorMessage = error.message || 'Failed to assign student to room.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Vacate student from room
  const vacateStudentFromRoom = async (roomId: string, studentId: string) => {
    try {
      console.log(`👤 Vacating student ${studentId} from room ${roomId}...`);
      const result = await roomsApiService.vacateStudentFromRoom(roomId, studentId);
      console.log('✅ Student vacated from room');
      
      // Refresh rooms list
      await fetchRooms();
      await fetchRoomStats();
      
      toast.success('Student vacated from room successfully!');
      return result;
    } catch (error: any) {
      console.error('❌ Error vacating student from room:', error);
      const errorMessage = error.message || 'Failed to vacate student from room.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Schedule room maintenance
  const scheduleRoomMaintenance = async (roomId: string, maintenanceData: any) => {
    try {
      console.log(`🔧 Scheduling maintenance for room ${roomId}...`);
      const result = await roomsApiService.scheduleRoomMaintenance(roomId, maintenanceData);
      console.log('✅ Room maintenance scheduled');
      
      // Refresh rooms list
      await fetchRooms();
      await fetchRoomStats();
      
      toast.success('Room maintenance scheduled successfully!');
      return result;
    } catch (error: any) {
      console.error('❌ Error scheduling room maintenance:', error);
      const errorMessage = error.message || 'Failed to schedule room maintenance.';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Search rooms
  const searchRooms = async (searchTerm: string, filters = {}) => {
    try {
      console.log(`🔍 Searching rooms: ${searchTerm}`);
      const searchResults = await roomsApiService.searchRooms(searchTerm, filters);
      
      // Parse numeric fields
      const parsedResults = searchResults.map((room: any) => ({
        ...room,
        monthlyRate: parseFloat(room.monthlyRate) || 0,
        dailyRate: parseFloat(room.dailyRate) || 0,
        bedCount: parseInt(room.bedCount) || 0,
        occupancy: parseInt(room.occupancy) || 0,
        availableBeds: parseInt(room.availableBeds) || 0,
      }));
      
      setRooms(parsedResults);
      return parsedResults;
    } catch (error: any) {
      console.error('❌ Error searching rooms:', error);
      toast.error('Failed to search rooms');
      throw error;
    }
  };

  // Filter rooms by status
  const filterRoomsByStatus = async (status: string) => {
    try {
      console.log(`🔍 Filtering rooms by status: ${status}`);
      await fetchRooms({ status });
    } catch (error: any) {
      console.error('❌ Error filtering rooms by status:', error);
      toast.error('Failed to filter rooms');
    }
  };

  // Filter rooms by type
  const filterRoomsByType = async (type: string) => {
    try {
      console.log(`🔍 Filtering rooms by type: ${type}`);
      await fetchRooms({ type });
    } catch (error: any) {
      console.error('❌ Error filtering rooms by type:', error);
      toast.error('Failed to filter rooms');
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([
      fetchRooms(),
      fetchRoomStats(),
      fetchAvailableRooms()
    ]);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRooms();
    fetchRoomStats();
    fetchAvailableRooms();
  }, []);

  return {
    // State
    rooms,
    loading,
    error,
    stats,
    availableRooms,
    
    // Actions
    fetchRooms,
    fetchRoomStats,
    fetchAvailableRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    assignStudentToRoom,
    vacateStudentFromRoom,
    scheduleRoomMaintenance,
    searchRooms,
    filterRoomsByStatus,
    filterRoomsByType,
    refreshData,
    
    // Utilities
    refetch: fetchRooms,
    invalidateCache: refreshData,
  };
};