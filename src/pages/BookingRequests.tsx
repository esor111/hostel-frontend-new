
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Check, X, UserPlus, Clock, MapPin, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BookingRequest {
  id: string;
  studentName: string;
  phone: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  preferredRoom: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  emergencyContact: string;
  address: string;
  expectedJoinDate: string;
}

const BookingRequests = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);

  // Mock data - replace with API calls
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: "REQ-001",
      studentName: "Anish Sharma",
      phone: "9841234567",
      email: "anish@example.com",
      guardianName: "Ram Sharma",
      guardianPhone: "9841234568",
      preferredRoom: "Single Room",
      requestDate: "2024-01-15",
      status: "pending",
      documents: ["ID Card", "Guardian ID"],
      emergencyContact: "9841234569",
      address: "Kathmandu, Nepal",
      expectedJoinDate: "2024-02-01"
    },
    {
      id: "REQ-002",
      studentName: "Priya Tamang",
      phone: "9851234567",
      email: "priya@example.com",
      guardianName: "Sita Tamang",
      guardianPhone: "9851234568",
      preferredRoom: "Shared Room",
      requestDate: "2024-01-16",
      status: "pending",
      documents: ["ID Card", "Academic Certificate"],
      emergencyContact: "9851234569",
      address: "Lalitpur, Nepal",
      expectedJoinDate: "2024-02-05"
    },
    {
      id: "REQ-003",
      studentName: "Deepak Thapa",
      phone: "9861234567",
      email: "deepak@example.com",
      guardianName: "Maya Thapa",
      guardianPhone: "9861234568",
      preferredRoom: "Dormitory",
      requestDate: "2024-01-10",
      status: "approved",
      documents: ["ID Card", "Guardian ID", "Medical Certificate"],
      emergencyContact: "9861234569",
      address: "Bhaktapur, Nepal",
      expectedJoinDate: "2024-01-25"
    }
  ]);

  const handleApprove = (request: BookingRequest) => {
    // Update request status
    setBookingRequests(prev => 
      prev.map(req => 
        req.id === request.id 
          ? { ...req, status: 'approved' }
          : req
      )
    );

    // Show success message
    toast.success(`${request.studentName} approved! Student profile created and ledger activated.`, {
      duration: 4000,
      action: {
        label: "View Ledger",
        onClick: () => navigate("/ledger?section=students")
      }
    });

    // Close modal
    setSelectedRequest(null);
  };

  const handleReject = (request: BookingRequest) => {
    setBookingRequests(prev => 
      prev.map(req => 
        req.id === request.id 
          ? { ...req, status: 'rejected' }
          : req
      )
    );

    toast.error(`${request.studentName}'s request has been rejected.`);
    setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredRequests = bookingRequests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = bookingRequests.filter(req => req.status === 'pending').length;
  const approvedCount = bookingRequests.filter(req => req.status === 'approved').length;
  const rejectedCount = bookingRequests.filter(req => req.status === 'rejected').length;

  return (
    <MainLayout activeTab="bookings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">📝 Booking Requests</h2>
            <p className="text-gray-600 mt-1">Manage student admission requests and approvals</p>
          </div>
          <Button 
            onClick={() => navigate("/ledger?section=students")}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            📚 View All Students
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
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
                  <p className="text-3xl font-bold text-green-700">{approvedCount}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Requests</p>
                  <p className="text-3xl font-bold text-blue-700">{bookingRequests.length}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-600" />
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
                  placeholder="Search by name or phone..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Preferred Room</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium text-blue-600">{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.studentName}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {request.phone}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {request.address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.guardianName}</p>
                        <p className="text-sm text-gray-500">{request.guardianPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.preferredRoom}</TableCell>
                    <TableCell>{request.expectedJoinDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApprove(request)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleReject(request)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>📄 Request Details - {selectedRequest.id}</span>
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Student Information</h4>
                    <div className="mt-2 space-y-2">
                      <p><strong>Name:</strong> {selectedRequest.studentName}</p>
                      <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                      <p><strong>Email:</strong> {selectedRequest.email}</p>
                      <p><strong>Address:</strong> {selectedRequest.address}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Guardian Information</h4>
                    <div className="mt-2 space-y-2">
                      <p><strong>Name:</strong> {selectedRequest.guardianName}</p>
                      <p><strong>Phone:</strong> {selectedRequest.guardianPhone}</p>
                      <p><strong>Emergency:</strong> {selectedRequest.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Booking Details</h4>
                  <div className="mt-2 space-y-2">
                    <p><strong>Preferred Room:</strong> {selectedRequest.preferredRoom}</p>
                    <p><strong>Expected Join Date:</strong> {selectedRequest.expectedJoinDate}</p>
                    <p><strong>Request Date:</strong> {selectedRequest.requestDate}</p>
                    <p><strong>Documents:</strong> {selectedRequest.documents.join(", ")}</p>
                  </div>
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(selectedRequest)}
                    >
                      ✅ Approve & Create Student Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleReject(selectedRequest)}
                    >
                      ❌ Reject Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BookingRequests;
