# Landing Page Routing Flow Diagram

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         START                                    │
│                    User visits site                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   Landing Page │ (Public - No Auth Required)
                    │       /        │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │ Request Demo     │      │ Hostel Owner     │
    │ (Form)           │      │ Login Button     │
    └──────────────────┘      └────────┬─────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │  Login Page    │ (Public)
                              │    /login      │
                              └────────┬───────┘
                                       │
                          ┌────────────┴────────────┐
                          │                         │
                          ▼                         ▼
                  ┌──────────────┐         ┌──────────────┐
                  │ Back to Home │         │ Enter        │
                  │ Button       │         │ Credentials  │
                  └──────┬───────┘         └──────┬───────┘
                         │                        │
                         │                        ▼
                         │              ┌──────────────────┐
                         │              │ Authentication   │
                         │              │ Check            │
                         │              └────────┬─────────┘
                         │                       │
                         │          ┌────────────┴────────────┐
                         │          │                         │
                         │          ▼                         ▼
                         │  ┌──────────────┐         ┌──────────────┐
                         │  │ Login Failed │         │ Login Success│
                         │  │ (Show Error) │         │              │
                         │  └──────────────┘         └──────┬───────┘
                         │                                  │
                         │                                  ▼
                         │                        ┌──────────────────┐
                         │                        │ Business         │
                         │                        │ Selection Page   │
                         │                        └────────┬─────────┘
                         │                                 │
                         │                    ┌────────────┴────────────┐
                         │                    │                         │
                         │                    ▼                         ▼
                         │            ┌──────────────┐         ┌──────────────┐
                         │            │ Logout       │         │ Select       │
                         │            │ Button       │         │ Business     │
                         │            └──────┬───────┘         └──────┬───────┘
                         │                   │                        │
                         └───────────────────┘                        │
                                                                      ▼
                                                            ┌──────────────────┐
                                                            │ Admin Dashboard  │
                                                            │     /admin       │
                                                            └────────┬─────────┘
                                                                     │
                                                                     ▼
                                                    ┌────────────────────────────┐
                                                    │ Protected Routes Access    │
                                                    │ - Rooms                    │
                                                    │ - Bookings                 │
                                                    │ - Ledger                   │
                                                    │ - Analytics                │
                                                    │ - etc.                     │
                                                    └────────────────────────────┘
```

## Authentication State Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication States                         │
└─────────────────────────────────────────────────────────────────┘

State: UNAUTHENTICATED
├── Can Access: Landing Page, Login Page
├── Cannot Access: All Protected Routes
└── Action: Redirect to /login when accessing protected routes

State: AUTHENTICATED (User logged in, no business selected)
├── Can Access: Landing Page, Login Page
├── Shows: Business Selection Page
└── Action: Must select business to proceed

State: BUSINESS_SELECTED (Fully authenticated)
├── Can Access: All routes
├── Shows: Admin Dashboard and all protected routes
└── Action: Full access granted
```

## Route Protection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              User Tries to Access Protected Route               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   AuthGuard    │
                    │   Component    │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │ Check Auth State │      │ Check Business   │
    │                  │      │ Selection        │
    └────────┬─────────┘      └────────┬─────────┘
             │                         │
    ┌────────┴────────┐       ┌────────┴────────┐
    │                 │       │                 │
    ▼                 ▼       ▼                 ▼
┌─────────┐    ┌──────────┐ ┌──────────┐ ┌──────────┐
│Not Auth │    │Auth OK   │ │No Biz    │ │Biz OK    │
└────┬────┘    └────┬─────┘ └────┬─────┘ └────┬─────┘
     │              │            │            │
     ▼              │            ▼            ▼
┌─────────┐         │      ┌──────────┐ ┌──────────┐
│Redirect │         │      │Show Biz  │ │Grant     │
│to Login │         │      │Selection │ │Access    │
└─────────┘         │      └──────────┘ └──────────┘
                    │
                    ▼
              ┌──────────┐
              │Continue  │
              │to Route  │
              └──────────┘
```

## Navigation Helpers

### From Landing Page
```
Landing Page (/)
    ├── "Hostel Owner Login" → /login
    ├── "Request Demo" → Opens demo form modal
    └── Logo click → Scroll to top
```

### From Login Page
```
Login Page (/login)
    ├── "Back to Home" → /
    ├── Logo click → /
    ├── Successful login → Business Selection
    └── After business selection → /admin (or intended route)
```

### From Business Selection
```
Business Selection
    ├── "Logout" → / (Landing)
    ├── Select business → /admin (or intended route)
    └── Automatic redirect after selection
```

## State Preservation Example

```
Scenario: User tries to access /rooms without being logged in

Step 1: User visits /rooms
        ↓
Step 2: AuthGuard detects no authentication
        ↓
Step 3: Redirect to /login with state: { from: '/rooms' }
        ↓
Step 4: User logs in successfully
        ↓
Step 5: User selects business
        ↓
Step 6: Redirect to /rooms (preserved from state)
        ↓
Step 7: User sees Room Management page
```

## Key Components

```
App.tsx
├── Public Routes (No AuthGuard)
│   ├── / → Landing
│   └── /login → Login
│
└── Protected Routes (Wrapped in AuthGuard)
    ├── /admin → Dashboard
    ├── /rooms → Room Management
    ├── /bookings → Booking Requests
    ├── /ledger → Financial Ledger
    └── ... (all other admin routes)

AuthGuard.tsx
├── Checks authentication state
├── Redirects to /login if not authenticated
├── Shows BusinessSelection if no business selected
└── Grants access if fully authenticated

Login.tsx
├── Handles user authentication
├── Redirects after successful login
└── Preserves intended destination

BusinessSelection.tsx
├── Shows available businesses
├── Handles business selection
└── Redirects to admin after selection
```
