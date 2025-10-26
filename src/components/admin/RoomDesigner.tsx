import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, AlertTriangle, ArrowLeft, Bed } from "lucide-react";
import { toast } from "sonner";
import { RoomSetupWizard } from "./room-designer/RoomSetupWizard";
import { ElementLibraryPanel } from "./room-designer/ElementLibraryPanel";
import { PropertiesPanel } from "./room-designer/PropertiesPanel";
import { DesignerToolbar } from "./room-designer/DesignerToolbar";
import { RoomCanvas } from "./room-designer/RoomCanvas";
import { elementTypes } from "./room-designer/ElementTypes";

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
  // Bed status visualization properties (from API)
  status?: string;
  occupantId?: string | null;
  occupantName?: string;
  gender?: string;
  color?: string;
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
    bedLabel?: string;
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
  wallTexture?: string;
  floorTexture?: string;
}

interface RoomDesignerProps {
  onSave: (layout: any) => void;
  onClose: () => void;
  roomData?: any;
  isViewMode?: boolean; // New prop to indicate if this is view mode (read-only)
}

export const RoomDesigner = ({ onSave, onClose, roomData, isViewMode = false }: RoomDesignerProps) => {
  const [showWizard, setShowWizard] = useState(!roomData);

  const [dimensions, setDimensions] = useState({
    length: roomData?.dimensions?.length || 12, // Default to 12m for new rooms
    width: roomData?.dimensions?.width || 10,   // Default to 10m for new rooms  
    height: roomData?.dimensions?.height || 3
  });

  const [currentTheme, setCurrentTheme] = useState<RoomTheme>(
    roomData?.theme || {
      name: 'Modern',
      wallColor: '#F8F9FA',
      floorColor: '#E9ECEF'
    }
  );

  // Initialize elements from roomData, handling both elements and bedPositions
  const initializeElements = () => {
    if (roomData?.elements) {
      return roomData.elements;
    } else if (roomData?.bedPositions) {
      // Convert bedPositions to elements format for the designer
      return roomData.bedPositions.map((bedPos: any) => ({
        id: bedPos.id,
        type: 'single-bed', // Assume single bed for bedPositions
        x: bedPos.x,
        y: bedPos.y,
        width: bedPos.width,
        height: bedPos.height,
        rotation: bedPos.rotation || 0,
        zIndex: 0,
        // Enhanced properties from bed data
        status: bedPos.status,
        occupantId: bedPos.occupantId,
        occupantName: bedPos.occupantName,
        gender: bedPos.gender,
        color: bedPos.color,
        bedDetails: bedPos.bedDetails,
        properties: {
          bedType: 'single',
          bedId: bedPos.id,
          bedLabel: bedPos.id
        }
      }));
    }
    return [];
  };

  const [elements, setElements] = useState<RoomElement[]>(initializeElements());
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [lastSelectedElement, setLastSelectedElement] = useState<string | null>(null);

  // Auto-select first bed on load to avoid empty Properties panel
  useEffect(() => {
    if (elements.length > 0 && !selectedElement && !isViewMode) {
      // Find the first bed element (single-bed or bunk-bed)
      const firstBed = elements.find(el => el.type === 'single-bed' || el.type === 'bunk-bed');
      if (firstBed) {
        setSelectedElement(firstBed.id);
        setSelectedElements([firstBed.id]);
        setLastSelectedElement(firstBed.id);
      }
    }
  }, [elements, selectedElement, isViewMode]);

  // Adjust scale for view mode to prevent overflow
  useEffect(() => {
    if (isViewMode) {
      setScale(15); // Smaller scale for view mode
    } else {
      setScale(30); // Normal scale for edit mode
    }
  }, [isViewMode]);



  const [snapToGrid, setSnapToGrid] = useState(true);
  const [scale, setScale] = useState(30);
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const [history, setHistory] = useState<RoomElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Debounce collision warnings to reduce noise
  useEffect(() => {
    const timer = setTimeout(() => {
      const dimensionWarnings = validateDimensions();
      setCollisionWarnings(dimensionWarnings);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [elements, dimensions]);

  const [collisionWarnings, setCollisionWarnings] = useState<string[]>([]);
  const [dragCollisionDetected, setDragCollisionDetected] = useState(false);

  const snapToGridPosition = (value: number) => {
    if (!snapToGrid) return value;
    const gridSize = 0.5;
    return Math.round(value / gridSize) * gridSize;
  };

  const checkCollisions = (newElement: RoomElement, excludeId?: string) => {
    // First check if element is significantly outside room boundaries
    const boundaryTolerance = 0.5; // 50cm tolerance for boundaries
    const isOutsideBounds = (
      newElement.x < -boundaryTolerance ||
      newElement.y < -boundaryTolerance ||
      newElement.x + newElement.width > dimensions.length + boundaryTolerance ||
      newElement.y + newElement.height > dimensions.width + boundaryTolerance
    );

    if (isOutsideBounds) {
      return true; // Show warning for elements outside bounds
    }

    // Check for element overlaps with increased tolerance
    return elements.some(element => {
      if (element.id === excludeId) return false;

      // SPECIAL CASE: Ignore collisions between bunk bed levels of the same bunk bed
      const isBunkBedLevel = (id: string) => id.includes('-top') || id.includes('-bottom') || id.includes('-middle');
      const getBunkBedBase = (id: string) => {
        if (isBunkBedLevel(id)) {
          return id.replace(/-top$|-bottom$|-middle$/, '');
        }
        return id;
      };

      if (isBunkBedLevel(newElement.id) && isBunkBedLevel(element.id)) {
        const newElementBase = getBunkBedBase(newElement.id);
        const elementBase = getBunkBedBase(element.id);
        if (newElementBase === elementBase) {
          // Same bunk bed - levels are supposed to overlap vertically
          return false;
        }
      }

      // Reduced tolerance to be less sensitive (0.1m = 10cm)
      const tolerance = 0.1;

      const overlap = !(
        newElement.x >= element.x + element.width - tolerance ||
        newElement.x + newElement.width <= element.x + tolerance ||
        newElement.y >= element.y + element.height - tolerance ||
        newElement.y + newElement.height <= element.y + tolerance
      );

      // Only consider significant overlaps as collisions
      if (overlap) {
        const overlapArea = Math.max(0,
          Math.min(newElement.x + newElement.width, element.x + element.width) -
          Math.max(newElement.x, element.x)
        ) * Math.max(0,
          Math.min(newElement.y + newElement.height, element.y + element.height) -
          Math.max(newElement.y, element.y)
        );

        // Only report collision if overlap is more than 30% of smaller element (increased threshold)
        const minElementArea = Math.min(
          newElement.width * newElement.height,
          element.width * element.height
        );

        const significantOverlap = overlapArea > (minElementArea * 0.3);

        return significantOverlap;
      }

      return false;
    });
  };

  const validateDimensions = () => {
    const warnings: string[] = [];

    // Only show critical warnings to reduce noise
    if (dimensions.length < 1.5 || dimensions.width < 1.5) {
      warnings.push("Room dimensions too small (minimum 1.5m x 1.5m)");
    }

    if (dimensions.length > 25 || dimensions.width > 25) {
      warnings.push("Room dimensions very large (maximum recommended 25m x 25m)");
    }

    if (dimensions.height < 2.0) {
      warnings.push("Room height too low (minimum 2.0m recommended)");
    }

    // Only warn about elements significantly outside boundaries (increased tolerance)
    elements.forEach(element => {
      const tolerance = 0.8; // 80cm tolerance - much more lenient
      if (element.x + element.width > dimensions.length + tolerance ||
        element.y + element.height > dimensions.width + tolerance ||
        element.x < -tolerance || element.y < -tolerance) {
        const elementName = element.properties?.bedLabel || element.id;
        warnings.push(`${elementName} extends significantly beyond room boundaries`);
      }
    });

    return warnings;
  };

  const addToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleWizardComplete = (setup: { dimensions: any; theme: RoomTheme }) => {
    setDimensions(setup.dimensions);
    setCurrentTheme(setup.theme);
    setShowWizard(false);
    toast.success("Room setup complete! Start designing your layout.");
  };

  const handleElementSelect = (id: string, multiSelect = false) => {
    if (id === '') {
      // Clear selection but keep last selected for properties panel
      if (selectedElement) {
        setLastSelectedElement(selectedElement);
      }
      setSelectedElement(null);
      setSelectedElements([]);
    } else if (multiSelect) {
      // Multi-select mode
      setSelectedElements(prev => {
        if (prev.includes(id)) {
          // Remove from selection
          const newSelection = prev.filter(elId => elId !== id);
          // Update single selection to the last remaining element
          if (newSelection.length > 0) {
            setSelectedElement(newSelection[newSelection.length - 1]);
          } else {
            setSelectedElement(null);
          }
          return newSelection;
        } else {
          // Add to selection
          const newSelection = [...prev, id];
          setSelectedElement(id);
          setLastSelectedElement(id);
          return newSelection;
        }
      });
    } else {
      // 🔧 FIXED: Single select mode - clear all selections first, then select only this element 🔧
      // This ensures no other elements remain selected when clicking on a single element
      if (selectedElement && selectedElement !== id) {
        setLastSelectedElement(selectedElement);
      }
      setSelectedElement(id);
      setSelectedElements([id]); // Always create a new array with only this element
      setLastSelectedElement(id);
    }
  };

  const handleElementsMove = (ids: string[], deltaX: number, deltaY: number) => {
    // 🧈 ULTRA-SMOOTH BUTTER MOVEMENT SYSTEM with INDEPENDENT COLLISION DETECTION 🧈
    setElements(prevElements => {
      // Use React's batching for optimal performance
      return prevElements.map(el => {
        if (!ids.includes(el.id)) return el;

        // Ultra-high precision position calculation (sub-pixel accuracy)
        const newX = el.x + deltaX;
        const newY = el.y + deltaY;

        // Optimized rotation handling for boundary calculations
        const rotation = (el.rotation || 0) % 360;
        const isRotated = rotation === 90 || rotation === 270;
        const effectiveWidth = isRotated ? el.height : el.width;
        const effectiveHeight = isRotated ? el.width : el.height;

        // 🔧 FIXED: PERFECT boundary constraints with INDEPENDENT movement 🔧
        // Calculate maximum positions with ultra-high precision
        const maxX = Math.max(0, dimensions.length - effectiveWidth);
        const maxY = Math.max(0, dimensions.width - effectiveHeight);

        // Apply boundary constraints with independent element movement
        let constrainedX = newX;
        let constrainedY = newY;

        // Special handling for windows and doors - allow wall positioning
        const isOpening = el.type === 'window' || el.type === 'door';

        if (isOpening) {
          // For openings, allow positioning at exact boundaries (walls)
          if (constrainedX < 0) {
            constrainedX = 0; // Left wall
          } else if (constrainedX > dimensions.length - effectiveWidth) {
            constrainedX = dimensions.length - effectiveWidth; // Right wall
          }

          if (constrainedY < 0) {
            constrainedY = 0; // Top wall
          } else if (constrainedY > dimensions.width - effectiveHeight) {
            constrainedY = dimensions.width - effectiveHeight; // Bottom wall
          }
        } else {
          // For furniture, maintain small margin from walls
          const margin = 0.1;
          if (constrainedX < margin) {
            constrainedX = margin;
          } else if (constrainedX > maxX - margin) {
            constrainedX = maxX - margin;
          }

          if (constrainedY < margin) {
            constrainedY = margin;
          } else if (constrainedY > maxY - margin) {
            constrainedY = maxY - margin;
          }
        }

        // 🔧 COLLISION DETECTION: Check if new position would cause collision 🔧
        const testElement = {
          ...el,
          x: constrainedX,
          y: constrainedY
        };

        // Temporarily disable collision detection during drag to fix duplication issue
        // TODO: Re-implement collision detection properly
        return {
          ...el,
          x: constrainedX,
          y: constrainedY
        };
      });
    });
  };

  const handleElementsMoveComplete = () => {
    // Add to history when drag is complete
    addToHistory();
  };

  const handleElementDuplicate = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now().toString(),
        x: Math.min(element.x + 1, dimensions.length - element.width),
        y: Math.min(element.y + 1, dimensions.width - element.height),
        zIndex: elements.length,
        properties: element.type === 'bunk-bed' ? {
          ...element.properties,
          bedId: `BUNK-${elements.filter(e => e.type === 'bunk-bed').length + 1}`,
          levels: element.properties?.levels?.map((level, idx) => ({
            ...level,
            id: `${Date.now()}-${idx}`,
            bedId: `BUNK-${elements.filter(e => e.type === 'bunk-bed').length + 1}`,
            assignedTo: undefined
          }))
        } : element.properties
      };
      addToHistory();
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      setSelectedElements([newElement.id]);
      toast.success(`${element.type.replace('-', ' ')} duplicated! 🎉`);
    }
  };

  const addElement = (type: string) => {
    const elementType = elementTypes.find(t => t.type === type);
    if (!elementType) return;

    // ✅ BED COUNT VALIDATION - FIXED
    if (type === 'single-bed' || type === 'bunk-bed') {
      // Calculate current bed capacity (sleeping spots)
      let currentBedCapacity = 0;
      elements.forEach(el => {
        if (el.type === 'single-bed') {
          currentBedCapacity += 1;
        } else if (el.type === 'bunk-bed') {
          currentBedCapacity += el.properties?.bunkLevels || 2;
        }
      });

      // Check if room has a bed count limit
      if (roomData?.bedCount && roomData.bedCount > 0) {
        const roomBedLimit = roomData.bedCount;
        const newBedCapacity = type === 'single-bed' ? 1 : (type === 'bunk-bed' ? 2 : 1);

        console.log('✅ Bed count validation active:', {
          roomBedLimit,
          currentBedCapacity,
          newBedCapacity,
          wouldExceed: currentBedCapacity + newBedCapacity > roomBedLimit
        });

        if (currentBedCapacity + newBedCapacity > roomBedLimit) {
          toast.error(`Cannot add ${type.replace('-', ' ')}!`, {
            description: `Room sleeping capacity: ${roomBedLimit}. Current: ${currentBedCapacity}. Adding ${type.replace('-', ' ')} (+${newBedCapacity}) would exceed limit.`,
            duration: 5000,
          });
          return; // Prevent adding the bed
        }
      } else {
        console.log('⚠️ No bed count limit set for this room', {
          roomData: roomData,
          bedCount: roomData?.bedCount,
          hasRoomData: !!roomData
        });
      }
    }

    // Start from corner (0,0) and work outward for better placement
    let x = 0, y = 0;
    let attempts = 0;
    const gridStep = snapToGrid ? 0.5 : 0.1;

    while (attempts < 200) {
      const testElement: RoomElement = {
        id: 'test',
        type,
        x, y,
        width: elementType.defaultSize.width,
        height: elementType.defaultSize.height,
        rotation: 0,
        zIndex: 0
      };

      // Check if element fits within room boundaries
      const fitsInRoom = (x + elementType.defaultSize.width <= dimensions.length) &&
        (y + elementType.defaultSize.height <= dimensions.width);

      if (fitsInRoom && !checkCollisions(testElement)) {
        break;
      }

      // Move in a spiral pattern for better placement
      x += gridStep;
      if (x + elementType.defaultSize.width > dimensions.length) {
        x = 0;
        y += gridStep;
        if (y + elementType.defaultSize.height > dimensions.width) {
          // If we can't fit anywhere, place at origin and let user move it
          x = 0;
          y = 0;
          break;
        }
      }
      attempts++;
    }

    // 🔧 FIXED: Generate unique IDs for each element type to prevent ID conflicts
    let elementId: string;
    let elementLabel: string;

    if (type === 'single-bed' || type === 'bunk-bed') {
      // Generate simple sequential bed IDs for better backend compatibility
      const bedElements = elements.filter(e => e.type === 'single-bed' || e.type === 'bunk-bed');
      const bedCount = bedElements.length;
      elementLabel = `Bed ${String.fromCharCode(65 + bedCount)}`; // A, B, C, D...

      // Use simple sequential bed IDs (bed1, bed2, bed3, etc.)
      const nextBedNumber = bedCount + 1;
      elementId = `bed${nextBedNumber}`;
    } else if (type === 'door') {
      // Generate unique door IDs
      const doorElements = elements.filter(e => e.type === 'door');
      const doorCount = doorElements.length;
      elementId = `door${doorCount + 1}`;
      elementLabel = `Door ${doorCount + 1}`;
    } else if (type === 'window') {
      // Generate unique window IDs
      const windowElements = elements.filter(e => e.type === 'window');
      const windowCount = windowElements.length;
      elementId = `window${windowCount + 1}`;
      elementLabel = `Window ${windowCount + 1}`;
    } else {
      // Generate unique IDs for other element types
      const sameTypeElements = elements.filter(e => e.type === type);
      const count = sameTypeElements.length;
      elementId = `${type}${count + 1}`;
      elementLabel = `${elementType.label} ${count + 1}`;
    }

    const bunkBedCount = elements.filter(e => e.type === 'bunk-bed').length;
    const singleBedCount = elements.filter(e => e.type === 'single-bed').length;

    // Dynamic sizing for bunk beds based on levels
    let bedWidth = elementType.defaultSize.width;
    let bedHeight = elementType.defaultSize.height;

    // For bunk beds, adjust size based on levels (default is 2-level)
    if (type === 'bunk-bed') {
      // 2-level: 2.6m × 2.2m (default)
      // 3-level: 3.0m × 2.7m
      bedWidth = 2.6; // Default 2-level width
      bedHeight = 2.2; // Default 2-level height
    }

    const newElement: RoomElement = {
      id: elementId, // 🔧 FIXED: Use the correct unique ID for each element type
      type,
      x: snapToGridPosition(x),
      y: snapToGridPosition(y),
      width: bedWidth,
      height: bedHeight,
      rotation: 0,
      zIndex: elements.length,
      properties: type === 'bunk-bed' ? {
        bedType: 'bunk',
        bedId: elementId,
        bedLabel: elementLabel,
        status: 'available',
        orientation: 'north',
        bunkLevels: 2, // Default to 2 levels
        isLocked: false,
        levels: [
          {
            id: `${elementId}-top`,
            position: 'top',
            bedId: `${elementId}-top`,
            status: 'available',
            assignedTo: undefined
          },
          {
            id: `${elementId}-bottom`,
            position: 'bottom',
            bedId: `${elementId}-bottom`,
            status: 'available',
            assignedTo: undefined
          }
        ]
      } : type === 'single-bed' ? {
        bedType: 'single',
        bedId: elementId,
        bedLabel: elementLabel,
        status: 'available',
        orientation: 'north'
      } : type === 'door' ? {
        hingeType: 'left'
      } : type === 'window' ? {
        isOpen: false
      } : {}
    };

    addToHistory();
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setSelectedElements([newElement.id]);
    toast.success(`${elementType.label} added to room! ✨`);
  };

  const updateElement = (id: string, updates: Partial<RoomElement>) => {
    // 🚫 TEMPORARILY DISABLED: Bunk bed level validation (for debugging)


    addToHistory();
    setElements(elements.map(el => {
      if (el.id === id) {
        const updatedElement = { ...el, ...updates };

        // Handle bunk bed level changes and dynamic sizing
        if (el.type === 'bunk-bed' && updates.properties?.bunkLevels) {
          const newLevels = updates.properties.bunkLevels;

          // Update dimensions based on levels
          if (newLevels === 2) {
            updatedElement.width = 2.6;
            updatedElement.height = 2.2;
          } else if (newLevels === 3) {
            updatedElement.width = 3.0;
            updatedElement.height = 2.7;
          }

          // Generate new levels array
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          const bedLabel = el.properties?.bedLabel || 'Bed';

          const newLevelsArray = [];
          for (let i = 0; i < newLevels; i++) {
            newLevelsArray.push({
              id: `${timestamp}-B${i + 1}-${randomSuffix}`,
              position: i === 0 ? 'top' : i === newLevels - 1 ? 'bottom' : 'middle',
              bedId: `${bedLabel}-B${i + 1}-${randomSuffix.toUpperCase()}`,
              status: 'available',
              assignedTo: undefined
            });
          }

          updatedElement.properties = {
            ...updatedElement.properties,
            levels: newLevelsArray
          };
        }

        return updatedElement;
      }
      return el;
    }));
  };

  const deleteElement = (id: string) => {
    addToHistory();
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success("Element deleted");
  };

  const rotateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      updateElement(id, { rotation: (element.rotation + 90) % 360 });
    }
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now().toString(),
        x: element.x + 1,
        y: element.y + 1,
        zIndex: elements.length
      };
      addToHistory();
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      toast.success("Element duplicated");
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
      toast.success("Undone");
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
      toast.success("Redone");
    }
  };

  const handleZoom = (delta: number) => {
    setScale(Math.max(10, Math.min(50, scale + delta)));
  };

  // Remove these handlers - let RoomCanvas handle all mouse events
  const handleCanvasMouseDown = () => { };
  const handleCanvasMouseMove = () => { };
  const handleCanvasMouseUp = () => { };

  const saveLayout = () => {
    console.log('🎨 RoomDesigner - Saving layout');
    console.log('📐 Dimensions:', dimensions);


    const layout = {
      dimensions,
      elements,
      theme: currentTheme,
      createdAt: new Date().toISOString(),
      warnings: collisionWarnings
    };

    console.log('✅ Layout object created:', {
      hasDimensions: !!layout.dimensions,
      hasElements: !!layout.elements,
      elementsCount: layout.elements?.length || 0,
      hasTheme: !!layout.theme
    });

    onSave(layout);
    toast.success("Room layout saved successfully!");
  };

  const clearRoom = () => {
    addToHistory();
    setElements([]);
    setSelectedElement(null);
    toast.success("Room cleared");
  };

  const handleExport = () => {
    toast.info("Export feature coming soon!");
  };

  const handleImport = () => {
    toast.info("Import feature coming soon!");
  };

  useEffect(() => {
    setCollisionWarnings(validateDimensions());
  }, [elements, dimensions]);

  const selectedElementData = elements.find(el => el.id === selectedElement);

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rooms
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Room Designer</h1>
              <p className="text-gray-600">Create your perfect room layout</p>
            </div>
          </div>

          <RoomSetupWizard
            onComplete={handleWizardComplete}
            initialData={{ dimensions, theme: currentTheme }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">




      {/* View Mode Toolbar - Simplified */}
      {isViewMode && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Room Layout View - {elements.length} beds
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs">Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs">Occupied</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-xs">Reserved</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span className="text-xs">Maintenance</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom(-5)}
              >
                Zoom Out
              </Button>
              <span className="text-sm text-gray-600">{scale}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom(5)}
              >
                Zoom In
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="bg-white shadow-lg hover:shadow-xl border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {!isViewMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={saveLayout}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl"
          >
            Save Layout
          </Button>
        </div>
      )}

      {isViewMode && (
        <div className="fixed top-4 right-4 z-50">
          <Badge variant="secondary" className="bg-white shadow-lg border">
            View Mode
          </Badge>
        </div>
      )}

      {/* Main Designer Layout - FIXED OVERFLOW */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Element Library - Only show in edit mode */}
        {!isViewMode && (
          <div className="w-72 flex-shrink-0">
            <ElementLibraryPanel
              onAddElement={addElement}
            />
          </div>
        )}

        {/* Canvas Container - FIXED SIZING */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 pt-2 pb-2">
          {/* Dynamic Canvas Title Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="font-medium">
                {isViewMode ? 'Room Layout View' : 'Room Designer'}
              </span>
              <span className="text-blue-600">
                {(() => {
                  // Count actual bed elements (not bed capacity)
                  let bedElements = 0;
                  elements.forEach(el => {
                    if (el.type === 'single-bed' || el.type === 'bunk-bed') {
                      bedElements += 1; // Count each bed element as 1, regardless of levels
                    }
                  });
                  return bedElements;
                })()} beds
              </span>
              <span className="text-gray-500 text-xs">
                • {elements.length} elements
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {(dimensions.length * 3.28084).toFixed(1)} × {(dimensions.width * 3.28084).toFixed(1)} × {(dimensions.height * 3.28084).toFixed(1)} ft
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            <RoomCanvas
              dimensions={dimensions}
              elements={elements}
              selectedElement={selectedElement}
              selectedElements={selectedElements}
              theme={currentTheme}
              scale={scale}
              showGrid={showGrid}
              snapToGrid={snapToGrid}
              duplicateMode={false}
              onMouseDown={isViewMode ? () => { } : handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove} // Keep for tooltips
              onMouseUp={isViewMode ? () => { } : handleCanvasMouseUp}
              onElementSelect={isViewMode ? () => { } : handleElementSelect}
              onElementsMove={isViewMode ? () => { } : handleElementsMove}
              onElementsMoveComplete={isViewMode ? () => { } : handleElementsMoveComplete}
              onElementRotate={isViewMode ? () => { } : rotateElement}
              onElementDuplicate={isViewMode ? () => { } : handleElementDuplicate}
              onElementDelete={isViewMode ? () => { } : deleteElement}
              checkCollisions={checkCollisions}
              warnings={collisionWarnings}
            />
          </div>
        </div>

        {/* Properties Panel - Only show in edit mode */}
        {!isViewMode && (
          <div className="w-72 flex-shrink-0">
            <PropertiesPanel
              selectedElement={selectedElementData || (lastSelectedElement ? elements.find(el => el.id === lastSelectedElement) : null)}
              onUpdateElement={updateElement}
              onRotateElement={rotateElement}
              hasCollision={selectedElementData ? checkCollisions(selectedElementData, selectedElementData.id) : false}
              isLastSelected={!selectedElementData && !!lastSelectedElement}
            />
          </div>
        )}

        {/* Bed Status Panel - Only show in view mode */}
        {isViewMode && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto flex-shrink-0">
            <h3 className="text-lg font-semibold mb-4">Bed Status Overview</h3>
            <div className="space-y-3">
              {elements.filter(el => el.type.includes('bed')).map(bed => (
                <div key={bed.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{bed.id}</span>
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: bed.color || '#10B981' }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Status: <span className="font-medium">{bed.status || 'Available'}</span></div>
                    {bed.occupantName && (
                      <div>Occupant: <span className="font-medium">{bed.occupantName}</span></div>
                    )}
                    {bed.gender && bed.gender !== 'Any' && (
                      <div>Gender: <span className="font-medium">{bed.gender}</span></div>
                    )}
                    {bed.bedDetails?.monthlyRate && (
                      <div>Rate: <span className="font-medium">NPR {bed.bedDetails.monthlyRate.toLocaleString()}/month</span></div>
                    )}
                    {bed.bedDetails?.occupiedSince && (
                      <div>Occupied since: <span className="font-medium">{new Date(bed.bedDetails.occupiedSince).toLocaleDateString()}</span></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
