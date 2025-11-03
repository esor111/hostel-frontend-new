import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Bed, AlertTriangle, ArrowRight, DollarSign, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Student {
  id: string;
  name: string;
  roomNumber: string;
  bedNumber: string;
  currentRate: number;
}

interface BedOption {
  id: string;
  bedIdentifier: string;
  bedNumber: string;
  roomNumber: string;
  roomId: string;
  monthlyRate: number;
  status: string;
}

interface BedSwitchDialogProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BedSwitchDialog = ({
  student,
  isOpen,
  onClose,
  onSuccess
}: BedSwitchDialogProps) => {
  const [availableBeds, setAvailableBeds] = useState<BedOption[]>([]);
  const [selectedBedId, setSelectedBedId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBeds, setIsFetchingBeds] = useState(false);

  // Selected bed details
  const selectedBed = availableBeds.find(b => b.id === selectedBedId);
  const rateChanged = selectedBed && 
    Math.abs(selectedBed.monthlyRate - student.currentRate) > 0.01;
  const rateDifference = selectedBed ? 
    selectedBed.monthlyRate - student.currentRate : 0;

  // Fetch available beds when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableBeds();
    }
  }, [isOpen]);

  const fetchAvailableBeds = async () => {
    setIsFetchingBeds(true);
    try {
      const response = await apiClient.get('/beds', {
        params: { status: 'Available' }
      });

      if (response.data?.data?.beds) {
        setAvailableBeds(response.data.data.beds);
      } else if (Array.isArray(response.data?.data)) {
        setAvailableBeds(response.data.data);
      } else {
        setAvailableBeds([]);
        toast.error('No available beds found');
      }
    } catch (error: any) {
      console.error('Failed to load available beds:', error);
      toast.error('Failed to load available beds');
      setAvailableBeds([]);
    } finally {
      setIsFetchingBeds(false);
    }
  };

  const handleSwitchBed = async () => {
    if (!selectedBedId) {
      toast.error('Please select a bed');
      return;
    }

    if (!effectiveDate) {
      toast.error('Please select an effective date');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post(`/students/${student.id}/switch-bed`, {
        newBedId: selectedBedId,
        effectiveDate,
        reason: reason || 'Bed switch request',
        approvedBy: 'admin' // TODO: Get from auth context
      });

      if (response.data?.status === 200 || response.status === 200) {
        const bedName = selectedBed?.bedIdentifier || `${selectedBed?.roomNumber} - Bed ${selectedBed?.bedNumber}`;
        toast.success(`Successfully switched ${student.name} to ${bedName}`);
        onSuccess();
        onClose();
        
        // Reset form
        setSelectedBedId('');
        setReason('');
        setEffectiveDate(new Date().toISOString().split('T')[0]);
      } else {
        toast.error(response.data?.message || 'Failed to switch bed');
      }
    } catch (error: any) {
      console.error('Bed switch error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'An error occurred while switching bed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedBedId('');
      setReason('');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bed className="h-6 w-6 text-blue-600" />
            Switch Bed for {student.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Bed Info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Current Bed Assignment
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-medium text-gray-800">
                  {student.roomNumber} • Bed {student.bedNumber}
                </p>
                <p className="text-lg font-bold text-blue-700 mt-2 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  NPR {student.currentRate.toLocaleString()}/month
                </p>
              </div>
              {selectedBed && (
                <>
                  <ArrowRight className="h-8 w-8 text-gray-400 flex-shrink-0" />
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">New Location</p>
                    <p className="font-medium text-gray-800">
                      {selectedBed.roomNumber} • Bed {selectedBed.bedNumber}
                    </p>
                    <p className={`text-lg font-bold mt-2 flex items-center gap-1 justify-end ${
                      rateDifference > 0 ? 'text-orange-600' : 
                      rateDifference < 0 ? 'text-green-600' : 'text-blue-700'
                    }`}>
                      <DollarSign className="h-4 w-4" />
                      NPR {selectedBed.monthlyRate.toLocaleString()}/month
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Available Beds Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select New Bed *</Label>
            
            {isFetchingBeds ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading available beds...</span>
              </div>
            ) : availableBeds.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <Bed className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium mb-2">No Available Beds</p>
                <p className="text-sm text-gray-500">All beds are currently occupied</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAvailableBeds}
                  className="mt-4"
                >
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {availableBeds.map((bed) => {
                  const rateChange = bed.monthlyRate - student.currentRate;
                  const isSelected = selectedBedId === bed.id;

                  return (
                    <button
                      key={bed.id}
                      onClick={() => setSelectedBedId(bed.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {bed.bedIdentifier || `Bed ${bed.bedNumber}`}
                          </p>
                          <p className="text-sm text-gray-600">{bed.roomNumber}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-800">
                          NPR {bed.monthlyRate.toLocaleString()}/mo
                        </p>
                        {Math.abs(rateChange) > 0.01 && (
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            rateChange > 0
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {rateChange > 0 ? '+' : ''}
                            {rateChange.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rate Change Alert */}
          {rateChanged && (
            <Alert className={`border-2 ${rateDifference > 0 ? 'border-orange-400 bg-orange-50' : 'border-green-400 bg-green-50'}`}>
              <AlertTriangle className={`h-5 w-5 ${rateDifference > 0 ? 'text-orange-600' : 'text-green-600'}`} />
              <AlertDescription className="ml-2">
                <strong className={rateDifference > 0 ? 'text-orange-800' : 'text-green-800'}>
                  Rate Change Alert:
                </strong>{' '}
                The new bed has a <strong>{rateDifference > 0 ? 'higher' : 'lower'}</strong> monthly rate.
                {rateDifference > 0 ? (
                  <span className="text-orange-700 block mt-1">
                    💰 Student will be charged an additional <strong>NPR {Math.abs(rateDifference).toLocaleString()}/month</strong> starting from the effective date.
                  </span>
                ) : (
                  <span className="text-green-700 block mt-1">
                    ✅ Student will save <strong>NPR {Math.abs(rateDifference).toLocaleString()}/month</strong> starting from the effective date.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Effective Date */}
          <div className="space-y-2">
            <Label htmlFor="effectiveDate" className="text-base font-semibold">
              Effective Date *
            </Label>
            <Input
              id="effectiveDate"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              The date from which the bed switch will take effect
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-base font-semibold">
              Reason for Switch
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Student request due to noise issues, proximity to facilities, roommate preference, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Optional - Provide context for this bed switch
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSwitchBed}
            disabled={!selectedBedId || isLoading || availableBeds.length === 0}
            className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                <Bed className="mr-2 h-4 w-4" />
                Confirm Switch
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
