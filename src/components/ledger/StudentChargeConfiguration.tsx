import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/SafeAppContext";
import { studentService } from "@/services/studentService";
import { billingService } from "@/services/billingService";
import { 
  DollarSign, 
  Settings, 
  Save, 
  Calculator, 
  Home, 
  Utensils, 
  Shirt, 
  Wifi, 
  Car,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";

interface StudentChargeConfigurationProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ChargeItem {
  id: string;
  name: string;
  amount: number;
  type: 'monthly' | 'one-time' | 'variable';
  category: 'accommodation' | 'food' | 'laundry' | 'utilities' | 'services' | 'other';
  description: string;
  isActive: boolean;
}

export const StudentChargeConfiguration = ({ 
  studentId, 
  isOpen, 
  onClose, 
  onSuccess 
}: StudentChargeConfigurationProps) => {
  const { state, refreshAllData } = useAppContext();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [student, setStudent] = useState(null);
  
  // Charge configuration state
  const [charges, setCharges] = useState<ChargeItem[]>([
    {
      id: 'base_rent',
      name: 'Base Monthly Rent',
      amount: 8000,
      type: 'monthly',
      category: 'accommodation',
      description: 'Basic room accommodation charges',
      isActive: true
    },
    {
      id: 'food_charges',
      name: 'Food Charges',
      amount: 3000,
      type: 'monthly',
      category: 'food',
      description: 'Monthly meal charges',
      isActive: true
    },
    {
      id: 'laundry_charges',
      name: 'Laundry Service',
      amount: 500,
      type: 'monthly',
      category: 'laundry',
      description: 'Monthly laundry service',
      isActive: false
    },
    {
      id: 'wifi_charges',
      name: 'WiFi & Internet',
      amount: 300,
      type: 'monthly',
      category: 'utilities',
      description: 'High-speed internet access',
      isActive: true
    },
    {
      id: 'parking_charges',
      name: 'Parking Fee',
      amount: 200,
      type: 'monthly',
      category: 'services',
      description: 'Vehicle parking charges',
      isActive: false
    }
  ]);

  const [customCharge, setCustomCharge] = useState({
    name: '',
    amount: 0,
    type: 'monthly' as const,
    category: 'other' as const,
    description: ''
  });

  const [showAddCustom, setShowAddCustom] = useState(false);

  // Load student data
  useEffect(() => {
    if (studentId && isOpen) {
      const studentData = state.students.find(s => s.id === studentId);
      if (studentData) {
        setStudent(studentData);
        
        // Load existing charges if student has them
        if (studentData.chargeConfiguration) {
          setCharges(studentData.chargeConfiguration);
        }
      }
    }
  }, [studentId, isOpen, state.students]);

  // Handle charge amount change
  const handleChargeChange = (chargeId: string, field: string, value: any) => {
    setCharges(prev => prev.map(charge => 
      charge.id === chargeId 
        ? { ...charge, [field]: value }
        : charge
    ));
  };

  // Add custom charge
  const handleAddCustomCharge = () => {
    if (!customCharge.name || customCharge.amount <= 0) {
      toast({
        title: "Invalid Charge",
        description: "Please enter a valid charge name and amount",
        variant: "destructive"
      });
      return;
    }

    const newCharge: ChargeItem = {
      id: `custom_${Date.now()}`,
      ...customCharge,
      isActive: true
    };

    setCharges(prev => [...prev, newCharge]);
    setCustomCharge({
      name: '',
      amount: 0,
      type: 'monthly',
      category: 'other',
      description: ''
    });
    setShowAddCustom(false);

    toast({
      title: "Custom Charge Added",
      description: `${newCharge.name} has been added to the charge list`
    });
  };

  // Remove custom charge
  const handleRemoveCharge = (chargeId: string) => {
    setCharges(prev => prev.filter(charge => charge.id !== chargeId));
    toast({
      title: "Charge Removed",
      description: "Custom charge has been removed"
    });
  };

  // Calculate totals
  const activeCharges = charges.filter(c => c.isActive);
  const monthlyTotal = activeCharges
    .filter(c => c.type === 'monthly')
    .reduce((sum, c) => sum + c.amount, 0);
  const oneTimeTotal = activeCharges
    .filter(c => c.type === 'one-time')
    .reduce((sum, c) => sum + c.amount, 0);

  // Save charge configuration
  const handleSaveConfiguration = async () => {
    if (!student) return;

    setIsProcessing(true);

    try {
      // Update student with charge configuration
      const updatedStudentData = {
        chargeConfiguration: charges,
        baseMonthlyFee: monthlyTotal,
        oneTimeCharges: oneTimeTotal,
        lastChargeUpdate: new Date().toISOString(),
        billingStatus: 'configured' // Mark as ready for auto-billing
      };

      await studentService.updateStudent(studentId, updatedStudentData);

      // Generate initial invoice with configured charges
      const initialInvoice = await billingService.generateInitialInvoice({
        ...student,
        ...updatedStudentData
      });

      // Update student balance
      await studentService.updateStudent(studentId, {
        currentBalance: initialInvoice.total
      });

      toast({
        title: "Charges Configured Successfully",
        description: `${student.name}'s charges have been set up. Initial invoice of NPR ${initialInvoice.total.toLocaleString()} generated.`
      });

      await refreshAllData();
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error saving charge configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save charge configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accommodation': return <Home className="h-4 w-4" />;
      case 'food': return <Utensils className="h-4 w-4" />;
      case 'laundry': return <Shirt className="h-4 w-4" />;
      case 'utilities': return <Wifi className="h-4 w-4" />;
      case 'services': return <Car className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accommodation': return 'text-blue-600 bg-blue-50';
      case 'food': return 'text-green-600 bg-green-50';
      case 'laundry': return 'text-purple-600 bg-purple-50';
      case 'utilities': return 'text-orange-600 bg-orange-50';
      case 'services': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Charges for {student.name}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Set up all monthly and one-time charges for this student. This will determine their billing cycle.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">{student.name}</h3>
                  <p className="text-sm text-blue-700">Room: {student.roomNumber} | Enrolled: {student.enrollmentDate}</p>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {student.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Charge Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charges List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Charge Configuration</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddCustom(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom
                </Button>
              </div>

              <div className="space-y-3">
                {charges.map((charge) => (
                  <Card key={charge.id} className={`border-l-4 ${charge.isActive ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getCategoryColor(charge.category)}`}>
                            {getCategoryIcon(charge.category)}
                          </div>
                          <div>
                            <h4 className="font-medium">{charge.name}</h4>
                            <p className="text-sm text-gray-600">{charge.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {charge.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {charge.category}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Input
                              type="number"
                              value={charge.amount}
                              onChange={(e) => handleChargeChange(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right"
                              disabled={!charge.isActive}
                            />
                            <p className="text-xs text-gray-500 mt-1">
              NPR per {charge.type === 'monthly' ? 'month' : charge.type === 'one-time' ? 'time' : 'occurrence'}
              {charge.type === 'monthly' && <span className="text-blue-600"> • Daily: NPR {Math.round(charge.amount / 30)}</span>}
            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={charge.isActive}
                              onChange={(e) => handleChargeChange(charge.id, 'isActive', e.target.checked)}
                              className="rounded"
                            />
                            {charge.id.startsWith('custom_') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCharge(charge.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Custom Charge Form */}
              {showAddCustom && (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Add Custom Charge</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Charge Name</Label>
                        <Input
                          value={customCharge.name}
                          onChange={(e) => setCustomCharge(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Gym Membership"
                        />
                      </div>
                      <div>
                        <Label>Amount (NPR)</Label>
                        <Input
                          type="number"
                          value={customCharge.amount}
                          onChange={(e) => setCustomCharge(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select 
                          value={customCharge.type} 
                          onValueChange={(value: any) => setCustomCharge(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="one-time">One-time</SelectItem>
                            <SelectItem value="variable">Variable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select 
                          value={customCharge.category} 
                          onValueChange={(value: any) => setCustomCharge(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accommodation">Accommodation</SelectItem>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="laundry">Laundry</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Input
                          value={customCharge.description}
                          onChange={(e) => setCustomCharge(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of the charge"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={handleAddCustomCharge}>
                        Add Charge
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddCustom(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Billing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Charges</span>
                      <span className="font-semibold">NPR {monthlyTotal.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {activeCharges.filter(c => c.type === 'monthly').length} active charges
                    </div>
                  </div>

                  {oneTimeTotal > 0 && (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">One-time Charges</span>
                        <span className="font-semibold">NPR {oneTimeTotal.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {activeCharges.filter(c => c.type === 'one-time').length} charges
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Initial Invoice</span>
                      <span className="text-lg font-bold text-green-600">
                        NPR {(monthlyTotal + oneTimeTotal).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Will be generated after saving
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Auto-billing Setup</p>
                        <p className="text-xs mt-1">
                          Monthly invoices will be generated automatically on the 1st of every month with the configured charges.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Charges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeCharges.map((charge) => (
                      <div key={charge.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{charge.name}</span>
                        <span className="font-medium">NPR {charge.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveConfiguration}
              disabled={isProcessing || activeCharges.length === 0}
            >
              {isProcessing ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration & Generate Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};