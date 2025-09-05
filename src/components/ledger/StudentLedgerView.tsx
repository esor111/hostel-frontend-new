
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useLedger } from "@/hooks/useLedger";
import { Student as ApiStudent, LedgerEntry } from "@/types/api";
import { useLocation } from "react-router-dom";
import { LedgerFilters, LedgerFilterOptions } from "@/components/ledger/LedgerFilters";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

// LedgerEntry interface is now imported from @/types/api

export const StudentLedgerView = () => {
  // Use real Students API
  const { 
    students: apiStudents, 
    loading: studentsLoading, 
    error: studentsError,
    refreshData: refreshStudents
  } = useStudents();
  
  // Use real Ledger API
  const {
    entries: ledgerEntries,
    studentBalance,
    entriesLoading,
    balanceLoading,
    entriesError,
    balanceError,
    fetchStudentLedger,
    fetchStudentBalance,
    refreshData: refreshLedger,
    getFormattedBalance,
    getBalanceTypeColor,
    getEntryTypeIcon
  } = useLedger();
  
  const location = useLocation();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<LedgerFilterOptions>({});
  const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([]);

  // Transform API students to local format and filter configured students only
  const allStudents = (apiStudents || []).map(student => ({
    ...student,
    // Ensure id is always a string
    id: String(student.id || ''),
    // Map API fields to local interface
    name: String(student.name || ''),
    address: String(student.address || ''),
    roomNumber: String(student.roomNumber || ''),
    course: String(student.course || ''),
    institution: String(student.institution || ''),
    guardianName: String(student.guardianName || ''),
    guardianPhone: String(student.guardianPhone || ''),
    emergencyContact: String(student.emergencyContact || student.guardianPhone || ''),
    baseMonthlyFee: Number(student.baseMonthlyFee || 0),
    laundryFee: Number(student.laundryFee || 0),
    foodFee: Number(student.foodFee || 0),
    joinDate: String(student.joinDate || new Date().toISOString().split('T')[0]),
    enrollmentDate: String(student.createdAt || new Date().toISOString().split('T')[0]),
    status: String(student.status || 'Active'),
    isCheckedOut: Boolean(student.isCheckedOut || false),
    checkoutDate: student.checkoutDate || null,
    currentBalance: Number(student.balance || 0),
    advanceBalance: 0, // Default advance balance
    totalPaid: 0,
    totalDue: Number(student.baseMonthlyFee || 0),
    lastPaymentDate: '',
    configurationDate: String(student.createdAt || new Date().toISOString()),
    additionalCharges: []
  }));

  // Filter only configured students (students with baseMonthlyFee > 0 or configurationDate)
  const allConfiguredStudents = allStudents.filter(student => {
    const isConfigured = student.baseMonthlyFee > 0 || student.configurationDate;
    return isConfigured && student.status === 'Active';
  });

  // Apply search filter
  const students = allConfiguredStudents.filter(student => {
    if (!searchTerm) return true;
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle URL parameters to auto-select student
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentParam = params.get('student');
    
    if (studentParam && students && students.length > 0 && students.find(s => s.id === studentParam)) {
      setSelectedStudent(studentParam);
    }
  }, [location.search, students]);

  // Fetch ledger data when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentLedger(selectedStudent);
      fetchStudentBalance(selectedStudent);
    }
  }, [selectedStudent, fetchStudentLedger, fetchStudentBalance]);

  // Apply filters to ledger entries
  useEffect(() => {
    let filtered = [...ledgerEntries];

    // Apply date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        
        if (filters.dateRange?.from && filters.dateRange?.to) {
          return isWithinInterval(entryDate, {
            start: filters.dateRange.from,
            end: filters.dateRange.to
          });
        } else if (filters.dateRange?.from) {
          return entryDate >= filters.dateRange.from;
        } else if (filters.dateRange?.to) {
          return entryDate <= filters.dateRange.to;
        }
        
        return true;
      });
    }

    // Apply month filter
    if (filters.month) {
      const monthStart = startOfMonth(filters.month);
      const monthEnd = endOfMonth(filters.month);
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return isWithinInterval(entryDate, {
          start: monthStart,
          end: monthEnd
        });
      });
    }

    // Apply entry type filter
    if (filters.entryType) {
      filtered = filtered.filter(entry => entry.type === filters.entryType);
    }

    setFilteredEntries(filtered);
  }, [ledgerEntries, filters]);

  // Get selected student data
  const selectedStudentData = selectedStudent ? students.find(s => s.id === selectedStudent) : null;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Invoice':
        return <Badge className="bg-red-100 text-red-800">Invoice</Badge>;
      case 'Payment':
        return <Badge className="bg-green-100 text-green-800">Payment</Badge>;
      case 'Discount':
        return <Badge className="bg-blue-100 text-blue-800">Discount</Badge>;
      case 'Adjustment':
        return <Badge className="bg-purple-100 text-purple-800">Adjustment</Badge>;
      case 'Refund':
        return <Badge className="bg-orange-100 text-orange-800">Refund</Badge>;
      case 'Penalty':
        return <Badge className="bg-red-100 text-red-800">Penalty</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  // Calculate totals from filtered ledger data
  const currentBalance = studentBalance?.currentBalance || 0;
  const totalDebits = filteredEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  const filteredBalance = totalDebits - totalCredits;

  // Filter handlers
  const handleFiltersChange = (newFilters: LedgerFilterOptions) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically via useEffect
    // This could be used for additional actions like analytics tracking
    console.log('Filters applied:', filters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Show loading state
  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an API error
  if (studentsError || entriesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{studentsError || entriesError}</p>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    refreshStudents();
                    if (selectedStudent) {
                      refreshLedger();
                    }
                  }}
                  className="text-red-800 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">📋 Student Ledger View</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              refreshStudents();
              if (selectedStudent) {
                refreshLedger();
              }
            }}
            disabled={studentsLoading || entriesLoading}
            className="flex items-center gap-2"
          >
            <svg 
              className={`h-4 w-4 ${studentsLoading || entriesLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </Button>
          {/* Show print and download options only after student selection */}
          {selectedStudent && (
            <>
              <Button 
                variant="outline"
                onClick={() => {
                  // Print functionality
                  window.print();
                }}
              >
                🖨️ Print Ledger
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Download PDF functionality - placeholder for now
                  alert('PDF download functionality will be implemented');
                }}
              >
                📄 Download PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Student Selection */}
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
          {/* Search Students */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, ID, room number, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
          
          {/* Student Dropdown */}
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose student to view ledger" />
            </SelectTrigger>
            <SelectContent>
              {students && students.length > 0 ? students.map((student) => (
                <SelectItem key={student.id} value={String(student.id)}>
                  {String(student.name)} - Room {String(student.roomNumber || 'N/A')}
                </SelectItem>
              )) : (
                <SelectItem value="no-students" disabled>
                  {searchTerm ? 'No students match your search' : 'No students available'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          {searchTerm && (
            <div className="text-sm text-gray-500">
              {students.length} student{students.length !== 1 ? 's' : ''} found
            </div>
          )}
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Filters */}
          <LedgerFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            loading={entriesLoading}
          />

          {/* Student Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                {balanceLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${getBalanceTypeColor(studentBalance?.balanceType || 'Nil')}`}>
                      {getFormattedBalance(Math.abs(currentBalance))}
                    </div>
                    <div className="text-sm text-gray-500">
                      Current {currentBalance >= 0 ? 'Outstanding' : 'Advance'}
                    </div>
                    <div className="text-xs mt-1">
                      {currentBalance >= 0 ? '🔴 Amount Due' : '🟢 Credit Balance'}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {getFormattedBalance(totalDebits)}
                </div>
                <div className="text-sm text-gray-500">
                  {Object.keys(filters).length > 0 ? 'Filtered Charges' : 'Total Charges'}
                </div>
                <div className="text-xs mt-1 text-red-600">
                  📈 {Object.keys(filters).length > 0 ? 'Filtered invoices' : 'All invoices'}
                </div>
                {Object.keys(filters).length > 0 && (
                  <div className="text-xs mt-1 text-gray-400">
                    Total: {getFormattedBalance(ledgerEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {getFormattedBalance(totalCredits)}
                </div>
                <div className="text-sm text-gray-500">
                  {Object.keys(filters).length > 0 ? 'Filtered Payments' : 'Total Payments'}
                </div>
                <div className="text-xs mt-1 text-green-600">
                  💰 {Object.keys(filters).length > 0 ? 'Filtered credits' : 'All credits'}
                </div>
                {Object.keys(filters).length > 0 && (
                  <div className="text-xs mt-1 text-gray-400">
                    Total: {getFormattedBalance(ledgerEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">
                  {filteredEntries.length}
                </div>
                <div className="text-sm text-gray-500">
                  {Object.keys(filters).length > 0 ? 'Filtered Transactions' : 'Total Transactions'}
                </div>
                <div className="text-xs mt-1 text-gray-600">
                  📋 {Object.keys(filters).length > 0 ? 'Matching entries' : 'All entries'}
                </div>
                {Object.keys(filters).length > 0 && (
                  <div className="text-xs mt-1 text-gray-400">
                    Total: {ledgerEntries.length} entries
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  📊 Ledger for {students.find(s => s.id === selectedStudent)?.name}
                </CardTitle>
                {Object.keys(filters).length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-600">
                      {filteredEntries.length} of {ledgerEntries.length} entries shown
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Show All
                    </Button>
                  </div>
                )}
              </div>
              {Object.keys(filters).length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Showing filtered results. Use filters above to adjust the date range and entry types.
                </div>
              )}
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading ledger entries...</p>
                  </div>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">📋</div>
                  <p className="text-gray-500 font-medium">
                    {Object.keys(filters).length > 0 ? 'No entries match your filters' : 'No ledger entries found'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {Object.keys(filters).length > 0 
                      ? 'Try adjusting your date range or entry type filters'
                      : 'This student has no transaction history'
                    }
                  </p>
                  {Object.keys(filters).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="mt-3"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{getEntryTypeIcon(entry.type)}</span>
                            {getTypeBadge(entry.type)}
                          </div>
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>
                          {entry.referenceId && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {entry.referenceId}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {(entry.debit || 0) > 0 && (
                            <span className="text-red-600 font-medium">
                              {getFormattedBalance(entry.debit || 0)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {(entry.credit || 0) > 0 && (
                            <span className="text-green-600 font-medium">
                              {getFormattedBalance(entry.credit || 0)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          <span className={getBalanceTypeColor(entry.balanceType)}>
                            {getFormattedBalance(Math.abs(entry.balance || 0))}
                            {entry.balanceType !== 'Nil' && ` ${entry.balanceType}`}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Running Balance Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {Object.keys(filters).length > 0 ? 'Current Account Balance:' : 'Final Balance:'}
                  </span>
                  {balanceLoading ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-32"></div>
                    </div>
                  ) : (
                    <span className={`text-xl font-bold ${getBalanceTypeColor(studentBalance?.balanceType || 'Nil')}`}>
                      {getFormattedBalance(Math.abs(currentBalance))} {currentBalance >= 0 ? 'Outstanding' : 'Advance'}
                    </span>
                  )}
                </div>
                
                {Object.keys(filters).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Filtered Period Balance:</span>
                      <span className={`font-semibold ${filteredBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {getFormattedBalance(Math.abs(filteredBalance))} {filteredBalance >= 0 ? 'Net Charges' : 'Net Credits'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      This shows the net activity for the selected time period only
                    </div>
                  </div>
                )}
                
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
