// Base API Response Types
export interface ApiResponse<T> {
  status: number;
  data?: T;
  result?: T;
  stats?: T;
  message?: string;
}

// Guardian Information Interface
export interface GuardianInfo {
  name: string;
  phone: string;
  relation: string;
}

// Student Types
export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomNumber?: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated';
  joinDate: string;
  enrollmentDate?: string;
  address?: string;
  balance?: number;
  room?: {
    id: string;
    roomNumber: string;
    name: string;
  };
  // Guardian information
  guardian?: GuardianInfo;
  // Academic information
  course?: string;
  institution?: string;
  // Additional fields from backend API
  guardianName?: string;
  guardianPhone?: string;
  baseMonthlyFee?: number;
  laundryFee?: number;
  foodFee?: number;
  wifiFee?: number;              // WiFi/Utilities fee
  maintenanceFee?: number;       // Maintenance fee
  emergencyContact?: string;
  currentBalance?: number;
  advanceBalance?: number;
  configurationAdvance?: number; // Initial configuration advance
  totalAdvance?: number;         // Total advance (config + regular)
  bookingRequestId?: string;
  updatedAt?: string;
  createdAt?: string;
  isConfigured?: boolean;
  bedNumber?: string;
}

export interface CreateStudentDto {
  name: string;
  phone: string;
  email: string;
  roomNumber?: string;
  address?: string;
  enrollmentDate?: string;
  guardian?: GuardianInfo;
  // Flat guardian fields (used internally for backend compatibility)
  guardianName?: string;
  guardianPhone?: string;
  course?: string;
  institution?: string;
}

export interface UpdateStudentDto {
  name?: string;
  phone?: string;
  email?: string;
  roomNumber?: string;
  status?: 'Active' | 'Inactive' | 'Suspended' | 'Graduated';
  address?: string;
  guardian?: GuardianInfo;
  // Flat guardian fields (used internally for backend compatibility)
  guardianName?: string;
  guardianPhone?: string;
  course?: string;
  institution?: string;
}

export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  totalDues: number;
  totalAdvances: number;
}

export interface StudentFilters {
  search?: string;
  status?: string;
  roomNumber?: string;
  page?: number;
  limit?: number;
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  occupancyRate: number;
  monthlyCollection: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  collections: number;
  pending: number;
}

// Payment Types
export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Online' | 'Cheque' | 'UPI' | 'Mobile Wallet';
  paymentDate: string;
  reference?: string;
  notes?: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Cancelled' | 'Refunded';
  transactionId?: string;
  receiptNumber?: string;
  processedBy?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  invoiceIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePaymentDto {
  studentId: string;
  amount: number;
  paymentMethod: Payment['paymentMethod'];
  paymentDate?: string;
  reference?: string;
  notes?: string;
  status?: Payment['status'];
  transactionId?: string;
  receiptNumber?: string;
  processedBy?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  invoiceIds?: string[];
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentMethod?: Payment['paymentMethod'];
  paymentDate?: string;
  reference?: string;
  notes?: string;
  status?: Payment['status'];
  transactionId?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
}

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalAmount: number;
  averagePaymentAmount: number;
  paymentMethods: Record<string, { count: number; amount: number }>;
  successRate: number;
  todayPayments: number;
  todayAmount: number;
  thisMonthPayments: number;
  thisMonthAmount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  requiresReference?: boolean;
  icon?: string;
}

// Ledger Types
export interface LedgerEntry {
  id: string;
  studentId: string;
  date: string;
  type: 'Invoice' | 'Payment' | 'Discount' | 'Adjustment' | 'Refund' | 'Penalty';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'Dr' | 'Cr' | 'Nil';
  referenceId?: string;
}

// Room Types
export interface Room {
  id: string;
  name: string;
  roomNumber: string;
  bedCount: number;
  occupancy: number;
  gender?: 'Male' | 'Female' | 'Mixed';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  monthlyRate?: number;
}

// Multi-Guest Booking Types (Primary)
export interface BookingGuest {
  id: string;
  createdAt: string;
  updatedAt: string;
  bookingId: string;
  bedId: string;
  guestName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  status: GuestStatus;
  idProofType: string | null;
  idProofNumber: string | null;
  emergencyContact: string | null;
  notes: string | null;
  actualCheckInDate: string | null;
  actualCheckOutDate: string | null;
  assignedRoomNumber: string;
  assignedBedNumber: string;
  // Guest-specific fields for backward compatibility
  guardianName?: string | null;
  guardianPhone?: string | null;
  course?: string | null;
  institution?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface MultiGuestBooking {
  id: string;
  createdAt: string;
  updatedAt: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  checkInDate: string | null;
  duration: string | null;
  status: BookingStatus;
  notes: string | null;
  emergencyContact: string | null;
  source: string;
  totalGuests: number;
  confirmedGuests: number;
  bookingReference: string;
  processedBy: string | null;
  processedDate: string | null;
  cancellationReason: string | null;
  // Enhanced fields from unified system
  guardianName: string | null;
  guardianPhone: string | null;
  preferredRoom: string | null;
  course: string | null;
  institution: string | null;
  requestDate: string;
  address: string | null;
  idProofType: string | null;
  idProofNumber: string | null;
  approvedDate: string | null;
  rejectionReason: string | null;
  assignedRoom: string | null;
  priorityScore: number;
  guests: BookingGuest[];
}

// Legacy BookingRequest interface (for backward compatibility)
// Maps from MultiGuestBooking for single-guest bookings
export interface BookingRequest {
  id: string;
  name: string; // maps to contactName
  phone: string; // maps to contactPhone
  email: string; // maps to contactEmail
  guardianName: string;
  guardianPhone: string;
  preferredRoom: string;
  course: string;
  institution: string;
  requestDate: string;
  checkInDate: string;
  duration: string;
  status: BookingStatus;
  notes?: string;
  emergencyContact: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
  approvedDate?: string;
  processedBy?: string;
  rejectionReason?: string;
  assignedRoom?: string;
  priorityScore?: number;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  // New fields for multi-guest support
  totalGuests?: number;
  confirmedGuests?: number;
  bookingReference?: string;
  guests?: BookingGuest[];
}

export enum BookingStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled',
  CONFIRMED = 'Confirmed',
  PARTIALLY_CONFIRMED = 'Partially_Confirmed',
  COMPLETED = 'Completed'
}

export enum GuestStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  CHECKED_IN = 'Checked_In',
  CHECKED_OUT = 'Checked_Out'
}

// Multi-Guest Booking Creation DTOs
export interface CreateGuestDto {
  bedId: string;
  guestName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  idProofType?: string;
  idProofNumber?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface CreateMultiGuestBookingDto {
  data: {
    contactPerson: {
      name: string;
      phone: string;
      email: string;
    };
    guests: CreateGuestDto[];
    checkInDate?: string;
    duration?: string;
    notes?: string;
    emergencyContact?: string;
    source?: string;
  };
}

// Legacy CreateBookingRequest interface (for backward compatibility)
export interface CreateBookingRequest {
  name: string;
  phone: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  preferredRoom: string;
  course: string;
  institution: string;
  requestDate: string;
  checkInDate: string;
  duration: string;
  emergencyContact: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
  notes?: string;
  source?: string;
}

export interface UpdateBookingRequest {
  name?: string;
  phone?: string;
  email?: string;
  guardianName?: string;
  guardianPhone?: string;
  preferredRoom?: string;
  course?: string;
  institution?: string;
  requestDate?: string;
  checkInDate?: string;
  duration?: string;
  emergencyContact?: string;
  address?: string;
  idProofType?: string;
  idProofNumber?: string;
  notes?: string;
}

// Enhanced Booking Statistics (from unified system)
export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  // New multi-guest specific stats
  singleGuestBookings?: number;
  multiGuestBookings?: number;
  totalGuests?: number;
  confirmedGuests?: number;
  approvalRate: number;
  confirmationRate?: number;
  sourceBreakdown: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
  // Additional analytics
  averageGuestsPerBooking?: number;
  todayBookings?: number;
  weeklyBookings?: number;
  monthlyBookings?: number;
}

// Multi-Guest Booking Response Interfaces
export interface MultiGuestBookingResponse {
  status: number;
  data: {
    items: MultiGuestBooking[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface MultiGuestBookingStatsResponse {
  status: number;
  data: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    totalGuests: number;
    confirmedGuests: number;
    confirmationRate: number;
    averageGuestsPerBooking: number;
  };
}

// Multi-Guest Booking Action Responses
export interface ConfirmBookingResponse {
  success: boolean;
  message: string;
  bookingId: string;
  confirmedGuests: number;
  createdStudents: number;
  students: any[];
  failedAssignments?: string[];
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  bookingId: string;
  releasedBeds: number;
}

// Legacy interface for backward compatibility
export interface ApproveBookingResponse {
  success: boolean;
  message: string;
  bookingId: string;
  approvedDate: string;
  // Extended for multi-guest support
  confirmedGuests?: number;
  createdStudents?: number;
  students?: any[];
}

export interface RejectBookingRequest {
  reason: string;
}

// Multi-Guest Booking Filter Interfaces
export interface MultiGuestBookingFilters {
  status?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  minGuests?: number;
  maxGuests?: number;
  page?: number;
  limit?: number;
}

// Unified Booking Filters (works for both single and multi-guest)
export interface UnifiedBookingFilters {
  status?: string;
  type?: 'single' | 'multi' | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Type Guards and Utility Types
export const isMultiGuestBooking = (booking: BookingRequest | MultiGuestBooking): booking is MultiGuestBooking => {
  return 'totalGuests' in booking && 'guests' in booking && Array.isArray(booking.guests);
};

export const isSingleGuestBooking = (booking: BookingRequest | MultiGuestBooking): booking is BookingRequest => {
  return !isMultiGuestBooking(booking);
};

// Transformation utility type
export type BookingUnion = BookingRequest | MultiGuestBooking;

// Analytics Types
export interface AnalyticsData {
  revenue: {
    monthly: number[];
    labels: string[];
  };
  occupancy: {
    rate: number;
    trend: number[];
  };
  collections: {
    rate: number;
    amount: number;
  };
}

// Error Types
export interface ApiErrorResponse {
  status: number;
  message: string;
  error?: string;
  details?: any;
}

// Booking Management Response Types
export interface BookingActionResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

// Guest Management Types
export interface GuestAssignment {
  guestId: string;
  bedId: string;
  guestName: string;
  roomNumber: string;
  bedNumber: string;
}

// Room and Bed Types for Booking Context
export interface AvailableBed {
  id: string;
  bedNumber: string;
  bedIdentifier: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  gender: 'Male' | 'Female' | 'Any';
  monthlyRate: string;
}

// Analytics Types
export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  bookings: number;
  occupancy: number;
}

export interface GuestTypeData {
  name: string;
  value: number;
  color?: string;
}

export interface PerformanceMetrics {
  averageDailyRate?: number;
  revenuePerBed?: number;
  averageLengthOfStay?: number;
  repeatGuestRate?: number;
  collectionRate?: number;
  averageStayDuration?: number;
  customerSatisfaction?: number;
  totalInvoices?: number;
  paidInvoices?: number;
}

export interface CollectionStats {
  collectionRate: number;
  totalCollected: number;
  totalOutstanding: number;
}

export interface AnalyticsTrends {
  revenueGrowth: number;
  bookingGrowth: number;
  occupancyGrowth: number;
}

export interface DashboardAnalytics {
  summary: {
    totalStudents: number;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    bookingsGrowth: number;
    occupancyGrowth: number;
  };
  monthlyData: MonthlyRevenueData[];
  guestTypeData: GuestTypeData[];
  performanceMetrics: PerformanceMetrics;
}