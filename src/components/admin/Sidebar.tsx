
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Bed,
  BarChart3,
  Settings,
  BookOpen,
  Bell,
  Calculator,
  CreditCard,
  UserCheck
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { KahaLogo } from "@/components/ui/KahaLogo";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
}

export const Sidebar = ({ activeTab, onTabChange, collapsed = false }: SidebarProps) => {
  const { translations } = useLanguage();

  const mainMenuItems = [
    { id: "dashboard", label: translations.dashboard, icon: LayoutDashboard },
    { id: "bookings", label: translations.bookings, icon: CalendarCheck },
    { id: "rooms", label: translations.rooms, icon: Bed },
    { id: "analytics", label: translations.analytics, icon: BarChart3 },
    { id: "attendance", label: "Attendance", icon: UserCheck },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: translations.hostelProfile, icon: Building2 },
  ];

  const billingMenuItems = [];

  const adminMenuItems = [];

  return (
    <div className="h-screen bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className={`border-b border-gray-200 bg-gradient-to-r from-[#07A64F]/10 to-[#1295D0]/10 flex-shrink-0 transition-all duration-300 ${collapsed ? 'p-3' : 'p-6'}`}>
        <div className="flex items-center gap-3">
          <KahaLogo size={collapsed ? "sm" : "md"} />
          {!collapsed && (
            <div className="transition-opacity duration-300">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#07A64F] to-[#1295D0] bg-clip-text text-transparent">
                Kaha
              </h2>
              <p className="text-xs text-gray-600 font-medium">Control Center</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? 'p-2' : 'p-4'} space-y-3`}>
        {/* Enhanced Main Menu Items */}
        {mainMenuItems.map((item, index) => {
          const Icon = item.icon;
          const gradients = [
            'from-[#1295D0] to-[#1295D0]/80',
            'from-[#07A64F] to-[#07A64F]/80',
            'from-[#1295D0] to-[#07A64F]',
            'from-[#07A64F] to-[#1295D0]',
            'from-[#1295D0]/80 to-[#07A64F]/80'
          ];

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group w-full flex items-center rounded-xl text-left transition-all duration-300 ${
                collapsed 
                  ? 'justify-center p-3' 
                  : 'gap-4 px-4 py-3'
              } ${activeTab === item.id
                  ? "bg-gradient-to-r from-[#1295D0]/10 to-[#07A64F]/10 text-[#1295D0] border border-[#1295D0]/30 shadow-md transform scale-105"
                  : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:scale-102"
                }`}
              title={collapsed ? item.label : undefined}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === item.id
                  ? `bg-gradient-to-br ${gradients[index]} text-white shadow-lg`
                  : `bg-gray-100 group-hover:bg-gradient-to-br group-hover:${gradients[index]} group-hover:text-white`
                }`}>
                <Icon className="h-4 w-4" />
              </div>
              {!collapsed && (
                <>
                  <span className="font-semibold transition-opacity duration-300">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </>
              )}
            </button>
          );
        })}

        {/* Enhanced Admin Tools Section */}
        {adminMenuItems.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            {!collapsed && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Admin Tools</p>
              </div>
            )}
            {adminMenuItems.map((item, index) => {
              const Icon = item.icon;
              const adminGradients = [
                'from-[#07A64F] to-[#07A64F]/80',
                'from-[#1295D0] to-[#1295D0]/80'
              ];

              return (
                <button
                  key={item.id}
                  onClick={() => window.location.href = item.path}
                  className={`group w-full flex items-center rounded-xl text-left transition-all duration-300 mb-2 ${
                    collapsed 
                      ? 'justify-center p-3' 
                      : 'gap-4 px-4 py-3'
                  } ${activeTab === item.id
                      ? "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200 shadow-md transform scale-105"
                      : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:scale-102"
                    }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === item.id
                      ? `bg-gradient-to-br ${adminGradients[index]} text-white shadow-lg`
                      : `bg-gray-100 group-hover:bg-gradient-to-br group-hover:${adminGradients[index]} group-hover:text-white`
                    }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {!collapsed && (
                    <>
                      <span className="font-semibold">{item.label}</span>
                      {activeTab === item.id && (
                        <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Enhanced Billing Systems Section */}
        {billingMenuItems.length > 0 && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            {!collapsed && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Billing Systems</p>
              </div>
            )}
            {billingMenuItems.map((item, index) => {
            const Icon = item.icon;
            const billingGradients = [
              'from-[#1295D0] to-[#1295D0]/80',
              'from-[#07A64F] to-[#07A64F]/80'
            ];

            return (
              <button
                key={item.id}
                onClick={() => window.location.href = item.path}
                className={`group w-full flex items-center rounded-xl text-left transition-all duration-300 mb-2 ${
                  collapsed 
                    ? 'justify-center p-3' 
                    : 'gap-4 px-4 py-3'
                } ${activeTab === item.id
                    ? "bg-gradient-to-r from-blue-50 to-green-50 text-blue-700 border border-blue-200 shadow-md transform scale-105"
                    : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:scale-102"
                  }`}
                title={collapsed ? item.label : undefined}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === item.id
                    ? `bg-gradient-to-br ${billingGradients[index]} text-white shadow-lg`
                    : `bg-gray-100 group-hover:bg-gradient-to-br group-hover:${billingGradients[index]} group-hover:text-white`
                  }`}>
                  <Icon className="h-4 w-4" />
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1">
                      <span className="font-semibold">{item.label}</span>
                      {item.id === "configuration-billing" && (
                        <p className="text-xs text-gray-500">New System</p>
                      )}
                    </div>
                    {activeTab === item.id && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </>
                )}
              </button>
            );
          })}
          </div>
        )}

        {/* Enhanced Kaha Ledger Section - Simplified */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Financial Hub</p>
            </div>
          )}
          <button
            onClick={() => window.location.href = '/ledger'}
            className={`group w-full flex items-center rounded-xl text-left transition-all duration-300 text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md ${
              collapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
            }`}
            title={collapsed ? "Kaha KLedger" : undefined}
          >
            <div className="p-2 rounded-lg transition-all duration-300 bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-green-500 group-hover:to-green-600 group-hover:text-white">
              <BookOpen className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <span className="font-semibold">Kaha KLedger</span>
                <p className="text-xs text-gray-500">Financial Management</p>
              </div>
            )}
          </button>
        </div>

        {/* Enhanced Settings */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <button
            onClick={() => onTabChange("settings")}
            className={`group w-full flex items-center rounded-xl text-left transition-all duration-300 ${
              collapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
            } ${activeTab === "settings"
                ? "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200 shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:scale-102"
              }`}
            title={collapsed ? translations.settings : undefined}
          >
            <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === "settings"
                ? "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg"
                : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-gray-500 group-hover:to-gray-600 group-hover:text-white"
              }`}>
              <Settings className="h-4 w-4" />
            </div>
            {!collapsed && (
              <>
                <span className="font-semibold">{translations.settings}</span>
                {activeTab === "settings" && (
                  <div className="ml-auto w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                )}
              </>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};
