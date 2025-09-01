import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Info } from "lucide-react";
import { KahaLogo } from "@/components/common/KahaLogo";

interface RoomElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  properties?: {
    bedType?: 'single' | 'bunk' | 'double';
    bedId?: string;
    bedLabel?: string;
    status?: 'available' | 'booked' | 'occupied';
    position?: 'top' | 'middle' | 'bottom';
    orientation?: 'north' | 'south' | 'east' | 'west';
    bunkLevels?: number;
    levels?: Array<{
      id: string;
      position: 'top' | 'middle' | 'bottom';
      bedId: string;
      status?: 'available' | 'booked' | 'occupied';
      assignedTo?: string;
    }>;
  };
}

interface RoomLayoutViewerProps {
  layout: {
    dimensions: { length: number; width: number; height: number };
    elements: RoomElement[];
    theme: { wallColor: string; floorColor: string };
    createdAt: string;
  };
  roomName: string;
}

export const RoomLayoutViewer = ({ layout, roomName }: RoomLayoutViewerProps) => {
  const [scale, setScale] = useState(25);
  const [showInfo, setShowInfo] = useState(false);

  const handleZoom = (delta: number) => {
    setScale(Math.max(10, Math.min(50, scale + delta)));
  };

  const resetView = () => {
    setScale(25);
  };

  const getElementColor = (element: RoomElement) => {
    switch (element.type) {
      case 'single-bed':
        return element.properties?.status === 'occupied' ? '#ef4444' : 
               element.properties?.status === 'booked' ? '#f59e0b' : '#10b981';
      case 'bunk-bed':
        return '#8b5cf6';
      case 'desk':
        return '#6366f1';
      case 'chair':
        return '#f59e0b';
      case 'wardrobe':
        return '#8b5a2b';
      case 'door':
        return '#64748b';
      case 'window':
        return '#0ea5e9';
      default:
        return '#6b7280';
    }
  };

  const getElementIcon = (element: RoomElement) => {
    switch (element.type) {
      case 'single-bed':
        return '🛏️';
      case 'bunk-bed':
        return '🏠';
      case 'desk':
        return '🪑';
      case 'chair':
        return '💺';
      case 'wardrobe':
        return '🚪';
      case 'door':
        return '🚪';
      case 'window':
        return '🪟';
      default:
        return '📦';
    }
  };

  const bedElements = (layout.elements || []).filter(e => e.type === 'single-bed' || e.type === 'bunk-bed');
  const totalBeds = bedElements.reduce((count, element) => {
    if (element.type === 'bunk-bed') {
      return count + (element.properties?.bunkLevels || 2);
    }
    return count + 1;
  }, 0);

  const occupiedBeds = bedElements.reduce((count, element) => {
    if (element.type === 'bunk-bed') {
      return count + (element.properties?.levels?.filter(level => level.status === 'occupied').length || 0);
    }
    return count + (element.properties?.status === 'occupied' ? 1 : 0);
  }, 0);

  // Handle missing or invalid layout
  if (!layout || !layout.dimensions) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Room Layout Found</h3>
          <p className="text-gray-600 mb-4">
            This room doesn't have a configured layout yet.
          </p>
          <p className="text-sm text-gray-500">
            Use the Layout Designer to create a room layout first.
          </p>
        </div>
      </div>
    );
  }

  // Initialize missing layout properties (backend limitations)
  if (!layout.elements || !Array.isArray(layout.elements)) {
    layout.elements = []; // Set empty array so the viewer can still show the room
    console.warn('⚠️ Layout elements missing - showing empty room due to backend limitations');
  }
  
  if (!layout.theme) {
    layout.theme = {
      name: "Default",
      wallColor: "#e5e7eb",
      floorColor: "#f8f9fa"
    };
    console.warn('⚠️ Layout theme missing - using default theme due to backend limitations');
  }

  return (
    <div className="space-y-4">
      {/* Header with Room Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{roomName}</h3>
          <p className="text-sm text-gray-600">
            {layout.dimensions.length}m × {layout.dimensions.width}m × {layout.dimensions.height}m
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInfo(!showInfo)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom(-5)}
            disabled={scale <= 10}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {scale * 4}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom(5)}
            disabled={scale >= 50}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Room Stats */}
      {showInfo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalBeds}</div>
            <div className="text-sm text-gray-600">Total Beds</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{occupiedBeds}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{(layout.elements || []).length}</div>
            <div className="text-sm text-gray-600">Elements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((occupiedBeds / totalBeds) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600">Occupancy</div>
          </div>
        </div>
      )}

      {/* Backend Limitation Warning */}
      {(!layout.elements || layout.elements.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Backend Limitation Notice</h4>
              <p className="text-sm text-yellow-700">
                This room shows only dimensions ({layout.dimensions.length}m × {layout.dimensions.width}m × {layout.dimensions.height}m). 
                Room elements (beds, furniture) are not displayed due to backend API limitations that ignore layout elements and theme data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Room Canvas */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="p-4">
          <svg
            width="100%"
            height="400"
            viewBox={`0 0 ${layout.dimensions.length * scale} ${layout.dimensions.width * scale}`}
            className="border border-gray-300 rounded"
            style={{ backgroundColor: layout.theme?.floorColor || '#f8f9fa' }}
          >
            {/* Room boundaries */}
            <rect
              x="0"
              y="0"
              width={layout.dimensions.length * scale}
              height={layout.dimensions.width * scale}
              fill="none"
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Grid */}
            <defs>
              <pattern
                id="grid"
                width={scale}
                height={scale}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${scale} 0 L 0 0 0 ${scale}`}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#grid)"
            />

            {/* Elements */}
            {(layout.elements || []).map((element) => {
              const x = element.x * scale;
              const y = element.y * scale;
              const width = element.width * scale;
              const height = element.height * scale;
              const centerX = x + width / 2;
              const centerY = y + height / 2;

              return (
                <g key={element.id}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={getElementColor(element)}
                    stroke="#374151"
                    strokeWidth="1"
                    rx="2"
                    transform={`rotate(${element.rotation} ${centerX} ${centerY})`}
                    opacity="0.8"
                  />
                  
                  {/* Element label */}
                  <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                    transform={`rotate(${element.rotation} ${centerX} ${centerY})`}
                  >
                    {getElementIcon(element)}
                  </text>

                  {/* Bed ID for beds */}
                  {(element.type === 'single-bed' || element.type === 'bunk-bed') && element.properties?.bedLabel && (
                    <text
                      x={centerX}
                      y={centerY + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8"
                      fill="white"
                      fontWeight="bold"
                      transform={`rotate(${element.rotation} ${centerX} ${centerY})`}
                    >
                      {element.properties.bedLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Available Bed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Booked Bed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Occupied Bed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="text-sm">Bunk Bed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-500 rounded"></div>
          <span className="text-sm">Furniture</span>
        </div>
      </div>

      {/* Layout Info */}
      <div className="text-xs text-gray-500 text-center">
        Layout created: {new Date(layout.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};