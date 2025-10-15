9
import { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw, Copy, Trash2, Ruler, Grid3X3 } from "lucide-react";
import { elementTypes } from "./ElementTypes";
import { formatDimensionsAsFeet } from "@/utils/unitConversion";

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

  return nameMap[elementType] || elementType.replace('-', ' ');
};

// Get formatted element name with ID
const getFormattedElementName = (elementType: string, properties?: any): string => {
  const baseName = getElementDisplayName(elementType, properties);

  // For bunk beds, show the main bed ID
  if (elementType === 'bunk-bed' && properties?.bedId) {
    return `${properties.bedId} (${baseName})`;
  }

  // For regular beds with bed IDs
  if (elementType.includes('bed') && properties?.bedId) {
    return `${properties.bedId} (${baseName})`;
  }

  return baseName;
};

// Tooltip generation function removed - tooltips disabled to prevent UI obstruction
// (Previously generated tooltip text for bed elements with API data)

interface BunkLevel {
  id: string;
  position: 'top' | 'middle' | 'bottom';
  assignedTo?: string;
  bedId: string;
  status?: 'available' | 'booked' | 'occupied' | 'selected';
  color?: string; // Add color property for API bed visualization
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
  // Enhanced properties for bed status visualization from API
  status?: string; // Available, Occupied, Reserved, Maintenance
  occupantId?: string | null;
  occupantName?: string;
  gender?: string;
  color?: string; // Hex color for bed status
  bedDetails?: {
    bedNumber?: string;
    monthlyRate?: number;
    lastCleaned?: Date;
    maintenanceNotes?: string;
    occupiedSince?: Date;
  };
  properties?: {
    bedType?: 'single' | 'bunk' | 'double' | 'kids';
    bedId?: string;
    bedLabel?: string; // For display like "Bed A", "Bed B"
    status?: 'available' | 'booked' | 'occupied' | 'selected';
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
  onElementsMoveComplete?: () => void;
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
  onElementsMoveComplete,
  onElementRotate,
  onElementDuplicate,
  onElementDelete,
  checkCollisions,
  warnings
}: RoomCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, elementId: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  // Tooltip removed - was causing UI obstruction issues
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);
  const [lastMousePos, setLastMousePos] = useState<{ x: number, y: number } | null>(null);
  // 🧈 ULTRA-SMOOTH BUTTER DRAG SYSTEM STATE 🧈
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const velocityRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const lastPositionRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const smoothingBuffer = useRef<Array<{ x: number, y: number, time: number }>>([]);
  const isDragThrottled = useRef<boolean>(false);
  const lastRenderTime = useRef<number>(0);
  const targetFPS = 60;
  const frameInterval = 1000 / targetFPS;
  
  // 🔧 SAFEGUARD: Store the original clicked element to ensure only it moves
  const originalClickedElementRef = useRef<string | null>(null);

  // Reasonable scale for better visibility without being too large
  const canvasScale = Math.max(scale * 2, 60);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable hardware acceleration for BUTTER-SMOOTH rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas with optimized clearing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = theme.floorColor;
    ctx.fillRect(0, 0, dimensions.length * canvasScale, dimensions.width * canvasScale);

    // Draw enhanced grid
    if (showGrid) {
      const gridSize = 0.5 * canvasScale;
      const majorGridSize = 1.0 * canvasScale; // Major grid lines every meter
      
      // Draw minor grid lines
      ctx.strokeStyle = '#F3F4F6';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= dimensions.length * canvasScale; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * canvasScale);
        ctx.stroke();
      }

      for (let y = 0; y <= dimensions.width * canvasScale; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.length * canvasScale, y);
        ctx.stroke();
      }
      
      // Draw major grid lines (every meter)
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 2;
      
      for (let x = 0; x <= dimensions.length * canvasScale; x += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * canvasScale);
        ctx.stroke();
      }

      for (let y = 0; y <= dimensions.width * canvasScale; y += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.length * canvasScale, y);
        ctx.stroke();
      }
    }

    // Draw room border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, dimensions.length * canvasScale, dimensions.width * canvasScale);

    // Draw elements sorted by zIndex
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    sortedElements.forEach(element => {
      const x = element.x * canvasScale;
      const y = element.y * canvasScale;
      const width = element.width * canvasScale;
      const height = element.height * canvasScale;

      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(element.rotation * Math.PI / 180);

      // Element styling
      const isSelected = selectedElements.includes(element.id);
      const isHovered = hoveredElement === element.id;
      const hasCollision = checkCollisions(element, element.id);
      const isDraggingThis = draggedElementId === element.id;

      // Element background
      ctx.fillStyle = isSelected ? '#DBEAFE' : isHovered ? '#F0F9FF' : isDraggingThis ? '#FEF3C7' : '#FFFFFF';
      ctx.strokeStyle = isSelected ? '#3B82F6' : hasCollision ? '#EF4444' : '#D1D5DB';
      ctx.lineWidth = isSelected ? 3 : hasCollision ? 2 : 1;

      // Draw element shape
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height / 2, width, height, 6);
      ctx.fill();
      ctx.stroke();

      // Clean professional bed design with API color visualization
      if (element.type === 'single-bed') {
        // Use color from API if available, otherwise fall back to status-based colors
        let bedColor = element.color;
        if (!bedColor) {
          const bedStatus = element.status || element.properties?.status || 'Available';
          const statusColors = {
            'Available': '#10B981', // Green
            'Occupied': '#EF4444',  // Red
            'Reserved': '#F59E0B',  // Yellow/Orange
            'Maintenance': '#6B7280', // Gray
            'Out_Of_Order': '#6B7280', // Gray
            // Legacy status mapping
            'available': '#10B981',
            'selected': '#3B82F6',
            'booked': '#F59E0B',
            'occupied': '#EF4444'
          };
          bedColor = statusColors[bedStatus as keyof typeof statusColors] || '#10B981';
        }
        
        // Draw simple rectangular bed frame with API color
        ctx.fillStyle = bedColor;
        ctx.strokeStyle = '#000000';  // Black border
        ctx.lineWidth = 3;  // Thicker border
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        // Simple rectangular pillow at head of bed
        const pillowWidth = width * 0.8;
        const pillowHeight = height * 0.15;
        
        ctx.fillStyle = '#FFFFFF';  // White pillow
        ctx.strokeStyle = '#000000';  // Black border for pillow
        ctx.lineWidth = 2;
        
        // Draw simple rectangular pillow
        ctx.fillRect(-pillowWidth / 2, -height / 2 + 8, pillowWidth, pillowHeight);
        ctx.strokeRect(-pillowWidth / 2, -height / 2 + 8, pillowWidth, pillowHeight);
        
        // Add bed identifier and status
        const bedLabel = element.id || element.properties?.bedLabel || element.properties?.bedId || 'Bed';
        const statusText = element.status || element.properties?.status || '';
        
        // Bed identifier
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.min(width * 0.12, height * 0.08, 14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bedLabel, 0, height * 0.1);
        
        // Status text (smaller)
        if (statusText) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `${Math.min(width * 0.08, height * 0.06, 10)}px Arial`;
          ctx.fillText(statusText, 0, height * 0.25);
        }
        
        // Occupant name if available
        if (element.occupantName) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `${Math.min(width * 0.07, height * 0.05, 9)}px Arial`;
          const shortName = element.occupantName.length > 12 ? 
            element.occupantName.substring(0, 12) + '...' : element.occupantName;
          ctx.fillText(shortName, 0, height * 0.35);
        }
        
      } else if (element.type === 'bunk-bed') {
        const bunkLevels = element.properties?.bunkLevels || 2;
        const levels = element.properties?.levels || [];
        
        // Draw each bunk level with API color visualization
        const levelHeight = height / bunkLevels;
        
        for (let i = 0; i < bunkLevels; i++) {
          const levelY = -height / 2 + (i * levelHeight);
          const level = levels[i];
          
          // Use color from API if available, otherwise fall back to status-based colors
          let levelColor = level?.color;
          if (!levelColor) {
            const bedStatus = level?.status || 'Available';
            const statusColors = {
              'Available': '#10B981', // Green
              'Occupied': '#EF4444',  // Red
              'Reserved': '#F59E0B',  // Yellow/Orange
              'Maintenance': '#6B7280', // Gray
              'Out_Of_Order': '#6B7280', // Gray
              // Legacy status mapping
              'available': '#10B981',
              'selected': '#3B82F6',
              'booked': '#F59E0B',
              'occupied': '#EF4444'
            };
            levelColor = statusColors[bedStatus as keyof typeof statusColors] || '#10B981';
          }
          
          // Fill bunk level with API color
          ctx.fillStyle = levelColor;
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 2;
          ctx.fillRect(-width / 2, levelY, width, levelHeight);
          ctx.strokeRect(-width / 2, levelY, width, levelHeight);
          
          // Pillow for each bunk level
          const pillowWidth = width * 0.8;
          const pillowHeight = height * 0.15;
          
          ctx.fillStyle = '#FFFFFF';  // White pillow
          ctx.strokeStyle = '#000000';  // Black border
          ctx.lineWidth = 2;
          
          // Position pillow on LEFT side of each bunk level
          const pillowX = -width / 2 + 8;
          ctx.fillRect(pillowX, levelY + 8, pillowWidth, pillowHeight);
          ctx.strokeRect(pillowX, levelY + 8, pillowWidth, pillowHeight);
          
          // Level label and status
          const levelLabel = `B${i + 1}`;
          const levelStatus = level?.status || 'Available';
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.min(width * 0.1, levelHeight * 0.15, 12)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(levelLabel, 0, levelY + levelHeight * 0.4);
          
          // Status text (smaller)
          ctx.font = `${Math.min(width * 0.07, levelHeight * 0.1, 9)}px Arial`;
          ctx.fillText(levelStatus, 0, levelY + levelHeight * 0.7);
          
          // Occupant name if available
          if (level?.assignedTo) {
            ctx.font = `${Math.min(width * 0.06, levelHeight * 0.08, 8)}px Arial`;
            const shortName = level.assignedTo.length > 10 ? 
              level.assignedTo.substring(0, 10) + '...' : level.assignedTo;
            ctx.fillText(shortName, 0, levelY + levelHeight * 0.85);
          }
        }
        
        // Draw minimal bunk bed structure lines
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        // Vertical supports
        ctx.beginPath();
        ctx.moveTo(-width / 2, -height / 2);
        ctx.lineTo(-width / 2, height / 2);
        ctx.moveTo(width / 2, -height / 2);
        ctx.lineTo(width / 2, height / 2);
        ctx.stroke();
        
      } else if (element.type === 'door') {
        // Draw door as brown rectangle
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 2;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        // Add "Door" text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.min(width * 0.15, height * 0.4, 14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Door', 0, 0);
        
      } else if (element.type === 'window') {
        // Draw realistic window with frame and glass panels
        
        // Window frame (outer border)
        ctx.fillStyle = '#8B5A2B'; // Brown window frame
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        // Glass area (inner)
        const frameThickness = Math.min(width, height) * 0.1;
        const glassWidth = width - (frameThickness * 2);
        const glassHeight = height - (frameThickness * 2);
        
        // Glass background (light blue with transparency effect)
        ctx.fillStyle = '#E0F2FE'; // Light blue glass
        ctx.fillRect(-glassWidth / 2, -glassHeight / 2, glassWidth, glassHeight);
        
        // Window cross dividers (mullions)
        ctx.strokeStyle = '#8B5A2B';
        ctx.lineWidth = 2;
        
        // Vertical divider
        ctx.beginPath();
        ctx.moveTo(0, -glassHeight / 2);
        ctx.lineTo(0, glassHeight / 2);
        ctx.stroke();
        
        // Horizontal divider
        ctx.beginPath();
        ctx.moveTo(-glassWidth / 2, 0);
        ctx.lineTo(glassWidth / 2, 0);
        ctx.stroke();
        
        // Add window reflection effect (diagonal lines)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
        
        // Diagonal reflection lines
        for (let i = 0; i < 3; i++) {
          const offset = (i - 1) * (glassWidth * 0.2);
          ctx.beginPath();
          ctx.moveTo(-glassWidth / 2 + offset, -glassHeight / 2);
          ctx.lineTo(-glassWidth / 2 + offset + glassWidth * 0.3, glassHeight / 2);
          ctx.stroke();
        }
        
        ctx.globalAlpha = 1; // Reset transparency
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 2;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        // Add "Window" text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.min(width * 0.12, height * 0.4, 12)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Window', 0, 0);
        
      } else {
        // Regular emoji for other elements
        const emoji = getElementEmoji(element.type, element.properties);
        const emojiSize = Math.min(width * 0.8, height * 0.8, 80);

        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1F2937';
        ctx.fillText(emoji, 0, 0);
      }

      ctx.restore();
    });

    // Draw bed labels OUTSIDE the boxes (after all elements are drawn)
    sortedElements.forEach(element => {
      const x = element.x * canvasScale;
      const y = element.y * canvasScale;
      const width = element.width * canvasScale;
      const height = element.height * canvasScale;

      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(element.rotation * Math.PI / 180);

      // Show labels below beds and other elements
      if (element.type === 'bunk-bed') {
        // Bunk bed - show main bunk bed name below entire structure
        const bedLabel = element.properties?.bedLabel || element.properties?.bedId || 'Bunk Bed';
        
        // Position main bunk bed label below the entire bunk bed
        ctx.fillStyle = '#6B7280';
        ctx.font = `bold ${Math.min(width * 0.1, height * 0.08, 14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(bedLabel, 0, height / 2 + 8);
        
      } else if (element.type === 'door' || element.type === 'window') {
        // For doors and windows, show label below
        const elementName = element.type === 'door' ? 'Door' : 'Window';
        ctx.fillStyle = '#374151';
        ctx.font = `bold ${Math.min(width * 0.1, 14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(elementName, 0, height / 2 + 8);
      }

      // Recalculate element states for this loop
      const isSelected = selectedElements.includes(element.id);
      const isHovered = hoveredElement === element.id;
      const hasCollision = checkCollisions(element, element.id);

      // Selection indicators
      if (isSelected) {
        const handleSize = 8;

        // Selection border
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8);
        ctx.setLineDash([]);

        // Corner handles
        ctx.fillStyle = '#3B82F6';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        const corners = [
          [-width / 2 - 4, -height / 2 - 4],
          [width / 2 + 4, -height / 2 - 4],
          [-width / 2 - 4, height / 2 + 4],
          [width / 2 + 4, height / 2 + 4]
        ];

        corners.forEach(([hx, hy]) => {
          ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
        });
      }

      // Collision warning
      if (hasCollision) {
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('⚠️', width / 2 - 12, -height / 2 - 8);
      }

      // Hover effect
      if (isHovered && !isSelected) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  };

  const getElementAtPosition = (x: number, y: number): RoomElement | null => {
    // Sort by zIndex (highest first) to get the topmost element
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    
    // Find the first element that contains the click position with precise boundary checking
    return sortedElements.find(element => {
      // Use precise boundary checking without tolerance to prevent accidental selection
      // This ensures only direct clicks on elements are registered
      return (
        x >= element.x && 
        x <= (element.x + element.width) &&
        y >= element.y && 
        y <= (element.y + element.height)
      );
    }) || null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    const clickedElement = getElementAtPosition(x, y);

    if (clickedElement) {
      const isMultiSelect = e.ctrlKey || e.metaKey;
      const isAltDuplicate = e.altKey && duplicateMode;

      if (isAltDuplicate) {
        onElementDuplicate(clickedElement.id);
        return;
      }

      // 🔧 FIXED: Simplified selection logic to prevent unintended multi-selection 🔧
      if (!isMultiSelect) {
        // Single selection - directly select only this element (this will clear others automatically)
        onElementSelect(clickedElement.id, false);
      } else {
        // For multi-select, add to selection
        onElementSelect(clickedElement.id, true);
      }

      // Start 🧈 ULTRA-SMOOTH BUTTER DRAGGING 🧈 with INDEPENDENT MOVEMENT
      if (!clickedElement.properties?.isLocked) {
        // 🔧 SAFEGUARD: Store the original clicked element
        originalClickedElementRef.current = clickedElement.id;
        
        // FORCE: Ensure ONLY this element is selected before starting drag
        onElementSelect(clickedElement.id, false);
        
        setIsDragging(true);
        setDraggedElementId(clickedElement.id);
        setDragStartTime(performance.now());
        
        // Reset all smoothing systems for new drag
        smoothingBuffer.current = [];
        isDragThrottled.current = false;
        lastRenderTime.current = performance.now();
        
        // Store initial mouse position with ultra-high precision
        setLastMousePos({ x: e.clientX, y: e.clientY });
        
        // Calculate BUTTER-SMOOTH offset from mouse to element's center
        const elementCenterX = clickedElement.x + clickedElement.width / 2;
        const elementCenterY = clickedElement.y + clickedElement.height / 2;
        
        setDragOffset({
          x: x - elementCenterX,
          y: y - elementCenterY
        });
        
        // Initialize ultra-smooth position tracking
        lastPositionRef.current = { x: clickedElement.x, y: clickedElement.y };
        velocityRef.current = { x: 0, y: 0 };
        
        // Optimize canvas for BUTTER-SMOOTH dragging
        canvas.style.willChange = 'transform';
        canvas.style.cursor = 'grabbing';
        canvas.style.userSelect = 'none';
        canvas.style.touchAction = 'none';
        
        // Enable hardware acceleration
        canvas.style.transform = 'translateZ(0)';
      }
    } else {
      // Clear selection when clicking on empty space
      if (!e.ctrlKey && !e.metaKey) {
        onElementSelect('', false);
      }
    }

    // Prevent default to avoid text selection and enable smooth dragging
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    // 🧈🧈🧈 ULTRA-SMOOTH BUTTER DRAG SYSTEM 🧈🧈🧈
    if (isDragging && draggedElementId && dragOffset) {
      const currentTime = performance.now();
      
      // Frame rate limiting for consistent 60fps performance
      if (currentTime - lastRenderTime.current < frameInterval) {
        return;
      }
      
      const currentElement = elements.find(el => el.id === draggedElementId);
      if (!currentElement) return;

      // Add position to smoothing buffer with timestamp
      smoothingBuffer.current.push({ x, y, time: currentTime });
      
      // Keep only last 5 positions for ultra-smooth interpolation
      if (smoothingBuffer.current.length > 5) {
        smoothingBuffer.current.shift();
      }

      // BUTTER-SMOOTH position calculation with advanced interpolation
      let smoothedX = x, smoothedY = y;
      if (smoothingBuffer.current.length >= 3) {
        // Use exponential smoothing for butter-like movement
        const weights = [0.05, 0.1, 0.15, 0.3, 0.4]; // Exponential weighting
        let totalWeight = 0;
        smoothedX = 0;
        smoothedY = 0;
        
        smoothingBuffer.current.forEach((pos, index) => {
          const weight = weights[index] || 0.4;
          smoothedX += pos.x * weight;
          smoothedY += pos.y * weight;
          totalWeight += weight;
        });
        
        smoothedX /= totalWeight;
        smoothedY /= totalWeight;
        
        // Apply velocity-based smoothing for ultra-fluid motion
        const timeDelta = currentTime - (smoothingBuffer.current[smoothingBuffer.current.length - 2]?.time || currentTime);
        if (timeDelta > 0) {
          const velocityX = (smoothedX - lastPositionRef.current.x) / timeDelta * 1000;
          const velocityY = (smoothedY - lastPositionRef.current.y) / timeDelta * 1000;
          
          // Smooth velocity changes to prevent jitter
          velocityRef.current.x = velocityRef.current.x * 0.8 + velocityX * 0.2;
          velocityRef.current.y = velocityRef.current.y * 0.8 + velocityY * 0.2;
        }
      }

      // Calculate new center position with ULTRA-HIGH precision
      const newCenterX = smoothedX - dragOffset.x;
      const newCenterY = smoothedY - dragOffset.y;
      
      // Convert center to top-left with sub-pixel accuracy
      let newX = newCenterX - currentElement.width / 2;
      let newY = newCenterY - currentElement.height / 2;
      
      // Handle rotation for perfect boundary calculations
      const rotation = (currentElement.rotation || 0) % 360;
      const isRotated = rotation === 90 || rotation === 270;
      const effectiveWidth = isRotated ? currentElement.height : currentElement.width;
      const effectiveHeight = isRotated ? currentElement.width : currentElement.height;
      
      // 🔧 FIXED: PERFECT boundary constraints (NO MORE BOUNCING!) 🔧
      // Calculate maximum positions with ultra-high precision
      const maxX = Math.max(0, dimensions.length - effectiveWidth);
      const maxY = Math.max(0, dimensions.width - effectiveHeight);
      
      // Apply boundary constraints with NO bouncing
      // Use Math.floor for precise positioning at boundaries
      if (newX < 0) {
        newX = 0;
      } else if (newX > maxX) {
        newX = maxX;
      }
      
      if (newY < 0) {
        newY = 0;
      } else if (newY > maxY) {
        newY = maxY;
      }
      
      // Calculate movement delta with ULTRA-HIGH precision
      const deltaX = newX - currentElement.x;
      const deltaY = newY - currentElement.y;
      
      // 🔧 FIXED: Add collision detection to prevent overlapping 🔧
      const testElement = {
        ...currentElement,
        x: newX,
        y: newY
      };
      
      // Check for collisions with other elements (excluding the current one)
      const hasCollision = checkCollisions(testElement, draggedElementId);
      
      // Apply movement with BUTTER-SMOOTH threshold and collision prevention
      if (Math.abs(deltaX) > 0.0001 || Math.abs(deltaY) > 0.0001) {
        if (!hasCollision) {
          // Only move if no collision detected - INDEPENDENT MOVEMENT
          // 🔧 ULTIMATE SAFEGUARD: Use the original clicked element, not any state that might have changed
          const elementToMove = originalClickedElementRef.current || draggedElementId;
          
          // FORCE: Only move the specific dragged element, ignore selectedElements
          onElementsMove([elementToMove], deltaX, deltaY);
          
          // Update position tracking
          lastPositionRef.current = { x: newX, y: newY };
          lastRenderTime.current = currentTime;
        } else {
          // If collision detected, don't move and show visual feedback
          console.log('🚫 Collision detected - movement blocked');
        }
      }
    } else {
      // Handle hover effects when not dragging (optimized)
      const hoveredEl = getElementAtPosition(x, y);
      
      if (hoveredEl?.id !== hoveredElement) {
        setHoveredElement(hoveredEl?.id || null);
        
        if (hoveredEl) {
          // Tooltip removed - was causing UI obstruction issues
          canvas.style.cursor = hoveredEl.properties?.isLocked ? 'not-allowed' : 'grab';
        } else {
          canvas.style.cursor = 'crosshair';
        }
      }
    }
  };

  const handleCanvasMouseUp = () => {
    const canvas = canvasRef.current;
    
    if (isDragging && draggedElementId) {
      // Cancel any pending animation frames for clean finish
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Apply BUTTER-SMOOTH final snap to grid if enabled
      if (snapToGrid) {
        const currentElement = elements.find(el => el.id === draggedElementId);
        if (currentElement) {
          const gridSize = 0.5;
          const snappedX = Math.round(currentElement.x / gridSize) * gridSize;
          const snappedY = Math.round(currentElement.y / gridSize) * gridSize;
          
          const finalDeltaX = snappedX - currentElement.x;
          const finalDeltaY = snappedY - currentElement.y;
          
          // Apply final snap with ULTRA-SMOOTH animation
          if (Math.abs(finalDeltaX) > 0.001 || Math.abs(finalDeltaY) > 0.001) {
            // Smooth snap animation over 3 frames for butter-like feel
            const steps = 3;
            let currentStep = 0;
            
            const animateSnap = () => {
              currentStep++;
              const progress = currentStep / steps;
              const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
              
              const stepDeltaX = (finalDeltaX * easeProgress) - (finalDeltaX * (currentStep - 1) / steps);
              const stepDeltaY = (finalDeltaY * easeProgress) - (finalDeltaY * (currentStep - 1) / steps);
              
              onElementsMove([draggedElementId], stepDeltaX, stepDeltaY);
              
              if (currentStep < steps) {
                requestAnimationFrame(animateSnap);
              }
            };
            
            requestAnimationFrame(animateSnap);
          }
        }
      }
      
      // Call the move complete callback with perfect timing
      requestAnimationFrame(() => {
        onElementsMoveComplete?.();
      });
      
      // Reset canvas optimizations with BUTTER-SMOOTH transition
      if (canvas) {
        canvas.style.willChange = 'auto';
        canvas.style.transform = 'none';
        canvas.style.cursor = 'crosshair';
        canvas.style.transition = 'cursor 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        canvas.style.userSelect = 'auto';
        canvas.style.touchAction = 'auto';
      }
    }
    
    // Reset all drag states with complete cleanup
    setIsDragging(false);
    setDraggedElementId(null);
    setDragOffset(null);
    setLastMousePos(null);
    setDragStartTime(0);
    
    // 🔧 SAFEGUARD: Clear the original clicked element reference
    originalClickedElementRef.current = null;
    
    // Clear all smoothing systems
    smoothingBuffer.current = [];
    isDragThrottled.current = false;
    velocityRef.current = { x: 0, y: 0 };
    lastPositionRef.current = { x: 0, y: 0 };
    lastRenderTime.current = 0;
  };

  const handleCanvasRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    const clickedElement = getElementAtPosition(x, y);

    if (clickedElement) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        elementId: clickedElement.id
      });
    }
  };

  const handleCanvasMouseLeave = () => {
    // Reset drag state if mouse leaves canvas
    if (isDragging) {
      handleCanvasMouseUp();
    }
    setHoveredElement(null);
    // Tooltip removed
    
    // Reset cursor
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'crosshair';
    }
  };

  useEffect(() => {
    // 🧈 ULTRA-SMOOTH BUTTER RENDERING SYSTEM 🧈
    let renderFrameId: number;
    let lastFrameTime = 0;
    
    const renderFrame = (currentTime: number) => {
      // Maintain consistent 60fps for butter-smooth rendering
      if (currentTime - lastFrameTime >= frameInterval) {
        drawCanvas();
        lastFrameTime = currentTime;
      }
      
      // Continue rendering during drag for ULTRA-SMOOTH 60fps
      if (isDragging) {
        renderFrameId = requestAnimationFrame(renderFrame);
      }
    };
    
    // Start BUTTER-SMOOTH rendering
    renderFrameId = requestAnimationFrame(renderFrame);
    
    return () => {
      if (renderFrameId) {
        cancelAnimationFrame(renderFrameId);
      }
    };
  }, [elements, selectedElement, selectedElements, dimensions, showGrid, canvasScale, theme, hoveredElement, draggedElementId, isDragging]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElements.length) return;
      
      const step = e.shiftKey ? 0.1 : (snapToGrid ? 0.5 : 0.1); // Fine movement with Shift
      let deltaX = 0, deltaY = 0;
      
      switch (e.key) {
        case 'ArrowLeft':
          deltaX = -step;
          break;
        case 'ArrowRight':
          deltaX = step;
          break;
        case 'ArrowUp':
          deltaY = -step;
          break;
        case 'ArrowDown':
          deltaY = step;
          break;
        default:
          return;
      }
      
      e.preventDefault();
      onElementsMove(selectedElements, deltaX, deltaY);
      onElementsMoveComplete?.();
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElements, snapToGrid, onElementsMove, onElementsMoveComplete]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 p-4 relative overflow-auto">
      {/* Canvas Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-white">
            <Grid3X3 className="h-4 w-4 mr-2" />
            2D View • {canvasScale}px/m
          </Badge>
          <Badge variant="secondary">
            <Ruler className="h-4 w-4 mr-2" />
            {formatDimensionsAsFeet(dimensions.length, dimensions.width)}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            📦 {elements.length} elements
          </Badge>
          {selectedElements.length > 0 && (
            <Badge variant="default">
              ✅ {selectedElements.length} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertTriangle className="h-5 w-5" />
            Design Warnings ({warnings.length})
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {warnings.slice(0, 3).map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
            {warnings.length > 3 && (
              <li className="font-medium">... and {warnings.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Canvas Container */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border p-4">
        <div className="relative overflow-auto max-h-[60vh] max-w-full">
          <canvas
            ref={canvasRef}
            width={dimensions.length * canvasScale}
            height={dimensions.width * canvasScale}
            className="cursor-crosshair border rounded select-none"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            onContextMenu={handleCanvasRightClick}
            style={{ 
              touchAction: 'none',
              willChange: isDragging ? 'transform' : 'auto',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              transform: 'translateZ(0)',
              transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          />
        </div>

        {/* Status Legend & Controls */}
        <div className="mt-6 space-y-4">
          {/* Status Legend - Industry Standard Colors */}
          <div className="flex items-center justify-center gap-8 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border border-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500 border border-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border border-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Occupied</span>
            </div>
          </div>
          
          {/* Quick Controls */}
          <div className="flex items-center justify-center gap-6 p-3 bg-blue-50 rounded-lg border text-sm text-blue-800">
            <span>💡 <strong>Pro Tips:</strong></span>
            <span>• Drag elements smoothly to any position</span>
            <span>• Use arrow keys for precise movement</span>
            <span>• Hold Shift + arrows for fine adjustments</span>
            <span>• Right-click for context menu</span>
          </div>
        </div>

        {/* Tooltip removed - was causing UI obstruction issues */}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border rounded-lg shadow-lg z-50 py-2 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-2 h-auto"
            onClick={() => {
              onElementRotate(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Rotate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-2 h-auto"
            onClick={() => {
              onElementDuplicate(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <div className="border-t my-1"></div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-2 h-auto text-red-600 hover:text-red-700"
            onClick={() => {
              onElementDelete(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};
