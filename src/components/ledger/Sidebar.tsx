
import { cn } from "@/lib/utils";
import { KahaLogo } from "@/components/ui/KahaLogo";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, collapsed = false, onToggleCollapse }: SidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // Use external collapsed state if provided, otherwise use internal state
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));
  const menuItems = [
    {
      id: "dashboard",
      label: "📊 Dashboard",
      description: "Overview & Analytics",
      icon: "📊",
      gradient: "from-[#1295D0] to-[#0ea5e9]"
    },
    {
      id: "students",
      label: "👥 Student Management",
      description: "Profiles & Fee Setup",
      icon: "👥",
      gradient: "from-[#07A64F] to-[#059669]"
    },
    {
      id: "payments",
      label: "💰 Payment Recording",
      description: "Log & Apply Payments",
      icon: "💰",
      gradient: "from-[#1295D0] to-[#07A64F]"
    },
    {
      id: "ledger",
      label: "📋 Student Ledger",
      description: "Individual Ledger View",
      icon: "📋",
      gradient: "from-[#07A64F] to-[#1295D0]"
    },
    {
      id: "billing",
      label: "⚡ Automated Billing",
      description: "Monthly & Prorated Billing",
      icon: "⚡",
      gradient: "from-[#1295D0] to-[#8b5cf6]"
    },
    {
      id: "discounts",
      label: "🏷️ Discount Management",
      description: "Manage Discounts & Offers",
      icon: "🏷️",
      gradient: "from-[#07A64F] to-[#f59e0b]"
    },
    {
      id: "admin-charging",
      label: "⚡ Admin Charging",
      description: "Manual Charge Management",
      icon: "⚡",
      gradient: "from-[#ef4444] to-[#dc2626]"
    },
    {
      id: "checkout",
      label: "🚪 Student Checkout",
      description: "Complete Checkout Process",
      icon: "🚪",
      gradient: "from-[#8b5cf6] to-[#7c3aed]"
    },
    {
      id: "api-test",
      label: "🔍 API Test",
      description: "Test Real Server Connection",
      icon: "🔍",
      gradient: "from-[#f59e0b] to-[#d97706]"
    }
  ];

  return (
    <div className={cn(
      "bg-white/80 backdrop-blur-xl shadow-2xl shadow-black/10 border-r border-white/20 relative flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col h-full",
      isCollapsed ? "w-16 min-w-16" : "w-72 min-w-72"
    )}>
      {/* Sidebar Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white/30 to-slate-100/50"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#07A64F]/10 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#1295D0]/10 to-transparent rounded-full blur-2xl"></div>
      
      {/* Header Section */}
      <div className={cn(
        "relative z-10 border-b border-white/20 transition-all duration-300",
        isCollapsed ? "p-3" : "p-6"
      )}>
        <div className={cn(
          "flex items-center mb-4 transition-all duration-300",
          isCollapsed ? "justify-center" : "gap-4"
        )}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/20 to-[#1295D0]/20 rounded-xl blur-lg"></div>
            <div className={cn(
              "relative bg-white rounded-xl shadow-lg shadow-black/10 p-2 border border-white/50 transition-all duration-300",
              isCollapsed ? "w-10 h-10" : "w-12 h-12"
            )}>
              <KahaLogo size="sm" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#07A64F] via-[#1295D0] to-[#07A64F] bg-clip-text text-transparent tracking-tight">
                KLedger Pro
              </h2>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Financial Management Suite</p>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle Button */}
        <div className={cn(
          "flex transition-all duration-300",
          isCollapsed ? "justify-center mb-2" : "justify-between items-center mb-4"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#07A64F]/10 to-[#1295D0]/10 rounded-lg border border-white/30">
              <div className="w-2 h-2 bg-[#07A64F] rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-600 font-medium">Kaha Active</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className={cn(
              "h-8 w-8 p-0 hover:bg-white/60 transition-all duration-300",
              isCollapsed ? "hover:bg-[#07A64F]/10" : ""
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            )}
          </Button>
        </div>
        
        {/* Collapsed Status Indicator */}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-[#07A64F] rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Navigation Menu */}
      <nav className={cn(
        "relative z-10 space-y-2 flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300",
        isCollapsed ? "p-2" : "p-4"
      )}>
        {menuItems.map((item, index) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "group w-full text-left rounded-2xl transition-all duration-500 transform relative overflow-hidden",
                isCollapsed 
                  ? "p-3 flex justify-center" 
                  : "p-4",
                isActive
                  ? "bg-gradient-to-r from-[#07A64F]/15 via-[#1295D0]/10 to-[#07A64F]/15 text-slate-800 shadow-xl shadow-[#07A64F]/20 scale-[1.02] border border-[#07A64F]/20"
                  : "text-slate-600 hover:bg-white/60 hover:shadow-lg hover:shadow-black/5 hover:scale-[1.01] border border-transparent hover:border-white/30"
              )}
              title={isCollapsed ? `${item.label.substring(2)} - ${item.description}` : undefined}
            >
              {/* Active Background Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#07A64F]/5 to-[#1295D0]/5 rounded-2xl"></div>
              )}
              
              <div className={cn(
                "relative flex items-center transition-all duration-300",
                isCollapsed ? "justify-center" : "gap-4"
              )}>
                {/* Icon Container */}
                <div className={cn(
                  "rounded-xl flex items-center justify-center transition-all duration-500 relative overflow-hidden",
                  isCollapsed ? "w-10 h-10" : "w-12 h-12",
                  isActive
                    ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg shadow-black/20`
                    : "bg-slate-100/60 group-hover:bg-gradient-to-br group-hover:from-[#07A64F]/80 group-hover:to-[#1295D0]/80 group-hover:text-white group-hover:shadow-lg"
                )}>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
                  )}
                  <span className={cn(
                    "relative z-10 transition-all duration-300",
                    isCollapsed ? "text-base" : "text-lg"
                  )}>{item.icon}</span>
                </div>
                
                {/* Content - Hidden when collapsed */}
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-semibold text-sm tracking-wide transition-colors duration-300",
                        isActive ? "text-slate-800" : "text-slate-700 group-hover:text-slate-800"
                      )}>
                        {item.label.substring(2)}
                      </div>
                      <div className={cn(
                        "text-xs mt-1 transition-colors duration-300 leading-relaxed",
                        isActive ? "text-slate-600" : "text-slate-500 group-hover:text-slate-600"
                      )}>
                        {item.description}
                      </div>
                    </div>
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-2 h-2 bg-[#07A64F] rounded-full animate-pulse shadow-lg shadow-[#07A64F]/50"></div>
                        <div className="w-1 h-1 bg-[#1295D0] rounded-full animate-pulse delay-150"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Hover Effect Line */}
              <div className={cn(
                "absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#07A64F] to-[#1295D0] rounded-r-full transition-all duration-300",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
              )}></div>
              
              {/* Collapsed Active Indicator */}
              {isCollapsed && isActive && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#07A64F] to-[#1295D0] rounded-l-full"></div>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Footer */}
      {!isCollapsed && (
        <div className="relative z-10 p-4 border-t border-white/20 flex-shrink-0">
          <div className="text-center">
            <div className="text-xs text-slate-400 font-medium">
              Powered by Kaha Technology
            </div>
            <div className="text-xs text-slate-300 mt-1">
              v2.0.1 • Premium Edition
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
