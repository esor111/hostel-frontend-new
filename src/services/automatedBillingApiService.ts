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
    
    console.log('👥 Students ready for billing:', result?.length || 0);
    return result || [];
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
    
    console.log('⚠️ Overdue invoices result:', result?.length || 0, 'invoices');
    return result;
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
}

// Export singleton instance
export const automatedBillingApiService = new AutomatedBillingApiService();