// Manual Student Creation Types
export interface FloorData {
  floorNumber: number;
  totalRooms: number;
  availableRooms: number;
  totalBeds: number;
  availableBeds: number;
}

export interface RoomData {
  roomId: string;
  roomNumber: string;
  name: string;
  floor: number;
  bedCount: number;
  occupancy: number;
  availableBeds: number;
  monthlyRate: number;
  status: string;
  gender?: string;
}

export interface BedData {
  bedId: string;
  bedNumber: number;
  bedIdentifier: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  monthlyRate: number;
  description?: string;
  room: {
    roomId: string;
    roomNumber: string;
    floor: number;
  };
}

export interface CreateManualStudentDto {
  name: string;
  phone: string;
  email: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  course?: string;
  institution?: string;
  idProofType?: string;
  idProofNumber?: string;
  checkInDate?: string;
  bedId: string;
}

export interface ManualStudentCreationState {
  currentStep: number;
  selectedFloor: FloorData | null;
  selectedRoom: RoomData | null;
  selectedBed: BedData | null;
  floors: FloorData[];
  rooms: RoomData[];
  beds: BedData[];
  loading: boolean;
  error: string | null;
}

export interface ManualStudentCreationActions {
  setCurrentStep: (step: number) => void;
  selectFloor: (floor: FloorData) => Promise<void>;
  selectRoom: (room: RoomData) => Promise<void>;
  selectBed: (bed: BedData) => void;
  createStudent: (data: CreateManualStudentDto) => Promise<void>;
  goBack: () => void;
  reset: () => void;
  loadFloors: () => Promise<void>;
}
