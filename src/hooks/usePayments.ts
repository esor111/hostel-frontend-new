import { useState, useEffect, useCallback } from 'react';
import {
  paymentsApiService,
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentStats,
  PaymentMethod,
  PaymentFilters,
  BulkPaymentResult,
  MonthlyPaymentSummary
} from '../services/paymentsApiService';

interface UsePaymentsState {
  payments: Payment[];
  stats: PaymentStats | null;
  paymentMethods: PaymentMethod[];
  monthlyData: MonthlyPaymentSummary[];
  loading: boolean;
  error: string | null;
  lastRefresh: number | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface UsePaymentsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  loadOnMount?: boolean;
  initialFilters?: PaymentFilters;
}

export const usePayments = (options: UsePaymentsOptions = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
    loadOnMount = true,
    initialFilters = {}
  } = options;

  const [state, setState] = useState<UsePaymentsState>({
    payments: [],
    stats: null,
    paymentMethods: [],
    monthlyData: [],
    loading: false,
    error: null,
    lastRefresh: null,
    pagination: null
  });

  const [currentFilters, setCurrentFilters] = useState<PaymentFilters>(initialFilters);

  // Load payments with current filters
  const loadPayments = useCallback(async (filters: PaymentFilters = currentFilters) => {
    console.log('💰 usePayments.loadPayments called with filters:', filters);

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await paymentsApiService.getPayments(filters);

      setState(prev => ({
        ...prev,
        payments: result.items || [],
        pagination: result.pagination || null,
        loading: false,
        lastRefresh: Date.now()
      }));

      console.log('✅ Payments loaded successfully:', result.items.length, 'payments');
    } catch (error) {
      console.error('❌ Error loading payments:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load payments'
      }));
    }
  }, [currentFilters]);

  // Load payment statistics
  const loadPaymentStats = useCallback(async () => {
    console.log('📊 usePayments.loadPaymentStats called');

    try {
      const stats = await paymentsApiService.getPaymentStats();

      setState(prev => ({
        ...prev,
        stats,
        lastRefresh: Date.now()
      }));

      console.log('✅ Payment stats loaded successfully');
    } catch (error) {
      console.error('❌ Error loading payment stats:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load payment stats'
      }));
    }
  }, []);

  // Load payment methods
  const loadPaymentMethods = useCallback(async () => {
    console.log('💳 usePayments.loadPaymentMethods called');

    try {
      const methods = await paymentsApiService.getPaymentMethods();

      setState(prev => ({
        ...prev,
        paymentMethods: methods,
        lastRefresh: Date.now()
      }));

      console.log('✅ Payment methods loaded successfully');
    } catch (error) {
      console.error('❌ Error loading payment methods:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load payment methods'
      }));
    }
  }, []);

  // Load monthly payment data
  const loadMonthlyData = useCallback(async (months: number = 12) => {
    console.log('📊 usePayments.loadMonthlyData called for:', months, 'months');

    try {
      const monthlyData = await paymentsApiService.getMonthlyPaymentSummary(months);

      setState(prev => ({
        ...prev,
        monthlyData,
        lastRefresh: Date.now()
      }));

      console.log('✅ Monthly payment data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading monthly payment data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load monthly payment data'
      }));
    }
  }, []);

  // Load all payment data
  const loadAllPaymentData = useCallback(async () => {
    console.log('🔄 usePayments.loadAllPaymentData called');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await Promise.all([
        loadPayments(),
        loadPaymentStats(),
        loadPaymentMethods(),
        loadMonthlyData()
      ]);

      console.log('✅ All payment data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading all payment data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load payment data'
      }));
    }
  }, [loadPayments, loadPaymentStats, loadPaymentMethods, loadMonthlyData]);

  // Record new payment
  const recordPayment = useCallback(async (paymentData: CreatePaymentDto): Promise<Payment> => {
    console.log('💰 usePayments.recordPayment called with:', paymentData);

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const newPayment = await paymentsApiService.recordPayment(paymentData);

      // Add to current payments list
      setState(prev => ({
        ...prev,
        payments: [newPayment, ...prev.payments],
        loading: false,
        lastRefresh: Date.now()
      }));

      // Refresh stats
      await loadPaymentStats();

      console.log('✅ Payment recorded successfully:', newPayment);
      return newPayment;
    } catch (error) {
      console.error('❌ Error recording payment:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to record payment'
      }));
      throw error;
    }
  }, [loadPaymentStats]);

  // Update payment
  const updatePayment = useCallback(async (id: string, updateData: UpdatePaymentDto): Promise<Payment> => {
    console.log('💰 usePayments.updatePayment called for:', id, updateData);

    try {
      const updatedPayment = await paymentsApiService.updatePayment(id, updateData);

      // Update in current payments list
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(payment =>
          payment.id === id ? updatedPayment : payment
        ),
        lastRefresh: Date.now()
      }));

      console.log('✅ Payment updated successfully:', updatedPayment);
      return updatedPayment;
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update payment'
      }));
      throw error;
    }
  }, []);

  // Cancel payment
  const cancelPayment = useCallback(async (id: string): Promise<void> => {
    console.log('💰 usePayments.cancelPayment called for:', id);

    try {
      await paymentsApiService.cancelPayment(id);

      // Update payment status in list
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(payment =>
          payment.id === id ? { ...payment, status: 'Cancelled' as const } : payment
        ),
        lastRefresh: Date.now()
      }));

      // Refresh stats
      await loadPaymentStats();

      console.log('✅ Payment cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling payment:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to cancel payment'
      }));
      throw error;
    }
  }, [loadPaymentStats]);

  // Process bulk payments
  const processBulkPayments = useCallback(async (payments: CreatePaymentDto[]): Promise<BulkPaymentResult> => {
    console.log('💰 usePayments.processBulkPayments called with:', payments.length, 'payments');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await paymentsApiService.processBulkPayments(payments);

      // Refresh all data after bulk operation
      await loadAllPaymentData();

      console.log('✅ Bulk payments processed:', result);
      return result;
    } catch (error) {
      console.error('❌ Error processing bulk payments:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to process bulk payments'
      }));
      throw error;
    }
  }, [loadAllPaymentData]);

  // Get payments by student
  const getPaymentsByStudent = useCallback(async (studentId: string): Promise<Payment[]> => {
    console.log('💰 usePayments.getPaymentsByStudent called for:', studentId);

    try {
      const payments = await paymentsApiService.getPaymentsByStudentId(studentId);

      console.log('✅ Student payments loaded:', payments.length, 'payments');
      return payments;
    } catch (error) {
      console.error('❌ Error loading student payments:', error);
      throw error;
    }
  }, []);

  // Search payments
  const searchPayments = useCallback(async (searchTerm: string, filters: Omit<PaymentFilters, 'search'> = {}): Promise<Payment[]> => {
    console.log('🔍 usePayments.searchPayments called with term:', searchTerm);

    try {
      const payments = await paymentsApiService.searchPayments(searchTerm, filters);

      console.log('✅ Payment search completed:', payments.length, 'payments found');
      return payments;
    } catch (error) {
      console.error('❌ Error searching payments:', error);
      throw error;
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback(async (filters: PaymentFilters) => {
    console.log('🔍 usePayments.applyFilters called with:', filters);

    setCurrentFilters(filters);
    await loadPayments(filters);
  }, [loadPayments]);

  // Clear filters
  const clearFilters = useCallback(async () => {
    console.log('🔄 usePayments.clearFilters called');

    const emptyFilters = {};
    setCurrentFilters(emptyFilters);
    await loadPayments(emptyFilters);
  }, [loadPayments]);

  // Refresh all data
  const refreshPayments = useCallback(async () => {
    console.log('🔄 usePayments.refreshPayments called');

    await loadAllPaymentData();
  }, [loadAllPaymentData]);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load data on mount
  useEffect(() => {
    if (loadOnMount) {
      loadAllPaymentData();
    }
  }, [loadOnMount, loadAllPaymentData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing payment data...');
      refreshPayments();
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, refreshPayments]);

  return {
    // State
    payments: state.payments,
    stats: state.stats,
    paymentMethods: state.paymentMethods,
    monthlyData: state.monthlyData,
    loading: state.loading,
    error: state.error,
    lastRefresh: state.lastRefresh,
    pagination: state.pagination,
    currentFilters,

    // Actions
    loadPayments,
    loadPaymentStats,
    loadPaymentMethods,
    loadMonthlyData,
    loadAllPaymentData,
    recordPayment,
    updatePayment,
    cancelPayment,
    processBulkPayments,
    getPaymentsByStudent,
    searchPayments,
    applyFilters,
    clearFilters,
    refreshPayments,
    clearError,

    // Computed values
    hasData: (state.payments || []).length > 0,
    totalPayments: (state.payments || []).length,
    isStale: state.lastRefresh ? (Date.now() - state.lastRefresh) > refreshInterval : false,
    hasError: !!state.error
  };
};