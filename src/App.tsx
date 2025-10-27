
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/SafeAppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SafeTooltipProvider } from "@/components/providers/SafeTooltipProvider";
import { KahaLogo } from "@/components/common/KahaLogo";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AuthGuard from "@/components/auth/AuthGuard";
import { performanceManager } from "@/utils/performance.js";

// Lazy load components for better initial load performance
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Index = lazy(() => import("./pages/Index"));
const LedgerLayout = lazy(() => import("./components/ledger/LedgerLayout").then(module => ({ default: module.LedgerLayout })));
const HostelProfile = lazy(() => import("./pages/HostelProfile"));
const BookingRequests = lazy(() => import("./pages/BookingRequests"));
const RoomManagement = lazy(() => import("./pages/RoomManagement"));
const AddRoom = lazy(() => import("./pages/AddRoom"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Notifications = lazy(() => import("./pages/Notifications"));

const DashboardTest = lazy(() => import("./pages/DashboardTest"));
const BillingDashboard = lazy(() => import("./pages/BillingDashboard"));
const MonthlyBilling = lazy(() => import("./pages/MonthlyBilling"));
const Settings = lazy(() => import("./pages/Settings"));

const TestSafeContext = lazy(() => import("./pages/TestSafeContext"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
    },
  },
});

// Loading component with Kaha logo
const LoadingFallback = ({ componentName }: { componentName?: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
    <div className="text-center space-y-6">
      <KahaLogo size="2xl" animated className="justify-center" clickable={false} />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mx-auto"></div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-32 mx-auto"></div>
      </div>
      {componentName && (
        <p className="text-sm text-gray-500 font-medium">Loading {componentName}...</p>
      )}
      <div className="text-xs text-gray-400">Kaha Hostel Control Center</div>
    </div>
  </div>
);

const App = () => {
  useEffect(() => {
    console.log('🚀 Kaha Hostel Control Center starting...');
    
    // Performance manager is already initialized via constructor
    console.log('✅ Performance manager loaded');
    
    // Add manual cache clearing function to window for debugging
    if (import.meta.env.DEV) {
      (window as any).clearAllCaches = async () => {
        console.log('🧹 Manually clearing all caches...');
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration.active) {
            registration.active.postMessage({ type: 'CLEAR_CACHE' });
          }
        }
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('✅ Cleared all caches:', cacheNames);
        }
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Cleared all storage. Please refresh the page.');
      };
      
      // Trigger cache clearing immediately in development
      setTimeout(async () => {
        console.log('🧹 Auto-clearing caches in development...');
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          if (cacheNames.length > 0) {
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('✅ Auto-cleared caches:', cacheNames);
          }
        }
      }, 1000);
    }
    
    // Clear any corrupted localStorage data
    try {
      localStorage.removeItem('clickPatterns');
      console.log('✅ Cleared corrupted localStorage data');
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            <SafeTooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public Routes - No Authentication Required */}
                    <Route
                      path="/"
                      element={
                        <Suspense fallback={<LoadingFallback componentName="Landing" />}>
                          <Landing />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <Suspense fallback={<LoadingFallback componentName="Login" />}>
                          <Login />
                        </Suspense>
                      }
                    />

                    {/* Protected Routes - Authentication Required */}
                    <Route
                      path="/admin"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Admin Dashboard" />}>
                            <Index />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/hostel"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Hostel Profile" />}>
                            <HostelProfile />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/bookings"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Booking Requests" />}>
                            <BookingRequests />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/rooms"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Room Management" />}>
                            <RoomManagement />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/addroom"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Add Room" />}>
                            <AddRoom />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/ledger/*"
                      element={
                        <AuthGuard>
                          <LedgerLayout />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Checkout" />}>
                            <LedgerLayout />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Analytics" />}>
                            <Analytics />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/attendance"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Attendance" />}>
                            <Attendance />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Notifications" />}>
                            <Notifications />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/dashboard-test"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Dashboard Test" />}>
                            <DashboardTest />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin/billing-dashboard"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Billing Dashboard" />}>
                            <BillingDashboard />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin/monthly-billing"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Monthly Billing" />}>
                            <MonthlyBilling />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/test-safe"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Safe Context Test" />}>
                            <TestSafeContext />
                          </Suspense>
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <AuthGuard>
                          <Suspense fallback={<LoadingFallback componentName="Settings" />}>
                            <Settings />
                          </Suspense>
                        </AuthGuard>
                      }
                    />

                    {/* 404 Route */}
                    <Route
                      path="*"
                      element={
                        <Suspense fallback={<LoadingFallback componentName="404 Page" />}>
                          <NotFound />
                        </Suspense>
                      }
                    />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </SafeTooltipProvider>
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
