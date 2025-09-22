
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  RotateCw, 
  Trash2, 
  Box, 
  AlertTriangle,
  Copy,
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
  onDeleteElement: (id: string) => void;
  onRotateElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  hasCollision: boolean;
  isLastSelected?: boolean;
}

export const PropertiesPanel = ({ 
  selectedElement, 
  onUpdateElement, 
  onDeleteElement, 
  onRotateElement, 
  onDuplicateElement,
  hasCollision,
  isLastSelected = false
}: PropertiesPanelProps) => {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            Properties
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <Box className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="font-medium mb-2">No Element Selected</h4>
            <p className="text-sm">Click on an element in the canvas to edit its properties</p>
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
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Icon className="h-5 w-5" style={{ color: elementType?.color }} />
            Properties
            {isLastSelected && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                Last Selected
              </Badge>
            )}
          </h3>
          <div className="text-2xl">{elementType?.emoji}</div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="capitalize">
            {selectedElement.type.replace('-', ' ')}
          </Badge>
          {elementType?.popular && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              Popular
            </Badge>
          )}
          {selectedElement.properties?.isLocked && (
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              <Lock className="h-3 w-3 mr-1" />
              Locked
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDuplicateElement(selectedElement.id)}
            className="flex-1"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
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
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Lock/Unlock Toggle */}
        {selectedElement.type === 'bunk-bed' && (
          <div className="space-y-4">
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
        <div className="space-y-4">
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

        <Separator />

        {/* Transform */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Transform
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-600">Rotation (°)</Label>
              <Input
                type="number"
                value={selectedElement.rotation}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    onUpdateElement(selectedElement.id, { rotation: 0 });
                  } else {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                      onUpdateElement(selectedElement.id, { rotation: Math.max(0, Math.min(360, numValue)) });
                    }
                  }
                }}
                step="90"
                min="0"
                max="360"
                className="text-sm"
                disabled={selectedElement.properties?.isLocked}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Layer (Z-Index)</Label>
              <Input
                type="number"
                value={selectedElement.zIndex}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    onUpdateElement(selectedElement.id, { zIndex: 0 });
                  } else {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                      onUpdateElement(selectedElement.id, { zIndex: Math.max(0, numValue) });
                    }
                  }
                }}
                min="0"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bunk Bed Specific Properties */}
        {selectedElement.type === 'bunk-bed' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                🛏️ Bunk Bed Configuration
              </h4>
              
              <div>
                <Label className="text-xs text-gray-600">Bunk Bed ID</Label>
                <Input
                  value={selectedElement.properties?.bedId || ''}
                  onChange={(e) => updateProperty('bedId', e.target.value)}
                  placeholder="e.g., BUNK-A, BUNK-001"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Number of Levels</Label>
                <Select
                  value={String(selectedElement.properties?.bunkLevels || 2)}
                  onValueChange={(value) => updateBunkLevels(Number(value))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">🔹 2-Level Bunk</SelectItem>
                    <SelectItem value="3">🔹 3-Level Bunk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Orientation</Label>
                <Select
                  value={selectedElement.properties?.orientation || 'north'}
                  onValueChange={(value) => updateProperty('orientation', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north">⬆️ North</SelectItem>
                    <SelectItem value="south">⬇️ South</SelectItem>
                    <SelectItem value="east">➡️ East</SelectItem>
                    <SelectItem value="west">⬅️ West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Level Assignment Section */}
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                🎯 Level Assignments
              </h4>
              
              <div className="space-y-3">
                {selectedElement.properties?.levels?.map((level, index) => (
                  <div key={level.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getLevelIcon(level.position)}</span>
                        {getLevelEmoji(level.position)}
                        <span className="font-medium text-sm capitalize">{level.position} Bunk</span>
                      </div>
                      <Badge variant={level.assignedTo ? "default" : "outline"} className="text-xs">
                        {level.assignedTo ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                        {level.assignedTo ? 'Assigned' : 'Unassigned'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-600">Bed ID</Label>
                        <Input
                          value={level.bedId}
                          onChange={(e) => {
                            const updatedLevels = selectedElement.properties?.levels?.map(l => 
                              l.id === level.id ? { ...l, bedId: e.target.value } : l
                            );
                            onUpdateElement(selectedElement.id, {
                              properties: { ...selectedElement.properties, levels: updatedLevels }
                            });
                          }}
                          className="text-xs"
                          placeholder={`${selectedElement.properties?.bedId}-${level.position.toUpperCase()}`}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600">
                          Assigned Student {level.assignedTo && '✅'}
                        </Label>
                        <Input
                          value={level.assignedTo || ''}
                          onChange={(e) => assignToLevel(level.id, e.target.value)}
                          className="text-xs"
                          placeholder="Enter student name..."
                        />
                      </div>
                      
                      {level.assignedTo && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => assignToLevel(level.id, '')}
                          className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserX className="h-3 w-3 mr-1" />
                          Unassign Student
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Regular Bed Properties */}
        {(selectedElement.type.includes('bed') && selectedElement.type !== 'bunk-bed') && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                🛏️ Bed Properties
              </h4>
              
              <div>
                <Label className="text-xs text-gray-600">Bed ID</Label>
                <Input
                  value={selectedElement.properties?.bedId || ''}
                  onChange={(e) => updateProperty('bedId', e.target.value)}
                  placeholder="e.g., BED-A, BED-001"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Bed Type</Label>
                <Select
                  value={selectedElement.properties?.bedType || 'single'}
                  onValueChange={(value) => updateProperty('bedType', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">🛏️ Single Bed</SelectItem>
                    <SelectItem value="double">🛌 Double Bed</SelectItem>
                    <SelectItem value="kids">🧸 Kids Bed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Orientation</Label>
                <Select
                  value={selectedElement.properties?.orientation || 'north'}
                  onValueChange={(value) => updateProperty('orientation', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north">⬆️ North</SelectItem>
                    <SelectItem value="south">⬇️ South</SelectItem>
                    <SelectItem value="east">➡️ East</SelectItem>
                    <SelectItem value="west">⬅️ West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

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

        {/* Element Info */}
        <Separator />
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900">Element Info</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium capitalize">{selectedElement.type.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Area:</span>
              <span className="font-medium">
                {formatSquareMetersAsFeet(selectedElement.width * selectedElement.height)}
              </span>
            </div>
            {selectedElement.type === 'bunk-bed' && (
              <>
                <div className="flex justify-between">
                  <span>Levels:</span>
                  <span className="font-medium">{selectedElement.properties?.bunkLevels || 2}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned:</span>
                  <span className="font-medium">
                    {selectedElement.properties?.levels?.filter(l => l.assignedTo).length || 0} / {selectedElement.properties?.levels?.length || 0}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span>Layer:</span>
              <span className="font-medium">L{selectedElement.zIndex}</span>
            </div>
            {elementType?.category && (
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium capitalize">{elementType.category}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onDuplicateElement(selectedElement.id)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate Element
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDeleteElement(selectedElement.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Element
        </Button>
      </div>
    </div>
  );
};
