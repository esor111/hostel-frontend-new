/**
 * Authentication Guard Component
 * Handles routing based on authentication state
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BusinessSelection from '../../pages/BusinessSelection';
import { Loader2 } from 'lucide-react';
import { KahaLogo } from '../common/KahaLogo';

interface AuthGuardProps {
  children: React.ReactNode;
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
    <div className="text-center space-y-6">
      <KahaLogo size="xl" animated className="justify-center" clickable={false} />
      <div className="space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-lg font-medium text-gray-700">Loading...</p>
        <p className="text-sm text-gray-500">Checking authentication status</p>
      </div>
    </div>
  </div>
);

const ErrorScreen = ({ error }: { error: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
    <div className="text-center space-y-6 max-w-md mx-auto p-6">
      <KahaLogo size="lg" className="justify-center" clickable={false} />
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-red-600">Authentication Error</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
);

export default function AuthGuard({ children }: AuthGuardProps) {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (state.authState === 'unauthenticated') {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [state.authState, navigate, location.pathname]);

  // Show loading screen while checking authentication
  if (state.authState === 'loading') {
    return <LoadingScreen />;
  }

  // Show error screen if there's an authentication error
  if (state.authState === 'error' && state.error) {
    return <ErrorScreen error={state.error} />;
  }

  // Redirect to login if user is not authenticated (handled by useEffect, but keep as fallback)
  if (state.authState === 'unauthenticated') {
    return <LoadingScreen />;
  }

  // Show business selection if user is authenticated but hasn't selected a business
  if (state.authState === 'authenticated') {
    return <BusinessSelection />;
  }

  // User is fully authenticated (has selected a business), show the app
  if (state.authState === 'business_selected') {
    return <>{children}</>;
  }

  // Fallback to loading screen
  return <LoadingScreen />;
}