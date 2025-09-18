import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bed, Plus, Edit, Trash2, Users, Layout, Eye, Loader2, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { RoomDesigner } from "./RoomDesigner";
import { RoomLayoutViewer } from "./RoomLayoutViewer";
import { useRooms } from "@/hooks/useRooms";
import { useNavigate } from "react-router-dom";
import ImageUpload from "@/components/common/ImageUpload";

export const RoomConfiguration = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate();

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
  const [showRoomViewer, setShowRoomViewer] = useState(false);
  const [selectedRoomForBedView, setSelectedRoomForBedView] = useState<string | null>(null);

  // New state for enhanced room creation workflow
  const [roomCreationStep, setRoomCreationStep] = useState<'basic' | 'layout' | 'complete'>('basic');
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(6); // Show 6 rooms per page
  const [newRoom, setNewRoom] = useState({
    name: "",
    roomNumber: "",
    type: "Dormitory",
    bedCount: 1,
    gender: "Mixed",
    baseRate: 12000,
    amenities: [],
    images: [] as string[]
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
    const bedCountNum = Number(newRoom.bedCount);
    if (!bedCountNum || bedCountNum < 1 || bedCountNum > 10) {
      toast.error("Bed count must be between 1 and 10!");
      return;
    }

    // Validate rent (baseRate)
    const baseRateNum = Number(newRoom.baseRate);
    if (baseRateNum < 0) {
      toast.error("Base rate cannot be negative!");
      return;
    }

    try {
      const roomData = {
        name: newRoom.name,
        roomNumber: newRoom.roomNumber,
        type: newRoom.type,
        capacity: bedCountNum,
        rent: baseRateNum,
        gender: newRoom.gender,
        status: "ACTIVE",
        amenities: newRoom.amenities,
        images: newRoom.images,
        isActive: true,
        description: `${newRoom.type} room with ${bedCountNum} beds`
      };

      const createdRoom = await createRoom(roomData);

      // Enhanced workflow: Move to layout design step
      if (createdRoom && createdRoom.id) {
        setPendingRoomId(createdRoom.id);
        setRoomCreationStep('layout');
        toast.success("Room created! Now let's design the layout.", {
          description: "Configure bed positions and room layout",
          duration: 4000,
        });
      } else {
        // Fallback to old workflow if room ID not available - complete creation and hide form
        completeRoomCreation();
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error in handleAddRoom:', error);
    }
  };

  const completeRoomCreation = () => {
    // Reset form and state completely
    setNewRoom({
      name: "",
      roomNumber: "",
      type: "Dormitory",
      bedCount: 1,
      gender: "Mixed",
      baseRate: 12000,
      amenities: [],
      images: []
    });
    setShowAddRoom(false);
    setRoomCreationStep('basic');
    setPendingRoomId(null);
    setEditingRoom(null); // Clear any editing state

    toast.success("Room creation completed!", {
      description: "Room has been created successfully and form has been reset.",
      duration: 3000,
    });

    // Refresh the rooms data to show the new room
    refreshData();
  };

  const skipLayoutDesign = () => {
    toast.info("Layout design skipped. You can design it later.", {
      description: "Click the Layout button on the room card to design later",
      duration: 4000,
    });
    completeRoomCreation();
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
    const bedCountNum = Number(newRoom.bedCount);
    if (!bedCountNum || bedCountNum < 1 || bedCountNum > 10) {
      toast.error("Bed count must be between 1 and 10!");
      return;
    }

    // Validate rent (baseRate)
    const baseRateNum = Number(newRoom.baseRate);
    if (baseRateNum < 0) {
      toast.error("Base rate cannot be negative!");
      return;
    }

    try {
      const roomData = {
        name: newRoom.name,
        roomNumber: newRoom.roomNumber,
        type: newRoom.type,
        capacity: bedCountNum,
        rent: baseRateNum,
        gender: newRoom.gender,
        status: "ACTIVE",
        amenities: newRoom.amenities,
        images: newRoom.images,
        isActive: true,
        description: `${newRoom.type} room with ${bedCountNum} beds`
      };

      await updateRoom(editingRoom.id, roomData);

      // Reset form and editing state completely
      setNewRoom({
        name: "",
        roomNumber: "",
        type: "Dormitory",
        bedCount: 1,
        gender: "Mixed",
        baseRate: 12000,
        amenities: [],
        images: []
      });
      setEditingRoom(null);
      setShowAddRoom(false);

      toast.success("Room updated successfully!", {
        description: "Room details have been updated and form has been reset.",
        duration: 3000,
      });
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
      amenities: room.amenities || [],
      images: room.images || []
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
      amenities: [],
      images: []
    });
    setShowAddRoom(false);
  };

  const openRoomDesigner = (roomId: string) => {
    setSelectedRoomForDesign(roomId);
    setShowRoomDesigner(true);
  };

  const handleSaveLayout = async (layout: any) => {
    const roomId = selectedRoomForDesign || pendingRoomId;

    if (roomId) {
      try {
        console.log('💾 Saving room layout:', layout);

        // Analyze what we're trying to save
        const hasElements = layout.elements && layout.elements.length > 0;
        const hasTheme = layout.theme && Object.keys(layout.theme).length > 0;
        const hasDimensions = layout.dimensions && Object.keys(layout.dimensions).length > 0;

        console.log(`📊 Layout analysis: ${hasElements ? layout.elements.length : 0} elements, ${hasTheme ? 'has theme' : 'no theme'}, ${hasDimensions ? 'has dimensions' : 'no dimensions'}`);

        // Send complete layout data to backend
        const layoutData = {
          layout: layout // Send complete layout object
        };

        await updateRoom(roomId, layoutData);

        // Handle different scenarios with proper navigation
        if (roomCreationStep === 'layout' && pendingRoomId) {
          // Complete room creation workflow
          completeRoomCreation();
        } else {
          // Regular layout update - close designer and redirect to room listing
          setShowRoomDesigner(false);
          setSelectedRoomForDesign(null);

          // Show success message and redirect to room listing page
          toast.success('Room layout saved successfully!', {
            description: 'Redirecting to room listing page...',
            duration: 2000,
          });

          // Redirect to room listing page after saving layout
          setTimeout(() => {
            navigate('/rooms');
          }, 1000);
        }

      } catch (error) {
        console.error('Error saving room layout:', error);
        toast.error("Failed to save room layout. Please try again.");
      }
    }
  };

  const closeRoomDesigner = () => {
    if (roomCreationStep === 'layout' && pendingRoomId) {
      // Ask user if they want to skip layout design during room creation
      if (confirm("Do you want to skip layout design? You can design it later.")) {
        skipLayoutDesign();
      }
      // If they don't want to skip, keep the designer open
    } else {
      // Regular close for existing room layout editing
      setShowRoomDesigner(false);
      setSelectedRoomForDesign(null);

      // Show helpful message about how to access the layout later
      toast.info('Layout designer closed', {
        description: 'You can reopen the layout designer anytime by clicking the "Layout" button on any room.',
        duration: 4000,
      });
    }
  };

  const handleViewLayout = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);

    // Check if room has layout data
    const hasLayout = room?.layout && (room.layout.dimensions || room.layout.elements);

    if (hasLayout) {
      console.log('📐 Viewing room layout:', room.layout);
      setSelectedRoomForView(roomId);
      setShowLayoutViewer(true);
    } else {
      console.log('❌ No layout found for room:', room?.layout);
      toast.info("Please configure the room layout first using the Layout Designer", {
        description: "Click the Layout button to design your room",
        duration: 4000,
      });
    }
  };

  const openRoomBedViewer = (roomId: string) => {
    setSelectedRoomForBedView(roomId);
    setShowRoomViewer(true);
  };

  const closeRoomBedViewer = () => {
    setShowRoomViewer(false);
    setSelectedRoomForBedView(null);
  };



  // Show room designer if selected or during room creation workflow
  if (showRoomDesigner && (selectedRoomForDesign || (roomCreationStep === 'layout' && pendingRoomId))) {
    const roomId = selectedRoomForDesign || pendingRoomId;
    const roomData = rooms.find(r => r.id === roomId);
    return (
      <RoomDesigner
        onSave={handleSaveLayout}
        onClose={closeRoomDesigner}
        roomData={roomData?.layout} // This is now properly parsed layout object
        isViewMode={false} // Allow editing in room management
      />
    );
  }

  // Show room bed viewer if selected
  if (showRoomViewer && selectedRoomForBedView) {
    const roomData = rooms.find(r => r.id === selectedRoomForBedView);
    return (
      <RoomDesigner
        onSave={() => { }} // No save functionality in view mode
        onClose={closeRoomBedViewer}
        roomData={roomData?.layout}
        isViewMode={true} // Read-only view mode with bed status visualization
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

      {showAddRoom && roomCreationStep === 'basic' && (
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
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string during editing, parse only when not empty
                    setNewRoom({
                      ...newRoom,
                      bedCount: value === '' ? '' : Math.max(1, parseInt(value) || 1)
                    });
                  }}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string during editing, parse only when not empty
                    setNewRoom({
                      ...newRoom,
                      baseRate: value === '' ? '' : Math.max(0, parseFloat(value) || 0)
                    });
                  }}
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
                  {newRoom.amenities.map((amenity, index) => {
                    // Handle both string and object formats for amenities
                    const amenityText = typeof amenity === 'string' ? amenity : amenity?.name || amenity?.description || 'Unknown';
                    const amenityKey = typeof amenity === 'string' ? amenity : amenity?.id || `new-amenity-${index}`;

                    return (
                      <Badge key={amenityKey} variant="secondary" className="text-xs">
                        {amenityText}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Room Images Section */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gray-600" />
                <Label className="text-base font-medium">Room Images</Label>
              </div>
              <p className="text-sm text-gray-600">
                Upload images to help guests visualize the room. Images will be stored securely and displayed in the booking interface.
              </p>
              <ImageUpload
                onImagesUploaded={(imageUrls) => setNewRoom({ ...newRoom, images: imageUrls })}
                existingImages={newRoom.images}
                maxImages={8}
                className="mt-3"
              />
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

      {/* Layout Design Step */}
      {roomCreationStep === 'layout' && pendingRoomId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-purple-600" />
              Design Room Layout
            </CardTitle>
            <p className="text-gray-600">
              Configure bed positions and room layout for better management
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Room Created Successfully!</h4>
                <p className="text-blue-700 text-sm">
                  Your room "{newRoom.name}" has been created. Now let's design the layout to position beds and furniture.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedRoomForDesign(pendingRoomId);
                    setShowRoomDesigner(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Design Layout
                </Button>
                <Button
                  variant="outline"
                  onClick={skipLayoutDesign}
                >
                  Skip for Now
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                <p>💡 <strong>Tip:</strong> Designing the layout now will help with:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Better bed management and assignment</li>
                  <li>Visual room status monitoring</li>
                  <li>Mobile app room viewing</li>
                  <li>Accurate occupancy tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination Logic */}
      {(() => {
        const indexOfLastRoom = currentPage * roomsPerPage;
        const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
        const currentRooms = rooms.slice(indexOfFirstRoom, indexOfLastRoom);
        const totalPages = Math.ceil(rooms.length / roomsPerPage);

        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentRooms.map((room) => (
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
                        {room.layout && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRoomBedViewer(room.id)}
                            className="text-green-600 hover:text-green-700"
                            title="View Room with Bed Status"
                          >
                            <Bed className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewLayout(room.id)}
                          className="text-blue-600 hover:text-blue-700"
                          title={room.layout ? "View saved room layout" : "Configure room layout first"}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRoomDesigner(room.id)}
                          className="text-purple-600 hover:text-purple-700"
                          title="Edit Room Layout"
                        >
                          <Layout className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRoom(room)}
                          className="text-orange-600 hover:text-orange-700"
                          title="Edit Room Details"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteRoom(room)}
                          title="Delete Room"
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

                      {/* Room Images */}
                      {room.images && room.images.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Room Images ({room.images.length})
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {room.images.slice(0, 4).map((imageUrl, index) => (
                              <div key={index} className="flex-shrink-0">
                                <img
                                  src={imageUrl}
                                  alt={`${room.name} - Image ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-md border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                            {room.images.length > 4 && (
                              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-600">
                                +{room.images.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Amenities</div>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities && room.amenities.length > 0 ? (
                            room.amenities.map((amenity, index) => {
                              // Handle both string and object formats for amenities
                              const amenityText = typeof amenity === 'string' ? amenity : amenity?.name || amenity?.description || 'Unknown';
                              const amenityKey = typeof amenity === 'string' ? amenity : amenity?.id || `amenity-${index}`;

                              return (
                                <Badge key={amenityKey} variant="secondary" className="text-xs">
                                  {amenityText}
                                </Badge>
                              );
                            })
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center text-sm text-gray-600 mt-4">
              Showing {indexOfFirstRoom + 1} to {Math.min(indexOfLastRoom, rooms.length)} of {rooms.length} rooms
            </div>
          </>
        );
      })()}

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