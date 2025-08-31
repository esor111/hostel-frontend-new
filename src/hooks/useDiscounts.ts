import { useState, useEffect, useCallback } from 'react';
import { 
  discountsApiService 
} from '../services/discountsApiService';
import { handleApiError } from '../utils/errorHandler';
import {
  Discount,
  DiscountType,
  CreateDiscountDto,
  ApplyDiscountDto,
  UpdateDiscountDto,
  DiscountFilters,
  DiscountStats,
  DiscountStatus
} from '../types/discount';

interface UseDiscountsState {
  discounts: Discount[];
  discountTypes: DiscountType[];
  loading: boolean;
  error: string | null;
  stats: DiscountStats | null;
  searchTerm: string;
  filters: DiscountFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseDiscountsActions {
  loadDiscounts: () => Promise<void>;
  loadDiscountStats: () => Promise<void>;
  loadDiscountTypes: () => Promise<void>;
  createDiscount: (discountData: CreateDiscountDto) => Promise<Discount>;
  updateDiscount: (id: string, updateData: UpdateDiscountDto) => Promise<Discount>;
  applyDiscount: (discountData: ApplyDiscountDto) => Promise<any>;
  expireDiscount: (id: string, expiredBy?: string) => Promise<void>;
  getStudentDiscounts: (studentId: string) => Promise<Discount[]>;
  searchDiscounts: (term: string) => Promise<void>;
  setFilters: (filters: DiscountFilters) => void;
  setPage: (page: number) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  canApplyDiscount: (studentId: string, reason: string) => Promise<boolean>;
  bulkExpireDiscounts: (discountIds: string[]) => Promise<void>;
}

export const useDiscounts = (initialFilters: DiscountFilters = {}): UseDiscountsState & UseDiscountsActions => {
  const [state, setState] = useState<UseDiscountsState>({
    discounts: [],
    discountTypes: [],
    loading: false,
    error: null,
    stats: null,
    searchTerm: '',
    filters: { page: 1, limit: 50, ...initialFilters },
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0
    }
  });

  // Load discounts with current filters
  const loadDiscounts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🔄 Loading discounts with filters:', state.filters);
      const response = await discountsApiService.getDiscounts({
        ...state.filters,
        search: state.searchTerm || undefined
      });
      
      console.log('📊 Discounts loaded:', response);
      setState(prev => ({ 
        ...prev, 
        discounts: response.items,
        pagination: response.pagination,
        loading: false 
      }));
    } catch (err) {
      const apiError = handleApiError(err);
      console.error('Failed to load discounts:', apiError.message);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false,
        discounts: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      }));
    }
  }, [state.filters, state.searchTerm]);

  // Load discount statistics
  const loadDiscountStats = useCallback(async () => {
    try {
      console.log('🔄 Loading discount stats...');
      const stats = await discountsApiService.getDiscountStats();
      console.log('📊 Stats loaded:', stats);
      setState(prev => ({ ...prev, stats }));
    } catch (err) {
      const apiError = handleApiError(err);
      console.error('Failed to load discount stats:', apiError.message);
      // Set default stats on error
      const defaultStats: DiscountStats = {
        totalDiscounts: 0,
        activeDiscounts: 0,
        expiredDiscounts: 0,
        cancelledDiscounts: 0,
        totalAmount: 0,
        averageDiscountAmount: 0,
        studentsWithDiscounts: 0,
        discountTypes: {}
      };
      setState(prev => ({ ...prev, stats: defaultStats }));
    }
  }, []);

  // Load discount types
  const loadDiscountTypes = useCallback(async () => {
    try {
      console.log('🔄 Loading discount types...');
      const types = await discountsApiService.getDiscountTypes();
      console.log('🏷️ Types loaded:', types);
      setState(prev => ({ ...prev, discountTypes: types }));
    } catch (err) {
      const apiError = handleApiError(err);
      console.error('Failed to load discount types:', apiError.message);
      setState(prev => ({ ...prev, discountTypes: [] }));
    }
  }, []);

  // Create a new discount
  const createDiscount = useCallback(async (discountData: CreateDiscountDto): Promise<Discount> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newDiscount = await discountsApiService.createDiscount(discountData);
      
      // Optimistic update - add to current list
      setState(prev => ({ 
        ...prev, 
        discounts: [newDiscount, ...prev.discounts],
        loading: false 
      }));
      
      // Refresh stats
      loadDiscountStats();
      
      return newDiscount;
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadDiscountStats]);

  // Update an existing discount
  const updateDiscount = useCallback(async (id: string, updateData: UpdateDiscountDto): Promise<Discount> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedDiscount = await discountsApiService.updateDiscount(id, updateData);
      
      // Optimistic update - update in current list
      setState(prev => ({ 
        ...prev, 
        discounts: prev.discounts.map(discount => 
          discount.id === id ? updatedDiscount : discount
        ),
        loading: false 
      }));
      
      // Refresh stats
      loadDiscountStats();
      
      return updatedDiscount;
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadDiscountStats]);

  // Apply discount to student
  const applyDiscount = useCallback(async (discountData: ApplyDiscountDto) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await discountsApiService.applyDiscount(discountData);
      
      // Optimistic update - add to current list
      setState(prev => ({ 
        ...prev, 
        discounts: [result.discount, ...prev.discounts],
        loading: false 
      }));
      
      // Refresh stats
      loadDiscountStats();
      
      return result;
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadDiscountStats]);

  // Expire a discount
  const expireDiscount = useCallback(async (id: string, expiredBy: string = 'Admin'): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await discountsApiService.expireDiscount(id, expiredBy);
      
      // Optimistic update - update status in current list
      setState(prev => ({ 
        ...prev, 
        discounts: prev.discounts.map(discount => 
          discount.id === id ? { ...discount, status: DiscountStatus.EXPIRED } : discount
        ),
        loading: false 
      }));
      
      // Refresh stats
      loadDiscountStats();
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadDiscountStats]);

  // Get discounts for a specific student
  const getStudentDiscounts = useCallback(async (studentId: string): Promise<Discount[]> => {
    try {
      return await discountsApiService.getDiscountsByStudentId(studentId);
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ ...prev, error: apiError.message }));
      throw apiError;
    }
  }, []);

  // Search discounts
  const searchDiscounts = useCallback(async (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
    // loadDiscounts will be called by useEffect when searchTerm changes
  }, []);

  // Set filters
  const setFilters = useCallback((filters: DiscountFilters) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...filters, page: 1 } }));
    // loadDiscounts will be called by useEffect when filters change
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, page } }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadDiscounts(), loadDiscountStats(), loadDiscountTypes()]);
  }, [loadDiscounts, loadDiscountStats, loadDiscountTypes]);

  // Check if discount can be applied
  const canApplyDiscount = useCallback(async (studentId: string, reason: string): Promise<boolean> => {
    try {
      return await discountsApiService.canApplyDiscount(studentId, reason);
    } catch (err) {
      console.error('Failed to check discount eligibility:', err);
      return false;
    }
  }, []);

  // Bulk expire discounts
  const bulkExpireDiscounts = useCallback(async (discountIds: string[]): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await discountsApiService.bulkExpireDiscounts(discountIds);
      
      // Optimistic update - update status for all expired discounts
      setState(prev => ({ 
        ...prev, 
        discounts: prev.discounts.map(discount => 
          discountIds.includes(discount.id) 
            ? { ...discount, status: DiscountStatus.EXPIRED } 
            : discount
        ),
        loading: false 
      }));
      
      // Refresh stats
      loadDiscountStats();
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadDiscountStats]);

  // Load initial data and reload when filters/search change
  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await discountsApiService.getDiscounts({
          ...state.filters,
          search: state.searchTerm || undefined
        });
        
        setState(prev => ({ 
          ...prev, 
          discounts: response.items,
          pagination: response.pagination,
          loading: false 
        }));
      } catch (err) {
        const apiError = handleApiError(err);
        setState(prev => ({ 
          ...prev, 
          error: apiError.message, 
          loading: false,
          discounts: [],
          pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
        }));
      }
    };
    
    loadData();
  }, [state.filters, state.searchTerm]);

  // Load stats and types on mount
  useEffect(() => {
    loadDiscountStats();
    loadDiscountTypes();
  }, [loadDiscountStats, loadDiscountTypes]);

  return {
    // State
    discounts: state.discounts,
    discountTypes: state.discountTypes,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    searchTerm: state.searchTerm,
    filters: state.filters,
    pagination: state.pagination,
    
    // Actions
    loadDiscounts,
    loadDiscountStats,
    loadDiscountTypes,
    createDiscount,
    updateDiscount,
    applyDiscount,
    expireDiscount,
    getStudentDiscounts,
    searchDiscounts,
    setFilters,
    setPage,
    clearError,
    refreshData,
    canApplyDiscount,
    bulkExpireDiscounts
  };
};