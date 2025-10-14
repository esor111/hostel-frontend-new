# Hostel Selection - Search & Pagination Implementation

## ✅ What Was Added

Added backend-powered search and pagination to the "Select Your Hostel" page.

## 🎯 Features Implemented

### 1. Backend Search
- Search by hostel name
- Queries the API: `GET /businesses/my?name=kaha&page=1&take=10`
- Real-time search (queries backend on every keystroke)
- Loading indicator while searching

### 2. Pagination
- 9 hostels per page (3x3 grid)
- Page navigation (Previous/Next)
- Page number buttons (shows up to 5 pages)
- Smart page number display (shows current page context)
- Total count display

### 3. API Integration
- Uses existing Kaha Main v3 API
- Endpoint: `https://dev.kaha.com.np/main/api/v3/businesses/my`
- Query parameters:
  - `name`: Search term (optional)
  - `page`: Page number (default: 1)
  - `take`: Items per page (default: 9)

## 📁 Files Modified

### 1. `src/services/authService.ts`
**Updated `fetchBusinesses` function:**
```typescript
// Before
async fetchBusinesses(): Promise<Business[]>

// After
async fetchBusinesses(params?: { 
  name?: string; 
  page?: number; 
  take?: number 
}): Promise<{ 
  data: Business[]; 
  total: number; 
  page: number; 
  totalPages: number 
}>
```

**Features:**
- Accepts search and pagination parameters
- Builds query string dynamically
- Returns pagination metadata
- Backward compatible (works with old API format)

### 2. `src/contexts/AuthContext.tsx`
**Updated `refreshBusinesses` function:**
```typescript
// Before
refreshBusinesses: () => Promise<void>

// After
refreshBusinesses: (params?: { 
  name?: string; 
  page?: number; 
  take?: number 
}) => Promise<{ 
  data: Business[]; 
  total: number; 
  page: number; 
  totalPages: number 
}>
```

**Changes:**
- Accepts search/pagination parameters
- Returns pagination metadata
- Updates state with fetched businesses

### 3. `src/pages/BusinessSelection.tsx`
**Added State:**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalBusinesses, setTotalBusinesses] = useState(0);
const [isSearching, setIsSearching] = useState(false);
const itemsPerPage = 9;
```

**Added Functions:**
```typescript
fetchBusinesses(search?, page) // Fetch with params
handleSearch(value)             // Search handler
handlePageChange(page)          // Pagination handler
```

**Added UI Components:**
- Search input with icon
- Loading spinner in search
- Pagination controls
- Page number buttons
- Total count display

## 🎨 UI Components

### Search Bar
```
┌─────────────────────────────────────┐
│ 🔍 Search hostels by name...    ⟳  │
└─────────────────────────────────────┘
```

### Pagination
```
Page 2 of 5          [< Previous] [1] [2] [3] [4] [5] [Next >]
```

### Hostel Grid
```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Hostel1 │ │ Hostel2 │ │ Hostel3 │
└─────────┘ └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Hostel4 │ │ Hostel5 │ │ Hostel6 │
└─────────┘ └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Hostel7 │ │ Hostel8 │ │ Hostel9 │
└─────────┘ └─────────┘ └─────────┘
```

## 🔄 How It Works

### Search Flow
```
User types "kaha"
  ↓
handleSearch("kaha")
  ↓
fetchBusinesses("kaha", 1)
  ↓
API: GET /businesses/my?name=kaha&page=1&take=9
  ↓
Update state with results
  ↓
Display filtered hostels
```

### Pagination Flow
```
User clicks "Next"
  ↓
handlePageChange(2)
  ↓
fetchBusinesses(searchTerm, 2)
  ↓
API: GET /businesses/my?name=kaha&page=2&take=9
  ↓
Update state with page 2 results
  ↓
Display page 2 hostels
```

## 🧪 Testing

### Test Search
1. Open "Select Your Hostel" page
2. Type in search box: "kaha"
3. Should see loading spinner
4. Should see filtered results from backend

### Test Pagination
1. If you have > 9 hostels
2. Should see pagination controls
3. Click "Next" → Should load page 2
4. Click page number → Should load that page
5. Click "Previous" → Should go back

### Test Combined
1. Search for "test"
2. Should reset to page 1
3. If results > 9, pagination should work
4. Page numbers should update correctly

## 💡 Smart Features

### 1. Debouncing (Optional Enhancement)
Currently searches on every keystroke. Can add debouncing:
```typescript
const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>();

const handleSearch = (value: string) => {
  setSearchTerm(value);
  
  if (searchDebounce) clearTimeout(searchDebounce);
  
  const timeout = setTimeout(() => {
    fetchBusinesses(value, 1);
  }, 300); // Wait 300ms after user stops typing
  
  setSearchDebounce(timeout);
};
```

### 2. Smart Page Display
Shows 5 page numbers with smart positioning:
- Pages 1-3: Shows [1] [2] [3] [4] [5]
- Page 5: Shows [3] [4] [5] [6] [7]
- Last pages: Shows last 5 pages

### 3. Loading States
- `state.loading`: Initial load
- `isSearching`: Search/pagination in progress
- `isRefreshing`: Manual refresh

### 4. Backward Compatibility
Works with both:
- Old API: Returns just array
- New API: Returns with pagination metadata

## 🎯 Benefits

✅ **Backend Search** - No frontend filtering, scales to thousands of hostels
✅ **Pagination** - Loads only 9 hostels at a time (fast!)
✅ **Real-time** - Search updates as you type
✅ **User Friendly** - Clear loading states and feedback
✅ **Scalable** - Works with any number of hostels
✅ **Clean Code** - Minimal changes, no breaking changes

## 📊 Performance

### Before
- Loads ALL hostels at once
- Frontend filtering
- Slow with many hostels

### After
- Loads 9 hostels per page
- Backend filtering
- Fast regardless of total hostels

## 🔧 Configuration

### Change Items Per Page
```typescript
const itemsPerPage = 9; // Change to 6, 12, 15, etc.
```

### Change Page Button Count
```typescript
// In pagination render
Array.from({ length: Math.min(totalPages, 5) }, ...) 
// Change 5 to show more/fewer page buttons
```

## ✅ Status

**Implementation**: ✅ COMPLETE
**Testing**: Ready for testing
**Breaking Changes**: None
**Backward Compatible**: Yes

---

**Summary**: Added backend-powered search and pagination to hostel selection with zero breaking changes!
