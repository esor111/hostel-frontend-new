/**
 * Authentication Context for Multi-Hostel Authentication
 * Manages user login, business selection, and authentication state
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService, LoginCredentials, Business, AuthTokens } from '../services/authService';

// Authentication states
export type AuthState = 
  | 'loading'           // Initial load, checking existing tokens
  | 'unauthenticated'   // No user token
  | 'authenticated'     // Has user token, no business selected
  | 'business_selected' // Has both user and business tokens
  | 'error';            // Authentication error

export interface AuthContextState {
  authState: AuthState;
  userToken: string | null;
  businessToken: string | null;
  selectedBusiness: Business | null;
  availableBusinesses: Business[];
  error: string | null;
  loading: boolean;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { userToken: string } }
  | { type: 'SET_BUSINESSES'; payload: Business[] }
  | { type: 'SELECT_BUSINESS'; payload: { business: Business; businessToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_BUSINESS_SELECTION' }
  | { type: 'RESTORE_AUTH_STATE'; payload: AuthTokens };

const initialState: AuthContextState = {
  authState: 'loading',
  userToken: null,
  businessToken: null,
  selectedBusiness: null,
  availableBusinesses: [],
  error: null,
  loading: true,
};

function authReducer(state: AuthContextState, action: AuthAction): AuthContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loading: false,
        authState: action.payload ? 'error' : state.authState
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        userToken: action.payload.userToken,
        authState: 'authenticated',
        error: null,
        loading: false,
      };

    case 'SET_BUSINESSES':
      return {
        ...state,
        availableBusinesses: action.payload,
        loading: false,
      };

    case 'SELECT_BUSINESS':
      return {
        ...state,
        selectedBusiness: action.payload.business,
        businessToken: action.payload.businessToken,
        authState: 'business_selected',
        error: null,
        loading: false,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        authState: 'unauthenticated',
        loading: false,
      };

    case 'CLEAR_BUSINESS_SELECTION':
      return {
        ...state,
        selectedBusiness: null,
        businessToken: null,
        authState: 'authenticated',
        error: null,
      };

    case 'RESTORE_AUTH_STATE':
      const { userToken, businessToken, selectedBusiness } = action.payload;
      let authState: AuthState = 'unauthenticated';
      
      if (userToken && businessToken && selectedBusiness) {
        authState = 'business_selected';
      } else if (userToken) {
        authState = 'authenticated';
      }

      return {
        ...state,
        userToken,
        businessToken,
        selectedBusiness,
        authState,
        loading: false,
      };

    default:
      return state;
  }
}

export interface AuthContextType {
  state: AuthContextState;
  
  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  selectBusiness: (business: Business) => Promise<void>;
  clearBusinessSelection: () => void;
  
  // Utility functions
  isLoggedIn: () => boolean;
  hasSelectedBusiness: () => boolean;
  isFullyAuthenticated: () => boolean;
  getApiToken: () => string | null;
  
  // Business management
  refreshBusinesses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ========================================
  // AUTHENTICATION ACTIONS
  // ========================================

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('🔐 Starting login process...');
      
      // Step 1: Login and get businesses
      const businesses = await authService.authenticateUser(credentials);
      
      // Update state
      dispatch({ type: 'LOGIN_SUCCESS', payload: { userToken: authService.getUserToken()! } });
      dispatch({ type: 'SET_BUSINESSES', payload: businesses });
      
      console.log('✅ Login successful, fetched businesses');
    } catch (error) {
      console.error('❌ Login failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Login failed' });
    }
  };

  const selectBusiness = async (business: Business): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('🏢 Selecting business:', business.name);
      
      // Switch profile and get business token
      const result = await authService.selectBusiness(business);
      
      // Update state
      dispatch({ 
        type: 'SELECT_BUSINESS', 
        payload: { 
          business, 
          businessToken: result.accessToken 
        } 
      });
      
      console.log('✅ Business selected successfully');
    } catch (error) {
      console.error('❌ Business selection failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Business selection failed' });
    }
  };

  const logout = (): void => {
    console.log('🚪 Logging out...');
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const clearBusinessSelection = (): void => {
    console.log('🔄 Clearing business selection...');
    authService.clearBusinessSelection();
    dispatch({ type: 'CLEAR_BUSINESS_SELECTION' });
  };

  const refreshBusinesses = async (): Promise<void> => {
    if (!state.userToken) {
      throw new Error('No user token available');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const businesses = await authService.fetchBusinesses();
      dispatch({ type: 'SET_BUSINESSES', payload: businesses });
    } catch (error) {
      console.error('❌ Failed to refresh businesses:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh businesses' });
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const isLoggedIn = (): boolean => {
    return state.authState !== 'unauthenticated' && state.authState !== 'loading';
  };

  const hasSelectedBusiness = (): boolean => {
    return state.authState === 'business_selected';
  };

  const isFullyAuthenticated = (): boolean => {
    return state.authState === 'business_selected';
  };

  const getApiToken = (): string | null => {
    return state.businessToken || state.userToken;
  };

  // ========================================
  // INITIALIZATION
  // ========================================

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');
      
      try {
        // Check if tokens are valid
        const isValid = await authService.refreshAuthenticationIfNeeded();
        
        if (!isValid) {
          // Tokens were expired and cleared
          dispatch({ type: 'LOGOUT' });
          return;
        }

        // Restore auth state from localStorage
        const tokens = authService.getAuthTokens();
        dispatch({ type: 'RESTORE_AUTH_STATE', payload: tokens });

        // If we have a user token but no businesses, fetch them
        if (tokens.userToken && state.availableBusinesses.length === 0) {
          try {
            const businesses = await authService.fetchBusinesses();
            dispatch({ type: 'SET_BUSINESSES', payload: businesses });
          } catch (error) {
            console.warn('Failed to fetch businesses during initialization:', error);
            // Don't fail initialization if business fetch fails
          }
        }

        console.log('✅ Authentication initialized');
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
      }
    };

    initializeAuth();
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    selectBusiness,
    clearBusinessSelection,
    isLoggedIn,
    hasSelectedBusiness,
    isFullyAuthenticated,
    getApiToken,
    refreshBusinesses,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}