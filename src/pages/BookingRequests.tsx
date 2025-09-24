import React, { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Users, Calendar, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookings, BookingFilters } from '@/hooks/useBookings';
import { BookingStatus, BookingRequest, MultiGuestBooking } from '@/types/api';
import { toast } from "sonner";
import { BookingConfirmationDialog } from '@/components/dialogs/BookingConfirmationDialog';
import { useNavigate } from 'react-router-dom';
import { roomsApiService } from '@/services/roomsApiService';

const BookingRequests = () => {
  const {
    bookings,
    multiGuestBookings,
    pendingBookings,
    bookingStats,
    loading,
    error,
    actionLoading,
    approveBooking,
    rejectBooking,
    confirmMultiGuestBooking,
    isMultiGuestBooking,
    getBookingTypeLabel,
    refreshData
  } = useBookings();
  
  const navigate = useNavigate();
  
  const [filteredBookings, setFilteredBookings] = useState<(BookingRequest | MultiGuestBooking)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // New filter for booking type
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | MultiGuestBooking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bookingToApprove, setBookingToApprove] = useState<BookingRequest | MultiGuestBooking | null>(null);
  const [rooms, setRooms] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(6); // 6 bookings per page

  // Load rooms data
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await roomsApiService.getRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error('Error loading rooms:', error);
      }
    };
    loadRooms();
  }, []);

  // Filter bookings based on search, status, and type
  useEffect(() => {
    // Debug logging
    console.log('BookingRequests: bookings data:', bookings, 'Type:', typeof bookings, 'IsArray:', Array.isArray(bookings));
    
    // Ensure bookings is an array before filtering
    if (!Array.isArray(bookings)) {
      console.warn('BookingRequests: bookings is not an array, setting empty array');
      setFilteredBookings([]);
      return;
    }
    
    let filtered = bookings;
    
    if (searchTerm) {
      filtered = filtered.filter(booking => {
        const contactName = isMultiGuestBooking(booking) 
          ? (booking as unknown as MultiGuestBooking).contactName 
          : (booking as BookingRequest).name;
        const contactEmail = isMultiGuestBooking(booking) 
          ? (booking as unknown as MultiGuestBooking).contactEmail 
          : (booking as BookingRequest).email;
        const contactPhone = isMultiGuestBooking(booking) 
          ? (booking as unknown as MultiGuestBooking).contactPhone 
          : (booking as BookingRequest).phone;
          
        return contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               contactPhone?.includes(searchTerm);
      });
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      if (typeFilter === 'single') {
        filtered = filtered.filter(booking => !isMultiGuestBooking(booking));
      } else if (typeFilter === 'multi') {
        filtered = filtered.filter(booking => isMultiGuestBooking(booking));
      }
    }
    
    setFilteredBookings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [bookings, searchTerm, statusFilter, typeFilter, isMultiGuestBooking]);

  // Calculate pagination
  const safeFilteredBookings = Array.isArray(filteredBookings) ? filteredBookings : [];
  const totalPages = Math.ceil(safeFilteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const endIndex = startIndex + bookingsPerPage;
  const currentBookings = safeFilteredBookings.slice(startIndex, endIndex);

  const handleApproveClick = (booking: BookingRequest | MultiGuestBooking) => {
    setBookingToApprove(booking);
    setShowConfirmDialog(true);
  };

  const handleConfirmApprove = async () => {
    if (!bookingToApprove) return;
    
    try {
      let result;
      
      // Check if it's a multi-guest booking and use appropriate method
      if (isMultiGuestBooking(bookingToApprove)) {
        result = await confirmMultiGuestBooking(bookingToApprove.id, 'admin');
        toast.success('Multi-guest booking confirmed successfully! Student profiles created and beds assigned.', {
          duration: 4000,
        });
      } else {
        result = await approveBooking(bookingToApprove.id);
        toast.success('Booking approved successfully! Student profile created and room assigned.', {
          duration: 4000,
        });
      }
      
      console.log('Booking approved/confirmed:', result);
      
      // Close confirmation dialog
      setShowConfirmDialog(false);
      setBookingToApprove(null);
      
      // Navigate to configuration page (ledger with student management section)
      navigate('/ledger?section=student-management');
    } catch (error) {
      console.error('Error approving/confirming booking:', error);
      toast.error('Failed to approve booking request');
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) return;
    
    try {
      await rejectBooking(selectedBooking.id, rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedBooking(null);
      toast.success('Booking rejected successfully');
      console.log('Booking rejected successfully');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking request');
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.APPROVED:
        return 'bg-green-100 text-green-700';
      case BookingStatus.REJECTED:
        return 'bg-red-100 text-red-700';
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <MainLayout activeTab="bookings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="relative">
              <svg width="48" height="72" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse mx-auto">
                <g clipPath="url(#clip0_319_901)">
                  <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F"/>
                  <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F"/>
                  <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20"/>
                  <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#2563eb"/>
                  <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white"/>
                  <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20"/>
                </g>
                <defs>
                  <clipPath id="clip0_319_901">
                    <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)"/>
                  </clipPath>
                </defs>
              </svg>
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-r-[#07A64F]"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading booking requests...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout activeTab="bookings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="text-red-500 mb-2">
              <XCircle className="h-12 w-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Booking Requests</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700">
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeTab="bookings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">📝 Booking Requests</h2>
            <p className="text-gray-600 mt-1">Manage student admission requests and approvals</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-blue-600">
              {safeFilteredBookings.length} Total Requests
            </Badge>
            {totalPages > 1 && (
              <Badge variant="outline" className="text-green-600">
                Page {currentPage} of {totalPages}
              </Badge>
            )}
            <Button 
              onClick={refreshData}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              🔄 Refresh Data
            </Button>
          </div>
        </div>

        {/* Booking Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-700">{bookingStats.pendingBookings}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approved</p>
                  <p className="text-3xl font-bold text-green-700">{bookingStats.approvedBookings}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-700">{bookingStats.rejectedBookings}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Booking Requests</p>
                  <p className="text-3xl font-bold text-blue-700">{bookingStats.totalBookings}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Filter Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by name, email, phone, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={BookingStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={BookingStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={BookingStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={BookingStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single Guest</SelectItem>
                  <SelectItem value="multi">Multi-Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Booking Requests ({safeFilteredBookings.length})
              {totalPages > 1 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  - Showing {startIndex + 1} to {Math.min(endIndex, safeFilteredBookings.length)} of {safeFilteredBookings.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Contact Details</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type & Guests</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Check-in Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Room/Bed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        {searchTerm || statusFilter !== 'all' ? 'No bookings match your filters' : 'No booking requests found'}
                      </td>
                    </tr>
                  ) : (
                    currentBookings.map((booking) => {
                      // Determine if it's a multi-guest booking
                      const isMultiGuest = isMultiGuestBooking(booking);
                      
                      // Extract contact information based on booking type
                      const contactName = isMultiGuest 
                        ? (booking as MultiGuestBooking).contactName 
                        : (booking as BookingRequest).name;
                      const contactEmail = isMultiGuest 
                        ? (booking as MultiGuestBooking).contactEmail 
                        : (booking as BookingRequest).email;
                      const contactPhone = isMultiGuest 
                        ? (booking as MultiGuestBooking).contactPhone 
                        : (booking as BookingRequest).phone;
                      const address = isMultiGuest 
                        ? (booking as MultiGuestBooking).address 
                        : (booking as BookingRequest).address;
                      const checkInDate = isMultiGuest 
                        ? (booking as MultiGuestBooking).checkInDate 
                        : (booking as BookingRequest).checkInDate;
                      const preferredRoom = isMultiGuest 
                        ? (booking as MultiGuestBooking).preferredRoom 
                        : (booking as BookingRequest).preferredRoom;
                      
                      // Find assigned room/bed information
                      const assignedRoom = booking.assignedRoom ? 
                        rooms.find(room => room.id === booking.assignedRoom || room.name === booking.assignedRoom) : null;
                      
                      return (
                        <tr key={booking.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{contactName}</p>
                              <p className="text-sm text-gray-500">{address}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{contactEmail}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{contactPhone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <Badge 
                                variant="outline" 
                                className={isMultiGuest ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}
                              >
                                {getBookingTypeLabel(booking)}
                              </Badge>
                              {isMultiGuest && (
                                <div className="text-xs text-gray-500">
                                  {(booking as MultiGuestBooking).confirmedGuests || 0} / {(booking as MultiGuestBooking).totalGuests} confirmed
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {checkInDate ? new Date(checkInDate).toLocaleDateString() : 'Not specified'}
                          </td>
                          <td className="py-3 px-4">
                            {assignedRoom ? (
                              <div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {assignedRoom.name || assignedRoom.roomNumber}
                                </Badge>
                                {assignedRoom.bedCount && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {assignedRoom.bedCount} beds
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-gray-600">
                                {preferredRoom || 'Not specified'}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedBooking(booking)}
                                className="text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {booking.status === BookingStatus.PENDING && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveClick(booking)}
                                    disabled={actionLoading === `approve-${booking.id}` || actionLoading === `confirm-${booking.id}`}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs disabled:opacity-50"
                                  >
                                    {(actionLoading === `approve-${booking.id}` || actionLoading === `confirm-${booking.id}`) ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    ) : (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {(actionLoading === `approve-${booking.id}` || actionLoading === `confirm-${booking.id}`) 
                                      ? (isMultiGuest ? 'Confirming...' : 'Approving...') 
                                      : (isMultiGuest ? 'Confirm' : 'Approve')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowRejectDialog(true);
                                    }}
                                    disabled={actionLoading === `reject-${booking.id}` || actionLoading === `cancel-${booking.id}`}
                                    className="border-red-600 text-red-600 hover:bg-red-50 text-xs disabled:opacity-50"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    {isMultiGuest ? 'Cancel' : 'Reject'}
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, safeFilteredBookings.length)} of {safeFilteredBookings.length} booking requests
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Booking Dialog */}
        <Dialog open={!!selectedBooking && !showRejectDialog && !showConfirmDialog} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Booking Request Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                {/* Booking Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Booking Type</Label>
                    <Badge 
                      variant="outline" 
                      className={isMultiGuestBooking(selectedBooking) ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}
                    >
                      {getBookingTypeLabel(selectedBooking)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contact Name</Label>
                    <p className="text-sm font-medium">
                      {isMultiGuestBooking(selectedBooking) 
                        ? (selectedBooking as MultiGuestBooking).contactName 
                        : (selectedBooking as BookingRequest).name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-sm">
                      {isMultiGuestBooking(selectedBooking) 
                        ? (selectedBooking as MultiGuestBooking).contactEmail 
                        : (selectedBooking as BookingRequest).email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-sm">
                      {isMultiGuestBooking(selectedBooking) 
                        ? (selectedBooking as MultiGuestBooking).contactPhone 
                        : (selectedBooking as BookingRequest).phone}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Check-in Date</Label>
                    <p className="text-sm">
                      {(() => {
                        const date = isMultiGuestBooking(selectedBooking) 
                          ? (selectedBooking as MultiGuestBooking).checkInDate 
                          : (selectedBooking as BookingRequest).checkInDate;
                        return date ? new Date(date).toLocaleDateString() : 'Not specified';
                      })()}
                    </p>
                  </div>
                </div>
                
                {/* Address */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Address</Label>
                  <p className="text-sm">
                    {isMultiGuestBooking(selectedBooking) 
                      ? (selectedBooking as MultiGuestBooking).address 
                      : (selectedBooking as BookingRequest).address}
                  </p>
                </div>
                
                {/* Preferred Room */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Preferred Room</Label>
                  <Badge variant="outline">
                    {isMultiGuestBooking(selectedBooking) 
                      ? (selectedBooking as MultiGuestBooking).preferredRoom || 'Not specified'
                      : (selectedBooking as BookingRequest).preferredRoom || 'Not specified'}
                  </Badge>
                </div>
                
                {/* Multi-guest specific information */}
                {isMultiGuestBooking(selectedBooking) && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium text-gray-600">Guest Information</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-xs text-gray-500">Total Guests</Label>
                        <p className="text-sm font-medium">{(selectedBooking as MultiGuestBooking).totalGuests}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Confirmed Guests</Label>
                        <p className="text-sm font-medium">{(selectedBooking as MultiGuestBooking).confirmedGuests || 0}</p>
                      </div>
                    </div>
                    {(selectedBooking as MultiGuestBooking).guests && (selectedBooking as MultiGuestBooking).guests.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-xs text-gray-500">Guest List</Label>
                        <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                          {(selectedBooking as MultiGuestBooking).guests.map((guest, index) => (
                            <div key={guest.id || index} className="text-xs bg-gray-50 p-2 rounded">
                              <span className="font-medium">{guest.guestName}</span>
                              <span className="text-gray-500 ml-2">({guest.age} years, {guest.gender})</span>
                              <Badge className="ml-2" variant={guest.status === 'Confirmed' ? 'default' : 'secondary'}>
                                {guest.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Guardian Information (for single guest bookings) */}
                {!isMultiGuestBooking(selectedBooking) && (selectedBooking as BookingRequest).guardianName && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Guardian Name</Label>
                      <p className="text-sm">{(selectedBooking as BookingRequest).guardianName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Guardian Phone</Label>
                      <p className="text-sm">{(selectedBooking as BookingRequest).guardianPhone}</p>
                    </div>
                  </div>
                )}
                
                {/* Course Information (for single guest bookings) */}
                {!isMultiGuestBooking(selectedBooking) && (selectedBooking as BookingRequest).course && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Course</Label>
                      <p className="text-sm">{(selectedBooking as BookingRequest).course}</p>
                    </div>
                    {(selectedBooking as BookingRequest).institution && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Institution</Label>
                        <p className="text-sm">{(selectedBooking as BookingRequest).institution}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Rejection Reason */}
                {selectedBooking.rejectionReason && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Rejection Reason</Label>
                    <p className="text-sm text-red-600">{selectedBooking.rejectionReason}</p>
                  </div>
                )}
                
                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                    <p className="text-sm text-gray-700">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Booking Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Booking Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleReject} 
                  disabled={actionLoading === `reject-${selectedBooking?.id}` || !rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {actionLoading === `reject-${selectedBooking?.id}` ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    'Reject Booking'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Booking Confirmation Dialog */}
        <BookingConfirmationDialog
          booking={bookingToApprove}
          open={showConfirmDialog}
          onConfirm={handleConfirmApprove}
          onCancel={() => {
            setShowConfirmDialog(false);
            setBookingToApprove(null);
          }}
          loading={actionLoading === `approve-${bookingToApprove?.id}`}
        />
      </div>
    </MainLayout>
  );
};

export default BookingRequests;
