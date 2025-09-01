import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, User, Bed, DollarSign, Calendar, CreditCard, LogOut, CheckCircle } from "lucide-react";
import { monthlyInvoiceService } from "@/services/monthlyInvoiceService.js";
import { useLedger } from "@/hooks/useLedger";
import { checkoutApiService } from "@/services/checkoutApiService";
import { useStudents } from "@/hooks/useStudents";
import { Student as ApiStudent } from "@/types/api";

interface Student {
    id: string;
    name: string;
    phone: string;
    email: string;
    roomNumber: string;
    course: string;
    institution: string;
    baseMonthlyFee: number;
    laundryFee: number;
    foodFee: number;
    joinDate: string;
    status: string;
    isCheckedOut: boolean;
    checkoutDate: string | null;
    currentBalance: number;
    totalPaid: number;
    totalDue: number;
    lastPaymentDate: string;
    configurationDate?: string;
    additionalCharges?: any[];
}

interface LedgerEntry {
    id: string;
    studentId: string;
    date: string;
    type: string;
    description: string;
    referenceId: string | null;
    debit: number;
    credit: number;
    balance?: number;
    balanceType?: string;
    remark?: string;
}

interface CheckoutSettings {
    allowCheckoutWithoutPayment: boolean;
}

// Checkout Dialog Component
interface CheckoutDialogProps {
    student: Student;
    isOpen: boolean;
    onClose: () => void;
    onCheckoutComplete: (studentId: string) => void;
}

const CheckoutDialog = ({ student, isOpen, onClose, onCheckoutComplete }: CheckoutDialogProps) => {
    // Use real ledger API
    const {
        entries: ledgerEntries,
        studentBalance,
        entriesLoading,
        balanceLoading,
        fetchStudentLedger,
        fetchStudentBalance,
        createAdjustment
    } = useLedger();

    const [currentMonthBilling, setCurrentMonthBilling] = useState<any>(null);
    const [totalDueAmount, setTotalDueAmount] = useState(0);
    const [allowCheckoutWithoutPayment, setAllowCheckoutWithoutPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentRemark, setPaymentRemark] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && student) {
            loadCheckoutData();
        }
    }, [isOpen, student]);

    const loadCheckoutData = async () => {
        try {
            setLoading(true);

            // Load real ledger data using the API
            await fetchStudentLedger(student.id);
            await fetchStudentBalance(student.id);

            // Calculate current month's partial billing
            const today = new Date().toISOString().split('T')[0];
            const monthlyFee = student.baseMonthlyFee + student.laundryFee + student.foodFee;

            const currentMonthProration = monthlyInvoiceService.calculateCheckoutProration(monthlyFee, today);
            setCurrentMonthBilling(currentMonthProration);

            // Use real balance from API
            const currentBalance = studentBalance?.currentBalance || 0;

            // Total due = existing balance + current month's partial amount
            const totalDue = currentBalance + currentMonthProration.amount;
            setTotalDueAmount(Math.max(0, totalDue));
            setPaymentAmount(Math.max(0, totalDue).toString());

        } catch (error) {
            console.error('Error loading checkout data:', error);
            toast.error('Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    const bookPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error('Please enter a valid payment amount');
            return;
        }

        try {
            const amount = parseFloat(paymentAmount);
            const description = paymentRemark || "Payment booked during checkout";

            // Create credit adjustment for the payment
            await createAdjustment({
                studentId: student.id,
                amount: amount,
                description: description,
                type: 'credit'
            });

            // Refresh ledger data to show the new payment
            await fetchStudentLedger(student.id);
            await fetchStudentBalance(student.id);

            // Recalculate total due with updated balance
            const updatedBalance = studentBalance?.currentBalance || 0;
            const newTotalDue = updatedBalance + (currentMonthBilling?.amount || 0);
            setTotalDueAmount(Math.max(0, newTotalDue));

            // Clear payment form
            setPaymentAmount(Math.max(0, newTotalDue).toString());
            setPaymentRemark("");

            toast.success(`Payment of NPR ${amount.toLocaleString()} booked successfully and added to ledger`);

        } catch (error) {
            console.error('Error booking payment:', error);
            toast.error('Failed to book payment');
        }
    };

    const processCheckout = async () => {
        try {
            const checkoutDate = new Date().toISOString().split('T')[0];
            const hasDues = totalDueAmount > 0;

            if (hasDues && !allowCheckoutWithoutPayment) {
                toast.error('Cannot checkout with outstanding dues. Please book payment first or enable "Allow Checkout Without Payment"');
                return;
            }

            // 1. Add partial month billing to ledger if needed
            if (currentMonthBilling && currentMonthBilling.amount > 0) {
                try {
                    await createAdjustment({
                        studentId: student.id,
                        amount: currentMonthBilling.amount,
                        description: `Partial month billing (${currentMonthBilling.daysCharged} days) - Checkout till ${checkoutDate}`,
                        type: 'debit'
                    });
                    console.log('✅ Partial billing added to ledger');
                } catch (error) {
                    console.error('Error adding partial billing to ledger:', error);
                }
            }

            // 2. Process checkout through REAL API
            const checkoutRequest = {
                checkoutDate: checkoutDate,
                clearRoom: true,
                refundAmount: totalDueAmount < 0 ? Math.abs(totalDueAmount) : 0,
                deductionAmount: 0,
                notes: `Checkout processed with ${hasDues ? 'outstanding dues' : 'cleared dues'}. Partial month billing: NPR ${currentMonthBilling?.amount || 0}`,
                processedBy: "Admin"
            };

            console.log('🚪 Processing checkout via API:', checkoutRequest);
            const checkoutResult = await checkoutApiService.processCheckout(student.id, checkoutRequest);
            console.log('✅ Checkout API response:', checkoutResult);

            // 3. Complete checkout
            onCheckoutComplete(student.id);
            onClose();

            // 4. Show success message
            if (hasDues) {
                toast.warning(
                    `⚠️ Student checked out with dues of NPR ${totalDueAmount.toLocaleString()}. 
                    • Final settlement: NPR ${checkoutResult.netSettlement}
                    • Room cleared and made available
                    • Student status updated to inactive`,
                    { duration: 8000 }
                );
            } else {
                toast.success(
                    `✅ Student checked out successfully! 
                    • Final settlement: NPR ${checkoutResult.netSettlement}
                    • Room cleared and made available
                    • Monthly invoices stopped`,
                    { duration: 6000 }
                );
            }

        } catch (error) {
            console.error('Error processing checkout:', error);
            toast.error('Failed to process checkout. Please try again.');
        }
    };

    if (loading || entriesLoading || balanceLoading) {
        return (
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <svg width="32" height="48" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse mx-auto">
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
                        <p className="text-gray-600">Loading checkout data...</p>
                    </div>
                </div>
            </DialogContent>
        );
    }

    return (
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-[#1295D0]" />
                    Checkout - {student.name}
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold">{student.name}</h3>
                            <p className="text-sm text-gray-600">{student.roomNumber} • {student.course}</p>
                        </div>
                    </div>
                </div>

                {/* Existing Ledger */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Existing Ledger
                            </div>
                            <Badge variant="outline" className="text-blue-600">
                                {ledgerEntries.length} Entries
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {ledgerEntries.length > 0 ? (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {ledgerEntries.map((entry, index) => (
                                    <div key={entry.id} className={`p-4 rounded-lg border-l-4 ${entry.type === 'Invoice' ? 'bg-red-50 border-red-400' :
                                        entry.type === 'Payment' ? 'bg-green-50 border-green-400' :
                                            'bg-blue-50 border-blue-400'
                                        }`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant={entry.type === 'Invoice' ? 'destructive' : entry.type === 'Payment' ? 'default' : 'secondary'} className="text-xs">
                                                        {entry.type}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">#{entry.id}</span>
                                                </div>
                                                <p className="font-medium text-gray-900">{entry.description}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    📅 {new Date(entry.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                    {entry.referenceId && (
                                                        <span className="ml-2">📄 Ref: {entry.referenceId}</span>
                                                    )}
                                                </p>
                                                {entry.remark && (
                                                    <p className="text-xs text-gray-500 mt-1 italic">💬 {entry.remark}</p>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                {entry.debit > 0 && (
                                                    <div className="text-red-600">
                                                        <p className="font-bold text-lg">NPR {entry.debit.toLocaleString()}</p>
                                                        <p className="text-xs">Debit</p>
                                                    </div>
                                                )}
                                                {entry.credit > 0 && (
                                                    <div className="text-green-600">
                                                        <p className="font-bold text-lg">NPR {entry.credit.toLocaleString()}</p>
                                                        <p className="text-xs">Credit</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Ledger Summary */}
                                <div className="mt-4 p-4 bg-gray-100 rounded-lg border-t-4 border-gray-400">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Ledger Balance:</span>
                                        <span className={`font-bold text-lg ${ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0) > 0
                                            ? 'text-red-600'
                                            : 'text-green-600'
                                            }`}>
                                            NPR {Math.abs(ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0)).toLocaleString()}
                                            {ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0) > 0 ? ' (Due)' : ' (Credit)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No ledger entries found</p>
                                <p className="text-sm text-gray-400">This student has no transaction history</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current Month's Partial Billing */}
                {currentMonthBilling && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Current Month's Billing (Till Today)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Period:</span>
                                        <span className="font-medium">{currentMonthBilling.period}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Days Charged:</span>
                                        <span className="font-medium">{currentMonthBilling.daysCharged} of {currentMonthBilling.daysInMonth} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Daily Rate:</span>
                                        <span className="font-medium">NPR {currentMonthBilling.dailyRate.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="font-bold">Partial Amount:</span>
                                        <span className="font-bold text-orange-600">NPR {currentMonthBilling.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Total Due Amount */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Total Due Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex justify-between items-center">
                                <span className="text-red-800 font-medium">Total Amount Due:</span>
                                <span className="text-3xl font-bold text-red-900">
                                    NPR {totalDueAmount.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-red-600 mt-2">
                                Ledger Balance + Current Month's Partial Billing
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Checkout Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Checkout Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <Label className="text-base font-medium">Allow Checkout Without Payment</Label>
                                <p className="text-sm text-gray-500">
                                    If enabled, student can checkout with dues (will be added to ledger)
                                </p>
                            </div>
                            <Switch
                                checked={allowCheckoutWithoutPayment}
                                onCheckedChange={setAllowCheckoutWithoutPayment}
                            />
                        </div>

                        {/* Book Payment Section */}
                        {totalDueAmount > 0 && !allowCheckoutWithoutPayment && (
                            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-900">Book Payment</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentAmount">Payment Amount (NPR)</Label>
                                        <Input
                                            id="paymentAmount"
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            placeholder="Enter payment amount"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentRemark">Payment Remark (Optional)</Label>
                                        <Input
                                            id="paymentRemark"
                                            value={paymentRemark}
                                            onChange={(e) => setPaymentRemark(e.target.value)}
                                            placeholder="Payment remark"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={bookPayment}
                                    className="w-full bg-[#07A64F] hover:bg-[#07A64F]/90"
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Book Payment
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                    <Button
                        onClick={processCheckout}
                        disabled={totalDueAmount > 0 && !allowCheckoutWithoutPayment}
                        className="bg-[#1295D0] hover:bg-[#1295D0]/90 flex-1"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Complete Checkout
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
};

// Updated: 2025-01-08 - API Integration with real Students API
export const StudentCheckoutManagement = () => {
    console.log('🔄 StudentCheckoutManagement component loaded with API integration');

    // Use real Students API
    const {
        students: apiStudents,
        loading: studentsLoading,
        error: studentsError,
        refreshData
    } = useStudents();

    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

    // Transform API students to local Student format and filter active students
    const transformedStudents: Student[] = useMemo(() => {
        console.log('🔍 Raw API Students:', apiStudents.length, 'students');
        console.log('🔍 Students with isCheckedOut=true:', apiStudents.filter(s => s.isCheckedOut).length);
        console.log('🔍 Students with isCheckedOut=false:', apiStudents.filter(s => !s.isCheckedOut).length);

        return apiStudents
            .filter(student => {
                const isActive = !student.isCheckedOut;
                console.log(`🔍 Student ${student.name} (${student.id}): isCheckedOut=${student.isCheckedOut}, showing=${isActive}`);
                return isActive;
            }) // Only active students
            .map((student, index) => ({
                ...student,
                // Map API fields to local interface
                address: student.address || '',
                roomNumber: student.roomNumber || '',
                course: student.course || '',
                institution: student.institution || '',
                guardianName: student.guardianName || '',
                guardianPhone: student.guardianPhone || '',
                emergencyContact: student.emergencyContact || student.guardianPhone || '',
                baseMonthlyFee: student.baseMonthlyFee || 0,
                laundryFee: student.laundryFee || 0,
                foodFee: student.foodFee || 0,
                joinDate: student.joinDate || new Date().toISOString().split('T')[0],
                status: student.status || 'Active',
                isCheckedOut: student.isCheckedOut || false,
                checkoutDate: student.checkoutDate || null,
                // Additional local properties for checkout
                currentBalance: student.balance || 0,
                totalPaid: 0,
                totalDue: student.baseMonthlyFee || 0,
                lastPaymentDate: '',
                configurationDate: student.createdAt || new Date().toISOString(),
                additionalCharges: []
            }));
    }, [apiStudents]);

    // Update filtered students when transformed students change
    useEffect(() => {
        if (!searchTerm) {
            setFilteredStudents(transformedStudents);
        } else {
            const filtered = transformedStudents.filter(student =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStudents(filtered);
        }
    }, [searchTerm, transformedStudents]);

    const handleCheckoutClick = (student: Student) => {
        setSelectedStudent(student);
        setShowCheckoutDialog(true);
    };

    const handleCheckoutComplete = async (studentId: string) => {
        console.log(`✅ Student ${studentId} checkout completed - refreshing data from API`);

        // Immediately remove the student from local state to provide instant feedback
        setFilteredStudents(prev => {
            const updated = prev.filter(student => student.id !== studentId);
            console.log(`🔄 Removed student ${studentId} from local state. Remaining: ${updated.length} students`);
            return updated;
        });
        setSelectedStudent(null);

        // Show immediate success message
        toast.success('Student checkout completed successfully!');

        // Refresh data from API with multiple attempts to ensure consistency
        const refreshWithRetry = async (attempt = 1, maxAttempts = 3) => {
            try {
                console.log(`🔄 Refreshing data from API (attempt ${attempt}/${maxAttempts})...`);
                await refreshData();

                // Verify the student is actually marked as checked out
                const updatedStudents = apiStudents.find(s => s.id === studentId);
                if (updatedStudents && !updatedStudents.isCheckedOut) {
                    console.warn(`⚠️ Student ${studentId} still shows as active after checkout. Retrying...`);
                    if (attempt < maxAttempts) {
                        // Wait a bit longer and try again
                        setTimeout(() => refreshWithRetry(attempt + 1, maxAttempts), 2000);
                        return;
                    }
                }

                console.log('✅ Student data refreshed from API after checkout');
            } catch (error) {
                console.error(`❌ Error refreshing student data after checkout (attempt ${attempt}):`, error);
                if (attempt < maxAttempts) {
                    setTimeout(() => refreshWithRetry(attempt + 1, maxAttempts), 1000);
                } else {
                    console.error('❌ Failed to refresh data after all attempts');
                }
            }
        };

        // Start the refresh process with a small delay to allow backend processing
        setTimeout(() => refreshWithRetry(), 500);
    };

    if (studentsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <svg width="32" height="48" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse mx-auto">
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
                    <p className="text-gray-600">Loading students...</p>
                </div>
            </div>
        );
    }

    if (studentsError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                    <div className="text-red-500">
                        <User className="h-12 w-12 mx-auto mb-3" />
                        <p className="font-medium">Error loading students</p>
                        <p className="text-sm text-gray-500">{studentsError}</p>
                    </div>
                    <Button onClick={refreshData} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Student Checkout Management</h2>
                    <p className="text-gray-600">Process student checkouts and manage departures</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-blue-600">
                        {filteredStudents.length} Active Students
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            console.log('🔄 Manual refresh triggered');
                            refreshData();
                        }}
                        disabled={studentsLoading}
                        className="flex items-center gap-2"
                    >
                        <svg
                            className={`h-4 w-4 ${studentsLoading ? 'animate-spin' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Search by name, ID, or room number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Students Found</h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'No students match your search criteria.' : 'All students have been checked out.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                        <Card key={student.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{student.name}</CardTitle>
                                        <p className="text-sm text-gray-500">ID: {student.id}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Bed className="h-4 w-4 text-gray-400" />
                                    <span>Room {student.roomNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span>{student.course}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                    <span>NPR {(student.baseMonthlyFee + student.laundryFee + student.foodFee).toLocaleString()}/month</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>Joined: {new Date(student.joinDate).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-3 border-t">
                                    <Button
                                        onClick={() => handleCheckoutClick(student)}
                                        className="w-full bg-[#1295D0] hover:bg-[#1295D0]/90"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Process Checkout
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Checkout Dialog */}
            {selectedStudent && (
                <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
                    <CheckoutDialog
                        student={selectedStudent}
                        isOpen={showCheckoutDialog}
                        onClose={() => {
                            setShowCheckoutDialog(false);
                            setSelectedStudent(null);
                        }}
                        onCheckoutComplete={handleCheckoutComplete}
                    />
                </Dialog>
            )}
        </div>
    );
};