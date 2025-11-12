import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Home, Bed, User, CheckCircle } from 'lucide-react';
import { FloorSelection } from './FloorSelection';
import { RoomSelection } from './RoomSelection';
import { BedSelection } from './BedSelection';
import { StudentForm } from './StudentForm';
import { useManualStudentCreation } from '@/hooks/useManualStudentCreation';
import { FloorData, RoomData, BedData } from '@/types/manualStudent';

interface StepIndicatorProps {
  currentStep: number;
  selectedFloor?: FloorData;
  selectedRoom?: RoomData;
  selectedBed?: BedData;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  selectedFloor, 
  selectedRoom, 
  selectedBed 
}) => {
  const steps = [
    { 
      number: 1, 
      title: 'Floor', 
      icon: Building, 
      description: selectedFloor ? `Floor ${selectedFloor.floorNumber}` : 'Select Floor'
    },
    { 
      number: 2, 
      title: 'Room', 
      icon: Home, 
      description: selectedRoom ? `Room ${selectedRoom.roomNumber}` : 'Select Room'
    },
    { 
      number: 3, 
      title: 'Bed', 
      icon: Bed, 
      description: selectedBed ? `Bed ${selectedBed.bedIdentifier}` : 'Select Bed'
    },
    { 
      number: 4, 
      title: 'Student', 
      icon: User, 
      description: 'Student Details'
    },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const isAccessible = currentStep >= step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-gradient-to-r from-[#1295D0] to-[#07A64F] text-white'
                        : isAccessible
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-semibold ${
                      isActive ? 'text-[#1295D0]' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 max-w-20 truncate">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const ManualStudentCreation: React.FC = () => {
  const {
    currentStep,
    selectedFloor,
    selectedRoom,
    selectedBed,
    floors,
    rooms,
    beds,
    loading,
    error,
    selectFloor,
    selectRoom,
    selectBed,
    createStudent,
    goBack,
    loadFloors,
  } = useManualStudentCreation();

  // Load floors on component mount
  useEffect(() => {
    loadFloors();
  }, [loadFloors]);

  // Debug logging
  console.log('🏢 ManualStudentCreation state:');
  console.log('🏢 floors from hook:', floors);
  console.log('🏢 floors length:', floors?.length);
  console.log('🏢 loading:', loading);
  console.log('🏢 error:', error);
  console.log('🏢 currentStep:', currentStep);

  return (
    <div className="w-full">
      {/* Step indicator */}
      <StepIndicator 
        currentStep={currentStep}
        selectedFloor={selectedFloor || undefined}
        selectedRoom={selectedRoom || undefined}
        selectedBed={selectedBed || undefined}
      />

      {/* Step content */}
      <div className="mt-4">
        {currentStep === 1 && (
          <FloorSelection
            floors={floors}
            loading={loading}
            onSelectFloor={selectFloor}
          />
        )}

        {currentStep === 2 && selectedFloor && (
          <RoomSelection
            selectedFloor={selectedFloor}
            rooms={rooms}
            loading={loading}
            onSelectRoom={selectRoom}
            onBack={goBack}
          />
        )}

        {currentStep === 3 && selectedRoom && (
          <BedSelection
            selectedRoom={selectedRoom}
            beds={beds}
            loading={loading}
            onSelectBed={selectBed}
            onBack={goBack}
          />
        )}

        {currentStep === 4 && selectedBed && (
          <StudentForm
            selectedBed={selectedBed}
            loading={loading}
            error={error}
            onSubmit={createStudent}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
};
