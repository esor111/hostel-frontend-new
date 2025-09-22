import { ApiService } from './apiService';
import { handleApiError } from '../utils/errorHandler';
import { API_ENDPOINTS } from '../config/api';
import {
  Discount,
  DiscountType,
  CreateDiscountDto,
  ApplyDiscountDto,
  UpdateDiscountDto,
  DiscountFilters,
  DiscountStats,
  DiscountListResponse,
  ApplyDiscountResponse,
  DiscountStatus
} from '../types/discount';

class DiscountsApiService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  // Get all discounts with optional filters
  async getDiscounts(filters: DiscountFilters = {}): Promise<DiscountListResponse> {
    try {
      console.log('🏷️ Fetching discounts from API...', filters);
      
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.studentId) queryParams.append('studentId', filters.studentId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.search) queryParams.append('search', filters.search);

      const endpoint = `${API_ENDPOINTS.DISCOUNTS.BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.apiService.get<any>(endpoint);
      
      // Handle NestJS response format
      const discountData = response.result || response;
      
      console.log('✅ Discounts API response:', discountData);
      return discountData || { items: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
    } catch (error) {
      console.error('❌ Failed to fetch discounts:', error);
      throw handleApiError(error);
    }
  }

  // Get discount statistics
  async getDiscountStats(): Promise<DiscountStats> {
    try {
      console.log('📊 Fetching discount statistics...');
      
      const response = await this.apiService.get<any>(API_ENDPOINTS.DISCOUNTS.STATS);
      const statsData = response.stats || response;
      
      console.log('✅ Discount stats:', statsData);
      return statsData || {
        totalDiscounts: 0,
        activeDiscounts: 0,
        expiredDiscounts: 0,
        cancelledDiscounts: 0,
        totalAmount: 0,
        averageDiscountAmount: 0,
        studentsWithDiscounts: 0,
        discountTypes: {}
      };
    } catch (error) {
      console.error('❌ Failed to fetch discount stats:', error);
      throw handleApiError(error);
    }
  }

  // Get discount types
  async getDiscountTypes(): Promise<DiscountType[]> {
    try {
      console.log('🏷️ Fetching discount types...');
      
      const response = await this.apiService.get<any>(API_ENDPOINTS.DISCOUNTS.TYPES);
      const typesData = response.data || response;
      
      console.log('✅ Discount types:', typesData);
      return typesData || [];
    } catch (error) {
      console.error('❌ Failed to fetch discount types:', error);
      throw handleApiError(error);
    }
  }

  // Get discounts by student ID
  async getDiscountsByStudentId(studentId: string): Promise<Discount[]> {
    try {
      console.log(`👤 Fetching discounts for student ${studentId}...`);
      
      const response = await this.apiService.get<any>(API_ENDPOINTS.DISCOUNTS.BY_STUDENT(studentId));
      const studentDiscounts = response.data || response;
      
      console.log('✅ Student discounts:', studentDiscounts);
      return studentDiscounts || [];
    } catch (error) {
      console.error(`❌ Failed to fetch discounts for student ${studentId}:`, error);
      throw handleApiError(error);
    }
  }

  // Get a specific discount by ID
  async getDiscountById(id: string): Promise<Discount> {
    try {
      console.log(`🔍 Fetching discount ${id}...`);
      
      const response = await this.apiService.get<any>(API_ENDPOINTS.DISCOUNTS.BY_ID(id));
      const discountData = response.data || response;
      
      console.log('✅ Discount details:', discountData);
      return discountData;
    } catch (error) {
      console.error(`❌ Failed to fetch discount ${id}:`, error);
      throw handleApiError(error);
    }
  }

  // Create a new discount
  async createDiscount(discountData: CreateDiscountDto): Promise<Discount> {
    try {
      console.log('➕ Creating new discount...', discountData);
      
      const response = await this.apiService.post<any>(API_ENDPOINTS.DISCOUNTS.BASE, discountData);
      const createdDiscount = response.data || response;
      
      console.log('✅ Discount created:', createdDiscount);
      return createdDiscount;
    } catch (error) {
      console.error('❌ Failed to create discount:', error);
      throw handleApiError(error);
    }
  }

  // Update an existing discount
  async updateDiscount(id: string, updateData: UpdateDiscountDto): Promise<Discount> {
    try {
      console.log(`📝 Updating discount ${id}...`, updateData);
      
      const response = await this.apiService.put<any>(API_ENDPOINTS.DISCOUNTS.BY_ID(id), updateData);
      const updatedDiscount = response.data || response;
      
      console.log('✅ Discount updated:', updatedDiscount);
      return updatedDiscount;
    } catch (error) {
      console.error(`❌ Failed to update discount ${id}:`, error);
      throw handleApiError(error);
    }
  }

  // Apply discount to student (creates discount and updates ledger)
  async applyDiscount(discountData: ApplyDiscountDto): Promise<ApplyDiscountResponse> {
    try {
      console.log('💰 Applying discount to student...', discountData);
      
      const response = await this.apiService.post<any>(API_ENDPOINTS.DISCOUNTS.APPLY, discountData);
      const applyResult = response.data || response;
      
      console.log('✅ Discount applied successfully:', applyResult);
      return applyResult;
    } catch (error) {
      console.error('❌ Failed to apply discount:', error);
      throw handleApiError(error);
    }
  }

  // Expire a discount
  async expireDiscount(id: string, expiredBy: string = 'Admin'): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`⏰ Expiring discount ${id}...`);
      
      const response = await this.apiService.put<any>(API_ENDPOINTS.DISCOUNTS.EXPIRE(id), {
        expiredBy
      });
      const expireResult = response.data || response;
      
      console.log('✅ Discount expired successfully');
      return expireResult;
    } catch (error) {
      console.error(`❌ Failed to expire discount ${id}:`, error);
      throw handleApiError(error);
    }
  }

  // Get discount history (alias for getDiscounts with no filters)
  async getDiscountHistory(): Promise<Discount[]> {
    try {
      const response = await this.getDiscounts({ limit: 100 });
      return response.items;
    } catch (error) {
      console.error('❌ Failed to fetch discount history:', error);
      throw handleApiError(error);
    }
  }

  // Helper method to check if discount can be applied to student
  async canApplyDiscount(studentId: string, reason: string): Promise<boolean> {
    try {
      const studentDiscounts = await this.getDiscountsByStudentId(studentId);
      
      // Check if student already has an active discount with the same reason
      const existingDiscount = studentDiscounts.find(
        discount => discount.reason === reason && discount.status === DiscountStatus.ACTIVE
      );
      
      return !existingDiscount;
    } catch (error) {
      console.error('❌ Failed to check discount eligibility:', error);
      return false;
    }
  }

  // Bulk operations
  async bulkExpireDiscounts(discountIds: string[], expiredBy: string = 'Admin'): Promise<void> {
    try {
      console.log('⏰ Bulk expiring discounts...', discountIds);
      
      const promises = discountIds.map(id => this.expireDiscount(id, expiredBy));
      await Promise.all(promises);
      
      console.log('✅ Discounts expired successfully');
    } catch (error) {
      console.error('❌ Failed to bulk expire discounts:', error);
      throw handleApiError(error);
    }
  }

  // Get active discounts for a student
  async getActiveDiscountsByStudentId(studentId: string): Promise<Discount[]> {
    try {
      const allDiscounts = await this.getDiscountsByStudentId(studentId);
      return allDiscounts.filter(discount => discount.status === DiscountStatus.ACTIVE);
    } catch (error) {
      console.error(`❌ Failed to fetch active discounts for student ${studentId}:`, error);
      throw handleApiError(error);
    }
  }

  // Calculate total discount amount for a student
  async getTotalDiscountAmountForStudent(studentId: string): Promise<number> {
    try {
      const activeDiscounts = await this.getActiveDiscountsByStudentId(studentId);
      return activeDiscounts.reduce((total, discount) => total + discount.amount, 0);
    } catch (error) {
      console.error(`❌ Failed to calculate total discount for student ${studentId}:`, error);
      return 0;
    }
  }
}

export const discountsApiService = new DiscountsApiService();