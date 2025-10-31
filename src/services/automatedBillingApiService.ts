import { ApiService } from './apiService';

export interface BillingStats {
  configuredStudents: number;
  currentMonthAmount: number;
  currentMonthInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
}

export interface GenerateMonthlyInvoicesRequest {
  month: number;
  year: number;
  dueDate?: string;
  studentIds?: string[];
}

export interface GenerateMonthlyInvoicesResponse {
  success: boolean;
  generated: number;
  failed: number;
  totalAmount: number;
  invoices: any[];  
  errors?: any[];
}

export interface BillingSchedule {
  month: string;
  date: string;
  year: number;
  monthNumber: number;
  isCurrentMonth: boolean;
}

export interface BillingPreview {
  month: string;
  year: number;
  totalAmount: number;
  totalStudents: number;
  students: StudentBillingPreview[];
}

export interface StudentBillingPreview {
  id: string;
  name: string;
  roomNumber: string;
  activeCharges: number;
  monthlyAmount: number;
}

// NEW: Nepalese Billing Interfaces
export interface NepalesesBillingResponse {
  success: boolean;
  generated: number;
  skipped: number;
  failed: number;
  totalAmount: number;
  skippedStudents: string[];
  errors?: any[];
}

export interface PaymentDueStudent {
  id: string;
  name: string;
  roomNumber: string;
  monthlyFee: number;
  paymentStatus: 'DUE_TODAY' | 'DUE_TOMORROW' | 'UPCOMING' | 'OVERDUE' | 'ADVANCE_PAID';
  daysUntilDue: number;
  dueMonth: string;
}

export interface StudentPaymentStatus {
  studentId: string;
  studentName: string;
  status: 'ADVANCE_PAID' | 'DUE_TODAY' | 'DUE_TOMORROW' | 'UPCOMING' | 'OVERDUE';
  message: string;
  dueAmount: number;
  dueMonth: string;
  advancePaymentMonth?: string;
}

export interface AdvancePaymentCalculation {
  amount: number;
  monthCovered: string;
  type: 'ADVANCE';
  description: string;
}

export interface BillingHistory {
  items: BillingHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BillingHistoryItem {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  month: string;
  amount: number;
  status: string;
  generatedDate: string;
  dueDate: string;
  paidDate?: string;
}

export interface ProratedCalculation {
  amount: number;
  dailyRate: number;
  daysCharged: number;
  daysInMonth: number;
  period: string;
  calculationType: 'enrollment' | 'checkout_same_month' | 'checkout_different_month';
}

export class AutomatedBillingApiService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  /**
   * Get billing statistics
   */
  async getBillingStats(): Promise<BillingStats> {
    console.log('📊 Fetching billing statistics');

    const result = await this.apiService.get<BillingStats>('/billing/monthly-stats');

    console.log('📊 Billing stats result:', result);
    return result;
  }

  /**
   * Generate monthly invoices for all active students
   */
  async generateMonthlyInvoices(request: GenerateMonthlyInvoicesRequest): Promise<GenerateMonthlyInvoicesResponse> {
    console.log('🧾 Generating monthly invoices:', request);

    const result = await this.apiService.post<GenerateMonthlyInvoicesResponse>(
      '/billing/generate-monthly',
      request
    );

    console.log('✅ Monthly invoices generated:', result);
    return result;
  }

  /**
   * Get billing schedule for upcoming months
   */
  async getBillingSchedule(months: number = 6): Promise<BillingSchedule[]> {
    console.log('📅 Fetching billing schedule for', months, 'months');

    const result = await this.apiService.get<BillingSchedule[]>('/billing/schedule', {
      months: months.toString()
    });

    console.log('📅 Billing schedule result:', result);
    return result;
  }

  /**
   * Preview billing for a specific month
   */
  async previewBilling(month: number, year: number): Promise<BillingPreview> {
    console.log('👁️ Previewing billing for', month, '/', year);

    const result = await this.apiService.get<BillingPreview>(`/billing/preview/${month}/${year}`);

    console.log('👁️ Billing preview result:', result);
    return result;
  }

  /**
   * Get students ready for billing
   */
  async getStudentsReadyForBilling(): Promise<StudentBillingPreview[]> {
    console.log('👥 Fetching students ready for billing');

    const result = await this.apiService.get<StudentBillingPreview[]>('/billing/students-ready');

    console.log('👥 Students ready for billing:', Array.isArray(result) ? result.length : 0);
    return Array.isArray(result) ? result : [];
  }

  /**
   * Get billing history
   */
  async getBillingHistory(page: number = 1, limit: number = 20): Promise<BillingHistory> {
    console.log('📋 Fetching billing history - page:', page, 'limit:', limit);

    const result = await this.apiService.get<BillingHistory>('/billing/history', {
      page: page.toString(),
      limit: limit.toString()
    });

    console.log('📋 Billing history result:', result);
    return result;
  }

  /**
   * Calculate prorated amount for enrollment
   */
  calculateProratedAmount(monthlyFee: number, enrollmentDate: string): ProratedCalculation {
    const enrollDate = new Date(enrollmentDate);
    const year = enrollDate.getFullYear();
    const month = enrollDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Days remaining in month (including enrollment day)
    const daysRemaining = daysInMonth - enrollDate.getDate() + 1;
    const dailyRate = monthlyFee / daysInMonth;
    const amount = Math.round(dailyRate * daysRemaining * 100) / 100;

    return {
      amount,
      dailyRate: Math.round(dailyRate * 100) / 100,
      daysCharged: daysRemaining,
      daysInMonth,
      period: `${enrollDate.toLocaleDateString()} to ${new Date(year, month + 1, 0).toLocaleDateString()}`,
      calculationType: 'enrollment'
    };
  }

  /**
   * Calculate prorated amount for checkout
   */
  calculateCheckoutProration(monthlyFee: number, checkoutDate: string): ProratedCalculation {
    const checkoutDateObj = new Date(checkoutDate);
    const year = checkoutDateObj.getFullYear();
    const month = checkoutDateObj.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Days stayed in the month (up to checkout date)
    const daysStayed = checkoutDateObj.getDate();
    const dailyRate = monthlyFee / daysInMonth;
    const amount = Math.round(dailyRate * daysStayed * 100) / 100;

    return {
      amount,
      dailyRate: Math.round(dailyRate * 100) / 100,
      daysCharged: daysStayed,
      daysInMonth,
      period: `${new Date(year, month, 1).toLocaleDateString()} to ${checkoutDateObj.toLocaleDateString()}`,
      calculationType: 'checkout_same_month'
    };
  }

  /**
   * Calculate refund for early checkout
   */
  calculateCheckoutRefund(monthlyFee: number, checkoutDate: string): {
    refundAmount: number;
    unusedDays: number;
    daysUsed: number;
    dailyRate: number;
    message: string;
  } {
    const checkoutDateObj = new Date(checkoutDate);
    const year = checkoutDateObj.getFullYear();
    const month = checkoutDateObj.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysUsed = checkoutDateObj.getDate();
    const unusedDays = daysInMonth - daysUsed;
    const dailyRate = Math.round((monthlyFee / daysInMonth) * 100) / 100;
    const refundAmount = unusedDays > 0 ? Math.round(dailyRate * unusedDays * 100) / 100 : 0;

    let message = '';
    if (refundAmount > 0) {
      message = `Refund calculated for ${unusedDays} unused days at NPR ${dailyRate}/day`;
    } else {
      message = 'No refund applicable - full month used or checkout at month end';
    }

    return {
      refundAmount,
      unusedDays,
      daysUsed,
      dailyRate,
      message
    };
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats() {
    console.log('📊 Fetching invoice statistics');

    const result = await this.apiService.get('/invoices/stats');

    console.log('📊 Invoice stats result:', result);
    return result;
  }

  /**
   * Get monthly invoice summary
   */
  async getMonthlyInvoiceSummary(months: number = 12) {
    console.log('📈 Fetching monthly invoice summary for', months, 'months');

    const result = await this.apiService.get('/invoices/summary/monthly', {
      months: months.toString()
    });

    console.log('📈 Monthly invoice summary result:', result);
    return result;
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices() {
    console.log('⚠️ Fetching overdue invoices');

    const result = await this.apiService.get('/invoices/overdue/list');

    console.log('⚠️ Overdue invoices result:', Array.isArray(result) ? result.length : 0, 'invoices');
    return Array.isArray(result) ? result : [];
  }

  /**
   * Create bulk invoices
   */
  async createBulkInvoices(invoices: any[]) {
    console.log('📦 Creating bulk invoices:', invoices.length, 'invoices');

    const result = await this.apiService.post('/invoices/bulk', {
      invoices
    });

    console.log('✅ Bulk invoices created:', result);
    return result;
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(invoiceId: string, status: string, notes?: string) {
    console.log('🔄 Updating invoice status:', invoiceId, 'to', status);

    const result = await this.apiService.put(`/invoices/${invoiceId}/status`, {
      status,
      notes
    });

    console.log('✅ Invoice status updated:', result);
    return result;
  }

  /**
   * Send invoice to student
   */
  async sendInvoice(invoiceId: string) {
    console.log('📧 Sending invoice:', invoiceId);

    const result = await this.apiService.post(`/invoices/${invoiceId}/send`);

    console.log('✅ Invoice sent:', result);
    return result;
  }

  // ========================================
  // NEW: NEPALESE BILLING SYSTEM METHODS
  // ========================================

  /**
   * Generate monthly invoices using Nepalese billing system (skips advance payment months)
   */
  async generateNepalesesMonthlyInvoices(request: GenerateMonthlyInvoicesRequest): Promise<NepalesesBillingResponse> {
    console.log('🏨 Generating Nepalese monthly invoices:', request);

    const result = await this.apiService.post<NepalesesBillingResponse>(
      '/billing/generate-nepalese-monthly',
      request
    );

    console.log('✅ Nepalese monthly invoices generated:', result);
    return result;
  }

  /**
   * Get students with payments due (Nepalese billing aware)
   */
  async getPaymentDueStudents(): Promise<PaymentDueStudent[]> {
    console.log('👥 Fetching payment due students (Nepalese billing)');

    const result = await this.apiService.get<PaymentDueStudent[]>('/billing/payment-due-students');

    console.log('👥 Payment due students:', Array.isArray(result) ? result.length : 0);
    return Array.isArray(result) ? result : [];
  }

  /**
   * Get student payment status (Nepalese billing)
   */
  async getStudentPaymentStatus(studentId: string): Promise<StudentPaymentStatus> {
    console.log('💰 Getting student payment status:', studentId);

    const result = await this.apiService.get<StudentPaymentStatus>(`/students/${studentId}/payment-status`);

    console.log('💰 Student payment status:', result);
    return result;
  }

  /**
   * Calculate advance payment for student configuration
   */
  calculateAdvancePayment(monthlyFee: number, enrollmentDate: string): AdvancePaymentCalculation {
    const enrollmentMonth = new Date(enrollmentDate).toISOString().substring(0, 7); // "2025-01"
    const monthName = new Date(enrollmentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      amount: monthlyFee,
      monthCovered: enrollmentMonth,
      type: 'ADVANCE',
      description: `Advance payment for ${monthName}`
    };
  }

  /**
   * Check if a month is covered by advance payment
   */
  isAdvancePaymentMonth(student: any, billingMonth: number, billingYear: number): boolean {
    if (!student.advancePaymentMonth) return false;

    const [advanceYear, advanceMonth] = student.advancePaymentMonth.split('-').map(Number);
    return advanceYear === billingYear && (advanceMonth - 1) === billingMonth;
  }

  /**
   * Get advance payment statistics
   */
  async getAdvancePaymentStats() {
    console.log('📊 Fetching advance payment statistics');

    try {
      // This would be a new endpoint, for now return mock data
      const result = {
        studentsWithAdvance: 0,
        monthsSkipped: 0,
        totalAdvanceAmount: 0
      };

      console.log('📊 Advance payment stats:', result);
      return result;
    } catch (error) {
      console.error('Error fetching advance payment stats:', error);
      return {
        studentsWithAdvance: 0,
        monthsSkipped: 0,
        totalAdvanceAmount: 0
      };
    }
  }

  /**
   * Get invoices by month for student-wise breakdown
   */
  async getInvoicesByMonth(monthKey: string) {
    console.log('📋 Fetching invoices for month:', monthKey);

    const result = await this.apiService.get(`/billing/invoices/${monthKey}`);

    console.log('📋 Monthly invoices result:', result);
    return result;
  }
}

// Export singleton instance
export const automatedBillingApiService = new AutomatedBillingApiService();