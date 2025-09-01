import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, AlertTriangle, ArrowLeft } from "lucide-react";
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
}

export const RoomDesigner = ({ onSave, onClose, roomData }: RoomDesignerProps) => {
  const [showWizard, setShowWizard] = useState(!roomData);

  const [dimensions, setDimensions] = useState({
    length: roomData?.dimensions?.length || 10,
    width: roomData?.dimensions?.width || 8,
    height: roomData?.dimensions?.height || 3
  });

  const [currentTheme, setCurrentTheme] = useState<RoomTheme>(
    roomData?.theme || {
      name: 'Modern',
      wallColor: '#F8F9FA',
      floorColor: '#E9ECEF'
    }
  );

  const [elements, setElements] = useState<RoomElement[]>(roomData?.elements || []);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [lastSelectedElement, setLastSelectedElement] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [duplicateMode, setDuplicateMode] = useState(false);

  const [snapToGrid, setSnapToGrid] = useState(true);
  const [scale, setScale] = useState(30);
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const [history, setHistory] = useState<RoomElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [collisionWarnings, setCollisionWarnings] = useState<string[]>([]);

  const snapToGridPosition = (value: number) => {
    if (!snapToGrid) return value;
    const gridSize = 0.5;
    return Math.round(value / gridSize) * gridSize;
  };

  const checkCollisions = (newElement: RoomElement, excludeId?: string) => {
    return elements.some(element => {
      if (element.id === excludeId) return false;

      const overlap = !(
        newElement.x >= element.x + element.width ||
        newElement.x + newElement.width <= element.x ||
        newElement.y >= element.y + element.height ||
        newElement.y + newElement.height <= element.y
      );

      return overlap;
    });
  };

  const validateDimensions = () => {
    const warnings: string[] = [];

    if (dimensions.length < 2 || dimensions.width < 2) {
      warnings.push("Room dimensions too small (minimum 2m x 2m)");
    }

    if (dimensions.length > 20 || dimensions.width > 20) {
      warnings.push("Room dimensions very large (maximum recommended 20m x 20m)");
    }

    if (dimensions.height < 2.2) {
      warnings.push("Room height too low (minimum 2.2m recommended)");
    }

    elements.forEach(element => {
      if (element.x + element.width > dimensions.length || element.y + element.height > dimensions.width) {
        warnings.push(`${element.type} extends beyond room boundaries`);
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
      setSelectedElements(prev =>
        prev.includes(id)
          ? prev.filter(elId => elId !== id)
          : [...prev, id]
      );
      // Update single selection to the last selected element
      if (!selectedElements.includes(id)) {
        setSelectedElement(id);
        setLastSelectedElement(id);
      }
    } else {
      setSelectedElement(id);
      setSelectedElements([id]);
      setLastSelectedElement(id);
    }
  };

  const handleElementsMove = (ids: string[], deltaX: number, deltaY: number) => {
    // 🧈 ULTRA-SMOOTH BUTTER MOVEMENT SYSTEM 🧈
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
        
        // 🔧 FIXED: PERFECT boundary constraints with wall-snapping for windows/doors 🔧
        // Calculate maximum positions with ultra-high precision
        const maxX = Math.max(0, dimensions.length - effectiveWidth);
        const maxY = Math.max(0, dimensions.width - effectiveHeight);
        
        // Apply boundary constraints with wall-snapping for openings
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
        
        // Return element with butter-smooth positioning
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

    // Generate unique IDs and labels for beds
    const bedElements = elements.filter(e => e.type === 'single-bed' || e.type === 'bunk-bed');
    const bedCount = bedElements.length;
    const bedLabel = `Bed ${String.fromCharCode(65 + bedCount)}`; // A, B, C, D...
    
    // Generate unique timestamp-based IDs
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    
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
      id: `${type}-${timestamp}-${randomSuffix}`,
      type,
      x: snapToGridPosition(x),
      y: snapToGridPosition(y),
      width: bedWidth,
      height: bedHeight,
      rotation: 0,
      zIndex: elements.length,
      properties: type === 'bunk-bed' ? {
        bedType: 'bunk',
        bedId: `BUNK-${String(bunkBedCount + 1).padStart(3, '0')}-${randomSuffix.toUpperCase()}`,
        bedLabel: bedLabel,
        status: 'available',
        orientation: 'north',
        bunkLevels: 2, // Default to 2 levels
        isLocked: false,
        levels: [
          {
            id: `${timestamp}-B1-${randomSuffix}`,
            position: 'top',
            bedId: `${bedLabel}-B1-${randomSuffix.toUpperCase()}`,
            status: 'available',
            assignedTo: undefined
          },
          {
            id: `${timestamp}-B2-${randomSuffix}`,
            position: 'bottom',
            bedId: `${bedLabel}-B2-${randomSuffix.toUpperCase()}`,
            status: 'available',
            assignedTo: undefined
          }
        ]
      } : type === 'single-bed' ? {
        bedType: 'single',
        bedId: `BED-${String(singleBedCount + 1).padStart(3, '0')}-${randomSuffix.toUpperCase()}`,
        bedLabel: bedLabel,
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
  const handleCanvasMouseDown = () => {};
  const handleCanvasMouseMove = () => {};
  const handleCanvasMouseUp = () => {};

  const saveLayout = () => {
    const layout = {
      dimensions,
      elements,
      theme: currentTheme,
      createdAt: new Date().toISOString(),
      warnings: collisionWarnings
    };
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rooms
            </Button>
            <div className="flex items-center gap-2">
              <Box className="h-6 w-6 text-purple-500" />
              <h1 className="text-xl font-bold">God-Tier Room Designer</h1>
              {collisionWarnings.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {collisionWarnings.length} Warning{collisionWarnings.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowWizard(true)}
            className="text-purple-600 hover:text-purple-700"
          >
            Room Setup
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <DesignerToolbar
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        scale={scale}
        onZoomIn={() => handleZoom(5)}
        onZoomOut={() => handleZoom(-5)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
        onSave={saveLayout}
        onClear={clearRoom}
        onExport={handleExport}
        onImport={handleImport}
        elementCount={elements.length}
        roomDimensions={dimensions}
      />

      {/* Main Designer Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Element Library */}
        <ElementLibraryPanel
          onAddElement={addElement}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onDuplicateMode={setDuplicateMode}
          duplicateMode={duplicateMode}
        />

        {/* Canvas */}
        <RoomCanvas
          dimensions={dimensions}
          elements={elements}
          selectedElement={selectedElement}
          selectedElements={selectedElements}
          theme={currentTheme}
          scale={scale}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          duplicateMode={duplicateMode}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onElementSelect={handleElementSelect}
          onElementsMove={handleElementsMove}
          onElementsMoveComplete={handleElementsMoveComplete}
          onElementRotate={rotateElement}
          onElementDuplicate={handleElementDuplicate}
          onElementDelete={deleteElement}
          checkCollisions={checkCollisions}
          warnings={collisionWarnings}
        />

        {/* Properties Panel */}
        <PropertiesPanel
          selectedElement={selectedElementData || (lastSelectedElement ? elements.find(el => el.id === lastSelectedElement) : null)}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onRotateElement={rotateElement}
          onDuplicateElement={duplicateElement}
          hasCollision={selectedElementData ? checkCollisions(selectedElementData, selectedElementData.id) : false}
          isLastSelected={!selectedElementData && !!lastSelectedElement}
        />
      </div>
    </div>
  );
};
