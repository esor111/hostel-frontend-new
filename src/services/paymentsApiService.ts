import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

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
  createdBy?: string; // Changed from processedBy to match backend
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
  createdBy?: string; // Changed from processedBy to match backend
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

export interface BulkPaymentResult {
  successful: number;
  failed: number;
  errors: Array<{
    payment: CreatePaymentDto;
    error: string;
  }>;
}

export interface MonthlyPaymentSummary {
  month: string;
  count: number;
  amount: number;
}

export interface PaymentFilters {
  studentId?: string;
  paymentMethod?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class PaymentsApiService {
  private apiService = apiService;

  /**
   * Get all payments with filtering and pagination
   */
  async getPayments(filters: PaymentFilters = {}): Promise<{
    items: Payment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    console.log('💰 PaymentsApiService.getPayments called with filters:', filters);
    
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const endpoint = `/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const result = await this.apiService.get<any>(endpoint);
    
    console.log('💰 Payments result:', result);
    
    // ✅ CRITICAL FIX: Handle different API response structures
    if (Array.isArray(result)) {
      // Direct array response
      return {
        items: result,
        pagination: {
          page: 1,
          limit: result.length,
          total: result.length,
          totalPages: 1
        }
      };
    } else if (result && result.data) {
      // Backend API response structure: {status: 200, data: {...}}
      if (Array.isArray(result.data)) {
        // Data is direct array
        return {
          items: result.data,
          pagination: {
            page: 1,
            limit: result.data.length,
            total: result.data.length,
            totalPages: 1
          }
        };
      } else if (result.data.items) {
        // Data has items structure
        return {
          items: result.data.items,
          pagination: result.data.pagination || {
            page: 1,
            limit: result.data.items.length,
            total: result.data.items.length,
            totalPages: 1
          }
        };
      }
    } else if (result && result.items) {
      // Direct items structure
      return result;
    }
    
    // Fallback for unexpected structure
    console.warn('⚠️ Unexpected payments API response structure:', result);
    return {
      items: [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 0
      }
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    console.log('💰 PaymentsApiService.getPaymentById called for:', id);
    
    const result = await this.apiService.get<Payment>(`/payments/${id}`);
    
    console.log('💰 Payment result:', result);
    return result;
  }

  /**
   * Get payments for a specific student
   */
  async getPaymentsByStudentId(studentId: string): Promise<Payment[]> {
    console.log('💰 PaymentsApiService.getPaymentsByStudentId called for:', studentId);
    
    const result = await this.apiService.get<Payment[]>(`/payments/student/${studentId}`);
    
    console.log('💰 Student payments result:', result.length, 'payments found');
    return result;
  }

  /**
   * Record new payment
   */
  async recordPayment(paymentData: CreatePaymentDto): Promise<Payment> {
    console.log('💰 PaymentsApiService.recordPayment called with:', paymentData);
    
    // Set default values and ensure proper field names
    const paymentPayload = {
      studentId: paymentData.studentId,
      amount: Number(paymentData.amount), // Ensure it's a number
      paymentMethod: paymentData.paymentMethod,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      status: paymentData.status || 'Completed',
      createdBy: paymentData.createdBy || 'admin', // Use createdBy instead of processedBy
      ...(paymentData.reference && { reference: paymentData.reference }),
      ...(paymentData.notes && { notes: paymentData.notes }),
      ...(paymentData.transactionId && { transactionId: paymentData.transactionId }),
      ...(paymentData.receiptNumber && { receiptNumber: paymentData.receiptNumber }),
      ...(paymentData.bankName && { bankName: paymentData.bankName }),
      ...(paymentData.chequeNumber && { chequeNumber: paymentData.chequeNumber }),
      ...(paymentData.chequeDate && { chequeDate: paymentData.chequeDate }),
      ...(paymentData.invoiceIds && { invoiceIds: paymentData.invoiceIds })
    };
    
    console.log('💰 Final payload being sent:', paymentPayload);
    
    try {
      const result = await this.apiService.post<Payment>('/payments', paymentPayload);
      console.log('✅ Payment recorded successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Payment recording failed:', error);
      throw error;
    }
  }

  /**
   * Update payment
   */
  async updatePayment(id: string, updateData: UpdatePaymentDto): Promise<Payment> {
    console.log('💰 PaymentsApiService.updatePayment called for:', id, updateData);
    
    const result = await this.apiService.put<Payment>(`/payments/${id}`, updateData);
    
    console.log('✅ Payment updated successfully:', result);
    return result;
  }

  /**
   * Cancel payment (soft delete)
   */
  async cancelPayment(id: string): Promise<{ success: boolean; message: string }> {
    console.log('💰 PaymentsApiService.cancelPayment called for:', id);
    
    const result = await this.apiService.delete<any>(`/payments/${id}`);
    
    console.log('✅ Payment cancelled successfully:', result);
    return result;
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<PaymentStats> {
    console.log('📊 PaymentsApiService.getPaymentStats called');
    
    const result = await this.apiService.get<PaymentStats>('/payments/stats');
    
    console.log('📊 Payment stats result:', result);
    return result;
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    console.log('💳 PaymentsApiService.getPaymentMethods called');
    
    const result = await this.apiService.get<PaymentMethod[]>('/payments/methods');
    
    console.log('💳 Payment methods result:', result);
    return result;
  }

  /**
   * Process bulk payments
   */
  async processBulkPayments(payments: CreatePaymentDto[]): Promise<BulkPaymentResult> {
    console.log('💰 PaymentsApiService.processBulkPayments called with:', payments.length, 'payments');
    
    const result = await this.apiService.post<BulkPaymentResult>('/payments/bulk', { payments });
    
    console.log('✅ Bulk payments processed:', result);
    return result;
  }

  /**
   * Get monthly payment summary
   */
  async getMonthlyPaymentSummary(months: number = 12): Promise<MonthlyPaymentSummary[]> {
    console.log('📊 PaymentsApiService.getMonthlyPaymentSummary called for:', months, 'months');
    
    const result = await this.apiService.get<MonthlyPaymentSummary[]>(`/payments/summary/monthly?months=${months}`);
    
    console.log('📊 Monthly payment summary result:', result);
    return result;
  }

  /**
   * Get recent payments
   */
  async getRecentPayments(limit: number = 10): Promise<Payment[]> {
    console.log('💰 PaymentsApiService.getRecentPayments called with limit:', limit);
    
    const result = await this.getPayments({ 
      limit, 
      page: 1 
    });
    
    console.log('💰 Recent payments result:', result.items.length, 'payments found');
    return result.items;
  }

  /**
   * Search payments
   */
  async searchPayments(searchTerm: string, filters: Omit<PaymentFilters, 'search'> = {}): Promise<Payment[]> {
    console.log('🔍 PaymentsApiService.searchPayments called with term:', searchTerm);
    
    const result = await this.getPayments({
      ...filters,
      search: searchTerm
    });
    
    console.log('🔍 Search payments result:', result.items.length, 'payments found');
    return result.items;
  }

  /**
   * Get payments by date range
   */
  async getPaymentsByDateRange(dateFrom: string, dateTo: string): Promise<Payment[]> {
    console.log('📅 PaymentsApiService.getPaymentsByDateRange called:', { dateFrom, dateTo });
    
    const result = await this.getPayments({
      dateFrom,
      dateTo,
      limit: 1000 // Get all payments in range
    });
    
    console.log('📅 Date range payments result:', result.items.length, 'payments found');
    return result.items;
  }

  /**
   * Get payments by method
   */
  async getPaymentsByMethod(paymentMethod: string): Promise<Payment[]> {
    console.log('💳 PaymentsApiService.getPaymentsByMethod called for:', paymentMethod);
    
    const result = await this.getPayments({
      paymentMethod,
      limit: 1000 // Get all payments for this method
    });
    
    console.log('💳 Payment method result:', result.items.length, 'payments found');
    return result.items;
  }

  /**
   * Get outstanding payments (pending/failed)
   */
  async getOutstandingPayments(): Promise<Payment[]> {
    console.log('⚠️ PaymentsApiService.getOutstandingPayments called');
    
    const [pendingPayments, failedPayments] = await Promise.all([
      this.getPayments({ status: 'Pending', limit: 1000 }),
      this.getPayments({ status: 'Failed', limit: 1000 })
    ]);
    
    const outstanding = [...pendingPayments.items, ...failedPayments.items];
    
    console.log('⚠️ Outstanding payments result:', outstanding.length, 'payments found');
    return outstanding;
  }

  /**
   * Retry failed payment
   */
  async retryPayment(id: string): Promise<Payment> {
    console.log('🔄 PaymentsApiService.retryPayment called for:', id);
    
    const result = await this.updatePayment(id, { status: 'Pending' });
    
    console.log('🔄 Payment retry initiated:', result);
    return result;
  }

  /**
   * Refund payment
   */
  async refundPayment(id: string, reason?: string): Promise<Payment> {
    console.log('💸 PaymentsApiService.refundPayment called for:', id, 'reason:', reason);
    
    const result = await this.updatePayment(id, { 
      status: 'Refunded',
      notes: reason ? `Refunded: ${reason}` : 'Refunded'
    });
    
    console.log('💸 Payment refunded successfully:', result);
    return result;
  }
}

// Export singleton instance
export const paymentsApiService = new PaymentsApiService();