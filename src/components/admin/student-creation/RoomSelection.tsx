import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Bed, Users, DollarSign, ArrowLeft, ImageIcon, Wifi, Car, Coffee, Tv, Wind, Star } from 'lucide-react';
import { RoomData, FloorData } from '@/types/manualStudent';

interface RoomSelectionProps {
  selectedFloor: FloorData;
  rooms: RoomData[];
  loading: boolean;
  onSelectRoom: (room: RoomData) => void;
  onBack: () => void;
}

// Helper function to get amenity icons
const getAmenityIcon = (amenityName: string) => { 
  const name = amenityName.toLowerCase();
  if (name.includes('wifi') || name.includes('internet')) return Wifi;
  if (name.includes('parking') || name.includes('car')) return Car;
  if (name.includes('coffee') || name.includes('kitchen')) return Coffee;
  if (name.includes('tv') || name.includes('television')) return Tv;
  if (name.includes('ac') || name.includes('air')) return Wind;
  return Star; // Default icon
};

// Enhanced Room Card Component
const RoomCard: React.FC<{ room: RoomData; onSelect: () => void }> = ({ room, onSelect }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const hasImages = room.images && room.images.length > 0 && !imageError;
  const currentImage = hasImages ? room.images[currentImageIndex] : null;
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (room.images && room.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    }
  };
  
  const isAvailable = room.availableBeds > 0;
  
  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
        isAvailable
          ? 'hover:border-[#1295D0] border-2 border-transparent hover:bg-gradient-to-br hover:from-blue-50 hover:to-green-50'
          : 'opacity-60 cursor-not-allowed'
      }`}
      onClick={() => isAvailable && onSelect()}
    >
      {/* Room Image */}
      <div className="relative h-32 overflow-hidden rounded-t-lg">
        {hasImages ? (
          <div className="relative w-full h-full">
            <img
              src={currentImage}
              alt={`Room ${room.roomNumber}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
            {room.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
                  onClick={nextImage}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
                  onClick={nextImage}
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            )}
            {/* Image indicator dots */}
            {room.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {room.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isAvailable
              ? 'bg-gradient-to-br from-[#07A64F] to-[#1295D0]'
              : 'bg-gray-200'
          }`}>
            <div className="text-center">
              <Home className={`h-8 w-8 mx-auto mb-1 ${
                isAvailable ? 'text-white' : 'text-gray-400'
              }`} />
              <p className={`text-xs font-medium ${
                isAvailable ? 'text-white' : 'text-gray-500'
              }`}>
                Room {room.roomNumber}
              </p>
            </div>
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={isAvailable ? "default" : "secondary"}
            className={`${
              isAvailable 
                ? "bg-green-500 hover:bg-green-600 text-white shadow-lg" 
                : "bg-gray-500 text-white"
            } font-semibold text-xs px-2 py-1`}
          >
            {room.availableBeds}
          </Badge>
        </div>
        
        {/* Gender Badge */}
        {room.gender && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-300 text-xs px-2 py-1">
              {room.gender}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        {/* Room Title */}
        <div className="mb-2">
          <CardTitle className="text-lg font-bold text-gray-900 mb-1">
            Room {room.roomNumber}
          </CardTitle>
          {room.name && (
            <p className="text-xs text-gray-600 font-medium">{room.name}</p>
          )}
        </div>
        
        {/* Room Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Bed className="h-3 w-3 text-[#1295D0]" />
            <div>
              <p className="text-xs text-gray-500">Beds</p>
              <p className="font-bold text-xs">{room.occupancy}/{room.bedCount}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <DollarSign className="h-3 w-3 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Rate</p>
              <p className="font-bold text-xs">NPR {room.monthlyRate.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((amenity) => {
                const IconComponent = getAmenityIcon(amenity.name);
                return (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                    title={amenity.description || amenity.name}
                  >
                    <IconComponent className="h-2.5 w-2.5" />
                    <span className="truncate max-w-12">{amenity.name}</span>
                  </div>
                );
              })}
              {room.amenities.length > 3 && (
                <div className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  +{room.amenities.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        {!isAvailable ? (
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-xs text-red-700 text-center font-medium">
              🚫 Full
            </p>
          </div>
        ) : (
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-700 text-center font-medium">
              ✅ Available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const RoomSelection: React.FC<RoomSelectionProps> = ({
  selectedFloor,
  rooms,
  loading,
  onSelectRoom,
  onBack
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Floors
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Floors
          </Button>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">Floor {selectedFloor.floorNumber}</h2>
          <p className="text-gray-600">Select a room to view available beds</p>
        </div>
      </div>

      {/* Rooms grid */}
      {rooms.length === 0 ? (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Home className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">No Rooms Available</h3>
              <p className="text-gray-500 leading-relaxed">
                No rooms with available beds found on Floor {selectedFloor.floorNumber}. 
                Please try a different floor or check back later.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Room count and filter info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{rooms.length}</span> rooms found
              </p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Available</span>
                <div className="w-3 h-3 bg-gray-400 rounded-full ml-3"></div>
                <span className="text-sm text-gray-600">Full</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced rooms grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.roomId}
                room={room}
                onSelect={() => onSelectRoom(room)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
