import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { 
  Student, 
  CreateStudentDto, 
  UpdateStudentDto, 
  StudentStats, 
  StudentFilters 
} from '../types/api';

export class StudentsApiService {
  private apiService = apiService;

  /**
   * Get all students with optional filtering and pagination
   */
  async getStudents(filters: StudentFilters = {}): Promise<Student[]> {
    const queryParams: Record<string, any> = {};
    
    // Add filters to query params
    if (filters.search) queryParams.search = filters.search;
    if (filters.status) queryParams.status = filters.status;
    if (filters.roomNumber) queryParams.roomNumber = filters.roomNumber;
    if (filters.page) queryParams.page = filters.page;
    if (filters.limit) queryParams.limit = filters.limit;

    console.log('🔍 StudentsApiService.getStudents called with filters:', filters);
    console.log('🔍 Query params:', queryParams);
    console.log('🔍 API endpoint:', API_ENDPOINTS.STUDENTS.BASE);

    const result = await this.apiService.get<any>(
      API_ENDPOINTS.STUDENTS.BASE, 
      queryParams
    );
    
    console.log('🔍 Raw API result:', result);
    
    // Handle backend API response structure: { status: 200, data: { items: [...] } }
    let students: Student[] = [];
    if (result.data && result.data.items) {
      // Backend API response structure
      students = result.data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        email: item.email,
        roomNumber: item.roomNumber,
        status: item.status,
        joinDate: item.enrollmentDate, // Map enrollmentDate to joinDate
        enrollmentDate: item.enrollmentDate,
        balance: item.currentBalance || 0,
        currentBalance: item.currentBalance || 0,
        advanceBalance: item.advanceBalance || 0,
        room: item.roomNumber ? { 
          id: `room-${item.roomNumber}`, 
          roomNumber: item.roomNumber, 
          name: `Room ${item.roomNumber}` 
        } : null,
        // Additional fields from backend API
        guardianName: item.guardianName,
        guardianPhone: item.guardianPhone,
        address: item.address,
        baseMonthlyFee: parseFloat(item.baseMonthlyFee || '0'),
        laundryFee: parseFloat(item.laundryFee || '0'),
        foodFee: parseFloat(item.foodFee || '0'),
        course: item.course,
        institution: item.institution,
        emergencyContact: item.emergencyContact,
        bookingRequestId: item.bookingRequestId,
        updatedAt: item.updatedAt,
        isConfigured: item.isConfigured || false,
        bedNumber: item.bedNumber
      }));
    } else if (Array.isArray(result)) {
      // Mock API or direct array response
      students = result;
    } else if (result.items) {
      // Alternative paginated structure
      students = result.items;
    }
    
    console.log('🔍 Processed students:', students.length, 'students found');
    
    return students;
  }

  /**
   * Get a single student by ID
   */
  async getStudentById(id: string): Promise<Student> {
    const result = await this.apiService.get<any>(API_ENDPOINTS.STUDENTS.BY_ID(id));
    
    // Handle backend response format
    if (result.data) {
      const item = result.data;
      return {
        id: item.id,
        name: item.name,
        phone: item.phone,
        email: item.email,
        roomNumber: item.roomNumber,
        status: item.status,
        joinDate: item.enrollmentDate,
        enrollmentDate: item.enrollmentDate,
        balance: item.currentBalance || 0,
        currentBalance: item.currentBalance || 0,
        advanceBalance: item.advanceBalance || 0,
        room: item.roomNumber ? { 
          id: `room-${item.roomNumber}`, 
          roomNumber: item.roomNumber, 
          name: `Room ${item.roomNumber}` 
        } : null,
        guardianName: item.guardianName,
        guardianPhone: item.guardianPhone,
        address: item.address,
        baseMonthlyFee: parseFloat(item.baseMonthlyFee || '0'),
        laundryFee: parseFloat(item.laundryFee || '0'),
        foodFee: parseFloat(item.foodFee || '0'),
        course: item.course,
        institution: item.institution,
        emergencyContact: item.emergencyContact,
        bookingRequestId: item.bookingRequestId,
        updatedAt: item.updatedAt,
        isConfigured: item.isConfigured || false,
        bedNumber: item.bedNumber
      };
    }
    return result;
  }

  /**
   * Create a new student
   */
  async createStudent(studentData: CreateStudentDto): Promise<Student> {
    const result = await this.apiService.post<any>(API_ENDPOINTS.STUDENTS.BASE, studentData);
    
    // Handle backend response format
    if (result.data) {
      return result.data;
    }
    return result;
  }

  /**
   * Update an existing student
   */
  async updateStudent(id: string, updateData: UpdateStudentDto): Promise<Student> {
    const result = await this.apiService.put<any>(API_ENDPOINTS.STUDENTS.BY_ID(id), updateData);
    
    // Handle backend response format
    if (result.data) {
      return result.data;
    }
    return result;
  }

  /**
   * Delete a student
   */
  async deleteStudent(id: string): Promise<void> {
    const result = await this.apiService.delete<any>(API_ENDPOINTS.STUDENTS.BY_ID(id));
    
    // Handle backend response format
    if (result.data) {
      return result.data;
    }
    return result;
  }

  /**
   * Get student statistics
   */
  async getStudentStats(): Promise<StudentStats> {
    const result = await this.apiService.get<any>(API_ENDPOINTS.STUDENTS.STATS);
    
    // Handle backend response format and map to expected structure
    if (result.data) {
      return {
        total: result.data.totalStudents || 0,
        active: result.data.activeStudents || 0,
        inactive: result.data.inactiveStudents || 0,
        totalDues: result.data.totalBalance || 0,
        totalAdvances: result.data.totalAdvance || 0
      };
    }
    return result;
  }

  /**
   * Search students by term
   */
  async searchStudents(searchTerm: string): Promise<Student[]> {
    return this.getStudents({ search: searchTerm });
  }

  /**
   * Get students with outstanding dues
   */
  async getStudentsWithDues(): Promise<Student[]> {
    const students = await this.getStudents();
    return students.filter(student => (student.balance || 0) < 0);
  }

  /**
   * Get students by status
   */
  async getStudentsByStatus(status: string): Promise<Student[]> {
    return this.getStudents({ status });
  }

  /**
   * Get active students
   */
  async getActiveStudents(): Promise<Student[]> {
    return this.getStudentsByStatus('Active');
  }

  /**
   * Get inactive students
   */
  async getInactiveStudents(): Promise<Student[]> {
    return this.getStudentsByStatus('Inactive');
  }

  /**
   * Get checked out students with dues
   */
  async getCheckedOutStudentsWithDues(): Promise<Student[]> {
    const students = await this.getStudents();
    return students.filter(student => 
      student.status === 'Graduated' && (student.balance || 0) < 0
    );
  }

  /**
   * Checkout a student (update status)
   */
  async checkoutStudent(studentId: string, checkoutData?: { reason?: string }): Promise<Student> {
    const updateData: UpdateStudentDto = {
      status: 'Graduated',
      ...checkoutData
    };
    return this.updateStudent(studentId, updateData);
  }

  /**
   * Get student balance
   */
  async getStudentBalance(id: string): Promise<{ balance: number; balanceType: 'Dr' | 'Cr' | 'Nil' }> {
    return this.apiService.get(API_ENDPOINTS.STUDENTS.BALANCE(id));
  }

  /**
   * Get student ledger entries
   */
  async getStudentLedger(id: string): Promise<any[]> {
    return this.apiService.get(API_ENDPOINTS.STUDENTS.LEDGER(id));
  }

  /**
   * Get student payments
   */
  async getStudentPayments(id: string): Promise<any[]> {
    return this.apiService.get(API_ENDPOINTS.STUDENTS.PAYMENTS(id));
  }

  /**
   * Get student invoices
   */
  async getStudentInvoices(id: string): Promise<any[]> {
    return this.apiService.get(API_ENDPOINTS.STUDENTS.INVOICES(id));
  }

  /**
   * Configure student charges and fees
   */
  async configureStudent(id: string, configData: {
    baseMonthlyFee?: number;
    laundryFee?: number;
    foodFee?: number;
    wifiFee?: number;
    maintenanceFee?: number;
    securityDeposit?: number;
    additionalCharges?: Array<{
      name: string;
      amount: number;
      type: string;
    }>;
  }): Promise<any> {
    const result = await this.apiService.post(API_ENDPOINTS.STUDENTS.CONFIGURE(id), configData);
    
    // Handle backend response format
    if (result && typeof result === 'object' && 'data' in result) {
      return (result as any).data;
    }
    return result;
  }

  /**
   * Get all students (alias for getStudents)
   */
  async getAllStudents(): Promise<{ data: Student[] }> {
    const students = await this.getStudents();
    return { data: students };
  }

  /**
   * Clear students cache to force fresh data fetch
   */
  clearCache(): void {
    // Since the underlying API service doesn't have caching yet,
    // this method serves as a placeholder for future caching implementation
    console.log('🧹 StudentsApiService cache cleared');
  }
}

// Export singleton instance
export const studentsApiService = new StudentsApiService();