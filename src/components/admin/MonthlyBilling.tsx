import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/SafeAppContext';
import { automatedBillingApiService } from '@/services/automatedBillingApiService';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Zap,
  Calculator
} from 'lucide-react';

const MonthlyBillingComponent = () => {
  const { state, refreshAllData } = useAppContext();
  const { toast } = useToast();
  
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [billingResults, setBillingResults] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [refundCalculation, setRefundCalculation] = useState(null);
  const [billingStats, setBillingStats] = useState(null);
  const [studentsReady, setStudentsReady] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = ['2024', '2025', '2026'];

  // 🏨 NEW: Smart Default Month Logic for Nepalese Billing
  const getSmartDefaultMonth = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    
    // Default to NEXT month for billing (upcoming month that needs billing)
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    return {
      monthIndex: nextMonth,
      monthName: months[nextMonth],
      year: nextYear,
      explanation: `Auto-selected ${months[nextMonth]} ${nextYear} as the next month that needs billing`
    };
  };

  // Get current smart default for display
  const currentSmartDefault = getSmartDefaultMonth();

  useEffect(() => {
    // 🏨 NEW: Set smart default month (next month that needs billing)
    const smartDefault = getSmartDefaultMonth();
    setSelectedMonth(smartDefault.monthName);
    setSelectedYear(smartDefault.year.toString());
    setCheckoutDate(new Date().toISOString().split('T')[0]);
    
    // Load billing data
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const [stats, students] = await Promise.all([
        automatedBillingApiService.getBillingStats(),
        automatedBillingApiService.getStudentsReadyForBilling()
      ]);
      
      setBillingStats(stats);
      setStudentsReady(students);
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
  };

  const handleGenerateMonthlyBills = async () => {
    if (!selectedMonth || !selectedYear) {
      toast({
        title: 'Missing Information',
        description: 'Please select both month and year',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const monthIndex = months.indexOf(selectedMonth);
      
      // 🏨 NEW: Use Nepalese billing system (skips advance payment months)
      const result = await automatedBillingApiService.generateNepalesesMonthlyInvoices({
        month: monthIndex,
        year: parseInt(selectedYear),
        dueDate: new Date(parseInt(selectedYear), monthIndex, 10).toISOString().split('T')[0] // 10th of the month
      });

      setBillingResults(result);

      // 🏨 NEW: Enhanced success message for Nepalese billing
      toast({
        title: 'Nepalese Monthly Billing Complete',
        description: `Generated ${result.generated} invoices successfully. Skipped ${result.skipped || 0} advance payment months. Total: NPR ${result.totalAmount.toLocaleString()}`,
      });

      if (result.failed > 0) {
        toast({
          title: 'Some Invoices Failed',
          description: `${result.failed} invoices failed to generate`,
          variant: 'destructive'
        });
      }

      // Show advance payment information if students were skipped
      if (result.skipped > 0) {
        toast({
          title: 'Advance Payments Detected',
          description: `${result.skipped} students skipped - their advance payments cover this month`,
          variant: 'default'
        });
      }

      // Refresh billing data
      await loadBillingData();
      await refreshAllData();

    } catch (error) {
      toast({
        title: 'Nepalese Billing Generation Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCalculateRefund = async () => {
    if (!selectedStudent || !checkoutDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select student and checkout date',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Get student details to calculate monthly fee
      const student = activeStudents.find(s => s.id === selectedStudent);
      if (!student) {
        throw new Error('Student not found');
      }

      const monthlyFee = (student.baseMonthlyFee || 0) + (student.laundryFee || 0) + (student.foodFee || 0);
      const refund = automatedBillingApiService.calculateCheckoutRefund(monthlyFee, checkoutDate);
      setRefundCalculation(refund);

      if (refund.refundAmount > 0) {
        toast({
          title: 'Refund Calculated',
          description: `Refund amount: NPR ${refund.refundAmount} for ${refund.unusedDays} unused days`,
        });
      } else {
        toast({
          title: 'No Refund',
          description: refund.message,
        });
      }

    } catch (error) {
      toast({
        title: 'Calculation Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const calculateProratedExample = (monthlyAmount: number, day: number) => {
    const today = new Date();
    const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = totalDaysInMonth - day + 1;
    const proratedAmount = Math.round((monthlyAmount * remainingDays) / totalDaysInMonth);
    
    return {
      totalDaysInMonth,
      remainingDays,
      proratedAmount,
      isProrated: remainingDays < totalDaysInMonth
    };
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const activeStudents = state.students.filter(s => s.status === 'Active');
  const totalMonthlyRevenue = studentsReady.reduce((sum, student) => sum + (student.monthlyTotal || 0), 0) || 
    activeStudents.reduce((sum, student) => {
      return sum + (student.baseMonthlyFee || 15000) + (student.laundryFee || 1500) + (student.foodFee || 4500);
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">📅 Nepalese Monthly Billing System</h2>
          <p className="text-gray-600 mt-1">Automated monthly billing with advance payment system</p>
        </div>
      </div>

      {/* 🏨 NEW: Smart Default Month Display */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white p-3 rounded-full">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900">
                  Billing for {selectedMonth} {selectedYear}
                </h3>
                <p className="text-blue-700 text-sm">
                  {currentSmartDefault.explanation}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Auto-Selected</p>
                <p className="text-xs text-blue-500">Smart Default Logic</p>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-blue-100 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📋 Billing Logic:</strong> Students with advance payment for {selectedMonth} {selectedYear} will be automatically skipped. 
              All other active students will receive full month invoices.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Active Students</p>
                <p className="text-2xl font-bold text-blue-700">{activeStudents.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-700">NPR {totalMonthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Next Billing</p>
                <p className="text-lg font-bold text-purple-700">1st {selectedMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Avg per Student</p>
                <p className="text-2xl font-bold text-orange-700">
                  NPR {activeStudents.length > 0 ? Math.round(totalMonthlyRevenue / activeStudents.length).toLocaleString() : '0'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bill Generation */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Generate Monthly Bills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Billing Preview:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• {activeStudents.length} active students will be billed</li>
                    <li>• Total amount: NPR {totalMonthlyRevenue.toLocaleString()}</li>
                    <li>• Due date: 10th of {selectedMonth}</li>
                    <li>• Prorated billing for mid-month enrollments</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleGenerateMonthlyBills}
              disabled={isGenerating || !selectedMonth || !selectedYear}
              className="w-full"
            >
              {isGenerating ? 'Generating Bills...' : `Generate ${selectedMonth} ${selectedYear} Bills`}
            </Button>

            {billingResults && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Billing Complete</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>✅ Generated: {billingResults.generated} invoices</p>
                  {billingResults.failed > 0 && (
                    <p>❌ Failed: {billingResults.failed} invoices</p>
                  )}
                  <p>💰 Total Amount: NPR {billingResults.totalAmount.toLocaleString()}</p>
                  {billingResults.errors && billingResults.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-600">View Errors</summary>
                      <div className="mt-1 text-xs text-red-600">
                        {billingResults.errors.map((error, index) => (
                          <p key={index}>• {error.studentName}: {error.error}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checkout Refund Calculator */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Early Checkout Refund Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose student" />
                </SelectTrigger>
                <SelectContent>
                  {activeStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - Room {student.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Checkout Date</label>
              <input
                type="date"
                value={checkoutDate}
                onChange={(e) => setCheckoutDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button 
              onClick={handleCalculateRefund}
              disabled={!selectedStudent || !checkoutDate}
              className="w-full"
            >
              Calculate Refund
            </Button>

            {refundCalculation && (
              <div className={`p-4 rounded-lg border ${
                refundCalculation.refundAmount > 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Days Used:</span>
                    <span className="font-medium">{refundCalculation.daysUsed} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unused Days:</span>
                    <span className="font-medium">{refundCalculation.unusedDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Rate:</span>
                    <span className="font-medium">NPR {refundCalculation.dailyRate}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Refund Amount:</span>
                    <span className={`font-bold text-lg ${
                      refundCalculation.refundAmount > 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      NPR {refundCalculation.refundAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{refundCalculation.message}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🏨 NEW: Nepalese Advance Payment System Examples */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Nepalese Advance Payment System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-green-800 mb-3">🏨 How Nepalese Billing Works:</h4>
            <p className="text-sm text-green-700 mb-3">
              Students pay full month advance on joining. Monthly billing skips advance payment months and bills subsequent months at full amount.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { day: 1, fee: 15000, scenario: 'Month Start' },
              { day: 15, fee: 15000, scenario: 'Mid Month' },
              { day: 25, fee: 15000, scenario: 'Month End' }
            ].map(({ day, fee, scenario }) => {
              const enrollmentMonth = new Date(2025, 0, day).toLocaleDateString('en-US', { month: 'long' });
              return (
                <div key={day} className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="font-medium text-gray-800 mb-2">
                    Enrolled on {day}{getOrdinalSuffix(day)} January ({scenario})
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-green-50 p-2 rounded">
                      <div className="font-medium text-green-800">Advance Payment:</div>
                      <div className="text-green-700">NPR {fee.toLocaleString()} for full {enrollmentMonth}</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="font-medium text-blue-800">February Billing:</div>
                      <div className="text-blue-700">NPR {fee.toLocaleString()} (full month)</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="font-medium text-purple-800">March Billing:</div>
                      <div className="text-purple-700">NPR {fee.toLocaleString()} (full month)</div>
                    </div>
                    <Badge className="bg-green-600 text-white text-xs">
                      Advance Payment System
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Key Benefits:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Clear payment expectations - students know exactly when to pay</li>
              <li>• No confusing prorated amounts during stay</li>
              <li>• Fair checkout settlements based on actual usage</li>
              <li>• Matches traditional Nepalese hostel practices</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyBillingComponent;