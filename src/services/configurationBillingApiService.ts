import { apiService } from './apiService';

// Types for Configuration-Based Billing
export interface CheckoutPreview {
  studentId: string;
  studentName: string;
  configurationDate: string;
  outstandingInvoices: {
    id: string;
    periodLabel: string;
    amount: number;
    dueDate: string;
  }[];
  totalDues: number;
  advancePayments: {
    id: string;
    amount: number;
    date: string;
    type: string;
  }[];
  totalAdvance: number;
  finalAmount: number;
  status: 'AMOUNT_DUE' | 'REFUND_DUE' | 'SETTLED';
  summary: string;
}

export interface AdvanceBalance {
  studentId: string;
  advanceBalance: number;
  formattedBalance: string;
}

export interface ConfigurationBillingStats {
  totalConfiguredStudents: number;
  totalAdvanceBalance: number;
  totalOutstandingDues: number;
  studentsWithDues: number;
  studentsWithRefunds: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'CONFIGURATION' | 'INVOICE_GENERATED' | 'PAYMENT_RECEIVED' | 'CHECKOUT' | 'UPCOMING_BILLING';
  status: 'PAST' | 'TODAY' | 'UPCOMING';
  title: string;
  description: string;
  amount?: number;
  studentName?: string;
  metadata?: any;
}

export interface BillingTimeline {
  past: TimelineEvent[];
  today: TimelineEvent[];
  upcoming: TimelineEvent[];
  summary: {
    totalEvents: number;
    pastEventsCount: number;
    upcomingEventsCount: number;
    nextBillingDate: string | null;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ConfigurationBillingApiService {
  private apiService = apiService;

  /**
   * Get billing timeline with pagination
   */
  async getBillingTimeline(page: number = 1, limit: number = 10): Promise<BillingTimeline> {
    console.log(`📅 Getting billing timeline (page ${page}, limit ${limit})`);
    
    try {
      const result = await this.apiService.get<any>(`/students/billing-timeline?page=${page}&limit=${limit}`);
      
      // Handle backend response format
      if (result.data) {
        return result.data;
      }
      return result;
    } catch (error) {
      console.error('Error getting billing timeline:', error);
      throw error;
    }
  }

  /**
   * Get checkout preview for a student
   */
  async getCheckoutPreview(studentId: string): Promise<CheckoutPreview> {
    console.log('🔍 Getting checkout preview for student:', studentId);
    
    try {
      const result = await this.apiService.get<any>(`/students/${studentId}/checkout-preview`);
      
      // Handle backend response format
      if (result.data) {
        return result.data;
      }
      return result;
    } catch (error) {
      console.error('Error getting checkout preview:', error);
      throw error;
    }
  }

  /**
   * Process student checkout
   */
  async processCheckout(studentId: string): Promise<any> {
    console.log('🚪 Processing checkout for student:', studentId);
    
    try {
      const result = await this.apiService.post<any>(`/students/${studentId}/checkout`);
      
      // Handle backend response format
      if (result.data) {
        return result.data;
      }
      return result;
    } catch (error) {
      console.error('Error processing checkout:', error);
      throw error;
    }
  }

  /**
   * Get student advance balance
   */
  async getAdvanceBalance(studentId: string): Promise<AdvanceBalance> {
    console.log('💰 Getting advance balance for student:', studentId);
    
    try {
      const result = await this.apiService.get<any>(`/students/${studentId}/advance-balance`);
      
      // Handle backend response format
      if (result.data) {
        return result.data;
      }
      return result;
    } catch (error) {
      console.error('Error getting advance balance:', error);
      throw error;
    }
  }

  /**
   * Get configuration billing statistics
   */
  async getConfigurationBillingStats(): Promise<ConfigurationBillingStats> {
    console.log('📊 Getting configuration billing statistics');
    
    try {
      // Try to get real data first
      const students = await this.apiService.get<any>('/students');
      
      let totalConfiguredStudents = 0;
      let totalAdvanceBalance = 0;
      let totalOutstandingDues = 0;
      let studentsWithDues = 0;
      let studentsWithRefunds = 0;

      // Process students data
      const studentsData = students.data?.items || students.items || students;
      
      if (Array.isArray(studentsData)) {
        for (const student of studentsData) {
          if (student.isConfigured) {
            totalConfiguredStudents++;
            
            // Use configurationAdvance to show initial advance from config
            // This is the advance paid during student configuration
            const configAdvance = student.configurationAdvance || 0;
            const currentBalance = student.currentBalance || 0;
            
            totalAdvanceBalance += configAdvance;
            
            if (currentBalance > 0) {
              totalOutstandingDues += currentBalance;
              studentsWithDues++;
            } else if (currentBalance < 0) {
              studentsWithRefunds++;
            }
          }
        }
      }

      // Return real data (including zeros if no students)
      return {
        totalConfiguredStudents,
        totalAdvanceBalance,
        totalOutstandingDues,
        studentsWithDues,
        studentsWithRefunds
      };

    } catch (error) {
      console.error('Error getting configuration billing stats:', error);
      
      // Return zeros on error instead of demo data
      console.log('⚠️ API error, returning empty stats');
      return {
        totalConfiguredStudents: 0,
        totalAdvanceBalance: 0,
        totalOutstandingDues: 0,
        studentsWithDues: 0,
        studentsWithRefunds: 0
      };
    }
  }

  /**
   * Get students ready for configuration-based checkout
   */
  async getStudentsReadyForCheckout(): Promise<any[]> {
    console.log('👥 Getting students ready for configuration-based checkout');
    
    try {
      const students = await this.apiService.get<any>('/students', {
        status: 'Active'
      });
      
      // Process students data
      const studentsData = students.data?.items || students.items || students;
      
      if (Array.isArray(studentsData)) {
        // Filter for configured students who are active
        const configuredStudents = studentsData.filter(student => 
          student.status === 'Active' && 
          student.isConfigured &&
          !student.isCheckedOut
        );
        
        return configuredStudents;
      }
      
      // Return empty array if no students data
      return [];
      
    } catch (error) {
      console.error('Error getting students ready for checkout:', error);
      
      // Return empty array on error instead of demo data
      console.log('⚠️ API error, returning empty student list');
      return [];
    }
  }
}

// Export singleton instance
export const configurationBillingApiService = new ConfigurationBillingApiService();