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

    // Calculate prorated refund on component mount
    useEffect(() => {
        const calculateRefund = () => {
            try {
                const checkoutDate = new Date().toISOString().split('T')[0];
                const refund = billingService.calculateCheckoutRefund(student, checkoutDate);
                setRefundCalculation(refund);
            } catch (error) {
                console.error('Error calculating refund:', error);
            }
        };

        calculateRefund();
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
            const checkoutData = {
                studentId: student.id,
                checkoutDate: new Date().toISOString().split('T')[0],
                reason: checkoutReason === "Other" ? customReason : checkoutReason,
                notes: notes.trim(),
                duesCleared,
                hadOutstandingDues: hasDues,
                outstandingAmount: hasDues ? student.currentBalance : 0,
                processedBy: "Admin", // In real app, get from auth context
                hitLedger: duesCleared // Only hit ledger if dues are cleared
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            onCheckoutComplete(student.id, checkoutData);

            toast({
                title: "Checkout Successful",
                description: `${student.name} has been checked out successfully. Room ${student.roomNumber} is now available.`,
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

                    {/* Prorated Refund Calculation */}
                    {refundCalculation && duesCleared && (
                        <Card className="border-[#1295D0]/30 bg-[#1295D0]/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg text-[#231F20]">
                                    <Calculator className="h-5 w-5 text-[#1295D0]" />
                                    Prorated Refund Calculation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Total Days in Month</p>
                                        <p className="font-semibold">{refundCalculation.totalDaysInMonth} days</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Checkout Day</p>
                                        <p className="font-semibold">Day {refundCalculation.checkoutDay}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Unused Days</p>
                                        <p className="font-semibold text-blue-600">{refundCalculation.remainingDays} days</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Daily Rate</p>
                                        <p className="font-semibold">NPR {refundCalculation.dailyRate}/day</p>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Prorated Refund Amount:</span>
                                        <span className="text-xl font-bold text-green-600">
                                            NPR {refundCalculation.refundAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    {refundCalculation.hasRefund ? (
                                        <p className="text-sm text-green-600 mt-1">
                                            ✅ Refund will be processed for unused days
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-600 mt-1">
                                            ℹ️ No refund applicable (checkout at month end)
                                        </p>
                                    )}
                                </div>

                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Monthly Billing System:</strong> All charges are calculated monthly.
                                        When checking out mid-month, unused days are refunded proportionally.
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