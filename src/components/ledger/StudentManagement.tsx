import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, User, Phone, Mail, CreditCard, Home, Settings, Edit, Bed, Users, CheckCircle, Plus, Trash2, DollarSign, AlertTriangle, Calendar, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useStudents } from '../../hooks/useStudents';
import { Student } from '../../types/api';
import { EnhancedStudent } from '../../services/enhancedStudentService';

interface Room {
  id: string;
  name: string;
  roomNumber: string;
  bedCount: number;
  occupancy: number;
  availableBeds: number;
  type: string;
  monthlyRate: number;
  gender: string;
  amenities: string[];
}

interface ChargeItem {
  id: string;
  description: string;
  amount: number;
}

// Charge Configuration Form Component
interface ChargeConfigurationFormProps {
  student: EnhancedStudent;
  onComplete: (studentId: string, chargeData: any) => void;
  onCancel: () => void;
}

const ChargeConfigurationForm = ({ student, onComplete, onCancel }: ChargeConfigurationFormProps) => {
  const [baseCharges, setBaseCharges] = useState({
    baseMonthlyFee: student.baseMonthlyFee || 15000,
    laundryFee: student.laundryFee || 2000,
    foodFee: student.foodFee || 8000,
    wifiFee: 1000,
    maintenanceFee: 500,
    securityDeposit: 10000
  });

  const [additionalCharges, setAdditionalCharges] = useState<ChargeItem[]>([
    { id: '1', description: '', amount: 0 },
    { id: '2', description: '', amount: 0 },
    { id: '3', description: '', amount: 0 }
  ]);

  // Guardian information state
  const [guardianInfo, setGuardianInfo] = useState({
    name: student.guardian?.name || student.guardianName || '',
    phone: student.guardian?.phone || student.guardianPhone || '',
    relation: student.guardian?.relation || ''
  });

  // Academic information state
  const [academicInfo, setAcademicInfo] = useState({
    course: student.course || '',
    institution: student.institution || ''
  });

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleBaseChargeChange = (field: string, value: number) => {
    setBaseCharges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdditionalChargeChange = (id: string, field: 'description' | 'amount', value: string | number) => {
    setAdditionalCharges(prev => prev.map(charge =>
      charge.id === id
        ? { ...charge, [field]: value }
        : charge
    ));
  };

  const handleGuardianInfoChange = (field: keyof typeof guardianInfo, value: string) => {
    setGuardianInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[`guardian.${field}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`guardian.${field}`]: ''
      }));
    }
  };

  const handleAcademicInfoChange = (field: keyof typeof academicInfo, value: string) => {
    setAcademicInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[`academic.${field}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`academic.${field}`]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate guardian information
    if (!guardianInfo.name.trim()) {
      errors['guardian.name'] = 'Guardian name is required';
    }
    if (!guardianInfo.phone.trim()) {
      errors['guardian.phone'] = 'Guardian phone number is required';
    } else if (!/^\d{10}$/.test(guardianInfo.phone.replace(/\D/g, ''))) {
      errors['guardian.phone'] = 'Please enter a valid 10-digit phone number';
    }
    if (!guardianInfo.relation.trim()) {
      errors['guardian.relation'] = 'Guardian relation is required';
    }

    // Validate academic information
    if (!academicInfo.course.trim()) {
      errors['academic.course'] = 'Course is required';
    }
    if (!academicInfo.institution.trim()) {
      errors['academic.institution'] = 'Institution is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addNewChargeField = () => {
    const newId = Date.now().toString();
    setAdditionalCharges(prev => [...prev, { id: newId, description: '', amount: 0 }]);
  };

  const removeChargeField = (id: string) => {
    if (additionalCharges.length > 1) {
      setAdditionalCharges(prev => prev.filter(charge => charge.id !== id));
    }
  };

  const calculateTotalMonthlyFee = () => {
    const baseTotal = baseCharges.baseMonthlyFee + baseCharges.laundryFee + baseCharges.foodFee +
      baseCharges.wifiFee + baseCharges.maintenanceFee;
    const additionalTotal = additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    return baseTotal + additionalTotal;
  };

  const handleComplete = () => {
    // Validate form first
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const totalMonthlyFee = calculateTotalMonthlyFee();

    if (totalMonthlyFee === 0) {
      toast.error("Please configure at least the base monthly fee");
      return;
    }

    // Filter out empty additional charges
    const validAdditionalCharges = additionalCharges.filter(charge =>
      charge.description.trim() !== '' && charge.amount > 0
    );

    const chargeData = {
      ...baseCharges,
      additionalCharges: validAdditionalCharges,
      totalMonthlyFee,
      guardian: {
        name: guardianInfo.name.trim(),
        phone: guardianInfo.phone.trim(),
        relation: guardianInfo.relation.trim()
      },
      course: academicInfo.course.trim(),
      institution: academicInfo.institution.trim()
    };

    onComplete(student.id, chargeData);
  };

  return (
    <div className="space-y-6">
      {/* Student Info Header */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold">
            {student.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold">{student.name}</h3>
            <p className="text-sm text-gray-600">
              {student.roomNumber && `${student.roomNumber} • `}
              {student.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Guardian Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Guardian Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name *</Label>
              <Input
                id="guardianName"
                placeholder="Enter guardian's full name"
                value={guardianInfo.name}
                onChange={(e) => handleGuardianInfoChange('name', e.target.value)}
                className={validationErrors['guardian.name'] ? 'border-red-500' : ''}
              />
              {validationErrors['guardian.name'] && (
                <p className="text-sm text-red-500">{validationErrors['guardian.name']}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Guardian Phone Number *</Label>
              <Input
                id="guardianPhone"
                placeholder="Enter 10-digit phone number"
                value={guardianInfo.phone}
                onChange={(e) => handleGuardianInfoChange('phone', e.target.value)}
                className={validationErrors['guardian.phone'] ? 'border-red-500' : ''}
              />
              {validationErrors['guardian.phone'] && (
                <p className="text-sm text-red-500">{validationErrors['guardian.phone']}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianRelation">Relation *</Label>
              <Select
                value={guardianInfo.relation}
                onValueChange={(value) => handleGuardianInfoChange('relation', value)}
              >
                <SelectTrigger className={validationErrors['guardian.relation'] ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Brother">Brother</SelectItem>
                  <SelectItem value="Sister">Sister</SelectItem>
                  <SelectItem value="Uncle">Uncle</SelectItem>
                  <SelectItem value="Aunt">Aunt</SelectItem>
                  <SelectItem value="Grandfather">Grandfather</SelectItem>
                  <SelectItem value="Grandmother">Grandmother</SelectItem>
                  <SelectItem value="Cousin">Cousin</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors['guardian.relation'] && (
                <p className="text-sm text-red-500">{validationErrors['guardian.relation']}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Input
                id="course"
                placeholder="e.g., B.Tech Computer Science, MBA, etc."
                value={academicInfo.course}
                onChange={(e) => handleAcademicInfoChange('course', e.target.value)}
                className={validationErrors['academic.course'] ? 'border-red-500' : ''}
              />
              {validationErrors['academic.course'] && (
                <p className="text-sm text-red-500">{validationErrors['academic.course']}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                placeholder="e.g., ABC University, XYZ College, etc."
                value={academicInfo.institution}
                onChange={(e) => handleAcademicInfoChange('institution', e.target.value)}
                className={validationErrors['academic.institution'] ? 'border-red-500' : ''}
              />
              {validationErrors['academic.institution'] && (
                <p className="text-sm text-red-500">{validationErrors['academic.institution']}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Base Charges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Base Monthly Charges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseFee">Base Monthly Fee (₹) *</Label>
              <Input
                id="baseFee"
                type="number"
                value={baseCharges.baseMonthlyFee}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleBaseChargeChange('baseMonthlyFee', 0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      handleBaseChargeChange('baseMonthlyFee', Math.max(0, numValue));
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="laundryFee">Laundry Fee (₹)</Label>
              <Input
                id="laundryFee"
                type="number"
                value={baseCharges.laundryFee}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleBaseChargeChange('laundryFee', 0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      handleBaseChargeChange('laundryFee', Math.max(0, numValue));
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foodFee">Food Fee (₹)</Label>
              <Input
                id="foodFee"
                type="number"
                value={baseCharges.foodFee}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleBaseChargeChange('foodFee', 0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      handleBaseChargeChange('foodFee', Math.max(0, numValue));
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifiFee">WiFi Fee (₹)</Label>
              <Input
                id="wifiFee"
                type="number"
                value={baseCharges.wifiFee}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleBaseChargeChange('wifiFee', 0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      handleBaseChargeChange('wifiFee', Math.max(0, numValue));
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceFee">Maintenance Fee (₹)</Label>
              <Input
                id="maintenanceFee"
                type="number"
                value={baseCharges.maintenanceFee}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleBaseChargeChange('maintenanceFee', 0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      handleBaseChargeChange('maintenanceFee', Math.max(0, numValue));
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit (₹)</Label>
              <Input
                id="securityDeposit"
                type="number"
                value={baseCharges.securityDeposit}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleBaseChargeChange('securityDeposit', 0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      handleBaseChargeChange('securityDeposit', Math.max(0, numValue));
                    }
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Charges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Additional Charges & Services
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addNewChargeField}
              className="text-[#07A64F] border-[#07A64F]/30 hover:bg-[#07A64F]/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Charge
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Add custom charges for additional services like parking, gym access, study room, etc.
          </p>

          {additionalCharges.map((charge) => (
            <div key={charge.id} className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`desc-${charge.id}`}>Service/Item Description</Label>
                <Input
                  id={`desc-${charge.id}`}
                  placeholder="e.g., Parking Fee, Gym Access, Study Room, etc."
                  value={charge.description}
                  onChange={(e) => handleAdditionalChargeChange(charge.id, 'description', e.target.value)}
                />
              </div>
              <div className="w-32 space-y-2">
                <Label htmlFor={`amount-${charge.id}`}>Amount (₹)</Label>
                <Input
                  id={`amount-${charge.id}`}
                  type="number"
                  placeholder="0"
                  value={charge.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      handleAdditionalChargeChange(charge.id, 'amount', 0);
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        handleAdditionalChargeChange(charge.id, 'amount', Math.max(0, numValue));
                      }
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeChargeField(charge.id)}
                disabled={additionalCharges.length <= 1}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fee Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Monthly Fee Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Base Charges Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Base Charges:</h4>
              {baseCharges.baseMonthlyFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Base Monthly Fee:</span>
                  <span>₹{baseCharges.baseMonthlyFee.toLocaleString()}</span>
                </div>
              )}
              {baseCharges.laundryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Laundry Fee:</span>
                  <span>₹{baseCharges.laundryFee.toLocaleString()}</span>
                </div>
              )}
              {baseCharges.foodFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Food Fee:</span>
                  <span>₹{baseCharges.foodFee.toLocaleString()}</span>
                </div>
              )}
              {baseCharges.wifiFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>WiFi Fee:</span>
                  <span>₹{baseCharges.wifiFee.toLocaleString()}</span>
                </div>
              )}
              {baseCharges.maintenanceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Maintenance Fee:</span>
                  <span>₹{baseCharges.maintenanceFee.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Additional Charges Summary */}
            {additionalCharges.some(charge => charge.description && charge.amount > 0) && (
              <div className="space-y-2 border-t pt-3">
                <h4 className="font-medium text-gray-900">Additional Charges:</h4>
                {additionalCharges
                  .filter(charge => charge.description && charge.amount > 0)
                  .map(charge => (
                    <div key={charge.id} className="flex justify-between text-sm">
                      <span>{charge.description}:</span>
                      <span>₹{charge.amount.toLocaleString()}</span>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Total */}
            <div className="border-t border-green-300 pt-3 flex justify-between font-bold text-lg">
              <span>Total Monthly Fee:</span>
              <span className="text-green-800">₹{calculateTotalMonthlyFee().toLocaleString()}</span>
            </div>

            {/* Security Deposit */}
            {baseCharges.securityDeposit > 0 && (
              <div className="flex justify-between text-blue-600 border-t border-green-300 pt-2">
                <span>One-time Security Deposit:</span>
                <span>₹{baseCharges.securityDeposit.toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleComplete}
          className="bg-[#07A64F] hover:bg-[#07A64F]/90 flex-1"
          disabled={calculateTotalMonthlyFee() === 0}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Configuration
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export const StudentManagement = () => {
  // Add safety check for React context
  if (typeof useState !== 'function') {
    return <div>Loading React context...</div>;
  }

  const {
    students,
    loading,
    error,
    searchTerm,
    configureStudent,
    updateStudent,
    searchStudents,
    refreshData
  } = useStudents();

  const [activeTab, setActiveTab] = useState("pending");
  const [selectedStudent, setSelectedStudent] = useState<EnhancedStudent | null>(null);
  const [showChargeConfigDialog, setShowChargeConfigDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    roomNumber: '',
    address: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended' | 'Graduated',
    guardian: {
      name: '',
      phone: '',
      relation: ''
    },
    course: '',
    institution: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Pagination state for Student List & Management
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(6); // 6 students per page for better visibility
  
  // Pagination state for Pending Configuration
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [pendingStudentsPerPage] = useState(4); // 4 pending students per page

  // Separate students into pending configuration and configured
  // Primary filter: isConfigured = false (more reliable than status)
  const pendingStudents = students?.filter(student => 
    !student.isConfigured
  ) || [];
  const configuredStudents = students?.filter(student => student.isConfigured) || [];

  // Debug logging
  console.log('🔍 StudentManagement Debug:', {
    totalStudents: students?.length || 0,
    pendingCount: pendingStudents.length,
    configuredCount: configuredStudents.length,
    unconfiguredStudents: students?.filter(s => !s.isConfigured).map(s => ({ 
      id: s.id, 
      name: s.name, 
      status: s.status, 
      isConfigured: s.isConfigured 
    })) || [],
    allStudentsStatus: students?.map(s => ({ 
      name: s.name.substring(0, 20), 
      status: s.status, 
      isConfigured: s.isConfigured 
    })) || []
  });

  // Filter configured students based on search
  const filteredStudents = configuredStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.roomNumber && student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    student.phone.includes(searchTerm) ||
    (student.course && student.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.institution && student.institution.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculations for Student List & Management
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  
  // Pagination calculations for Pending Configuration
  const pendingTotalPages = Math.ceil(pendingStudents.length / pendingStudentsPerPage);
  const pendingStartIndex = (pendingCurrentPage - 1) * pendingStudentsPerPage;
  const pendingEndIndex = pendingStartIndex + pendingStudentsPerPage;
  const paginatedPendingStudents = pendingStudents.slice(pendingStartIndex, pendingEndIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Configure charges
  const configureCharges = (student: EnhancedStudent) => {
    setSelectedStudent(student);
    setShowChargeConfigDialog(true);
  };

  // Complete charge configuration
  const completeChargeConfiguration = async (studentId: string, chargeData: any) => {
    try {
      await configureStudent(studentId, chargeData);

      toast.success("Student charges configured successfully!");

      setShowChargeConfigDialog(false);
      setSelectedStudent(null);

      // Switch to student list tab to show the configured student
      setActiveTab("students");

    } catch (error) {
      console.error('Error in charge configuration:', error);
      toast.error('Failed to complete charge configuration. Please try again.');
    }
  };

  // Handle student update
  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    // Validate required fields
    if (!editForm.name.trim() || !editForm.phone.trim() || !editForm.email.trim()) {
      toast.error('Please fill in all required fields (Name, Phone, Email)');
      return;
    }

    setIsUpdating(true);

    try {
      await updateStudent(selectedStudent.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        roomNumber: editForm.roomNumber.trim() || undefined,
        address: editForm.address.trim() || undefined,
        status: editForm.status,
        guardian: {
          name: editForm.guardian.name.trim(),
          phone: editForm.guardian.phone.trim(),
          relation: editForm.guardian.relation.trim()
        },
        course: editForm.course.trim(),
        institution: editForm.institution.trim()
      });

      toast.success('Student details updated successfully!');

      setShowEditDialog(false);
      setSelectedStudent(null);

    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student details. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">
          <Users className="h-12 w-12 mx-auto mb-2" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Students</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={refreshData} className="bg-blue-600 hover:bg-blue-700">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#231F20]">👥 Student Management</h1>
          <p className="text-[#231F20]/70 mt-1">
            Enroll new students and manage existing student records
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-[#1295D0] border-[#1295D0]/30">
            {students?.length || 0} Total Students
          </Badge>
          <Badge variant="outline" className="text-[#07A64F] border-[#07A64F]/30">
            {students?.filter(s => s.status === 'Active').length || 0} Active
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pending Configuration ({pendingStudents.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student List & Management ({configuredStudents.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Configuration Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#07A64F]" />
                  Students Pending Configuration
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingStudents.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      These students need charge configuration to complete their enrollment.
                    </p>
                    {pendingStudents.length > pendingStudentsPerPage && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        Showing {pendingStartIndex + 1}-{Math.min(pendingEndIndex, pendingStudents.length)} of {pendingStudents.length}
                      </div>
                    )}
                  </div>

                  {paginatedPendingStudents.map((student) => (
                    <Card key={student.id} className="border-orange-200 bg-orange-50/30">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                          {/* Student Info */}
                          <div className="lg:col-span-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-[#231F20]">{student.name}</h3>
                                <p className="text-sm text-gray-600">{student.phone}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Room & Course Info */}
                          <div className="lg:col-span-3">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Bed className="h-4 w-4 text-[#1295D0]" />
                                <span className="font-medium">
                                  {student.assignedRoomNumber || student.roomNumber || 'Not assigned'}
                                </span>
                                {(student.assignedBedNumber || student.bedNumber) && (
                                  <span className="text-sm text-gray-500">
                                    ({student.assignedBedNumber || student.bedNumber})
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{student.course || 'Not specified'}</p>
                              <p className="text-xs text-gray-500">{student.institution || ''}</p>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="lg:col-span-2">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Pending Configuration
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="lg:col-span-3">
                            <Button
                              onClick={() => configureCharges(student)}
                              className="w-full bg-[#07A64F] hover:bg-[#07A64F]/90"
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configure Charges
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Pagination Controls for Pending Students */}
                  {pendingTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPendingCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={pendingCurrentPage === 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: pendingTotalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === pendingCurrentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPendingCurrentPage(page)}
                            className={`w-10 h-10 ${
                              page === pendingCurrentPage 
                                ? "bg-[#07A64F] hover:bg-[#07A64F]/90" 
                                : ""
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPendingCurrentPage(prev => Math.min(prev + 1, pendingTotalPages))}
                        disabled={pendingCurrentPage === pendingTotalPages}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Pending Configurations</h3>
                  <p className="text-gray-500 mb-4">
                    All students have been configured. New students will appear here after booking confirmations.
                  </p>
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>📊 Debug: {students?.length || 0} total students loaded</p>
                    <p>📄 Filter: students with isConfigured = false</p>
                    <p>🔍 Found: {students?.filter(s => !s.isConfigured).length || 0} unconfigured students</p>
                    <p>🔄 Last refreshed: {new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">
                      💡 Tip: If you just confirmed a multi-guest booking, click the Refresh button above to see new students.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student List & Management Tab */}
        <TabsContent value="students" className="space-y-6">
          {/* Search and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-2">
              <CardContent className="pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, room, phone, course, or institution..."
                    value={searchTerm}
                    onChange={(e) => searchStudents(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#07A64F]">{configuredStudents.length}</div>
                  <div className="text-sm text-gray-600">Configured Students</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#1295D0]">
                    {configuredStudents.filter(s => (s.currentBalance || 0) > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">With Dues</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Student List ({filteredStudents.length} students)</CardTitle>
                {filteredStudents.length > studentsPerPage && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredStudents.length > 0 ? (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Details</TableHead>
                        <TableHead>Room & Bed</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Monthly Fees</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#07A64F] to-[#1295D0] flex items-center justify-center text-white font-bold">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {student.phone}
                                </p>
                                <p className="text-xs text-gray-400">{student.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Bed className="h-4 w-4 text-[#1295D0]" />
                              <div>
                                <p className="font-medium">
                                  {student.assignedRoomNumber || student.roomNumber || 'Not assigned'}
                                </p>
                                {(student.assignedBedNumber || student.bedNumber) && (
                                  <p className="text-sm text-gray-500">
                                    {student.assignedBedNumber || student.bedNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.course || 'Not specified'}</p>
                              <p className="text-sm text-gray-500">{student.institution || ''}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">Base: ₹{Number(student.baseMonthlyFee || 0).toLocaleString()}</div>
                              {Number(student.laundryFee || 0) > 0 && (
                                <div className="text-xs text-gray-500">Laundry: ₹{Number(student.laundryFee || 0).toLocaleString()}</div>
                              )}
                              {Number(student.foodFee || 0) > 0 && (
                                <div className="text-xs text-gray-500">Food: ₹{Number(student.foodFee || 0).toLocaleString()}</div>
                              )}
                              <div className="font-medium text-[#1295D0] border-t pt-1">
                                Total: ₹{(Number(student.baseMonthlyFee || 0) + Number(student.laundryFee || 0) + Number(student.foodFee || 0)).toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(student.currentBalance || 0) > 0 ? (
                              <div className="text-red-600 font-medium">
                                Due: ₹{(student.currentBalance || 0).toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-green-600 font-medium">
                                Up to date
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                <User className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  // Populate edit form with current student data
                                  setEditForm({
                                    name: student.name || '',
                                    phone: student.phone || '',
                                    email: student.email || '',
                                    roomNumber: student.roomNumber || '',
                                    address: student.address || '',
                                    status: student.status || 'Active',
                                    guardian: {
                                      name: student.guardian?.name || student.guardianName || '',
                                      phone: student.guardian?.phone || student.guardianPhone || '',
                                      relation: student.guardian?.relation || ''
                                    },
                                    course: student.course || '',
                                    institution: student.institution || ''
                                  });
                                  setShowEditDialog(true);
                                }}
                                className="text-[#07A64F] border-[#07A64F]/30 hover:bg-[#07A64F]/10"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  {filteredStudents.length > studentsPerPage && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 p-0 ${currentPage === page
                                  ? "bg-[#1295D0] hover:bg-[#1295D0]/90"
                                  : "hover:bg-gray-100"
                                }`}
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
                          className="flex items-center gap-1"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No students found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No configured students yet. Complete charge configuration for pending students.'}
                  </p>
                  {!searchTerm && pendingStudents.length > 0 && (
                    <Button
                      onClick={() => setActiveTab("pending")}
                      className="mt-4 bg-[#07A64F] hover:bg-[#07A64F]/90"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Pending Students
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Details Dialog */}
      {selectedStudent && (
        <Dialog open={showDetailsDialog} onOpenChange={(open) => {
          if (!open) {
            setSelectedStudent(null);
            setShowDetailsDialog(false);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Student Details - {selectedStudent.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Student Header */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#07A64F] to-[#1295D0] flex items-center justify-center text-white font-bold text-xl">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                  <Badge variant={selectedStudent.status === 'Active' ? 'default' : 'secondary'}>
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span>{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Address:</span>
                      <span>{selectedStudent.address || 'Not provided'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Room & Academic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bed className="h-5 w-5" />
                      Room & Academic Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Room Number:</span>
                      <p className="font-medium text-lg">
                        {selectedStudent.assignedRoomNumber || selectedStudent.roomNumber || 'Not assigned'}
                      </p>
                      {(selectedStudent.assignedBedNumber || selectedStudent.bedNumber) && (
                        <p className="text-sm text-gray-500">
                          Bed: {selectedStudent.assignedBedNumber || selectedStudent.bedNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Course:</span>
                      <p>{selectedStudent.course || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Institution:</span>
                      <p>{selectedStudent.institution || 'Not specified'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Guardian Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Guardian Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium">{selectedStudent.guardian?.name || selectedStudent.guardianName || 'Not provided'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span>{selectedStudent.guardian?.phone || selectedStudent.guardianPhone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Relation:</span>
                      <p className="font-medium">{selectedStudent.guardian?.relation || 'Not specified'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Emergency:</span>
                      <span>{selectedStudent.emergencyContact || 'Not provided'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Base Monthly Fee:</span>
                        <span className="font-medium">₹{(selectedStudent.baseMonthlyFee || 0).toLocaleString()}</span>
                      </div>
                      {(selectedStudent.laundryFee || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Laundry Fee:</span>
                          <span>₹{(selectedStudent.laundryFee || 0).toLocaleString()}</span>
                        </div>
                      )}
                      {(selectedStudent.foodFee || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Food Fee:</span>
                          <span>₹{(selectedStudent.foodFee || 0).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Monthly:</span>
                        <span className="font-bold text-[#1295D0]">₹{(Number(selectedStudent.baseMonthlyFee || 0) + Number(selectedStudent.laundryFee || 0) + Number(selectedStudent.foodFee || 0)).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {(selectedStudent.currentBalance || 0) > 0 ? (
                        <div className="flex justify-between text-red-600">
                          <span className="font-medium">Outstanding Due:</span>
                          <span className="font-bold">₹{(selectedStudent.currentBalance || 0).toLocaleString()}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-green-600">
                          <span className="font-medium">Payment Status:</span>
                          <span className="font-medium">Up to date</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Student Dialog */}
      {selectedStudent && (
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          if (!open) {
            setSelectedStudent(null);
            setShowEditDialog(false);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#07A64F]" />
                Edit Student Details - {selectedStudent.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name *</Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number *</Label>
                      <Input
                        id="edit-phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email Address *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Textarea
                      id="edit-address"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter full address"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Room & Status Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Room & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-room">Room Number</Label>
                      <Input
                        id="edit-room"
                        value={editForm.roomNumber}
                        onChange={(e) => setEditForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                        placeholder="Enter room number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value: 'Active' | 'Inactive' | 'Suspended' | 'Graduated') =>
                          setEditForm(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                          <SelectItem value="Graduated">Graduated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guardian Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Guardian Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-guardian-name">Guardian Name</Label>
                      <Input
                        id="edit-guardian-name"
                        value={editForm.guardian.name}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          guardian: { ...prev.guardian, name: e.target.value }
                        }))}
                        placeholder="Enter guardian's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-guardian-phone">Guardian Phone</Label>
                      <Input
                        id="edit-guardian-phone"
                        value={editForm.guardian.phone}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          guardian: { ...prev.guardian, phone: e.target.value }
                        }))}
                        placeholder="Enter guardian's phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-guardian-relation">Relation</Label>
                      <Select
                        value={editForm.guardian.relation}
                        onValueChange={(value) =>
                          setEditForm(prev => ({
                            ...prev,
                            guardian: { ...prev.guardian, relation: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Brother">Brother</SelectItem>
                          <SelectItem value="Sister">Sister</SelectItem>
                          <SelectItem value="Uncle">Uncle</SelectItem>
                          <SelectItem value="Aunt">Aunt</SelectItem>
                          <SelectItem value="Grandfather">Grandfather</SelectItem>
                          <SelectItem value="Grandmother">Grandmother</SelectItem>
                          <SelectItem value="Cousin">Cousin</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-course">Course</Label>
                      <Input
                        id="edit-course"
                        value={editForm.course}
                        onChange={(e) => setEditForm(prev => ({ ...prev, course: e.target.value }))}
                        placeholder="e.g., B.Tech Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-institution">Institution</Label>
                      <Input
                        id="edit-institution"
                        value={editForm.institution}
                        onChange={(e) => setEditForm(prev => ({ ...prev, institution: e.target.value }))}
                        placeholder="e.g., ABC University"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  onClick={handleUpdateStudent}
                  disabled={isUpdating || !editForm.name.trim() || !editForm.phone.trim() || !editForm.email.trim()}
                  className="bg-[#07A64F] hover:bg-[#07A64F]/90 flex-1"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Student
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Charge Configuration Dialog */}
      <Dialog open={showChargeConfigDialog} onOpenChange={setShowChargeConfigDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Charges - {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedStudent && (
              <ChargeConfigurationForm
                student={selectedStudent}
                onComplete={completeChargeConfiguration}
                onCancel={() => setShowChargeConfigDialog(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;