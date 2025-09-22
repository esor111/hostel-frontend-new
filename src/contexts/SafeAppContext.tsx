import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Minimal interfaces for safe context
interface SafeStudent {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomNumber: string;
  status: 'Active' | 'Inactive';
  currentBalance: number;
}

interface SafeAppState {
  students: SafeStudent[];
  loading: boolean;
  error: string | null;
}

interface SafeAppContextType {
  state: SafeAppState;
  setStudents: (students: SafeStudent[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
}

const SafeAppContext = createContext<SafeAppContextType | undefined>(undefined);

export function SafeAppProvider({ children }: { children: ReactNode }) {
  // Use individual useState hooks instead of useReducer to avoid the hook issue
  const [students, setStudents] = useState<SafeStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state: SafeAppState = {
    students,
    loading,
    error
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for now - replace with actual service calls later
      const mockStudents: SafeStudent[] = [
        {
          id: '1',
          name: 'John Doe',
          phone: '1234567890',
          email: 'john@example.com',
          roomNumber: '101',
          status: 'Active',
          currentBalance: 1500
        },
        {
          id: '2',
          name: 'Jane Smith',
          phone: '0987654321',
          email: 'jane@example.com',
          roomNumber: '102',
          status: 'Active',
          currentBalance: 2000
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStudents(mockStudents);
      console.log('✅ Safe context data loaded successfully');
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const contextValue: SafeAppContextType = {
    state,
    setStudents,
    setLoading,
    setError,
    refreshData
  };

  return (
    <SafeAppContext.Provider value={contextValue}>
      {children}
    </SafeAppContext.Provider>
  );
}

export function useSafeAppContext() {
  const context = useContext(SafeAppContext);
  if (context === undefined) {
    throw new Error('useSafeAppContext must be used within a SafeAppProvider');
  }
  return context;
}

// Export for backward compatibility
export { SafeAppProvider as AppProvider, useSafeAppContext as useAppContext };