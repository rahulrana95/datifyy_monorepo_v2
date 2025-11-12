# Backend Architecture

Comprehensive documentation of the Datifyy backend architecture, services, and implementation details.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Service Architecture](#service-architecture)
- [AuthService (26 RPCs)](#authservice-26-rpcs)
- [UserService (15 RPCs)](#userservice-15-rpcs)
- [Database Schema](#database-schema)
- [Code Organization](#code-organization)
- [Authentication & Security](#authentication--security)
- [Testing](#testing)

---

## Overview

The Datifyy backend is a microservices-oriented Go application that provides comprehensive dating app functionality through gRPC and REST APIs. The architecture follows clean code principles with separation of concerns across service, repository, and utility layers.

### Key Features

- **Dual Protocol Support**: gRPC (primary) + REST (HTTP wrapper)
- **Type-Safe Communication**: Protocol Buffers for API contracts
- **Comprehensive Authentication**: Email & phone-based auth with JWT tokens
- **Session Management**: Multi-device support with refresh tokens
- **Real-time Capabilities**: Redis for caching and session storage
- **Email Integration**: MailerSend for transactional emails
- **Production-Ready**: Connection pooling, graceful shutdown, health checks

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Language** | Go 1.21+ | High-performance backend |
| **API Protocols** | gRPC + REST | Type-safe RPC & browser-friendly REST |
| **Database** | PostgreSQL 14+ | Primary data store |
| **Cache** | Redis 7+ | Session storage & caching |
| **Schema** | Protocol Buffers | API contracts & type generation |
| **Authentication** | JWT | Stateless authentication |
| **Email** | MailerSend | Transactional emails |
| **Testing** | go-sqlmock + testify | Unit & integration tests |
| **Hot Reload** | Air | Development auto-reload |

---

## Service Architecture

### Layered Architecture

```
┌──────────────────────────────────────────────┐
│         Client Applications                   │
│    (Web, iOS, Android, CLI)                  │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│         API Layer (Dual Protocol)             │
│  ┌────────────────┐  ┌──────────────────┐   │
│  │  gRPC Server   │  │  HTTP/REST API   │   │
│  │    :9090       │  │     :8080        │   │
│  └────────┬───────┘  └────────┬─────────┘   │
└───────────┼──────────────────┼───────────────┘
            │                  │
            └────────┬─────────┘
                     ↓
┌──────────────────────────────────────────────┐
│         Service Layer                         │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ AuthService  │  │   UserService        │ │
│  │ (26 RPCs)    │  │   (15 RPCs)          │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│        Utility & Helper Layer                 │
│  • Password hashing (bcrypt)                 │
│  • Token generation (JWT)                    │
│  • Email service (MailerSend)                │
│  • Type conversions                          │
└─────────────┬────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────┐
│         Data Layer                            │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │  PostgreSQL  │  │     Redis            │ │
│  │   :5432      │  │     :6379            │ │
│  └──────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Modular Service Organization

The service layer is split into focused, single-responsibility modules:

**AuthService** (6 files):
- `auth_service.go` - Core initialization and service struct
- `auth_password_service.go` - Password change and reset
- `auth_session_service.go` - Session and token management
- `auth_phone_service.go` - Phone authentication
- `auth_device_service.go` - Device registration
- `auth_verification_service.go` - Email/phone verification

**UserService** (6 files):
- `user_service.go` - Core initialization
- `user_profile_service.go` - Profile CRUD
- `user_photo_service.go` - Photo management
- `user_preferences_service.go` - User & partner preferences
- `user_discovery_service.go` - User search
- `user_blocking_service.go` - Block/report functionality

**Utilities** (4 files):
- `utils_user_profile.go` - Profile builders and conversions
- `utils_user.go` - User-related helpers
- `utils_conversion.go` - Type conversions
- `utils_token.go` - Token generation

---

## AuthService (26 RPCs)

Complete authentication system with multi-channel support.

### Email Authentication (4 RPCs)

#### `RegisterWithEmail`
Register a new user with email and password.

**Request:**
```protobuf
message RegisterWithEmailRequest {
  EmailPasswordCredentials credentials = 1;
}

message EmailPasswordCredentials {
  string email = 1;
  string password = 2;
  string name = 3;
  DeviceInfo device_info = 4;
}
```

**Response:**
- User profile
- Access token (JWT, 15min expiry)
- Refresh token (30 days)
- Session ID
- Email verification status

**Implementation:**
- Password hashed with bcrypt
- Email verification code generated
- Verification email sent via MailerSend
- Refresh token stored in database
- Session created in Redis

**File:** `internal/service/auth_service.go:59-149`

#### `LoginWithEmail`
Authenticate existing user with email and password.

**Request:**
```protobuf
message LoginWithEmailRequest {
  EmailPasswordCredentials credentials = 1;
}
```

**Response:**
- User profile
- Access token
- Refresh token
- Session ID

**Validation:**
- Email exists
- Password matches (bcrypt compare)
- Account not suspended/deleted

**File:** `internal/service/auth_service.go:151-232`

#### `VerifyEmail`
Verify user's email address with code.

**Request:**
```protobuf
message VerifyEmailRequest {
  string email = 1;
  string code = 2;
}
```

**Response:**
- Success status
- Message

**Implementation:**
- Validates code from `email_verification_codes` table
- Checks expiration (15 minutes)
- Updates `email_verified` flag
- Deletes used code

**File:** `internal/service/auth_verification_service.go:11-80`

#### `ResendVerificationEmail`
Resend email verification code.

**Request:**
```protobuf
message ResendVerificationEmailRequest {
  string email = 1;
}
```

**Response:**
- Success status
- Message

**Implementation:**
- Generates new 6-digit code
- Stores with 15-minute expiration
- Sends email via MailerSend

**File:** `internal/service/auth_verification_service.go:82-150`

### Phone Authentication (4 RPCs)

#### `RegisterWithPhone`
Register with phone number.

**Request:**
```protobuf
message RegisterWithPhoneRequest {
  PhonePasswordCredentials credentials = 1;
}
```

**Response:**
- User profile
- Access/refresh tokens
- Session
- SMS verification status

**File:** `internal/service/auth_phone_service.go:13-104`

#### `LoginWithPhone`
Login with phone number.

**Request:**
```protobuf
message LoginWithPhoneRequest {
  PhonePasswordCredentials credentials = 1;
}
```

**File:** `internal/service/auth_phone_service.go:106-183`

#### `VerifyPhone`
Verify phone with SMS code.

**Request:**
```protobuf
message VerifyPhoneRequest {
  string phone_number = 1;
  string code = 2;
}
```

**File:** `internal/service/auth_verification_service.go:152-218`

#### `ResendPhoneVerification`
Resend SMS verification code.

**Request:**
```protobuf
message ResendPhoneVerificationRequest {
  string phone_number = 1;
}
```

**File:** `internal/service/auth_phone_service.go:185-242`

### Session Management (7 RPCs)

#### `RefreshToken`
Get new access token using refresh token.

**Request:**
```protobuf
message RefreshTokenRequest {
  string refresh_token = 1;
  DeviceInfo device_info = 2;
}
```

**Response:**
- New access token
- New refresh token (rotated)

**Security:**
- Old refresh token invalidated
- Token rotation prevents replay attacks
- Validates token from database

**File:** `internal/service/auth_session_service.go:13-104`

#### `RevokeToken`
Revoke a refresh token (logout).

**Request:**
```protobuf
message RevokeTokenRequest {
  string refresh_token = 1;
}
```

**File:** `internal/service/auth_session_service.go:106-134`

#### `Logout`
End user session.

**File:** `internal/service/auth_session_service.go:136-164`

#### `ValidateSession`
Check if session is valid.

**File:** `internal/service/auth_session_service.go:166-194`

#### `GetActiveSessions`
List all active user sessions.

**Response:**
- Session ID
- Device info
- Last active timestamp
- IP address

**File:** `internal/service/auth_session_service.go:196-224`

#### `RevokeSession`
End a specific session.

**File:** `internal/service/auth_session_service.go:226-254`

#### `RevokeAllSessions`
End all user sessions (security action).

**File:** `internal/service/auth_session_service.go:256-284`

### Password Management (3 RPCs)

#### `ChangePassword`
Change user password (requires current password).

**Request:**
```protobuf
message ChangePasswordRequest {
  string current_password = 1;
  string new_password = 2;
}
```

**Validation:**
- User authenticated
- Current password correct
- New password meets requirements (min 8 chars)

**File:** `internal/service/auth_password_service.go:13-86`

#### `RequestPasswordReset`
Request password reset token.

**Request:**
```protobuf
message RequestPasswordResetRequest {
  string email = 1;
}
```

**Response:**
- Success message

**Implementation:**
- Generates secure random token
- Stores with 1-hour expiration
- Sends reset email via MailerSend

**File:** `internal/service/auth_password_service.go:88-145`

#### `ConfirmPasswordReset`
Complete password reset with token.

**Request:**
```protobuf
message ConfirmPasswordResetRequest {
  string email = 1;
  string reset_token = 2;
  string new_password = 3;
}
```

**Validation:**
- Token exists and not expired
- New password meets requirements
- Token used once (deleted after use)

**File:** `internal/service/auth_password_service.go:147-217`

### Device Management (4 RPCs)

#### `RegisterDevice`
Register device for push notifications.

**Request:**
```protobuf
message RegisterDeviceRequest {
  DeviceInfo device = 1;
  string push_token = 2;
}
```

**File:** `internal/service/auth_device_service.go:13-63`

#### `UpdateDevice`
Update device information.

**File:** `internal/service/auth_device_service.go:65-115`

#### `UnregisterDevice`
Remove device registration.

**File:** `internal/service/auth_device_service.go:117-145`

#### `GetUserDevices`
List all registered devices.

**Response:**
- Device ID
- Platform (iOS/Android/Web)
- Device name
- Last active timestamp

**File:** `internal/service/auth_device_service.go:147-189`

### Profile Management (3 RPCs)

#### `GetProfile`
Get authenticated user's profile.

**File:** `internal/service/auth_service.go:234-270`

#### `UpdateProfile`
Update user profile details.

**File:** `internal/service/auth_service.go:272-308`

#### `DeleteAccount`
Permanently delete user account.

**File:** `internal/service/auth_service.go:310-346`

---

## UserService (15 RPCs)

User profile, preferences, and interaction management.

### Profile Management (4 RPCs)

#### `GetMyProfile`
Get authenticated user's complete profile.

**Response:**
- Basic info (name, email, DOB, gender)
- Profile details (bio, occupation, education)
- Lifestyle info (drinking, smoking, workout)
- Interests and languages
- Photos (ordered)
- Location

**File:** `internal/service/user_profile_service.go:13-48`

#### `GetUserProfile`
Get another user's public profile.

**Request:**
```protobuf
message GetUserProfileRequest {
  string user_id = 1;
}
```

**Privacy:**
- Respects privacy settings
- Excludes blocked users
- Shows appropriate fields based on match status

**File:** `internal/service/user_profile_service.go:50-87`

#### `UpdateProfile`
Update user profile with selective field updates.

**Request:**
```protobuf
message UpdateProfileRequest {
  ProfileDetails profile_details = 1;
  repeated string update_fields = 2;  // Field mask
}
```

**Supported Fields:**
- Basic: name, bio, date_of_birth, gender
- Profile: occupation, education, company, job_title, school
- Lifestyle: height, hometown, drinking, smoking, workout, dietary_preference
- Personal: religion, religion_importance, political_view, personality_type
- Preferences: pets, children, communication_style, love_language, sleep_schedule
- Social: interests, languages, prompts

**Implementation:**
- Large switch statement for each field
- JSON marshaling for array fields
- Atomic updates per field

**File:** `internal/service/user_profile_service.go:89-287`

#### `DeleteAccount`
Soft delete user account.

**Request:**
```protobuf
message DeleteAccountRequest {
  string password = 1;  // Required for confirmation
}
```

**Implementation:**
- Verifies password
- Sets account_status = 'DELETED'
- Keeps data for 30 days before permanent deletion
- Revokes all sessions

**File:** `internal/service/user_service.go:13-65`

### Photo Management (2 RPCs)

#### `UploadProfilePhoto`
Upload a profile photo.

**Request:**
```protobuf
message UploadProfilePhotoRequest {
  bytes photo_data = 1;
  string content_type = 2;  // image/jpeg, image/png
  bool is_primary = 3;
  int32 order = 4;
  string caption = 5;
}
```

**Validation:**
- Content type must be image/jpeg, image/png, or image/webp
- Photo data required
- Max 6 photos per user

**File:** `internal/service/user_photo_service.go:13-70`

#### `DeleteProfilePhoto`
Delete a profile photo.

**Request:**
```protobuf
message DeleteProfilePhotoRequest {
  string photo_id = 1;
}
```

**File:** `internal/service/user_photo_service.go:72-106`

### Preferences (4 RPCs)

#### `GetPartnerPreferences`
Get user's dating preferences.

**Response:**
- Age range (min/max)
- Distance range
- Gender preferences
- Height preferences
- Religion, smoking, drinking filters
- Education and children preferences

**File:** `internal/service/user_preferences_service.go:13-48`

#### `UpdatePartnerPreferences`
Update dating preferences.

**Request:**
```protobuf
message UpdatePartnerPreferencesRequest {
  PartnerPreferences preferences = 1;
}
```

**File:** `internal/service/user_preferences_service.go:50-108`

#### `GetUserPreferences`
Get app preferences (notifications, privacy).

**Response:**
- Notification preferences (push, email, SMS)
- Privacy settings
- Discovery settings

**File:** `internal/service/user_preferences_service.go:110-145`

#### `UpdateUserPreferences`
Update app preferences.

**File:** `internal/service/user_preferences_service.go:147-205`

### Discovery (1 RPC)

#### `SearchUsers`
Search for potential matches.

**Request:**
```protobuf
message SearchUsersRequest {
  SearchFilters filters = 1;
  PaginationRequest pagination = 2;
}
```

**Filters:**
- Age range
- Distance
- Gender
- Online status

**Response:**
- Paginated list of users
- Total count
- Next page token

**File:** `internal/service/user_discovery_service.go:11-83`

### Interactions (4 RPCs)

#### `BlockUser`
Block a user.

**Request:**
```protobuf
message BlockUserRequest {
  string user_id = 1;
  string reason = 2;
}
```

**Effects:**
- User hidden from discovery
- Existing matches removed
- Messages hidden
- Cannot interact

**File:** `internal/service/user_blocking_service.go:13-52`

#### `UnblockUser`
Unblock a user.

**File:** `internal/service/user_blocking_service.go:54-90`

#### `ListBlockedUsers`
Get list of blocked users.

**Response:**
- Paginated list
- Block timestamp
- Block reason

**File:** `internal/service/user_blocking_service.go:92-160`

#### `ReportUser`
Report inappropriate behavior.

**Request:**
```protobuf
message ReportUserRequest {
  string user_id = 1;
  ReportReason reason = 2;
  string details = 3;
}

enum ReportReason {
  SPAM = 0;
  HARASSMENT = 1;
  INAPPROPRIATE_CONTENT = 2;
  FAKE_PROFILE = 3;
  UNDERAGE = 4;
  OTHER = 5;
}
```

**File:** `internal/service/user_blocking_service.go:162-200`

---

## Database Schema

### Core Tables

#### `users`
Primary user accounts and authentication.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- Verification
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires_at TIMESTAMP,

  -- Password Reset
  password_reset_token VARCHAR(255),
  password_reset_token_expires_at TIMESTAMP,

  -- Profile
  date_of_birth DATE,
  gender VARCHAR(20),
  photo_url VARCHAR(500),

  -- Status
  account_status VARCHAR(20) DEFAULT 'ACTIVE',
  last_login_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `user_profiles`
Extended user profile information.

```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Info
  bio TEXT,
  occupation VARCHAR(255),
  education VARCHAR(255),
  company VARCHAR(255),
  job_title VARCHAR(255),
  school VARCHAR(255),

  -- Physical
  height INTEGER,  -- cm
  hometown VARCHAR(255),

  -- Lifestyle
  drinking VARCHAR(50),
  smoking VARCHAR(50),
  workout VARCHAR(50),
  dietary_preference VARCHAR(50),

  -- Beliefs & Values
  religion VARCHAR(50),
  religion_importance VARCHAR(50),
  political_view VARCHAR(50),
  personality_type VARCHAR(10),  -- MBTI

  -- Preferences
  pets VARCHAR(50),
  children VARCHAR(50),
  communication_style VARCHAR(50),
  love_language VARCHAR(50),
  sleep_schedule VARCHAR(50),

  -- Social (JSON arrays)
  interests JSONB,
  languages JSONB,
  prompts JSONB,

  -- Location
  location_lat DECIMAL(10, 8),
  location_lon DECIMAL(11, 8),
  location_city VARCHAR(255),
  location_country VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id)
);
```

#### `user_photos`
Profile photos with ordering.

```sql
CREATE TABLE user_photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  photo_order INTEGER DEFAULT 0,
  caption TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### `partner_preferences`
Dating preferences and filters.

```sql
CREATE TABLE partner_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  -- Demographics
  age_min INTEGER DEFAULT 18,
  age_max INTEGER DEFAULT 100,
  gender_preferences JSONB,

  -- Physical
  distance_max INTEGER DEFAULT 50,  -- km
  height_min INTEGER,
  height_max INTEGER,

  -- Lifestyle
  drinking_preferences JSONB,
  smoking_preferences JSONB,
  workout_preferences JSONB,
  dietary_preferences JSONB,

  -- Values
  religion_preferences JSONB,
  religion_importance VARCHAR(50),
  political_preferences JSONB,

  -- Family
  children_preferences JSONB,
  pets_preferences JSONB,

  -- Other
  education_preferences JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id)
);
```

#### `user_preferences`
App settings and notifications.

```sql
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  -- Notifications
  push_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,

  -- Notification Types
  notify_messages BOOLEAN DEFAULT TRUE,
  notify_matches BOOLEAN DEFAULT TRUE,
  notify_likes BOOLEAN DEFAULT TRUE,
  notify_super_likes BOOLEAN DEFAULT TRUE,

  -- Privacy
  show_online_status BOOLEAN DEFAULT TRUE,
  show_distance BOOLEAN DEFAULT TRUE,
  show_age BOOLEAN DEFAULT TRUE,

  -- Discovery
  discoverable BOOLEAN DEFAULT TRUE,
  show_me_in_search BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id)
);
```

### Authentication Tables

#### `refresh_tokens`
JWT refresh tokens for session management.

```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE,
  device_id VARCHAR(255),
  ip_address VARCHAR(45)
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

#### `email_verification_codes`
Temporary email verification codes.

```sql
CREATE TABLE email_verification_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_verification_email ON email_verification_codes(email);
```

#### `phone_verification_codes`
Temporary SMS verification codes.

```sql
CREATE TABLE phone_verification_codes (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `user_devices`
Registered devices for push notifications.

```sql
CREATE TABLE user_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  platform VARCHAR(20),  -- ios, android, web
  device_name VARCHAR(255),
  os_version VARCHAR(50),
  push_token VARCHAR(500),
  last_active_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, device_id)
);
```

### Interaction Tables

#### `user_blocks`
Blocked users.

```sql
CREATE TABLE user_blocks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, blocked_user_id)
);

CREATE INDEX idx_user_blocks_user ON user_blocks(user_id);
```

#### `user_reports`
User reports and moderation.

```sql
CREATE TABLE user_reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, REVIEWED, ACTIONED
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_user_reports_reported ON user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON user_reports(status);
```

---

## Code Organization

### Service Layer Pattern

Each service follows a consistent pattern:

```go
type UserService struct {
    userpb.UnimplementedUserServiceServer
    db    *sql.DB
    redis *redis.Client
}

func NewUserService(db *sql.DB, redis *redis.Client) *UserService {
    return &UserService{
        db:    db,
        redis: redis,
    }
}
```

### RPC Implementation Pattern

Standard RPC method structure:

```go
func (s *UserService) GetMyProfile(
    ctx context.Context,
    req *userpb.GetMyProfileRequest,
) (*userpb.GetMyProfileResponse, error) {
    // 1. Authentication
    userID, ok := ctx.Value("userID").(int)
    if !ok {
        return nil, fmt.Errorf("authentication required")
    }

    // 2. Input Validation
    if req == nil {
        return nil, fmt.Errorf("request cannot be nil")
    }

    // 3. Business Logic
    user, err := s.getUserByID(userID)
    if err != nil {
        return nil, fmt.Errorf("user not found: %v", err)
    }

    // 4. Data Transformation
    profile := buildUserProfileResponse(user, userProfile)

    // 5. Response
    return &userpb.GetMyProfileResponse{
        Profile: profile,
    }, nil
}
```

### Error Handling

Consistent error patterns:

```go
// Not found
return nil, fmt.Errorf("resource not found")

// Validation error
return nil, fmt.Errorf("invalid input: %v", err)

// Database error
return nil, fmt.Errorf("failed to query database: %v", err)

// Authorization error
return nil, fmt.Errorf("permission denied")
```

### Testing Pattern

Each service has comprehensive test coverage:

```go
func TestGetMyProfile_Success(t *testing.T) {
    // Setup
    service, mock, db := setupTestUserService(t)
    defer db.Close()

    // Mock expectations
    mock.ExpectQuery("SELECT (.+) FROM users").
        WithArgs(1).
        WillReturnRows(userRows)

    // Execute
    resp, err := service.GetMyProfile(ctx, req)

    // Assert
    require.NoError(t, err)
    require.NotNil(t, resp)
    assert.Equal(t, "test@example.com", resp.Profile.Email)
}
```

---

## Authentication & Security

### JWT Token Flow

```
┌─────────┐                          ┌─────────┐
│ Client  │                          │ Server  │
└────┬────┘                          └────┬────┘
     │                                    │
     │  POST /auth/login                  │
     │  { email, password }               │
     ├───────────────────────────────────>│
     │                                    │
     │                                    │ 1. Verify credentials
     │                                    │ 2. Generate access token (15min)
     │                                    │ 3. Generate refresh token (30d)
     │                                    │ 4. Store refresh in DB
     │                                    │
     │  { access_token, refresh_token }   │
     │<───────────────────────────────────┤
     │                                    │
     │  gRPC call with access_token       │
     ├───────────────────────────────────>│
     │                                    │
     │                                    │ 5. Validate JWT signature
     │                                    │ 6. Check expiration
     │                                    │ 7. Extract user_id
     │                                    │
     │  Response                          │
     │<───────────────────────────────────┤
     │                                    │
     │  ... (access token expires) ...    │
     │                                    │
     │  POST /auth/token/refresh          │
     │  { refresh_token }                 │
     ├───────────────────────────────────>│
     │                                    │
     │                                    │ 8. Validate refresh token
     │                                    │ 9. Check not revoked
     │                                    │ 10. Generate new access token
     │                                    │ 11. Rotate refresh token
     │                                    │ 12. Invalidate old refresh
     │                                    │
     │  { access_token, refresh_token }   │
     │<───────────────────────────────────┤
     │                                    │
```

### Password Security

- **Algorithm**: bcrypt with cost factor 10
- **Minimum Length**: 8 characters
- **Validation**: No specific requirements (flexible for UX)
- **Reset Flow**: Secure token with 1-hour expiration

```go
// Hash password
hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

// Verify password
err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
```

### Token Generation

```go
func generateVerificationCode() string {
    return fmt.Sprintf("%06d", rand.Intn(1000000))
}

func generateSecureToken() string {
    b := make([]byte, 32)
    rand.Read(b)
    return base64.URLEncoding.EncodeToString(b)
}
```

---

## Testing

### Test Coverage

**Current Status**: 43.6% overall coverage with 108 passing tests

**Service Coverage:**
- `SearchUsers`: 100%
- `UploadProfilePhoto`: 100%
- `GetPartnerPreferences`: 100%
- `GetUserPreferences`: 100%
- `BlockUser`: 92.9%
- `GetMyProfile`: 83.3%
- `UpdateProfile`: 57.5%

### Test Organization

Tests are organized by functionality:

- `user_service_test.go` - Core user tests
- `user_profile_service_test.go` - Profile CRUD tests
- `user_photo_service_test.go` - Photo management tests
- `user_preferences_service_test.go` - Preferences tests
- `user_blocking_service_test.go` - Blocking/reporting tests
- `user_discovery_service_test.go` - Search tests
- `user_service_error_paths_test.go` - Error scenarios

### Running Tests

```bash
# All tests
go test ./internal/service/...

# With coverage
go test -coverprofile=coverage.out ./internal/service/...
go tool cover -html=coverage.out

# Integration tests (requires DB)
DATABASE_URL="postgres://..." go test -tags=integration ./tests/...
```

---

## Performance Considerations

### Connection Pooling

```go
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(5)
db.SetConnMaxLifetime(5 * time.Minute)
```

### Redis Caching

Sessions and frequently accessed data cached in Redis:
- Session data: 30-day TTL
- User profiles: 15-minute TTL
- Search results: 5-minute TTL

### Database Indexes

Critical indexes for performance:
- `users.email` (UNIQUE)
- `users.phone_number` (UNIQUE)
- `refresh_tokens.token` (UNIQUE)
- `refresh_tokens.user_id`
- `user_blocks.user_id`
- `user_reports.reported_user_id`

---

## Future Enhancements

### Planned Features

1. **Repository Layer**: Separate database logic from service layer
2. **Caching Layer**: Redis integration for frequent queries
3. **Real-time Messaging**: WebSocket support for chat
4. **Matching Algorithm**: ML-based compatibility scoring
5. **Photo Storage**: S3/CloudStorage integration
6. **Rate Limiting**: Per-user API rate limits
7. **Observability**: Prometheus metrics + Grafana dashboards
8. **API Gateway**: Centralized authentication and routing

### Technical Debt

- Add comprehensive integration tests
- Implement request ID tracing
- Add structured logging (zerolog)
- Implement graceful degradation
- Add circuit breakers for external services

---

## References

- [Development Guide](./DEVELOPMENT.md) - How to add new RPCs
- [Testing Guide](./TESTING.md) - Testing patterns and best practices
- [gRPC Testing](./GRPC_TESTING.md) - Tools for testing gRPC endpoints

---

**Last Updated**: November 2024
**Version**: 1.0.0
