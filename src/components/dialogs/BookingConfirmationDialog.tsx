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
import { BookingRequest, MultiGuestBooking } from '@/types/api';

interface BookingConfirmationDialogProps {
  booking: BookingRequest | MultiGuestBooking | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

// Type guard to check if booking is MultiGuestBooking
const isMultiGuestBooking = (booking: BookingRequest | MultiGuestBooking): booking is MultiGuestBooking => {
  return 'totalGuests' in booking && 'contactName' in booking;
};

export const BookingConfirmationDialog: React.FC<BookingConfirmationDialogProps> = ({
  booking,
  open,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!booking) return null;

  // Extract data based on booking type
  const isMultiGuest = isMultiGuestBooking(booking);
  const studentName = isMultiGuest ? booking.contactName : booking.name;
  const email = isMultiGuest ? booking.contactEmail : booking.email;
  const phone = isMultiGuest ? booking.contactPhone : booking.phone;
  
  // Fix preferred room display - check multiple possible fields
  let preferredRoom = 'Any available room';
  if (booking.preferredRoom && booking.preferredRoom.trim() !== '') {
    preferredRoom = booking.preferredRoom;
  } else if (isMultiGuest && (booking as any).assignedRoom) {
    preferredRoom = (booking as any).assignedRoom;
  } else if (!isMultiGuest && (booking as any).roomPreference) {
    preferredRoom = (booking as any).roomPreference;
  }

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
                <Label className="text-sm font-medium text-gray-600">
                  {isMultiGuest ? 'Contact Name' : 'Student Name'}
                </Label>
                <p className="text-sm font-medium">{studentName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Booking ID</Label>
                <p className="text-sm font-medium text-blue-600">{booking.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-sm">{email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <p className="text-sm">{phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Preferred Room</Label>
                <Badge variant="outline">{preferredRoom}</Badge>
              </div>
              {isMultiGuest && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Guests</Label>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {(booking as MultiGuestBooking).totalGuests} guests
                  </Badge>
                </div>
              )}
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