import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Bed, Home, Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { FloorData } from '@/types/manualStudent';

interface FloorSelectionProps {
  floors: FloorData[];
  loading: boolean;
  onSelectFloor: (floor: FloorData) => void;
}

// Enhanced Floor Card Component
const FloorCard: React.FC<{ floor: FloorData; onSelect: () => void }> = ({ floor, onSelect }) => {
  const isAvailable = floor.availableBeds > 0;
  const occupancyPercentage = floor.totalBeds > 0 ? Math.round((floor.totalBeds - floor.availableBeds) / floor.totalBeds * 100) : 0;
  const roomOccupancyPercentage = floor.totalRooms > 0 ? Math.round((floor.totalRooms - floor.availableRooms) / floor.totalRooms * 100) : 0;
  
  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
        isAvailable
          ? 'hover:border-[#1295D0] border-2 border-transparent hover:bg-gradient-to-br hover:from-blue-50 hover:to-green-50'
          : 'opacity-70 cursor-not-allowed border-2 border-gray-200'
      } overflow-hidden`}
      onClick={() => isAvailable && onSelect()}
    >
      {/* Header with gradient background */}
      <div className={`relative h-20 ${
        isAvailable 
          ? 'bg-gradient-to-br from-[#1295D0] via-[#0EA5E9] to-[#07A64F]' 
          : 'bg-gradient-to-br from-gray-400 to-gray-500'
      }`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Floor icon and number */}
        <div className="relative h-full flex items-center justify-center text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Floor {floor.floorNumber}</h3>
              <p className="text-xs opacity-90">Level {floor.floorNumber}</p>
            </div>
          </div>
        </div>

        {/* Availability badge */}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={isAvailable ? "default" : "secondary"}
            className={`${
              isAvailable 
                ? "bg-green-500 hover:bg-green-600 text-white shadow-lg border-green-400" 
                : "bg-gray-500 text-white border-gray-400"
            } font-semibold px-2 py-1 text-xs`}
          >
            {isAvailable ? (
              <><CheckCircle className="h-3 w-3 mr-1" />{floor.availableBeds}</>
            ) : (
              <><AlertCircle className="h-3 w-3 mr-1" />Full</>
            )}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Rooms Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-blue-500 rounded">
                <Home className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">ROOMS</p>
                <p className="text-sm font-bold text-blue-800">{floor.availableRooms}/{floor.totalRooms}</p>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, roomOccupancyPercentage)}%` }}
              />
            </div>
          </div>
          
          {/* Beds Stats */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-green-500 rounded">
                <Bed className="h-3 w-3 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">BEDS</p>
                <p className="text-sm font-bold text-green-800">{floor.availableBeds}/{floor.totalBeds}</p>
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, occupancyPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isAvailable ? (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#1295D0] to-[#07A64F] rounded-lg text-white">
            <div>
              <p className="text-sm font-semibold">Ready to select</p>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        ) : (
          <div className="flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-3 w-3 text-red-500 mr-2" />
            <p className="text-xs text-red-700 font-medium">No beds available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Floors...</h2>
          <p className="text-gray-600">Please wait while we fetch available floors</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              {/* Header skeleton */}
              <div className="h-32 bg-gradient-to-br from-gray-300 to-gray-400"></div>
              
              <CardContent className="p-6">
                {/* Stats grid skeleton */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-100 p-4 rounded-xl">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-xl">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
                
                {/* Summary stats skeleton */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="h-6 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
                
                {/* Action button skeleton */}
                <div className="h-16 bg-gray-200 rounded-xl"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (floors.length === 0) {
    return (
      <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent>
          <div className="max-w-md mx-auto">
            <div className="p-6 bg-gray-200 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Building className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">No Floors Available</h3>
            <p className="text-gray-500 leading-relaxed">
              No floors with available beds found. Please check back later or contact the administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {floors.map((floor) => (
        <FloorCard
          key={floor.floorNumber}
          floor={floor}
          onSelect={() => onSelectFloor(floor)}
        />
      ))}
    </div>
  );
};
