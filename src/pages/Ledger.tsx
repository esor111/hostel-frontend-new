
import { useState, useEffect, Suspense, lazy } from "react";
import { Sidebar } from "@/components/ledger/Sidebar";
import { Dashboard } from "@/components/ledger/Dashboard";
import { PerformanceMonitor } from "@/components/common/PerformanceMonitor.tsx";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Lazy load heavy components for better performance
const StudentManagement = lazy(() => 
  import("@/components/ledger/StudentManagement").catch(err => {
    console.error('Failed to load StudentManagement:', err);
    return { default: () => <div>Error loading Student Management</div> };
  })
);
const PaymentRecording = lazy(() => import("@/components/ledger/PaymentRecording").then(module => ({ default: module.PaymentRecording })));
const StudentLedgerView = lazy(() => import("@/components/ledger/StudentLedgerView").then(module => ({ default: module.StudentLedgerView })));
const DiscountManagement = lazy(() => import("@/components/ledger/DiscountManagement").then(module => ({ default: module.DiscountManagement })));
const BillingManagement = lazy(() => import("@/components/ledger/BillingManagement").then(module => ({ default: module.BillingManagement })));
const AdminCharging = lazy(() => import("@/components/ledger/AdminCharging").then(module => ({ default: module.AdminCharging })));
const StudentCheckoutManagement = lazy(() => import("@/components/ledger/StudentCheckoutManagement").then(module => ({ default: module.StudentCheckoutManagement })));
const ApiTestComponent = lazy(() => import("@/components/debug/ApiTestComponent").then(module => ({ default: module.ApiTestComponent })));

import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { KahaLogo } from "@/components/common/KahaLogo";

// Loading component for lazy-loaded sections
const SectionLoader = ({ sectionName }: { sectionName: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center space-y-4">
      <KahaLogo size="md" animated className="mx-auto" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto"></div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-24 mx-auto"></div>
      </div>
      <p className="text-sm text-gray-500">Loading {sectionName}...</p>
    </div>
  </div>
);

const Ledger = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section) {
      const sectionMap: Record<string, string> = {
        'dashboard': 'dashboard',
        'students': 'students',
        'student-management': 'students', // ✅ Add mapping for student-management
        'payments': 'payments',
        'ledger': 'ledger',
        'ledgers': 'ledger',
        'discounts': 'discounts',
        'billing': 'billing',
        'admin-charging': 'admin-charging',
        'checkout': 'checkout'
      };
      if (sectionMap[section]) {
        setActiveTab(sectionMap[section]);
      }
    }
  }, [location.search]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "students":
        return (
          <ErrorBoundary>
            <Suspense fallback={<SectionLoader sectionName="Student Management" />}>
              <StudentManagement />
            </Suspense>
          </ErrorBoundary>
        );
      case "payments":
        return (
          <Suspense fallback={<SectionLoader sectionName="Payment Recording" />}>
            <PaymentRecording />
          </Suspense>
        );
      case "ledger":
        return (
          <Suspense fallback={<SectionLoader sectionName="Student Ledger" />}>
            <StudentLedgerView />
          </Suspense>
        );
      case "discounts":
        return (
          <Suspense fallback={<SectionLoader sectionName="Discount Management" />}>
            <DiscountManagement />
          </Suspense>
        );
      case "billing":
        return (
          <Suspense fallback={<SectionLoader sectionName="Billing Management" />}>
            <BillingManagement />
          </Suspense>
        );
      case "admin-charging":
        return (
          <Suspense fallback={<SectionLoader sectionName="Admin Charging" />}>
            <AdminCharging />
          </Suspense>
        );
      case "checkout":
        return (
          <Suspense fallback={<SectionLoader sectionName="Student Checkout" />}>
            <StudentCheckoutManagement />
          </Suspense>
        );
      case "api-test":
        return (
          <Suspense fallback={<SectionLoader sectionName="API Test" />}>
            <ApiTestComponent />
          </Suspense>
        );
      case "debug-admin":
        const DebugAdminCharges = lazy(() => import("@/debug-admin-charges"));
        return (
          <Suspense fallback={<SectionLoader sectionName="Debug Admin Charges" />}>
            <DebugAdminCharges />
          </Suspense>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex relative">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#07A64F]/10 to-[#1295D0]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#1295D0]/10 to-[#07A64F]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#07A64F]/5 to-[#1295D0]/5 rounded-full blur-3xl"></div>
      </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col relative z-10">
        {/* Premium Glass Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5 px-8 py-6 relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/5 via-transparent to-[#1295D0]/5 pointer-events-none"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-6">
              {/* Enhanced Logo with Glow Effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/20 to-[#1295D0]/20 rounded-2xl blur-lg"></div>
                <div className="relative w-14 h-14 bg-white rounded-2xl shadow-lg shadow-black/10 p-2 border border-white/50">
                  <svg viewBox="0 0 55 83" className="w-full h-full" fill="none">
                    <g clipPath="url(#clip0_319_901)">
                      <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F"/>
                      <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F"/>
                      <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#1295D0"/>
                      <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white"/>
                      <path d="M39.4394 19.6287L15.4894 19.6802C15.2283 19.6802 15.0155 19.8926 15.0155 20.1533C15.0155 20.414 15.2283 20.6264 15.4894 20.6264L19.5037 20.6168L19.5101 22.9084C19.4875 22.8891 19.4682 22.8666 19.4456 22.8473C19.4424 22.8441 19.4392 22.8408 19.436 22.8408C18.7653 22.2261 17.869 21.8527 16.8855 21.8527C14.7994 21.8527 13.1067 23.5425 13.1067 25.6249C13.1067 26.0788 13.1873 26.5133 13.3324 26.9156C13.6709 27.8458 14.3674 28.6054 15.2541 29.0302C15.7474 29.2652 16.2987 29.3972 16.8823 29.3972C17.2789 29.3972 17.6626 29.336 18.0237 29.2234C18.5912 29.0431 19.1006 28.7341 19.5166 28.3286L19.523 31.5408C19.523 31.8015 19.7358 32.0139 19.997 32.0139H20.155C20.4161 32.0139 20.6289 31.8015 20.6289 31.5408L20.6193 27.1892C20.6999 27.0089 20.7805 26.8319 20.8675 26.6549C21.0707 26.2268 21.306 25.8406 21.6478 25.5123C22.2733 24.9136 23.1503 24.5789 24.0177 24.6787C24.3885 24.7205 24.7947 24.8686 25.0817 25.1003C25.3815 25.3417 25.5879 25.6636 25.7007 26.0015C25.9522 26.7386 25.8716 27.5271 25.475 28.232C24.9882 29.101 24.1531 29.7061 23.2664 30.1342C23.0375 30.2437 22.9762 30.5752 23.0987 30.7812C23.2374 31.0161 23.5147 31.0612 23.7468 30.9485C24.698 30.4915 25.5685 29.8252 26.1521 28.9369C26.7228 28.0679 26.9292 26.9961 26.6809 25.9854C26.4262 24.9523 25.662 24.1283 24.627 23.8418C23.5695 23.5489 22.3829 23.8032 21.493 24.4308C21.1738 24.6561 20.8869 24.9201 20.6418 25.2226C20.6354 25.1615 20.6257 25.0971 20.616 25.0359L20.6064 20.62L32.8619 20.5942C32.8554 20.6232 32.8522 20.6522 32.8522 20.6844C32.8554 21.1028 32.8554 21.5244 32.8586 21.9428C32.8586 22.1263 32.8586 22.3098 32.8619 22.4932C32.8619 22.5125 32.8554 22.5834 32.8522 22.6477C32.7587 22.6413 32.6039 22.6381 32.5072 22.6188C32.346 22.5898 32.188 22.5544 32.0268 22.5286C31.6528 22.4675 31.2658 22.4449 30.9047 22.5866C30.2147 22.8537 29.7375 23.5264 29.7795 24.2763C29.7891 24.4727 29.831 24.6594 29.9052 24.8428C29.9374 24.9201 29.9729 24.9941 30.0116 25.0713C30.018 25.0874 30.0374 25.1261 30.0503 25.155C29.4312 25.5187 28.9121 26.053 28.5929 26.7C28.0416 27.8297 28.0287 29.1879 28.6187 30.308C29.2829 31.5697 30.6468 32.3486 32.0107 32.6158C32.2621 32.6641 32.5233 32.545 32.591 32.2843C32.6555 32.0525 32.5104 31.7532 32.2589 31.7049C31.2884 31.515 30.3276 31.0676 29.7182 30.2791C29.1024 29.4841 28.9766 28.4541 29.2765 27.5207C29.5667 26.6195 30.2986 25.9468 31.1917 25.6829C32.0655 25.4222 33.0714 25.538 33.7743 26.111C34.1645 26.4296 34.4805 26.8512 34.6417 27.289C34.8287 27.7943 34.8577 28.2545 34.7029 28.7502C34.5224 29.3328 35.4381 29.5806 35.6154 28.998C35.9733 27.8393 35.5574 26.5809 34.7416 25.7183C33.884 24.8138 32.6458 24.4759 31.4303 24.6561C31.2723 24.6787 31.1143 24.7141 30.9595 24.7591C30.9273 24.7302 30.8983 24.7012 30.866 24.6755C30.8596 24.6594 30.8499 24.6433 30.8467 24.6336C30.7887 24.5177 30.7338 24.4083 30.7209 24.2763C30.7016 24.0864 30.7596 23.8708 30.8693 23.7324C31.2078 23.2979 31.7334 23.4331 32.2202 23.5232C32.5459 23.5811 32.8973 23.6391 33.2198 23.5457C33.5841 23.4427 33.7872 23.1434 33.8034 22.7765C33.8356 22.0812 33.7969 21.3732 33.7969 20.6779C33.7969 20.6457 33.7937 20.6168 33.7872 20.5878L36.7278 20.5814L36.7504 31.5086C36.7504 31.7693 36.9632 31.9817 37.2243 31.9817H37.3823C37.6435 31.9817 37.8563 31.7693 37.8563 31.5086L37.8337 20.5814L39.4362 20.5782C39.6973 20.5782 39.9102 20.3657 39.9102 20.105C39.9134 19.8411 39.7006 19.6287 39.4394 19.6287ZM14.0643 25.6249C14.0643 24.0671 15.3282 22.8054 16.8888 22.8054C17.6433 22.8054 18.33 23.1015 18.8362 23.5843C19.1296 23.8644 19.3618 24.2055 19.5133 24.5885L19.5166 26.6485C19.1522 27.5754 18.3107 28.2674 17.2918 28.4123C17.1596 28.4316 17.0242 28.4412 16.8855 28.4412C16.4696 28.4412 16.073 28.3511 15.7151 28.187C14.9929 27.8587 14.4319 27.231 14.19 26.465C14.1094 26.2043 14.0643 25.9211 14.0643 25.6249Z" fill="#231F20"/>
                      <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_319_901">
                        <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
              
              {/* Enhanced Brand Section */}
              <div className="border-l border-slate-200/60 pl-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#07A64F] via-[#1295D0] to-[#07A64F] bg-clip-text text-transparent tracking-tight">
                  Kaha KLedger
                </h1>
                <p className="text-slate-600 font-medium tracking-wide">
                  Premium Financial Management Suite
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-[#07A64F] rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-500 font-medium">Live System Active</span>
                </div>
              </div>
            </div>
            
            {/* Premium Action Buttons */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('payments')}
                  className="border-[#07A64F]/30 text-[#07A64F] hover:bg-[#07A64F]/10 hover:border-[#07A64F]/50 hover:shadow-lg hover:shadow-[#07A64F]/20 transition-all duration-300 backdrop-blur-sm bg-white/50"
                >
                  <span className="mr-2">💰</span>
                  Record Payment
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('billing')}
                  className="border-[#1295D0]/30 text-[#1295D0] hover:bg-[#1295D0]/10 hover:border-[#1295D0]/50 hover:shadow-lg hover:shadow-[#1295D0]/20 transition-all duration-300 backdrop-blur-sm bg-white/50"
                >
                  <span className="mr-2">📊</span>
                  View Billing
                </Button>
              </div>
              
              <div className="w-px h-8 bg-slate-200"></div>
              
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/50"
              >
                <span className="mr-2">←</span>
                Admin Panel
              </Button>
            </div>
          </div>
          
          {/* Enhanced Breadcrumb */}
          <div className="mt-4 flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100/60 rounded-full backdrop-blur-sm">
              <span className="text-slate-500">Admin Panel</span>
              <span className="text-slate-300">›</span>
              <span className="text-[#07A64F] font-semibold">Kaha KLedger</span>
              <span className="text-slate-300">›</span>
              <span className="capitalize text-slate-700 font-semibold bg-white/60 px-2 py-0.5 rounded-md">
                {activeTab === 'ledger' ? 'Student Ledgers' : activeTab.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Premium Content Area */}
        <div className="flex-1 p-8 bg-gradient-to-br from-white/50 via-slate-50/30 to-white/50 backdrop-blur-sm relative overflow-auto">
          {/* Content Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #07A64F 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
          
          <div className="relative z-10">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Performance Monitor - only show in development */}
      {import.meta.env.DEV && <PerformanceMonitor />}
    </div>
  );
};

export default Ledger;
