import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mealPlanApiService, MealPlan, CreateMealPlanDto } from '@/services/mealPlanApiService';
import {
  Utensils,
  Coffee,
  Sun,
  Cookie,
  Moon,
  Plus,
  Save,
  Trash2,
  Edit,
  Calendar,
  Check,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  snacks: Cookie,
  dinner: Moon
};

export const MealPlanManagement = () => {
  const { toast } = useToast();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for each day
  const [formData, setFormData] = useState<Record<string, CreateMealPlanDto>>({});

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      setIsLoading(true);
      const plans = await mealPlanApiService.getWeeklyMealPlan();
      console.log('📋 Loaded meal plans:', plans);
      setMealPlans(plans);

      // Initialize form data with existing plans
      const initialFormData: Record<string, CreateMealPlanDto> = {};
      DAYS_OF_WEEK.forEach(day => {
        const existingPlan = plans.find(p => p.day === day);
        initialFormData[day] = existingPlan ? {
          day,
          breakfast: existingPlan.breakfast,
          lunch: existingPlan.lunch,
          snacks: existingPlan.snacks,
          dinner: existingPlan.dinner,
          notes: existingPlan.notes || '',
          isActive: existingPlan.isActive
        } : {
          day,
          breakfast: '',
          lunch: '',
          snacks: '',
          dinner: '',
          notes: '',
          isActive: true
        };
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error loading meal plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meal plans',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (day: string, field: keyof CreateMealPlanDto, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSaveDay = async (day: string) => {
    try {
      setIsSaving(true);
      const data = formData[day];
      const existingPlan = mealPlans.find(p => p.day === day);

      if (existingPlan && existingPlan.id) {
        // Update existing plan
        console.log('Updating meal plan:', existingPlan.id, data);
        await mealPlanApiService.updateMealPlan(existingPlan.id, data);
        toast({
          title: 'Success',
          description: `${day}'s meal plan updated successfully`
        });
      } else {
        // Create new plan (either no existing plan or missing ID)
        console.log('Creating new meal plan for', day, data);
        await mealPlanApiService.createMealPlan(data);
        toast({
          title: 'Success',
          description: `${day}'s meal plan created successfully`
        });
      }

      await loadMealPlans();
      setEditingDay(null);
    } catch (error: any) {
      console.error('Error saving meal plan:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save meal plan',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDay = async (day: string) => {
    const existingPlan = mealPlans.find(p => p.day === day);
    if (!existingPlan) return;

    if (!confirm(`Are you sure you want to delete ${day}'s meal plan?`)) return;

    try {
      await mealPlanApiService.deleteMealPlan(existingPlan.id);
      toast({
        title: 'Success',
        description: `${day}'s meal plan deleted successfully`
      });
      await loadMealPlans();
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete meal plan',
        variant: 'destructive'
      });
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const weeklyData = DAYS_OF_WEEK.map(day => formData[day]);
      await mealPlanApiService.createWeeklyMealPlan(weeklyData);
      toast({
        title: 'Success',
        description: 'Weekly meal plan saved successfully'
      });
      await loadMealPlans();
      setEditingDay(null);
    } catch (error: any) {
      console.error('Error saving weekly meal plan:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save weekly meal plan',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderMealField = (day: string, mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner', label: string) => {
    const Icon = MEAL_ICONS[mealType];
    const isEditing = editingDay === day;
    const value = formData[day]?.[mealType] || '';

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3 w-3 text-gray-500" />
          <Label className="text-xs font-medium text-gray-700">{label}</Label>
        </div>
        {isEditing ? (
          <Input
            value={value}
            onChange={(e) => handleInputChange(day, mealType, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()} menu`}
            className="text-xs h-8"
          />
        ) : (
          <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded border min-h-[28px] flex items-center">
            {value || <span className="text-gray-400 italic">Not set</span>}
          </p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600">Loading meal plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Utensils className="h-8 w-8 text-orange-500" />
            Meal Plan Management
          </h1>
          <p className="text-gray-600 mt-1">Manage weekly meal plans for your hostel</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadMealPlans}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">
                Set up your weekly meal plan to keep students informed about daily meals
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Click "Edit" on any day to modify the meal plan, or use "Save All Changes" to update the entire week at once.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Meal Plan Grid - More Compact Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const existingPlan = mealPlans.find(p => p.day === day);
          const isEditing = editingDay === day;
          const dayData = formData[day];

          return (
            <Card key={day} className={`transition-all ${isEditing ? 'ring-2 ring-orange-500 shadow-lg' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <CardTitle className="text-lg">{day}</CardTitle>
                    {existingPlan && (
                      <Badge variant={existingPlan.isActive ? 'default' : 'secondary'} className="text-xs">
                        {existingPlan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingDay(null);
                            loadMealPlans(); // Reset form
                          }}
                          className="gap-1"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveDay(day)}
                          disabled={isSaving}
                          className="gap-1 bg-orange-500 hover:bg-orange-600"
                        >
                          <Check className="h-3 w-3" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDay(day)}
                          className="gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        {existingPlan && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDay(day)}
                            className="gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {renderMealField(day, 'breakfast', 'Breakfast')}
                {renderMealField(day, 'lunch', 'Lunch')}
                {renderMealField(day, 'snacks', 'Snacks')}
                {renderMealField(day, 'dinner', 'Dinner')}

                {/* Notes - Only show if editing or has content */}
                {(isEditing || dayData?.notes) && (
                  <div className="space-y-1 pt-2 border-t">
                    <Label className="text-xs font-medium text-gray-700">Notes</Label>
                    {isEditing ? (
                      <Textarea
                        value={dayData?.notes || ''}
                        onChange={(e) => handleInputChange(day, 'notes', e.target.value)}
                        placeholder="Add special notes or dietary info"
                        className="text-xs min-h-[40px] h-10"
                      />
                    ) : (
                      <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded border">
                        {dayData?.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Active Toggle */}
                {isEditing && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id={`active-${day}`}
                      checked={dayData?.isActive ?? true}
                      onChange={(e) => handleInputChange(day, 'isActive', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`active-${day}`} className="text-sm cursor-pointer">
                      Active (visible to students)
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
