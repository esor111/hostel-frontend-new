import { Student, DashboardStats, Payment, Activity, Room, BookingRequest } from '../../types/api';

// Mock Students Data
export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '9841234567',
    email: 'john.doe@example.com',
    roomNumber: 'A101',
    status: 'Active',
    joinDate: '2024-01-15',
    balance: -2500,
    room: {
      id: 'room1',
      roomNumber: 'A101',
      name: 'Room A101'
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '9847654321',
    email: 'jane.smith@example.com',
    roomNumber: 'B202',
    status: 'Active',
    joinDate: '2024-02-01',
    balance: 1000,
    room: {
      id: 'room2',
      roomNumber: 'B202',
      name: 'Room B202'
    }
  },
  {
    id: '3',
    name: 'Mike Johnson',
    phone: '9851112233',
    email: 'mike.johnson@example.com',
    roomNumber: 'C303',
    status: 'Inactive',
    joinDate: '2023-12-10',
    balance: -5000,
    room: {
      id: 'room3',
      roomNumber: 'C303',
      name: 'Room C303'
    }
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalStudents: 150,
  activeStudents: 142,
  totalRevenue: 2500000,
  pendingPayments: 125000,
  occupancyRate: 85,
  monthlyCollection: 2200000
};

// Mock Recent Activities
export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'payment',
    description: 'Payment received from John Doe - NPR 15,000',
    timestamp: '2024-08-28T10:30:00Z',
    user: 'admin'
  },
  {
    id: '2',
    type: 'booking',
    description: 'New booking request from Sarah Wilson',
    timestamp: '2024-08-28T09:15:00Z',
    user: 'system'
  },
  {
    id: '3',
    type: 'student',
    description: 'Student profile updated - Jane Smith',
    timestamp: '2024-08-28T08:45:00Z',
    user: 'admin'
  }
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Doe',
    amount: 15000,
    paymentMethod: 'Cash',
    paymentDate: '2024-08-28',
    description: 'Monthly fee payment',
    status: 'Completed',
    transactionId: 'TXN001'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Jane Smith',
    amount: 12000,
    paymentMethod: 'Bank Transfer',
    paymentDate: '2024-08-27',
    description: 'Room rent',
    status: 'Completed',
    referenceNumber: 'REF123456'
  }
];

// Mock Rooms
export const mockRooms: Room[] = [
  {
    id: 'room1',
    name: 'Standard Room A101',
    roomNumber: 'A101',
    bedCount: 2,
    occupancy: 2,
    gender: 'Male',
    status: 'ACTIVE',
    monthlyRate: 15000
  },
  {
    id: 'room2',
    name: 'Deluxe Room B202',
    roomNumber: 'B202',
    bedCount: 1,
    occupancy: 1,
    gender: 'Female',
    status: 'ACTIVE',
    monthlyRate: 20000
  }
];

// Mock Booking Requests
export const mockBookingRequests: BookingRequest[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    phone: '9841111111',
    email: 'sarah.wilson@example.com',
    guardianName: 'Robert Wilson',
    guardianPhone: '9842222222',
    preferredRoom: 'Single',
    course: 'Computer Science',
    institution: 'Tribhuvan University',
    requestDate: '2024-08-28',
    checkInDate: '2024-09-01',
    status: 'Pending',
    notes: 'Prefers ground floor room'
  }
];

// Helper functions to generate mock data
export const generateMockStudent = (overrides: Partial<Student> = {}): Student => ({
  id: Math.random().toString(36).substr(2, 9),
  name: 'Test Student',
  phone: '9841234567',
  email: 'test@example.com',
  roomNumber: 'T101',
  status: 'Active',
  joinDate: new Date().toISOString().split('T')[0],
  balance: 0,
  room: {
    id: 'test-room',
    roomNumber: 'T101',
    name: 'Test Room'
  },
  ...overrides
});

export const generateMockPayment = (overrides: Partial<Payment> = {}): Payment => ({
  id: Math.random().toString(36).substr(2, 9),
  studentId: '1',
  studentName: 'Test Student',
  amount: 15000,
  paymentMethod: 'Cash',
  paymentDate: new Date().toISOString().split('T')[0],
  description: 'Test payment',
  status: 'Completed',
  ...overrides
});

// Search and filter helpers
export const filterStudents = (students: Student[], filters: any = {}) => {
  let filtered = [...students];

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(student => 
      student.name.toLowerCase().includes(searchTerm) ||
      student.phone.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(student => student.status === filters.status);
  }

  if (filters.roomNumber) {
    filtered = filtered.filter(student => student.roomNumber === filters.roomNumber);
  }

  return filtered;
};

export const paginateResults = <T>(items: T[], page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    items: items.slice(startIndex, endIndex),
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit)
  };
};