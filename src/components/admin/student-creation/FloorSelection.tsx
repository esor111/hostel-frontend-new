import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Bed, Home, Users } from 'lucide-react';
import { FloorData } from '@/types/manualStudent';

interface FloorSelectionProps {
  floors: FloorData[];
  loading: boolean;
  onSelectFloor: (floor: FloorData) => void;
}

export const FloorSelection: React.FC<FloorSelectionProps> = ({
  floors,
  loading,
  onSelectFloor
}) => {
  // Debug logging
  console.log('🏢 FloorSelection component received:');
  console.log('🏢 floors:', floors);
  console.log('🏢 floors.length:', floors?.length);
  console.log('🏢 loading:', loading);
  console.log('🏢 floors type:', typeof floors);
  console.log('🏢 floors is array:', Array.isArray(floors));
  if (loading) {
    return (
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
    );
  }

  if (floors.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Floors Available</h3>
          <p className="text-gray-500">No floors with available beds found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Floor</h2>
        <p className="text-gray-600">Choose a floor to view available rooms and beds</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floors.map((floor) => (
          <Card
            key={floor.floorNumber}
            className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              floor.availableBeds > 0
                ? 'hover:border-[#1295D0] border-2 border-transparent'
                : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => floor.availableBeds > 0 && onSelectFloor(floor)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${
                  floor.availableBeds > 0
                    ? 'bg-gradient-to-br from-[#1295D0] to-[#07A64F] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <Building className="h-6 w-6" />
                </div>
                <Badge 
                  variant={floor.availableBeds > 0 ? "default" : "secondary"}
                  className={floor.availableBeds > 0 ? "bg-green-100 text-green-800" : ""}
                >
                  {floor.availableBeds} beds available
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <CardTitle className="text-xl mb-4">
                Floor {floor.floorNumber}
              </CardTitle>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Rooms</p>
                    <p className="font-semibold">{floor.availableRooms}/{floor.totalRooms}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Beds</p>
                    <p className="font-semibold">{floor.availableBeds}/{floor.totalBeds}</p>
                  </div>
                </div>
              </div>

              {floor.availableBeds === 0 && (
                <div className="mt-4 p-2 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 text-center">No beds available on this floor</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
