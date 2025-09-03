import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { BookingRequest } from '@/types/api';

interface BookingConfirmationDialogProps {
  booking: BookingRequest | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const BookingConfirmationDialog: React.FC<BookingConfirmationDialogProps> = ({
  booking,
  open,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirm Booking Approval
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Confirm Booking Approval</p>
                <p>This will approve the booking request and create a student profile. The student will be assigned to an available room/bed.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Student Name</Label>
                <p className="text-sm font-medium">{booking.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Booking ID</Label>
                <p className="text-sm font-medium text-blue-600">{booking.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-sm">{booking.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <p className="text-sm">{booking.phone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Preferred Room</Label>
                <Badge variant="outline">{booking.preferredRoom}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Check-in Date</Label>
                <p className="text-sm">{new Date(booking.checkInDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};