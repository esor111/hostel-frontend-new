import { useState, useEffect, useCallback } from 'react';
import { studentsApiService } from '../services/studentsApiService';
import { handleApiError } from '../utils/errorHandler';
import {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  StudentStats,
  StudentFilters
} from '../types/api';

interface UseStudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
  stats: StudentStats | null;
  searchTerm: string;
  filters: StudentFilters;
}

interface UseStudentsActions {
  loadStudents: () => Promise<void>;
  loadStudentStats: () => Promise<void>;
  createStudent: (studentData: CreateStudentDto) => Promise<Student>;
  updateStudent: (id: string, updateData: UpdateStudentDto) => Promise<Student>;
  deleteStudent: (id: string) => Promise<void>;
  configureStudent: (id: string, configData: any) => Promise<any>;
  searchStudents: (term: string) => Promise<void>;
  setFilters: (filters: StudentFilters) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export const useStudents = (initialFilters: StudentFilters = {}): UseStudentsState & UseStudentsActions => {
  // Add safety check for React hooks
  if (typeof useState !== 'function') {
    throw new Error('useStudents must be called within a React component');
  }

  const [state, setState] = useState<UseStudentsState>({
    students: [],
    loading: false, // Start with false, will be set to true when loading starts
    error: null,
    stats: null,
    searchTerm: '',
    filters: initialFilters
  });

  // Load students with current filters
  const loadStudents = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const students = await studentsApiService.getStudents({
        ...state.filters,
        search: state.searchTerm || undefined
      });

      setState(prev => ({
        ...prev,
        students,
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
  }, [state.filters, state.searchTerm]);

  // Load student statistics
  const loadStudentStats = useCallback(async () => {
    try {
      const stats = await studentsApiService.getStudentStats();
      setState(prev => ({ ...prev, stats }));
    } catch (err) {
      const apiError = handleApiError(err);
      console.error('Failed to load student stats:', apiError.message);
    }
  }, []);

  // Create a new student
  const createStudent = useCallback(async (studentData: CreateStudentDto): Promise<Student> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const newStudent = await studentsApiService.createStudent(studentData);

      // Optimistic update - add to current list
      setState(prev => ({
        ...prev,
        students: [...prev.students, newStudent],
        loading: false
      }));

      // Refresh stats
      loadStudentStats();

      return newStudent;
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({
        ...prev,
        error: apiError.message,
        loading: false
      }));
      throw apiError;
    }
  }, [loadStudentStats]);

  // Update an existing student
  const updateStudent = useCallback(async (id: string, updateData: UpdateStudentDto): Promise<Student> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const updatedStudent = await studentsApiService.updateStudent(id, updateData);

      // Optimistic update - update in current list
      setState(prev => ({
        ...prev,
        students: prev.students.map(student =>
          student.id === id ? updatedStudent : student
        ),
        loading: false
      }));

      // Refresh stats if status changed
      if (updateData.status) {
        loadStudentStats();
      }

      return updatedStudent;
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({
        ...prev,
        error: apiError.message,
        loading: false
      }));
      throw apiError;
    }
  }, [loadStudentStats]);

  // Delete a student
  const deleteStudent = useCallback(async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      await studentsApiService.deleteStudent(id);

      // Optimistic update - remove from current list
      setState(prev => ({
        ...prev,
        students: prev.students.filter(student => student.id !== id),
        loading: false
      }));

      // Refresh stats
      loadStudentStats();
    } catch (err) {
      const apiError = handleApiError(err);
      setState(prev => ({
        ...prev,
        error: apiError.message,
        loading: false
      }));
      throw apiError;
    }
  }, [loadStudentStats]);

  // Search students
  const searchStudents = useCallback(async (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
    // loadStudents will be called by useEffect when searchTerm changes
  }, []);

  // Set filters
  const setFilters = useCallback((filters: StudentFilters) => {
    setState(prev => ({ ...prev, filters }));
    // loadStudents will be called by useEffect when filters change
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Configure student charges
  const configureStudent = useCallback(async (id: string, configData: any): Promise<any> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await studentsApiService.configureStudent(id, configData);

      // Refresh student data to get updated fees
      await loadStudents();

      setState(prev => ({ ...prev, loading: false }));

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
  }, [loadStudents]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([loadStudents(), loadStudentStats()]);
  }, [loadStudents, loadStudentStats]);

  // Load initial data and reload when filters/search change
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Load stats on mount
  useEffect(() => {
    loadStudentStats();
  }, [loadStudentStats]);

  return {
    // State
    students: state.students,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    searchTerm: state.searchTerm,
    filters: state.filters,

    // Actions
    loadStudents,
    loadStudentStats,
    createStudent,
    updateStudent,
    deleteStudent,
    configureStudent,
    searchStudents,
    setFilters,
    clearError,
    refreshData
  };
};