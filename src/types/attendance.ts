// Attendance System Type Definitions
// This file contains all TypeScript interfaces for the attendance system

// ============================================================================
// API Response Interfaces
// ============================================================================

export interface CurrentStatusResponse {
  hostelId: string;
  timestamp: string;
  currentlyCheckedIn: number;
  students: CurrentStudent[];
}

export interface CurrentStudent {
  studentId: string;
  studentName: string;
  checkInTime: string;
  durationSoFar: string;
  roomNumber?: string;
  contactInfo?: string;
}

export interface DailyReportResponse {
  hostelId: string;
  date: string;
  summary: {
    totalStudents: number;
    totalPresent: number;
    totalAbsent: number;
    attendanceRate: string;
  };
  presentStudents: PresentStudent[];
  absentStudents?: AbsentStudent[];
}

export interface PresentStudent {
  studentId: string;
  studentName: string;
  firstCheckInTime: string;
  roomNumber?: string;
}

export interface AbsentStudent {
  studentId: string;
  studentName: string;
  roomNumber?: string;
  lastSeenDate?: string;
}

export interface ActivityReportResponse {
  hostelId: string;
  dateRange: {
    from: string;
    to: string;
  };
  summary: {
    totalCheckIns: number;
    totalCheckOuts: number;
    currentlyCheckedIn: number;
  };
  activities: StudentActivity[];
  pagination?: PaginationInfo;
}

export interface StudentActivity {
  studentId: string;
  studentName: string;
  sessions: CheckInOutSession[];
  totalDuration?: string;
}

export interface CheckInOutSession {
  checkInTime: string;
  checkOutTime: string | null;
  duration: string;
  notes?: string;
}

export interface SummaryReportResponse {
  hostelId: string;
  dateRange: {
    from: string;
    to: string;
  };
  summary: {
    totalCheckIns: number;
    totalCheckOuts: number;
    averageCheckInsPerDay: number;
  };
  dailyBreakdown: DailyBreakdown[];
  topStudents?: TopStudent[];
}

export interface DailyBreakdown {
  date: string;
  present: number;
  checkIns: number;
  checkOuts: number;
}

export interface TopStudent {
  studentId: string;
  studentName: string;
  daysPresent: number;
  totalCheckIns: number;
  totalDuration: string;
  attendanceRate: string;
}

export interface StudentHistoryResponse {
  studentId: string;
  studentName: string;
  dateRange: {
    from?: string;
    to?: string;
  };
  summary: {
    totalDaysPresent: number;
    totalCheckIns: number;
    averageDurationPerDay?: string;
  };
  attendance: StudentAttendanceRecord[];
}

export interface StudentAttendanceRecord {
  date: string;
  firstCheckInTime: string;
  wasPresent: boolean;
  checkInOutSessions: CheckInOutSession[];
  totalDurationForDay: string;
}

// ============================================================================
// Filter and Pagination Types
// ============================================================================

export interface AttendanceFilters {
  dateFrom?: string;
  dateTo?: string;
  date?: string;
  studentId?: string;
  status?: 'CHECKED_IN' | 'CHECKED_OUT' | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface AttendanceCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  color?: 'green' | 'red' | 'blue' | 'gray';
  loading?: boolean;
}

export interface StudentTableProps {
  students: (CurrentStudent | PresentStudent | AbsentStudent)[];
  type: 'current' | 'present' | 'absent';
  loading?: boolean;
  onStudentClick?: (studentId: string) => void;
}

export interface FilterControlsProps {
  filters: AttendanceFilters;
  onFiltersChange: (filters: AttendanceFilters) => void;
  showDateRange?: boolean;
  showStudentFilter?: boolean;
  showStatusFilter?: boolean;
}

export interface ExportButtonProps {
  data: any;
  filename: string;
  type: 'pdf' | 'excel';
  disabled?: boolean;
}

// ============================================================================
// UI State Types
// ============================================================================

export type AttendanceTab = 
  | 'dashboard' 
  | 'current-status' 
  | 'daily-report' 
  | 'activity-report' 
  | 'summary-report' 
  | 'student-detail';

export interface AttendancePageState {
  activeTab: AttendanceTab;
  selectedDate: string;
  dateRange: {
    from: string;
    to: string;
  };
  selectedStudentId?: string;
  filters: AttendanceFilters;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AttendanceError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  data?: any;
}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface ChartDataPoint {
  date: string;
  present: number;
  absent: number;
  checkIns: number;
  checkOuts: number;
  attendanceRate: number;
}

export interface TrendData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// ============================================================================
// Utility Types
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AttendanceError | null;
}

// ============================================================================
// Constants
// ============================================================================

export const ATTENDANCE_COLORS = {
  present: '#10B981', // green-500
  absent: '#EF4444',  // red-500
  neutral: '#3B82F6', // blue-500
  warning: '#F59E0B', // amber-500
} as const;

export const DEFAULT_FILTERS: AttendanceFilters = {
  page: 1,
  limit: 50,
  sortBy: 'checkInTime',
  sortOrder: 'DESC',
} as const;

export const ATTENDANCE_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'current-status', label: 'Current Status', icon: 'Users' },
  { id: 'daily-report', label: 'Daily Report', icon: 'Calendar' },
  { id: 'activity-report', label: 'Activity Log', icon: 'Activity' },
  { id: 'summary-report', label: 'Analytics', icon: 'BarChart3' },
] as const;