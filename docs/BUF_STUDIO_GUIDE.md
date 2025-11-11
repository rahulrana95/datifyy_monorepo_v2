# Buf Studio & Proto Tools Guide

## 🚀 Quick Start with Buf Studio

Buf Studio is an interactive web-based tool for testing and exploring your gRPC/Protobuf APIs, similar to Postman but specifically designed for protobuf services.

### Launch Buf Studio

```bash
make studio
```

This will open Buf Studio in your browser at https://studio.buf.build

### Load Your Proto Files

1. **Click "Load Schema"** in Buf Studio
2. **Select "From Local Files"**
3. **Navigate to** `proto/` directory in your project
4. **Select all .proto files** or choose specific services:
   - `auth/v1/auth.proto` - Authentication Service
   - `user/v1/user.proto` - User Profile Service
   - `common/v1/types.proto` - Common Types

### Available Services

#### 🔐 AuthService (`datifyy.auth.v1.AuthService`)

**Registration:**
- `RegisterWithEmail` - Register with email/password
- `RegisterWithPhone` - Register with phone number

**Login:**
- `LoginWithEmail` - Login with email/password
- `LoginWithPhone` - Login with phone OTP
- `RequestPhoneOTP` - Request OTP for phone login
- `LoginWithOAuth` - OAuth login (future)

**Token Management:**
- `RefreshToken` - Refresh access token
- `RevokeToken` - Revoke refresh token
- `ValidateToken` - Validate access token

**Email Verification:**
- `SendEmailVerification` - Send verification email
- `VerifyEmail` - Verify email with code
- `ResendVerificationCode` - Resend verification code

**Phone Verification:**
- `SendPhoneVerification` - Send phone OTP
- `VerifyPhone` - Verify phone with OTP

**Password Management:**
- `RequestPasswordReset` - Request password reset
- `ConfirmPasswordReset` - Reset password with token
- `ChangePassword` - Change password (authenticated)

**Session Management:**
- `GetCurrentSession` - Get current session info
- `ListSessions` - List all active sessions
- `RevokeSession` - Revoke specific session
- `RevokeAllSessions` - Revoke all other sessions

**Device Management:**
- `ListDevices` - List user devices
- `TrustDevice` - Mark device as trusted
- `RevokeDevice` - Revoke device access

**Logout:**
- `Logout` - Logout current session
- `LogoutAll` - Logout from all devices

#### 👤 UserService (`datifyy.user.v1.UserService`)

**Profile Management:**
- `GetUserProfile` - Get user by ID
- `GetMyProfile` - Get current user profile
- `UpdateProfile` - Update profile details
- `DeleteAccount` - Delete user account
- `UploadProfilePhoto` - Upload profile photo
- `DeleteProfilePhoto` - Delete profile photo

**Discovery:**
- `SearchUsers` - Search users with filters
- `GetRecommendations` - Get recommended matches

**Preferences:**
- `GetPartnerPreferences` - Get partner preferences
- `UpdatePartnerPreferences` - Update partner preferences
- `GetUserPreferences` - Get app preferences
- `UpdateUserPreferences` - Update app preferences

**Safety:**
- `BlockUser` - Block a user
- `UnblockUser` - Unblock a user
- `ListBlockedUsers` - List blocked users
- `ReportUser` - Report a user

---

## 📊 Proto Development Tools

### View Proto Statistics

```bash
make proto-status
```

Shows:
- Number of services defined
- Number of messages
- Number of enums
- Number of RPC methods
- Number of proto files

### Lint Proto Files

```bash
make proto-lint
```

Validates your proto files against Buf's style guide and best practices.

### Check for Breaking Changes

```bash
make proto-breaking
```

Compares current proto files against main branch to detect breaking changes.

### Format Proto Files

```bash
make proto-format
```

Auto-formats all proto files according to Buf standards.

### Generate Proto Documentation

```bash
make proto-docs
```

Generates HTML documentation for your proto files in `docs/proto/`.

---

## 🧪 Testing with grpcurl (When gRPC is Implemented)

### List Available Services

```bash
make grpcurl-list
```

### Test Auth Service

```bash
# Register with email
make grpcurl-auth

# Or manually:
grpcurl -plaintext \
  -d '{
    "credentials": {
      "email": "user@example.com",
      "password": "SecurePass123!",
      "name": "John Doe",
      "device_info": {
        "platform": 1,
        "device_name": "iPhone 14",
        "os_version": "iOS 17"
      }
    }
  }' \
  localhost:9090 \
  datifyy.auth.v1.AuthService/RegisterWithEmail
```

### Test User Service

```bash
# Get user profile
grpcurl -plaintext \
  -d '{"user_id": "user-123"}' \
  localhost:9090 \
  datifyy.user.v1.UserService/GetUserProfile

# Search users
grpcurl -plaintext \
  -d '{
    "filters": {
      "age_range": {"min_age": 25, "max_age": 35},
      "distance": 50,
      "gender": [1]
    },
    "pagination": {
      "page": 1,
      "page_size": 20
    }
  }' \
  localhost:9090 \
  datifyy.user.v1.UserService/SearchUsers
```

---

## 🔧 Current State & Next Steps

### ⚠️ Important Note

Your backend **currently uses REST (HTTP)**, not gRPC. The proto files define the API contract, but you need to implement a gRPC server to use Buf Studio for live testing.

### What Works Now:
✅ Proto schema exploration in Buf Studio
✅ Message/enum/service documentation
✅ Proto validation and linting
✅ Code generation (Go, TypeScript)

### What You'll Need for Live Testing:
❌ gRPC server implementation in backend
❌ gRPC interceptors (auth, logging, etc.)
❌ gRPC gateway (optional - for REST compatibility)

### To Implement gRPC Server:

1. **Update backend to support gRPC:**
   ```go
   // In apps/backend/cmd/server/main.go
   import (
       "google.golang.org/grpc"
       authv1 "github.com/datifyy/backend/gen/auth/v1"
       userv1 "github.com/datifyy/backend/gen/user/v1"
   )

   grpcServer := grpc.NewServer()
   authv1.RegisterAuthServiceServer(grpcServer, &authService{})
   userv1.RegisterUserServiceServer(grpcServer, &userService{})
   ```

2. **Expose gRPC port (9090) in docker-compose.yml:**
   ```yaml
   backend:
     ports:
       - "8080:8080"  # HTTP REST
       - "9090:9090"  # gRPC
   ```

3. **Test with Buf Studio:**
   ```bash
   make studio
   # Connect to localhost:9090
   ```

---

## 📚 Additional Resources

- [Buf Studio Documentation](https://buf.build/docs/bsr/studio)
- [Buf CLI Documentation](https://buf.build/docs/introduction)
- [gRPC Go Tutorial](https://grpc.io/docs/languages/go/quickstart/)
- [grpcurl GitHub](https://github.com/fullstorydev/grpcurl)

---

## 🎯 Example Workflow

### 1. Make Changes to Proto Files
```bash
# Edit proto/auth/v1/auth.proto
vim proto/auth/v1/auth.proto
```

### 2. Validate & Format
```bash
make proto-lint
make proto-format
```

### 3. Check for Breaking Changes
```bash
make proto-breaking
```

### 4. Regenerate Code
```bash
make generate
```

### 5. Test in Buf Studio
```bash
make studio
```

### 6. View Documentation
```bash
make proto-docs
open docs/proto/index.html
```

### 7. Get Statistics
```bash
make proto-status
```

---

## 💡 Pro Tips

1. **Use `make proto-watch`** during development to auto-regenerate types on save
2. **Run `make proto-lint`** before committing proto changes
3. **Check `make proto-breaking`** in CI/CD to prevent breaking API changes
4. **Generate docs with `make proto-docs`** and commit to repo for team visibility
5. **Use Buf Studio** to design and test APIs before implementing backend logic

---

## 🐛 Troubleshooting

### "grpcurl: command not found"
Install grpcurl:
```bash
# macOS
brew install grpcurl

# Linux
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
```

### "buf: command not found"
The project uses Docker for buf commands, so you don't need to install it locally.
All commands use `docker-compose run --rm proto-gen`.

### "Cannot connect to gRPC server"
The backend doesn't have gRPC implemented yet. See "Current State & Next Steps" section above.
