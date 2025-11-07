
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
import { ledgerApiService } from "@/services/ledgerApiService";

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

  // ✅ NEW: State for financial summary (includes initial advance)
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  const location = useLocation();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<LedgerFilterOptions>({});
  const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(15); // Show 15 entries per page

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

  // Auto-select first student when search results change and current selection is not in results
  useEffect(() => {
    if (students.length > 0 && selectedStudent && !students.find(s => s.id === selectedStudent)) {
      // Current selected student is not in filtered results, select the first one
      setSelectedStudent(students[0].id);
    }
  }, [students, selectedStudent]);

  // Handle URL parameters to auto-select student, or select first student by default
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentParam = params.get('student');
    
    if (studentParam && students && students.length > 0 && students.find(s => s.id === studentParam)) {
      setSelectedStudent(studentParam);
    } else if (!selectedStudent && students && students.length > 0) {
      // Auto-select the first student if no student is selected and no URL parameter
      setSelectedStudent(students[0].id);
    }
  }, [location.search, students, selectedStudent]);

  // Fetch ledger data when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentLedger(selectedStudent);
      fetchStudentBalance(selectedStudent);
      
      // ✅ NEW: Fetch financial summary (includes initial advance)
      const fetchSummary = async () => {
        try {
          setSummaryLoading(true);
          const summary = await ledgerApiService.getStudentFinancialSummary(selectedStudent);
          setFinancialSummary(summary);
        } catch (error) {
          console.error('Error fetching financial summary:', error);
        } finally {
          setSummaryLoading(false);
        }
      };
      fetchSummary();
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
    // Reset to first page when filters change
    setCurrentPage(1);
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
    <div className="space-y-4">
      {/* Compact Header with Student Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left side: Title and Student Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
              <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">📋 Student Ledger</h2>
              
              {/* Compact Student Selection */}
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="w-64 h-9">
                    <SelectValue placeholder="Select student" />
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
              </div>
            </div>

            {/* Right side: Action buttons */}
            <div className="flex items-center gap-2">
              {selectedStudent && (
                <Badge variant="outline" className="text-green-600 text-xs">
                  {location.search.includes('student=') ? 'From navigation' : 'Auto-selected'}
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  refreshStudents();
                  if (selectedStudent) {
                    refreshLedger();
                  }
                }}
                disabled={studentsLoading || entriesLoading}
                className="h-9"
              >
                <svg 
                  className={`h-4 w-4 ${studentsLoading || entriesLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Button>
              
              {selectedStudent && (
                <>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="h-9"
                  >
                    🖨️
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => alert('PDF download functionality will be implemented')}
                    className="h-9"
                  >
                    📄
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && selectedStudentData && (
        <>
          {/* Compact Student Info Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedStudentData.name}</h3>
                    <p className="text-sm text-gray-600">Room {selectedStudentData.roomNumber} • {selectedStudentData.course}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                    ← Back
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const params = new URLSearchParams(location.search);
                    params.set('section', 'payments');
                    params.set('student', selectedStudent);
                    window.location.href = `/ledger?${params.toString()}`;
                  }}>
                    💰 Payment
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

          {/* Compact Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3">
                {balanceLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className={`text-lg font-bold ${getBalanceTypeColor(studentBalance?.balanceType || 'Nil')}`}>
                      {getFormattedBalance(Math.abs(currentBalance))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentBalance >= 0 ? '🔴 Outstanding' : '🟢 Advance'}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-lg font-bold text-red-600">
                  {getFormattedBalance(totalDebits)}
                </div>
                <div className="text-xs text-gray-500">
                  📈 {Object.keys(filters).length > 0 ? 'Filtered' : 'Total'} Invoiced
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-lg font-bold text-green-600">
                  {getFormattedBalance(totalCredits)}
                </div>
                <div className="text-xs text-gray-500">
                  💰 {Object.keys(filters).length > 0 ? 'Filtered' : 'Total'} Payments
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-lg font-bold text-gray-600">
                  {filteredEntries.length}
                </div>
                <div className="text-xs text-gray-500">
                  📋 {Object.keys(filters).length > 0 ? 'Filtered' : 'Total'} Entries
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ✅ NEW: Initial Advance Card (Security Deposit) */}
          {financialSummary?.initialAdvance?.amount > 0 && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🔒</span>
                      <h3 className="text-sm font-semibold text-blue-900">Initial Advance (Security Deposit)</h3>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-blue-600">
                        NPR {financialSummary.initialAdvance.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-700">
                        Paid on {new Date(financialSummary.initialAdvance.paymentDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-2">
                        {financialSummary.initialAdvance.note}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    Locked
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compact Ledger Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  📊 Transaction History
                </CardTitle>
                {Object.keys(filters).length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-600 text-xs">
                      {filteredEntries.length} of {ledgerEntries.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                    >
                      Show All
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">

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
                <>
                  {(() => {
                    const indexOfLastEntry = currentPage * entriesPerPage;
                    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
                    const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);
                    const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);

                    return (
                      <>
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white z-10">
                              <TableRow>
                                <TableHead className="py-2">Date</TableHead>
                                <TableHead className="py-2">Type</TableHead>
                                <TableHead className="py-2">Description</TableHead>
                                <TableHead className="py-2 text-right">Debit</TableHead>
                                <TableHead className="py-2 text-right">Credit</TableHead>
                                <TableHead className="py-2 text-right">Balance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentEntries.map((entry) => (
                                <TableRow key={entry.id} className="hover:bg-gray-50">
                                  <TableCell className="py-2 text-sm">
                                    {new Date(entry.date).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: '2-digit'
                                    })}
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <div className="flex items-center space-x-1">
                                      <span className="text-sm">{getEntryTypeIcon(entry.type)}</span>
                                      {getTypeBadge(entry.type)}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2 text-sm max-w-xs">
                                    <div className="truncate" title={entry.description}>
                                      {entry.description}
                                    </div>
                                    {entry.referenceId && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Ref: {entry.referenceId}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-right">
                                    {(entry.debit || 0) > 0 && (
                                      <span className="text-red-600 font-medium text-sm">
                                        {getFormattedBalance(entry.debit || 0)}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-right">
                                    {(entry.credit || 0) > 0 && (
                                      <span className="text-green-600 font-medium text-sm">
                                        {getFormattedBalance(entry.credit || 0)}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 text-right font-bold">
                                    <span className={`text-sm ${getBalanceTypeColor(entry.balanceType)}`}>
                                      {getFormattedBalance(Math.abs(entry.balance || 0))}
                                      <span className="text-xs ml-1">{entry.balanceType !== 'Nil' && entry.balanceType}</span>
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center space-x-2 mt-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>

                            <div className="flex space-x-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                                >
                                  {page}
                                </Button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        )}

                        {/* Pagination Info */}
                        <div className="text-center text-sm text-gray-600 mt-4">
                          Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredEntries.length)} of {filteredEntries.length} entries
                        </div>
                      </>
                    );
                  })()}
                </>
              )}

              {/* Compact Balance Summary */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {Object.keys(filters).length > 0 ? 'Account Balance:' : 'Current Balance:'}
                  </span>
                  {balanceLoading ? (
                    <div className="animate-pulse">
                      <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>
                  ) : (
                    <span className={`text-lg font-bold ${getBalanceTypeColor(studentBalance?.balanceType || 'Nil')}`}>
                      {getFormattedBalance(Math.abs(currentBalance))} {currentBalance >= 0 ? 'Due' : 'Advance'}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-600 mt-1">
                  {currentBalance >= 0 
                    ? '🔴 Outstanding amount to be paid'
                    : '🟢 Advance balance available'
                  }
                </div>
                
                {Object.keys(filters).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Filtered Period:</span>
                      <span className={`font-semibold ${filteredBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {getFormattedBalance(Math.abs(filteredBalance))} {filteredBalance >= 0 ? 'Net Charges' : 'Net Credits'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
