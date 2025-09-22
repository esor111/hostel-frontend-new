import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Users, User, Calendar, Phone, Mail, MapPin, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { useUnifiedBookings } from '../hooks/useUnifiedBookings';
import { BookingRequest } from '../types/api';

interface UnifiedBookingManagementProps {
  className?: string;
}

export const UnifiedBookingManagement: React.FC<UnifiedBookingManagementProps> = ({ className }) => {
  const {
    bookings,
    multiGuestBookings,
    stats,
    pendingBookings,
    loading,
    statsLoading,
    error,
    fetchBookings,
    fetchMultiGuestBookings,
    approveBooking,
    rejectBooking,
    confirmMultiGuestBooking,
    cancelMultiGuestBooking,
    refresh,
    getBookingTypeLabel,
    isMultiGuestBooking
  } = useUnifiedBookings();

  // Local state
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
      booking.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Filter multi-guest bookings
  const filteredMultiGuestBookings = multiGuestBookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.contactPerson?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactPerson?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactPerson?.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
      booking.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Handle booking actions
  const handleApproveBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    setActionError(null);
    
    try {
      await approveBooking(bookingId);
      setSelectedBooking(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to approve booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: string, reason: string) => {
    setActionLoading(bookingId);
    setActionError(null);
    
    try {
      await rejectBooking(bookingId, reason);
      setSelectedBooking(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to reject booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmMultiGuestBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    setActionError(null);
    
    try {
      await confirmMultiGuestBooking(bookingId, 'admin');
      setSelectedBooking(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to confirm booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelMultiGuestBooking = async (bookingId: string, reason: string) => {
    setActionLoading(bookingId);
    setActionError(null);
    
    try {
      await cancelMultiGuestBooking(bookingId, reason, 'admin');
      setSelectedBooking(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'approved':
      case 'confirmed':
        return 'default';
      case 'rejected':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Render booking card
  const renderBookingCard = (booking: any, isMultiGuest: boolean = false) => (
    <Card key={booking.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isMultiGuest ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
              <h3 className="font-semibold">
                {isMultiGuest ? booking.contactPerson?.name : booking.name}
              </h3>
              <Badge variant={getStatusBadgeVariant(booking.status)}>
                {getStatusIcon(booking.status)}
                <span className="ml-1">{booking.status}</span>
              </Badge>
              <Badge variant="outline">
                {getBookingTypeLabel(booking)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {isMultiGuest ? booking.contactPerson?.phone : booking.phone}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {isMultiGuest ? booking.contactPerson?.email : booking.email}
              </div>
              {booking.checkInDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(booking.checkInDate).toLocaleDateString()}
                </div>
              )}
              {(booking.preferredRoom || booking.assignedRoom) && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {booking.assignedRoom || booking.preferredRoom}
                </div>
              )}
            </div>

            {isMultiGuest && booking.guests && (
              <div className="mt-2">
                <p className="text-sm font-medium">Guests ({booking.totalGuests}):</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {booking.guests.slice(0, 3).map((guest: any, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {guest.name} ({guest.bedId})
                    </Badge>
                  ))}
                  {booking.guests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{booking.guests.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedBooking(booking)}
            >
              View Details
            </Button>
            
            {booking.status.toLowerCase() === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => isMultiGuest ? 
                    handleConfirmMultiGuestBooking(booking.id) : 
                    handleApproveBooking(booking.id)
                  }
                  disabled={actionLoading === booking.id}
                >
                  {actionLoading === booking.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span className="ml-1">
                    {isMultiGuest ? 'Confirm' : 'Approve'}
                  </span>
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => isMultiGuest ? 
                    handleCancelMultiGuestBooking(booking.id, 'Cancelled by admin') : 
                    handleRejectBooking(booking.id, 'Rejected by admin')
                  }
                  disabled={actionLoading === booking.id}
                >
                  {actionLoading === booking.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span className="ml-1">
                    {isMultiGuest ? 'Cancel' : 'Reject'}
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Unified Booking Management</h1>
          <p className="text-gray-600">Manage both single and multi-guest bookings</p>
        </div>
        <Button onClick={refresh} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">{stats.approvedBookings}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approval Rate</p>
                  <p className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {(error || actionError) && (
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>
            {error || actionError}
          </AlertDescription>
        </Alert>
      )}

      {/* Booking Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Bookings ({filteredBookings.length})</TabsTrigger>
          <TabsTrigger value="single">Single Guest</TabsTrigger>
          <TabsTrigger value="multi">Multi-Guest ({filteredMultiGuestBookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading bookings...</span>
              </div>
            ) : filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No bookings found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map(booking => renderBookingCard(booking, false))
            )}
          </div>
        </TabsContent>

        <TabsContent value="single">
          <div className="space-y-4">
            {filteredBookings
              .filter(booking => !isMultiGuestBooking(booking))
              .map(booking => renderBookingCard(booking, false))
            }
          </div>
        </TabsContent>

        <TabsContent value="multi">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading multi-guest bookings...</span>
              </div>
            ) : filteredMultiGuestBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No multi-guest bookings found.</p>
                </CardContent>
              </Card>
            ) : (
              filteredMultiGuestBookings.map(booking => renderBookingCard(booking, true))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No pending bookings.</p>
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map(booking => renderBookingCard(booking, isMultiGuestBooking(booking)))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Booking Details - {getBookingTypeLabel(selectedBooking)}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Contact Information */}
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedBooking.contactPerson?.name || selectedBooking.name}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedBooking.contactPerson?.phone || selectedBooking.phone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedBooking.contactPerson?.email || selectedBooking.email}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <Badge variant={getStatusBadgeVariant(selectedBooking.status)} className="ml-2">
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedBooking.checkInDate && (
                    <div>
                      <span className="font-medium">Check-in Date:</span> {new Date(selectedBooking.checkInDate).toLocaleDateString()}
                    </div>
                  )}
                  {selectedBooking.duration && (
                    <div>
                      <span className="font-medium">Duration:</span> {selectedBooking.duration}
                    </div>
                  )}
                  {(selectedBooking.preferredRoom || selectedBooking.assignedRoom) && (
                    <div>
                      <span className="font-medium">Room:</span> {selectedBooking.assignedRoom || selectedBooking.preferredRoom}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span> {new Date(selectedBooking.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Guests (for multi-guest bookings) */}
              {selectedBooking.guests && (
                <div>
                  <h3 className="font-semibold mb-2">Guests ({selectedBooking.totalGuests})</h3>
                  <div className="space-y-2">
                    {selectedBooking.guests.map((guest: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{guest.name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            Age: {guest.age}, Gender: {guest.gender}
                          </span>
                        </div>
                        <Badge variant="outline">{guest.bedId}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};