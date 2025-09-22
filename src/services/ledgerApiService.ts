import { ApiService } from './apiService';
import { LedgerEntry } from '@/types/api';

export interface LedgerFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface LedgerStats {
  totalEntries: number;
  totalDebits: number;
  totalCredits: number;
  netBalance: number;
  activeStudents: number;
  entryTypeBreakdown: Record<string, {
    count: number;
    totalDebits: number;
    totalCredits: number;
  }>;
}

export interface StudentBalance {
  studentId: string;
  currentBalance: number;
  debitBalance: number;
  creditBalance: number;
  balanceType: 'Dr' | 'Cr' | 'Nil';
  totalEntries: number;
}

export interface CreateAdjustmentDto {
  studentId: string;
  amount: number;
  description: string;
  type: 'debit' | 'credit';
}

export interface ReverseEntryDto {
  reversedBy?: string;
  reason?: string;
}

class LedgerApiService extends ApiService {
  private readonly baseEndpoint = '/ledgers';

  /**
   * Get all ledger entries with optional filters and pagination
   */
  async getLedgerEntries(filters: LedgerFilters = {}): Promise<{
    items: LedgerEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;
      
      const response = await this.get(endpoint);
      
      // Handle different response formats from backend
      if (response.result) {
        return response.result;
      } else if (response.data) {
        return response.data;
      } else {
        return response;
      }
    } catch (error) {
      console.error('Error fetching ledger entries:', error);
      throw new Error(`Failed to fetch ledger entries: ${error.message}`);
    }
  }

  /**
   * Get ledger entries for a specific student
   */
  async getStudentLedger(studentId: string): Promise<LedgerEntry[]> {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      const response = await this.get(`${this.baseEndpoint}/student/${studentId}`);
      
      // Handle different response formats
      if (response.data) {
        return Array.isArray(response.data) ? response.data : [];
      } else if (response.result) {
        return Array.isArray(response.result) ? response.result : [];
      } else if (Array.isArray(response)) {
        return response;
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Error fetching student ledger for ${studentId}:`, error);
      throw new Error(`Failed to fetch student ledger: ${error.message}`);
    }
  }

  /**
   * Get current balance for a specific student
   */
  async getStudentBalance(studentId: string): Promise<StudentBalance> {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      const response = await this.get(`${this.baseEndpoint}/student/${studentId}/balance`);
      
      // Handle different response formats
      if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      } else {
        return response;
      }
    } catch (error) {
      console.error(`Error fetching student balance for ${studentId}:`, error);
      throw new Error(`Failed to fetch student balance: ${error.message}`);
    }
  }

  /**
   * Get ledger statistics
   */
  async getLedgerStats(): Promise<LedgerStats> {
    try {
      const response = await this.get(`${this.baseEndpoint}/stats`);
      
      // Handle different response formats
      if (response.stats) {
        return response.stats;
      } else if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      } else {
        return response;
      }
    } catch (error) {
      console.error('Error fetching ledger stats:', error);
      throw new Error(`Failed to fetch ledger statistics: ${error.message}`);
    }
  }

  /**
   * Create a balance adjustment entry
   */
  async createAdjustment(adjustmentData: CreateAdjustmentDto): Promise<LedgerEntry> {
    try {
      if (!adjustmentData.studentId || !adjustmentData.amount || !adjustmentData.description) {
        throw new Error('Student ID, amount, and description are required for adjustment');
      }

      if (!['debit', 'credit'].includes(adjustmentData.type)) {
        throw new Error('Adjustment type must be either "debit" or "credit"');
      }

      const response = await this.post(`${this.baseEndpoint}/adjustment`, adjustmentData);
      
      // Handle different response formats
      if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      } else {
        return response;
      }
    } catch (error) {
      console.error('Error creating adjustment:', error);
      throw new Error(`Failed to create adjustment: ${error.message}`);
    }
  }

  /**
   * Reverse a ledger entry
   */
  async reverseEntry(entryId: string, reversalData: ReverseEntryDto = {}): Promise<{
    originalEntry: LedgerEntry;
    reversalEntry: LedgerEntry;
  }> {
    try {
      if (!entryId) {
        throw new Error('Entry ID is required');
      }

      const payload = {
        reversedBy: reversalData.reversedBy || 'admin',
        reason: reversalData.reason || 'Manual reversal'
      };

      const response = await this.post(`${this.baseEndpoint}/${entryId}/reverse`, payload);
      
      // Handle different response formats
      if (response.data) {
        return response.data;
      } else if (response.result) {
        return response.result;
      } else {
        return response;
      }
    } catch (error) {
      console.error(`Error reversing entry ${entryId}:`, error);
      throw new Error(`Failed to reverse ledger entry: ${error.message}`);
    }
  }

  /**
   * Calculate running balance for a set of ledger entries
   * This is a utility function for client-side balance calculations
   */
  calculateRunningBalance(entries: LedgerEntry[]): LedgerEntry[] {
    if (!Array.isArray(entries) || entries.length === 0) {
      return [];
    }

    // Sort entries by date and entry number for proper chronological order
    const sortedEntries = [...entries].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      
      // If dates are same, sort by ID or creation order
      return a.id.localeCompare(b.id);
    });

    let runningBalance = 0;
    
    return sortedEntries.map(entry => {
      runningBalance += (entry.debit || 0) - (entry.credit || 0);
      
      return {
        ...entry,
        balance: Math.abs(runningBalance),
        balanceType: runningBalance > 0 ? 'Dr' as const : 
                    runningBalance < 0 ? 'Cr' as const : 
                    'Nil' as const
      };
    });
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get balance type color for UI display
   */
  getBalanceTypeColor(balanceType: string): string {
    switch (balanceType) {
      case 'Dr':
        return 'text-red-600';
      case 'Cr':
        return 'text-green-600';
      case 'Nil':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get entry type icon for UI display
   */
  getEntryTypeIcon(type: string): string {
    switch (type) {
      case 'Invoice':
        return '🧾';
      case 'Payment':
        return '💰';
      case 'Discount':
        return '🏷️';
      case 'Adjustment':
        return '⚖️';
      case 'Refund':
        return '↩️';
      case 'Penalty':
        return '⚠️';
      default:
        return '📋';
    }
  }
}

// Export singleton instance
export const ledgerApiService = new LedgerApiService();
export default ledgerApiService;