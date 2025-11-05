
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "react-router-dom";
import { usePayments } from "@/hooks/usePayments";
import { useStudents } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { CreatePaymentDto, Payment } from "@/services/paymentsApiService";

export const PaymentRecording = () => {
  const location = useLocation();
  const { toast } = useToast();

  // Hooks for API data
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  const {
    payments,
    loading: paymentsLoading,
    error: paymentsError,
    recordPayment,
    loadPayments,
    loadMorePayments,
    hasMorePages,
    currentPage,
    pagination,
    paymentMethods
  } = usePayments({ loadOnMount: true });

  // Form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<CreatePaymentDto['paymentMethod']>("Cash");
  const [paymentType, setPaymentType] = useState<'REGULAR' | 'MONTHLY' | 'ADVANCE'>('MONTHLY');
  const [referenceId, setReferenceId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handle URL parameters to auto-select student and show payment form
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentParam = params.get('student');
    const amountParam = params.get('amount');
    const typeParam = params.get('type');

    if (studentParam && students.find(s => s.id === studentParam)) {
      setSelectedStudent(studentParam);
      setShowPaymentForm(true);

      // Pre-fill amount if provided
      if (amountParam) {
        setPaymentAmount(amountParam);
      }

      // Set default payment mode for outstanding dues
      if (typeParam === 'outstanding') {
        setPaymentMode('Cash');
      }

      const student = students.find(s => s.id === studentParam);
      toast({
        title: "Payment Form Ready",
        description: `Payment form opened for ${student?.name}${amountParam ? ` with amount NPR ${Number(amountParam).toLocaleString()}` : ''}.`,
      });
    }
  }, [location.search, students, toast]);

  // Transform students data for display
  const studentsWithDues = students.map(student => ({
    id: student.id,
    name: student.name,
    room: student.roomNumber || 'N/A',
    outstandingDue: student.currentBalance || 0,
    advanceBalance: student.advanceBalance || 0
  }));

  // Payment method options (removed UPI and Card)
  const paymentModeOptions = [
    { value: "Cash" as const, label: "💵 Cash" },
    { value: "Bank Transfer" as const, label: "🏦 Bank Transfer" },
    { value: "Online" as const, label: "📱 Online Payment" },
    { value: "Mobile Wallet" as const, label: "📱 Mobile Wallet" },
    { value: "Cheque" as const, label: "📝 Cheque" }
  ];

  // Payment type options
  const paymentTypeOptions = [
    { value: "REGULAR" as const, label: "💰 Regular Payment" },
    { value: "MONTHLY" as const, label: "🏠 Monthly Rent" },
    { value: "ADVANCE" as const, label: "⚡ Advance Payment" }
  ];

  const needsReference = ["Bank Transfer", "Online", "Mobile Wallet", "Cheque"].includes(paymentMode);

  const handlePaymentSubmit = async () => {
    // Enhanced validation
    const errors: string[] = [];

    if (!selectedStudent || !selectedStudent.trim()) {
      errors.push("Please select a student");
    }

    if (!paymentAmount || !paymentAmount.trim()) {
      errors.push("Please enter payment amount");
    } else {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.push("Payment amount must be a positive number");
      }
      if (amount > 1000000) {
        errors.push("Payment amount seems too large. Please verify.");
      }
    }

    if (!paymentMode) {
      errors.push("Please select payment method");
    }

    if (needsReference && (!referenceId || !referenceId.trim())) {
      errors.push(`Please provide a reference ID for ${paymentMode} payments`);
    }

    // Show all validation errors at once
    if (errors.length > 0) {
      toast({
        title: "Validation Errors",
        description: errors.join(". "),
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const amount = parseFloat(paymentAmount);

      const paymentData: CreatePaymentDto = {
        studentId: selectedStudent.trim(),
        amount: amount,
        paymentMethod: paymentMode,
        paymentType: paymentType,
        reference: referenceId?.trim() || undefined,
        notes: notes?.trim() || undefined,
        status: "Completed",
        processedBy: "admin"
      };



      const recordedPayment = await recordPayment(paymentData);



      // Refresh data after successful payment
      await loadPayments();

      toast({
        title: "Payment Recorded Successfully",
        description: `Payment of NPR ${amount.toLocaleString()} recorded for ${studentsWithDues.find(s => s.id === selectedStudent)?.name || 'student'}. Ledger updated.`,
      });

      // Reset form and close modal
      setShowPaymentForm(false);
      setSelectedStudent("");
      setPaymentAmount("");
      setPaymentMode("Cash");
      setPaymentType("MONTHLY");
      setReferenceId("");
      setNotes("");

    } catch (error) {
      console.error('❌ Payment recording failed:', error);

      // Enhanced error handling
      let errorMessage = "Failed to record payment. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('validation')) {
          errorMessage = `Validation error: ${error.message}`;
        } else if (error.message.includes('student')) {
          errorMessage = "Student not found. Please refresh and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Payment Recording Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading and error states
  const isLoading = studentsLoading || paymentsLoading;
  const hasError = studentsError || paymentsError;

  return (
    <div className="h-full flex flex-col space-y-6 w-full">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold kaha-text-brand">💰 Payment Recording</h1>
                <p className="text-gray-600 font-medium">Record and track student payments</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 px-3 py-1 font-semibold">
                <CheckCircle className="h-4 w-4 mr-2" />
                {studentsWithDues.filter(s => s.outstandingDue === 0).length} Paid Up
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 px-3 py-1 font-semibold">
                <AlertCircle className="h-4 w-4 mr-2" />
                {studentsWithDues.filter(s => s.outstandingDue > 0).length} Outstanding
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 px-3 py-1 font-semibold">
                {(payments || []).length} Total Payments
              </Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => loadPayments()}
              disabled={isLoading}
              className="h-12 px-6 border-2 font-semibold hover:scale-105 transition-all duration-200"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowPaymentForm(true)}
              disabled={isLoading}
              className="kaha-button-primary h-12 px-8 text-base font-bold"
            >
              ➕ Record Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">Error Loading Data:</div>
              <div>{studentsError || paymentsError}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadPayments();
                  window.location.reload(); // Fallback for persistent errors
                }}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading payment data...</span>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Outstanding Dues */}
      {!isLoading && studentsWithDues.filter(s => s.outstandingDue > 0).length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-red-700">
              🚨 Outstanding Dues
              <Badge className="bg-red-600 text-white text-base px-3 py-1">
                {studentsWithDues.filter(s => s.outstandingDue > 0).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {studentsWithDues.filter(s => s.outstandingDue > 0).map((student) => (
                <div key={student.id} className="bg-white rounded-xl p-4 border-2 border-red-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <div className="space-y-3">
                    <div>
                      <div className="font-bold text-lg text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg inline-block">
                        Room: {student.room}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-red-600">
                        ₹{student.outstandingDue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">Outstanding Amount</div>
                    </div>
                    <Button
                      className="w-full kaha-button-primary h-10 font-bold"
                      onClick={() => {
                        setSelectedStudent(student.id);
                        setPaymentAmount(student.outstandingDue.toString());
                        setShowPaymentForm(true);
                      }}
                    >
                      💰 Record Payment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Recent Payments */}
      {!isLoading && (
        <Card className="flex-1 border-2 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-gray-900">
              📋 Recent Payments
              <Badge className="bg-blue-600 text-white text-base px-3 py-1">
                {(payments || []).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(payments || []).length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <DollarSign className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Payments Yet</h3>
                <p className="text-gray-500 mb-6">Start recording payments to see them here</p>
                <Button
                  onClick={() => setShowPaymentForm(true)}
                  className="kaha-button-primary"
                >
                  ➕ Record First Payment
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="py-4 px-6 font-bold text-gray-900">Student Details</TableHead>
                        <TableHead className="py-4 px-6 font-bold text-gray-900">Amount</TableHead>
                        <TableHead className="py-4 px-6 font-bold text-gray-900">Method</TableHead>
                        <TableHead className="py-4 px-6 font-bold text-gray-900">Date</TableHead>
                        <TableHead className="py-4 px-6 font-bold text-gray-900">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(payments || []).map((payment, index) => {
                        const student = students.find(s => s.id === payment.studentId);
                        return (
                          <TableRow
                            key={payment.id}
                            className="hover:bg-green-50 transition-colors duration-200 border-b border-gray-100"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <TableCell className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="font-semibold text-base text-gray-900">
                                  {payment.studentName || student?.name || 'Unknown Student'}
                                </div>
                                <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg inline-block">
                                  Room: {student?.roomNumber || 'N/A'}
                                </div>
                                {payment.reference && (
                                  <div className="text-sm text-blue-600 font-medium">
                                    Ref: {payment.reference}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="font-bold text-xl text-green-600">
                                ₹{payment.amount.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge
                                variant="outline"
                                className="text-sm px-3 py-1 font-semibold border-2"
                              >
                                {payment.paymentMethod}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-base font-medium text-gray-700">
                                {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(payment.paymentDate).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge
                                variant={payment.status === 'Completed' ? 'default' :
                                  payment.status === 'Pending' ? 'secondary' :
                                    payment.status === 'Failed' ? 'destructive' : 'outline'}
                                className="text-sm px-3 py-1 font-semibold"
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {pagination && pagination.total > (payments || []).length && (
                  <div className="p-4 bg-gray-50 text-center border-t">
                    <p className="text-gray-600 font-medium">
                      Showing {(payments || []).length} of {pagination.total} payments
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => loadMorePayments()}
                      disabled={paymentsLoading || !hasMorePages}
                    >
                      {paymentsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : hasMorePages ? (
                        'Load More Payments'
                      ) : (
                        'All Payments Loaded'
                      )}
                    </Button>
                  </div>
                )}

                {pagination && pagination.total === (payments || []).length && pagination.total > 15 && (
                  <div className="p-4 bg-green-50 text-center border-t border-green-200">
                    <p className="text-green-700 font-medium">
                      ✅ All {pagination.total} payments loaded
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border-2 border-green-200">
            <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-200">
              <CardTitle className="text-2xl font-bold flex items-center gap-3 kaha-text-brand">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                💰 Record Payment
              </CardTitle>
              <p className="text-gray-600 font-medium">Enter payment details to update student ledger</p>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student" className="text-base font-semibold">Select Student *</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className={`h-12 text-base ${!selectedStudent ? 'border-red-300 border-2' : 'border-2'}`}>
                      <SelectValue placeholder="Choose student" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentsWithDues.length > 0 ? studentsWithDues.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex justify-between items-center w-full">
                            <span className="font-medium">{student.name} - Room {student.room}</span>
                            {student.outstandingDue > 0 && (
                              <span className="text-red-600 font-bold ml-3">
                                ₹{student.outstandingDue.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      )) : (
                        <SelectItem value="no-students" disabled>
                          No students available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {!selectedStudent && (
                    <p className="text-sm text-red-500 font-medium">Please select a student</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-base font-semibold">Payment Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max="1000000"
                    step="0.01"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className={`h-12 text-base font-semibold ${!paymentAmount || parseFloat(paymentAmount) <= 0 ? 'border-red-300 border-2' : 'border-2'}`}
                  />
                  {selectedStudent && studentsWithDues.find(s => s.id === selectedStudent)?.outstandingDue > 0 && (
                    <p className="text-sm text-blue-600 font-semibold bg-blue-50 p-2 rounded-lg">
                      Outstanding: ₹{studentsWithDues.find(s => s.id === selectedStudent)?.outstandingDue.toLocaleString()}
                    </p>
                  )}
                  {(!paymentAmount || parseFloat(paymentAmount) <= 0) && (
                    <p className="text-sm text-red-500 font-medium">Please enter a valid amount</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-base font-semibold">Payment Type *</Label>
                  <Select value={paymentType} onValueChange={(value) => setPaymentType(value as 'REGULAR' | 'MONTHLY' | 'ADVANCE')}>
                    <SelectTrigger className="h-12 text-base border-2">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-base">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode" className="text-base font-semibold">Payment Method *</Label>
                  <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as CreatePaymentDto['paymentMethod'])}>
                    <SelectTrigger className="h-12 text-base border-2">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentModeOptions.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value} className="text-base">
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {needsReference && (
                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-base font-semibold">
                    Reference ID *
                    <span className="text-sm text-gray-500 ml-2 font-normal">
                      {paymentMode === "Online" && "(Transaction ID)"}
                      {paymentMode === "Bank Transfer" && "(Bank Reference)"}
                      {paymentMode === "Mobile Wallet" && "(Wallet ID)"}
                      {paymentMode === "Cheque" && "(Cheque Number)"}
                    </span>
                  </Label>
                  <Input
                    id="reference"
                    placeholder="Enter reference ID"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    className="h-12 text-base border-2"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Additional notes or comments"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-12 text-base border-2"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border-2 border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3 text-base flex items-center gap-2">
                  💡 Payment Processing Rules
                </h4>
                <ul className="text-sm text-blue-700 space-y-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Applied to oldest outstanding dues first
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Excess amount becomes advance balance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Auto-applies to future invoices
                  </li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                  disabled={submitting}
                  className="h-12 px-8 text-base font-semibold border-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={
                    submitting ||
                    !selectedStudent ||
                    !paymentAmount ||
                    !paymentMode ||
                    (needsReference && !referenceId)
                  }
                  className="kaha-button-primary h-12 px-8 text-base font-bold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Recording Payment...
                    </>
                  ) : (
                    <>💾 Record Payment</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
