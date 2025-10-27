import { ApiService } from './apiService';
import { handleApiError } from '../utils/errorHandler';

// Helper function to get hostelId from auth context
const getHostelId = (): string | null => {
  try {
    // Get the selected business from localStorage (auth service stores it separately)
    const selectedBusinessData = localStorage.getItem('kaha_selected_business');
    console.log('🔍 DEBUG: Raw selectedBusiness from localStorage:', selectedBusinessData);
    
    if (selectedBusinessData) {
      const selectedBusiness = JSON.parse(selectedBusinessData);
      console.log('🔍 DEBUG: Parsed selectedBusiness:', selectedBusiness);
      console.log('🔍 DEBUG: selectedBusiness.id:', selectedBusiness.id);
      
      const hostelId = selectedBusiness.id;
      console.log('🏨 DEBUG: Using hostelId from selected business:', hostelId);
      return hostelId;
    }
    
    console.warn('⚠️ DEBUG: No selected business found in localStorage');
    return null;
  } catch (error) {
    console.error('❌ DEBUG: Failed to get hostelId from auth context:', error);
    return null;
  }
};

export enum AdminChargeType {
  ONE_TIME = 'one-time',
  MONTHLY = 'monthly',
  DAILY = 'daily'
}

export enum AdminChargeStatus {
  PENDING = 'pending',
  APPLIED = 'applied',
  CANCELLED = 'cancelled'
}

export interface AdminCharge {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  amount: number;
  chargeType: AdminChargeType;
  status: AdminChargeStatus;
  dueDate?: string;
  appliedDate?: string;
  category?: string;
  isRecurring: boolean;
  recurringMonths?: number;
  adminNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  student?: any; // Student relation
}

export interface CreateAdminChargeDto {
  studentId: string;
  title: string;
  description?: string;
  amount: number;
  chargeType?: AdminChargeType;
  dueDate?: string;
  category?: string;
  isRecurring?: boolean;
  recurringMonths?: number;
  adminNotes?: string;
  createdBy: string;
}

export interface UpdateAdminChargeDto {
  title?: string;
  description?: string;
  amount?: number;
  chargeType?: AdminChargeType;
  dueDate?: string;
  category?: string;
  isRecurring?: boolean;
  recurringMonths?: number;
  adminNotes?: string;
}

export interface AdminChargeFilters {
  studentId?: string;
  status?: AdminChargeStatus;
  chargeType?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminChargeStats {
  totalCharges: number;
  pendingCharges: number;
  appliedCharges: number;
  cancelledCharges: number;
  totalPendingAmount: number;
  totalAppliedAmount: number;
  totalAmount?: number;
  studentsAffected?: number;
}

export interface TodaySummary {
  totalCharges: number;
  totalAmount: number;
  studentsCharged: number;
  pendingCharges: number;
}

export interface ApplyChargeDto {
  chargeId: string;
  studentIds: string[];
  notes?: string;
}

class AdminChargesApiService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  // Get all admin charges with optional filters
  async getAdminCharges(filters: AdminChargeFilters = {}): Promise<AdminCharge[]> {
    try {
      console.log('🏢 Fetching admin charges from API...', filters);

      const queryParams = new URLSearchParams();
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.chargeType) queryParams.append('chargeType', filters.chargeType);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const endpoint = `/admin-charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.apiService.get<{ data: AdminCharge[], pagination?: any }>(endpoint);

      console.log('✅ Admin charges API response:', response);
      return response?.data || [];
    } catch (error) {
      console.error('❌ Failed to fetch admin charges:', error);
      throw handleApiError(error);
    }
  }

  // Get admin charge statistics
  async getAdminChargeStats(): Promise<AdminChargeStats> {
    try {
      console.log('📊 Fetching admin charge statistics...');

      const response = await this.apiService.get<AdminChargeStats>('/admin-charges/stats');

      console.log('✅ Admin charge stats raw response:', response);

      // The ApiService should already extract the data, so response should be the stats directly
      if (response && typeof response === 'object') {
        return response;
      }

      console.warn('⚠️ Invalid stats response format:', response);
      throw new Error('Invalid response format from stats API');
    } catch (error) {
      console.error('❌ Failed to fetch admin charge stats:', error);
      throw handleApiError(error);
    }
  }

  // Get today's summary
  async getTodaySummary(): Promise<TodaySummary> {
    try {
      console.log('📊 Fetching today\'s summary...');

      const response = await this.apiService.get<TodaySummary>('/admin-charges/today-summary');

      console.log('✅ Today\'s summary raw response:', response);

      // The ApiService should already extract the data, so response should be the summary directly
      if (response && typeof response === 'object') {
        return response;
      }

      console.warn('⚠️ Invalid summary response format:', response);
      throw new Error('Invalid response format from today-summary API');
    } catch (error) {
      console.error('❌ Failed to fetch today\'s summary:', error);
      throw handleApiError(error);
    }
  }

  // Get overdue students
  async getOverdueStudents(): Promise<any[]> {
    try {
      console.log('📊 Fetching overdue students...');

      const response = await this.apiService.get<{ data: any[] }>('/admin-charges/overdue-students');

      console.log('✅ Overdue students:', response);
      return response?.data || [];
    } catch (error) {
      console.error('❌ Failed to fetch overdue students:', error);
      throw handleApiError(error);
    }
  }

  // Get a specific admin charge by ID
  async getAdminChargeById(id: string): Promise<AdminCharge> {
    try {
      console.log(`🔍 Fetching admin charge ${id}...`);

      const response = await this.apiService.get<{ data: AdminCharge }>(`/admin-charges/${id}`);

      console.log('✅ Admin charge details:', response);
      return response?.data;
    } catch (error) {
      console.error(`❌ Failed to fetch admin charge ${id}:`, error);
      throw handleApiError(error);
    }
  }

  // Create a new admin charge
  async createAdminCharge(chargeData: CreateAdminChargeDto): Promise<AdminCharge> {
    try {
      console.log('➕ Creating new admin charge...', chargeData);

      // 🔧 BACKEND FIX: hostelId is now handled by backend service from student record
      // No need to send hostelId in request body - backend gets it from student.hostelId

      const response = await this.apiService.post<{ data: AdminCharge }>('/admin-charges', chargeData);

      console.log('✅ Admin charge created:', response);
      return response?.data;
    } catch (error) {
      console.error('❌ Failed to create admin charge:', error);
      throw handleApiError(error);
    }
  }

  // Update an existing admin charge
  async updateAdminCharge(id: string, updateData: UpdateAdminChargeDto): Promise<AdminCharge> {
    try {
      console.log(`📝 Updating admin charge ${id}...`, updateData);

      const response = await this.apiService.patch<{ data: AdminCharge }>(`/admin-charges/${id}`, updateData);

      console.log('✅ Admin charge updated:', response);
      return response?.data;
    } catch (error) {
      console.error(`❌ Failed to update admin charge ${id}:`, error);
      throw handleApiError(error);
    }
  }

  // Delete an admin charge
  async deleteAdminCharge(id: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting admin charge ${id}...`);

      await this.apiService.delete(`/admin-charges/${id}`);

      console.log('✅ Admin charge deleted successfully');
    } catch (error) {
      console.error(`❌ Failed to delete admin charge ${id}:`, error);
      throw handleApiError(error);
    }
  }

  // Apply a charge (change status to applied)
  async applyCharge(id: string): Promise<AdminCharge> {
    try {
      console.log(`💰 Applying charge ${id}...`);

      const response = await this.apiService.post<{ data: AdminCharge }>(`/admin-charges/${id}/apply`);

      console.log('✅ Charge applied successfully');
      return response?.data;
    } catch (error) {
      console.error(`❌ Failed to apply charge ${id}:`, error);
      throw handleApiError(error);
    }
  }

  // Cancel a charge
  async cancelCharge(id: string): Promise<AdminCharge> {
    try {
      console.log(`❌ Cancelling charge ${id}...`);

      const response = await this.apiService.post<{ data: AdminCharge }>(`/admin-charges/${id}/cancel`);

      console.log('✅ Charge cancelled successfully');
      return response?.data;
    } catch (error) {
      console.error(`❌ Failed to cancel charge ${id}:`, error);
      throw handleApiError(error);
    }
  }

  // Get charges applied to a specific student
  async getStudentCharges(studentId: string): Promise<AdminCharge[]> {
    try {
      console.log(`👤 Fetching charges for student ${studentId}...`);

      const response = await this.apiService.get<{ data: AdminCharge[] }>(`/admin-charges/student/${studentId}`);

      console.log('✅ Student charges:', response);
      return response?.data || [];
    } catch (error) {
      console.error(`❌ Failed to fetch charges for student ${studentId}:`, error);
      throw handleApiError(error);
    }
  }

  // Apply charge to multiple students
  async applyChargeToStudents(applyData: ApplyChargeDto): Promise<void> {
    try {
      console.log('💰 Applying charge to students...', applyData);

      await this.apiService.post('/admin-charges/apply-to-students', applyData);

      console.log('✅ Charge applied to students successfully');
    } catch (error) {
      console.error('❌ Failed to apply charge to students:', error);
      throw handleApiError(error);
    }
  }

  // Bulk update charges
  async bulkUpdateCharges(chargeIds: string[], updateData: UpdateAdminChargeDto): Promise<void> {
    try {
      console.log('📝 Bulk updating charges...', { chargeIds, updateData });

      await this.apiService.patch('/admin-charges/bulk-update', {
        chargeIds,
        updateData
      });

      console.log('✅ Charges updated successfully');
    } catch (error) {
      console.error('❌ Failed to bulk update charges:', error);
      throw handleApiError(error);
    }
  }

  // Bulk delete charges
  async bulkDeleteCharges(chargeIds: string[]): Promise<void> {
    try {
      console.log('🗑️ Bulk deleting charges...', chargeIds);

      await this.apiService.delete('/admin-charges/bulk-delete', { chargeIds });

      console.log('✅ Charges deleted successfully');
    } catch (error) {
      console.error('❌ Failed to bulk delete charges:', error);
      throw handleApiError(error);
    }
  }
}

export const adminChargesApiService = new AdminChargesApiService();