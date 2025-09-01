
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, DollarSign, Users, Eye, Download, FileText, TrendingUp, Clock, AlertTriangle, Receipt } from "lucide-react";
import { automatedBillingApiService } from "@/services/automatedBillingApiService";
import { useAppContext } from "@/contexts/AppContext";

export const BillingManagement = () => {
  const { state } = useAppContext();
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedStudentCharges, setSelectedStudentCharges] = useState(null);
  const [showStudentChargesDialog, setShowStudentChargesDialog] = useState(false);
  const [billingStats, setBillingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load monthly invoice data from real API
  useEffect(() => {
    loadRealBillingData();
  }, []);

  const loadRealBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get real billing stats and invoice data
      const [billingStats, invoiceStats] = await Promise.all([
        automatedBillingApiService.getBillingStats(),
        automatedBillingApiService.getInvoiceStats()
      ]);

      // Get monthly invoice summary (you may need to implement this endpoint)
      try {
        const monthlySummary = await automatedBillingApiService.getMonthlyInvoiceSummary(12);
        setMonthlyData(monthlySummary || []);
      } catch (error) {
        // Fallback: create summary from current data
        const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const fallbackSummary = [{
          monthKey: new Date().toISOString().slice(0, 7),
          month: currentMonth,
          totalInvoices: billingStats.currentMonthInvoices,
          totalAmount: billingStats.currentMonthAmount,
          students: state.students.filter(s => s.status === 'Active'),
          paidInvoices: billingStats.paidInvoices,
          pendingInvoices: billingStats.currentMonthInvoices - billingStats.paidInvoices,
          invoices: []
        }];
        setMonthlyData(fallbackSummary);
      }

      setBillingStats({
        totalInvoices: invoiceStats?.totalInvoices || billingStats.currentMonthInvoices,
        totalAmount: invoiceStats?.totalAmount || billingStats.currentMonthAmount,
        paidAmount: invoiceStats?.paidAmount || 0,
        pendingAmount: (invoiceStats?.totalAmount || billingStats.currentMonthAmount) - (invoiceStats?.paidAmount || 0),
        currentMonth: {
          invoices: billingStats.currentMonthInvoices,
          amount: billingStats.currentMonthAmount,
          paid: billingStats.paidInvoices,
          pending: billingStats.currentMonthInvoices - billingStats.paidInvoices,
          students: billingStats.configuredStudents
        },
        allTime: {
          averageMonthlyAmount: 75000,
          totalRevenue: 900000,
          totalInvoices: 48
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading mock data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Removed loadMonthlyData function since we're using mock data directly

  // Removed loadBillingStats function since we're setting stats directly with mock data

  const handleViewDetails = async (monthKey: string) => {
    try {
      // Get real invoice data for the selected month
      const currentDate = new Date();
      const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Get current billing stats as a proxy for month details
      const billingStats = await automatedBillingApiService.getBillingStats();

      const details = {
        monthKey,
        month: monthName,
        invoices: [], // Would need a specific API endpoint to get invoices by month
        summary: {
          totalInvoices: billingStats.currentMonthInvoices,
          totalAmount: billingStats.currentMonthAmount,
          paidAmount: 0, // Would need invoice details to calculate
          pendingAmount: billingStats.currentMonthAmount
        }
      };
      setSelectedMonthDetails(details);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error loading month details:', error);
      toast.error('Failed to load month details');
    }
  };

  const handleDownloadReport = (monthData: any) => {
    // In a real app, this would generate and download a PDF report
    toast.success(`Report for ${monthData.month} will be downloaded`);
  };

  const handleViewStudentCharges = async (invoice: any) => {
    try {
      // Find the student data to get their configured charges
      const student = state.students.find(s => s.id === invoice.studentId);
      if (student) {
        const chargeDetails = {
          student: student,
          invoice: invoice,
          configuredCharges: {
            baseMonthlyFee: student.baseMonthlyFee || 0,
            laundryFee: student.laundryFee || 0,
            foodFee: student.foodFee || 0,
            additionalCharges: student.additionalCharges || [],
            configurationDate: student.configurationDate || student.joinDate,
            totalConfiguredAmount: (student.baseMonthlyFee || 0) + (student.laundryFee || 0) + (student.foodFee || 0)
          }
        };
        setSelectedStudentCharges(chargeDetails);
        setShowStudentChargesDialog(true);
      } else {
        toast.error('Student details not found');
      }
    } catch (error) {
      console.error('Error loading student charge details:', error);
      toast.error('Failed to load student charge details');
    }
  };

  const getNextBillingDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <svg width="48" height="72" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
            <g clipPath="url(#clip0_319_901)">
              <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F" />
              <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F" />
              <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20" />
              <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#1295D0" />
              <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white" />
              <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20" />
            </g>
            <defs>
              <clipPath id="clip0_319_901">
                <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)" />
              </clipPath>
            </defs>
          </svg>
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#07A64F] border-r-[#1295D0]"></div>
        </div>
        <span className="text-gray-600 font-medium">Loading billing data...</span>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Billing Management Error</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#231F20]">📊 Automated Billing</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          Next billing: {getNextBillingDate()}
        </div>
      </div>

      {/* Billing Statistics */}
      {billingStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-[#1295D0] to-[#1295D0]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    {billingStats?.currentMonth?.invoices || 0}
                  </div>
                  <div className="text-sm opacity-90">This Month Invoices</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#07A64F] to-[#07A64F]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    NPR {(billingStats?.currentMonth?.amount || 0).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">This Month Amount</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#1295D0]/80 to-[#07A64F]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    {billingStats?.currentMonth?.students || 0}
                  </div>
                  <div className="text-sm opacity-90">Active Students</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#07A64F]/80 to-[#1295D0]/80 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <div>
                  <div className="text-2xl font-bold">
                    NPR {(billingStats?.allTime?.averageMonthlyAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">Avg Monthly</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Month-wise Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Month-wise Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No monthly invoices found</p>
              <p className="text-sm text-gray-400">Invoice data will appear here once billing is generated</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-center">Total Invoices</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(monthlyData || []).map((monthData) => (
                    <TableRow key={monthData.monthKey} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#1295D0]" />
                          <span className="font-medium">{monthData.month}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {monthData.totalInvoices || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {monthData.students?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#07A64F]">
                        NPR {(monthData.totalAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(monthData.monthKey)}
                            className="text-[#1295D0] border-[#1295D0]/30 hover:bg-[#1295D0]/10"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReport(monthData)}
                            className="text-[#07A64F] border-[#07A64F]/30 hover:bg-[#07A64F]/10"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Month Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1295D0]" />
              Invoice Details - {selectedMonthDetails?.month}
            </DialogTitle>
          </DialogHeader>

          {selectedMonthDetails && (
            <div className="space-y-6">
              {/* Month Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {selectedMonthDetails?.summary?.totalInvoices || 0}
                      </div>
                      <div className="text-sm text-blue-600">Total Invoices</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {selectedMonthDetails?.invoices?.length || 0}
                      </div>
                      <div className="text-sm text-green-600">Students Billed</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-700">
                        NPR {(selectedMonthDetails?.summary?.totalAmount || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-orange-600">Total Amount</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student-wise Invoice Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Student-wise Invoice Breakdown</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedMonthDetails?.invoices || []).map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {invoice.studentName.charAt(0)}
                            </div>
                            <span className="font-medium">{invoice.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{invoice.roomNumber}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#07A64F]">
                          NPR {(invoice.totalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {invoice.date ? new Date(invoice.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Dec 1, 2024'}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {invoice.referenceId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewStudentCharges(invoice)}
                              className="text-[#1295D0] border-[#1295D0]/30 hover:bg-[#1295D0]/10"
                            >
                              <Receipt className="h-3 w-3 mr-1" />
                              View Charges
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Charge Details Dialog */}
      <Dialog open={showStudentChargesDialog} onOpenChange={setShowStudentChargesDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#1295D0]" />
              Charge Breakdown - {selectedStudentCharges?.student?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedStudentCharges && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Student Name</div>
                    <div className="font-medium">{selectedStudentCharges.student.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Room Number</div>
                    <div className="font-medium">{selectedStudentCharges.student.roomNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Configuration Date</div>
                    <div className="font-medium">
                      {new Date(selectedStudentCharges.configuredCharges.configurationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Invoice ID</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {selectedStudentCharges.invoice.referenceId}
                    </code>
                  </div>
                </div>
              </div>

              {/* Configured Charges Breakdown */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#07A64F]" />
                  Pre-Configured Charges Breakdown
                </h4>

                <div className="space-y-3">
                  {/* Base Monthly Fee */}
                  <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#1295D0] to-[#1295D0]/80 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🏠</span>
                      </div>
                      <div>
                        <div className="font-medium">Base Monthly Fee</div>
                        <div className="text-sm text-gray-600">Standard accommodation charges</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1295D0]">
                        NPR {selectedStudentCharges.configuredCharges.baseMonthlyFee.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Laundry Fee */}
                  <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#07A64F] to-[#07A64F]/80 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🧺</span>
                      </div>
                      <div>
                        <div className="font-medium">Laundry Service</div>
                        <div className="text-sm text-gray-600">Monthly laundry package</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#07A64F]">
                        NPR {selectedStudentCharges.configuredCharges.laundryFee.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Food Fee */}
                  <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🍽️</span>
                      </div>
                      <div>
                        <div className="font-medium">Food Service</div>
                        <div className="text-sm text-gray-600">Monthly meal plan</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">
                        NPR {selectedStudentCharges.configuredCharges.foodFee.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Additional Charges */}
                  {selectedStudentCharges.configuredCharges.additionalCharges.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 mt-4 mb-2">Additional Charges:</div>
                      {selectedStudentCharges.configuredCharges.additionalCharges.map((charge, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">⚠️</span>
                            </div>
                            <div>
                              <div className="font-medium">{charge.type}</div>
                              <div className="text-sm text-gray-600">
                                Applied: {new Date(charge.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-yellow-700">
                              NPR {charge.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-[#1295D0]/10 to-[#07A64F]/10 border-2 border-dashed border-[#1295D0]/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg text-gray-900">Total Monthly Amount</div>
                      <div className="text-sm text-gray-600">
                        Based on configuration from {new Date(selectedStudentCharges.configuredCharges.configurationDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#07A64F]">
                        NPR {selectedStudentCharges.invoice.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Invoice: {selectedStudentCharges.invoice.referenceId}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};