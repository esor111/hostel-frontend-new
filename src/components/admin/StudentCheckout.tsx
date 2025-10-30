import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, User, DollarSign, FileText, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { billingService } from "@/services/billingService";
import { checkoutApiService } from "@/services/checkoutApiService";

interface Student {
    id: string;
    name: string;
    phone: string;
    roomNumber: string;
    currentBalance: number;
    status: string;
}

interface StudentCheckoutProps {
    student: Student;
    onCheckoutComplete: (studentId: string, checkoutData: any) => void;
    onClose: () => void;
}

export const StudentCheckout = ({ student, onCheckoutComplete, onClose }: StudentCheckoutProps) => {
    const [checkoutReason, setCheckoutReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [notes, setNotes] = useState("");
    const [duesCleared, setDuesCleared] = useState(student.currentBalance <= 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [refundCalculation, setRefundCalculation] = useState(null);
    const { toast } = useToast();

    // 🏨 NEW: Calculate accurate settlement using Nepalese billing system
    useEffect(() => {
        const calculateAccurateSettlement = async () => {
            try {
                const checkoutDate = new Date().toISOString().split('T')[0];
                // Use the new accurate settlement calculation
                const settlement = await checkoutApiService.calculateAccurateSettlement(student.id, checkoutDate);
                setRefundCalculation(settlement);
            } catch (error) {
                console.error('Error calculating accurate settlement:', error);
                // Fallback to basic calculation if API fails
                setRefundCalculation({
                    refundDue: 0,
                    additionalDue: Math.max(0, student.currentBalance),
                    actualUsage: 0,
                    totalPaid: 0,
                    totalDaysStayed: 0
                });
            }
        };

        calculateAccurateSettlement();
    }, [student]);

    const hasDues = student.currentBalance > 0;
    const canCheckout = !hasDues || duesCleared;

    const checkoutReasons = [
        "Course Completed",
        "Transferred to Another Institution",
        "Personal/Family Reasons",
        "Financial Constraints",
        "Disciplinary Action",
        "Medical Reasons",
        "Job/Internship",
        "Other"
    ];

    const handleCheckout = async () => {
        // Validation
        if (!checkoutReason) {
            toast({
                title: "Missing Information",
                description: "Please select a reason for checkout",
                variant: "destructive"
            });
            return;
        }

        if (checkoutReason === "Other" && !customReason.trim()) {
            toast({
                title: "Missing Information",
                description: "Please specify the custom reason",
                variant: "destructive"
            });
            return;
        }

        if (hasDues && !duesCleared) {
            toast({
                title: "Cannot Checkout",
                description: "Please clear all dues before checkout or mark them as cleared",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);

        try {
            const checkoutRequest = {
                checkoutDate: new Date().toISOString().split('T')[0],
                clearRoom: true,
                refundAmount: refundCalculation?.refundDue || 0,
                deductionAmount: refundCalculation?.additionalDue || 0,
                notes: `${checkoutReason === "Other" ? customReason : checkoutReason}. ${notes.trim()}`,
                processedBy: "Admin"
            };

            // 🏨 NEW: Use Nepalese billing system for checkout
            const checkoutResult = await checkoutApiService.processCheckoutWithSettlement(student.id, checkoutRequest);

            const checkoutData = {
                studentId: student.id,
                checkoutDate: checkoutRequest.checkoutDate,
                reason: checkoutReason === "Other" ? customReason : checkoutReason,
                notes: notes.trim(),
                duesCleared,
                hadOutstandingDues: hasDues,
                outstandingAmount: hasDues ? student.currentBalance : 0,
                processedBy: "Admin",
                settlementResult: checkoutResult
            };

            onCheckoutComplete(student.id, checkoutData);

            toast({
                title: "Nepalese Billing Checkout Successful",
                description: `${student.name} has been checked out with accurate settlement. Final settlement: NPR ${checkoutResult.netSettlement}. Room ${student.roomNumber} is now available.`,
            });

            onClose();
        } catch (error) {
            toast({
                title: "Checkout Failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBookPaymentLater = () => {
        toast({
            title: "Payment Booking",
            description: "Student can pay dues later. Checkout will be processed without hitting ledger.",
        });
        setDuesCleared(true);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[#231F20]">
                            <User className="h-5 w-5 text-[#1295D0]" />
                            Student Checkout
                        </span>
                        <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100">✕</Button>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Student Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <p className="text-gray-600">Room: {student.roomNumber}</p>
                        <p className="text-gray-600">Phone: {student.phone}</p>
                        <p className="text-gray-600">ID: {student.id}</p>
                    </div>

                    {/* Dues Information */}
                    <Card className={hasDues ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className={`h-5 w-5 ${hasDues ? "text-red-600" : "text-green-600"}`} />
                                    <span className="font-medium">Outstanding Dues</span>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${hasDues ? "text-red-600" : "text-green-600"}`}>
                                        NPR {student.currentBalance.toLocaleString()}
                                    </div>
                                    <Badge variant={hasDues ? "destructive" : "default"}>
                                        {hasDues ? "Dues Pending" : "All Clear"}
                                    </Badge>
                                </div>
                            </div>

                            {hasDues && (
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span>Mark dues as cleared:</span>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={duesCleared}
                                                onCheckedChange={setDuesCleared}
                                            />
                                            {duesCleared ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                            )}
                                        </div>
                                    </div>

                                    {!duesCleared && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBookPaymentLater}
                                            className="w-full"
                                        >
                                            📅 Book Payment for Later
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 🏨 NEW: Nepalese Billing Settlement Calculation */}
                    {refundCalculation && (
                        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                                    <Calculator className="h-5 w-5 text-blue-600" />
                                    Nepalese Billing Settlement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Total Days Stayed</p>
                                        <p className="font-semibold">{refundCalculation.totalDaysStayed || 0} days</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Actual Usage Amount</p>
                                        <p className="font-semibold">NPR {refundCalculation.actualUsage?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Total Paid (Including Advance)</p>
                                        <p className="font-semibold text-blue-600">NPR {refundCalculation.totalPaid?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Settlement Status</p>
                                        <p className={`font-semibold ${
                                            refundCalculation.refundDue > 0 ? 'text-green-600' : 
                                            refundCalculation.additionalDue > 0 ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {refundCalculation.refundDue > 0 ? 'Refund Due' : 
                                             refundCalculation.additionalDue > 0 ? 'Additional Due' : 'Settled'}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Final Settlement:</span>
                                        <span className={`text-xl font-bold ${
                                            refundCalculation.refundDue > 0 ? 'text-green-600' : 
                                            refundCalculation.additionalDue > 0 ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {refundCalculation.refundDue > 0 && `NPR ${refundCalculation.refundDue.toLocaleString()} (Refund)`}
                                            {refundCalculation.additionalDue > 0 && `NPR ${refundCalculation.additionalDue.toLocaleString()} (Due)`}
                                            {!refundCalculation.refundDue && !refundCalculation.additionalDue && 'NPR 0 (Settled)'}
                                        </span>
                                    </div>
                                    {refundCalculation.refundDue > 0 ? (
                                        <p className="text-sm text-green-600 mt-1">
                                            ✅ Refund will be processed based on advance payments vs actual usage
                                        </p>
                                    ) : refundCalculation.additionalDue > 0 ? (
                                        <p className="text-sm text-red-600 mt-1">
                                            ⚠️ Additional payment required for actual usage
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-600 mt-1">
                                            ✅ Account fully settled - no refund or additional payment needed
                                        </p>
                                    )}
                                </div>

                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Nepalese Billing System:</strong> Settlement is calculated based on actual days stayed vs total payments made (including advance payments). This ensures fair and accurate billing.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Checkout Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Reason for Checkout *
                        </label>
                        <Select value={checkoutReason} onValueChange={setCheckoutReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select checkout reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {checkoutReasons.map((reason) => (
                                    <SelectItem key={reason} value={reason}>
                                        {reason}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {checkoutReason === "Other" && (
                            <Input
                                placeholder="Please specify the reason"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="mt-2"
                            />
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Additional Notes</label>
                        <Textarea
                            placeholder="Any additional notes about the checkout (optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Checkout Status */}
                    <div className={`p-4 rounded-lg border-2 ${canCheckout ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                        <div className="flex items-center gap-2">
                            {canCheckout ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className="font-medium">
                                {canCheckout ? "Ready for Checkout" : "Cannot Checkout"}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            {canCheckout
                                ? `${duesCleared ? "Will hit ledger" : "Will NOT hit ledger"} • Room ${student.roomNumber} will be marked as empty`
                                : "Please clear dues or mark them as cleared to proceed"
                            }
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCheckout}
                            disabled={!canCheckout || isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? "Processing..." : "Complete Checkout"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};