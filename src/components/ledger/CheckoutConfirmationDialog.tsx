import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogOut, AlertTriangle, DollarSign, Calendar, User, Bed, CheckCircle, XCircle } from "lucide-react";

interface Student {
  id: string;
  name: string;
  roomNumber: string;
  course: string;
  currentBalance: number;
  baseMonthlyFee: number;
  laundryFee: number;
  foodFee: number;
}

interface CheckoutConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (checkoutData: CheckoutData) => Promise<void>;
  student: Student;
  totalDueAmount: number;
  currentMonthBilling?: {
    amount: number;
    period: string;
    daysCharged: number;
  };
  loading?: boolean;
}

interface CheckoutData {
  reason: string;
  finalBalance: number;
  clearRoom: boolean;
  refundAmount: number;
  deductionAmount: number;
  notes: string;
}

export const CheckoutConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  student,
  totalDueAmount,
  currentMonthBilling,
  loading = false
}: CheckoutConfirmationDialogProps) => {
  const [checkoutReason, setCheckoutReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [deductionAmount, setDeductionAmount] = useState("0");
  const [refundAmount, setRefundAmount] = useState("0");
  const [clearRoom, setClearRoom] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate final balance after deductions and refunds
  const finalBalance = totalDueAmount - parseFloat(deductionAmount || "0") + parseFloat(refundAmount || "0");
  const hasOutstandingDues = finalBalance > 0;
  const hasRefund = finalBalance < 0;

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!checkoutReason.trim()) {
      errors.push("Checkout reason is required");
    }

    if (checkoutReason.trim().length < 5) {
      errors.push("Checkout reason must be at least 5 characters long");
    }

    const deduction = parseFloat(deductionAmount || "0");
    const refund = parseFloat(refundAmount || "0");

    if (deduction < 0) {
      errors.push("Deduction amount cannot be negative");
    }

    if (refund < 0) {
      errors.push("Refund amount cannot be negative");
    }

    if (deduction > totalDueAmount) {
      errors.push("Deduction amount cannot exceed total due amount");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleConfirmCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    setConfirming(true);

    try {
      const checkoutData: CheckoutData = {
        reason: checkoutReason.trim(),
        finalBalance,
        clearRoom,
        refundAmount: Math.abs(finalBalance < 0 ? finalBalance : 0),
        deductionAmount: parseFloat(deductionAmount || "0"),
        notes: additionalNotes.trim() || `Checkout processed: ${checkoutReason.trim()}`
      };

      await onConfirm(checkoutData);
      
      // Reset form
      setCheckoutReason("");
      setAdditionalNotes("");
      setDeductionAmount("0");
      setRefundAmount("0");
      setClearRoom(true);
      setValidationErrors([]);
      
    } catch (error) {
      console.error('Checkout confirmation failed:', error);
      // Error handling is done by parent component
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    setCheckoutReason("");
    setAdditionalNotes("");
    setDeductionAmount("0");
    setRefundAmount("0");
    setClearRoom(true);
    setValidationErrors([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-[#1295D0]" />
            Confirm Student Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{student.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      Room {student.roomNumber}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {student.course}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600">
                  Active Student
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Balance:</span>
                    <span className={`font-medium ${student.currentBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      NPR {Math.abs(student.currentBalance).toLocaleString()}
                      {student.currentBalance >= 0 ? ' (Due)' : ' (Credit)'}
                    </span>
                  </div>
                  
                  {currentMonthBilling && currentMonthBilling.amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Partial Month Billing:</span>
                      <span className="font-medium text-orange-600">
                        NPR {currentMonthBilling.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deduction Amount:</span>
                    <span className="font-medium text-blue-600">
                      NPR {parseFloat(deductionAmount || "0").toLocaleString()}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Final Settlement:</span>
                    <span className={`text-lg ${finalBalance > 0 ? 'text-red-600' : finalBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      NPR {Math.abs(finalBalance).toLocaleString()}
                      {finalBalance > 0 ? ' (Outstanding)' : finalBalance < 0 ? ' (Refund)' : ' (Settled)'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Fee:</span>
                    <span className="font-medium">NPR {student.baseMonthlyFee.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Laundry Fee:</span>
                    <span className="font-medium">NPR {student.laundryFee.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Food Fee:</span>
                    <span className="font-medium">NPR {student.foodFee.toLocaleString()}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total Monthly:</span>
                    <span>NPR {(student.baseMonthlyFee + student.laundryFee + student.foodFee).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Checkout Form */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="font-semibold">Checkout Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkoutReason">Checkout Reason *</Label>
                  <Input
                    id="checkoutReason"
                    value={checkoutReason}
                    onChange={(e) => setCheckoutReason(e.target.value)}
                    placeholder="e.g., Course completion, Transfer, Personal reasons"
                    className={validationErrors.some(e => e.includes('reason')) ? 'border-red-500' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deductionAmount">Deduction Amount (NPR)</Label>
                  <Input
                    id="deductionAmount"
                    type="number"
                    min="0"
                    max={totalDueAmount}
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">Amount to deduct from dues (e.g., damages, penalties)</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional notes about the checkout process..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Checkout Impact Warning */}
          <Alert className={hasOutstandingDues ? "border-red-200 bg-red-50" : hasRefund ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Checkout Impact:</div>
                <ul className="space-y-1 text-sm">
                  <li>• Student status will be changed to "Inactive"</li>
                  <li>• Room {student.roomNumber} will be marked as available</li>
                  <li>• Monthly billing will be stopped</li>
                  {currentMonthBilling && currentMonthBilling.amount > 0 && (
                    <li>• Partial month billing (NPR {currentMonthBilling.amount.toLocaleString()}) will be added to ledger</li>
                  )}
                  {hasOutstandingDues && (
                    <li className="text-red-600 font-medium">• Outstanding dues of NPR {finalBalance.toLocaleString()} will remain in ledger</li>
                  )}
                  {hasRefund && (
                    <li className="text-green-600 font-medium">• Refund of NPR {Math.abs(finalBalance).toLocaleString()} will be processed</li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={handleConfirmCheckout}
              disabled={confirming || loading || !checkoutReason.trim()}
              className="bg-[#1295D0] hover:bg-[#1295D0]/90 flex-1"
            >
              {confirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Checkout...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Checkout
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={confirming || loading}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};