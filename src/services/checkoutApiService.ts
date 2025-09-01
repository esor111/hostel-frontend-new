import { ApiService } from './apiService';

export interface CheckoutRequest {
  checkoutDate: string;
  clearRoom?: boolean;
  refundAmount?: number;
  deductionAmount?: number;
  notes?: string;
  processedBy?: string;
}

export interface CheckoutResponse {
  success: boolean;
  studentId: string;
  checkoutDate: string;
  finalBalance: number;
  refundAmount: number;
  deductionAmount: number;
  netSettlement: number;
  message: string;
}

export interface CheckoutStats {
  totalCheckouts: number;
  thisMonthCheckouts: number;
  pendingRefunds: number;
  averageStayDuration: number;
}

export interface CheckoutHistory {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  checkoutDate: string;
  reason: string;
  stayDuration: number;
  finalBalance: number;
  status: string;
}

export class CheckoutApiService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  /**
   * Process student checkout via API
   */
  async processCheckout(studentId: string, checkoutData: CheckoutRequest): Promise<CheckoutResponse> {
    console.log('🚪 Processing checkout via API:', { studentId, checkoutData });
    
    const result = await this.apiService.post<CheckoutResponse>(
      `/students/${studentId}/checkout`,
      checkoutData
    );
    
    console.log('✅ Checkout processed successfully:', result);
    return result;
  }

  /**
   * Get active students available for checkout
   */
  async getActiveStudentsForCheckout() {
    console.log('👥 Fetching active students for checkout');
    
    const students = await this.apiService.get('/students', {
      status: 'Active',
      limit: '100'
    });
    
    // Filter only active students
    const activeStudents = students.items?.filter(student => 
      student.status === 'Active' && !student.isCheckedOut
    ) || [];
    
    console.log(`📋 Found ${activeStudents.length} active students for checkout`);
    return activeStudents;
  }

  /**
   * Get checkout statistics
   */
  async getCheckoutStats(): Promise<CheckoutStats> {
    console.log('📊 Fetching checkout statistics');
    
    // For now, return mock data since we don't have a dedicated endpoint
    // In a real implementation, this would be a separate API endpoint
    return {
      totalCheckouts: 0,
      thisMonthCheckouts: 0,
      pendingRefunds: 0,
      averageStayDuration: 0
    };
  }

  /**
   * Get checkout history
   */
  async getCheckoutHistory(): Promise<CheckoutHistory[]> {
    console.log('📋 Fetching checkout history');
    
    // For now, return empty array since we don't have a dedicated endpoint
    // In a real implementation, this would fetch from a checkout_records table
    return [];
  }

  /**
   * Calculate final settlement for a student
   */
  async calculateSettlement(studentId: string, checkoutDate: string) {
    console.log('💰 Calculating settlement for student:', studentId);
    
    try {
      // Get student balance from ledger
      const balance = await this.apiService.get(`/ledgers/student/${studentId}/balance`);
      
      // Get student details
      const student = await this.apiService.get(`/students/${studentId}`);
      
      // Calculate prorated amount for partial month
      const checkoutDateObj = new Date(checkoutDate);
      const year = checkoutDateObj.getFullYear();
      const month = checkoutDateObj.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysStayed = checkoutDateObj.getDate();
      
      const monthlyFee = (student.baseMonthlyFee || 0) + (student.laundryFee || 0) + (student.foodFee || 0);
      const proratedAmount = Math.round((monthlyFee / daysInMonth) * daysStayed * 100) / 100;
      
      const currentBalance = balance.balance || 0;
      const finalBalance = currentBalance + proratedAmount;
      
      return {
        currentBalance,
        proratedAmount,
        finalBalance,
        refundAmount: finalBalance < 0 ? Math.abs(finalBalance) : 0,
        dueAmount: finalBalance > 0 ? finalBalance : 0,
        daysStayed,
        daysInMonth,
        monthlyFee
      };
    } catch (error) {
      console.error('Error calculating settlement:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const checkoutApiService = new CheckoutApiService();