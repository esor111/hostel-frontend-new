import { lazy } from "react";
import { KahaLogo } from "@/components/common/KahaLogo";

// Loading component for lazy-loaded sections
export const SectionLoader = ({ sectionName }: { sectionName: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center space-y-4">
      <KahaLogo size="md" animated={true} className="mx-auto" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-24 mx-auto"></div>
      </div>
      <p className="text-sm text-gray-500">Loading {sectionName}...</p>
    </div>
  </div>
);

// Route-level lazy loading for optimal code splitting
export const LazyDashboard = lazy(() =>
  import("@/components/ledger/Dashboard").then(module => ({
    default: module.Dashboard
  }))
);

export const LazyStudentManagement = lazy(() =>
  import("@/components/ledger/StudentManagement").catch(err => {
    console.error('Failed to load StudentManagement:', err);
    return { default: () => <div>Error loading Student Management</div> };
  })
);

export const LazyPaymentRecording = lazy(() =>
  import("@/components/ledger/PaymentRecording").then(module => ({
    default: module.PaymentRecording
  }))
);

export const LazyStudentLedgerView = lazy(() =>
  import("@/components/ledger/StudentLedgerView").then(module => ({
    default: module.StudentLedgerView
  }))
);

export const LazyDiscountManagement = lazy(() =>
  import("@/components/ledger/DiscountManagement").then(module => ({
    default: module.DiscountManagement
  }))
);

export const LazyBillingManagement = lazy(() =>
  import("@/components/ledger/BillingManagement").then(module => ({
    default: module.BillingManagement
  }))
);

export const LazyAdminCharging = lazy(() =>
  import("@/components/ledger/AdminCharging").then(module => ({
    default: module.AdminCharging
  }))
);

export const LazyStudentCheckoutManagement = lazy(() =>
  import("@/components/ledger/StudentCheckoutManagement").then(module => ({
    default: module.StudentCheckoutManagement
  }))
);

export const LazyApiTestComponent = lazy(() =>
  import("@/components/debug/ApiTestComponent").then(module => ({
    default: module.ApiTestComponent
  }))
);

// Export lazy components directly - no wrapper functions to avoid re-creation
export {
  LazyDashboard as DashboardRoute,
  LazyStudentManagement as StudentManagementRoute,
  LazyPaymentRecording as PaymentRecordingRoute,
  LazyStudentLedgerView as StudentLedgerRoute,
  LazyDiscountManagement as DiscountManagementRoute,
  LazyBillingManagement as BillingManagementRoute,
  LazyAdminCharging as AdminChargingRoute,
  LazyStudentCheckoutManagement as StudentCheckoutRoute,
  LazyApiTestComponent as ApiTestRoute
};