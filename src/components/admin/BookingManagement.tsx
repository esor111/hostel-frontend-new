
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { BookingStatus, CreateBookingRequest, UpdateBookingRequest } from '@/types/api';
import { useLanguage } from "@/hooks/useLanguage";

export const BookingManagement = () => {
  const { translations } = useLanguage();
  const {
    bookings,
    bookingStats,
    loading,
    error,
    actionLoading,
    createBooking,
    updateBooking,
    deleteBooking,
    refreshData
  } = useBookings();
  
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [formData, setFormData] = useState<CreateBookingRequest>({
    name: '',
    email: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    preferredRoom: '',
    course: '',
    institution: '',
    requestDate: '',
    checkInDate: '',
    duration: '',
    emergencyContact: '',
    address: '',
    idProofType: '',
    idProofNumber: ''
  });

  // Filter bookings based on search and status
  useEffect(() => {
    let filtered = bookings;
    
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.APPROVED:
        return "bg-green-100 text-green-700";
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-700";
      case BookingStatus.REJECTED:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBooking(formData);
      setShowCreateDialog(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        guardianName: '',
        guardianPhone: '',
        preferredRoom: '',
        course: '',
        institution: '',
        requestDate: '',
        checkInDate: '',
        duration: '',
        emergencyContact: '',
        address: '',
        idProofType: '',
        idProofNumber: ''
      });
      console.log('Booking created successfully');
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    
    try {
      const updateData: UpdateBookingRequest = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        preferredRoom: formData.preferredRoom,
        course: formData.course,
        institution: formData.institution,
        requestDate: formData.requestDate,
        checkInDate: formData.checkInDate,
        duration: formData.duration,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        idProofType: formData.idProofType,
        idProofNumber: formData.idProofNumber
      };
      
      await updateBooking(selectedBooking.id, updateData);
      setShowEditDialog(false);
      setSelectedBooking(null);
      console.log('Booking updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(id);
        console.log('Booking deleted successfully');
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const openEditDialog = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      guardianName: booking.guardianName,
      guardianPhone: booking.guardianPhone,
      preferredRoom: booking.preferredRoom,
      course: booking.course,
      institution: booking.institution,
      requestDate: booking.requestDate,
      checkInDate: booking.checkInDate,
      duration: booking.duration,
      emergencyContact: booking.emergencyContact,
      address: booking.address,
      idProofType: booking.idProofType,
      idProofNumber: booking.idProofNumber
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (booking) => {
    setSelectedBooking(booking);
    setShowViewDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading booking requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{bookingStats.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{bookingStats.pendingBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{bookingStats.approvedBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{bookingStats.rejectedBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Management
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Booking Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkInDate">Check-in Date</Label>
                      <Input
                        id="checkInDate"
                        type="date"
                        value={formData.checkInDate}
                        onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredRoomType">Preferred Room Type</Label>
                    <Select value={formData.preferredRoomType} onValueChange={(value) => setFormData({...formData, preferredRoomType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single Room</SelectItem>
                        <SelectItem value="Double">Double Room</SelectItem>
                        <SelectItem value="Dorm">Dorm Bed</SelectItem>
                        <SelectItem value="Suite">Suite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={actionLoading === 'create'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {actionLoading === 'create' ? 'Creating...' : 'Create Booking'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by name, email, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={BookingStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={BookingStatus.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Booking ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Guest Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Check-in Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Room Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      {searchTerm || statusFilter !== 'all' ? 'No bookings match your filters' : 'No booking requests found'}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-blue-600">{booking.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{booking.name}</p>
                          <p className="text-sm text-gray-500">{booking.guardianName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{booking.email}</td>
                      <td className="py-3 px-4 text-sm">{booking.phone}</td>
                      <td className="py-3 px-4 text-sm">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{booking.preferredRoom}</Badge>
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
                            className="h-8 w-8 p-0"
                            onClick={() => openViewDialog(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0"
                            onClick={() => openEditDialog(booking)}
                            disabled={actionLoading === `update-${booking.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(booking.id)}
                            disabled={actionLoading === `delete-${booking.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-checkInDate">Check-in Date</Label>
                <Input
                  id="edit-checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-preferredRoomType">Preferred Room Type</Label>
              <Select value={formData.preferredRoomType} onValueChange={(value) => setFormData({...formData, preferredRoomType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single Room</SelectItem>
                  <SelectItem value="Double">Double Room</SelectItem>
                  <SelectItem value="Dorm">Dorm Bed</SelectItem>
                  <SelectItem value="Suite">Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
                <Input
                  id="edit-emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-emergencyPhone">Emergency Phone</Label>
                <Input
                  id="edit-emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={actionLoading === `update-${selectedBooking?.id}`}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading === `update-${selectedBooking?.id}` ? 'Updating...' : 'Update Booking'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Request Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Booking ID</Label>
                  <p className="text-sm font-medium text-blue-600">{selectedBooking.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="text-sm">{selectedBooking.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{selectedBooking.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-sm">{selectedBooking.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Check-in Date</Label>
                  <p className="text-sm">{new Date(selectedBooking.checkInDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Address</Label>
                <p className="text-sm">{selectedBooking.address}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Preferred Room Type</Label>
                <Badge variant="outline">{selectedBooking.preferredRoomType}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Emergency Contact</Label>
                  <p className="text-sm">{selectedBooking.emergencyContact}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Emergency Phone</Label>
                  <p className="text-sm">{selectedBooking.emergencyPhone}</p>
                </div>
              </div>
              {selectedBooking.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Rejection Reason</Label>
                  <p className="text-sm text-red-600">{selectedBooking.rejectionReason}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created At</Label>
                  <p className="text-sm">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Updated At</Label>
                  <p className="text-sm">{new Date(selectedBooking.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
