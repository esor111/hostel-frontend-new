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
  emergencyContact?: string;
  currentBalance?: number;
  advanceBalance?: number;
  bookingRequestId?: string;
  updatedAt?: string;
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

// Booking Types
export interface BookingRequest {
  id: string;
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
}

export enum BookingStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled'
}

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

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  approvalRate: number;
  sourceBreakdown: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

export interface ApproveBookingResponse {
  success: boolean;
  message: string;
  bookingId: string;
  approvedDate: string;
}

export interface RejectBookingRequest {
  reason: string;
}

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