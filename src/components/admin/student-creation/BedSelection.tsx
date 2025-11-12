import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bed, ArrowLeft, DollarSign, Info, CheckCircle } from 'lucide-react';
import { BedData, RoomData } from '@/types/manualStudent';
import { cn } from '@/lib/utils';

interface BedSelectionProps {
  selectedRoom: RoomData;
  beds: BedData[];
  loading: boolean;
  onSelectBed: (bed: BedData) => void;
  onBack: () => void;
}

export const BedSelection: React.FC<BedSelectionProps> = ({
  selectedRoom,
  beds,
  loading,
  onSelectBed,
  onBack
}) => {
  const [selectedBed, setSelectedBed] = useState<BedData | null>(null);
  const [hoveredBed, setHoveredBed] = useState<string | null>(null);

  // Handle both full and abbreviated status values
  const isAvailable = (status: string) => status === 'AVAILABLE' || status === 'Available' || status === 'A';
  const isOccupied = (status: string) => status === 'OCCUPIED' || status === 'Occupied' || status === 'O';
  const isReserved = (status: string) => status === 'RESERVED' || status === 'Reserved' || status === 'R';
  const isMaintenance = (status: string) => status === 'MAINTENANCE' || status === 'Maintenance' || status === 'M';

  const getBedStatusColor = (status: string) => {
    if (isAvailable(status)) {
      return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
    } else if (isOccupied(status)) {
      return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
    } else if (isReserved(status)) {
      return 'bg-yellow-100 border-yellow-300 text-yellow-800 cursor-not-allowed';
    } else if (isMaintenance(status)) {
      return 'bg-gray-100 border-gray-300 text-gray-800 cursor-not-allowed';
    } else {
      return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getBedStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Bed className="h-6 w-6" />;
      case 'OCCUPIED':
        return <Bed className="h-6 w-6" />;
      case 'RESERVED':
        return <Bed className="h-6 w-6" />;
      case 'MAINTENANCE':
        return <Bed className="h-6 w-6" />;
      default:
        return <Bed className="h-6 w-6" />;
    }
  };

  const handleBedClick = (bed: BedData) => {
    if (isAvailable(bed.status)) {
      setSelectedBed(bed);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedBed) {
      onSelectBed(selectedBed);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rooms
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const availableBeds = beds.filter(bed => isAvailable(bed.status));
  const occupiedBeds = beds.filter(bed => isOccupied(bed.status));
  const reservedBeds = beds.filter(bed => isReserved(bed.status));
  const maintenanceBeds = beds.filter(bed => isMaintenance(bed.status));

  // Debug logging
  console.log('🛏️ BedSelection received beds:', beds);
  console.log('🛏️ Bed statuses:', beds.map(b => ({ id: b.bedIdentifier, status: b.status })));
  console.log('🛏️ Available beds:', availableBeds.length);
  console.log('🛏️ Occupied beds:', occupiedBeds.length);

  return (
    <div className="space-y-6">
      {/* Header with back button and room info */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">Room {selectedRoom.roomNumber}</h2>
          <p className="text-gray-600">Select an available bed for the student</p>
        </div>
      </div>

      {/* Bed status legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="font-semibold text-gray-900">Bed Status:</h3>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm">Available ({availableBeds.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm">Occupied ({occupiedBeds.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span className="text-sm">Reserved ({reservedBeds.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-sm">Maintenance ({maintenanceBeds.length})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bed grid layout */}
      {beds.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Beds Found</h3>
            <p className="text-gray-500">No beds found in this room.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Bed Layout - Room {selectedRoom.roomNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {beds.map((bed) => (
                <div
                  key={bed.bedId}
                  className={cn(
                    "relative aspect-square rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center p-3",
                    getBedStatusColor(bed.status),
                    isAvailable(bed.status) && "hover:scale-105 hover:shadow-md cursor-pointer",
                    selectedBed?.bedId === bed.bedId && "ring-2 ring-[#1295D0] ring-offset-2 scale-105",
                    hoveredBed === bed.bedId && isAvailable(bed.status) && "shadow-lg"
                  )}
                  onClick={() => handleBedClick(bed)}
                  onMouseEnter={() => setHoveredBed(bed.bedId)}
                  onMouseLeave={() => setHoveredBed(null)}
                  title={`Bed ${bed.bedIdentifier} - ${bed.status} - NPR ${bed.monthlyRate.toLocaleString()}/month`}
                >
                  {/* Bed icon */}
                  <div className="mb-1">
                    {getBedStatusIcon(bed.status)}
                  </div>
                  
                  {/* Bed identifier */}
                  <div className="text-xs font-bold text-center">
                    {bed.bedIdentifier}
                  </div>
                  
                  {/* Rate */}
                  <div className="text-xs text-center mt-1">
                    NPR {bed.monthlyRate.toLocaleString()}
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedBed?.bedId === bed.bedId && (
                    <div className="absolute -top-2 -right-2 bg-[#1295D0] text-white rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                  
                  {/* Status badge */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1 py-0"
                      style={{
                        backgroundColor: isAvailable(bed.status) ? '#10b981' : 
                                        isOccupied(bed.status) ? '#ef4444' :
                                        isReserved(bed.status) ? '#f59e0b' : '#6b7280',
                        color: 'white'
                      }}
                    >
                      {bed.status.charAt(0)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected bed details */}
      {selectedBed && (
        <Card className="border-[#1295D0] bg-gradient-to-r from-[#1295D0]/5 to-[#07A64F]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1295D0]">
              <CheckCircle className="h-5 w-5" />
              Selected Bed Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Bed Identifier</p>
                <p className="font-semibold text-lg">{selectedBed.bedIdentifier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Rate</p>
                <p className="font-semibold text-lg">NPR {selectedBed.monthlyRate.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className="bg-green-100 text-green-800">{selectedBed.status}</Badge>
              </div>
            </div>
            
            {selectedBed.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-800">{selectedBed.description}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                onClick={handleConfirmSelection}
                className="bg-gradient-to-r from-[#1295D0] to-[#07A64F] hover:from-[#1295D0]/90 hover:to-[#07A64F]/90"
              >
                Confirm Bed Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No available beds message */}
      {availableBeds.length === 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <Info className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-800 mb-1">No Available Beds</h3>
            <p className="text-red-600 text-sm">All beds in this room are currently occupied or reserved.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
