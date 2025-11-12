import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Bed, Users, DollarSign, ArrowLeft } from 'lucide-react';
import { RoomData, FloorData } from '@/types/manualStudent';

interface RoomSelectionProps {
  selectedFloor: FloorData;
  rooms: RoomData[];
  loading: boolean;
  onSelectRoom: (room: RoomData) => void;
  onBack: () => void;
}

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
        <Card className="text-center py-12">
          <CardContent>
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Rooms Available</h3>
            <p className="text-gray-500">No rooms with available beds found on this floor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card
              key={room.roomId}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                room.availableBeds > 0
                  ? 'hover:border-[#1295D0] border-2 border-transparent'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => room.availableBeds > 0 && onSelectRoom(room)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${
                    room.availableBeds > 0
                      ? 'bg-gradient-to-br from-[#07A64F] to-[#1295D0] text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Home className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant={room.availableBeds > 0 ? "default" : "secondary"}
                      className={room.availableBeds > 0 ? "bg-green-100 text-green-800" : ""}
                    >
                      {room.availableBeds} available
                    </Badge>
                    {room.gender && (
                      <Badge variant="outline" className="text-xs">
                        {room.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardTitle className="text-xl mb-2">
                  Room {room.roomNumber}
                </CardTitle>
                
                {room.name && (
                  <p className="text-sm text-gray-600 mb-4">{room.name}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Occupancy</p>
                      <p className="font-semibold">{room.occupancy}/{room.bedCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Rate</p>
                      <p className="font-semibold">NPR {room.monthlyRate.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {room.availableBeds === 0 && (
                  <div className="p-2 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600 text-center">Room is full</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
