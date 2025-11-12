import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { manualStudentApiService } from '@/services/manualStudentApiService';
import { 
  FloorData, 
  RoomData, 
  BedData, 
  CreateManualStudentDto,
  ManualStudentCreationState,
  ManualStudentCreationActions 
} from '@/types/manualStudent';

const initialState: ManualStudentCreationState = {
  currentStep: 1,
  selectedFloor: null,
  selectedRoom: null,
  selectedBed: null,
  floors: [],
  rooms: [],
  beds: [],
  loading: false,
  error: null,
};

export const useManualStudentCreation = (): ManualStudentCreationState & ManualStudentCreationActions => {
  const [state, setState] = useState<ManualStudentCreationState>(initialState);
  const navigate = useNavigate();

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const loadFloors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏢 Loading floors...');
      const floorsData = await manualStudentApiService.getAvailableFloors();
      
      console.log('🏢 Floors data in hook:', floorsData);
      console.log('🏢 Floors array length:', floorsData?.length);
      console.log('🏢 First floor data:', floorsData?.[0]);
      
      setState(prev => {
        const newState = { 
          ...prev, 
          floors: floorsData,
          loading: false 
        };
        console.log('🏢 Previous state:', prev);
        console.log('🏢 New state:', newState);
        console.log('🏢 Setting floors to:', floorsData);
        return newState;
      });
      
      console.log('✅ Floors loaded successfully:', floorsData);
    } catch (error) {
      console.error('❌ Error loading floors:', error);
      setError('Failed to load floors. Please try again.');
      toast.error('Failed to load floors. Please try again.');
      setLoading(false);
    }
  }, []);

  const selectFloor = useCallback(async (floor: FloorData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏠 Loading rooms for floor:', floor.floorNumber);
      const roomsData = await manualStudentApiService.getRoomsByFloor(floor.floorNumber);
      
      setState(prev => ({
        ...prev,
        selectedFloor: floor,
        selectedRoom: null,
        selectedBed: null,
        rooms: roomsData,
        beds: [],
        currentStep: 2,
        loading: false
      }));
      
      console.log('✅ Rooms loaded successfully:', roomsData);
    } catch (error) {
      console.error('❌ Error loading rooms:', error);
      setError('Failed to load rooms. Please try again.');
      toast.error('Failed to load rooms. Please try again.');
      setLoading(false);
    }
  }, []);

  const selectRoom = useCallback(async (room: RoomData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🛏️ Loading beds for room:', room.roomId);
      const bedsData = await manualStudentApiService.getBedsByRoom(room.roomId);
      
      setState(prev => ({
        ...prev,
        selectedRoom: room,
        selectedBed: null,
        beds: bedsData,
        currentStep: 3,
        loading: false
      }));
      
      console.log('✅ Beds loaded successfully:', bedsData);
    } catch (error) {
      console.error('❌ Error loading beds:', error);
      setError('Failed to load beds. Please try again.');
      toast.error('Failed to load beds. Please try again.');
      setLoading(false);
    }
  }, []);

  const selectBed = useCallback((bed: BedData) => {
    console.log('🎯 Bed selected:', bed);
    setState(prev => ({
      ...prev,
      selectedBed: bed,
      currentStep: 4
    }));
  }, []);

  const createStudent = useCallback(async (studentData: CreateManualStudentDto) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👤 Creating manual student:', studentData);
      const result = await manualStudentApiService.createManualStudent(studentData);
      
      toast.success('Student created successfully! Redirecting to Student Management for configuration.');
      
      console.log('✅ Student created successfully:', result);
      
      // Redirect to Student Management page after successful creation
      setTimeout(() => {
        navigate('/student-management');
      }, 1500); // Small delay to show the success message
      
    } catch (error) {
      console.error('❌ Error creating student:', error);
      setError('Failed to create student. Please try again.');
      toast.error('Failed to create student. Please try again.');
      setLoading(false);
    }
  }, [navigate]);

  const goBack = useCallback(() => {
    setState(prev => {
      const newStep = Math.max(1, prev.currentStep - 1);
      
      // Clear subsequent selections when going back
      let updates: Partial<ManualStudentCreationState> = { currentStep: newStep };
      
      if (newStep === 1) {
        updates = {
          ...updates,
          selectedFloor: null,
          selectedRoom: null,
          selectedBed: null,
          rooms: [],
          beds: []
        };
      } else if (newStep === 2) {
        updates = {
          ...updates,
          selectedRoom: null,
          selectedBed: null,
          beds: []
        };
      } else if (newStep === 3) {
        updates = {
          ...updates,
          selectedBed: null
        };
      }
      
      return { ...prev, ...updates };
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    setCurrentStep,
    selectFloor,
    selectRoom,
    selectBed,
    createStudent,
    goBack,
    reset,
    loadFloors,
  };
};
