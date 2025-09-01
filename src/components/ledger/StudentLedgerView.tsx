
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/contexts/AppContext";
import { useLocation } from "react-router-dom";

interface LedgerEntry {
  id: string;
  date: string;
  type: 'invoice' | 'payment' | 'discount' | 'advance';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
}

export const StudentLedgerView = () => {
  const { state } = useAppContext();
  const location = useLocation();
  const [selectedStudent, setSelectedStudent] = useState("");

  // Handle URL parameters to auto-select student
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentParam = params.get('student');
    
    if (studentParam && state.students.find(s => s.id === studentParam)) {
      setSelectedStudent(studentParam);
    }
  }, [location.search, state.students]);

  const students = state.students;

  // Get real ledger data for selected student
  const selectedStudentData = selectedStudent ? state.students.find(s => s.id === selectedStudent) : null;
  
  // Generate dynamic ledger entries based on student data
  const generateLedgerEntries = (student: any): LedgerEntry[] => {
    if (!student) return [];
    
    const entries: LedgerEntry[] = [];
    let runningBalance = 0;
    
    // Enrollment entry
    entries.push({
      id: `${student.id}-enrollment`,
      date: student.enrollmentDate,
      type: "advance",
      description: "Student enrollment - Welcome to hostel",
      debit: 0,
      credit: 0,
      balance: 0,
      reference: `ENR-${student.id}`
    });
    
    // Generate monthly invoices (last 3 months)
    const monthlyFee = student.baseMonthlyFee + student.laundryFee + student.foodFee;
    const months = ['January', 'February', 'March'];
    
    months.forEach((month, index) => {
      const invoiceAmount = monthlyFee;
      runningBalance += invoiceAmount;
      
      entries.push({
        id: `${student.id}-invoice-${index}`,
        date: `2024-0${index + 1}-01`,
        type: "invoice",
        description: `${month} 2024 - Monthly charges (Base: ₨${student.baseMonthlyFee}, Laundry: ₨${student.laundryFee}, Food: ₨${student.foodFee})`,
        debit: invoiceAmount,
        credit: 0,
        balance: runningBalance,
        reference: `INV-2024-${String(index + 1).padStart(3, '0')}`
      });
    });
    
    // Add payments to match current balance
    const totalCharges = runningBalance;
    const currentDue = student.currentBalance || 0;
    const totalPaid = totalCharges - currentDue;
    
    if (totalPaid > 0) {
      runningBalance -= totalPaid;
      entries.push({
        id: `${student.id}-payment`,
        date: "2024-03-15",
        type: "payment",
        description: "Payment received - Multiple transactions",
        debit: 0,
        credit: totalPaid,
        balance: runningBalance,
        reference: `PAY-${student.id}`
      });
    }
    
    // Add advance if student has advance balance
    if (student.advanceBalance > 0) {
      runningBalance -= student.advanceBalance;
      entries.push({
        id: `${student.id}-advance`,
        date: "2024-01-10",
        type: "advance",
        description: "Advance payment received",
        debit: 0,
        credit: student.advanceBalance,
        balance: runningBalance,
        reference: `ADV-${student.id}`
      });
    }
    
    return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const ledgerEntries = generateLedgerEntries(selectedStudentData);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return '🧾';
      case 'payment': return '💰';
      case 'discount': return '🏷️';
      case 'advance': return '⬆️';
      default: return '📋';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'invoice':
        return <Badge className="bg-red-100 text-red-800">Invoice</Badge>;
      case 'payment':
        return <Badge className="bg-green-100 text-green-800">Payment</Badge>;
      case 'discount':
        return <Badge className="bg-blue-100 text-blue-800">Discount</Badge>;
      case 'advance':
        return <Badge className="bg-purple-100 text-purple-800">Advance</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const currentBalance = ledgerEntries[ledgerEntries.length - 1]?.balance || 0;
  const totalDebits = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">📋 Student Ledger View</h2>
        <div className="flex space-x-2">
          <Button variant="outline">🖨️ Print Ledger</Button>
          <Button variant="outline">📄 Download PDF</Button>
          <Button variant="outline">📊 Export Data</Button>
        </div>
      </div>

      {/* Student Selection with Enhanced Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>👤 Select Student</span>
            {selectedStudent && (
              <Badge variant="outline" className="text-green-600">
                Auto-selected from navigation
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search & Select Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose student to view ledger" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - Room {student.roomNumber} - {student.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Quick Filters</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const studentWithDues = students.find(s => s.currentBalance > 0);
                  if (studentWithDues) setSelectedStudent(studentWithDues.id);
                }}>
                  🔴 With Dues
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const paidStudent = students.find(s => s.currentBalance <= 0);
                  if (paidStudent) setSelectedStudent(paidStudent.id);
                }}>
                  🟢 Paid Up
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && selectedStudentData && (
        <>
          {/* Student Info Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedStudentData.name}</h3>
                    <p className="text-gray-600">Room {selectedStudentData.roomNumber} • {selectedStudentData.course}</p>
                    <p className="text-sm text-gray-500">Enrolled: {new Date(selectedStudentData.enrollmentDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                    ← Back to Students
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const params = new URLSearchParams(location.search);
                    params.set('section', 'payments');
                    params.set('student', selectedStudent);
                    window.location.href = `/ledger?${params.toString()}`;
                  }}>
                    💰 Record Payment
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const params = new URLSearchParams(location.search);
                    params.set('section', 'invoices');
                    params.set('student', selectedStudent);
                    window.location.href = `/ledger?${params.toString()}`;
                  }}>
                    🧾 Generate Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  ₨{Math.abs(currentBalance).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Current {currentBalance >= 0 ? 'Outstanding' : 'Advance'}
                </div>
                <div className="text-xs mt-1">
                  {currentBalance >= 0 ? '🔴 Amount Due' : '🟢 Credit Balance'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  ₨{totalDebits.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Charges</div>
                <div className="text-xs mt-1 text-red-600">📈 All invoices</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  ₨{totalCredits.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Payments</div>
                <div className="text-xs mt-1 text-green-600">💰 All credits</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">
                  {ledgerEntries.length}
                </div>
                <div className="text-sm text-gray-500">Total Transactions</div>
                <div className="text-xs mt-1 text-gray-600">📋 All entries</div>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                📊 Ledger for {students.find(s => s.id === selectedStudent)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit (₨)</TableHead>
                    <TableHead className="text-right">Credit (₨)</TableHead>
                    <TableHead className="text-right">Balance (₨)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id} className={entry.type === 'discount' ? 'bg-blue-50' : ''}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{getTypeIcon(entry.type)}</span>
                          {getTypeBadge(entry.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.description}
                        {entry.type === 'discount' && (
                          <div className="text-xs text-blue-600 mt-1">
                            Note: Discount records are view-only
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {entry.reference}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.debit > 0 && (
                          <span className="text-red-600 font-medium">
                            ₨{entry.debit.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.credit > 0 && (
                          <span className="text-green-600 font-medium">
                            ₨{entry.credit.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <span className={entry.balance >= 0 ? 'text-red-600' : 'text-green-600'}>
                          ₨{Math.abs(entry.balance).toLocaleString()}
                          {entry.balance >= 0 ? ' Dr' : ' Cr'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Running Balance Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Final Balance:</span>
                  <span className={`text-xl font-bold ${currentBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₨{Math.abs(currentBalance).toLocaleString()} {currentBalance >= 0 ? 'Outstanding' : 'Advance'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {currentBalance >= 0 
                    ? '🔴 Student has outstanding dues to pay'
                    : '🟢 Student has advance balance available'
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
