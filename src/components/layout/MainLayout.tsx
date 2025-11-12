
import { useState, useCallback, useRef } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { KahaLogo } from "@/components/ui/KahaLogo";
import { Menu, GripVertical } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const MainLayout = ({ children, activeTab }: MainLayoutProps) => {
  const navigate = useNavigate();
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default 256px (w-64)
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Minimum and maximum sidebar widths
  const MIN_WIDTH = 64; // Collapsed state
  const MAX_WIDTH = 400; // Maximum expanded state

  // Determine if sidebar is collapsed based on width
  const isCollapsed = sidebarWidth <= 80;

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      let newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + deltaX));

      // Snap to common widths for better UX
      const snapPoints = [64, 200, 256, 300, 350];
      const snapThreshold = 10;

      for (const snapPoint of snapPoints) {
        if (Math.abs(newWidth - snapPoint) < snapThreshold) {
          newWidth = snapPoint;
          break;
        }
      }

      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Auto-snap to collapsed if very small
      if (sidebarWidth < 100) {
        setSidebarWidth(MIN_WIDTH);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth]);

  // Toggle sidebar between collapsed and expanded
  const toggleSidebar = () => {
    setSidebarWidth(isCollapsed ? 256 : MIN_WIDTH);
  };

  return (
    <div className={`h-screen bg-gradient-to-br from-gray-50 to-[#07A64F]/5 flex overflow-hidden ${isDragging ? 'cursor-col-resize select-none' : ''
      }`}>
      {/* Draggable Sidebar */}
      <div
        className="flex-shrink-0 relative transition-all duration-200 ease-out"
        style={{ width: `${sidebarWidth}px` }}
      >
        <Sidebar
          activeTab={activeTab}
          collapsed={isCollapsed}
          onTabChange={(tab) => {
            // Handle navigation based on tab
            switch (tab) {
              case 'dashboard':
                navigate('/admin');
                break;
              case 'profile':
                navigate('/hostel');
                break;
              case 'bookings':
                navigate('/bookings');
                break;
              case 'rooms':
                navigate('/rooms');
                break;
              case 'analytics':
                navigate('/analytics');
                break;
              case 'attendance':
                navigate('/attendance');
                break;
              case 'students':
                navigate('/students');
                break;
              // Removed student-checkin case
              case 'meal-plans':
                navigate('/meal-plans');
                break;
              case 'notifications':
                navigate('/notifications');
                break;
              case 'charging':
                navigate('/admin/charging');
                break;
              case 'billing':
                navigate('/admin/configuration-billing');
                break;
              case 'settings':
                navigate('/settings');
                break;
              default:
                navigate('/');
            }
          }}
        />

        {/* Draggable Resize Handle */}
        <div
          ref={dragRef}
          onMouseDown={handleMouseDown}
          onDoubleClick={toggleSidebar}
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:w-2 transition-all duration-200 z-10 ${isDragging ? 'bg-blue-500 w-2' : 'bg-gray-300 hover:bg-blue-400'
            }`}
          title="Drag to resize • Double-click to toggle"
        >
          {/* Visual Drag Indicator */}
          <div className={`absolute top-1/2 -translate-y-1/2 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isDragging ? 'opacity-100' : ''
            }`}>
            <div className="bg-white shadow-lg rounded-md p-1 border border-gray-200 flex items-center gap-1">
              <GripVertical className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">{sidebarWidth}px</span>
            </div>
          </div>

          {/* Drag Line Indicator */}
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-200 ${isDragging ? 'opacity-70' : ''
            }`} />

          {/* Hover Area for Better UX */}
          <div className="absolute top-0 -right-2 w-4 h-full" />
        </div>

        {/* Width Indicator (shows during drag) */}
        {isDragging && (
          <div className="absolute top-4 left-4 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium z-20">
            {sidebarWidth}px {isCollapsed ? '(Collapsed)' : '(Expanded)'}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Modern Header */}
        <div className="bg-white shadow-lg border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              {/* Sidebar Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>

              {/* Kaha Logo and Branding */}
              <div className="flex items-center space-x-4">
                <KahaLogo size="lg" />
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#07A64F] via-[#1295D0] to-[#07A64F] bg-clip-text text-transparent">
                    Kaha Control Center
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Hostel Management System</p>
                </div>
              </div>

              {/* Enhanced Status Indicator */}
              <div className="hidden lg:flex items-center space-x-3 bg-[#07A64F]/10 px-4 py-2 rounded-full border border-[#07A64F]/30">
                <div className="relative">
                  <div className="h-3 w-3 bg-[#07A64F] rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 h-3 w-3 bg-[#07A64F]/70 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-sm text-[#07A64F] font-semibold">Kaha Ready</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Enhanced Ledger Button */}
              <Button
                onClick={() => navigate('/ledger')}
                className="bg-gradient-to-r from-[#07A64F] via-[#1295D0] to-[#07A64F] hover:from-[#07A64F]/90 hover:via-[#1295D0]/90 hover:to-[#07A64F]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <span className="flex items-center space-x-3">
                  <div className="p-1 bg-white/20 rounded-md">
                    <span className="text-lg">📚</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Kaha KLedger</div>
                    <div className="text-xs text-white/80">Financial Hub</div>
                  </div>
                  <div className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold">
                    PRO
                  </div>
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Independent Scroll */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-[#1295D0]/2 to-[#07A64F]/3">
          <div className="p-6">
            {children}
          </div>
        </div>f
      </div>
    </div>
  );
};
