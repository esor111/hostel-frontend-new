
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
        createdBy: "admin"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">💰 Payment Recording</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => loadPayments()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowPaymentForm(true)} disabled={isLoading}>
            ➕ Record New Payment
          </Button>
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

      {/* Outstanding Dues Summary */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>🚨 Students with Outstanding Dues</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsWithDues.filter(s => s.outstandingDue > 0).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No outstanding dues! All students are up to date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {studentsWithDues.filter(s => s.outstandingDue > 0).map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">Room: {student.room}</div>
                    <div className="text-lg font-bold text-red-600 mt-2">
                      NPR {student.outstandingDue.toLocaleString()}
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => {
                        setSelectedStudent(student.id);
                        setPaymentAmount(student.outstandingDue.toString());
                        setShowPaymentForm(true);
                      }}
                    >
                      💰 Record Payment
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {(payments || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4" />
                <p>No payments recorded yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(payments || []).slice(0, 10).map((payment) => {
                    const student = students.find(s => s.id === payment.studentId);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.studentName || student?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">
                              Room: {student?.roomNumber || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          NPR {payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell>{payment.reference || "-"}</TableCell>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={payment.status === 'Completed' ? 'default' : 
                                   payment.status === 'Pending' ? 'secondary' : 
                                   payment.status === 'Failed' ? 'destructive' : 'outline'}
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Recording Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg m-4">
            <CardHeader>
              <CardTitle>💰 Record New Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="student">Select Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className={!selectedStudent ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsWithDues.length > 0 ? studentsWithDues.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - Room {student.room}
                        {student.outstandingDue > 0 && (
                          <span className="text-red-600 ml-2">
                            (Due: NPR {student.outstandingDue.toLocaleString()})
                          </span>
                        )}
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
                <Label htmlFor="amount">Payment Amount (NPR) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  max="1000000"
                  step="0.01"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={!paymentAmount || parseFloat(paymentAmount) <= 0 ? 'border-red-300' : ''}
                />
                {(!paymentAmount || parseFloat(paymentAmount) <= 0) && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid amount</p>
                )}
                {selectedStudent && studentsWithDues.find(s => s.id === selectedStudent)?.outstandingDue > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Outstanding due: NPR {studentsWithDues.find(s => s.id === selectedStudent)?.outstandingDue.toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="mode">Payment Method *</Label>
                <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as CreatePaymentDto['paymentMethod'])}>
                  <SelectTrigger>
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
                  <Label htmlFor="reference">
                    Reference ID * 
                    {paymentMode === "Online" && " (Transaction ID)"}
                    {paymentMode === "UPI" && " (UPI Transaction ID)"}
                    {paymentMode === "Bank Transfer" && " (Bank Reference Number)"}
                    {paymentMode === "Mobile Wallet" && " (Wallet Transaction ID)"}
                    {paymentMode === "Cheque" && " (Cheque Number)"}
                  </Label>
                  <Input
                    id="reference"
                    placeholder="Enter reference ID"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Additional notes about the payment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💡 Payment Application Rules:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Payments are applied to oldest dues first</li>
                  <li>• Excess amount becomes advance balance</li>
                  <li>• Advance balance auto-applies to future invoices</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentForm(false)}
                  disabled={submitting}
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
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
