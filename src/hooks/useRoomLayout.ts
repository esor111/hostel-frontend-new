import { useState } from 'react';
import { toast } from 'sonner';
import { roomsApiOptimized } from '../services/roomsApiOptimized';
import { roomsApiService } from '../services/roomsApiService';

export interface RoomLayout {
  roomId: string;
  roomName: string;
  roomNumber: string;
  layout: any;
  bedCount: number;
  lastUpdated: string;
}

export interface RoomBedStatus {
  roomId: string;
  roomName: string;
  roomNumber: string;
  totalBeds: number;
  occupancy: number;
  beds: Array<{
    id: string;
    bedNumber: string;
    bedIdentifier: string;
    status: string;
    occupantName: string | null;
    monthlyRate: number;
    color: string;
  }>;
}

export const useRoomLayout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get room layout data for design view
  const getRoomLayout = async (roomId: string): Promise<RoomLayout | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🎨 Fetching layout for room ${roomId}...`);
      
      const layoutData = await roomsApiOptimized.getRoomLayout(roomId);
      console.log('✅ Room layout fetched:', layoutData);
      
      return layoutData;
    } catch (error: any) {
      console.error('❌ Error fetching room layout:', error);
      setError(error.message || 'Failed to fetch room layout');
      toast.error('Failed to fetch room layout');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get room bed status for quick checks
  const getRoomBedStatus = async (roomId: string): Promise<RoomBedStatus | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🛏️ Fetching bed status for room ${roomId}...`);
      
      const bedStatusData = await roomsApiOptimized.getRoomBedStatus(roomId);
      console.log('✅ Room bed status fetched:', bedStatusData);
      
      return bedStatusData;
    } catch (error: any) {
      console.error('❌ Error fetching room bed status:', error);
      setError(error.message || 'Failed to fetch room bed status');
      toast.error('Failed to fetch room bed status');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update room layout (still uses original API for mutations)
  const updateRoomLayout = async (roomId: string, layoutData: any) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🎨 Updating layout for room ${roomId}...`);
      
      // Use original API service for updates
      const updatedRoom = await roomsApiService.updateRoom(roomId, { layout: layoutData });
      console.log('✅ Room layout updated:', updatedRoom);
      
      toast.success('Room layout updated successfully');
      return updatedRoom;
    } catch (error: any) {
      console.error('❌ Error updating room layout:', error);
      setError(error.message || 'Failed to update room layout');
      toast.error('Failed to update room layout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getRoomLayout,
    getRoomBedStatus,
    updateRoomLayout
  };
};