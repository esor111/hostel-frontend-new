import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SimpleAppState {
  loading: boolean;
  error: string | null;
}

interface SimpleAppContextType {
  state: SimpleAppState;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const SimpleAppContext = createContext<SimpleAppContextType | undefined>(undefined);

export function SimpleAppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state: SimpleAppState = {
    loading,
    error
  };

  const contextValue: SimpleAppContextType = {
    state,
    setLoading,
    setError
  };

  return (
    <SimpleAppContext.Provider value={contextValue}>
      {children}
    </SimpleAppContext.Provider>
  );
}

export function useSimpleAppContext() {
  const context = useContext(SimpleAppContext);
  if (context === undefined) {
    throw new Error('useSimpleAppContext must be used within a SimpleAppProvider');
  }
  return context;
}