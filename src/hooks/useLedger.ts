import { useState, useEffect, useCallback, useMemo } from 'react';
import { ledgerApiService, LedgerFilters, StudentBalance, StudentFinancialSummary, CreateAdjustmentDto, ReverseEntryDto } from '@/services/ledgerApiService';
import { LedgerEntry } from '@/types/api';

interface UseLedgerState {
  // Data
  entries: LedgerEntry[];
  stats: any;
  studentBalance: StudentBalance | null;
  
  // Loading states
  loading: boolean;
  entriesLoading: boolean;
  balanceLoading: boolean;
  statsLoading: boolean;
  
  // Error states
  error: string | null;
  entriesError: string | null;
  balanceError: string | null;
  statsError: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Filters
  filters: LedgerFilters;
}

interface UseLedgerActions {
  // Data fetching
  fetchEntries: (filters?: LedgerFilters) => Promise<void>;
  fetchStudentLedger: (studentId: string) => Promise<void>;
  fetchStudentBalance: (studentId: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // CRUD operations
  createAdjustment: (adjustmentData: CreateAdjustmentDto) => Promise<LedgerEntry>;
  reverseEntry: (entryId: string, reversalData?: ReverseEntryDto) => Promise<any>;
  
  // Utility functions
  setFilters: (filters: LedgerFilters) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  
  // Client-side calculations
  calculateRunningBalance: (entries: LedgerEntry[]) => LedgerEntry[];
  getFormattedBalance: (amount: number) => string;
  getBalanceTypeColor: (balanceType: string) => string;
  getEntryTypeIcon: (type: string) => string;
}

const initialState: UseLedgerState = {
  entries: [],
  stats: null,
  studentBalance: null,
  loading: false,
  entriesLoading: false,
  balanceLoading: false,
  statsLoading: false,
  error: null,
  entriesError: null,
  balanceError: null,
  statsError: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  },
  filters: {}
};

export const useLedger = (initialFilters: LedgerFilters = {}): UseLedgerState & UseLedgerActions => {
  const [state, setState] = useState<UseLedgerState>({
    ...initialState,
    filters: initialFilters
  });

  // Fetch all ledger entries with filters
  const fetchEntries = useCallback(async (filters?: LedgerFilters) => {
    try {
      setState(prev => ({ 
        ...prev, 
        entriesLoading: true, 
        entriesError: null,
        loading: true
      }));

      const filtersToUse = filters || state.filters;
      const response = await ledgerApiService.getLedgerEntries(filtersToUse);

      setState(prev => ({
        ...prev,
        entries: response.items || [],
        pagination: response.pagination || prev.pagination,
        filters: filtersToUse,
        entriesLoading: false,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching ledger entries:', error);
      setState(prev => ({
        ...prev,
        entriesError: error.message,
        entriesLoading: false,
        loading: false
      }));
    }
  }, [state.filters]);

  // Fetch student-specific ledger
  const fetchStudentLedger = useCallback(async (studentId: string) => {
    try {
      setState(prev => ({ 
        ...prev, 
        entriesLoading: true, 
        entriesError: null,
        loading: true
      }));

      const entries = await ledgerApiService.getStudentLedger(studentId);
      
      // Calculate running balances for better display
      const entriesWithBalance = ledgerApiService.calculateRunningBalance(entries);

      setState(prev => ({
        ...prev,
        entries: entriesWithBalance,
        entriesLoading: false,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching student ledger:', error);
      setState(prev => ({
        ...prev,
        entriesError: error.message,
        entriesLoading: false,
        loading: false
      }));
    }
  }, []);

  // Fetch student balance
  const fetchStudentBalance = useCallback(async (studentId: string) => {
    try {
      setState(prev => ({ 
        ...prev, 
        balanceLoading: true, 
        balanceError: null 
      }));

      const balance = await ledgerApiService.getStudentBalance(studentId);

      setState(prev => ({
        ...prev,
        studentBalance: balance,
        balanceLoading: false
      }));
    } catch (error) {
      console.error('Error fetching student balance:', error);
      setState(prev => ({
        ...prev,
        balanceError: error.message,
        balanceLoading: false
      }));
    }
  }, []);

  // Fetch ledger statistics
  const fetchStats = useCallback(async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        statsLoading: true, 
        statsError: null 
      }));

      const stats = await ledgerApiService.getLedgerStats();

      setState(prev => ({
        ...prev,
        stats,
        statsLoading: false
      }));
    } catch (error) {
      console.error('Error fetching ledger stats:', error);
      setState(prev => ({
        ...prev,
        statsError: error.message,
        statsLoading: false
      }));
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Refresh entries with current filters
      await fetchEntries(state.filters);
      
      // If we have a specific student filter, also refresh their balance
      if (state.filters.studentId) {
        await fetchStudentBalance(state.filters.studentId);
      }
      
      // Refresh stats
      await fetchStats();
      
    } catch (error) {
      console.error('Error refreshing ledger data:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  }, [state.filters, fetchEntries, fetchStudentBalance, fetchStats]);

  // Create adjustment entry
  const createAdjustment = useCallback(async (adjustmentData: CreateAdjustmentDto): Promise<LedgerEntry> => {
    try {
      const newEntry = await ledgerApiService.createAdjustment(adjustmentData);
      
      // Refresh data to show the new entry
      await refreshData();
      
      return newEntry;
    } catch (error) {
      console.error('Error creating adjustment:', error);
      throw error;
    }
  }, [refreshData]);

  // Reverse ledger entry
  const reverseEntry = useCallback(async (entryId: string, reversalData?: ReverseEntryDto) => {
    try {
      const result = await ledgerApiService.reverseEntry(entryId, reversalData);
      
      // Refresh data to show the reversal
      await refreshData();
      
      return result;
    } catch (error) {
      console.error('Error reversing entry:', error);
      throw error;
    }
  }, [refreshData]);

  // Set filters
  const setFilters = useCallback((filters: LedgerFilters) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      pagination: { ...prev.pagination, page: 1 } // Reset to first page
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, page: 1 }
    }));
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  }, []);

  // Client-side utility functions
  const calculateRunningBalance = useCallback((entries: LedgerEntry[]) => {
    return ledgerApiService.calculateRunningBalance(entries);
  }, []);

  const getFormattedBalance = useCallback((amount: number) => {
    return ledgerApiService.formatCurrency(amount);
  }, []);

  const getBalanceTypeColor = useCallback((balanceType: string) => {
    return ledgerApiService.getBalanceTypeColor(balanceType);
  }, []);

  const getEntryTypeIcon = useCallback((type: string) => {
    return ledgerApiService.getEntryTypeIcon(type);
  }, []);

  // Auto-fetch entries when filters change
  useEffect(() => {
    if (Object.keys(state.filters).length > 0 || state.pagination.page > 1) {
      fetchEntries();
    }
  }, [state.filters, state.pagination.page]);

  // Memoized computed values
  const computedValues = useMemo(() => {
    const totalDebits = state.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredits = state.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    const netBalance = totalDebits - totalCredits;
    
    return {
      totalDebits,
      totalCredits,
      netBalance,
      hasEntries: state.entries.length > 0,
      isFiltered: Object.keys(state.filters).length > 0
    };
  }, [state.entries, state.filters]);

  return {
    // State
    ...state,
    
    // Computed values
    ...computedValues,
    
    // Actions
    fetchEntries,
    fetchStudentLedger,
    fetchStudentBalance,
    fetchStats,
    refreshData,
    createAdjustment,
    reverseEntry,
    setFilters,
    clearFilters,
    setPage,
    calculateRunningBalance,
    getFormattedBalance,
    getBalanceTypeColor,
    getEntryTypeIcon
  };
};

export default useLedger;