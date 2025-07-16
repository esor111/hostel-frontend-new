import { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Move, RotateCw, Copy, Trash2, Ruler, Grid3X3 } from "lucide-react";
import { elementTypes } from "./ElementLibraryPanel";

// Enhanced emoji mapping function for room elements
const getElementEmoji = (elementType: string, properties?: any): string => {
  const emojiMap: Record<string, string> = {
    'single-bed': '🛏️',
    'bunk-bed': '🏠', 
    'double-bed': '🛌',
    'kids-bed': '🧸',
    'study-table': '🪑',
    'study-chair': '🪑',
    'chair': '🪑',
    'study-lamp': '💡',
    'monitor': '🖥️',
    'charging-port': '🔌',
    'headphone-hanger': '🎧',
    'bookshelf': '📚',
    'door': '🚪',
    'window': '🪟',
    'wall-partition': '🧱',
    'room-label': '🏷️',
    'toilet': '🚽',
    'shower': '🚿',
    'wash-basin': '🧼',
    'dustbin': '🗑️',
    'luggage-rack': '🧳',
    'fire-extinguisher': '🧯',
    'locker': '🔐',
    'laundry-basket': '🧺',
    'fan': '🌀',
    'ac-unit': '❄️',
    'call-button': '🔔'
  };

  // Special handling for bunk beds
  if (elementType === 'bunk-bed') {
    return '🏠'; // Using house emoji for bunk bed structure
  }

  return emojiMap[elementType] || '📦';
};

// Get element display name with better formatting
const getElementDisplayName = (elementType: string, properties?: any): string => {
  const nameMap: Record<string, string> = {
    'single-bed': 'Single Bed',
    'bunk-bed': 'Bunk Bed',
    'double-bed': 'Double Bed',
    'kids-bed': 'Kids Bed',
    'study-table': 'Study Table',
    'study-chair': 'Study Chair',
    'chair': 'Chair',
    'study-lamp': 'Desk Lamp',
    'monitor': 'Monitor',
    'charging-port': 'Charging Port',
    'headphone-hanger': 'Headphone Hook',
    'bookshelf': 'Bookshelf',
    'door': 'Door',
    'window': 'Window',
    'wall-partition': 'Wall Partition',
    'room-label': 'Room Label',
    'toilet': 'Toilet',
    'shower': 'Shower',
    'wash-basin': 'Wash Basin',
    'dustbin': 'Dustbin',
    'luggage-rack': 'Luggage Rack',
    'fire-extinguisher': 'Fire Extinguisher',
    'locker': 'Locker',
    'laundry-basket': 'Laundry Basket',
    'fan': 'Ceiling Fan',
    'ac-unit': 'AC Unit',
    'call-button': 'Call Button'
  };

  // Special handling for bunk beds with bed IDs
  if (elementType === 'bunk-bed' && properties?.bedId) {
    return properties.bedId;
  }

  // For beds with bed IDs
  if (elementType.includes('bed') && properties?.bedId) {
    return properties.bedId;
  }

  return nameMap[elementType] || elementType.replace('-', ' ');
};

interface BunkLevel {
  id: string;
  position: 'top' | 'middle' | 'bottom';
  assignedTo?: string;
  bedId: string;
}

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
    bedType?: 'single' | 'bunk' | 'double' | 'kids';
    bedId?: string;
    position?: 'top' | 'middle' | 'bottom';
    orientation?: 'north' | 'south' | 'east' | 'west';
    drawers?: number;
    brightness?: number;
    hingeType?: 'left' | 'right';
    isOpen?: boolean;
    material?: 'wood' | 'metal' | 'plastic';
    color?: string;
    portType?: 'USB' | 'Type-C' | 'Universal';
    bunkLevels?: number;
    levels?: BunkLevel[];
    isLocked?: boolean;
  };
}

interface RoomTheme {
  name: string;
  wallColor: string;
  floorColor: string;
}

interface RoomCanvasProps {
  dimensions: { length: number; width: number; height: number };
  elements: RoomElement[];
  selectedElement: string | null;
  selectedElements: string[];
  theme: RoomTheme;
  scale: number;
  showGrid: boolean;
  snapToGrid: boolean;
  duplicateMode: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onElementSelect: (id: string, multiSelect?: boolean) => void;
  onElementsMove: (ids: string[], deltaX: number, deltaY: number) => void;
  onElementRotate: (id: string) => void;
  onElementDuplicate: (id: string) => void;
  onElementDelete: (id: string) => void;
  checkCollisions: (element: RoomElement, excludeId?: string) => boolean;
  warnings: string[];
}

export const RoomCanvas = ({
  dimensions,
  elements,
  selectedElement,
  selectedElements,
  theme,
  scale,
  showGrid,
  snapToGrid,
  duplicateMode,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onElementSelect,
  onElementsMove,
  onElementRotate,
  onElementDuplicate,
  onElementDelete,
  checkCollisions,
  warnings
}: RoomCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, elementId: string} | null>(null);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{x: number, y: number, text: string} | null>(null);

  // Increased scale for better visibility
  const enhancedScale = Math.max(scale * 1.5, 45);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with subtle texture and increased size
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, theme.floorColor);
    gradient.addColorStop(1, theme.floorColor + 'CC');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.length * enhancedScale, dimensions.width * enhancedScale);
    
    // Enhanced grid with better visibility
    if (showGrid) {
      ctx.strokeStyle = '#00000015';
      ctx.lineWidth = 1;
      const gridSize = 0.5 * enhancedScale;
      const majorGridSize = 1 * enhancedScale;
      
      // Minor grid lines
      for (let x = 0; x <= dimensions.length * enhancedScale; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * enhancedScale);
        ctx.stroke();
      }
      
      for (let y = 0; y <= dimensions.width * enhancedScale; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.length * enhancedScale, y);
        ctx.stroke();
      }
      
      // Major grid lines
      ctx.strokeStyle = '#00000025';
      ctx.lineWidth = 2;
      
      for (let x = 0; x <= dimensions.length * enhancedScale; x += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * enhancedScale);
        ctx.stroke();
      }
      
      for (let y = 0; y <= dimensions.width * enhancedScale; y += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.length * enhancedScale, y);
        ctx.stroke();
      }
    }
    
    // Enhanced room border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.strokeRect(0, 0, dimensions.length * enhancedScale, dimensions.width * enhancedScale);
    ctx.shadowColor = 'transparent';
    
    // Draw elements sorted by zIndex with enhanced visibility
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    
    sortedElements.forEach(element => {
      const x = element.x * enhancedScale;
      const y = element.y * enhancedScale;
      const width = element.width * enhancedScale;
      const height = element.height * enhancedScale;
      
      ctx.save();
      ctx.translate(x + width/2, y + height/2);
      ctx.rotate(element.rotation * Math.PI / 180);
      
      // Element styling
      const isSelected = selectedElements.includes(element.id);
      const isHovered = hoveredElement === element.id;
      const hasCollision = checkCollisions(element, element.id);
      const isLocked = element.properties?.isLocked;
      
      // Enhanced shadow for depth
      if (isSelected || isHovered) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
      }
      
      // Clear shadows for element rendering
      ctx.shadowColor = 'transparent';
      
      // Special enhanced handling for bunk beds
      if (element.type === 'bunk-bed') {
        // Draw bunk bed structure with enhanced visibility
        const levels = element.properties?.levels || [];
        const levelHeight = height / Math.max(levels.length, 2);
        
        // Draw bunk bed frame
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.strokeRect(-width/2, -height/2, width, height);
        
        levels.forEach((level, index) => {
          const levelY = -height/2 + (index * levelHeight);
          
          // Draw level separator with enhanced visibility
          if (index > 0) {
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-width/2, levelY);
            ctx.lineTo(width/2, levelY);
            ctx.stroke();
          }
          
          // Draw level with enhanced emojis and better positioning
          const levelIcon = level.position === 'top' ? '🛌' : 
                           level.position === 'middle' ? '🛌' : '🛌';
          
          ctx.font = `${Math.min(width, levelHeight) * 0.5}px Arial`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(levelIcon, -width/2 + 8, levelY + levelHeight/2);
          
          // Enhanced assignment status display
          if (level.assignedTo) {
            ctx.font = `bold ${Math.max(levelHeight * 0.15, 12)}px Arial`;
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.lineWidth = 3;
            const assignmentText = level.assignedTo.substring(0, 10);
            ctx.strokeText(assignmentText, -width/2 + 40, levelY + levelHeight/2);
            ctx.fillText(assignmentText, -width/2 + 40, levelY + levelHeight/2);
          } else {
            ctx.font = `${Math.max(levelHeight * 0.12, 10)}px Arial`;
            ctx.fillStyle = '#9CA3AF';
            ctx.fillText('Available', -width/2 + 40, levelY + levelHeight/2);
          }
        });
        
        // Draw main bed ID with enhanced visibility
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(height * 0.12, 14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = 'rgba(0,0,0,0.9)';
        ctx.lineWidth = 4;
        
        const bedId = element.properties?.bedId || 'BUNK';
        ctx.strokeText(bedId, 0, -height/2 + 6);
        ctx.fillText(bedId, 0, -height/2 + 6);
      } else {
        // Enhanced emoji display for regular elements
        const emoji = getElementEmoji(element.type, element.properties);
        const elementName = getElementDisplayName(element.type, element.properties);
        
        // Significantly larger and more visible emoji
        const emojiSize = Math.min(Math.max(width * 0.6, 36), 64);
        
        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Enhanced emoji shadow for better visibility
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Position emoji in upper part of element
        ctx.fillText(emoji, 0, -height/6);
        ctx.shadowColor = 'transparent';
        
        // Enhanced element name display below emoji
        ctx.fillStyle = '#1F2937';
        ctx.font = `bold ${Math.max(width * 0.14, 12)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        
        // Truncate long names intelligently
        let displayName = elementName;
        if (displayName.length > 12) {
          const words = displayName.split(' ');
          if (words.length > 1) {
            displayName = words.map(word => word.substring(0, 4)).join(' ');
          } else {
            displayName = displayName.substring(0, 10) + '..';
          }
        }
        
        // Enhanced text rendering with better positioning
        const textY = height/4;
        ctx.strokeText(displayName, 0, textY);
        ctx.fillText(displayName, 0, textY);
      }
      
      // Enhanced selection indicators with better positioning
      if (isSelected && !isLocked) {
        const handleSize = 12;
        
        // Enhanced selection border with better visibility
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 5;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(-width/2 - 6, -height/2 - 6, width + 12, height + 12);
        ctx.setLineDash([]);
        
        // Enhanced corner handles with better visibility
        ctx.fillStyle = '#3B82F6';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        
        const corners = [
          [-width/2 - 6, -height/2 - 6],
          [width/2 + 6, -height/2 - 6],
          [-width/2 - 6, height/2 + 6],
          [width/2 + 6, height/2 + 6]
        ];
        
        corners.forEach(([hx, hy]) => {
          ctx.fillRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
          ctx.strokeRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
        });
        
        // Enhanced rotation handle with better visibility
        ctx.fillStyle = '#10B981';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -height/2 - 30, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Enhanced connection line to rotation handle
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, -height/2 - 6);
        ctx.lineTo(0, -height/2 - 20);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Enhanced lock indicator
      if (isLocked) {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 22px Arial';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeText('🔒', width/2 - 15, -height/2 + 22);
        ctx.fillText('🔒', width/2 - 15, -height/2 + 22);
      }
      
      // Enhanced collision warning with animation effect
      if (hasCollision) {
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 24px Arial';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.strokeText('⚠️', 0, -height/2 - 30);
        ctx.fillText('⚠️', 0, -height/2 - 30);
      }
      
      // Enhanced hover effect
      if (isHovered && !isSelected) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(-width/2 - 3, -height/2 - 3, width + 6, height + 6);
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });
    
    // Enhanced room dimensions display
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    
    const lengthText = `${dimensions.length}m`;
    ctx.strokeText(lengthText, dimensions.length * enhancedScale / 2, -20);
    ctx.fillText(lengthText, dimensions.length * enhancedScale / 2, -20);
    
    ctx.save();
    ctx.translate(-25, dimensions.width * enhancedScale / 2);
    ctx.rotate(-Math.PI / 2);
    const widthText = `${dimensions.width}m`;
    ctx.strokeText(widthText, 0, 0);
    ctx.fillText(widthText, 0, 0);
    ctx.restore();

    // Enhanced snap-to-grid indicators
    if (snapToGrid && selectedElements.length > 0) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      
      const gridSize = 0.5 * enhancedScale;
      for (let x = 0; x <= dimensions.length * enhancedScale; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * enhancedScale);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / enhancedScale;
    const y = (e.clientY - rect.top) / enhancedScale;
    
    // Find hovered element
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const hoveredEl = sortedElements.find(element => 
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    );
    
    setHoveredElement(hoveredEl?.id || null);
    
    // Enhanced tooltip for hovered element
    if (hoveredEl) {
      const elementName = getElementDisplayName(hoveredEl.type, hoveredEl.properties);
      setTooltip({
        x: e.clientX,
        y: e.clientY - 60,
        text: elementName
      });
    } else {
      setTooltip(null);
    }
    
    onMouseMove(e);
  };

  const handleCanvasRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / enhancedScale;
    const y = (e.clientY - rect.top) / enhancedScale;
    
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const clickedElement = sortedElements.find(element => 
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    );
    
    if (clickedElement) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        elementId: clickedElement.id
      });
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [elements, selectedElement, selectedElements, dimensions, showGrid, enhancedScale, theme, hoveredElement]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 p-6 relative overflow-auto">
      {/* Enhanced Canvas Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 flex-wrap">
          <Badge variant="outline" className="bg-white shadow-sm border-2">
            <Grid3X3 className="h-4 w-4 mr-2" />
            Enhanced 2D View • {enhancedScale}px/m
          </Badge>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 border-2">
            <Ruler className="h-4 w-4 mr-2" />
            {dimensions.length}m × {dimensions.width}m × {dimensions.height}m
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 border-2">
            📦 {elements.length} elements
          </Badge>
          {selectedElements.length > 1 && (
            <Badge variant="default" className="bg-purple-600 border-2">
              ✅ {selectedElements.length} selected
            </Badge>
          )}
          {elements.filter(e => e.type === 'bunk-bed').length > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 border-2">
              🏠 {elements.filter(e => e.type === 'bunk-bed').length} Bunk Beds
            </Badge>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMeasurement(!showMeasurement)}
            className={showMeasurement ? "bg-blue-50 border-blue-300 border-2" : "border-2"}
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Enhanced Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 text-red-800 font-bold mb-3">
            <AlertTriangle className="h-6 w-6" />
            Design Warnings ({warnings.length})
          </div>
          <ul className="text-sm text-red-700 space-y-2">
            {warnings.slice(0, 3).map((warning, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-red-500 mt-1 font-bold">•</span>
                {warning}
              </li>
            ))}
            {warnings.length > 3 && (
              <li className="text-red-600 font-bold flex items-center gap-3">
                <span className="text-red-500">•</span>
                ... and {warnings.length - 3} more warnings
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Enhanced Canvas Container with better sizing */}
      <div className="flex-1 flex items-center justify-center relative p-4">
        <div className="border-4 border-gray-300 rounded-2xl shadow-2xl bg-white p-8 relative overflow-auto max-w-full max-h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none rounded-2xl"></div>
          <div className="overflow-auto max-h-[70vh] max-w-full">
            <canvas
              ref={canvasRef}
              width={dimensions.length * enhancedScale}
              height={dimensions.width * enhancedScale}
              className="cursor-crosshair rounded-xl border-2 border-gray-200 relative z-10 block"
              onMouseDown={onMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={onMouseUp}
              onContextMenu={handleCanvasRightClick}
            />
          </div>
        </div>
        
        {/* Enhanced Tooltip */}
        {tooltip && (
          <div 
            className="fixed z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 font-bold border-2 border-gray-700"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
      
      {/* Enhanced Canvas Footer */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-lg border-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <div className="font-bold text-gray-700 mb-2 text-base">🎯 Selection Controls</div>
            <div className="text-gray-600">Click to select • Ctrl+Click for multi-select • Right-click for menu</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-700 mb-2 text-base">🏠 Bunk Bed Levels</div>
            <div className="text-gray-600">🛌 Top/Middle/Bottom levels • Clear assignment status display</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-700 mb-2 text-base">📊 Room Statistics</div>
            <div className="text-gray-600">
              <span className="text-blue-600 font-semibold">🔌 {elements.filter(e => e.type === 'charging-port').length}</span> • 
              <span className="text-red-600 font-semibold ml-2">🧯 {elements.filter(e => e.type === 'fire-extinguisher').length}</span> • 
              <span className="text-green-600 font-semibold ml-2">🛏️ {elements.filter(e => e.type.includes('bed')).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-white border-2 border-gray-300 rounded-xl shadow-2xl z-50 py-3 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-6 py-3 h-auto hover:bg-blue-50"
            onClick={() => {
              onElementRotate(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <RotateCw className="h-5 w-5 mr-3" />
            Rotate 90°
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-6 py-3 h-auto hover:bg-green-50"
            onClick={() => {
              onElementDuplicate(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <Copy className="h-5 w-5 mr-3" />
            Duplicate Element
          </Button>
          <div className="border-t border-gray-200 my-2"></div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-6 py-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              onElementDelete(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <Trash2 className="h-5 w-5 mr-3" />
            Delete Element
          </Button>
        </div>
      )}
    </div>
  );
};
