import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, User, Phone, Calendar, DollarSign, FileText } from "lucide-react";
import { dashboardApiService, CheckedOutWithDues } from "@/services/dashboardApiService";

export const CheckoutWithoutPayment = () => {
  const [checkoutRecords, setCheckoutRecords] = useState<CheckedOutWithDues[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCheckoutRecords = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load real checkout records from API
        const data = await dashboardApiService.getCheckedOutWithDues();
        
        console.log('✅ Loaded checked-out students with dues:', data.length);
        setCheckoutRecords(data);
      } catch (error) {
        console.error('❌ Error loading checkout records:', error);
        setError(error instanceof Error ? error.message : 'Failed to load checkout records');
        setCheckoutRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutRecords();
  }, []);

  const totalOutstanding = checkoutRecords.reduce((sum, record) => 
    sum + (record.outstandingDues || 0), 0
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Checkout Without Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading checkout records...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Checkout Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Checkout Without Payment
          </div>
          <Badge variant="destructive" className="bg-orange-100 text-orange-800">
            {checkoutRecords.length} Records
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {checkoutRecords.length > 0 ? (
          <>
            {/* Summary Card */}
            <div className="bg-orange-50 p-4 rounded-lg mb-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-orange-900">Outstanding Amount</h3>
                  <p className="text-sm text-orange-700">
                    Total dues from {checkoutRecords.length} checkout(s) without payment
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-900">
                    NPR {totalOutstanding.toLocaleString()}
                  </div>
                  <div className="text-sm text-orange-700">Pending Collection</div>
                </div>
              </div>
            </div>

            {/* Records Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Checkout Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Outstanding Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkoutRecords.map((record, index) => (
                  <TableRow key={`${record.studentId}-${index}`} className="border-orange-100">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.studentName}</p>
                          <p className="text-sm text-gray-500">{record.studentId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{record.roomNumber || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(record.checkoutDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Checked Out</p>
                        <p className="text-xs text-gray-500 mt-1">Outstanding payment pending</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-red-600 font-bold">
                        NPR {(record.outstandingDues || 0).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className="bg-red-100 text-red-800"
                      >
                        {record.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 pt-4 border-t">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Collect Outstanding Dues
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Collection Report
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Outstanding Checkouts</h3>
            <p className="text-gray-500">
              All checkout records have been cleared or have no pending dues.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};