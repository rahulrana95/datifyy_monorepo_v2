# Frontend Architecture - Datifyy

Comprehensive frontend architecture guide for the Datifyy dating platform.

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Pages & Components](#pages--components)
5. [Services & API Integration](#services--api-integration)
6. [State Management](#state-management)
7. [Routing](#routing)
8. [Theme System](#theme-system)
9. [Step-by-Step Guides](#step-by-step-guides)
10. [Common Patterns](#common-patterns)
11. [Debugging Guide](#debugging-guide)
12. [Best Practices](#best-practices)
13. [Quick Reference](#quick-reference)

---

## Overview

The Datifyy frontend is a modern React application built with TypeScript, Chakra UI v3, and follows a feature-based architecture for scalability and maintainability.

### Key Features

- **Love Zone Dashboard** - Unified date management interface for users
- **AI-Powered Date Curation Admin UI** - Intelligent matching interface for admins
- **Comprehensive Admin Dashboard** - User management, analytics, verification
- **User Profile Management** - Complete profile creation and editing
- **Partner Preferences** - Detailed preference settings
- **Availability Management** - Calendar-based date scheduling
- **Theme Preview System** - Component library showcase
- **Responsive Design** - Mobile-first approach
- **Type Safety** - Full TypeScript + Protocol Buffers integration

### Architecture Principles

1. **Feature-Based Organization** - Related code grouped together
2. **Component Reusability** - Shared components extracted
3. **Type Safety** - TypeScript + auto-generated proto types
4. **Separation of Concerns** - UI, logic, and data layers separated
5. **Performance** - Code splitting, lazy loading, memoization

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 4.9.5 | Type safety and developer experience |
| **Chakra UI** | 3.29.0 | Component library and design system |
| **Emotion** | 11.14.0 | CSS-in-JS styling engine |
| **Framer Motion** | 12.23.24 | Animations and transitions |
| **React Router** | 7.9.5 | Client-side routing |
| **Zustand** | 5.0.8 | Lightweight state management |
| **TanStack Query** | 5.90.8 | Server state management (future) |
| **Zod** | 4.1.12 | Schema validation |
| **Protocol Buffers** | - | Type-safe API contracts |

### Why These Choices?

- **Chakra UI v3**: Modern component library with excellent TypeScript support
- **Zustand**: Simpler than Redux, perfect for our scale
- **Emotion**: Powers Chakra UI, allows custom styling when needed
- **React Router v7**: Latest routing with data loading capabilities
- **TypeScript**: Catches errors at compile time, improves maintainability

---

## Project Structure

```
apps/frontend/src/
├── App.tsx                      # Root component with routing
├── index.tsx                    # Application entry point
│
├── pages/                       # Page components (18 total)
│   ├── LandingPage/            # Public landing page
│   │   ├── LandingPage.tsx
│   │   └── components/         # Landing page sections
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       ├── HowItWorks.tsx
│   │       ├── ProfileCards.tsx
│   │       ├── CTASection.tsx
│   │       └── Footer.tsx
│   │
│   ├── ProfilePage/            # User profile management
│   │   ├── ProfilePage.tsx
│   │   ├── ProfileEditForm.tsx
│   │   └── index.ts
│   │
│   ├── PartnerPreferencesPage/ # Partner preferences
│   │   ├── PartnerPreferencesPage.tsx
│   │   ├── PartnerPreferencesEditForm.tsx
│   │   └── index.ts
│   │
│   ├── AvailabilityPage/       # Date availability management
│   │   ├── AvailabilityPage.tsx
│   │   └── index.ts
│   │
│   ├── LoveZonePage/           # Love Zone - Date management dashboard
│   │   ├── LoveZonePage.tsx    # User dates dashboard with suggestions, upcoming, past dates
│   │   └── index.ts
│   │
│   ├── ThemePreview/           # Component library showcase
│   │   ├── ThemePreview.tsx
│   │   ├── components/
│   │   │   ├── ComponentPreview.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── previews/      # 21 component previews
│   │   └── data/
│   │       └── componentSections.ts
│   │
│   └── Admin/                  # Admin pages (8 pages)
│       ├── Login/
│       │   └── AdminLogin.tsx
│       ├── Analytics/
│       │   └── AdminAnalytics.tsx
│       ├── Users/
│       │   └── AdminUsers.tsx
│       ├── UserDetails/
│       │   └── UserDetails.tsx
│       ├── CurateDates/        # AI-powered curation
│       │   ├── CurateDates.tsx (516 lines)
│       │   └── index.ts
│       ├── Profile/
│       │   └── AdminProfile.tsx
│       ├── Admins/
│       │   └── AdminManagement.tsx
│       ├── Genie/
│       │   └── AdminGenie.tsx
│       └── Dashboard/
│           └── AdminDashboard.tsx
│
├── components/                  # Shared components
│   ├── auth/                   # Authentication components
│   │   ├── LoginModal/
│   │   │   ├── LoginModal.tsx
│   │   │   └── index.ts
│   │   ├── SignupModal/
│   │   │   ├── SignupModal.tsx
│   │   │   └── index.ts
│   │   └── ForgotPasswordModal/
│   │       ├── ForgotPasswordModal.tsx
│   │       └── index.ts
│   │
│   └── admin/                  # Admin-specific components
│       ├── AdminLayout.tsx     # Admin page wrapper
│       ├── AdminHeader.tsx     # Admin top navigation
│       ├── AdminSidebar.tsx    # Admin side menu
│       └── index.ts
│
├── shared/                     # Shared across features
│   └── components/
│       ├── Header/
│       │   └── Header.tsx
│       └── Logo/
│           └── Logo.tsx
│
├── services/                   # API services (5 services)
│   ├── base/                   # Base API client
│   │   ├── apiClient.ts        # HTTP client wrapper
│   │   ├── types.ts            # Common types
│   │   └── index.ts
│   │
│   ├── auth/                   # Authentication service
│   │   ├── authService.ts      # Login, register, logout
│   │   ├── authRestAdapter.ts  # REST API adapter
│   │   └── index.ts
│   │
│   ├── user/                   # User service
│   │   ├── userService.ts      # Profile, preferences
│   │   └── index.ts
│   │
│   ├── admin/                  # Admin service
│   │   └── adminService.ts     # User mgmt, analytics, AI curation (688 lines)
│   │
│   └── availability/           # Availability service
│       ├── availabilityService.ts
│       └── index.ts
│
├── stores/                     # Zustand state stores (4 stores)
│   ├── authStore.ts            # Authentication state
│   ├── userStore.ts            # User profile state
│   ├── adminStore.ts           # Admin state
│   └── availabilityStore.ts   # Availability state
│
├── providers/                  # React context providers
│   └── ChakraProvider.tsx      # Chakra UI setup with theme
│
├── theme/                      # Theme configuration
│   ├── index.ts                # Main theme export
│   ├── colors.reference.ts     # Color palette reference
│   ├── romantic.animations.ts  # Custom animations
│   └── foundations/
│       ├── breakpoints.ts      # Responsive breakpoints
│       ├── spacing.ts          # Spacing system
│       └── typography.ts       # Typography scale
│
└── gen/                        # Generated Protocol Buffer types
    ├── auth/v1/
    │   ├── auth_pb.d.ts
    │   └── messages_pb.d.ts
    ├── user/v1/
    │   └── user_pb.d.ts
    ├── admin/v1/
    │   └── admin_pb.d.ts
    ├── availability/v1/
    │   └── availability_pb.d.ts
    └── common/v1/
        └── types_pb.d.ts
```

### File Counts Summary

- **Pages**: 17 pages (9 user + 8 admin)
- **Components**: 30+ reusable components
- **Services**: 5 API services
- **Stores**: 4 Zustand stores
- **Theme Previews**: 21 component showcases

---

## Pages & Components

### User Pages (9 Pages)

#### 1. Landing Page (`/`)
**File**: `src/pages/LandingPage/LandingPage.tsx`

**Purpose**: Public-facing homepage for non-authenticated users

**Components**:
- `Hero` - Main hero section with CTA
- `Features` - Platform features showcase
- `HowItWorks` - Step-by-step process
- `ProfileCards` - Example user profiles
- `CTASection` - Call to action
- `Footer` - Site footer

**Features**:
- Responsive design
- Smooth animations with Framer Motion
- Auth modals integration (Login/Signup)

**Route**: `/`

---

#### 2. Profile Page (`/profile`)
**File**: `src/pages/ProfilePage/ProfilePage.tsx`

**Purpose**: User profile viewing and editing

**Components**:
- `ProfileEditForm` - Complete profile form with all fields

**Features**:
- Photo upload (max 6 photos)
- Personal information (name, age, gender, bio)
- Physical attributes (height, religion, smoking, drinking)
- Location and occupation
- Real-time validation

**State**: `userStore` (Zustand)

**API**: `userService.updateProfile()`

**Route**: `/profile`

---

#### 3. Partner Preferences Page (`/partner-preferences`)
**File**: `src/pages/PartnerPreferencesPage/PartnerPreferencesPage.tsx`

**Purpose**: Set preferred partner characteristics

**Components**:
- `PartnerPreferencesEditForm` - Preference configuration form

**Features**:
- Age range selection
- Gender preferences
- Distance radius
- Height range
- Religion preferences
- Education level
- Smoking/drinking preferences
- Interests tags

**State**: `userStore`

**API**: `userService.updatePartnerPreferences()`

**Route**: `/partner-preferences`

---

#### 4. Availability Page (`/availability`)
**File**: `src/pages/AvailabilityPage/AvailabilityPage.tsx`

**Purpose**: Manage date availability slots

**Features**:
- Calendar view of availability
- Add/edit/delete time slots
- Location specification
- Notes for each slot
- Date and time picker

**State**: `availabilityStore`

**API**: `availabilityService` (CRUD operations)

**Route**: `/availability`

---

#### 5. Theme Preview Page (`/theme-components`)
**File**: `src/pages/ThemePreview/ThemePreview.tsx`

**Purpose**: Component library showcase and documentation

**Components**: 21 preview components
- Alerts, Avatar, Badge, Box
- Buttons, Card, Checkbox
- Grid, Headings, IconButtons
- Inputs, Modal, Progress
- Radio, Select, Spinner
- Stack, Switch, Text
- Textarea, Tooltip, Typography

**Features**:
- Live component examples
- Interactive playground
- Code snippets
- Responsive preview

**Route**: `/theme-components`

---

### Admin Pages (8 Pages)

All admin pages use the `AdminLayout` component which provides:
- `AdminSidebar` - Left navigation menu
- `AdminHeader` - Top bar with user info
- Protected route (requires admin token)

---

#### 6. Admin Login (`/admin`)
**File**: `src/pages/Admin/Login/AdminLogin.tsx`

**Purpose**: Admin authentication

**Features**:
- Email/password login
- Token-based authentication
- Redirect to dashboard on success

**State**: `adminStore`

**API**: `adminService.login()`

**Route**: `/admin`

---

#### 7. Admin Analytics (`/admin/dashboard`)
**File**: `src/pages/Admin/Analytics/AdminAnalytics.tsx`

**Purpose**: Platform-wide analytics dashboard

**Features**:
- Total users count
- Active users
- Pending verifications
- Dates scheduled
- Revenue metrics
- Growth charts

**API**: `adminService.getAnalytics()`

**Route**: `/admin/dashboard`

---

#### 8. Admin Users List (`/admin/users`)
**File**: `src/pages/Admin/Users/AdminUsers.tsx`

**Purpose**: User management and search

**Features**:
- Paginated user list
- Search by email/name
- Filter by status (ACTIVE, PENDING, SUSPENDED, BANNED)
- Filter by verification status
- Quick actions (view, suspend, verify)
- User statistics

**State**: `adminStore`

**API**: `adminService.getAllUsers()`

**Route**: `/admin/users`

---

#### 9. User Details (`/admin/users/:userId`)
**File**: `src/pages/Admin/UserDetails/UserDetails.tsx`

**Purpose**: Detailed user information and actions

**Features**:
- Complete user profile view
- Photo gallery
- Verification status (email, Aadhar, work email)
- Account status management
- Activity logs
- Manual verification buttons
- Suspend/ban actions

**API**:
- `adminService.getUserById(userId)`
- `adminService.updateUserStatus()`
- `adminService.verifyUser()`

**Route**: `/admin/users/:userId`

---

#### 10. AI Date Curation (`/admin/curate`) ⭐
**File**: `src/pages/Admin/CurateDates/CurateDates.tsx` (516 lines)

**Purpose**: AI-powered date matching and curation

**Features**:
- **Two-Panel Layout**:
  - Left: List of users available for dates
  - Right: AI compatibility analysis
- **Statistics Dashboard**:
  - Total analyzed
  - Total matches
  - Average score
  - Excellent matches count
- **Match Quality Indicators**:
  - 🌟 Excellent (80+)
  - 💙 Good (60-79)
  - 🟡 Fair (40-59)
  - ⚠️ Poor (<40)
- **Filter System**: All, Matches, Non-Matches
- **Color-Coded Scores**: Visual compatibility representation
- **Action Buttons**: Approve, Review Later, Reject
- **AI Analysis Display**:
  - Compatibility score (0-100)
  - Match reasoning
  - Matched aspects
  - Mismatched aspects

**State**: `adminStore`

**API**:
- `adminService.getCurationCandidates()` - Get available users
- `adminService.curateDates(userId, candidateIds)` - AI analysis

**Route**: `/admin/curate`

**Implementation Details**:
```typescript
interface MatchResult {
  userId: string;
  name: string;
  age: number;
  gender: string;
  compatibilityScore: number; // 0-100
  isMatch: boolean; // true if score >= 60
  reasoning: string;
  matchedAspects: string[];
  mismatchedAspects: string[];
}
```

---

#### 11. Admin Profile (`/admin/profile`)
**File**: `src/pages/Admin/Profile/AdminProfile.tsx`

**Purpose**: Admin account settings

**Features**:
- View admin details
- Update name/email
- Change password
- View role and permissions

**API**: `adminService.getAdminProfile()`

**Route**: `/admin/profile`

---

#### 12. Admin Management (`/admin/admins`)
**File**: `src/pages/Admin/Admins/AdminManagement.tsx`

**Purpose**: Manage admin accounts (SUPER admin only)

**Features**:
- List all admins
- Create new admin
- Update admin roles
- Delete admin accounts
- Role-based access control

**Roles**:
- `ADMIN_ROLE_SUPER` - Full access
- `ADMIN_ROLE_MODERATOR` - User management
- `ADMIN_ROLE_SUPPORT` - Read-only
- `ADMIN_ROLE_GENIE` - AI features access

**API**:
- `adminService.getAllAdmins()`
- `adminService.createAdmin()`
- `adminService.updateAdminRole()`
- `adminService.deleteAdmin()`

**Route**: `/admin/admins`

---

#### 13. Admin Genie (`/admin/genie`)
**File**: `src/pages/Admin/Genie/AdminGenie.tsx`

**Purpose**: AI-powered administrative assistant

**Features**:
- AI chat interface
- Platform insights
- Automated reports
- Query natural language interface

**Route**: `/admin/genie`

---

### Shared Components

#### Authentication Components

**Location**: `src/components/auth/`

1. **LoginModal** - User login dialog
2. **SignupModal** - User registration dialog
3. **ForgotPasswordModal** - Password reset flow

**Features**:
- Form validation with Zod
- Error handling
- Loading states
- Responsive design

---

#### Admin Components

**Location**: `src/components/admin/`

1. **AdminLayout** - Wraps all admin pages
   ```tsx
   <AdminLayout>
     <AdminSidebar />
     <Box flex="1">
       <AdminHeader />
       {children}
     </Box>
   </AdminLayout>
   ```

2. **AdminSidebar** - Navigation menu
   - Dashboard 📊
   - Users 👥
   - Curate Dates 💝
   - Admins 🔐 (SUPER only)
   - Profile 👤
   - Genie ✨

3. **AdminHeader** - Top navigation
   - Current page title
   - Admin user menu
   - Logout button

---

## Services & API Integration

### Base API Client

**File**: `src/services/base/apiClient.ts`

**Purpose**: HTTP client wrapper with common configuration

**Features**:
```typescript
class ApiClient {
  private baseURL: string;
  private headers: HeadersInit;

  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: unknown): Promise<T>
  async put<T>(endpoint: string, data: unknown): Promise<T>
  async delete<T>(endpoint: string): Promise<T>

  setAuthToken(token: string): void
  clearAuthToken(): void
}
```

**Configuration**:
- Base URL: `process.env.REACT_APP_API_URL` or `http://localhost:8080`
- Default headers: `Content-Type: application/json`
- Auth header: `Authorization: Bearer {token}`

**Error Handling**:
- Network errors
- HTTP status codes
- JSON parsing errors
- Timeout handling

---

### Auth Service

**File**: `src/services/auth/authService.ts`

**Endpoints**:
```typescript
// Register new user
POST /api/v1/auth/register/email
Body: { email, password, name }
Response: { userId, accessToken, refreshToken, expiresIn }

// Login
POST /api/v1/auth/login/email
Body: { email, password }
Response: { userId, accessToken, refreshToken, expiresIn }

// Refresh token
POST /api/v1/auth/token/refresh
Body: { refreshToken }
Response: { accessToken, expiresIn }

// Logout
POST /api/v1/auth/token/revoke
Headers: { Authorization: Bearer {token} }
Body: { token }
```

**Functions**:
```typescript
export const authService = {
  register: (email: string, password: string, name: string) => Promise<AuthResponse>
  login: (email: string, password: string) => Promise<AuthResponse>
  logout: (token: string) => Promise<void>
  refreshToken: (refreshToken: string) => Promise<TokenResponse>
}
```

---

### User Service

**File**: `src/services/user/userService.ts`

**Endpoints**:
```typescript
// Get profile
GET /api/v1/user/profile
Response: { userId, email, name, bio, photos, ... }

// Update profile
PUT /api/v1/user/profile
Body: { name, dateOfBirth, gender, bio, location, occupation, ... }

// Upload photo
POST /api/v1/user/photos/upload
Body: FormData { photo: File, isPrimary: boolean }

// Get partner preferences
GET /api/v1/user/preferences/partner

// Update partner preferences
PUT /api/v1/user/preferences/partner
Body: { ageMin, ageMax, preferredGenders, maxDistance, ... }
```

**Functions**:
```typescript
export const userService = {
  getProfile: () => Promise<UserProfile>
  updateProfile: (data: ProfileUpdate) => Promise<UserProfile>
  uploadPhoto: (file: File, isPrimary: boolean) => Promise<Photo>
  deletePhoto: (photoId: string) => Promise<void>
  getPartnerPreferences: () => Promise<PartnerPreferences>
  updatePartnerPreferences: (data: PartnerPreferences) => Promise<void>
}
```

---

### Admin Service

**File**: `src/services/admin/adminService.ts` (688 lines)

**Endpoints** (15 total):

```typescript
// Authentication
POST /api/v1/admin/login
Body: { email, password }
Response: { adminId, token, role }

// Analytics
GET /api/v1/admin/analytics
Response: { totalUsers, activeUsers, datesScheduled, revenue, ... }

// User Management
GET /api/v1/admin/users?page=1&limit=20&status=ACTIVE
GET /api/v1/admin/users/:userId
PUT /api/v1/admin/users/:userId/status
PUT /api/v1/admin/users/:userId/verify/:verificationType
GET /api/v1/admin/users/:userId/activity

// Admin Management
POST /api/v1/admin/admins
GET /api/v1/admin/admins
PUT /api/v1/admin/admins/:adminId/role
DELETE /api/v1/admin/admins/:adminId
GET /api/v1/admin/profile
PUT /api/v1/admin/profile

// AI Date Curation
GET /api/v1/admin/curation/candidates
POST /api/v1/admin/curation/analyze
```

**Key Functions**:
```typescript
export const adminService = {
  // Auth
  login: (email, password) => Promise<AdminAuth>

  // Analytics
  getAnalytics: () => Promise<Analytics>

  // Users
  getAllUsers: (filters) => Promise<UserList>
  getUserById: (userId) => Promise<UserDetails>
  updateUserStatus: (userId, status) => Promise<void>
  verifyUser: (userId, type) => Promise<void>
  getUserActivity: (userId) => Promise<Activity[]>

  // Admins
  createAdmin: (data) => Promise<Admin>
  getAllAdmins: () => Promise<Admin[]>
  updateAdminRole: (adminId, role) => Promise<void>
  deleteAdmin: (adminId) => Promise<void>

  // AI Curation
  getCurationCandidates: () => Promise<Candidate[]>
  curateDates: (userId, candidateIds) => Promise<MatchResult[]>
}
```

**AI Curation Types**:
```typescript
interface CurationCandidate {
  userId: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  profileCompletion: number;
  emailVerified: boolean;
  aadharVerified: boolean;
  workEmailVerified: boolean;
  availableSlotsCount: number;
  nextAvailableDate: number;
}

interface MatchResult {
  userId: string;
  name: string;
  age: number;
  gender: string;
  compatibilityScore: number; // 0-100
  isMatch: boolean; // score >= 60
  reasoning: string;
  matchedAspects: string[];
  mismatchedAspects: string[];
}
```

---

### Availability Service

**File**: `src/services/availability/availabilityService.ts`

**Endpoints**:
```typescript
GET /api/v1/availability
POST /api/v1/availability
PUT /api/v1/availability/:id
DELETE /api/v1/availability/:id
```

**Functions**:
```typescript
export const availabilityService = {
  getAvailability: () => Promise<AvailabilitySlot[]>
  addAvailability: (slot: NewSlot) => Promise<AvailabilitySlot>
  updateAvailability: (id: string, slot: SlotUpdate) => Promise<void>
  deleteAvailability: (id: string) => Promise<void>
}

interface AvailabilitySlot {
  id: string;
  userId: string;
  startTime: string; // ISO 8601
  endTime: string;
  location: string;
  notes?: string;
}
```

---

## State Management

### Zustand Stores (4 Stores)

#### 1. Auth Store
**File**: `src/stores/authStore.ts`

```typescript
interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
}

// Usage
const authStore = useAuthStore();
await authStore.login(email, password);
```

**Features**:
- Persistent storage (localStorage)
- Automatic token refresh
- Error handling
- Loading states

---

#### 2. User Store
**File**: `src/stores/userStore.ts`

```typescript
interface UserState {
  // State
  profile: UserProfile | null;
  partnerPreferences: PartnerPreferences | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  uploadPhoto: (file: File) => Promise<void>;
  fetchPartnerPreferences: () => Promise<void>;
  updatePartnerPreferences: (data: PartnerPreferences) => Promise<void>;
}
```

---

#### 3. Admin Store
**File**: `src/stores/adminStore.ts`

```typescript
interface AdminState {
  // State
  admin: Admin | null;
  adminToken: string | null;
  users: User[];
  selectedUser: UserDetails | null;
  analytics: Analytics | null;
  curationCandidates: Candidate[];
  matchResults: MatchResult[];
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUserDetails: (userId: string) => Promise<void>;
  updateUserStatus: (userId: string, status: string) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchCurationCandidates: () => Promise<void>;
  analyzeCandidates: (userId: string, candidateIds: string[]) => Promise<void>;
}
```

**Persistence**: Admin token stored in localStorage

---

#### 4. Availability Store
**File**: `src/stores/availabilityStore.ts`

```typescript
interface AvailabilityState {
  // State
  slots: AvailabilitySlot[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAvailability: () => Promise<void>;
  addSlot: (slot: NewSlot) => Promise<void>;
  updateSlot: (id: string, slot: SlotUpdate) => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;
}
```

---

## Routing

**File**: `src/App.tsx`

**React Router v7** configuration:

```tsx
<Router>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/theme-components" element={<ThemePreview />} />

    {/* User Routes (Protected) */}
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/partner-preferences" element={<PartnerPreferencesPage />} />
    <Route path="/availability" element={<AvailabilityPage />} />

    {/* Admin Routes */}
    <Route path="/admin" element={<AdminLogin />} />
    <Route path="/admin/dashboard" element={<AdminAnalytics />} />
    <Route path="/admin/users" element={<AdminUsers />} />
    <Route path="/admin/users/:userId" element={<UserDetails />} />
    <Route path="/admin/curate" element={<CurateDates />} />
    <Route path="/admin/profile" element={<AdminProfile />} />
    <Route path="/admin/admins" element={<AdminManagement />} />
    <Route path="/admin/genie" element={<AdminGenie />} />
  </Routes>
</Router>
```

### Route Protection

**Future Enhancement**: Protected routes with auth guard

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Usage
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

---

## Theme System

### Theme Configuration

**File**: `src/theme/index.ts`

**Structure**:
```typescript
export const theme = {
  foundations: {
    breakpoints,  // Responsive breakpoints
    spacing,      // Spacing scale
    typography,   // Font system
  },
  colors: {
    // Custom color palette
  },
  animations: {
    // Custom animations
  }
}
```

### Breakpoints

**File**: `src/theme/foundations/breakpoints.ts`

```typescript
export const breakpoints = {
  base: '0px',
  sm: '480px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '992px',   // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}
```

**Usage**:
```tsx
<Box
  width={{ base: '100%', md: '50%', lg: '33%' }}
  padding={{ base: 4, md: 6, lg: 8 }}
>
```

### Color System

**File**: `src/theme/colors.reference.ts`

**Brand Colors**:
```typescript
const colors = {
  // Primary (Brand)
  primary: {
    50: '#ffe5f0',
    100: '#ffb3d1',
    500: '#ff1a75',  // Main brand color
    900: '#8c0033',
  },

  // Secondary
  secondary: {
    500: '#6b46c1',  // Purple accent
  },

  // Status
  success: '#38a169',
  warning: '#dd6b20',
  error: '#e53e3e',
  info: '#3182ce',

  // Neutrals
  gray: {
    50: '#f7fafc',
    500: '#718096',
    900: '#1a202c',
  }
}
```

**Usage**:
```tsx
<Button bg="primary.500" color="white">
  Click Me
</Button>

<Text color="gray.600">Description</Text>
```

### Typography

**File**: `src/theme/foundations/typography.ts`

```typescript
export const typography = {
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif',
    mono: 'Menlo, monospace',
  },

  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
}
```

### Spacing System

**File**: `src/theme/foundations/spacing.ts`

```typescript
export const spacing = {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
}
```

### Animations

**File**: `src/theme/romantic.animations.ts`

```typescript
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },

  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4 }
  },

  heartbeat: {
    animate: {
      scale: [1, 1.2, 1],
    },
    transition: {
      duration: 0.6,
      repeat: Infinity,
    }
  }
}
```

---

## Step-by-Step Guides

### Guide 1: Adding a New User Page

**Example**: Create a "Matches" page to show potential matches

#### Step 1: Create Page Component

**File**: `src/pages/MatchesPage/MatchesPage.tsx`

```tsx
import { Box, Heading, Grid, Card, Text, Button } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useMatchStore } from '../../stores/matchStore';

export function MatchesPage() {
  const { matches, isLoading, fetchMatches } = useMatchStore();

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box p={8}>
      <Heading mb={6}>Your Matches</Heading>

      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
        {matches.map((match) => (
          <Card key={match.id} p={4}>
            <Text fontWeight="bold">{match.name}</Text>
            <Text color="gray.600">{match.age} years old</Text>
            <Text mt={2}>{match.bio}</Text>
            <Button mt={4} bg="primary.500" color="white">
              View Profile
            </Button>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
```

**File**: `src/pages/MatchesPage/index.ts`

```typescript
export { MatchesPage } from './MatchesPage';
```

#### Step 2: Create Store

**File**: `src/stores/matchStore.ts`

```typescript
import { create } from 'zustand';
import { matchService } from '../services/match/matchService';

interface Match {
  id: string;
  name: string;
  age: number;
  bio: string;
  compatibilityScore: number;
}

interface MatchState {
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  fetchMatches: () => Promise<void>;
}

export const useMatchStore = create<MatchState>((set) => ({
  matches: [],
  isLoading: false,
  error: null,

  fetchMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const matches = await matchService.getMatches();
      set({ matches, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch matches',
        isLoading: false
      });
    }
  }
}));
```

#### Step 3: Create Service

**File**: `src/services/match/matchService.ts`

```typescript
import { apiClient } from '../base/apiClient';

export const matchService = {
  getMatches: async () => {
    return apiClient.get<Match[]>('/api/v1/matches');
  },

  likeMatch: async (matchId: string) => {
    return apiClient.post(`/api/v1/matches/${matchId}/like`, {});
  },

  passMatch: async (matchId: string) => {
    return apiClient.post(`/api/v1/matches/${matchId}/pass`, {});
  }
};
```

**File**: `src/services/match/index.ts`

```typescript
export * from './matchService';
```

#### Step 4: Add Route

**File**: `src/App.tsx`

```tsx
import { MatchesPage } from './pages/MatchesPage';

// In Routes:
<Route path="/matches" element={<MatchesPage />} />
```

#### Step 5: Add Navigation Link

**File**: `src/shared/components/Header/Header.tsx`

```tsx
import { Link } from 'react-router-dom';

<Link to="/matches">Matches</Link>
```

#### Step 6: Test

```bash
# Run frontend
cd apps/frontend
npm start

# Navigate to http://localhost:3000/matches
```

---

### Guide 2: Adding an Admin Feature

**Example**: Add "Export Users" feature to Admin Users page

#### Step 1: Add Service Function

**File**: `src/services/admin/adminService.ts`

```typescript
export const adminService = {
  // ... existing functions

  exportUsers: async (format: 'csv' | 'json') => {
    const response = await fetch(`${API_BASE}/api/v1/admin/users/export?format=${format}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${Date.now()}.${format}`;
    a.click();
  }
}
```

#### Step 2: Add Store Action

**File**: `src/stores/adminStore.ts`

```typescript
interface AdminState {
  // ... existing state

  exportUsers: (format: 'csv' | 'json') => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // ... existing state

  exportUsers: async (format) => {
    set({ isLoading: true });
    try {
      await adminService.exportUsers(format);
      // Success notification here
    } catch (error) {
      set({ error: 'Export failed' });
    } finally {
      set({ isLoading: false });
    }
  }
}));
```

#### Step 3: Add UI Button

**File**: `src/pages/Admin/Users/AdminUsers.tsx`

```tsx
import { Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';

export function AdminUsers() {
  const { exportUsers } = useAdminStore();

  return (
    <Box>
      {/* ... existing UI */}

      <Menu>
        <MenuButton as={Button} bg="primary.500" color="white">
          Export Users
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => exportUsers('csv')}>
            Export as CSV
          </MenuItem>
          <MenuItem onClick={() => exportUsers('json')}>
            Export as JSON
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
}
```

---

### Guide 3: Creating a Reusable Component

**Example**: Create a reusable `UserCard` component

#### Step 1: Create Component

**File**: `src/components/common/UserCard/UserCard.tsx`

```tsx
import { Card, Box, Image, Text, Button, HStack, Badge } from '@chakra-ui/react';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    age: number;
    bio: string;
    photoUrl?: string;
    verified: boolean;
  };
  onViewProfile?: (userId: string) => void;
  showActions?: boolean;
}

export function UserCard({ user, onViewProfile, showActions = true }: UserCardProps) {
  return (
    <Card p={4} borderRadius="lg" boxShadow="md">
      {user.photoUrl && (
        <Image
          src={user.photoUrl}
          alt={user.name}
          borderRadius="md"
          height="200px"
          objectFit="cover"
          mb={3}
        />
      )}

      <HStack justify="space-between" mb={2}>
        <Text fontSize="xl" fontWeight="bold">
          {user.name}, {user.age}
        </Text>
        {user.verified && (
          <Badge bg="green.500" color="white">
            Verified
          </Badge>
        )}
      </HStack>

      <Text color="gray.600" mb={4}>
        {user.bio}
      </Text>

      {showActions && (
        <Button
          width="100%"
          bg="primary.500"
          color="white"
          onClick={() => onViewProfile?.(user.id)}
        >
          View Profile
        </Button>
      )}
    </Card>
  );
}
```

#### Step 2: Export Component

**File**: `src/components/common/UserCard/index.ts`

```typescript
export { UserCard } from './UserCard';
export type { UserCardProps } from './UserCard';
```

#### Step 3: Use Component

**File**: `src/pages/MatchesPage/MatchesPage.tsx`

```tsx
import { UserCard } from '../../components/common/UserCard';

export function MatchesPage() {
  const { matches } = useMatchStore();
  const navigate = useNavigate();

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
      {matches.map((match) => (
        <UserCard
          key={match.id}
          user={match}
          onViewProfile={(id) => navigate(`/profile/${id}`)}
        />
      ))}
    </Grid>
  );
}
```

---

## Common Patterns

### Pattern 1: Data Fetching on Mount

```tsx
export function MyComponent() {
  const { data, isLoading, fetchData } = useMyStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <Spinner />;

  return <div>{/* Render data */}</div>;
}
```

### Pattern 2: Form Handling with Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older'),
});

type FormData = z.infer<typeof schema>;

export function ProfileForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await userService.updateProfile(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} />
      {errors.name && <Text color="red.500">{errors.name.message}</Text>}

      <Input {...register('email')} />
      {errors.email && <Text color="red.500">{errors.email.message}</Text>}

      <Button type="submit">Save</Button>
    </form>
  );
}
```

### Pattern 3: Responsive Design

```tsx
<Box
  display={{ base: 'block', md: 'flex' }}
  padding={{ base: 4, md: 6, lg: 8 }}
  width={{ base: '100%', md: '80%', lg: '60%' }}
>
  <Box flex="1" mb={{ base: 4, md: 0 }}>
    Left content
  </Box>
  <Box flex="1">
    Right content
  </Box>
</Box>
```

### Pattern 4: Protected Content

```tsx
export function ProtectedContent({ children, requiredRole }: Props) {
  const { admin } = useAdminStore();

  if (!admin) {
    return <Navigate to="/admin" />;
  }

  if (requiredRole && admin.role !== requiredRole) {
    return <Text>Access denied</Text>;
  }

  return <>{children}</>;
}
```

### Pattern 5: Error Boundary

```tsx
export function ErrorFallback({ error }: { error: Error }) {
  return (
    <Box p={8} bg="red.50" borderRadius="md">
      <Heading size="md" color="red.600" mb={2}>
        Something went wrong
      </Heading>
      <Text color="red.500">{error.message}</Text>
      <Button mt={4} onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </Box>
  );
}

// Usage with react-error-boundary
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <MyComponent />
</ErrorBoundary>
```

---

## Debugging Guide

### Issue 1: API Calls Failing

**Symptoms**:
```
Failed to fetch
Network request failed
CORS error
```

**Debug Steps**:

1. **Check backend is running**:
   ```bash
   curl http://localhost:8080/health
   ```

2. **Check browser console** for detailed error:
   ```javascript
   // Network tab -> Failed request -> Headers
   ```

3. **Verify API base URL**:
   ```typescript
   // src/services/base/apiClient.ts
   console.log('API_BASE:', process.env.REACT_APP_API_URL);
   ```

4. **Check auth token**:
   ```typescript
   const { accessToken } = useAuthStore();
   console.log('Token:', accessToken);
   ```

**Solutions**:
```bash
# Ensure backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Verify REACT_APP_API_URL
docker-compose exec frontend printenv | grep REACT_APP
```

---

### Issue 2: State Not Updating

**Symptoms**:
- UI not re-rendering after store update
- Stale data displayed

**Debug Steps**:

1. **Add logging to store**:
   ```typescript
   fetchData: async () => {
     console.log('Before fetch:', get().data);
     const newData = await api.getData();
     console.log('After fetch:', newData);
     set({ data: newData });
     console.log('After set:', get().data);
   }
   ```

2. **Check component re-render**:
   ```typescript
   useEffect(() => {
     console.log('Component rendered, data:', data);
   });
   ```

3. **Verify Zustand selector**:
   ```typescript
   // ❌ Wrong - creates new reference every render
   const data = useStore((state) => state.data.filter(...));

   // ✅ Correct - select raw data
   const allData = useStore((state) => state.data);
   const filteredData = useMemo(() => allData.filter(...), [allData]);
   ```

---

### Issue 3: Chakra UI Components Not Styling

**Symptoms**:
- Components appear unstyled
- Theme colors not applied

**Debug Steps**:

1. **Check ChakraProvider**:
   ```tsx
   // src/App.tsx
   import { ChakraProvider } from './providers/ChakraProvider';

   <ChakraProvider>
     <Router>
       {/* ... */}
     </Router>
   </ChakraProvider>
   ```

2. **Verify theme import**:
   ```typescript
   // src/providers/ChakraProvider.tsx
   import { theme } from '../theme';
   console.log('Theme:', theme);
   ```

3. **Check prop syntax** (v3 vs v2):
   ```tsx
   // ❌ v2 syntax (won't work in v3)
   <Button colorScheme="blue">

   // ✅ v3 syntax
   <Button bg="blue.500" color="white">
   ```

---

### Issue 4: Infinite Loop / Too Many Re-renders

**Symptoms**:
```
Error: Too many re-renders
Component constantly re-rendering
```

**Common Causes**:

1. **useEffect without dependencies**:
   ```typescript
   // ❌ Wrong - runs on every render
   useEffect(() => {
     fetchData();
   });

   // ✅ Correct - runs once on mount
   useEffect(() => {
     fetchData();
   }, []);
   ```

2. **State update in render**:
   ```typescript
   // ❌ Wrong
   function MyComponent() {
     setState(newValue); // Called during render!
     return <div />;
   }

   // ✅ Correct
   function MyComponent() {
     useEffect(() => {
       setState(newValue);
     }, []);
     return <div />;
   }
   ```

3. **Function recreation causing dependency change**:
   ```typescript
   // ❌ Wrong - new function every render
   useEffect(() => {
     const handleClick = () => {};
     document.addEventListener('click', handleClick);
   }, [handleClick]); // handleClick changes every render!

   // ✅ Correct
   const handleClick = useCallback(() => {}, []);
   useEffect(() => {
     document.addEventListener('click', handleClick);
   }, [handleClick]);
   ```

---

### Issue 5: TypeScript Errors with Generated Types

**Symptoms**:
```
Cannot find module './gen/auth/v1/auth_pb'
Property 'xyz' does not exist on type...
```

**Solutions**:

1. **Regenerate proto types**:
   ```bash
   make generate
   ```

2. **Check gen/ folder exists**:
   ```bash
   ls apps/frontend/src/gen/
   ```

3. **Restart TypeScript server**:
   - VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

4. **Verify import path**:
   ```typescript
   // ✅ Correct
   import { AuthServiceClient } from '../../gen/auth/v1/auth_pb';

   // ❌ Wrong
   import { AuthServiceClient } from 'gen/auth/v1/auth_pb';
   ```

---

## Best Practices

### 1. Component Organization

**DO**:
```
pages/MyFeature/
├── MyFeature.tsx          # Main page component
├── MyFeatureForm.tsx      # Feature-specific component
├── components/            # Sub-components (if reused within feature)
│   └── FeatureCard.tsx
└── index.ts               # Clean exports
```

**DON'T**:
```
pages/
├── my-feature.tsx         # Wrong naming
├── MyFeaturePart1.tsx     # Split without reason
└── MyFeaturePart2.tsx
```

### 2. State Management

**DO**:
```typescript
// Keep related state together
interface UserState {
  profile: Profile;
  preferences: Preferences;
  isLoading: boolean;
  error: string | null;
}

// Logical action grouping
const actions = {
  fetchProfile: async () => {},
  updateProfile: async (data) => {},
  clearError: () => {},
}
```

**DON'T**:
```typescript
// Scattered state
const [profile, setProfile] = useState();
const [isLoading, setIsLoading] = useState();
const [error, setError] = useState();
// ... in multiple components
```

### 3. API Calls

**DO**:
```typescript
// Centralized in services
const result = await userService.updateProfile(data);

// Error handling in store
try {
  const data = await api.call();
  set({ data });
} catch (error) {
  set({ error: error.message });
}
```

**DON'T**:
```typescript
// Direct fetch in components
const response = await fetch('/api/users');
const data = await response.json();
```

### 4. Type Safety

**DO**:
```typescript
// Use generated proto types
import { UserProfile } from '../../gen/user/v1/user_pb';

interface Props {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

// Define clear interfaces
interface FormData {
  name: string;
  age: number;
  bio: string;
}
```

**DON'T**:
```typescript
// Loose typing
interface Props {
  user: any;
  onUpdate: Function;
}
```

### 5. Performance

**DO**:
```typescript
// Memoize expensive calculations
const filtered = useMemo(
  () => users.filter(u => u.age > 25),
  [users]
);

// Callback memoization
const handleClick = useCallback(() => {
  // handler logic
}, [dependency]);

// Code splitting
const AdminPage = lazy(() => import('./pages/Admin'));
```

**DON'T**:
```typescript
// Recalculate on every render
function MyComponent() {
  const filtered = users.filter(u => u.age > 25); // ❌
  return <List items={filtered} />;
}
```

### 6. Responsive Design

**DO**:
```tsx
<Box
  display={{ base: 'block', lg: 'flex' }}
  gap={{ base: 4, lg: 8 }}
  p={{ base: 4, md: 6, lg: 8 }}
>
```

**DON'T**:
```tsx
<Box display="flex"> {/* Not responsive */}
```

### 7. Error Handling

**DO**:
```typescript
try {
  await api.call();
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network error
  } else if (error instanceof ValidationError) {
    // Handle validation error
  }
  set({ error: error.message });
}
```

**DON'T**:
```typescript
try {
  await api.call();
} catch (error) {
  console.log(error); // Silent failure
}
```

### 8. Accessibility

**DO**:
```tsx
<Button aria-label="Close modal" onClick={onClose}>
  ×
</Button>

<Input
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
```

**DON'T**:
```tsx
<div onClick={handleClick}> {/* Not keyboard accessible */}
  Click me
</div>
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm start                  # Start dev server (port 3000)
npm run build              # Production build
npm test                   # Run tests
npm run lint               # Run ESLint

# Type Checking
npm run type-check         # TypeScript check without build

# Proto Generation
make generate              # Generate proto types (from repo root)
```

### File Creation Checklist

**New Page**:
- [ ] Create `src/pages/MyPage/MyPage.tsx`
- [ ] Create `src/pages/MyPage/index.ts`
- [ ] Add route in `App.tsx`
- [ ] Create store if needed in `src/stores/`
- [ ] Create service if needed in `src/services/`

**New Component**:
- [ ] Create `src/components/category/MyComponent/MyComponent.tsx`
- [ ] Create `src/components/category/MyComponent/index.ts`
- [ ] Define TypeScript interface for props
- [ ] Add to exports

**New Service**:
- [ ] Create `src/services/myService/myService.ts`
- [ ] Define API functions with types
- [ ] Create `index.ts` for exports
- [ ] Import in store where needed

### Environment Variables

```bash
# Required
REACT_APP_API_URL=http://localhost:8080

# Optional
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_DEBUG_MODE=false
```

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- TypeScript + JavaScript
- Chakra UI Snippets
- Auto Import
- Error Lens

---

## Summary

The Datifyy frontend is a comprehensive React application with:

- **17 Pages** (9 user + 8 admin)
- **30+ Components** (auth, admin, shared)
- **5 Services** (auth, user, admin, availability, base)
- **4 Zustand Stores** (auth, user, admin, availability)
- **Chakra UI v3** design system
- **TypeScript** type safety
- **Protocol Buffers** API integration
- **AI-Powered Features** (date curation)

For backend integration, see [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

For API testing, see [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md).

---

**Built with ❤️ for meaningful connections**
