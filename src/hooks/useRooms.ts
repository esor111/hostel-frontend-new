import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { roomsApiService } from '../services/roomsApiService';
import { roomsApiOptimized } from '../services/roomsApiOptimized';

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

// Helper function to calculate bed count from layout
const calculateBedCountFromLayout = (layout: any): number => {
  if (!layout || !layout.elements) {
    return 0;
  }

  const bedElements = layout.elements.filter((element: any) =>
    element.type === 'single-bed' || element.type === 'bunk-bed'
  );

  return bedElements.reduce((count: number, element: any) => {
    if (element.type === 'bunk-bed') {
      return count + (element.properties?.bunkLevels || 2);
    }
    return count + 1;
  }, 0);
};

export const useRooms = () => {
  // State management (following hostel-ladger-frontend pattern)
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  // Fetch rooms from API - OPTIMIZED VERSION
  const fetchRooms = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Fetching lightweight rooms from optimized API...');
      const roomsData = await roomsApiOptimized.getRoomsLightweight(filters);
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

        // Calculate actual bed count from layout if available
        let actualBedCount = parseInt(room.bedCount) || 0;
        let actualAvailableBeds = parseInt(room.availableBeds) || 0;

        if (parsedLayout && parsedLayout.elements) {
          // Count beds from layout elements
          const bedElements = parsedLayout.elements.filter((element: any) =>
            element.type === 'single-bed' || element.type === 'bunk-bed'
          );

          // Calculate total beds considering bunk beds have multiple levels
          actualBedCount = bedElements.reduce((count: number, element: any) => {
            if (element.type === 'bunk-bed') {
              return count + (element.properties?.bunkLevels || 2);
            }
            return count + 1;
          }, 0);

          // Recalculate available beds based on actual bed count and occupancy
          const occupancy = parseInt(room.occupancy) || 0;
          actualAvailableBeds = Math.max(0, actualBedCount - occupancy);
        }

        // Parse amenities to handle both string and object formats
        let parsedAmenities = room.amenities || [];
        if (Array.isArray(parsedAmenities)) {
          // Ensure amenities are in a consistent format
          parsedAmenities = parsedAmenities.map((amenity: any) => {
            if (typeof amenity === 'string') {
              return amenity;
            } else if (typeof amenity === 'object' && amenity !== null) {
              // If amenity is an object, extract the name or description
              return amenity.name || amenity.description || 'Unknown Amenity';
            }
            return 'Unknown Amenity';
          });
        }

        return {
          ...room,
          monthlyRate: parseFloat(room.monthlyRate) || 0,
          dailyRate: parseFloat(room.dailyRate) || 0,
          bedCount: actualBedCount, // Use calculated bed count from layout
          occupancy: parseInt(room.occupancy) || 0,
          availableBeds: actualAvailableBeds, // Use calculated available beds
          layout: parsedLayout, // Properly parsed layout object
          amenities: parsedAmenities, // Properly parsed amenities as strings
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
      setStats(statsData as RoomStats);
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

      // Parse numeric fields and calculate bed count from layout
      const parsedAvailable = availableData.map((room: any) => {
        let actualBedCount = parseInt(room.bedCount) || 0;
        let actualAvailableBeds = parseInt(room.availableBeds) || 0;

        // Parse layout and calculate actual bed count
        if (room.layout) {
          let parsedLayout = null;
          try {
            if (typeof room.layout === 'string') {
              parsedLayout = JSON.parse(room.layout);
            } else {
              parsedLayout = room.layout.layoutData || room.layout;
            }

            if (parsedLayout) {
              const layoutBedCount = calculateBedCountFromLayout(parsedLayout);
              if (layoutBedCount > 0) {
                actualBedCount = layoutBedCount;
                const occupancy = parseInt(room.occupancy) || 0;
                actualAvailableBeds = Math.max(0, actualBedCount - occupancy);
              }
            }
          } catch (error) {
            console.warn(`Failed to parse layout for available room ${room.id}:`, error);
          }
        }

        // Parse amenities to handle both string and object formats
        let parsedAmenities = room.amenities || [];
        if (Array.isArray(parsedAmenities)) {
          parsedAmenities = parsedAmenities.map((amenity: any) => {
            if (typeof amenity === 'string') {
              return amenity;
            } else if (typeof amenity === 'object' && amenity !== null) {
              return amenity.name || amenity.description || 'Unknown Amenity';
            }
            return 'Unknown Amenity';
          });
        }

        return {
          ...room,
          monthlyRate: parseFloat(room.monthlyRate) || 0,
          dailyRate: parseFloat(room.dailyRate) || 0,
          bedCount: actualBedCount,
          occupancy: parseInt(room.occupancy) || 0,
          availableBeds: actualAvailableBeds,
          amenities: parsedAmenities,
        };
      });

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

  // Get room by ID and update rooms array with full data
  const getRoomById = async (roomId: string) => {
    try {
      console.log(`🏠 Fetching full room data for ${roomId}...`);

      const room = await roomsApiService.getRoomById(roomId);
      console.log('✅ Full room data fetched:', room);

      // Update the rooms array with the full room data
      setRooms(prevRooms =>
        prevRooms.map(r => r.id === roomId ? (room as Room) : r)
      );

      return room;
    } catch (error: any) {
      console.error('❌ Error fetching room:', error);
      const errorMessage = error.message || 'Failed to fetch room. Please try again.';
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

      // Parse numeric fields and amenities
      const parsedResults = searchResults.map((room: any) => {
        // Parse amenities to handle both string and object formats
        let parsedAmenities = room.amenities || [];
        if (Array.isArray(parsedAmenities)) {
          parsedAmenities = parsedAmenities.map((amenity: any) => {
            if (typeof amenity === 'string') {
              return amenity;
            } else if (typeof amenity === 'object' && amenity !== null) {
              return amenity.name || amenity.description || 'Unknown Amenity';
            }
            return 'Unknown Amenity';
          });
        }

        return {
          ...room,
          monthlyRate: parseFloat(room.monthlyRate) || 0,
          dailyRate: parseFloat(room.dailyRate) || 0,
          bedCount: parseInt(room.bedCount) || 0,
          occupancy: parseInt(room.occupancy) || 0,
          availableBeds: parseInt(room.availableBeds) || 0,
          amenities: parsedAmenities,
        };
      });

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
    getRoomById,
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