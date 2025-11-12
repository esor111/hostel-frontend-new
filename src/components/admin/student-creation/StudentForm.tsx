import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Phone, Mail, MapPin, Users, GraduationCap, CreditCard, Calendar } from 'lucide-react';
import { BedData } from '@/types/manualStudent';

const studentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  emergencyContact: z.string().optional(),
  course: z.string().optional(),
  institution: z.string().optional(),
  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),
  checkInDate: z.string().min(1, 'Check-in date is required'),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  selectedBed: BedData;
  loading: boolean;
  onSubmit: (data: StudentFormData) => void;
  onBack: () => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  selectedBed,
  loading,
  onSubmit,
  onBack
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      checkInDate: new Date().toISOString().split('T')[0]
    }
  });

  const watchedIdProofType = watch('idProofType');

  const handleFormSubmit = (data: StudentFormData) => {
    const formData = {
      ...data,
      bedId: selectedBed.bedId
    };
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header with back button and bed summary */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bed Selection
        </Button>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">Student Information</h2>
          <p className="text-gray-600">Fill in the student details</p>
        </div>
      </div>

      {/* Selected bed summary */}
      <Card className="border-[#1295D0] bg-gradient-to-r from-[#1295D0]/5 to-[#07A64F]/5">
        <CardHeader>
          <CardTitle className="text-[#1295D0]">Selected Bed Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Floor</p>
              <p className="font-semibold">{selectedBed.room.floor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-semibold">{selectedBed.room.roomNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bed</p>
              <p className="font-semibold">{selectedBed.bedIdentifier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Rate</p>
              <p className="font-semibold">NPR {selectedBed.monthlyRate.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter student's full name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+977-9876543210"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="student@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="checkInDate">Check-in Date *</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  {...register('checkInDate')}
                  className={errors.checkInDate ? 'border-red-500' : ''}
                />
                {errors.checkInDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.checkInDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Enter student's home address"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guardian & Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guardianName">Guardian Name</Label>
                <Input
                  id="guardianName"
                  {...register('guardianName')}
                  placeholder="Parent/Guardian name"
                />
              </div>

              <div>
                <Label htmlFor="guardianPhone">Guardian Phone</Label>
                <Input
                  id="guardianPhone"
                  {...register('guardianPhone')}
                  placeholder="+977-9876543210"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  placeholder="Emergency contact number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course">Course/Program</Label>
                <Input
                  id="course"
                  {...register('course')}
                  placeholder="e.g., Computer Science, Engineering"
                />
              </div>

              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  {...register('institution')}
                  placeholder="College/University name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ID Proof Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idProofType">ID Proof Type</Label>
                <Select onValueChange={(value) => setValue('idProofType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID proof type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CITIZENSHIP">Citizenship Certificate</SelectItem>
                    <SelectItem value="PASSPORT">Passport</SelectItem>
                    <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                    <SelectItem value="VOTER_ID">Voter ID</SelectItem>
                    <SelectItem value="STUDENT_ID">Student ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="idProofNumber">ID Proof Number</Label>
                <Input
                  id="idProofNumber"
                  {...register('idProofNumber')}
                  placeholder="Enter ID number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || loading}
            className="bg-gradient-to-r from-[#1295D0] to-[#07A64F] hover:from-[#1295D0]/90 hover:to-[#07A64F]/90"
          >
            {isSubmitting || loading ? 'Creating Student...' : 'Create Student'}
          </Button>
        </div>
      </form>
    </div>
  );
};
