import { useState, useEffect, useCallback } from 'react';
import { 
  adminChargesApiService, 
  AdminCharge, 
  CreateAdminChargeDto, 
  UpdateAdminChargeDto, 
  AdminChargeStats, 
  AdminChargeFilters,
  ApplyChargeDto,
  AdminChargeType 
} from '../services/adminChargesApiService';
import { handleApiError } from '../utils/errorHandler';

interface UseAdminChargesState {
  charges: AdminCharge[];
  loading: boolean;
  error: string | null;
  stats: AdminChargeStats | null;
  searchTerm: string;
  filters: AdminChargeFilters;
}

interface UseAdminChargesActions {
  loadCharges: () => Promise<void>;
  loadChargeStats: () => Promise<void>;
  createCharge: (chargeData: CreateAdminChargeDto) => Promise<AdminCharge>;
  updateCharge: (id: string, updateData: UpdateAdminChargeDto) => Promise<AdminCharge>;
  deleteCharge: (id: string) => Promise<void>;
  applyChargeToStudents: (applyData: ApplyChargeDto) => Promise<void>;
  getStudentCharges: (studentId: string) => Promise<AdminCharge[]>;
  searchCharges: (term: string) => Promise<void>;
  setFilters: (filters: AdminChargeFilters) => void;
  bulkUpdateCharges: (chargeIds: string[], updateData: UpdateAdminChargeDto) => Promise<void>;
  bulkDeleteCharges: (chargeIds: string[]) => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export const useAdminCharges = (initialFilters: AdminChargeFilters = {}): UseAdminChargesState & UseAdminChargesActions => {
  const [state, setState] = useState<UseAdminChargesState>({
    charges: [],
    loading: false,
    error: null,
    stats: null,
    searchTerm: '',
    filters: initialFilters
  });

  // Load admin charges with current filters
  const loadCharges = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const charges = await adminChargesApiService.getAdminCharges({
        ...state.filters,
        search: state.searchTerm || undefined
      });
      
      setState(prev => ({ 
        ...prev, 
        charges, 
        loading: false 
      }));
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
    }
  }, []);

  // Load admin charge statistics
  const loadChargeStats = useCallback(async () => {
    try {
      const stats = await adminChargesApiService.getAdminChargeStats();
      setState(prev => ({ ...prev, stats }));
    } catch (err) {
      const apiError = handleApiError(err);
      console.error('Failed to load admin charge stats:', apiError.message);
    }
  }, []);

  // Create a new admin charge
  const createCharge = useCallback(async (chargeData: CreateAdminChargeDto): Promise<AdminCharge> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newCharge = await adminChargesApiService.createAdminCharge(chargeData);
      
      // Optimistic update - add to current list
      setState(prev => ({ 
        ...prev, 
        charges: [...prev.charges, newCharge],
        loading: false 
      }));
      
      // Refresh stats
      loadChargeStats();
      
      return newCharge;
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadChargeStats]);

  // Update an existing admin charge
  const updateCharge = useCallback(async (id: string, updateData: UpdateAdminChargeDto): Promise<AdminCharge> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedCharge = await adminChargesApiService.updateAdminCharge(id, updateData);
      
      // Optimistic update - update in current list
      setState(prev => ({ 
        ...prev, 
        charges: prev.charges.map(charge => 
          charge.id === id ? updatedCharge : charge
        ),
        loading: false 
      }));
      
      // Refresh stats
      loadChargeStats();
      
      return updatedCharge;
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadChargeStats]);

  // Delete an admin charge
  const deleteCharge = useCallback(async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await adminChargesApiService.deleteAdminCharge(id);
      
      // Optimistic update - remove from current list
      setState(prev => ({ 
        ...prev, 
        charges: prev.charges.filter(charge => charge.id !== id),
        loading: false 
      }));
      
      // Refresh stats
      loadChargeStats();
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadChargeStats]);

  // Apply charge to students
  const applyChargeToStudents = useCallback(async (applyData: ApplyChargeDto): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await adminChargesApiService.applyChargeToStudents(applyData);
      
      setState(prev => ({ ...prev, loading: false }));
      
      // Refresh stats
      loadChargeStats();
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadChargeStats]);

  // Get charges for a specific student
  const getStudentCharges = useCallback(async (studentId: string): Promise<AdminCharge[]> => {
    try {
      return await adminChargesApiService.getStudentCharges(studentId);
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ ...prev, error: apiError.message }));
      throw apiError;
    }
  }, []);

  // Search admin charges
  const searchCharges = useCallback(async (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
    // loadCharges will be called by useEffect when searchTerm changes
  }, []);

  // Set filters
  const setFilters = useCallback((filters: AdminChargeFilters) => {
    setState(prev => ({ ...prev, filters }));
    // loadCharges will be called by useEffect when filters change
  }, []);

  // Bulk update charges
  const bulkUpdateCharges = useCallback(async (chargeIds: string[], updateData: UpdateAdminChargeDto): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await adminChargesApiService.bulkUpdateCharges(chargeIds, updateData);
      
      // Refresh data after bulk operation
      await loadCharges();
      loadChargeStats();
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadCharges, loadChargeStats]);

  // Bulk delete charges
  const bulkDeleteCharges = useCallback(async (chargeIds: string[]): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await adminChargesApiService.bulkDeleteCharges(chargeIds);
      
      // Optimistic update - remove from current list
      setState(prev => ({ 
        ...prev, 
        charges: prev.charges.filter(charge => !chargeIds.includes(charge.id)),
        loading: false 
      }));
      
      // Refresh stats
      loadChargeStats();
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({ 
        ...prev, 
        error: apiError.message, 
        loading: false 
      }));
      throw apiError;
    }
  }, [loadChargeStats]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadCharges(), loadChargeStats()]);
  }, [loadCharges, loadChargeStats]);

  // Load initial data and reload when filters/search change
  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const charges = await adminChargesApiService.getAdminCharges({
          ...state.filters,
          search: state.searchTerm || undefined
        });
        
        setState(prev => ({ 
          ...prev, 
          charges, 
          loading: false 
        }));
      } catch (err) {
        const apiError = handleApiError(err);
        setState(prev => ({ 
          ...prev, 
          error: apiError.message, 
          loading: false 
        }));
      }
    };
    
    loadData();
  }, [state.filters, state.searchTerm]);

  // Load stats on mount
  useEffect(() => {
    loadChargeStats();
  }, [loadChargeStats]);

  return {
    // State
    charges: state.charges,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    searchTerm: state.searchTerm,
    filters: state.filters,
    
    // Actions
    loadCharges,
    loadChargeStats,
    createCharge,
    updateCharge,
    deleteCharge,
    applyChargeToStudents,
    getStudentCharges,
    searchCharges,
    setFilters,
    bulkUpdateCharges,
    bulkDeleteCharges,
    clearError,
    refreshData
  };
};