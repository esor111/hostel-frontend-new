import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Building, Layout as LayoutIcon, Camera, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { RoomDesigner } from "./RoomDesigner";
import { useRooms } from "@/hooks/useRooms";
import ImageUpload from "@/components/common/ImageUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RoomFormData {
    name: string;
    roomNumber: string;
    type: string;
    bedCount: number;
    gender: string;
    baseRate: number;
    floorNumber: number;
    amenities: string[];
    description: string;
    images: string[];
    layout?: any;
}

const STEPS = [
    { id: 1, name: "Basic Info", icon: Building },
    { id: 2, name: "Layout Design", icon: LayoutIcon },
    { id: 3, name: "Images & Review", icon: Camera }
];

export const AddRoomWizard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [showRoomDesigner, setShowRoomDesigner] = useState(false);

    const { createRoom, updateRoom, refreshData } = useRooms();

    const isEditing = location.state?.isEditing || false;
    const roomData = location.state?.roomData || null;
    const editRoomId = searchParams.get('edit');

    const generateRoomNumber = (floorNumber: number = 1) => {
        const timestamp = Date.now().toString().slice(-4);
        return `${floorNumber}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}-${timestamp}`;
    };

    // Helper function to extract amenity names from API response
    const extractAmenityNames = (amenities: any[]): string[] => {
        if (!amenities || amenities.length === 0) return [];
        // If amenities are objects with 'name' property, extract names
        if (typeof amenities[0] === 'object' && amenities[0].name) {
            return amenities.map(a => a.name);
        }
        // If already strings, return as is
        return amenities;
    };

    const [formData, setFormData] = useState<RoomFormData>({
        name: roomData?.name || "",
        roomNumber: roomData?.roomNumber || "", // Empty by default, will auto-generate on submit if needed
        type: roomData?.type || "Dormitory",
        bedCount: roomData?.bedCount || roomData?.capacity || 1,
        gender: roomData?.gender || "Mixed",
        baseRate: roomData?.baseRate || roomData?.rent || 12000,
        floorNumber: roomData?.floorNumber || 1,
        amenities: extractAmenityNames(roomData?.amenities || []),
        description: roomData?.description || "",
        images: roomData?.images || [],
        layout: roomData?.layout || null
    });

    // Monitor layout state changes
    useEffect(() => {
        console.log('🔍 Form state changed - layout:', formData.layout ? 'EXISTS' : 'NULL');
        if (formData.layout) {
            console.log('📐 Layout elements:', formData.layout.elements?.length || 0);
            console.log('📏 Layout dimensions:', formData.layout.dimensions);
        }
    }, [formData.layout]);

    const roomTypes = ["Dormitory", "Private", "Capsule"];
    const genderOptions = ["Mixed", "Male", "Female"];
    const availableAmenities = [
        "Wi-Fi", "Lockers", "Reading Light", "Private Bathroom",
        "AC", "TV", "Power Outlet", "Personal Locker", "Bunk Bed",
        "Study Desk", "Chair", "Wardrobe", "Mirror", "Balcony",
        "Mini Fridge", "Microwave", "Coffee Maker", "Safe Box"
    ];

    const handleInputChange = (field: keyof RoomFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSaveLayout = (layout: any) => {
        console.log('💾 Saving layout to form state:', layout);
        console.log('📐 Layout elements:', layout.elements?.length || 0);
        console.log('📏 Layout dimensions:', layout.dimensions);

        // Validate layout before saving
        if (!layout.elements || layout.elements.length === 0) {
            toast.error("Layout has no elements. Please add beds or furniture.");
            return;
        }

        if (!layout.dimensions) {
            toast.error("Layout is missing dimensions. Please set room dimensions.");
            return;
        }

        // Save to localStorage as backup
        try {
            localStorage.setItem('pendingRoomLayout', JSON.stringify(layout));
            console.log('✅ Layout backed up to localStorage');
        } catch (error) {
            console.warn('Failed to backup layout to localStorage:', error);
        }

        setFormData(prev => {
            const newState = { ...prev, layout };
            console.log('✅ Form state updated with layout');
            console.log('📊 Updated form data:', { ...newState, layout: '...' }); // Don't log full layout
            return newState;
        });

        setShowRoomDesigner(false);
        toast.success("Room layout saved successfully!", {
            description: `${layout.elements.length} elements saved`
        });
    };

    // Validation for each step
    const validateStep = (step: number): { valid: boolean; message?: string } => {
        if (step === 1) {
            if (!formData.name.trim()) return { valid: false, message: "Please enter a room name" };
            // Room number is now optional - will auto-generate if empty
            if (formData.bedCount < 1) return { valid: false, message: "Bed count must be at least 1" };
            if (formData.baseRate < 1000) return { valid: false, message: "Base rate must be at least NPR 1,000" };
            if (formData.floorNumber < 1) return { valid: false, message: "Floor number must be at least 1" };
            return { valid: true };
        }
        if (step === 2) {
            // Layout design validation - require layout to be designed (mandatory)
            if (!formData.layout || formData.layout.skipped) {
                return { valid: false, message: "Room layout design is required. Please design the room layout before proceeding." };
            }
            return { valid: true };
        }
        return { valid: true };
    };

    const handleNext = () => {
        const validation = validateStep(currentStep);
        if (!validation.valid) {
            toast.error(validation.message);
            return;
        }

        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        const validation = validateStep(1);
        if (!validation.valid) {
            toast.error(validation.message);
            return;
        }

        // Auto-generate room number if empty
        const finalRoomNumber = formData.roomNumber.trim() || generateRoomNumber(formData.floorNumber);

        // Try to recover layout from localStorage if missing
        let finalLayout = formData.layout;
        if (!finalLayout) {
            try {
                const savedLayout = localStorage.getItem('pendingRoomLayout');
                if (savedLayout) {
                    finalLayout = JSON.parse(savedLayout);
                    console.log('🔄 Recovered layout from localStorage');
                    toast.info('Layout recovered from backup');
                }
            } catch (error) {
                console.warn('Failed to recover layout from localStorage:', error);
            }
        }

        // Validate layout (now mandatory)
        if (!finalLayout) {
            toast.error("Room layout is required. Please design the room layout first.");
            return;
        }

        if (!finalLayout.elements || finalLayout.elements.length === 0) {
            toast.error("Layout has no elements. Please add beds and furniture to the layout.");
            return;
        }

        if (!finalLayout.dimensions) {
            toast.error("Layout is missing dimensions. Please set room dimensions in the layout designer.");
            return;
        }

        console.log('✅ Layout validation passed:', {
            elements: finalLayout.elements.length,
            dimensions: finalLayout.dimensions,
            theme: finalLayout.theme?.name || 'Default'
        });

        console.log('📤 Submitting room with layout:', !!finalLayout);
        if (finalLayout) {
            console.log('📐 Layout to submit:', {
                hasElements: !!finalLayout.elements,
                elementCount: finalLayout.elements?.length || 0,
                hasDimensions: !!finalLayout.dimensions,
                hasTheme: !!finalLayout.theme
            });
        }

        try {
            const roomPayload = {
                name: formData.name,
                roomNumber: finalRoomNumber,
                type: formData.type,
                capacity: formData.bedCount,
                rent: formData.baseRate,
                gender: formData.gender,
                status: "ACTIVE",
                amenities: formData.amenities,
                images: formData.images,
                isActive: true,
                description: formData.description,
                layout: finalLayout // Use finalLayout (recovered if needed)
            };

            console.log('📤 Final room payload:', { ...roomPayload, layout: finalLayout ? 'EXISTS' : 'NULL' });

            // Log detailed layout structure before sending
            if (finalLayout) {
                console.log('🔍 DETAILED LAYOUT STRUCTURE BEFORE SENDING:');
                console.log('  - dimensions:', finalLayout.dimensions);
                console.log('  - elements:', finalLayout.elements);
                console.log('  - elements count:', finalLayout.elements?.length || 0);
                console.log('  - theme:', finalLayout.theme);
                console.log('  - Full layout object:', JSON.stringify(finalLayout, null, 2));
            }

            if (isEditing && (editRoomId || roomData?.id)) {
                await updateRoom(editRoomId || roomData.id, roomPayload);
                toast.success("Room updated successfully!");
            } else {
                console.log('🚀 Calling createRoom with payload...');
                await createRoom(roomPayload);
                toast.success("Room created successfully!");
            }

            // Clear localStorage after successful submit
            if (finalLayout) {
                localStorage.removeItem('pendingRoomLayout');
                console.log('🗑️ Cleared layout backup from localStorage');
            }

            refreshData();
            navigate("/rooms");
        } catch (error) {
            console.error('Error saving room:', error);
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} room. Please try again.`);
        }
    };

    if (showRoomDesigner) {
        return (
            <RoomDesigner
                onSave={handleSaveLayout}
                onClose={() => setShowRoomDesigner(false)}
                roomData={formData.layout}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => {
                            if (currentStep > 1) {
                                setCurrentStep(currentStep - 1);
                            } else {
                                navigate("/rooms");
                            }
                        }}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {currentStep > 1 ? `Back to ${STEPS[currentStep - 2]?.name}` : "Back to Rooms"}
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">{isEditing ? "Edit Room" : "Add New Room"}</h2>
                        <p className="text-gray-600">Step {currentStep} of {STEPS.length}</p>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                            ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                                isActive ? 'bg-blue-600 border-blue-600 text-white' :
                                                    'bg-gray-100 border-gray-300 text-gray-400'}
                                        `}>
                                            {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                        </div>
                                        <div className={`mt-2 text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                                            {step.name}
                                        </div>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Step Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Room Name *</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="e.g., Dorm A - Mixed"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Room Number (Optional)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={formData.roomNumber}
                                                    onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                                                    placeholder="Leave empty to auto-generate"
                                                    className="flex-1"
                                                />
                                                {!isEditing && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleInputChange('roomNumber', generateRoomNumber(formData.floorNumber))}
                                                        title="Generate room number"
                                                    >
                                                        🔄
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                💡 Leave empty to auto-generate when creating room
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Room Type *</Label>
                                            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roomTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bed Count *</Label>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={formData.bedCount === 0 ? '' : formData.bedCount}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    handleInputChange('bedCount', value === '' ? 0 : parseInt(value));
                                                }}
                                                onBlur={(e) => {
                                                    // Set to 1 if empty when user leaves the field
                                                    if (e.target.value === '' || formData.bedCount === 0) {
                                                        handleInputChange('bedCount', 1);
                                                    }
                                                }}
                                                placeholder="e.g., 4"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gender Type *</Label>
                                            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {genderOptions.map((gender) => (
                                                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Floor Number *</Label>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={formData.floorNumber === 0 ? '' : formData.floorNumber}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    handleInputChange('floorNumber', value === '' ? 0 : parseInt(value));
                                                }}
                                                onBlur={(e) => {
                                                    // Set to 1 if empty when user leaves the field
                                                    if (e.target.value === '' || formData.floorNumber === 0) {
                                                        handleInputChange('floorNumber', 1);
                                                    }
                                                }}
                                                placeholder="e.g., 2"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Base Monthly Rate (NPR) *</Label>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={formData.baseRate === 0 ? '' : formData.baseRate}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    handleInputChange('baseRate', value === '' ? 0 : parseInt(value));
                                                }}
                                                onBlur={(e) => {
                                                    // Set to 12000 if empty when user leaves the field
                                                    if (e.target.value === '' || formData.baseRate === 0) {
                                                        handleInputChange('baseRate', 12000);
                                                    }
                                                }}
                                                placeholder="e.g., 15000"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Room Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Describe the room features, location, or any special notes..."
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Room Amenities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {availableAmenities.map((amenity) => (
                                            <div key={amenity} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={amenity}
                                                    checked={formData.amenities.includes(amenity)}
                                                    onCheckedChange={() => handleAmenityToggle(amenity)}
                                                />
                                                <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer">
                                                    {amenity}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>

                                    {formData.amenities.length > 0 && (
                                        <div className="mt-4">
                                            <Label className="text-sm font-medium">Selected Amenities:</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {formData.amenities.map((amenity) => (
                                                    <Badge key={amenity} variant="secondary" className="text-xs">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Step 2: Layout Design */}
                    {currentStep === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LayoutIcon className="h-5 w-5" />
                                    Room Layout Design
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Design your room layout to visualize bed placement and furniture arrangement. This step is required to proceed to the next step.
                                    </AlertDescription>
                                </Alert>

                                <div className="text-center py-8">
                                    <LayoutIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 mb-4">
                                        {formData.layout ? "Layout configured successfully!" : "Design your room layout to proceed"}
                                    </p>

                                    <Button
                                        onClick={() => setShowRoomDesigner(true)}
                                        size="lg"
                                        variant={formData.layout ? "outline" : "default"}
                                    >
                                        <LayoutIcon className="h-4 w-4 mr-2" />
                                        {formData.layout ? "Edit Layout" : "Design Layout"}
                                    </Button>
                                </div>

                                {formData.layout && (
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <div className="text-sm text-green-700 font-semibold mb-3 flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            Layout Saved Successfully
                                        </div>
                                        <div className="text-xs text-green-600 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Dimensions:</span>
                                                <span>{formData.layout.dimensions?.length}ft × {formData.layout.dimensions?.width}ft × {formData.layout.dimensions?.height}ft</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Total Elements:</span>
                                                <span>{formData.layout.elements?.length || 0} items</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Beds:</span>
                                                <span>{formData.layout.elements?.filter(e => e.type?.includes('bed')).length || 0} beds</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Furniture:</span>
                                                <span>{formData.layout.elements?.filter(e => !e.type?.includes('bed')).length || 0} items</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Theme:</span>
                                                <span>{formData.layout.theme?.name || 'Default'}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-3 w-full"
                                            onClick={() => {
                                                console.log('🔍 Current layout state:', formData.layout);
                                                console.log('📐 Layout elements:', formData.layout.elements);
                                                console.log('📏 Layout dimensions:', formData.layout.dimensions);
                                                console.log('🎨 Layout theme:', formData.layout.theme);
                                                toast.info('Layout details logged to console', {
                                                    description: 'Open browser console (F12) to see full layout data'
                                                });
                                            }}
                                        >
                                            🔍 Inspect Layout Data
                                        </Button>
                                    </div>
                                )}

                                <Alert variant="default" className="bg-blue-50 border-blue-200">
                                    <AlertDescription className="text-blue-700">
                                        💡 Tip: Use the layout designer to place beds, furniture, and define room dimensions. This helps with room management and guest visualization.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Images & Review */}
                    {currentStep === 3 && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Room Images
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Upload images to help guests visualize the room. Images will be stored securely and displayed in the booking interface.
                                    </p>
                                    <ImageUpload
                                        onImagesUploaded={(imageUrls) => handleInputChange('images', imageUrls)}
                                        existingImages={formData.images}
                                        maxImages={8}
                                        className="mt-3"
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Review & Confirm</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Room Name</div>
                                            <div className="font-medium">{formData.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Room Number</div>
                                            <div className="font-medium">{formData.roomNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Type</div>
                                            <div className="font-medium">{formData.type}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Capacity</div>
                                            <div className="font-medium">{formData.bedCount} beds</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Monthly Rate</div>
                                            <div className="font-medium">NPR {formData.baseRate.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Floor</div>
                                            <div className="font-medium">Floor {formData.floorNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Layout</div>
                                            <div className="font-medium">
                                                {formData.layout ? '✓ Configured' : '✗ Not configured'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Images</div>
                                            <div className="font-medium">{formData.images.length} uploaded</div>
                                        </div>
                                    </div>

                                    {formData.amenities.length > 0 && (
                                        <div>
                                            <div className="text-gray-600 text-sm mb-2">Amenities ({formData.amenities.length})</div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.amenities.map((amenity) => (
                                                    <Badge key={amenity} variant="secondary" className="text-xs">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Sidebar - Preview */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm">
                                <div className="font-medium">{formData.name || "Room Name"}</div>
                                <div className="text-gray-600">{formData.type} • Floor {formData.floorNumber}</div>
                                {formData.roomNumber && (
                                    <div className="text-gray-600">Room #{formData.roomNumber}</div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Badge variant="outline">{formData.gender}</Badge>
                                <Badge variant="outline">{formData.bedCount} beds</Badge>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-sm text-blue-600 font-medium">
                                    NPR {formData.baseRate.toLocaleString()}/month
                                </div>
                                <div className="text-xs text-blue-500">
                                    Daily: NPR {Math.round(formData.baseRate / 30)}/day
                                </div>
                            </div>

                            {formData.amenities.length > 0 && (
                                <div>
                                    <div className="text-xs font-medium text-gray-700 mb-1">
                                        {formData.amenities.length} Amenities
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {formData.amenities.slice(0, 3).map((amenity) => (
                                            <Badge key={amenity} variant="secondary" className="text-xs">
                                                {amenity}
                                            </Badge>
                                        ))}
                                        {formData.amenities.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{formData.amenities.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formData.images.length > 0 && (
                                <div>
                                    <div className="text-xs font-medium text-gray-700 mb-1">
                                        {formData.images.length} Images
                                    </div>
                                    <div className="grid grid-cols-3 gap-1">
                                        {formData.images.slice(0, 3).map((imageUrl, index) => (
                                            <div key={index} className="aspect-square rounded overflow-hidden bg-gray-100">
                                                <img
                                                    src={imageUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    <div className="space-y-3">
                        {currentStep < STEPS.length ? (
                            <>
                                <Button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700">
                                    Next: {STEPS[currentStep]?.name}
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                                {currentStep > 1 && (
                                    <Button variant="outline" onClick={handleBack} className="w-full">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">
                                    <Check className="h-4 w-4 mr-2" />
                                    {isEditing ? "Save Changes" : "Create Room"}
                                </Button>
                                <Button variant="outline" onClick={handleBack} className="w-full">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </>
                        )}
                        <Button variant="ghost" onClick={() => navigate("/rooms")} className="w-full">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
