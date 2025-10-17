import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bed, Plus, Edit, Trash2, Users, Layout, Eye, Loader2, Image as ImageIcon, Power } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { RoomDesigner } from "./RoomDesigner";
import { RoomLayoutViewer } from "./RoomLayoutViewer";
import { useRooms } from "@/hooks/useRooms";
import { useNavigate } from "react-router-dom";
import ImageUpload from "@/components/common/ImageUpload";
import { formatDimensionsAsFeet } from "@/utils/unitConversion";

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

  const [showRoomDesigner, setShowRoomDesigner] = useState(false);
  const [selectedRoomForDesign, setSelectedRoomForDesign] = useState<string | null>(null);
  const [showLayoutViewer, setShowLayoutViewer] = useState(false);
  const [selectedRoomForView, setSelectedRoomForView] = useState<string | null>(null);
  const [showRoomViewer, setShowRoomViewer] = useState(false);
  const [selectedRoomForBedView, setSelectedRoomForBedView] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(6); // Show 6 rooms per page



  const handleEditRoom = (room: any) => {
    // Navigate to addroom page with room data for editing
    navigate(`/addroom?edit=${room.id}`, {
      state: {
        roomData: room,
        isEditing: true
      }
    });
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

  const handleToggleRoomStatus = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const newStatus = room.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      // Check if room has occupants when trying to deactivate
      if (newStatus === "INACTIVE" && room.occupancy > 0) {
        toast.error("Cannot deactivate room with current occupants. Please move students first.");
        return;
      }

      try {
        await updateRoom(roomId, { status: newStatus });
        toast.success(`Room "${room.name}" is now ${newStatus.toLowerCase()}`);
        // Refresh data to show updated status
        refreshData();
      } catch (error) {
        console.error('Error updating room status:', error);
        toast.error("Failed to update room status.");
      }
    }
  };

  const openRoomDesigner = (roomId: string) => {
    setSelectedRoomForDesign(roomId);
    setShowRoomDesigner(true);
  };

  const handleSaveLayout = async (layout: any) => {
    if (selectedRoomForDesign) {
      try {
        console.log('💾 Saving room layout:', layout);

        // Send complete layout data to backend
        const layoutData = {
          layout: layout // Send complete layout object
        };

        await updateRoom(selectedRoomForDesign, layoutData);

        // Close designer and show success message
        setShowRoomDesigner(false);
        setSelectedRoomForDesign(null);
        toast.success('Room layout saved successfully!');

        // Refresh data to show updated layout
        refreshData();
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

    // Check if room has layout data
    const hasLayout = room?.layout && (room.layout.dimensions || room.layout.elements);

    if (hasLayout) {
      console.log('✅ Layout found - opening viewer');
      setSelectedRoomForView(roomId);
      setShowLayoutViewer(true);
    } else {
      console.log('❌ No valid layout found');
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
        roomData={roomData?.layout}
        isViewMode={false}
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
        <Button onClick={() => navigate("/addroom")} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Room
        </Button>
      </div>





      {/* Pagination Logic */}
      {(() => {
        const indexOfLastRoom = currentPage * roomsPerPage;
        const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
        const currentRooms = rooms.slice(indexOfFirstRoom, indexOfLastRoom);
        const totalPages = Math.ceil(rooms.length / roomsPerPage);

        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentRooms.map((room) => (
                <Card key={room.id} className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${room.status === "Inactive" ? "opacity-75 grayscale-[0.3]" : ""
                  }`}>
                  {/* Room Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                          <Bed className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-medium">{room.type} Room</p>
                          <p className="text-xs text-gray-400">No image available</p>
                        </div>
                      </div>
                    )}

                    {/* Status Badge Overlay */}
                    <div className="absolute top-3 left-3">
                      <Badge className={getStatusColor(room.status)}>
                        {room.status}
                      </Badge>
                    </div>

                    {/* Layout Badge */}
                    {room.layout && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          <Layout className="h-3 w-3 mr-1" />
                          Layout Ready
                        </Badge>
                      </div>
                    )}

                    {/* Action Buttons Overlay */}
                    <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Eye icon removed - layout viewer disabled */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openRoomDesigner(room.id)}
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                        title="Design room layout"
                      >
                        <Layout className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="space-y-3">
                      {/* Room Name and Number */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {room.name}
                          </CardTitle>
                          {room.roomNumber && (
                            <p className="text-sm text-gray-500 mt-1">R-{room.roomNumber}</p>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleRoomStatus(room.id)}
                            className={`h-8 w-8 p-0 ${room.status === "ACTIVE"
                              ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                              : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              }`}
                            title={room.status === "ACTIVE" ? "Deactivate room" : "Activate room"}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          {room.layout && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openRoomBedViewer(room.id)}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="View Room with Bed Status"
                            >
                              <Bed className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditRoom(room)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Edit room details"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteRoom(room)}
                            title="Delete room"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Room Info Badges */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Users className="h-3 w-3 mr-1" />
                          {room.occupancy}/{room.bedCount || room.capacity}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          <Layout className="h-3 w-3 mr-1" />
                          Floor {room.floorNumber || 1}
                        </Badge>
                      </div>

                      {/* Availability Status */}
                      {room.bedCount && room.occupancy !== undefined && (
                        <div className="text-sm">
                          {room.occupancy < room.bedCount ? (
                            <span className="text-green-600 font-medium">
                              {room.bedCount - room.occupancy} bed{room.bedCount - room.occupancy !== 1 ? 's' : ''} available
                            </span>
                          ) : (
                            <span className="text-gray-500 font-medium">Fully occupied</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Pricing - Prominent Display */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Monthly Rate</div>
                          <div className="text-2xl font-bold text-green-600">
                            NPR {(room.rent || room.monthlyRate || room.baseRate || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Per Month</div>
                        </div>
                      </div>
                    </div>

                    {/* Room Layout Info */}
                    {room.layout && (
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <div className="text-sm text-purple-700 font-medium mb-1">Room Layout</div>
                        <div className="text-sm text-gray-600">
                          {/* Check if dimensions are configured (not default 10x8 values) */}
                          {room.layout.dimensions?.length && room.layout.dimensions?.width ? (
                            // Check if these are the old default values
                            (room.layout.dimensions.length === 10 && room.layout.dimensions.width === 8) ? (
                              <>
                                <span className="text-amber-600">Default dimensions (click Layout to customize)</span>
                                <br />
                              </>
                            ) : (
                              <>
                                {formatDimensionsAsFeet(room.layout.dimensions.length, room.layout.dimensions.width)}
                                <br />
                              </>
                            )
                          ) : (
                            <>
                              <span className="text-gray-500">Dimensions not set</span>
                              <br />
                            </>
                          )}
                          {room.layout.elements?.length || 0} elements configured
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Amenities</div>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 4).map((amenity, index) => {
                            const amenityText = typeof amenity === 'string' ? amenity : amenity?.name || amenity?.description || 'Unknown';
                            const amenityKey = typeof amenity === 'string' ? amenity : amenity?.id || `amenity-${index}`;
                            return (
                              <Badge key={amenityKey} variant="secondary" className="text-xs">
                                {amenityText}
                              </Badge>
                            );
                          })}
                          {room.amenities.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{room.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

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

      {/* Layout Viewer Dialog removed - feature disabled */}
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