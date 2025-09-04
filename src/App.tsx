
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/SafeAppContext";
import { SafeTooltipProvider } from "@/components/providers/SafeTooltipProvider";
import { KahaLogo } from "@/components/common/KahaLogo";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load components for better initial load performance
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const Ledger = lazy(() => import("./pages/Ledger"));
const HostelProfile = lazy(() => import("./pages/HostelProfile"));
const BookingRequests = lazy(() => import("./pages/BookingRequests"));
const RoomManagement = lazy(() => import("./pages/RoomManagement"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Notifications = lazy(() => import("./pages/Notifications"));
const InactiveStudents = lazy(() => import("./pages/InactiveStudents"));
const DashboardTest = lazy(() => import("./pages/DashboardTest"));
const BillingDashboard = lazy(() => import("./pages/BillingDashboard"));
const MonthlyBilling = lazy(() => import("./pages/MonthlyBilling"));

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
      <KahaLogo size="2xl" animated className="justify-center" />
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
        <AppProvider>
          <SafeTooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Landing" />}>
                      <Landing />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Admin Dashboard" />}>
                      <Index />
                    </Suspense>
                  }
                />
                <Route
                  path="/hostel"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Hostel Profile" />}>
                      <HostelProfile />
                    </Suspense>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Booking Requests" />}>
                      <BookingRequests />
                    </Suspense>
                  }
                />
                <Route
                  path="/rooms"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Room Management" />}>
                      <RoomManagement />
                    </Suspense>
                  }
                />
                <Route
                  path="/ledger"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Ledger" />}>
                      <Ledger />
                    </Suspense>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Checkout" />}>
                      <Ledger />
                    </Suspense>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Analytics" />}>
                      <Analytics />
                    </Suspense>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Attendance" />}>
                      <Attendance />
                    </Suspense>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Notifications" />}>
                      <Notifications />
                    </Suspense>
                  }
                />
                <Route
                  path="/inactive"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Inactive Students" />}>
                      <InactiveStudents />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard-test"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Dashboard Test" />}>
                      <DashboardTest />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin/billing-dashboard"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Billing Dashboard" />}>
                      <BillingDashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin/monthly-billing"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Monthly Billing" />}>
                      <MonthlyBilling />
                    </Suspense>
                  }
                />
                <Route
                  path="/test-safe"
                  element={
                    <Suspense fallback={<LoadingFallback componentName="Safe Context Test" />}>
                      <TestSafeContext />
                    </Suspense>
                  }
                />

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
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
