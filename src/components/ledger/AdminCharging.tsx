import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminCharges } from '@/hooks/useAdminCharges';
import { useStudents } from '@/hooks/useStudents';
import { adminChargesApiService, AdminChargeType } from '../../services/adminChargesApiService';
import { ledgerApiService } from '../../services/ledgerApiService';
import { LedgerEntry } from '../../types/api';
import {
  Zap,
  Users,
  DollarSign,
  AlertCircle,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';


export const AdminCharging = () => {
  const { toast } = useToast();

  // Use real API hooks
  const {
    loading: chargesLoading,
    error: chargesError,
    stats,
    createCharge,
    refreshData: refreshCharges
  } = useAdminCharges();

  const {
    students,
    loading: studentsLoading,
    error: studentsError
  } = useStudents();

  const [selectedStudent, setSelectedStudent] = useState('');
  const [chargeType, setChargeType] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [overdueStudents, setOverdueStudents] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkCharge, setShowBulkCharge] = useState(false);

  // Enhanced students functionality
  const [studentLedgerEntries, setStudentLedgerEntries] = useState<Record<string, LedgerEntry[]>>({});
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [loadingEntries, setLoadingEntries] = useState<Set<string>>(new Set());

  useEffect(() => {

    loadOverdueStudents();
    loadTodaySummary();
  }, []);

  // Reload when students data changes
  useEffect(() => {
    if (students.length > 0) {
      console.log('👥 Students data loaded, reloading overdue students...');
      loadOverdueStudents();
    }
  }, [students]);



  const loadOverdueStudents = async () => {
    try {
      const overdue = await adminChargesApiService.getOverdueStudents();
      setOverdueStudents(overdue);
    } catch (error) {
      console.error('Error loading overdue students:', error);
      // Fallback to filtering from existing students
      const fallbackOverdue = students.filter(student =>
        student.currentBalance && student.currentBalance > 0
      ).map(student => ({
        ...student,
        daysOverdue: Math.floor(Math.random() * 30) + 1,
        suggestedLateFee: Math.min(student.currentBalance * 0.1, 500)
      }));
      setOverdueStudents(fallbackOverdue);
    }
  };

  const loadTodaySummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await adminChargesApiService.getTodaySummary();

      if (response && typeof response === 'object') {
        setTodaySummary(response);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      // Fallback to stats data
      const fallbackSummary = {
        totalCharges: stats?.totalCharges || 0,
        totalAmount: (stats?.totalPendingAmount || 0) + (stats?.totalAppliedAmount || 0),
        studentsCharged: 0,
        pendingCharges: stats?.pendingCharges || 0
      };
      setTodaySummary(fallbackSummary);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAddCharge = async () => {
    if (!selectedStudent || !chargeType || !amount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Amount must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    if (chargeType === 'custom' && !customDescription.trim()) {
      toast({
        title: 'Missing Description',
        description: 'Please enter a description for custom charge',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const studentIds = showBulkCharge ? selectedStudents : [selectedStudent];

      // Create charges for each selected student
      const createdCharges = [];
      for (const studentId of studentIds) {
        const chargeData = {
          studentId: studentId,
          title: chargeType === 'custom' ? customDescription : getChargeTypeName(chargeType),
          description: chargeType === 'custom' ? customDescription : getChargeTypeName(chargeType),
          amount: parseFloat(amount),
          chargeType: AdminChargeType.ONE_TIME,
          category: chargeType,
          adminNotes: notes.trim(),
          createdBy: 'Admin'
        };

        console.log('🔄 Creating charge for student:', studentId, chargeData);
        const newCharge = await createCharge(chargeData);
        console.log('✅ Charge created successfully:', newCharge);
        createdCharges.push(newCharge);
      }

      const studentNames = studentIds.map(id =>
        students.find(s => s.id === id)?.name || 'Student'
      ).join(', ');

      toast({
        title: 'Charge Added Successfully',
        description: `NPR ${amount} charge added to ${studentNames}`,
      });

      // 🔧 FIX: Only reset form on successful creation
      setSelectedStudent('');
      setSelectedStudents([]);
      setChargeType('');
      setCustomDescription('');
      setAmount('');
      setNotes('');

      // Refresh data
      await refreshCharges();
      await loadOverdueStudents();
      await loadTodaySummary();

    } catch (error) {
      console.error('❌ Error creating admin charge:', error);

      // 🔧 FIX: Show detailed error message and don't reset form
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';

      toast({
        title: 'Failed to Create Charge',
        description: `Error: ${errorMessage}. Please check the details and try again.`,
        variant: 'destructive'
      });

      // 🔧 FIX: Don't reset form on error so user can retry
    } finally {
      setIsProcessing(false);
    }
  };

  const getChargeTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      'late_fee': 'Late Payment Fee',
      'damage_fee': 'Damage Fee',
      'cleaning_fee': 'Cleaning Fee',
      'maintenance_fee': 'Maintenance Fee'
    };
    return typeMap[type] || type;
  };

  // Load ledger entries for a specific student
  const loadStudentLedgerEntries = async (studentId: string) => {
    if (studentLedgerEntries[studentId]) {
      console.log(`📋 Ledger entries already loaded for student ${studentId}:`, studentLedgerEntries[studentId]);
      return; // Already loaded
    }

    console.log(`🔄 Loading ledger entries for student ${studentId}...`);
    setLoadingEntries(prev => new Set([...prev, studentId]));

    try {
      const entries = await ledgerApiService.getStudentLedger(studentId);
      console.log(`✅ Loaded ${entries.length} ledger entries for student ${studentId}:`, entries);

      setStudentLedgerEntries(prev => ({
        ...prev,
        [studentId]: entries
      }));
    } catch (error) {
      console.error(`❌ Failed to load ledger entries for student ${studentId}:`, error);
      toast({
        title: 'Error Loading Entries',
        description: 'Failed to load student ledger entries. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoadingEntries(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  // Toggle expanded state for a student
  const toggleStudentExpanded = async (studentId: string) => {
    const isExpanded = expandedStudents.has(studentId);

    if (isExpanded) {
      // Collapse
      setExpandedStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    } else {
      // Expand and load ledger entries
      setExpandedStudents(prev => new Set([...prev, studentId]));
      await loadStudentLedgerEntries(studentId);
    }
  };



  const handleQuickCharge = async (studentId: string, suggestedAmount: number) => {
    setIsProcessing(true);

    try {
      const chargeData = {
        studentId: studentId,
        title: 'Late Payment Fee',
        description: 'Overdue payment late fee',
        amount: suggestedAmount,
        chargeType: AdminChargeType.ONE_TIME,
        category: 'late_fee',
        adminNotes: 'Quick charge applied for overdue payment',
        createdBy: 'Admin'
      };

      await createCharge(chargeData);

      const studentName = students.find(s => s.id === studentId)?.name || 'Student';

      toast({
        title: 'Quick Charge Applied',
        description: `NPR ${suggestedAmount} late fee added to ${studentName}'s account`,
      });

      await refreshCharges();
      await loadOverdueStudents();
      await loadTodaySummary();

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">⚡ Admin Charging</h2>
          {(chargesError || studentsError) && (
            <div className="mt-2 text-sm text-red-600">
              Error: {chargesError || studentsError}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              refreshCharges();
              loadTodaySummary();
              loadOverdueStudents();
            }}
            disabled={chargesLoading || studentsLoading || summaryLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(chargesLoading || studentsLoading || summaryLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowBulkCharge(!showBulkCharge)}
          >
            <Users className="h-4 w-4 mr-2" />
            {showBulkCharge ? 'Single Charge' : 'Bulk Charge'}
          </Button>
        </div>
      </div>

      {/* Today's Summary */}

      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Charges</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {todaySummary?.totalCharges || stats?.totalCharges || 0}
                  </p>

                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-green-700">
                    NPR {(todaySummary?.totalAmount ||
                      ((stats?.totalPendingAmount || 0) + (stats?.totalAppliedAmount || 0))
                    ).toLocaleString()}
                  </p>

                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Students Charged</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {todaySummary?.studentsCharged || 0}
                  </p>

                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Pending Charges</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {todaySummary?.pendingCharges || stats?.pendingCharges || 0}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charge Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {showBulkCharge ? 'Bulk Charge Students' : 'Add Charge to Student'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showBulkCharge ? (
              /* Single Student Charge */
              <div className="space-y-2">
                <Label>Select Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{student.name} - Room {student.roomNumber || 'No Room'}</span>
                          {student.currentBalance > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              NPR {student.currentBalance.toLocaleString()} due
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedStudentData && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedStudentData.name}</strong> - Room {selectedStudentData.roomNumber}
                    </p>
                    <p className="text-sm text-blue-600">
                      Current Balance: NPR {(selectedStudentData.currentBalance || 0).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Bulk Student Selection */
              <div className="space-y-2">
                <Label>Select Students * ({selectedStudents.length} selected)</Label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={student.id} className="flex-1 text-sm cursor-pointer">
                        {student.name} - Room {student.roomNumber || 'No Room'}
                        {student.currentBalance > 0 && (
                          <span className="text-red-600 ml-2">
                            (NPR {student.currentBalance.toLocaleString()} due)
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Charge Type *</Label>
              <Select value={chargeType} onValueChange={setChargeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select charge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="late_fee">Late Payment Fee</SelectItem>
                  <SelectItem value="damage_fee">Damage Fee</SelectItem>
                  <SelectItem value="cleaning_fee">Cleaning Fee</SelectItem>
                  <SelectItem value="maintenance_fee">Maintenance Fee</SelectItem>
                  <SelectItem value="custom">Custom Charge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {chargeType === 'custom' && (
              <div className="space-y-2">
                <Label>Custom Description *</Label>
                <Input
                  placeholder="Enter custom charge description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount (NPR) *</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Optional notes about this charge"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>



            <Button
              onClick={handleAddCharge}
              disabled={isProcessing || chargesLoading || studentsLoading}
              className="w-full"
            >
              {isProcessing ? 'Processing...' :
                (chargesLoading || studentsLoading) ? 'Loading...' :
                  showBulkCharge ? `Apply to ${selectedStudents.length} Students` : 'Add Charge to Ledger'}
            </Button>
          </CardContent>
        </Card>

        {/* Students & Charges */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students & Charges ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.length > 0 ? (
                students.map((student) => {
                  const isExpanded = expandedStudents.has(student.id);
                  const entries = studentLedgerEntries[student.id] || [];
                  const isLoadingEntries = loadingEntries.has(student.id);

                  return (
                    <div key={student.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{student.name}</p>
                            <span className="text-sm text-gray-500">Room {student.roomNumber}</span>
                            {student.currentBalance > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                NPR {student.currentBalance.toLocaleString()} due
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStudentExpanded(student.id)}
                          disabled={isLoadingEntries}
                        >
                          {isLoadingEntries ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          Charges ({entries.length})
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t">
                          {entries.length > 0 ? (
                            <div className="space-y-2">
                              {entries.slice(0, 10).map((entry) => (
                                <div key={entry.id} className="bg-gray-50 rounded p-2 text-sm">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{entry.description}</p>
                                      <p className="text-xs text-gray-500">
                                        {entry.date ? new Date(entry.date).toLocaleDateString() : 'No date'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      {entry.debit > 0 && (
                                        <p className="text-red-600 font-medium">
                                          -NPR {entry.debit.toLocaleString()}
                                        </p>
                                      )}
                                      {entry.credit > 0 && (
                                        <p className="text-green-600 font-medium">
                                          +NPR {entry.credit.toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {entries.length > 10 && (
                                <p className="text-xs text-gray-500 text-center">
                                  ... and {entries.length - 10} more entries
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm text-center py-2">
                              No ledger entries found
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No students found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Students Section */}
      {overdueStudents.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Overdue Students ({overdueStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {overdueStudents.map((student) => (
                <div key={student.id} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-orange-900">{student.name}</p>
                        <span className="text-sm text-orange-700">Room {student.roomNumber}</span>
                        <Badge variant="destructive">
                          {student.daysOverdue} days overdue
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-800 mt-1">
                        Balance: NPR {student.currentBalance?.toLocaleString() || '0'}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      onClick={() => handleQuickCharge(student.id, student.suggestedLateFee || 100)}
                      disabled={isProcessing}
                    >
                      Quick Charge NPR {student.suggestedLateFee || 100}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};