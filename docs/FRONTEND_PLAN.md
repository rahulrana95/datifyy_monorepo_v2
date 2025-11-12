# Frontend Implementation Plan

Comprehensive plan for building the Datifyy frontend with React, TypeScript, TanStack Form, and 100% test coverage.

## Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18 | UI library |
| **Language** | TypeScript 100% | Type safety |
| **Forms** | TanStack Form | Form state management |
| **Data Fetching** | TanStack Query | Server state & caching |
| **State Management** | Zustand | Global client state |
| **Styling** | CSS Modules / Styled Components | Component styling |
| **Testing (Unit)** | React Testing Library | Component tests |
| **Testing (E2E)** | Playwright | End-to-end tests |
| **API Client** | gRPC-web / Fetch | Backend communication |
| **Routing** | React Router v6 | Navigation |

---

## Project Structure

```
apps/frontend/src/
├── features/                    # Feature-based modules
│   ├── auth/                    # Authentication feature
│   │   ├── components/          # Feature-specific components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.test.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── SignupForm.test.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ForgotPasswordForm.test.tsx
│   │   │   └── AuthModal.tsx
│   │   ├── hooks/               # Feature-specific hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useAuth.test.ts
│   │   ├── services/            # API service methods
│   │   │   ├── authService.ts
│   │   │   └── authService.test.ts
│   │   ├── store/               # Feature state management
│   │   │   ├── authStore.ts
│   │   │   └── authStore.test.ts
│   │   ├── types/               # Feature-specific types
│   │   │   └── auth.types.ts
│   │   ├── utils/               # Feature-specific utilities
│   │   │   ├── validators.ts
│   │   │   └── validators.test.ts
│   │   └── index.ts             # Public API exports
│   │
│   ├── profile/                 # User profile feature
│   │   ├── components/
│   │   │   ├── ProfileView.tsx
│   │   │   ├── ProfileView.test.tsx
│   │   │   ├── ProfileEdit.tsx
│   │   │   ├── ProfileEdit.test.tsx
│   │   │   ├── PhotoUpload.tsx
│   │   │   └── PhotoGallery.tsx
│   │   ├── hooks/
│   │   │   └── useProfile.ts
│   │   ├── services/
│   │   │   └── profileService.ts
│   │   ├── store/
│   │   │   └── profileStore.ts
│   │   ├── types/
│   │   │   └── profile.types.ts
│   │   └── utils/
│   │       └── profileHelpers.ts
│   │
│   ├── preferences/             # User preferences feature
│   │   ├── components/
│   │   │   ├── PartnerPreferences.tsx
│   │   │   ├── PartnerPreferences.test.tsx
│   │   │   ├── AgeRangeSlider.tsx
│   │   │   └── DistanceSlider.tsx
│   │   ├── services/
│   │   │   └── preferencesService.ts
│   │   ├── store/
│   │   │   └── preferencesStore.ts
│   │   └── types/
│   │       └── preferences.types.ts
│   │
│   └── settings/                # Settings feature
│       ├── components/
│       │   ├── NotificationSettings.tsx
│       │   ├── PrivacySettings.tsx
│       │   └── AccountSettings.tsx
│       ├── services/
│       │   └── settingsService.ts
│       ├── store/
│       │   └── settingsStore.ts
│       └── types/
│           └── settings.types.ts
│
├── shared/                      # Shared/reusable components
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── Input.test.tsx
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   │   ├── Modal.tsx
│   │   │   ├── Modal.test.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── Avatar/
│   │   ├── Spinner/
│   │   ├── Select/
│   │   ├── Checkbox/
│   │   ├── Radio/
│   │   └── Toast/
│   ├── layouts/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   └── BurgerMenu.tsx
│   │   ├── Footer/
│   │   └── MainLayout/
│   └── hooks/
│       ├── useMediaQuery.ts
│       ├── useDebounce.ts
│       └── useLocalStorage.ts
│
├── routing/                     # Routing configuration
│   ├── ProtectedRoute.tsx
│   ├── ProtectedRoute.test.tsx
│   ├── routes.tsx
│   └── index.ts
│
├── utils/                       # Global utilities
│   ├── api/
│   │   ├── apiClient.ts
│   │   ├── apiClient.test.ts
│   │   └── endpoints.ts
│   ├── storage/
│   │   ├── tokenStorage.ts
│   │   └── tokenStorage.test.ts
│   ├── validators/
│   │   ├── commonValidators.ts
│   │   └── commonValidators.test.ts
│   └── formatters/
│       ├── dateFormatters.ts
│       └── numberFormatters.ts
│
├── types/                       # Global types
│   ├── api.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── theme/                       # Theme configuration
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── breakpoints.ts
│   └── index.ts
│
├── hooks/                       # Global hooks
│   ├── useAutoLogin.ts
│   └── useAutoLogin.test.ts
│
├── App.tsx                      # Root component
├── App.test.tsx
├── index.tsx                    # Entry point
└── setupTests.ts                # Test configuration

tests/
└── e2e/                         # Playwright E2E tests
    ├── auth.spec.ts
    ├── profile.spec.ts
    ├── preferences.spec.ts
    ├── settings.spec.ts
    └── fixtures/
        └── testData.ts
```

---

## Feature Breakdown

### 1. Authentication Feature

**Components:**
- `LoginForm.tsx` - Email/password login with validation
- `SignupForm.tsx` - User registration form
- `ForgotPasswordForm.tsx` - Password reset request
- `AuthModal.tsx` - Modal wrapper with tabs for login/signup/forgot

**Store (Zustand):**
```typescript
interface AuthStore {
  user: User | null;
  tokens: { accessToken: string; refreshToken: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  setUser: (user: User) => void;
}
```

**Service Methods:**
```typescript
class AuthService {
  async login(email: string, password: string): Promise<AuthResponse>
  async register(data: RegisterData): Promise<AuthResponse>
  async logout(refreshToken: string): Promise<void>
  async refreshToken(refreshToken: string): Promise<TokenPair>
  async forgotPassword(email: string): Promise<void>
  async resetPassword(token: string, newPassword: string): Promise<void>
  async verifyEmail(email: string, code: string): Promise<void>
}
```

**Types:**
```typescript
interface User {
  userId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  photoUrl?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
}
```

---

### 2. Profile Feature

**Components:**
- `ProfileView.tsx` - Read-only profile display
- `ProfileEdit.tsx` - Editable profile form with TanStack Form
- `PhotoUpload.tsx` - Photo upload with preview
- `PhotoGallery.tsx` - Photo grid with reordering
- `ProfileSection.tsx` - Reusable section wrapper
- `ProfileField.tsx` - Field display/edit component

**Store (Zustand):**
```typescript
interface ProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  isEditing: boolean;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadPhoto: (file: File) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  setEditing: (editing: boolean) => void;
}
```

**Service Methods:**
```typescript
class ProfileService {
  async getMyProfile(): Promise<UserProfile>
  async updateProfile(data: UpdateProfileData): Promise<UserProfile>
  async uploadPhoto(file: File): Promise<Photo>
  async deletePhoto(photoId: string): Promise<void>
}
```

---

### 3. Preferences Feature

**Components:**
- `PartnerPreferences.tsx` - Main preferences page
- `AgeRangeSlider.tsx` - Dual thumb slider for age
- `DistanceSlider.tsx` - Distance range selector
- `FilterSection.tsx` - Grouped filter options
- `PreferenceCheckbox.tsx` - Multi-select preferences

**Store (Zustand):**
```typescript
interface PreferencesStore {
  partnerPreferences: PartnerPreferences | null;
  userPreferences: UserPreferences | null;

  // Actions
  fetchPartnerPreferences: () => Promise<void>;
  updatePartnerPreferences: (data: Partial<PartnerPreferences>) => Promise<void>;
  fetchUserPreferences: () => Promise<void>;
  updateUserPreferences: (data: Partial<UserPreferences>) => Promise<void>;
}
```

**Service Methods:**
```typescript
class PreferencesService {
  async getPartnerPreferences(): Promise<PartnerPreferences>
  async updatePartnerPreferences(data: PartnerPreferences): Promise<PartnerPreferences>
  async getUserPreferences(): Promise<UserPreferences>
  async updateUserPreferences(data: UserPreferences): Promise<UserPreferences>
}
```

---

### 4. Settings Feature

**Components:**
- `SettingsPage.tsx` - Main settings container
- `NotificationSettings.tsx` - Push, email, SMS toggles
- `PrivacySettings.tsx` - Visibility and discovery options
- `AccountSettings.tsx` - Password change, delete account
- `SettingsSection.tsx` - Reusable section component

**Store (Zustand):**
```typescript
interface SettingsStore {
  settings: Settings | null;

  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<Settings>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}
```

---

### 5. Shared Components

All shared components follow this structure:

**Button Component Example:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ ... }) => { ... }
```

**Required Shared Components:**
1. `Button` - Primary, secondary, outline variants
2. `Input` - Text, email, password, number types
3. `Modal` - Backdrop, close button, responsive
4. `Card` - Content container with shadow
5. `Avatar` - User photo with fallback initials
6. `Spinner` - Loading indicator
7. `Select` - Dropdown with search
8. `Checkbox` - Boolean input
9. `Radio` - Single choice input
10. `Toast` - Notification system
11. `Slider` - Range input
12. `Switch` - Toggle input

---

## Theme System

**Colors (`theme/colors.ts`):**
```typescript
export const colors = {
  // Primary brand colors
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    500: '#6b7280',
    700: '#374151',
    900: '#111827',
  },

  // Semantic colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;
```

**Typography (`theme/typography.ts`):**
```typescript
export const typography = {
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
    mono: 'Monaco, monospace',
  },

  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
```

**Spacing (`theme/spacing.ts`):**
```typescript
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
} as const;
```

**Breakpoints (`theme/breakpoints.ts`):**
```typescript
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
```

---

## Routing Configuration

**Protected Route Wrapper:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
```

**Routes Configuration:**
```typescript
const routes = [
  // Public routes
  { path: '/', element: <LandingPage /> },
  { path: '/about', element: <AboutPage /> },

  // Protected routes
  {
    path: '/profile',
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
  },
  {
    path: '/preferences',
    element: <ProtectedRoute><PreferencesPage /></ProtectedRoute>
  },
  {
    path: '/settings',
    element: <ProtectedRoute><SettingsPage /></ProtectedRoute>
  },
];
```

---

## Auto-Login Implementation

**Hook: `useAutoLogin.ts`**
```typescript
export const useAutoLogin = () => {
  const { setUser, setTokens, refreshTokens } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = getStoredTokens();

        if (!tokens) {
          setIsLoading(false);
          return;
        }

        // Check if access token is expired
        if (isTokenExpired(tokens.accessToken)) {
          // Try to refresh
          await refreshTokens();
        } else {
          // Token valid, restore session
          setTokens(tokens);
          // Fetch user profile
          const user = await authService.getProfile();
          setUser(user);
        }
      } catch (error) {
        // Clear invalid tokens
        clearStoredTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return { isLoading };
};
```

**Usage in App.tsx:**
```typescript
function App() {
  const { isLoading } = useAutoLogin();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* routes */}
      </Routes>
    </Router>
  );
}
```

---

## TanStack Form Integration

**Example: Login Form**
```typescript
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginForm: React.FC = () => {
  const { login } = useAuthStore();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await login(value);
    },
    validatorAdapter: zodValidator,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: loginSchema.shape.email,
        }}
      >
        {(field) => (
          <Input
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.errors[0]}
            label="Email"
            type="email"
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: loginSchema.shape.password,
        }}
      >
        {(field) => (
          <Input
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.errors[0]}
            label="Password"
            type="password"
          />
        )}
      </form.Field>

      <Button type="submit" loading={form.state.isSubmitting}>
        Login
      </Button>
    </form>
  );
};
```

---

## Testing Strategy

### Unit Tests (React Testing Library)

**Component Test Example:**
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows spinner when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**Store Test Example:**
```typescript
// authStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './authStore';
import { authService } from '../services/authService';

jest.mock('../services/authService');

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it('logs in user successfully', async () => {
    const mockUser = { userId: '1', email: 'test@example.com', name: 'Test' };
    (authService.login as jest.Mock).mockResolvedValue({
      user: mockUser,
      tokens: { accessToken: 'token', refreshToken: 'refresh' },
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

**Service Test Example:**
```typescript
// authService.test.ts
import { authService } from './authService';
import { apiClient } from '../../utils/api/apiClient';

jest.mock('../../utils/api/apiClient');

describe('authService', () => {
  it('calls login endpoint with correct data', async () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    const mockResponse = { user: { userId: '1' }, tokens: {} };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.login(credentials.email, credentials.password);

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/login/email', credentials);
    expect(result).toEqual(mockResponse);
  });
});
```

### E2E Tests (Playwright)

**Example: Auth Flow**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up with email', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Click signup button
    await page.click('text=Sign Up');

    // Fill signup form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to profile
    await expect(page).toHaveURL('/profile');

    // Verify user is logged in
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('user can login with email', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Click login button
    await page.click('text=Login');

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect
    await expect(page).toHaveURL('/profile');
  });

  test('protected route redirects unauthenticated users', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });
});
```

**Example: Profile Flow**
```typescript
// tests/e2e/profile.spec.ts
test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000');
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/profile');
  });

  test('user can view their profile', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('My Profile');
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });

  test('user can edit their bio', async ({ page }) => {
    // Click edit button
    await page.click('button:has-text("Edit Profile")');

    // Update bio
    const newBio = 'This is my updated bio!';
    await page.fill('textarea[name="bio"]', newBio);

    // Save changes
    await page.click('button:has-text("Save")');

    // Verify changes
    await expect(page.locator(`text=${newBio}`)).toBeVisible();
  });
});
```

---

## Coverage Requirements

### TypeScript Coverage: 100%
- No `any` types allowed
- All props interfaces defined
- All API responses typed
- Strict mode enabled in `tsconfig.json`

### Test Coverage: 100%
- All components tested
- All hooks tested
- All stores tested
- All services tested
- All utilities tested

**Coverage Configuration (`package.json`):**
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 100,
        "functions": 100,
        "lines": 100,
        "statements": 100
      }
    }
  }
}
```

**Run Coverage:**
```bash
# Unit test coverage
npm test -- --coverage

# E2E test coverage (code coverage during E2E)
npx playwright test --reporter=html
```

---

## Implementation Order

### Phase 1: Foundation (Days 1-2)
1. ✅ Setup project structure
2. ✅ Install dependencies
3. ✅ Configure theme system
4. ✅ Create shared components (Button, Input, Modal)
5. ✅ Write tests for shared components

### Phase 2: Authentication (Days 3-4)
6. ✅ Setup auth store
7. ✅ Create auth service
8. ✅ Build auth modal and forms
9. ✅ Implement auto-login
10. ✅ Create protected routes
11. ✅ Write auth tests

### Phase 3: Layout (Day 5)
12. ✅ Build Header component
13. ✅ Build Burger Menu
14. ✅ Test layout components

### Phase 4: Profile (Days 6-7)
15. ✅ Create profile feature structure
16. ✅ Build Profile View page
17. ✅ Build Profile Edit page
18. ✅ Write profile tests

### Phase 5: Preferences & Settings (Days 8-9)
19. ✅ Build Partner Preferences page
20. ✅ Build Settings page
21. ✅ Write preferences tests
22. ✅ Write settings tests

### Phase 6: E2E Testing (Day 10)
23. ✅ Setup Playwright
24. ✅ Write E2E tests for all flows
25. ✅ Verify 100% coverage

---

## Dependencies to Install

```bash
# Core dependencies
npm install @tanstack/react-form @tanstack/react-query
npm install zustand
npm install react-router-dom
npm install zod
npm install @tanstack/zod-form-adapter

# Development dependencies
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npm install -D @types/react @types/react-dom
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D prettier eslint-config-prettier
```

---

## Next Steps

1. Review this plan and approve architecture
2. Start with Phase 1: Foundation setup
3. Implement features incrementally with tests
4. Review and iterate on each phase
5. Final E2E testing and coverage verification

---

**Questions to Address:**
1. API protocol: gRPC-web or REST endpoints?
2. Styling: CSS Modules, Styled Components, or Tailwind?
3. Toast/notification library preference?
4. Image upload: Direct to backend or cloud storage (S3)?
5. Date/time picker library preference?

---

**Last Updated**: November 2024
**Status**: Planning Phase
