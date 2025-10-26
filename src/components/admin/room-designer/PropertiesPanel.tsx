
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  RotateCw, 
  Box, 
  AlertTriangle,
  Settings,
  Users,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { elementTypes } from "./ElementTypes";
import { formatMetersAsFeet, formatSquareMetersAsFeet, formatDimensionsAsFeet, metersToFeet, feetToMeters } from "@/utils/unitConversion";

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

interface PropertiesPanelProps {
  selectedElement: RoomElement | null;
  onUpdateElement: (id: string, updates: Partial<RoomElement>) => void;
  onRotateElement: (id: string) => void;
  hasCollision: boolean;
  isLastSelected?: boolean;
}

export const PropertiesPanel = ({ 
  selectedElement, 
  onUpdateElement, 
  onRotateElement, 
  hasCollision,
  isLastSelected = false
}: PropertiesPanelProps) => {
  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 h-full flex flex-col">
        <div className="p-2 border-b border-gray-200">
          <h3 className="font-semibold text-xs flex items-center gap-1">
            <Settings className="h-3 w-3 text-gray-400" />
            Properties
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <Box className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <h4 className="font-medium mb-1 text-xs">No Element Selected</h4>
            <p className="text-xs">Click on an element to edit</p>
          </div>
        </div>
      </div>
    );
  }

  const elementType = elementTypes.find(e => e.type === selectedElement.type);
  const Icon = elementType?.icon || Box;

  const updateProperty = (key: string, value: any) => {
    onUpdateElement(selectedElement.id, {
      properties: { ...selectedElement.properties, [key]: value }
    });
  };

  const updateBunkLevels = (newLevels: number) => {
    const currentLevels = selectedElement.properties?.levels || [];
    const bedId = selectedElement.properties?.bedId || '';
    
    let updatedLevels: BunkLevel[] = [];
    
    if (newLevels === 2) {
      updatedLevels = [
        currentLevels.find(l => l.position === 'top') || {
          id: `${Date.now()}-top`,
          position: 'top',
          bedId: `${bedId}-TOP`,
          assignedTo: undefined
        },
        currentLevels.find(l => l.position === 'bottom') || {
          id: `${Date.now()}-bottom`,
          position: 'bottom',
          bedId: `${bedId}-BTM`,
          assignedTo: undefined
        }
      ];
    } else if (newLevels === 3) {
      updatedLevels = [
        currentLevels.find(l => l.position === 'top') || {
          id: `${Date.now()}-top`,
          position: 'top',
          bedId: `${bedId}-TOP`,
          assignedTo: undefined
        },
        currentLevels.find(l => l.position === 'middle') || {
          id: `${Date.now()}-middle`,
          position: 'middle',
          bedId: `${bedId}-MID`,
          assignedTo: undefined
        },
        currentLevels.find(l => l.position === 'bottom') || {
          id: `${Date.now()}-bottom`,
          position: 'bottom',
          bedId: `${bedId}-BTM`,
          assignedTo: undefined
        }
      ];
    }
    
    onUpdateElement(selectedElement.id, {
      properties: { 
        ...selectedElement.properties, 
        bunkLevels: newLevels,
        levels: updatedLevels
      }
    });
  };

  const assignToLevel = (levelId: string, studentName: string) => {
    const updatedLevels = selectedElement.properties?.levels?.map(level => 
      level.id === levelId 
        ? { ...level, assignedTo: studentName || undefined }
        : level
    );
    
    onUpdateElement(selectedElement.id, {
      properties: { ...selectedElement.properties, levels: updatedLevels }
    });
  };

  const getLevelIcon = (position: 'top' | 'middle' | 'bottom') => {
    switch (position) {
      case 'top': return '🛏️⬆️';
      case 'middle': return '🛏️↕️';
      case 'bottom': return '🛏️⬇️';
      default: return '🛏️';
    }
  };

  const getLevelEmoji = (position: 'top' | 'middle' | 'bottom') => {
    switch (position) {
      case 'top': return <ArrowUp className="h-4 w-4" />;
      case 'middle': return <Minus className="h-4 w-4" />;
      case 'bottom': return <ArrowDown className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: elementType?.color }} />
            Properties
          </h3>
          <div className="text-lg">{elementType?.emoji}</div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize text-sm">
            {selectedElement.type.replace('-', ' ')}
          </Badge>
          {elementType?.popular && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-sm">
              Popular
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRotateElement(selectedElement.id)}
            className="flex-1"
            disabled={selectedElement.properties?.isLocked}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collision Warning */}
      {hasCollision && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Collision Detected!</span>
          </div>
          <p className="text-red-700 text-xs mt-1">
            This element overlaps with another. Please adjust its position.
          </p>
        </div>
      )}

      {/* Properties Form */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {/* Lock/Unlock Toggle */}
        {selectedElement.type === 'bunk-bed' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-700 flex items-center gap-2">
                {selectedElement.properties?.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                Lock Position
              </Label>
              <Switch
                checked={selectedElement.properties?.isLocked || false}
                onCheckedChange={(checked) => updateProperty('isLocked', checked)}
              />
            </div>
            <p className="text-xs text-gray-500">
              Lock prevents accidental movement and rotation of this bunk bed.
            </p>
          </div>
        )}

        {/* Position & Size */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
            <Box className="h-4 w-4" />
            Position & Size
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-600">X Position (m)</Label>
              <Input
                type="number"
                value={selectedElement.x.toFixed(1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    onUpdateElement(selectedElement.id, { x: 0 });
                  } else {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                      onUpdateElement(selectedElement.id, { x: Math.max(0, numValue) });
                    }
                  }
                }}
                step="0.1"
                min="0"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Y Position (m)</Label>
              <Input
                type="number"
                value={selectedElement.y.toFixed(1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    onUpdateElement(selectedElement.id, { y: 0 });
                  } else {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                      onUpdateElement(selectedElement.id, { y: Math.max(0, numValue) });
                    }
                  }
                }}
                step="0.1"
                min="0"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Width (ft)</Label>
              <Input
                type="number"
                value={metersToFeet(selectedElement.width).toFixed(1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    onUpdateElement(selectedElement.id, { width: feetToMeters(1.0) });
                  } else {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                      // Convert feet back to meters for storage
                      onUpdateElement(selectedElement.id, { width: Math.max(feetToMeters(0.3), feetToMeters(numValue)) });
                    }
                  }
                }}
                step="0.1"
                min="0.3"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Height (ft)</Label>
              <Input
                type="number"
                value={metersToFeet(selectedElement.height).toFixed(1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    onUpdateElement(selectedElement.id, { height: feetToMeters(1.0) });
                  } else {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                      // Convert feet back to meters for storage
                      onUpdateElement(selectedElement.id, { height: Math.max(feetToMeters(0.3), feetToMeters(numValue)) });
                    }
                  }
                }}
                step="0.1"
                min="0.1"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
          </div>
        </div>





        {/* Regular Bed Properties */}


        {/* Study Table Properties */}
        {selectedElement.type === 'study-table' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                🪵 Study Table Properties
              </h4>
              
              <div>
                <Label className="text-xs text-gray-600">Material</Label>
                <Select
                  value={selectedElement.properties?.material || 'wood'}
                  onValueChange={(value) => updateProperty('material', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wood">🪵 Wooden</SelectItem>
                    <SelectItem value="metal">🔩 Metal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Number of Drawers</Label>
                <Select
                  value={String(selectedElement.properties?.drawers || 0)}
                  onValueChange={(value) => updateProperty('drawers', Number(value))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Drawers</SelectItem>
                    <SelectItem value="1">1 Drawer</SelectItem>
                    <SelectItem value="2">2 Drawers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {selectedElement.type === 'door' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                🚪 Door Properties
              </h4>
              
              <div>
                <Label className="text-xs text-gray-600">Hinge Type</Label>
                <Select
                  value={selectedElement.properties?.hingeType || 'left'}
                  onValueChange={(value) => updateProperty('hingeType', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">⬅️ Left Hinge</SelectItem>
                    <SelectItem value="right">➡️ Right Hinge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}



        {selectedElement.type === 'charging-port' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                🔌 Charging Port Properties
              </h4>
              
              <div>
                <Label className="text-xs text-gray-600">Port Type</Label>
                <Select
                  value={selectedElement.properties?.portType || 'USB'}
                  onValueChange={(value) => updateProperty('portType', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USB">🔌 USB</SelectItem>
                    <SelectItem value="Type-C">🔌 Type-C</SelectItem>
                    <SelectItem value="Universal">🔌 Universal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {selectedElement.type === 'study-lamp' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                💡 Study Lamp Properties
              </h4>
              
              <div>
                <Label className="text-xs text-gray-600">Brightness Level</Label>
                <Input
                  type="range"
                  min="10"
                  max="100"
                  value={selectedElement.properties?.brightness || 50}
                  onChange={(e) => updateProperty('brightness', Number(e.target.value))}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500 text-center">
                  {selectedElement.properties?.brightness || 50}%
                </div>
              </div>
            </div>
          </>
        )}


      </div>


    </div>
  );
};
