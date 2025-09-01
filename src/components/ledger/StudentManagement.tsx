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
import { Search, User, Phone, Mail, CreditCard, Home, Settings, Edit, Bed, Users, CheckCircle, Plus, Trash2, DollarSign, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { monthlyInvoiceService } from "@/services/monthlyInvoiceService.js";
import { mockData } from "@/data/mockData.js";

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  roomNumber: string;
  bedNumber?: string;
  course: string;
  institution: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;
  baseMonthlyFee: number;
  laundryFee: number;
  foodFee: number;
  joinDate: string;
  status: string;
  isCheckedOut: boolean;
  isConfigured?: boolean;
  configurationDate?: string;
  billingStartDate?: string;
  currentBalance: number;
  totalPaid: number;
  totalDue: number;
  lastPaymentDate: string;
  additionalCharges?: any[];
  wifiFee?: number;
  maintenanceFee?: number;
  securityDeposit?: number;
  totalMonthlyFee?: number;
}

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

// Student Edit Form Component
interface StudentEditFormProps {
  student: Student;
  rooms: Room[];
  onSave: (studentId: string, updatedData: any) => void;
  onCancel: () => void;
}

const StudentEditForm = ({ student, rooms, onSave, onCancel }: StudentEditFormProps) => {
  const [editData, setEditData] = useState({
    name: student.name,
    phone: student.phone,
    email: student.email,
    address: student.address,
    roomNumber: student.roomNumber,
    bedNumber: student.bedNumber || '',
    course: student.course,
    institution: student.institution,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    emergencyContact: student.emergencyContact,
    baseMonthlyFee: student.baseMonthlyFee,
    laundryFee: student.laundryFee,
    foodFee: student.foodFee
  });

  const [additionalCharges, setAdditionalCharges] = useState<ChargeItem[]>([
    { id: '1', description: '', amount: 0 }
  ]);

  const [showChargeConfirmation, setShowChargeConfirmation] = useState(false);
  const [hasChargeChanges, setHasChargeChanges] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check if charge-related fields have changed
    if (['baseMonthlyFee', 'laundryFee', 'foodFee'].includes(field)) {
      const originalCharges = student.baseMonthlyFee + student.laundryFee + student.foodFee;
      const newCharges = (field === 'baseMonthlyFee' ? Number(value) : editData.baseMonthlyFee) +
                        (field === 'laundryFee' ? Number(value) : editData.laundryFee) +
                        (field === 'foodFee' ? Number(value) : editData.foodFee);
      setHasChargeChanges(newCharges !== originalCharges);
    }
  };

  const handleAdditionalChargeChange = (id: string, field: 'description' | 'amount', value: string | number) => {
    setAdditionalCharges(prev => prev.map(charge => 
      charge.id === id 
        ? { ...charge, [field]: value }
        : charge
    ));
    setHasChargeChanges(true);
  };

  const addNewChargeField = () => {
    const newId = Date.now().toString();
    setAdditionalCharges(prev => [...prev, { id: newId, description: '', amount: 0 }]);
  };

  const removeChargeField = (id: string) => {
    if (additionalCharges.length > 1) {
      setAdditionalCharges(prev => prev.filter(charge => charge.id !== id));
      setHasChargeChanges(true);
    }
  };

  // Get available rooms (including current room)
  const getAvailableRooms = () => {
    return rooms.filter(room => 
      room.availableBeds > 0 || room.roomNumber === student.roomNumber
    );
  };

  // Get room info for selected room
  const getSelectedRoomInfo = () => {
    return rooms.find(room => room.roomNumber === editData.roomNumber);
  };

  const calculateTotalMonthlyFee = () => {
    const baseTotal = editData.baseMonthlyFee + editData.laundryFee + editData.foodFee;
    const additionalTotal = additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    return baseTotal + additionalTotal;
  };

  const handleSave = () => {
    if (hasChargeChanges) {
      setShowChargeConfirmation(true);
    } else {
      const validAdditionalCharges = additionalCharges.filter(charge => 
        charge.description.trim() !== '' && charge.amount > 0
      );
      
      const updatedData = {
        ...editData,
        additionalCharges: validAdditionalCharges,
        totalDue: calculateTotalMonthlyFee()
      };
      
      onSave(student.id, updatedData);
    }
  };

  const confirmSave = () => {
    const validAdditionalCharges = additionalCharges.filter(charge => 
      charge.description.trim() !== '' && charge.amount > 0
    );
    
    const updatedData = {
      ...editData,
      additionalCharges: validAdditionalCharges,
      totalDue: calculateTotalMonthlyFee()
    };
    
    onSave(student.id, updatedData);
    setShowChargeConfirmation(false);
  };

  const selectedRoom = getSelectedRoomInfo();

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#07A64F] to-[#1295D0] rounded-full flex items-center justify-center text-white font-bold text-xl">
            {editData.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#231F20]">Edit Student - {student.name}</h3>
            <p className="text-gray-600">{student.id}</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={editData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={editData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={editData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course/Program</Label>
              <Input
                id="course"
                value={editData.course}
                onChange={(e) => handleInputChange('course', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution/University</Label>
              <Input
                id="institution"
                value={editData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room & Bed Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Room & Bed Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Select
                value={editData.roomNumber}
                onValueChange={(value) => handleInputChange('roomNumber', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRooms().map((room) => (
                    <SelectItem key={room.id} value={room.roomNumber}>
                      {room.roomNumber} - {room.name} 
                      {room.roomNumber === student.roomNumber ? ' (Current)' : ` (${room.availableBeds} beds available)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedNumber">Bed Number</Label>
              <Input
                id="bedNumber"
                value={editData.bedNumber}
                onChange={(e) => handleInputChange('bedNumber', e.target.value)}
                placeholder="e.g., Bed 1, Bed A"
              />
            </div>
          </div>
          
          {/* Room Info Display */}
          {selectedRoom && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Room Details:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Type:</span>
                  <p className="font-medium">{selectedRoom.type}</p>
                </div>
                <div>
                  <span className="text-blue-600">Gender:</span>
                  <p className="font-medium">{selectedRoom.gender}</p>
                </div>
                <div>
                  <span className="text-blue-600">Available Beds:</span>
                  <p className="font-medium">{selectedRoom.availableBeds}/{selectedRoom.bedCount}</p>
                </div>
                <div>
                  <span className="text-blue-600">Monthly Rate:</span>
                  <p className="font-medium">NPR {selectedRoom.monthlyRate.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-blue-600">Amenities:</span>
                <p className="text-sm">{selectedRoom.amenities.join(', ')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guardian Information */}
      <Card>
        <CardHeader>
          <CardTitle>Guardian Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={editData.guardianName}
                onChange={(e) => handleInputChange('guardianName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                value={editData.guardianPhone}
                onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={editData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charge Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monthly Charge Configuration
            {hasChargeChanges && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Changes Detected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseMonthlyFee">Base Monthly Fee (NPR)</Label>
              <Input
                id="baseMonthlyFee"
                type="number"
                value={editData.baseMonthlyFee}
                onChange={(e) => handleInputChange('baseMonthlyFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="laundryFee">Laundry Fee (NPR)</Label>
              <Input
                id="laundryFee"
                type="number"
                value={editData.laundryFee}
                onChange={(e) => handleInputChange('laundryFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foodFee">Food Fee (NPR)</Label>
              <Input
                id="foodFee"
                type="number"
                value={editData.foodFee}
                onChange={(e) => handleInputChange('foodFee', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Additional Charges */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Additional Charges</h4>
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
            </div>
            
            {additionalCharges.map((charge) => (
              <div key={charge.id} className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`desc-${charge.id}`}>Service/Item Description</Label>
                  <Input
                    id={`desc-${charge.id}`}
                    placeholder="e.g., Parking Fee, Gym Access, etc."
                    value={charge.description}
                    onChange={(e) => handleAdditionalChargeChange(charge.id, 'description', e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`amount-${charge.id}`}>Amount (NPR)</Label>
                  <Input
                    id={`amount-${charge.id}`}
                    type="number"
                    placeholder="0"
                    value={charge.amount}
                    onChange={(e) => handleAdditionalChargeChange(charge.id, 'amount', parseFloat(e.target.value) || 0)}
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
          </div>

          {/* Fee Summary */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-green-800 font-medium">Total Monthly Fee:</span>
              <span className="text-2xl font-bold text-green-900">
                NPR {calculateTotalMonthlyFee().toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <Button
          onClick={handleSave}
          className="bg-[#07A64F] hover:bg-[#07A64F]/90 flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>

      {/* Charge Confirmation Dialog */}
      <AlertDialog open={showChargeConfirmation} onOpenChange={setShowChargeConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirm Charge Configuration Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>You have made changes to the student's monthly charges:</p>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Previous Total:</span>
                    <span>NPR {(student.baseMonthlyFee + student.laundryFee + student.foodFee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>New Total:</span>
                    <span>NPR {calculateTotalMonthlyFee().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm">
                <strong>Are you sure you want to save these charge configuration changes?</strong>
              </p>
              <p className="text-xs text-gray-500">
                This will affect future billing for this student.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSave}
              className="bg-[#07A64F] hover:bg-[#07A64F]/90"
            >
              Yes, Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Charge Configuration Form Component
interface ChargeItem {
  id: string;
  description: string;
  amount: number;
}

interface ChargeConfigurationFormProps {
  student: Student;
  onComplete: (studentId: string, chargeData: any) => void;
  onCancel: () => void;
}

const ChargeConfigurationForm = ({ student, onComplete, onCancel }: ChargeConfigurationFormProps) => {
  const [baseCharges, setBaseCharges] = useState({
    baseMonthlyFee: 15000,
    laundryFee: 2000,
    foodFee: 8000,
    wifiFee: 1000,
    maintenanceFee: 500,
    securityDeposit: 10000
  });

  const [additionalCharges, setAdditionalCharges] = useState<ChargeItem[]>([
    { id: '1', description: '', amount: 0 },
    { id: '2', description: '', amount: 0 },
    { id: '3', description: '', amount: 0 }
  ]);

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
      totalMonthlyFee
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
            <p className="text-sm text-gray-600">{student.roomNumber} • {student.course}</p>
          </div>
        </div>
      </div>

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
              <Label htmlFor="baseFee">Base Monthly Fee (NPR) *</Label>
              <Input 
                id="baseFee" 
                type="number" 
                value={baseCharges.baseMonthlyFee}
                onChange={(e) => handleBaseChargeChange('baseMonthlyFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="laundryFee">Laundry Fee (NPR)</Label>
              <Input 
                id="laundryFee" 
                type="number" 
                value={baseCharges.laundryFee}
                onChange={(e) => handleBaseChargeChange('laundryFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foodFee">Food Fee (NPR)</Label>
              <Input 
                id="foodFee" 
                type="number" 
                value={baseCharges.foodFee}
                onChange={(e) => handleBaseChargeChange('foodFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wifiFee">WiFi Fee (NPR)</Label>
              <Input 
                id="wifiFee" 
                type="number" 
                value={baseCharges.wifiFee}
                onChange={(e) => handleBaseChargeChange('wifiFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceFee">Maintenance Fee (NPR)</Label>
              <Input 
                id="maintenanceFee" 
                type="number" 
                value={baseCharges.maintenanceFee}
                onChange={(e) => handleBaseChargeChange('maintenanceFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit (NPR)</Label>
              <Input 
                id="securityDeposit" 
                type="number" 
                value={baseCharges.securityDeposit}
                onChange={(e) => handleBaseChargeChange('securityDeposit', parseFloat(e.target.value) || 0)}
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
                <Label htmlFor={`amount-${charge.id}`}>Amount (NPR)</Label>
                <Input
                  id={`amount-${charge.id}`}
                  type="number"
                  placeholder="0"
                  value={charge.amount}
                  onChange={(e) => handleAdditionalChargeChange(charge.id, 'amount', parseFloat(e.target.value) || 0)}
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
                  <span>NPR {baseCharges.baseMonthlyFee.toLocaleString()}</span>
                </div>
              )}
              {baseCharges.laundryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Laundry Fee:</span>
                  <span>NPR {baseCharges.laundryFee.toLocaleString()}</span>
                </div>
              )}
              {baseCharges.foodFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Food Fee:</span>
                  <span>NPR {baseCharges.foodFee.toLocaleString()}</span>
                </div>
              )}
              {baseCharges.wifiFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>WiFi Fee:</span>
                  <span>NPR {baseCharges.wifiFee.toLocaleString()}</span>
                </div>
              )}
              {baseCharges.maintenanceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Maintenance Fee:</span>
                  <span>NPR {baseCharges.maintenanceFee.toLocaleString()}</span>
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
                      <span>NPR {charge.amount.toLocaleString()}</span>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Total */}
            <div className="border-t border-green-300 pt-3 flex justify-between font-bold text-lg">
              <span>Total Monthly Fee:</span>
              <span className="text-green-800">NPR {calculateTotalMonthlyFee().toLocaleString()}</span>
            </div>

            {/* Security Deposit */}
            {baseCharges.securityDeposit > 0 && (
              <div className="flex justify-between text-blue-600 border-t border-green-300 pt-2">
                <span>One-time Security Deposit:</span>
                <span>NPR {baseCharges.securityDeposit.toLocaleString()}</span>
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
  const [activeTab, setActiveTab] = useState("pending");
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showChargeConfigDialog, setShowChargeConfigDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Separate students into pending configuration and configured
  const pendingStudents = students.filter(student => !student.isConfigured);
  const configuredStudents = students.filter(student => student.isConfigured);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Use mock students data
        const processedStudents = mockData.students
          .filter((s: Student) => !s.isCheckedOut)
          .map((student: Student, index: number) => ({
            ...student,
            // First student is pending configuration, others are configured
            isConfigured: index !== 0
          }));
        
        setStudents(processedStudents);

        // Use mock rooms data
        const mockRooms = [
          {
            id: "room_001",
            name: "Room A-101",
            roomNumber: "A-101",
            bedCount: 2,
            occupancy: 1,
            availableBeds: 1,
            type: "Standard",
            monthlyRate: 12000,
            gender: "Male",
            amenities: ["WiFi", "AC", "Study Table"]
          },
          {
            id: "room_002",
            name: "Room B-205",
            roomNumber: "B-205",
            bedCount: 2,
            occupancy: 1,
            availableBeds: 1,
            type: "Premium",
            monthlyRate: 15000,
            gender: "Female",
            amenities: ["WiFi", "AC", "Study Table", "Balcony"]
          },
          {
            id: "room_003",
            name: "Room C-301",
            roomNumber: "C-301",
            bedCount: 2,
            occupancy: 1,
            availableBeds: 1,
            type: "Deluxe",
            monthlyRate: 18000,
            gender: "Male",
            amenities: ["WiFi", "AC", "Study Table", "Balcony", "Attached Bathroom"]
          }
        ];
        setRooms(mockRooms);
        
        // Check URL parameters for direct navigation to specific student
        const params = new URLSearchParams(window.location.search);
        const studentParam = params.get('student');
        if (studentParam) {
          const targetStudent = processedStudents.find((s: Student) => s.id === studentParam);
          if (targetStudent && !targetStudent.isConfigured) {
            setActiveTab("pending");
            // Auto-open charge configuration for the student
            setTimeout(() => {
              setSelectedStudent(targetStudent);
              setShowChargeConfigDialog(true);
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter configured students based on search
  const filteredStudents = configuredStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Edit student
  const editStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditDialog(true);
  };

  // Configure charges
  const configureCharges = (student: Student) => {
    setSelectedStudent(student);
    setShowChargeConfigDialog(true);
  };

  // Complete charge configuration
  const completeChargeConfiguration = async (studentId: string, chargeData: any) => {
    try {
      const configurationDate = new Date().toISOString().split('T')[0];
      
      // Update student as configured
      const updatedStudent = {
        isConfigured: true,
        configurationDate: configurationDate,
        baseMonthlyFee: chargeData.baseMonthlyFee,
        laundryFee: chargeData.laundryFee,
        foodFee: chargeData.foodFee,
        wifiFee: chargeData.wifiFee || 0,
        maintenanceFee: chargeData.maintenanceFee || 0,
        securityDeposit: chargeData.securityDeposit || 0,
        additionalCharges: chargeData.additionalCharges || [],
        totalMonthlyFee: chargeData.totalMonthlyFee,
        totalDue: chargeData.totalMonthlyFee,
        billingStartDate: monthlyInvoiceService.getNextBillingDate(configurationDate).toISOString().split('T')[0]
      };

      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, ...updatedStudent }
          : student
      ));

      // Generate initial billing workflow
      const student = students.find(s => s.id === studentId);
      if (student) {
        const billingResult = await monthlyInvoiceService.processBillingWorkflow(
          { ...student, ...updatedStudent },
          'configuration',
          configurationDate,
          chargeData.additionalCharges || []
        );

        console.log('📊 Billing Workflow Result:', billingResult);
        
        // Show detailed success message with billing info
        toast.success(
          `Student charges configured successfully! 
          ${billingResult.message}`,
          {
            duration: 5000,
          }
        );
      }
      
      setShowChargeConfigDialog(false);
      setSelectedStudent(null);
      
      // Switch to student list tab to show the configured student
      setActiveTab("students");
      
    } catch (error) {
      console.error('Error in charge configuration:', error);
      toast.error('Failed to complete charge configuration. Please try again.');
    }
  };

  // Save student changes
  const saveStudentChanges = (studentId: string, updatedData: any) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            ...updatedData,
            totalDue: updatedData.baseMonthlyFee + updatedData.laundryFee + updatedData.foodFee
          }
        : student
    ));
    
    setShowEditDialog(false);
    setSelectedStudent(null);
    
    toast.success("Student information updated successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="relative">
            <svg width="32" height="48" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse mx-auto">
              <g clipPath="url(#clip0_319_901)">
                <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F"/>
                <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F"/>
                <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20"/>
                <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#1295D0"/>
                <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white"/>
                <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20"/>
              </g>
              <defs>
                <clipPath id="clip0_319_901">
                  <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)"/>
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
            {students.length} Total Students
          </Badge>
          <Badge variant="outline" className="text-[#07A64F] border-[#07A64F]/30">
            {students.filter(s => s.status === 'active').length} Active
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
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#07A64F]" />
                Students Pending Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingStudents.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    These students have been approved from booking requests and need charge configuration to complete their enrollment.
                  </p>
                  
                  {pendingStudents.map((student) => (
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
                                <p className="text-sm text-gray-600">{student.id}</p>
                                <p className="text-xs text-gray-500">{student.phone}</p>
                              </div>
                            </div>
                          </div>

                          {/* Room & Course Info */}
                          <div className="lg:col-span-3">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Bed className="h-4 w-4 text-[#1295D0]" />
                                <span className="font-medium">{student.roomNumber}</span>
                                {student.bedNumber && <span className="text-sm text-gray-500">({student.bedNumber})</span>}
                              </div>
                              <p className="text-sm text-gray-600">{student.course}</p>
                              <p className="text-xs text-gray-500">{student.institution}</p>
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
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Pending Configurations</h3>
                  <p className="text-gray-500">
                    All students have been configured. New students from booking approvals will appear here.
                  </p>
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
                    placeholder="Search by name, ID, room, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    {configuredStudents.filter(s => s.currentBalance > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">With Dues</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Student List ({filteredStudents.length} students)
                {totalPages > 1 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    - Page {currentPage} of {totalPages}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStudents.length > 0 ? (
                <>
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
                              <p className="text-xs text-gray-400">{student.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-[#1295D0]" />
                            <div>
                              <p className="font-medium">{student.roomNumber}</p>
                              {student.bedNumber && (
                                <p className="text-sm text-gray-500">{student.bedNumber}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.course}</p>
                            <p className="text-sm text-gray-500">{student.institution}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">Base: ₹{student.baseMonthlyFee.toFixed(2)}</div>
                            {student.laundryFee > 0 && (
                              <div className="text-xs text-gray-500">Laundry: ₹{student.laundryFee.toFixed(2)}</div>
                            )}
                            {student.foodFee > 0 && (
                              <div className="text-xs text-gray-500">Food: ₹{student.foodFee.toFixed(2)}</div>
                            )}
                            <div className="font-medium text-[#1295D0] border-t pt-1">
                              Total Monthly: ₹{(student.baseMonthlyFee + student.laundryFee + student.foodFee).toFixed(2)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.currentBalance > 0 ? (
                              <div className="text-red-600 font-medium">
                                Due: ₹{student.currentBalance.toFixed(2)}
                              </div>
                            ) : (
                              <div className="text-green-600 font-medium">
                                Up to date
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Payment Status: {student.currentBalance > 0 ? 'Outstanding' : 'Paid'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
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
                              onClick={() => editStudent(student)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-4 py-3 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                </>
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
                  <p className="text-gray-600">ID: {selectedStudent.id}</p>
                  <Badge variant={selectedStudent.status === 'active' ? 'default' : 'secondary'}>
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
                      <span>{selectedStudent.address}</span>
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
                      <p className="font-medium text-lg">{selectedStudent.roomNumber}</p>
                      {selectedStudent.bedNumber && (
                        <p className="text-sm text-gray-500">Bed: {selectedStudent.bedNumber}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Course:</span>
                      <p>{selectedStudent.course}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Institution:</span>
                      <p>{selectedStudent.institution}</p>
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
                      <p className="font-medium">{selectedStudent.guardianName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span>{selectedStudent.guardianPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Emergency:</span>
                      <span>{selectedStudent.emergencyContact}</span>
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
                        <span className="font-medium">NPR {selectedStudent.baseMonthlyFee.toLocaleString()}</span>
                      </div>
                      {selectedStudent.laundryFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Laundry Fee:</span>
                          <span>NPR {selectedStudent.laundryFee.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedStudent.foodFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Food Fee:</span>
                          <span>NPR {selectedStudent.foodFee.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Monthly:</span>
                        <span className="font-bold text-[#1295D0]">NPR {(selectedStudent.baseMonthlyFee + selectedStudent.laundryFee + selectedStudent.foodFee).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      {selectedStudent.currentBalance > 0 ? (
                        <div className="flex justify-between text-red-600">
                          <span className="font-medium">Outstanding Due:</span>
                          <span className="font-bold">NPR {selectedStudent.currentBalance.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-green-600">
                          <span className="font-medium">Payment Status:</span>
                          <span className="font-medium">Up to date</span>
                        </div>
                      )}
                      
                      {/* Billing Information */}
                      {selectedStudent.configurationDate && (
                        <div className="mt-4 pt-3 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-blue-900">Billing Information</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Configuration Date:</span>
                              <span>{new Date(selectedStudent.configurationDate).toLocaleDateString()}</span>
                            </div>
                            {selectedStudent.billingStartDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Billing Start Date:</span>
                                <span>{new Date(selectedStudent.billingStartDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Billing Status:</span>
                              <span className={selectedStudent.isCheckedOut ? "text-red-600" : "text-green-600"}>
                                {selectedStudent.isCheckedOut ? "Stopped (Checked Out)" : "Active"}
                              </span>
                            </div>
                          </div>
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
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#07A64F]" />
              Edit Student - {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <StudentEditForm
              student={selectedStudent}
              rooms={rooms}
              onSave={saveStudentChanges}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedStudent(null);
                setShowDetailsDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

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

      {/* Footer Section */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#07A64F] to-[#1295D0] flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Student Management System</h3>
                <p className="text-sm text-gray-600">
                  Manage student records, configure charges, and track payments efficiently
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#07A64F]">{students.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
              <div className="text-xs text-gray-500 mt-1">
                {students.filter(s => s.isConfigured).length} Configured • {students.filter(s => !s.isConfigured).length} Pending
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Active Students: </span>
                <span className="font-medium">{students.filter(s => s.status === 'active').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                <span className="text-gray-600">With Outstanding Dues: </span>
                <span className="font-medium">{students.filter(s => s.currentBalance > 0).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Last Updated: </span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};