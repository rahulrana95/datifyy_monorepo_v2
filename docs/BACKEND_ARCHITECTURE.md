# Datifyy Backend Architecture - Complete Guide

**Last Updated**: November 23, 2025
**Version**: 2.0 - Comprehensive Edition

A complete guide to the Datifyy backend architecture, including debugging, development workflows, and step-by-step instructions for adding new features.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Project Structure](#project-structure)
5. [Services & Repositories](#services--repositories)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Adding New Features](#adding-new-features)
9. [Debugging Guide](#debugging-guide)
10. [Testing Guide](#testing-guide)
11. [Best Practices](#best-practices)

---

## Overview

Datifyy is a production-ready dating/matchmaking platform with AI-powered compatibility analysis. The backend is built with Go and follows a clean, layered architecture.

### Key Features

- **Dual API**: gRPC (primary) + REST HTTP (browser-friendly wrapper)
- **AI-Powered Matching**: Gemini AI for compatibility analysis (pluggable architecture)
- **Rate Limiting**: Tiered rate limiting (100-400 req/min) with Redis-backed distributed limits
- **Slack Integration**: Real-time notifications for user events, admin activities, and system alerts
- **Multi-Method Auth**: Email/password, phone OTP, OAuth ready
- **Comprehensive Profiles**: 100+ profile fields with cultural/matrimonial support
- **Admin Dashboard**: User management, analytics, AI date curation
- **Real-Time**: Redis for sessions and caching
- **Production Ready**: Connection pooling, graceful shutdown, health checks

### Recent Major Features

**Rate Limiting** (Added: Nov 23, 2025):
- Comprehensive tiered rate limiting across all endpoints
- Admin endpoints: 400 req/min (4x normal users)
- User endpoints: 100 req/min (default)
- Auth endpoints: 5-10 req per 15 minutes (security)
- Redis-backed distributed limiting with local fallback
- IP-based and user-based limiting
- Rate limit headers in all responses
- See [RATE_LIMITING.md](./RATE_LIMITING.md) for complete guide

**Slack Integration** (Added: Nov 23, 2025):
- Complete Slack webhook integration for notifications
- 4 HTTP endpoints for different message types
- Pre-built templates for user events, admin activities, system alerts
- AI match event notifications
- Graceful degradation when webhook not configured
- See [SLACK_INTEGRATION.md](./SLACK_INTEGRATION.md) for complete guide

**AI Date Curation** (Added: Nov 23, 2025):
- AI-powered compatibility analysis using Gemini API
- Admin interface for curated matchmaking
- Compatibility scores, reasoning, matched/mismatched aspects
- Date suggestion and rejection tracking

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Language** | Go | 1.21+ | Backend services |
| **API Protocol** | gRPC + REST | - | Type-safe RPC + HTTP |
| **Database** | PostgreSQL | 15+ | Primary datastore |
| **Cache** | Redis | 7+ | Sessions & caching |
| **AI** | Google Gemini | 2.5-flash | Compatibility matching |
| **Schema** | Protocol Buffers | 3 | API contracts |
| **Authentication** | JWT + bcrypt | - | Secure auth |
| **Email** | MailerSend | API | Transactional emails |
| **Hot Reload** | Air | 1.45.0 | Dev auto-reload |
| **Testing** | testify | - | Unit & integration tests |
| **Migrations** | SQL | - | Database versioning |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                  Client Applications                  │
│          (Web, iOS, Android, Admin Panel)            │
└─────────────────┬────────────────────────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────────────────┐
│              API Gateway Layer                        │
│  ┌─────────────────┐      ┌──────────────────────┐  │
│  │  gRPC Server    │      │  HTTP/REST Server    │  │
│  │    Port 9090    │      │     Port 8080        │  │
│  │  (Primary API)  │      │  (Browser wrapper)   │  │
│  └────────┬────────┘      └──────────┬───────────┘  │
└───────────┼──────────────────────────┼───────────────┘
            │                          │
            └──────────┬───────────────┘
                       ↓
┌──────────────────────────────────────────────────────┐
│               Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ AuthService  │  │ UserService  │  │AdminService│ │
│  │  (25 RPCs)   │  │  (18 RPCs)   │  │ (20 RPCs)  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │AvailService  │  │    DatesService (NEW)        │ │
│  │  (3 RPCs)    │  │    AI Compatibility          │ │
│  └──────────────┘  └──────────────────────────────┘ │
└─────────────┬────────────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────────────┐
│             Repository Layer                          │
│  • UserRepository         • AdminRepository          │
│  • UserProfileRepository  • CuratedMatchesRepository │
│  • AvailabilityRepository • DateSuggestionsRepo      │
└─────────────┬────────────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────────────┐
│              Utility Layer                            │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐ │
│  │  AI Module  │  │   Auth   │  │  Email Service │ │
│  │  (Gemini)   │  │(JWT+Hash)│  │  (MailerSend)  │ │
│  └─────────────┘  └──────────┘  └────────────────┘ │
└─────────────┬────────────────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────────────────┐
│               Data Layer                              │
│  ┌──────────────────┐      ┌───────────────────────┐│
│  │   PostgreSQL     │      │      Redis            ││
│  │   Port 5432      │      │     Port 6379         ││
│  │  (Persistent)    │      │  (Cache/Sessions)     ││
│  └──────────────────┘      └───────────────────────┘│
└──────────────────────────────────────────────────────┘
```

---

## Project Structure

```
apps/backend/
├── cmd/
│   └── server/
│       └── main.go                    # Entry point (2,923 lines)
│                                      # - HTTP server setup (port 8080)
│                                      # - gRPC server setup (port 9090)
│                                      # - All HTTP endpoints registered
│                                      # - Service initialization
│                                      # - Database & Redis connection
│
├── internal/
│   ├── service/                       # Business logic layer
│   │   ├── auth_service.go            # Main auth (696 lines)
│   │   ├── auth_device_service.go     # Device trust (229 lines)
│   │   ├── auth_password_service.go   # Password mgmt (268 lines)
│   │   ├── auth_phone_service.go      # Phone OTP (312 lines)
│   │   ├── auth_session_service.go    # Sessions (347 lines)
│   │   ├── auth_verification_service.go # Email verify (215 lines)
│   │   ├── user_service.go            # User wrapper (28 lines)
│   │   ├── user_profile_service.go    # Profile CRUD (358 lines)
│   │   ├── user_preferences_service.go # Preferences (437 lines)
│   │   ├── user_photo_service.go      # Photos (116 lines)
│   │   ├── user_blocking_service.go   # Blocking (210 lines)
│   │   ├── user_discovery_service.go  # Search (92 lines)
│   │   ├── utils_user_profile.go      # Utils (975 lines)
│   │   ├── admin_service.go           # Admin (1,120 lines)
│   │   ├── dates_service.go           # AI matching (552 lines) ✨ NEW
│   │   └── availability_service.go    # Availability (240 lines)
│   │
│   ├── repository/                    # Data access layer
│   │   ├── user_repository.go         # User CRUD
│   │   ├── user_profile_repository.go # Profile & preferences
│   │   ├── admin_repository.go        # Admin ops & analytics
│   │   ├── availability_repository.go # Availability slots
│   │   ├── curated_matches_repository.go  # AI results ✨ NEW
│   │   └── date_suggestions_repository.go # Suggestions ✨ NEW
│   │
│   ├── ai/                            # AI provider abstraction ✨ NEW
│   │   ├── interface.go               # AIProvider interface
│   │   ├── gemini.go                  # Gemini implementation
│   │   ├── types.go                   # Request/response types
│   │   ├── factory.go                 # Provider factory
│   │   └── README.md                  # AI module docs
│   │
│   ├── auth/                          # Authentication utilities
│   │   ├── jwt.go                     # JWT token generation/validation
│   │   └── password.go                # bcrypt hashing
│   │
│   └── email/                         # Email service
│       └── mailersend.go              # MailerSend integration
│
├── gen/                               # Generated proto code (not committed)
│   ├── auth/v1/                       # Auth service stubs
│   ├── user/v1/                       # User service stubs
│   ├── admin/v1/                      # Admin service stubs
│   ├── availability/v1/               # Availability service stubs
│   └── common/v1/                     # Shared types
│
├── migrations/                        # Database migrations
│   ├── 001_initial_schema.sql         # Users, sessions
│   ├── 002_add_auth_fields.sql        # Auth, profiles, preferences
│   ├── 003_seed_data.sql              # Test data
│   ├── 004_add_user_features.sql      # Blocking, reporting, settings
│   ├── 005_expand_partner_preferences.sql # 45+ new preference fields
│   ├── 006_add_availability_slots.sql # Availability management
│   ├── 007_add_admin_and_dates.sql    # Admin users, scheduled dates
│   └── 008_add_curated_matches.sql    # AI matching tables ✨ NEW
│
├── tests/                             # Integration tests
│   └── integration/
│       └── integration_test.go
│
├── go.mod                             # Go dependencies
├── go.sum                             # Dependency checksums
└── .air.toml                          # Hot reload configuration
```

---

## Services & Repositories

### Service Layer (`internal/service/`)

Services contain business logic and implement gRPC service interfaces. Each service can be split into multiple files for better organization.

#### 1. AuthService (2,867 total lines across 6 files)

**Main File**: `auth_service.go` (696 lines)
- Service struct initialization
- Email/phone registration
- Email/phone login
- OAuth login (prepared)
- Token refresh and revoke

**Device Management**: `auth_device_service.go` (229 lines)
- List user devices
- Trust device
- Revoke device access
- Device fingerprinting

**Password Management**: `auth_password_service.go` (268 lines)
- Change password (authenticated)
- Request password reset
- Confirm password reset

**Phone Authentication**: `auth_phone_service.go` (312 lines)
- Request phone OTP
- Verify phone with OTP
- Resend phone verification

**Session Management**: `auth_session_service.go` (347 lines)
- Get current session
- List all sessions
- Revoke specific session
- Revoke all sessions
- Logout current/all devices

**Verification**: `auth_verification_service.go` (215 lines)
- Send email verification
- Verify email with code
- Resend verification email

#### 2. UserService (1,672 total lines across 6 files)

**Main Wrapper**: `user_service.go` (28 lines)
- Service initialization
- Dependency injection

**Profile Management**: `user_profile_service.go` (358 lines)
- Get user profile (by ID or self)
- Update profile
- Delete account
- Profile validation

**Preferences**: `user_preferences_service.go` (437 lines)
- Get/update partner preferences
- Get/update app preferences (notifications, privacy, discovery)

**Photos**: `user_photo_service.go` (116 lines)
- Upload profile photo
- Delete profile photo
- Photo validation

**Blocking**: `user_blocking_service.go` (210 lines)
- Block user
- Unblock user
- List blocked users
- Check if users are blocking each other

**Discovery**: `user_discovery_service.go` (92 lines)
- Search users with filters
- Get personalized recommendations
- Compatibility scoring

**Utilities**: `utils_user_profile.go` (975 lines)
- Proto to DB conversions
- DB to Proto conversions
- Field validators
- Helper functions

#### 3. AdminService (1,120 lines)

**File**: `admin_service.go`

**Capabilities**:
- Admin authentication
- User management (list, search, bulk actions)
- User details retrieval
- Date scheduling
- Date suggestions management
- Genie operations
- Admin user CRUD
- Analytics (platform stats, trends, demographics)
- AI curation operations ✨ NEW

#### 4. DatesService (552 lines) ✨ NEW FEATURE

**File**: `dates_service.go`

**Capabilities**:
- Get curation candidates (users available tomorrow)
- AI compatibility analysis using Gemini
- Store curated match results
- Check for existing matches (prevent duplicates)
- Build AI compatibility requests
- Parse AI responses

**AI Integration**:
- Pluggable AI provider interface
- Currently uses Gemini 2.5-flash
- Can be switched to OpenAI, Claude, etc.
- Structured compatibility analysis

#### 5. AvailabilityService (240 lines)

**File**: `availability_service.go`

**Capabilities**:
- Get user availability slots
- Submit availability (bulk)
- Delete availability slot
- Date type validation (online, offline, offline_event)

### Repository Layer (`internal/repository/`)

Repositories handle direct database operations. They abstract SQL queries from services.

#### 1. UserRepository

**Responsibilities**:
- CRUD operations for users table
- Get user by ID, email, phone
- Update user fields
- Delete user
- User existence checks

#### 2. UserProfileRepository

**Responsibilities**:
- Profile CRUD operations
- Partner preferences management
- App preferences management
- Complex queries with joins
- Profile completion calculation

#### 3. AdminRepository

**Responsibilities**:
- Admin authentication
- User management queries (list, search, bulk)
- Analytics queries (platform stats, trends)
- Demographics aggregation
- Location statistics
- Availability statistics

#### 4. AvailabilityRepository

**Responsibilities**:
- CRUD for availability_slots table
- Get slots by user ID
- Get slots by date range
- Bulk insert slots
- Validate slot constraints (1-hour duration)

#### 5. CuratedMatchesRepository ✨ NEW

**Responsibilities**:
- Store AI match results
- Get match by user pair
- Get matches for user
- Update match status
- Check for existing matches

#### 6. DateSuggestionsRepository ✨ NEW

**Responsibilities**:
- Create date suggestions
- Get suggestions for user
- Update suggestion status
- Track user acceptance/rejection

### Utility Modules

#### AI Module (`internal/ai/`) ✨ NEW

**Files**:
- `interface.go` - AIProvider interface (abstraction)
- `gemini.go` - Gemini API implementation
- `types.go` - Request/response types
- `factory.go` - Provider factory (switch between providers)

**Purpose**: Provides pluggable AI compatibility analysis. Easy to swap Gemini for OpenAI, Claude, or custom models.

#### Auth Module (`internal/auth/`)

**Files**:
- `jwt.go` - JWT token operations
- `password.go` - bcrypt password hashing

#### Email Module (`internal/email/`)

**Files**:
- `mailersend.go` - MailerSend API integration

#### Slack Module (`internal/slack/`)

**Files**:
- `slack_service.go` (400+ lines) - Complete Slack webhook integration
- `slack_service_test.go` (100+ lines) - Unit tests

**Key Functions**:
- `SendMessage()` - Simple text messages
- `SendAlert()`, `SendSuccess()`, `SendWarning()`, `SendInfo()` - Color-coded alerts
- `SendUserEvent()` - User registration, verification, deletion events
- `SendAdminActivity()` - Admin action tracking
- `SendSystemAlert()` - System errors with severity levels
- `SendAIMatchEvent()` - AI compatibility analysis notifications
- `SendCustomMessage()` - Full control over Slack message format

**HTTP Endpoints** (in `cmd/server/main.go`):
- `POST /api/v1/slack/send` - Send simple message
- `POST /api/v1/slack/alert` - Send formatted alert
- `POST /api/v1/slack/notification` - Send specialized notification
- `GET/POST /api/v1/slack/test` - Test integration

**Features**:
- Graceful degradation (disabled if no webhook URL)
- Context-aware error handling
- Pre-built templates for common events
- Rich formatting with attachments and fields
- 10-second HTTP timeout

**Documentation**: See [SLACK_INTEGRATION.md](./SLACK_INTEGRATION.md)

---

## Database Schema

### Core Tables (8 migrations)

#### Migration 001: Initial Schema
```sql
users (id, email, phone, name, created_at, updated_at, deleted_at)
sessions (id, user_id, refresh_token, expires_at, created_at)
```

#### Migration 002: Auth & Profiles
```sql
-- Extended users table with:
password_hash, email_verified, phone_verified, account_status,
date_of_birth, gender, pronouns, verification_codes, etc.

user_profiles (
  user_id, bio, occupation, company, job_title, education, height,
  location, hometown, interests, languages, relationship_goals,
  lifestyle fields (drinking, smoking, workout, diet),
  cultural fields (religion, political_views, caste, etc.)
)

partner_preferences (
  user_id, age_min/max, height_min/max, distance_max,
  gender_preference, location_preference,
  lifestyle preferences, education_preference, etc.
)

user_photos (id, user_id, photo_url, is_primary, order)
devices (id, user_id, device_id, device_name, trusted, last_login)
verification_codes (id, user_id, code, type, expires_at)
```

#### Migration 004: User Features
```sql
user_blocks (id, blocker_user_id, blocked_user_id, reason, created_at)
user_reports (id, reporter_id, reported_user_id, reason, evidence, status)
user_preferences (
  user_id,
  notifications (push, email, sms for various events),
  privacy (public_profile, show_online, show_distance, etc.),
  discovery (discoverable, global_mode, verified_only, etc.),
  app_preferences (language, theme)
)
```

#### Migration 005: Expanded Preferences (45+ new fields)
```sql
-- Added to partner_preferences:
Cultural: caste, sub_caste, gotra, manglik, nakshatra, raasi, ethnicity, NRI_preference
Appearance: body_type, complexion, hair_color, eye_color, facial_hair, tattoos
Professional: income_range, employment_type, property_ownership, vehicle_ownership
Family: family_type, family_values, parent_occupations, family_affluence
Personality: mbti_type, communication_style, love_language
Verification: wants_verified_only, wants_photo_verified
Deal-breakers: custom_dealbreakers (JSONB array)
Must-haves: must_have_interests, must_have_values (JSONB arrays)
```

#### Migration 006: Availability
```sql
availability_slots (
  id, user_id, start_time, end_time, date_type,
  offline_location_name, offline_location_address,
  offline_location_lat, offline_location_long,
  created_at, updated_at
)

-- Constraints:
- end_time - start_time = 3600 (exactly 1 hour)
- date_type IN ('online', 'offline', 'offline_event')
```

#### Migration 007: Admin & Dates
```sql
admin_users (
  id, email, password_hash, name, role, phone,
  is_active, created_at, updated_at, deleted_at
)
-- Roles: super_admin, genie, support, moderator
-- Default admin: admin@datifyy.com (password: Admin@123)

scheduled_dates (
  id, user1_id, user2_id, scheduled_time, duration,
  date_type, status, genie_id, location_details,
  created_by_admin, created_at, updated_at
)
-- Status: scheduled, confirmed, in_progress, completed, cancelled, no_show

admin_sessions (id, admin_user_id, refresh_token, expires_at, created_at)
date_activity_log (id, date_id, action, performed_by, details, created_at)
```

#### Migration 008: AI Curation ✨ NEW
```sql
curated_matches (
  id, user1_id, user2_id, compatibility_score, is_match,
  reasoning, matched_aspects (JSONB), mismatched_aspects (JSONB),
  ai_provider, ai_model, status, created_by_admin,
  created_at, updated_at
)
-- is_match = true when compatibility_score >= 60
-- Status: pending, approved, rejected, scheduled

date_suggestions (
  id, curated_match_id, suggested_to_user_id,
  status, user_response, admin_note,
  created_at, updated_at
)
-- Status: sent, seen, accepted, rejected, expired

date_rejections (
  id, suggestion_id, rejected_by_user_id,
  rejection_type, custom_reason, created_at
)
-- Types: not_interested, too_far, incompatible_interests, age_mismatch,
--        lifestyle_difference, timing_conflict, other
```

### Table Relationships

```
users (1) ─→ (1) user_profiles
users (1) ─→ (1) partner_preferences
users (1) ─→ (*) user_photos
users (1) ─→ (*) availability_slots
users (1) ─→ (*) sessions
users (1) ─→ (*) devices
users (1) ─→ (*) user_blocks (as blocker)
users (1) ─→ (*) user_blocks (as blocked)
users (1) ─→ (*) user_reports (as reporter)
users (1) ─→ (*) user_reports (as reported)

admin_users (1) ─→ (*) admin_sessions
admin_users (1) ─→ (*) scheduled_dates (as genie)
admin_users (1) ─→ (*) curated_matches (as creator)

scheduled_dates (1) ─→ (2) users (user1, user2)
scheduled_dates (1) ─→ (*) date_activity_log

curated_matches (1) ─→ (2) users (user1, user2) ✨
curated_matches (1) ─→ (*) date_suggestions ✨
date_suggestions (1) ─→ (*) date_rejections ✨
```

---

## API Reference

### Complete API Surface

**Total Endpoints**: 104
- **HTTP REST**: 38 endpoints
- **gRPC RPCs**: 66 methods across 4 services

### HTTP REST Endpoints (38)

All HTTP endpoints are defined in `apps/backend/cmd/server/main.go`.

#### Health & Info (5 endpoints)

```go
GET  /health                // Basic health check
GET  /ready                 // Readiness check (DB + Redis)
GET  /                      // API root info
GET  /api/test-db           // Test database connection
GET  /api/test-redis        // Test Redis connection
```

**Files Modified**:
- `apps/backend/cmd/server/main.go` (health check handlers)

#### Authentication (4 endpoints)

```go
POST /api/v1/auth/register/email    // Register with email/password
POST /api/v1/auth/login/email       // Login with email/password
POST /api/v1/auth/token/refresh     // Refresh access token
POST /api/v1/auth/token/revoke      // Logout (revoke token)
```

**Handlers in**: `main.go` (lines ~700-900)
**Service**: `AuthService`

#### User (2 endpoints)

```go
GET  /api/v1/user/me        // Get current user profile
PUT  /api/v1/user/me        // Update current user profile
```

**Service**: `UserService`

#### Partner Preferences (2 endpoints)

```go
GET  /api/v1/partner-preferences    // Get partner preferences
PUT  /api/v1/partner-preferences    // Update partner preferences
```

**Service**: `UserService`

#### Availability (3 endpoints)

```go
GET    /api/v1/availability         // Get user's availability slots
POST   /api/v1/availability         // Submit availability slots (bulk)
DELETE /api/v1/availability         // Delete availability slot
```

**Service**: `AvailabilityService`

#### Admin - Authentication (1 endpoint)

```go
POST /api/v1/admin/login            // Admin login
```

**Service**: `AdminService`

#### Admin - User Management (5 endpoints)

```go
GET  /api/v1/admin/users                // List all users (paginated, sorted)
GET  /api/v1/admin/users/search         // Search users
POST /api/v1/admin/users/bulk           // Bulk actions (activate, suspend, delete, verify)
GET  /api/v1/admin/users/:userId        // Get user details
```

**Service**: `AdminService`

#### Admin - Date Management (4 endpoints)

```go
GET  /api/v1/admin/suggestions/:userId  // Get date suggestions for user
GET  /api/v1/admin/dates                // List scheduled dates
POST /api/v1/admin/dates                // Schedule a date
PUT  /api/v1/admin/dates/:dateId        // Update date status
```

**Service**: `AdminService`

#### Admin - AI Curation (2 endpoints) ✨ NEW

```go
GET  /api/v1/admin/curation/candidates  // Get users available tomorrow
POST /api/v1/admin/curation/analyze     // AI compatibility analysis
```

**Handlers in**: `main.go` (lines 1747-1846)
**Service**: `AdminService` → `DatesService`

#### Admin - Analytics (7 endpoints)

```go
GET  /api/v1/admin/analytics/platform       // Platform statistics
GET  /api/v1/admin/analytics/user-growth    // User growth trends
GET  /api/v1/admin/analytics/active-users   // Active users
GET  /api/v1/admin/analytics/signups        // Signup trends
GET  /api/v1/admin/analytics/demographics   // Demographics
GET  /api/v1/admin/analytics/locations      // Location stats
GET  /api/v1/admin/analytics/availability   // Availability stats
```

**Service**: `AdminService`

#### Admin - Admin Management (5 endpoints)

```go
GET    /api/v1/admin/admins             // List all admins
POST   /api/v1/admin/admins             // Create admin
GET    /api/v1/admin/admins/:adminId    // Get admin details
PUT    /api/v1/admin/admins/:adminId    // Update admin
DELETE /api/v1/admin/admins/:adminId    // Delete admin
PUT    /api/v1/admin/profile            // Update admin profile
```

**Service**: `AdminService`

#### Slack Integration (4 endpoints) ✨ NEW

```go
POST     /api/v1/slack/send           // Send simple text message
POST     /api/v1/slack/alert          // Send formatted alert (success/warning/danger/info)
POST     /api/v1/slack/notification   // Send specialized notification
GET/POST /api/v1/slack/test           // Test Slack integration
```

**Handler Functions** (in `main.go`, lines ~3020-3263):
- `createSlackSendMessageHandler()` - Simple text messages
- `createSlackAlertHandler()` - Color-coded alerts with details
- `createSlackNotificationHandler()` - Specialized notifications:
  - `user_event`: Registration, verification, deletion, suspension
  - `admin_activity`: Admin actions tracking
  - `system_alert`: System errors with severity levels
  - `ai_match`: AI compatibility analysis results
- `createSlackTestHandler()` - Test webhook and send test message

**Service**: `SlackService` (`internal/slack/slack_service.go`)

**Configuration**:
- Environment variable: `SLACK_WEBHOOK_URL`
- Gracefully disabled if webhook URL not set

**Features**:
- Pre-built templates for common events
- Rich formatting with colors, attachments, and fields
- Context-aware error handling
- 10-second HTTP timeout

**Example Usage**:
```go
// Send user registration notification
slackService.SendUserEvent(ctx, "registration", email, name, map[string]string{
    "Source": "Mobile App",
})

// Send system alert
slackService.SendSystemAlert(ctx, "Database", "Connection failed", "critical")
```

**Complete Documentation**: [SLACK_INTEGRATION.md](./SLACK_INTEGRATION.md)

### gRPC Services (66 RPCs)

#### 1. AuthService (25 RPCs)

**Proto**: `proto/auth/v1/auth.proto`
**Implementation**: `apps/backend/internal/service/auth_*.go`

```protobuf
service AuthService {
  // Registration
  rpc RegisterWithEmail(RegisterWithEmailRequest) returns (AuthResponse);
  rpc RegisterWithPhone(RegisterWithPhoneRequest) returns (AuthResponse);

  // Login
  rpc LoginWithEmail(LoginWithEmailRequest) returns (AuthResponse);
  rpc RequestPhoneOTP(RequestPhoneOTPRequest) returns (OTPResponse);
  rpc LoginWithPhone(LoginWithPhoneRequest) returns (AuthResponse);
  rpc LoginWithOAuth(LoginWithOAuthRequest) returns (AuthResponse);

  // Token Management
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);
  rpc RevokeToken(RevokeTokenRequest) returns (RevokeTokenResponse);
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);

  // Email Verification
  rpc SendEmailVerification(SendEmailVerificationRequest) returns (EmailVerificationResponse);
  rpc VerifyEmail(VerifyEmailRequest) returns (VerifyEmailResponse);
  rpc ResendVerificationCode(ResendVerificationCodeRequest) returns (EmailVerificationResponse);

  // Phone Verification
  rpc SendPhoneVerification(SendPhoneVerificationRequest) returns (PhoneVerificationResponse);
  rpc VerifyPhone(VerifyPhoneRequest) returns (PhoneVerificationResponse);

  // Password Management
  rpc RequestPasswordReset(RequestPasswordResetRequest) returns (PasswordResetResponse);
  rpc ConfirmPasswordReset(ConfirmPasswordResetRequest) returns (ConfirmPasswordResetResponse);
  rpc ChangePassword(ChangePasswordRequest) returns (ChangePasswordResponse);

  // Session Management
  rpc GetCurrentSession(GetCurrentSessionRequest) returns (SessionInfo);
  rpc ListSessions(ListSessionsRequest) returns (ListSessionsResponse);
  rpc RevokeSession(RevokeSessionRequest) returns (RevokeSessionResponse);
  rpc RevokeAllSessions(RevokeAllSessionsRequest) returns (RevokeAllSessionsResponse);

  // Device Management
  rpc ListDevices(ListDevicesRequest) returns (ListDevicesResponse);
  rpc TrustDevice(TrustDeviceRequest) returns (TrustDeviceResponse);
  rpc RevokeDevice(RevokeDeviceRequest) returns (RevokeDeviceResponse);

  // Logout
  rpc Logout(LogoutRequest) returns (LogoutResponse);
  rpc LogoutAll(LogoutAllRequest) returns (LogoutAllResponse);
}
```

#### 2. UserService (18 RPCs)

**Proto**: `proto/user/v1/user.proto`
**Implementation**: `apps/backend/internal/service/user_*.go`

```protobuf
service UserService {
  // Profile Management
  rpc GetUserProfile(GetUserProfileRequest) returns (UserProfileResponse);
  rpc GetMyProfile(GetMyProfileRequest) returns (UserProfileResponse);
  rpc UpdateProfile(UpdateProfileRequest) returns (UpdateProfileResponse);
  rpc DeleteAccount(DeleteAccountRequest) returns (DeleteAccountResponse);
  rpc UploadProfilePhoto(UploadProfilePhotoRequest) returns (PhotoResponse);
  rpc DeleteProfilePhoto(DeleteProfilePhotoRequest) returns (PhotoResponse);

  // User Discovery
  rpc SearchUsers(SearchUsersRequest) returns (SearchUsersResponse);
  rpc GetRecommendations(GetRecommendationsRequest) returns (RecommendationsResponse);

  // Partner Preferences
  rpc GetPartnerPreferences(GetPartnerPreferencesRequest) returns (PartnerPreferencesResponse);
  rpc UpdatePartnerPreferences(UpdatePartnerPreferencesRequest) returns (UpdatePartnerPreferencesResponse);

  // User Preferences (App Settings)
  rpc GetUserPreferences(GetUserPreferencesRequest) returns (UserPreferencesResponse);
  rpc UpdateUserPreferences(UpdateUserPreferencesRequest) returns (UpdateUserPreferencesResponse);

  // Blocking & Reporting
  rpc BlockUser(BlockUserRequest) returns (BlockUserResponse);
  rpc UnblockUser(UnblockUserRequest) returns (UnblockUserResponse);
  rpc ListBlockedUsers(ListBlockedUsersRequest) returns (ListBlockedUsersResponse);
  rpc ReportUser(ReportUserRequest) returns (ReportUserResponse);
}
```

#### 3. AdminService (20 RPCs)

**Proto**: `proto/admin/v1/admin.proto`
**Implementation**: `apps/backend/internal/service/admin_service.go`

```protobuf
service AdminService {
  // Authentication
  rpc AdminLogin(AdminLoginRequest) returns (AdminLoginResponse);

  // User Management
  rpc GetAllUsers(GetAllUsersRequest) returns (GetAllUsersResponse);
  rpc SearchUsers(SearchUsersRequest) returns (SearchUsersResponse);
  rpc GetUserDetails(GetUserDetailsRequest) returns (GetUserDetailsResponse);
  rpc BulkUserAction(BulkUserActionRequest) returns (BulkUserActionResponse);

  // Date Matching
  rpc GetDateSuggestions(GetDateSuggestionsRequest) returns (GetDateSuggestionsResponse);
  rpc ScheduleDate(ScheduleDateRequest) returns (ScheduleDateResponse);

  // AI Curation ✨ NEW
  rpc GetCurationCandidates(GetCurationCandidatesRequest) returns (GetCurationCandidatesResponse);
  rpc CurateDates(CurateDatesRequest) returns (CurateDatesResponse);

  // Genie Operations
  rpc GetGenieDates(GetGenieDatesRequest) returns (GetGenieDatesResponse);
  rpc UpdateDateStatus(UpdateDateStatusRequest) returns (UpdateDateStatusResponse);

  // Admin User Management
  rpc CreateAdminUser(CreateAdminUserRequest) returns (CreateAdminUserResponse);
  rpc GetAllAdmins(GetAllAdminsRequest) returns (GetAllAdminsResponse);
  rpc UpdateAdmin(UpdateAdminRequest) returns (UpdateAdminResponse);
  rpc DeleteAdmin(DeleteAdminRequest) returns (DeleteAdminResponse);
  rpc UpdateAdminProfile(UpdateAdminProfileRequest) returns (UpdateAdminProfileResponse);

  // Analytics
  rpc GetPlatformStats(GetPlatformStatsRequest) returns (GetPlatformStatsResponse);
  rpc GetUserGrowth(GetUserGrowthRequest) returns (GetUserGrowthResponse);
  rpc GetActiveUsers(GetActiveUsersRequest) returns (GetActiveUsersResponse);
  rpc GetSignups(GetSignupsRequest) returns (GetSignupsResponse);
  rpc GetDemographics(GetDemographicsRequest) returns (GetDemographicsResponse);
  rpc GetLocationStats(GetLocationStatsRequest) returns (GetLocationStatsResponse);
  rpc GetAvailabilityStats(GetAvailabilityStatsRequest) returns (GetAvailabilityStatsResponse);
}
```

#### 4. AvailabilityService (3 RPCs)

**Proto**: `proto/availability/v1/availability.proto`
**Implementation**: `apps/backend/internal/service/availability_service.go`

```protobuf
service AvailabilityService {
  rpc GetAvailability(GetAvailabilityRequest) returns (GetAvailabilityResponse);
  rpc SubmitAvailability(SubmitAvailabilityRequest) returns (SubmitAvailabilityResponse);
  rpc DeleteAvailability(DeleteAvailabilityRequest) returns (DeleteAvailabilityResponse);
}
```

---

## Adding New Features

This section provides step-by-step instructions for adding new features to the backend.

### Workflow Overview

```
1. Design API (proto definition)
2. Generate code (make generate)
3. Implement service layer
4. Implement repository layer (if DB needed)
5. Add HTTP endpoints (if REST needed)
6. Write tests
7. Update documentation
```

### Step 1: Add New gRPC Endpoint

**Scenario**: Adding a `GetUserStats` RPC to UserService

#### 1.1 Define Proto Message

**File**: `proto/user/v1/user.proto`

```protobuf
// Add request message
message GetUserStatsRequest {
  string user_id = 1;  // User ID to get stats for
}

// Add response message
message GetUserStatsResponse {
  int32 profile_views = 1;
  int32 likes_received = 2;
  int32 matches_count = 3;
  int32 dates_completed = 4;
  google.protobuf.Timestamp last_active = 5;
}

// Add RPC to service
service UserService {
  // ... existing RPCs ...

  // New RPC
  rpc GetUserStats(GetUserStatsRequest) returns (GetUserStatsResponse);
}
```

**Why**: Proto files define the API contract. All clients (web, mobile) will get type-safe generated code.

#### 1.2 Generate Code

```bash
make generate
# OR
docker-compose run proto-gen buf generate proto
```

**This generates**:
- `apps/backend/gen/user/v1/user.pb.go` - Proto message types
- `apps/backend/gen/user/v1/user_grpc.pb.go` - Service interface
- `apps/frontend/src/gen/user/v1/user_pb.ts` - TypeScript types

**What to check**:
- Verify `gen/user/v1/user.pb.go` has `GetUserStatsRequest` and `GetUserStatsResponse` structs
- Verify `gen/user/v1/user_grpc.pb.go` has `GetUserStats` method in `UserServiceServer` interface

#### 1.3 Implement Service Method

**File**: `apps/backend/internal/service/user_service.go` (or create new `user_stats_service.go`)

```go
package service

import (
    "context"
    userpb "github.com/datifyy/backend/gen/user/v1"
)

// GetUserStats retrieves user statistics
func (s *UserService) GetUserStats(ctx context.Context, req *userpb.GetUserStatsRequest) (*userpb.GetUserStatsResponse, error) {
    // 1. Validate request
    if req.UserId == "" {
        return nil, status.Errorf(codes.InvalidArgument, "user_id is required")
    }

    // 2. Parse user ID
    userID, err := strconv.ParseInt(req.UserId, 10, 64)
    if err != nil {
        return nil, status.Errorf(codes.InvalidArgument, "invalid user_id")
    }

    // 3. Check if user exists
    user, err := s.userRepo.GetByID(ctx, userID)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "user not found")
    }

    // 4. Get stats from repository
    stats, err := s.userRepo.GetUserStats(ctx, userID)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to get stats: %v", err)
    }

    // 5. Build response
    return &userpb.GetUserStatsResponse{
        ProfileViews:   stats.ProfileViews,
        LikesReceived:  stats.LikesReceived,
        MatchesCount:   stats.MatchesCount,
        DatesCompleted: stats.DatesCompleted,
        LastActive:     timestamppb.New(stats.LastActive),
    }, nil
}
```

**Key Points**:
- Always validate input
- Use appropriate gRPC status codes
- Handle errors gracefully
- Convert between DB types and proto types

#### 1.4 Implement Repository Method

**File**: `apps/backend/internal/repository/user_repository.go`

```go
type UserStats struct {
    ProfileViews   int32
    LikesReceived  int32
    MatchesCount   int32
    DatesCompleted int32
    LastActive     time.Time
}

func (r *UserRepository) GetUserStats(ctx context.Context, userID int64) (*UserStats, error) {
    query := `
        SELECT
            COALESCE(profile_views, 0) as profile_views,
            COALESCE(likes_received, 0) as likes_received,
            COALESCE(matches_count, 0) as matches_count,
            COALESCE(dates_completed, 0) as dates_completed,
            last_active
        FROM user_stats
        WHERE user_id = $1
    `

    var stats UserStats
    err := r.db.QueryRowContext(ctx, query, userID).Scan(
        &stats.ProfileViews,
        &stats.LikesReceived,
        &stats.MatchesCount,
        &stats.DatesCompleted,
        &stats.LastActive,
    )

    if err == sql.ErrNoRows {
        // Return zero stats if no record exists
        return &UserStats{LastActive: time.Now()}, nil
    }

    if err != nil {
        return nil, fmt.Errorf("failed to get user stats: %w", err)
    }

    return &stats, nil
}
```

#### 1.5 Add Database Migration (if needed)

**File**: `apps/backend/migrations/009_add_user_stats.sql`

```sql
-- Up migration
CREATE TABLE IF NOT EXISTS user_stats (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    profile_views INT DEFAULT 0,
    likes_received INT DEFAULT 0,
    matches_count INT DEFAULT 0,
    dates_completed INT DEFAULT 0,
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- Down migration (commented out, only for reference)
-- DROP TABLE user_stats;
```

**Apply migration**:
```bash
# Migrations run automatically in Docker on startup
docker-compose restart backend
```

#### 1.6 Add HTTP Endpoint (Optional)

**File**: `apps/backend/cmd/server/main.go`

```go
// Add handler function
func createGetUserStatsHandler(userService *service.UserService) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }

        // Get user ID from URL query or path
        userID := r.URL.Query().Get("userId")
        if userID == "" {
            http.Error(w, "userId is required", http.StatusBadRequest)
            return
        }

        // Call gRPC service
        resp, err := userService.GetUserStats(r.Context(), &userpb.GetUserStatsRequest{
            UserId: userID,
        })

        if err != nil {
            http.Error(w, fmt.Sprintf("Failed to get stats: %v", err), http.StatusInternalServerError)
            return
        }

        // Convert to JSON-friendly format
        jsonResp := map[string]interface{}{
            "profileViews":   resp.ProfileViews,
            "likesReceived":  resp.LikesReceived,
            "matchesCount":   resp.MatchesCount,
            "datesCompleted": resp.DatesCompleted,
            "lastActive":     resp.LastActive.AsTime(),
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(jsonResp)
    }
}

// Register endpoint in main()
func main() {
    // ... existing setup ...

    // Add to HTTP mux
    mux.HandleFunc("/api/v1/user/stats", createGetUserStatsHandler(userService))

    // ... rest of main ...
}
```

**Where to add**:
1. Find similar handlers in `main.go` (search for "createGetUserProfileHandler" as example)
2. Add your handler function before `main()`
3. Register the route in `main()` with other HTTP routes

#### 1.7 Test the Endpoint

**gRPC Testing**:
```bash
# Using grpcurl
grpcurl -plaintext \
  -d '{"user_id": "1"}' \
  localhost:9090 \
  user.v1.UserService/GetUserStats
```

**HTTP Testing**:
```bash
curl http://localhost:8080/api/v1/user/stats?userId=1
```

### Step 2: Add New Service

**Scenario**: Adding a MessagingService for in-app messaging

#### 2.1 Create Proto File

**File**: `proto/messaging/v1/messaging.proto`

```protobuf
syntax = "proto3";

package messaging.v1;

option go_package = "github.com/datifyy/backend/gen/messaging/v1;messagingpb";

import "google/protobuf/timestamp.proto";

service MessagingService {
  rpc SendMessage(SendMessageRequest) returns (SendMessageResponse);
  rpc GetConversations(GetConversationsRequest) returns (GetConversationsResponse);
  rpc GetMessages(GetMessagesRequest) returns (GetMessagesResponse);
  rpc MarkAsRead(MarkAsReadRequest) returns (MarkAsReadResponse);
}

message SendMessageRequest {
  string receiver_id = 1;
  string content = 2;
  string message_type = 3;  // text, image, video
}

message SendMessageResponse {
  Message message = 1;
}

message Message {
  string id = 1;
  string sender_id = 2;
  string receiver_id = 3;
  string content = 4;
  string message_type = 5;
  bool is_read = 6;
  google.protobuf.Timestamp sent_at = 7;
}

// ... other messages ...
```

#### 2.2 Update buf.yaml

**File**: `proto/buf.yaml`

```yaml
version: v1
name: buf.build/datifyy/proto
deps:
  - buf.build/googleapis/googleapis
breaking:
  use:
    - FILE
lint:
  use:
    - DEFAULT
```

No changes needed if structure is `proto/messaging/v1/`.

#### 2.3 Update buf.gen.yaml

**File**: `proto/buf.gen.yaml`

```yaml
version: v1
managed:
  enabled: true
  go_package_prefix:
    default: github.com/datifyy/backend/gen
    except:
      - buf.build/googleapis/googleapis
plugins:
  # Go plugins
  - plugin: buf.build/protocolbuffers/go
    out: ../apps/backend/gen
    opt:
      - paths=source_relative
  - plugin: buf.build/grpc/go
    out: ../apps/backend/gen
    opt:
      - paths=source_relative
      - require_unimplemented_servers=false

  # TypeScript plugins for frontend
  - plugin: buf.build/community/timostamm-protobuf-ts
    out: ../apps/frontend/src/gen
    opt:
      - generate_dependencies
```

#### 2.4 Generate Code

```bash
make generate
```

**Verify generated files**:
- `apps/backend/gen/messaging/v1/messaging.pb.go`
- `apps/backend/gen/messaging/v1/messaging_grpc.pb.go`
- `apps/frontend/src/gen/messaging/v1/messaging.pb.ts`

#### 2.5 Create Repository

**File**: `apps/backend/internal/repository/messaging_repository.go`

```go
package repository

import (
    "context"
    "database/sql"
    "time"
)

type MessagingRepository struct {
    db *sql.DB
}

func NewMessagingRepository(db *sql.DB) *MessagingRepository {
    return &MessagingRepository{db: db}
}

type Message struct {
    ID         int64
    SenderID   int64
    ReceiverID int64
    Content    string
    MessageType string
    IsRead     bool
    SentAt     time.Time
}

func (r *MessagingRepository) CreateMessage(ctx context.Context, msg *Message) (*Message, error) {
    query := `
        INSERT INTO messages (sender_id, receiver_id, content, message_type, is_read, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, sent_at
    `

    err := r.db.QueryRowContext(ctx, query,
        msg.SenderID,
        msg.ReceiverID,
        msg.Content,
        msg.MessageType,
        msg.IsRead,
        time.Now(),
    ).Scan(&msg.ID, &msg.SentAt)

    if err != nil {
        return nil, err
    }

    return msg, nil
}

// ... other methods ...
```

#### 2.6 Create Service

**File**: `apps/backend/internal/service/messaging_service.go`

```go
package service

import (
    "context"
    "strconv"

    messagingpb "github.com/datifyy/backend/gen/messaging/v1"
    "github.com/datifyy/backend/internal/repository"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
    "google.golang.org/protobuf/types/known/timestamppb"
)

type MessagingService struct {
    messagingpb.UnimplementedMessagingServiceServer
    repo *repository.MessagingRepository
}

func NewMessagingService(repo *repository.MessagingRepository) *MessagingService {
    return &MessagingService{
        repo: repo,
    }
}

func (s *MessagingService) SendMessage(ctx context.Context, req *messagingpb.SendMessageRequest) (*messagingpb.SendMessageResponse, error) {
    // 1. Validate
    if req.ReceiverId == "" || req.Content == "" {
        return nil, status.Errorf(codes.InvalidArgument, "receiver_id and content are required")
    }

    // 2. Get sender from context (from JWT auth middleware)
    senderID := GetUserIDFromContext(ctx)

    // 3. Parse receiver ID
    receiverID, err := strconv.ParseInt(req.ReceiverId, 10, 64)
    if err != nil {
        return nil, status.Errorf(codes.InvalidArgument, "invalid receiver_id")
    }

    // 4. Create message
    msg := &repository.Message{
        SenderID:    senderID,
        ReceiverID:  receiverID,
        Content:     req.Content,
        MessageType: req.MessageType,
        IsRead:      false,
    }

    createdMsg, err := s.repo.CreateMessage(ctx, msg)
    if err != nil {
        return nil, status.Errorf(codes.Internal, "failed to send message: %v", err)
    }

    // 5. Convert to proto
    return &messagingpb.SendMessageResponse{
        Message: &messagingpb.Message{
            Id:          strconv.FormatInt(createdMsg.ID, 10),
            SenderId:    strconv.FormatInt(createdMsg.SenderID, 10),
            ReceiverId:  strconv.FormatInt(createdMsg.ReceiverID, 10),
            Content:     createdMsg.Content,
            MessageType: createdMsg.MessageType,
            IsRead:      createdMsg.IsRead,
            SentAt:      timestamppb.New(createdMsg.SentAt),
        },
    }, nil
}

// ... implement other RPCs ...
```

#### 2.7 Register Service in main.go

**File**: `apps/backend/cmd/server/main.go`

```go
func main() {
    // ... existing setup (DB, Redis) ...

    // Initialize repository
    messagingRepo := repository.NewMessagingRepository(db)

    // Initialize service
    messagingService := service.NewMessagingService(messagingRepo)

    // Register gRPC service
    messagingpb.RegisterMessagingServiceServer(grpcServer, messagingService)

    // Optional: Add HTTP endpoints
    mux.HandleFunc("/api/v1/messages/send", createSendMessageHandler(messagingService))
    mux.HandleFunc("/api/v1/messages/conversations", createGetConversationsHandler(messagingService))

    // ... rest of main ...
}
```

**Where to add**:
1. After existing service initializations (search for `userService :=`)
2. Before `grpcServer` is started
3. Import the generated pb package: `messagingpb "github.com/datifyy/backend/gen/messaging/v1"`

#### 2.8 Add Migration

**File**: `apps/backend/migrations/010_add_messaging.sql`

```sql
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, sent_at DESC);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;
```

#### 2.9 Restart Services

```bash
docker-compose restart backend
```

The migration will run automatically on startup.

---

## Debugging Guide

### Debug Logging

#### Enable Verbose Logging

**File**: `apps/backend/cmd/server/main.go`

```go
// Add after imports
var (
    debugMode = os.Getenv("DEBUG") == "true"
)

func debugLog(format string, args ...interface{}) {
    if debugMode {
        log.Printf("[DEBUG] "+format, args...)
    }
}

// Use in handlers
func (s *UserService) GetUserProfile(ctx context.Context, req *userpb.GetUserProfileRequest) (*userpb.UserProfileResponse, error) {
    debugLog("GetUserProfile called with user_id: %s", req.UserId)

    // ... rest of implementation ...

    debugLog("GetUserProfile returning profile for user %s", req.UserId)
    return response, nil
}
```

**Enable debug mode**:
```bash
docker-compose exec backend sh -c 'DEBUG=true go run cmd/server/main.go'
```

### Step-by-Step Debugging

#### Using Delve Debugger

1. **Install Delve** in Docker container:

**File**: `docker/backend/Dockerfile.dev`

```dockerfile
# Add after Go installation
RUN go install github.com/go-delve/delve/cmd/dlv@latest
```

2. **Update Air config** for debugging:

**File**: `.air.toml`

```toml
[build]
  cmd = "dlv debug --headless --listen=:2345 --api-version=2 --accept-multiclient ./cmd/server"
```

3. **Expose debug port**:

**File**: `docker-compose.yml`

```yaml
backend:
  ports:
    - "8080:8080"
    - "9090:9090"
    - "2345:2345"  # Delve debugger
```

4. **Connect from VS Code**:

**File**: `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Connect to Delve",
      "type": "go",
      "request": "attach",
      "mode": "remote",
      "remotePath": "/app",
      "port": 2345,
      "host": "localhost"
    }
  ]
}
```

### Common Issues

#### Issue: Database Connection Failed

**Symptoms**:
```
2025/11/23 10:00:00 ✗ Failed to connect to PostgreSQL: connection refused
```

**Debug Steps**:
1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Test connection manually:
   ```bash
   docker-compose exec backend psql -h postgres -U devuser -d monorepo_dev
   ```

3. Check environment variables:
   ```bash
   docker-compose exec backend env | grep DB_
   ```

4. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

**Solution**: Ensure `DATABASE_URL` matches PostgreSQL container settings.

#### Issue: gRPC Method Not Found

**Symptoms**:
```
rpc error: code = Unimplemented desc = method GetUserStats not found
```

**Debug Steps**:
1. Verify proto was regenerated:
   ```bash
   ls -la apps/backend/gen/user/v1/
   grep "GetUserStats" apps/backend/gen/user/v1/user_grpc.pb.go
   ```

2. Verify service implements the method:
   ```bash
   grep "GetUserStats" apps/backend/internal/service/user_service.go
   ```

3. Verify service is registered:
   ```bash
   grep "RegisterUserServiceServer" apps/backend/cmd/server/main.go
   ```

4. Restart backend:
   ```bash
   docker-compose restart backend
   ```

#### Issue: HTTP Endpoint Returns 404

**Debug Steps**:
1. Check if route is registered:
   ```bash
   grep "/api/v1/user/stats" apps/backend/cmd/server/main.go
   ```

2. Check HTTP method matches:
   ```bash
   curl -X POST http://localhost:8080/api/v1/user/stats  # Try different methods
   ```

3. List all registered routes (add debugging):
   ```go
   // In main.go, after all routes are registered
   debugLog("Registered routes:")
   mux.VisitAll(func(pattern string, _ http.Handler) {
       debugLog("  - %s", pattern)
   })
   ```

#### Issue: AI Curation Not Working

**Symptoms**:
```
Failed to curate dates: AI provider not initialized
```

**Debug Steps**:
1. Check if GEMINI_API_KEY is set:
   ```bash
   docker-compose exec backend printenv | grep GEMINI
   ```

2. Test Gemini API directly:
   ```bash
   curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY"
   ```

3. Check AI module logs:
   ```bash
   docker-compose logs backend | grep -i "AI\|gemini"
   ```

**Solution**: Add GEMINI_API_KEY to `docker-compose.yml`:
```yaml
backend:
  environment:
    - GEMINI_API_KEY=your_actual_api_key_here
```

---

## Testing Guide

### Unit Testing

#### Test Service Methods

**File**: `apps/backend/internal/service/user_service_test.go`

```go
package service

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

// Mock repository
type MockUserRepository struct {
    mock.Mock
}

func (m *MockUserRepository) GetByID(ctx context.Context, id int64) (*repository.User, error) {
    args := m.Called(ctx, id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*repository.User), args.Error(1)
}

// Test case
func TestGetUserProfile_Success(t *testing.T) {
    // Setup
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo, nil, nil)

    // Mock data
    expectedUser := &repository.User{
        ID:    1,
        Email: "test@example.com",
        Name:  "Test User",
    }

    mockRepo.On("GetByID", mock.Anything, int64(1)).Return(expectedUser, nil)

    // Execute
    req := &userpb.GetUserProfileRequest{UserId: "1"}
    resp, err := service.GetUserProfile(context.Background(), req)

    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, resp)
    assert.Equal(t, "test@example.com", resp.Profile.Email)

    mockRepo.AssertExpectations(t)
}

func TestGetUserProfile_UserNotFound(t *testing.T) {
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo, nil, nil)

    mockRepo.On("GetByID", mock.Anything, int64(999)).Return(nil, sql.ErrNoRows)

    req := &userpb.GetUserProfileRequest{UserId: "999"}
    resp, err := service.GetUserProfile(context.Background(), req)

    assert.Error(t, err)
    assert.Nil(t, resp)
    assert.Contains(t, err.Error(), "not found")
}
```

**Run tests**:
```bash
cd apps/backend
go test ./internal/service/...
```

### Integration Testing

#### Test with Real Database

**File**: `apps/backend/tests/integration/user_test.go`

```go
//go:build integration
// +build integration

package integration

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/datifyy/backend/internal/repository"
    "github.com/datifyy/backend/internal/service"
)

func TestUserIntegration(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)

    // Initialize repositories and services
    userRepo := repository.NewUserRepository(db)
    profileRepo := repository.NewUserProfileRepository(db)
    userService := service.NewUserService(userRepo, profileRepo, nil)

    // Test: Create user
    user := &repository.User{
        Email: "integration@test.com",
        Name:  "Integration Test",
    }

    createdUser, err := userRepo.Create(context.Background(), user)
    assert.NoError(t, err)
    assert.NotZero(t, createdUser.ID)

    // Test: Get user profile
    req := &userpb.GetUserProfileRequest{
        UserId: strconv.FormatInt(createdUser.ID, 10),
    }

    resp, err := userService.GetUserProfile(context.Background(), req)
    assert.NoError(t, err)
    assert.Equal(t, "integration@test.com", resp.Profile.Email)
}

func setupTestDB(t *testing.T) *sql.DB {
    // Connect to test database
    connStr := os.Getenv("TEST_DATABASE_URL")
    db, err := sql.Open("postgres", connStr)
    assert.NoError(t, err)

    // Run migrations
    runMigrations(t, db)

    return db
}

func cleanupTestDB(t *testing.T, db *sql.DB) {
    // Clean up test data
    _, err := db.Exec("TRUNCATE TABLE users CASCADE")
    assert.NoError(t, err)
    db.Close()
}
```

**Run integration tests**:
```bash
# Start test database
make test-db

# Run tests
cd apps/backend
go test -tags=integration ./tests/integration/...
```

---

## Best Practices

### Code Organization

1. **One service method per file** (for large services):
   - `auth_service.go` - Main service and registration
   - `auth_session_service.go` - Session management
   - `auth_password_service.go` - Password operations

2. **Repository pattern**:
   - All database queries in repository layer
   - Services call repositories, never raw SQL in services

3. **Proto message validation**:
   - Always validate required fields
   - Return `codes.InvalidArgument` for bad input

4. **Error handling**:
   - Use gRPC status codes appropriately
   - Log errors before returning
   - Don't expose internal errors to clients

### Security

1. **Authentication**:
   ```go
   // Extract user ID from JWT token in context
   userID := GetUserIDFromContext(ctx)
   if userID == 0 {
       return nil, status.Errorf(codes.Unauthenticated, "authentication required")
   }
   ```

2. **Authorization**:
   ```go
   // Check if user can access resource
   if resourceOwnerID != userID {
       return nil, status.Errorf(codes.PermissionDenied, "access denied")
   }
   ```

3. **Input validation**:
   ```go
   // Sanitize and validate all inputs
   if !isValidEmail(req.Email) {
       return nil, status.Errorf(codes.InvalidArgument, "invalid email format")
   }
   ```

### Performance

1. **Use database indexes**:
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, sent_at DESC);
   ```

2. **Connection pooling**:
   ```go
   db.SetMaxOpenConns(25)
   db.SetMaxIdleConns(5)
   db.SetConnMaxLifetime(5 * time.Minute)
   ```

3. **Redis caching**:
   ```go
   // Cache frequently accessed data
   cacheKey := fmt.Sprintf("user:profile:%d", userID)
   cached, err := redis.Get(ctx, cacheKey).Result()
   if err == nil {
       // Return cached data
       return unmarshalProfile(cached), nil
   }

   // Fetch from DB and cache
   profile := fetchFromDB(userID)
   redis.Set(ctx, cacheKey, marshal(profile), 5*time.Minute)
   return profile, nil
   ```

### Documentation

1. **Comment all exported functions**:
   ```go
   // GetUserProfile retrieves a user's profile by ID.
   // Returns NotFound error if user doesn't exist.
   func (s *UserService) GetUserProfile(ctx context.Context, req *userpb.GetUserProfileRequest) (*userpb.UserProfileResponse, error) {
       // ...
   }
   ```

2. **Update proto comments**:
   ```protobuf
   // GetUserProfile retrieves a user's public profile information.
   // Requires authentication. Users can view any public profile.
   rpc GetUserProfile(GetUserProfileRequest) returns (UserProfileResponse);
   ```

3. **Update API documentation** after changes:
   - This file (BACKEND_ARCHITECTURE.md)
   - README.md
   - POSTMAN_GUIDE.md

---

## Environment Variables

### Required

```bash
# Database
DATABASE_URL=postgres://devuser:devpass@localhost:5432/monorepo_dev
DB_HOST=localhost
DB_PORT=5432
DB_USER=devuser
DB_PASSWORD=devpass
DB_NAME=monorepo_dev

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=8080
ENV=development
```

### Optional

```bash
# AI Features
GEMINI_API_KEY=your_gemini_api_key_here  # Required for AI curation

# Email
MAILERSEND_API_KEY=your_mailersend_key_here  # Required for email verification

# Security
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=3600  # 1 hour

# Debugging
DEBUG=true  # Enable verbose logging
LOG_LEVEL=debug  # debug, info, warn, error
```

---

## File Change Summary for Common Tasks

### Adding a new gRPC endpoint to existing service

**Files to modify**:
1. `proto/{service}/v1/{service}.proto` - Add RPC definition
2. Run `make generate`
3. `apps/backend/internal/service/{service}_service.go` - Implement method
4. `apps/backend/internal/repository/{service}_repository.go` - Add DB methods (if needed)
5. `apps/backend/migrations/00X_feature.sql` - Add tables/columns (if needed)
6. `apps/backend/cmd/server/main.go` - Add HTTP endpoint (optional)
7. Update this file (BACKEND_ARCHITECTURE.md)

### Adding a new service

**Files to create**:
1. `proto/{newservice}/v1/{newservice}.proto` - Proto definition
2. Run `make generate`
3. `apps/backend/internal/service/{newservice}_service.go` - Service implementation
4. `apps/backend/internal/repository/{newservice}_repository.go` - Repository
5. `apps/backend/migrations/00X_add_{newservice}.sql` - Database schema
6. `apps/backend/cmd/server/main.go` - Register service

**Files to modify**:
1. `proto/buf.gen.yaml` - Add service (if needed)
2. `apps/backend/cmd/server/main.go` - Initialize and register
3. Update documentation

### Adding a new table

**Files to create**:
1. `apps/backend/migrations/00X_add_{table}.sql` - Migration

**Files to modify**:
1. `apps/backend/internal/repository/{related}_repository.go` - Add methods
2. Update this file (database schema section)

---

## Quick Reference

### Common Commands

```bash
# Generate proto code
make generate

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Restart backend
docker-compose restart backend

# Run migrations (automatic on startup)
docker-compose restart backend

# Database console
docker-compose exec postgres psql -U devuser -d monorepo_dev

# Redis CLI
docker-compose exec redis redis-cli

# Run tests
cd apps/backend && go test ./...

# Test gRPC endpoint
grpcurl -plaintext -d '{"user_id": "1"}' localhost:9090 user.v1.UserService/GetUserProfile

# Test HTTP endpoint
curl http://localhost:8080/api/v1/user/me
```

### Import Paths

```go
// Proto imports
import userpb "github.com/datifyy/backend/gen/user/v1"
import authpb "github.com/datifyy/backend/gen/auth/v1"
import adminpb "github.com/datifyy/backend/gen/admin/v1"

// Internal imports
import "github.com/datifyy/backend/internal/service"
import "github.com/datifyy/backend/internal/repository"
import "github.com/datifyy/backend/internal/auth"
import "github.com/datifyy/backend/internal/email"
import "github.com/datifyy/backend/internal/ai"
```

---

**Document Version**: 2.0
**Last Updated**: November 23, 2025
**Maintained By**: Datifyy Backend Team

For questions or clarifications, please refer to other documentation files or create an issue.
