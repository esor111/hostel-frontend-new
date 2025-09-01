import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bed, Plus, Edit, Trash2, Users, Settings, Layout, Eye, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { RoomDesigner } from "./RoomDesigner";
import { RoomLayoutViewer } from "./RoomLayoutViewer";
import { useRooms } from "@/hooks/useRooms";

export const RoomConfiguration = () => {
  const { translations } = useLanguage();
  
  // Use the new useRooms hook for API integration (following hostel-ladger-frontend pattern)
  const {
    rooms,
    loading,
    error,
    stats,
    createRoom,
    updateRoom,
    deleteRoom,
    refreshData,
  } = useRooms();

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [showRoomDesigner, setShowRoomDesigner] = useState(false);
  const [selectedRoomForDesign, setSelectedRoomForDesign] = useState<string | null>(null);
  const [showLayoutViewer, setShowLayoutViewer] = useState(false);
  const [selectedRoomForView, setSelectedRoomForView] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState({
    name: "",
    roomNumber: "",
    type: "Dormitory",
    bedCount: 1,
    gender: "Mixed",
    baseRate: 12000,
    amenities: []
  });

  const roomTypes = ["Dormitory", "Private", "Capsule"];
  const genderOptions = ["Mixed", "Male", "Female"];
  const availableAmenities = [
    "Wi-Fi", "Lockers", "Reading Light", "Private Bathroom", 
    "AC", "TV", "Power Outlet", "Personal Locker", "Bunk Bed"
  ];

  const handleAddRoom = async () => {
    // Validate required fields
    if (!newRoom.name.trim()) {
      toast.error("Room name is required!");
      return;
    }

    if (!newRoom.roomNumber.trim()) {
      toast.error("Room number is required!");
      return;
    }

    // Validate capacity (bedCount)
    if (!newRoom.bedCount || newRoom.bedCount < 1 || newRoom.bedCount > 10) {
      toast.error("Bed count must be between 1 and 10!");
      return;
    }

    // Validate rent (baseRate)
    if (newRoom.baseRate < 0) {
      toast.error("Base rate cannot be negative!");
      return;
    }

    try {
      const roomData = {
        name: newRoom.name,
        roomNumber: newRoom.roomNumber,
        type: newRoom.type,
        capacity: Number(newRoom.bedCount),
        rent: Number(newRoom.baseRate),
        gender: newRoom.gender,
        status: "ACTIVE",
        amenities: newRoom.amenities,
        isActive: true,
        description: `${newRoom.type} room with ${newRoom.bedCount} beds`
      };

      await createRoom(roomData);

      // Reset form
      setNewRoom({
        name: "",
        roomNumber: "",
        type: "Dormitory",
        bedCount: 1,
        gender: "Mixed",
        baseRate: 12000,
        amenities: []
      });
      setShowAddRoom(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error in handleAddRoom:', error);
    }
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom) return;

    // Validate required fields
    if (!newRoom.name.trim()) {
      toast.error("Room name is required!");
      return;
    }

    if (!newRoom.roomNumber.trim()) {
      toast.error("Room number is required!");
      return;
    }

    // Validate capacity (bedCount)
    if (!newRoom.bedCount || newRoom.bedCount < 1 || newRoom.bedCount > 10) {
      toast.error("Bed count must be between 1 and 10!");
      return;
    }

    // Validate rent (baseRate)
    if (newRoom.baseRate < 0) {
      toast.error("Base rate cannot be negative!");
      return;
    }

    try {
      const roomData = {
        name: newRoom.name,
        roomNumber: newRoom.roomNumber,
        type: newRoom.type,
        capacity: Number(newRoom.bedCount),
        rent: Number(newRoom.baseRate),
        gender: newRoom.gender,
        status: "ACTIVE",
        amenities: newRoom.amenities,
        isActive: true,
        description: `${newRoom.type} room with ${newRoom.bedCount} beds`
      };

      await updateRoom(editingRoom.id, roomData);

      // Reset form and editing state
      setNewRoom({
        name: "",
        roomNumber: "",
        type: "Dormitory",
        bedCount: 1,
        gender: "Mixed",
        baseRate: 12000,
        amenities: []
      });
      setEditingRoom(null);
      setShowAddRoom(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error in handleUpdateRoom:', error);
    }
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setNewRoom({
      name: room.name,
      roomNumber: room.roomNumber || "",
      type: room.type,
      bedCount: room.bedCount,
      gender: room.gender,
      baseRate: room.monthlyRate || room.baseRate || 0,
      amenities: room.amenities || []
    });
    setShowAddRoom(true);
  };

  const handleDeleteRoom = async (room: any) => {
    if (room.occupancy > 0) {
      toast.error("Cannot delete room with current occupants. Please move students first.");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${room.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteRoom(room.id);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error in handleDeleteRoom:', error);
    }
  };

  const cancelEdit = () => {
    setEditingRoom(null);
    setNewRoom({
      name: "",
      roomNumber: "",
      type: "Dormitory",
      bedCount: 1,
      gender: "Mixed",
      baseRate: 12000,
      amenities: []
    });
    setShowAddRoom(false);
  };

  const openRoomDesigner = (roomId: string) => {
    setSelectedRoomForDesign(roomId);
    setShowRoomDesigner(true);
  };

  const handleSaveLayout = async (layout: any) => {
    if (selectedRoomForDesign) {
      try {
        console.log('💾 Saving room layout:', layout);
        
        // Analyze what we're trying to save
        const hasElements = layout.elements && layout.elements.length > 0;
        const hasTheme = layout.theme && Object.keys(layout.theme).length > 0;
        const hasDimensions = layout.dimensions && Object.keys(layout.dimensions).length > 0;
        
        console.log(`📊 Layout analysis: ${hasElements ? layout.elements.length : 0} elements, ${hasTheme ? 'has theme' : 'no theme'}, ${hasDimensions ? 'has dimensions' : 'no dimensions'}`);
        
        // Warn user about backend limitations before saving
        if (hasElements || hasTheme) {
          console.warn('⚠️ Backend will only save dimensions, ignoring elements and theme');
        }
        
        // Send layout as object (backend expects object, not string)
        const layoutData = {
          layout: layout // Send complete object, even though backend ignores most of it
        };
        
        await updateRoom(selectedRoomForDesign, layoutData);
        setShowRoomDesigner(false);
        setSelectedRoomForDesign(null);
        
        // The success message is now handled in the updateRoom hook with appropriate warnings
      } catch (error) {
        console.error('Error saving room layout:', error);
        toast.error("Failed to save room layout. Please try again.");
      }
    }
  };

  const closeRoomDesigner = () => {
    setShowRoomDesigner(false);
    setSelectedRoomForDesign(null);
  };

  const handleViewLayout = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    
    // Check if room has at least dimensions (minimum requirement for viewing)
    const hasDimensions = room?.layout && room.layout.dimensions;
    
    if (hasDimensions) {
      console.log('📐 Viewing room layout:', room.layout);
      
      // Log if elements are missing due to backend limitations
      if (!room.layout.elements || room.layout.elements.length === 0) {
        console.warn('⚠️ Layout elements missing - showing room with dimensions only due to backend limitations');
      }
      
      setSelectedRoomForView(roomId);
      setShowLayoutViewer(true);
    } else {
      console.log('❌ No layout dimensions found for room:', room?.layout);
      toast.info("Please configure the room layout first using the Layout Designer", {
        description: "Click the Layout button to design your room",
        duration: 4000,
      });
    }
  };

  const closeLayoutViewer = () => {
    setShowLayoutViewer(false);
    setSelectedRoomForView(null);
  };

  // Show room designer if selected
  if (showRoomDesigner && selectedRoomForDesign) {
    const roomData = rooms.find(r => r.id === selectedRoomForDesign);
    return (
      <RoomDesigner
        onSave={handleSaveLayout}
        onClose={closeRoomDesigner}
        roomData={roomData?.layout} // This is now properly parsed layout object
      />
    );
  }

  // Loading state (following hostel-ladger-frontend pattern)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  // Error state (following hostel-ladger-frontend pattern)
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{translations.rooms}</h2>
          {stats && (
            <p className="text-gray-600 mt-1">
              {stats.totalRooms} rooms • {stats.occupiedBeds}/{stats.totalBeds} beds occupied • {stats.occupancyRate}% occupancy
            </p>
          )}
        </div>
        <Button onClick={() => setShowAddRoom(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Room
        </Button>
      </div>

      {showAddRoom && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Name <span className="text-red-500">*</span></Label>
                <Input
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g., Dorm A - Mixed"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Room Number <span className="text-red-500">*</span></Label>
                <Input
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  placeholder="e.g., A-101, B-205, C-301"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={newRoom.type} onValueChange={(value) => setNewRoom({ ...newRoom, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bed Count</Label>
                <Input
                  type="number"
                  value={newRoom.bedCount}
                  onChange={(e) => setNewRoom({ ...newRoom, bedCount: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender Type</Label>
                <Select value={newRoom.gender} onValueChange={(value) => setNewRoom({ ...newRoom, gender: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Base Monthly Rate (NPR per month)</Label>
                <Input
                  type="number"
                  value={newRoom.baseRate}
                  onChange={(e) => setNewRoom({ ...newRoom, baseRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  placeholder="e.g., 8000"
                />
              </div>
            </div>
            
            {/* Amenities Section */}
            <div className="space-y-3 mt-4">
              <Label>Room Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={newRoom.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRoom({ ...newRoom, amenities: [...newRoom.amenities, amenity] });
                        } else {
                          setNewRoom({ ...newRoom, amenities: newRoom.amenities.filter(a => a !== amenity) });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
              {newRoom.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newRoom.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={editingRoom ? handleUpdateRoom : handleAddRoom}>
                {editingRoom ? 'Update Room' : 'Add Room'}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    {room.name}
                  </CardTitle>
                  {room.roomNumber && (
                    <p className="text-sm text-gray-600 mt-1">Room #{room.roomNumber}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{room.type}</Badge>
                    <Badge variant="outline">{room.gender}</Badge>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                    {room.layout && (
                      <Badge 
                        variant="secondary" 
                        className={
                          room.layout.dimensions && room.layout.elements && room.layout.elements.length > 0
                            ? "bg-green-100 text-green-700" 
                            : room.layout.dimensions 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-gray-100 text-gray-700"
                        }
                      >
                        {room.layout.dimensions && room.layout.elements && room.layout.elements.length > 0
                          ? "Layout Complete" 
                          : room.layout.dimensions 
                            ? "Dimensions Only" 
                            : "No Layout"
                        }
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewLayout(room.id)}
                    className="text-green-600 hover:text-green-700"
                    title={room.layout ? "View saved room layout" : "Configure room layout first"}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openRoomDesigner(room.id)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditRoom(room)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteRoom(room)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {room.bedCount} beds
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {room.occupancy}/{room.bedCount} occupied
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Monthly Rate</div>
                  <div className="text-xl font-bold text-blue-600">
                    NPR {(room.monthlyRate || 0).toLocaleString()}/month
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Daily: NPR {(room.dailyRate || Math.round((room.monthlyRate || 0) / 30)).toLocaleString()}/day
                  </div>
                </div>

                {room.layout && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 mb-1">Room Layout</div>
                    <div className="text-sm text-gray-600">
                      {room.layout.dimensions?.length}m × {room.layout.dimensions?.width}m
                      <br />
                      {room.layout.elements?.length || 0} elements configured
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Amenities</div>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities && room.amenities.length > 0 ? (
                      room.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No amenities listed</span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${room.bedCount > 0 ? (room.occupancy / room.bedCount) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {room.bedCount > 0 ? Math.round((room.occupancy / room.bedCount) * 100) : 0}% Occupancy
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Layout Viewer Dialog */}
      <Dialog open={showLayoutViewer} onOpenChange={setShowLayoutViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-purple-600" />
              Room Layout View
            </DialogTitle>
          </DialogHeader>
          {selectedRoomForView && (
            <RoomLayoutViewer
              layout={rooms.find(r => r.id === selectedRoomForView)?.layout}
              roomName={rooms.find(r => r.id === selectedRoomForView)?.name || "Room"}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
    case "Active":
      return "bg-green-100 text-green-700";
    case "MAINTENANCE":
    case "Maintenance":
      return "bg-yellow-100 text-yellow-700";
    case "INACTIVE":
    case "Inactive":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}