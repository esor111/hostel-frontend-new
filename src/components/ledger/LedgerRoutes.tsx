import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import {
  DashboardRoute,
  StudentManagementRoute,
  PaymentRecordingRoute,
  StudentLedgerRoute,
  DiscountManagementRoute,
  BillingManagementRoute,
  AdminChargingRoute,
  StudentCheckoutRoute,
  ApiTestRoute,
  SectionLoader
} from "./routes";

export const LedgerRoutes = () => {
  return (
    <Routes>
      {/* Default route - redirect to dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* Dashboard Route */}
      <Route
        path="dashboard"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="Dashboard" />}>
              <DashboardRoute />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* Student Management Route */}
      <Route
        path="students"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="Student Management" />}>
              <StudentManagementRoute />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* Payment Recording Route */}
      <Route
        path="payments"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="Payment Recording" />}>
              <PaymentRecordingRoute />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* Student Ledger Route */}
      <Route
        path="ledger"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="Student Ledger" />}>
              <StudentLedgerRoute />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* Billing Management Route */}
      <Route
        path="billing"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="Billing Management" />}>
              <BillingManagementRoute />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* Discount Management Route */}
      <Route
        path="discounts"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="Discount Management" />}>
              <DiscountManagementRoute />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* Admin Charging Route */}
      <Route
        path="admin-charging"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="Admin Charging" />}>
              <AdminChargingRoute />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* Student Checkout Route */}
      <Route
        path="checkout"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="Student Checkout" />}>
              <StudentCheckoutRoute />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* API Test Route */}
      <Route
        path="api-test"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="API Test" />}>
              <ApiTestRoute />
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* Catch-all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};