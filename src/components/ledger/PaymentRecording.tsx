
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
    paymentMethods 
  } = usePayments({ loadOnMount: true });

  // Form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<CreatePaymentDto['paymentMethod']>("Cash");
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

  // Payment method options
  const paymentModeOptions = [
    { value: "Cash" as const, label: "💵 Cash" },
    { value: "Bank Transfer" as const, label: "🏦 Bank Transfer" },
    { value: "Online" as const, label: "📱 Online Payment" },
    { value: "UPI" as const, label: "📱 UPI" },
    { value: "Mobile Wallet" as const, label: "📱 Mobile Wallet" },
    { value: "Cheque" as const, label: "📝 Cheque" },
    { value: "Card" as const, label: "💳 Card" }
  ];

  const needsReference = ["Bank Transfer", "Online", "UPI", "Mobile Wallet", "Cheque"].includes(paymentMode);

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
    <div className="space-y-4">
      {/* Compact Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">💰 Payment Recording</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 text-xs">
                  {studentsWithDues.filter(s => s.outstandingDue === 0).length} Paid Up
                </Badge>
                <Badge variant="outline" className="text-red-600 text-xs">
                  {studentsWithDues.filter(s => s.outstandingDue > 0).length} Outstanding
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadPayments()}
                disabled={isLoading}
                className="h-9"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={() => setShowPaymentForm(true)} 
                disabled={isLoading}
                size="sm"
                className="h-9"
              >
                ➕ Record Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Compact Outstanding Dues */}
      {!isLoading && studentsWithDues.filter(s => s.outstandingDue > 0).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              🚨 Outstanding Dues ({studentsWithDues.filter(s => s.outstandingDue > 0).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {studentsWithDues.filter(s => s.outstandingDue > 0).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{student.name}</div>
                      <div className="text-xs text-gray-600">Room: {student.room}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-red-600 text-sm">
                          ₹{student.outstandingDue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Outstanding</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="h-8 px-3 text-xs"
                        onClick={() => {
                          setSelectedStudent(student.id);
                          setPaymentAmount(student.outstandingDue.toString());
                          setShowPaymentForm(true);
                        }}
                      >
                        💰 Pay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compact Recent Payments */}
      {!isLoading && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Payments ({(payments || []).length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(payments || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4" />
                <p>No payments recorded yet.</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="py-2">Student</TableHead>
                      <TableHead className="py-2">Amount</TableHead>
                      <TableHead className="py-2">Method</TableHead>
                      <TableHead className="py-2">Date</TableHead>
                      <TableHead className="py-2">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(payments || []).slice(0, 20).map((payment) => {
                      const student = students.find(s => s.id === payment.studentId);
                      return (
                        <TableRow key={payment.id} className="hover:bg-gray-50">
                          <TableCell className="py-2">
                            <div>
                              <div className="font-medium text-sm">{payment.studentName || student?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">
                                Room: {student?.roomNumber || 'N/A'}
                              </div>
                              {payment.reference && (
                                <div className="text-xs text-gray-400">
                                  Ref: {payment.reference}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 font-bold text-green-600 text-sm">
                            ₹{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant="outline" className="text-xs">{payment.paymentMethod}</Badge>
                          </TableCell>
                          <TableCell className="py-2 text-sm">
                            {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge 
                              variant={payment.status === 'Completed' ? 'default' : 
                                     payment.status === 'Pending' ? 'secondary' : 
                                     payment.status === 'Failed' ? 'destructive' : 'outline'}
                              className="text-xs"
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Compact Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">💰 Record Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="student" className="text-sm">Select Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className={`h-9 ${!selectedStudent ? 'border-red-300' : ''}`}>
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsWithDues.length > 0 ? studentsWithDues.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{student.name} - Room {student.room}</span>
                          {student.outstandingDue > 0 && (
                            <span className="text-red-600 text-xs ml-2">
                              ₹{student.outstandingDue.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    )) : (
                      <SelectItem value="" disabled>
                        No students available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!selectedStudent && (
                  <p className="text-xs text-red-500 mt-1">Please select a student</p>
                )}
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm">Payment Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  max="1000000"
                  step="0.01"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={`h-9 ${!paymentAmount || parseFloat(paymentAmount) <= 0 ? 'border-red-300' : ''}`}
                />
                {selectedStudent && studentsWithDues.find(s => s.id === selectedStudent)?.outstandingDue > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Outstanding: ₹{studentsWithDues.find(s => s.id === selectedStudent)?.outstandingDue.toLocaleString()}
                  </p>
                )}
                {(!paymentAmount || parseFloat(paymentAmount) <= 0) && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid amount</p>
                )}
              </div>

              <div>
                <Label htmlFor="mode" className="text-sm">Payment Method *</Label>
                <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as CreatePaymentDto['paymentMethod'])}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentModeOptions.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsReference && (
                <div>
                  <Label htmlFor="reference" className="text-sm">
                    Reference ID *
                    <span className="text-xs text-gray-500 ml-1">
                      {paymentMode === "Online" && "(Transaction ID)"}
                      {paymentMode === "UPI" && "(UPI ID)"}
                      {paymentMode === "Bank Transfer" && "(Bank Ref)"}
                      {paymentMode === "Mobile Wallet" && "(Wallet ID)"}
                      {paymentMode === "Cheque" && "(Cheque No)"}
                    </span>
                  </Label>
                  <Input
                    id="reference"
                    placeholder="Enter reference ID"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1 text-sm">💡 Payment Rules:</h4>
                <ul className="text-xs text-blue-700 space-y-0.5">
                  <li>• Applied to oldest dues first</li>
                  <li>• Excess becomes advance balance</li>
                  <li>• Auto-applies to future invoices</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPaymentForm(false)}
                  disabled={submitting}
                  className="h-9"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handlePaymentSubmit}
                  disabled={
                    submitting || 
                    !selectedStudent || 
                    !paymentAmount || 
                    !paymentMode || 
                    (needsReference && !referenceId)
                  }
                  className="h-9"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Recording...
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
