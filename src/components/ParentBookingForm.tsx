import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Loader2, Plus, Trash2, Users, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useUnifiedBookings } from '../hooks/useUnifiedBookings';
import { roomsApiService } from '../services/roomsApiService';

interface Guest {
  id: string;
  bedId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  idProofType?: string;
  idProofNumber?: string;
  emergencyContact?: string;
  notes?: string;
}

interface ContactPerson {
  name: string;
  phone: string;
  email: string;
}

interface ParentBookingFormProps {
  onSuccess?: (booking: any) => void;
  onCancel?: () => void;
  className?: string;
}

export const ParentBookingForm: React.FC<ParentBookingFormProps> = ({
  onSuccess,
  onCancel,
  className
}) => {
  const { createMultiGuestBooking } = useUnifiedBookings();

  // Form state
  const [contactPerson, setContactPerson] = useState<ContactPerson>({
    name: '',
    phone: '',
    email: ''
  });

  const [guests, setGuests] = useState<Guest[]>([
    {
      id: '1',
      bedId: '',
      name: '',
      age: 18,
      gender: 'Male',
      idProofType: '',
      idProofNumber: '',
      emergencyContact: '',
      notes: ''
    }
  ]);

  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: '',
    duration: '',
    notes: '',
    emergencyContact: '',
    source: 'website'
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loadingBeds, setLoadingBeds] = useState(false);

  // Available beds (fetch from API)
  const [availableBeds, setAvailableBeds] = useState<Array<{ id: string; label: string; roomName: string; rate: number }>>([]);

  // Fetch available beds on component mount
  useEffect(() => {
    const fetchAvailableBeds = async () => {
      setLoadingBeds(true);
      try {

        const rooms = await roomsApiService.getRooms();
        
        const beds: Array<{ id: string; label: string; roomName: string; rate: number }> = [];
        
        rooms.forEach(room => {
          if (room.beds && room.beds.length > 0) {
            // Get available beds from each room
            const availableRoomBeds = room.beds.filter(bed => 
              bed.status === 'Available' || bed.status === 'AVAILABLE'
            );
            
            availableRoomBeds.forEach(bed => {
              beds.push({
                id: bed.bedIdentifier || bed.id,
                label: `${bed.bedIdentifier || bed.bedNumber} (${room.name})`,
                roomName: room.name,
                rate: bed.monthlyRate || room.monthlyRate || 0
              });
            });
          }
        });
        

        setAvailableBeds(beds);
      } catch (error) {
        console.error('❌ Error fetching available beds:', error);
        setError('Failed to load available beds. Please try again.');
        // Fallback to empty array if API fails
        setAvailableBeds([]);
      } finally {
        setLoadingBeds(false);
      }
    };

    fetchAvailableBeds();
  }, []);

  // Add new guest
  const addGuest = () => {
    const newGuest: Guest = {
      id: Date.now().toString(),
      bedId: '',
      name: '',
      age: 18,
      gender: 'Male',
      idProofType: '',
      idProofNumber: '',
      emergencyContact: '',
      notes: ''
    };
    setGuests([...guests, newGuest]);
  };

  // Remove guest
  const removeGuest = (guestId: string) => {
    if (guests.length > 1) {
      setGuests(guests.filter(guest => guest.id !== guestId));
    }
  };

  // Update guest
  const updateGuest = (guestId: string, field: keyof Guest, value: any) => {
    setGuests(guests.map(guest => 
      guest.id === guestId ? { ...guest, [field]: value } : guest
    ));
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate contact person
    if (!contactPerson.name.trim()) {
      errors.contactName = 'Contact person name is required';
    }
    if (!contactPerson.phone.trim()) {
      errors.contactPhone = 'Contact person phone is required';
    }
    if (!contactPerson.email.trim()) {
      errors.contactEmail = 'Contact person email is required';
    } else if (!/\S+@\S+\.\S+/.test(contactPerson.email)) {
      errors.contactEmail = 'Please enter a valid email address';
    }

    // Validate guests
    guests.forEach((guest, index) => {
      if (!guest.name.trim()) {
        errors[`guest${index}Name`] = `Guest ${index + 1} name is required`;
      }
      if (!guest.bedId) {
        errors[`guest${index}BedId`] = `Guest ${index + 1} bed assignment is required`;
      }
      if (guest.age < 1 || guest.age > 120) {
        errors[`guest${index}Age`] = `Guest ${index + 1} age must be between 1 and 120`;
      }
    });

    // Check for duplicate bed assignments
    const bedIds = guests.map(guest => guest.bedId).filter(Boolean);
    const duplicateBeds = bedIds.filter((bedId, index) => bedIds.indexOf(bedId) !== index);
    if (duplicateBeds.length > 0) {
      // Get bed labels for better error message
      const duplicateLabels = duplicateBeds.map(bedId => {
        const bed = availableBeds.find(b => b.id === bedId);
        return bed ? bed.label : bedId;
      });
      errors.duplicateBeds = `Duplicate bed assignments: ${duplicateLabels.join(', ')}`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        data: {
          contactPerson: {
            name: contactPerson.name.trim(),
            phone: contactPerson.phone.trim(),
            email: contactPerson.email.trim()
          },
          guests: guests.map(guest => ({
            bedId: guest.bedId,
            name: guest.name.trim(),
            age: guest.age,
            gender: guest.gender,
            idProofType: guest.idProofType?.trim() || undefined,
            idProofNumber: guest.idProofNumber?.trim() || undefined,
            emergencyContact: guest.emergencyContact?.trim() || undefined,
            notes: guest.notes?.trim() || undefined
          })),
          checkInDate: bookingDetails.checkInDate || undefined,
          duration: bookingDetails.duration.trim() || undefined,
          notes: bookingDetails.notes.trim() || undefined,
          emergencyContact: bookingDetails.emergencyContact.trim() || undefined,
          source: bookingDetails.source
        }
      };


      
      const result = await createMultiGuestBooking(bookingData);
      

      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      console.error('❌ Error creating parent booking:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Parent Booking for Children
          </CardTitle>
          <p className="text-sm text-gray-600">
            Book multiple beds for your children in a single reservation
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Person Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Person (Parent/Guardian)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Full Name *</Label>
                  <Input
                    id="contactName"
                    value={contactPerson.name}
                    onChange={(e) => setContactPerson({...contactPerson, name: e.target.value})}
                    placeholder="Enter your full name"
                    className={validationErrors.contactName ? 'border-red-500' : ''}
                  />
                  {validationErrors.contactName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.contactName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <Input
                    id="contactPhone"
                    value={contactPerson.phone}
                    onChange={(e) => setContactPerson({...contactPerson, phone: e.target.value})}
                    placeholder="Enter your phone number"
                    className={validationErrors.contactPhone ? 'border-red-500' : ''}
                  />
                  {validationErrors.contactPhone && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.contactPhone}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="contactEmail">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactPerson.email}
                    onChange={(e) => setContactPerson({...contactPerson, email: e.target.value})}
                    placeholder="Enter your email address"
                    className={validationErrors.contactEmail ? 'border-red-500' : ''}
                  />
                  {validationErrors.contactEmail && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.contactEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Children/Guests Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Children ({guests.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGuest}
                  disabled={guests.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Child
                </Button>
              </div>

              {validationErrors.duplicateBeds && (
                <Alert className="mb-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationErrors.duplicateBeds}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {guests.map((guest, index) => (
                  <Card key={guest.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Child {index + 1}</h4>
                      {guests.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuest(guest.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          value={guest.name}
                          onChange={(e) => updateGuest(guest.id, 'name', e.target.value)}
                          placeholder="Child's full name"
                          className={validationErrors[`guest${index}Name`] ? 'border-red-500' : ''}
                        />
                        {validationErrors[`guest${index}Name`] && (
                          <p className="text-sm text-red-500 mt-1">{validationErrors[`guest${index}Name`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>Age *</Label>
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          value={guest.age}
                          onChange={(e) => updateGuest(guest.id, 'age', parseInt(e.target.value) || 18)}
                          className={validationErrors[`guest${index}Age`] ? 'border-red-500' : ''}
                        />
                        {validationErrors[`guest${index}Age`] && (
                          <p className="text-sm text-red-500 mt-1">{validationErrors[`guest${index}Age`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>Gender *</Label>
                        <Select
                          value={guest.gender}
                          onValueChange={(value) => updateGuest(guest.id, 'gender', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Bed Assignment *</Label>
                        {loadingBeds ? (
                          <div className="flex items-center gap-2 p-2 border rounded">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-gray-600">Loading available beds...</span>
                          </div>
                        ) : (
                          <Select
                            value={guest.bedId}
                            onValueChange={(value) => updateGuest(guest.id, 'bedId', value)}
                          >
                            <SelectTrigger className={validationErrors[`guest${index}BedId`] ? 'border-red-500' : ''}>
                              <SelectValue placeholder={availableBeds.length > 0 ? "Select bed" : "No beds available"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableBeds.length === 0 ? (
                                <SelectItem value="no-beds" disabled>
                                  No available beds found
                                </SelectItem>
                              ) : (
                                availableBeds.map(bed => {
                                  const isAssigned = guests.some(g => g.bedId === bed.id && g.id !== guest.id);
                                  return (
                                    <SelectItem 
                                      key={bed.id} 
                                      value={bed.id}
                                      disabled={isAssigned}
                                    >
                                      <div className="flex flex-col">
                                        <span>{bed.label}</span>
                                        {bed.rate > 0 && (
                                          <span className="text-xs text-gray-500">
                                            NPR {bed.rate.toLocaleString()}/month
                                          </span>
                                        )}
                                        {isAssigned && (
                                          <span className="text-xs text-red-500">(Already assigned)</span>
                                        )}
                                      </div>
                                    </SelectItem>
                                  );
                                })
                              )}
                            </SelectContent>
                          </Select>
                        )}
                        {validationErrors[`guest${index}BedId`] && (
                          <p className="text-sm text-red-500 mt-1">{validationErrors[`guest${index}BedId`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>ID Proof Type</Label>
                        <Input
                          value={guest.idProofType || ''}
                          onChange={(e) => updateGuest(guest.id, 'idProofType', e.target.value)}
                          placeholder="e.g., Passport, ID Card"
                        />
                      </div>
                      
                      <div>
                        <Label>ID Proof Number</Label>
                        <Input
                          value={guest.idProofNumber || ''}
                          onChange={(e) => updateGuest(guest.id, 'idProofNumber', e.target.value)}
                          placeholder="ID number"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Booking Details Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInDate">Check-in Date</Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={bookingDetails.checkInDate}
                    onChange={(e) => setBookingDetails({...bookingDetails, checkInDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={bookingDetails.duration}
                    onChange={(e) => setBookingDetails({...bookingDetails, duration: e.target.value})}
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={bookingDetails.emergencyContact}
                    onChange={(e) => setBookingDetails({...bookingDetails, emergencyContact: e.target.value})}
                    placeholder="Emergency contact number"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails({...bookingDetails, notes: e.target.value})}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Booking {guests.length} {guests.length === 1 ? 'child' : 'children'} for {contactPerson.name || 'parent'}
              </div>
              
              <div className="flex gap-3">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};