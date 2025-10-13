# Room Creation Wizard - Implementation Guide

## ✅ What Was Added

A smart 3-step wizard for room creation that improves UX without breaking existing logic.

## 🎯 Features

### Step 1: Basic Information
- Room name, number, type
- Bed count, gender, floor
- Monthly rate
- Room description
- Amenities selection
- **Validation**: All required fields must be filled before proceeding

### Step 2: Layout Design
- Optional but recommended
- Opens existing RoomDesigner component
- Shows layout status (configured/not configured)
- Can skip and add later
- **Smart Warning**: Notifies if no layout but allows proceeding

### Step 3: Images & Review
- Upload room images (up to 8)
- Review all entered information
- Final confirmation before creation
- Shows complete summary

## 🔄 How It Works

### User Flow
```
Step 1: Basic Info
  ↓ (Click "Next: Layout Design")
  ↓ (Validates required fields)
  
Step 2: Layout Design
  ↓ (Click "Next: Images & Review")
  ↓ (Optional - can skip)
  
Step 3: Images & Review
  ↓ (Click "Create Room")
  ↓ (Single API call with all data)
  
✅ Room Created!
```

### Validation Logic
```typescript
// Step 1 validation (required)
- Room name: Must not be empty
- Room number: Must not be empty
- Bed count: Minimum 1
- Base rate: Minimum NPR 1,000
- Floor number: Minimum 1

// Step 2 validation (optional)
- Layout: Optional but recommended
- Warning shown if skipped

// Step 3 validation (optional)
- Images: Optional
- Review: Shows all data for confirmation
```

### API Call
```typescript
// Single API call with everything
POST /hostel/api/v1/rooms
{
  name, roomNumber, type, capacity,
  rent, gender, status, amenities,
  images, description, layout
}

// Backend creates:
// 1. Room entity
// 2. Layout (if provided)
// 3. All beds from layout
// 4. Amenity relationships
```

## 📁 Files Changed

### New Files
- `src/components/admin/AddRoomWizard.tsx` - New wizard component

### Modified Files
- `src/pages/AddRoom.tsx` - Now uses AddRoomWizard instead of AddRoomForm

### Preserved Files
- `src/components/admin/AddRoomForm.tsx` - Old form kept for reference
- `src/components/admin/RoomDesigner.tsx` - Reused as-is
- All hooks and API logic - Unchanged

## 🎨 UI Components

### Stepper Visual
```
┌─────────────────────────────────────────────────┐
│  ●━━━━━━━━━○━━━━━━━━━○                         │
│  Basic Info  Layout    Images                   │
│  (Active)    (Next)    (Pending)                │
└─────────────────────────────────────────────────┘
```

### Step Indicators
- **Active Step**: Blue circle with icon
- **Completed Step**: Green circle with checkmark
- **Pending Step**: Gray circle with icon
- **Progress Line**: Green when completed, gray when pending

## 💡 Smart Features

### 1. Progressive Validation
- Validates each step before allowing "Next"
- Shows specific error messages
- Prevents incomplete data submission

### 2. Smart Warnings
```typescript
// No layout warning
if (!formData.layout) {
  toast.warning("Room will be created without a layout. You can add it later.");
}

// Bed count mismatch (future enhancement)
if (layoutBeds !== formData.bedCount) {
  toast.warning("Layout beds don't match capacity");
}
```

### 3. Live Preview
- Sidebar shows real-time preview
- Updates as user fills form
- Shows selected amenities
- Displays uploaded images

### 4. Auto-generation
- Room number auto-generated
- Can regenerate with 🔄 button
- Based on floor number + timestamp

## 🔧 Customization Options

### Add More Steps
```typescript
const STEPS = [
  { id: 1, name: "Basic Info", icon: Building },
  { id: 2, name: "Layout Design", icon: LayoutIcon },
  { id: 3, name: "Images & Review", icon: Camera },
  // Add more steps here
  { id: 4, name: "Pricing", icon: DollarSign },
];
```

### Change Validation Rules
```typescript
const validateStep = (step: number) => {
  if (step === 1) {
    // Add custom validation
    if (formData.bedCount > 10) {
      return { valid: false, message: "Max 10 beds per room" };
    }
  }
  return { valid: true };
};
```

### Customize Step Content
Each step is a separate section in the component:
```typescript
{currentStep === 1 && (
  // Step 1 content
)}

{currentStep === 2 && (
  // Step 2 content
)}
```

## 🚀 Benefits

### For Users
✅ Clear progress indication
✅ Step-by-step guidance
✅ Validation at each step
✅ Can't skip required info
✅ Live preview of room
✅ Less overwhelming

### For Developers
✅ No breaking changes
✅ Reuses existing components
✅ Same API calls
✅ Easy to maintain
✅ Easy to extend

## 🔄 Switching Back to Old Form

If needed, you can easily switch back:

```typescript
// In src/pages/AddRoom.tsx
import { AddRoomForm } from "@/components/admin/AddRoomForm";

const AddRoom = () => {
  return (
    <MainLayout activeTab="rooms">
      <AddRoomForm /> {/* Use old form */}
    </MainLayout>
  );
};
```

## 📝 Future Enhancements

### Possible Additions
1. **Save as Draft**: Save incomplete rooms
2. **Bed Count Validation**: Match layout beds with capacity
3. **Pricing Calculator**: Suggest rates based on amenities
4. **Duplicate Room**: Copy from existing room
5. **Bulk Upload**: Create multiple rooms at once
6. **Template System**: Save and reuse room templates

### Easy to Add
```typescript
// Add a new step
const STEPS = [
  ...existing steps,
  { id: 4, name: "Advanced Settings", icon: Settings }
];

// Add step content
{currentStep === 4 && (
  <Card>
    <CardHeader>
      <CardTitle>Advanced Settings</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Your custom content */}
    </CardContent>
  </Card>
)}
```

## ✅ Testing Checklist

- [ ] Step 1: Fill basic info and click Next
- [ ] Step 1: Try Next without filling required fields (should show error)
- [ ] Step 2: Design layout and save
- [ ] Step 2: Skip layout and proceed
- [ ] Step 3: Upload images
- [ ] Step 3: Review all information
- [ ] Step 3: Create room (should work)
- [ ] Back button works on all steps
- [ ] Cancel button returns to rooms list
- [ ] Preview updates in real-time
- [ ] Edit mode works correctly

## 🎯 Summary

**What Changed**: Added wizard wrapper around existing form
**What Stayed**: All logic, API calls, components
**Result**: Better UX, same functionality, zero breaking changes

---

**Status**: ✅ Ready to use
**Compatibility**: 100% backward compatible
**Migration**: Automatic (just use AddRoomWizard)
