# Datifyy API - Postman Collection Guide

This guide will help you set up and use the Postman collection for the Datifyy API.

## Files

- **`Datifyy_API.postman_collection.json`** - Complete API collection with all endpoints
- **`Datifyy_Environment.postman_environment.json`** - Environment variables for local development

## Setup Instructions

### 1. Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **`Datifyy_API.postman_collection.json`**
4. Click **Import**

### 2. Import Environment

1. Click on **Environments** in the left sidebar
2. Click **Import**
3. Select **`Datifyy_Environment.postman_environment.json`**
4. Click **Import**
5. Select **"Datifyy - Local Development"** from the environment dropdown (top right)

## Collection Structure

The collection is organized into the following sections:

### 📁 Auth
- **Registration** - Email and phone registration endpoints
- **Login** - Multiple login methods (email, phone, OAuth)
- **Token Management** - Refresh, validate, and revoke tokens
- **Email Verification** - Send and verify email codes
- **Phone Verification** - Send and verify OTP codes
- **Password Management** - Reset and change password
- **Session Management** - View and manage active sessions
- **Device Management** - List, trust, and revoke devices
- **Logout** - Logout from current session or all sessions

## Features

### 🔑 Automatic Token Management

The collection automatically:
- Saves `access_token` and `refresh_token` after successful login/registration
- Adds Authorization header with Bearer token to authenticated requests
- Updates tokens after refresh

### ✅ Automated Tests

Each request includes tests that:
- Validate response status codes
- Check response structure
- Verify response times
- Save important data to variables

### 📝 Example Requests & Responses

Every endpoint includes:
- **Realistic dummy data** in request bodies
- **Example responses** showing expected data structure
- **Field descriptions** explaining each parameter

## Quick Start Workflow

### 1. Register a New User

```
POST /datifyy.auth.v1.AuthService/RegisterWithEmail
```

**Request:**
```json
{
  "credentials": {
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "deviceInfo": {
      "platform": "DEVICE_PLATFORM_WEB",
      "deviceName": "Chrome on MacBook Pro",
      "osVersion": "macOS 14.0",
      "appVersion": "1.0.0",
      "browser": "Chrome 120",
      "deviceId": "device_12345"
    }
  }
}
```

**Auto-saved variables:**
- `access_token`
- `refresh_token`
- `user_id`
- `session_id`

### 2. Login

```
POST /datifyy.auth.v1.AuthService/LoginWithEmail
```

Uses the same credentials. Tokens are automatically saved.

### 3. Access Protected Endpoints

All subsequent requests will automatically include the Bearer token in the Authorization header.

### 4. Refresh Token

```
POST /datifyy.auth.v1.AuthService/RefreshToken
```

Automatically uses `{{refresh_token}}` variable and updates both tokens.

## Environment Variables

| Variable | Description | Auto-Updated |
|----------|-------------|--------------|
| `base_url` | API base URL | No |
| `access_token` | JWT access token | Yes |
| `refresh_token` | Refresh token | Yes |
| `user_id` | Current user ID | Yes |
| `session_id` | Current session ID | Yes |
| `test_email` | Test email for manual testing | No |
| `test_password` | Test password | No |
| `test_phone` | Test phone number | No |

## Using Variables in Requests

Variables can be used in request bodies using double curly braces:

```json
{
  "refreshToken": "{{refresh_token}}"
}
```

## Creating Additional Environments

To create environments for staging/production:

1. Duplicate **"Datifyy - Local Development"**
2. Rename to **"Datifyy - Staging"** or **"Datifyy - Production"**
3. Update `base_url` to the appropriate server URL:
   - Staging: `https://api-staging.datifyy.com`
   - Production: `https://api.datifyy.com`

## Endpoint Categories

### Registration
- `RegisterWithEmail` - Create account with email/password
- `RegisterWithPhone` - Create account with phone/OTP

### Login
- `LoginWithEmail` - Login with email/password
- `RequestPhoneOTP` - Request OTP for phone login
- `LoginWithPhone` - Login with phone/OTP
- `LoginWithOAuth` - OAuth provider login (future)

### Token Management
- `RefreshToken` - Get new access token
- `ValidateToken` - Validate token (internal use)
- `RevokeToken` - Revoke refresh token

### Email Verification
- `SendEmailVerification` - Send verification code
- `VerifyEmail` - Verify email with code
- `ResendVerificationCode` - Resend code

### Phone Verification
- `SendPhoneVerification` - Send OTP
- `VerifyPhone` - Verify phone with OTP

### Password Management
- `RequestPasswordReset` - Request password reset link
- `ConfirmPasswordReset` - Reset password with token
- `ChangePassword` - Change password (authenticated)

### Session Management
- `GetCurrentSession` - Get current session details
- `ListSessions` - List all active sessions
- `RevokeSession` - Revoke specific session
- `RevokeAllSessions` - Revoke all except current

### Device Management
- `ListDevices` - List all user devices
- `TrustDevice` - Mark device as trusted
- `RevokeDevice` - Revoke device access

### Logout
- `Logout` - Logout current session
- `LogoutAll` - Logout all sessions

## Request/Response Examples

### Successful Registration Response
```json
{
  "user": {
    "userId": "123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "accountStatus": "ACCOUNT_STATUS_PENDING",
    "emailVerified": "VERIFICATION_STATUS_UNVERIFIED",
    "createdAt": {
      "seconds": 1700000000,
      "nanos": 0
    }
  },
  "tokens": {
    "accessToken": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": {
        "seconds": 1700003600,
        "nanos": 0
      },
      "tokenType": "Bearer"
    },
    "refreshToken": {
      "token": "refresh_token_abc123...",
      "expiresAt": {
        "seconds": 1702592000,
        "nanos": 0
      }
    }
  },
  "session": {
    "sessionId": "sess_123_1700000000",
    "userId": "123",
    "isCurrent": true
  },
  "requiresEmailVerification": true
}
```

### Error Response
```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "invalid email: invalid email format",
    "details": {
      "field": "email"
    }
  }
}
```

## Enum Values

### Account Status
- `ACCOUNT_STATUS_ACTIVE` - Active and verified
- `ACCOUNT_STATUS_PENDING` - Created but not verified
- `ACCOUNT_STATUS_SUSPENDED` - Temporarily suspended
- `ACCOUNT_STATUS_BANNED` - Permanently banned
- `ACCOUNT_STATUS_DELETED` - Soft deleted

### Verification Status
- `VERIFICATION_STATUS_UNVERIFIED` - Not verified
- `VERIFICATION_STATUS_PENDING` - Code sent, awaiting verification
- `VERIFICATION_STATUS_VERIFIED` - Verified
- `VERIFICATION_STATUS_EXPIRED` - Code expired

### Device Platform
- `DEVICE_PLATFORM_WEB` - Web browser
- `DEVICE_PLATFORM_IOS` - iOS app
- `DEVICE_PLATFORM_ANDROID` - Android app
- `DEVICE_PLATFORM_DESKTOP` - Desktop app

### Verification Type
- `VERIFICATION_TYPE_EMAIL` - Email verification
- `VERIFICATION_TYPE_PHONE` - Phone verification
- `VERIFICATION_TYPE_PASSWORD_RESET` - Password reset

## Tips & Best Practices

### 1. Use Collection Runner
Run all tests in sequence:
1. Click **Collections** → **Datifyy API**
2. Click **Run** button
3. Select requests to run
4. Click **Run Datifyy API**

### 2. Pre-request Scripts
The collection includes global pre-request scripts that:
- Automatically add Authorization headers
- Can be extended for custom logic

### 3. Test Scripts
Global test scripts validate:
- Response time < 2000ms
- Content-Type is JSON
- Custom validations per endpoint

### 4. Organize Workflows
Create custom folders for specific workflows:
- User onboarding flow
- Password reset flow
- Multi-device login flow

### 5. Export/Share
Export collections with updated data:
1. Right-click collection
2. Select **Export**
3. Choose **Collection v2.1**
4. Share with team

## Troubleshooting

### Issue: "Authorization header missing"
**Solution:** Make sure you've logged in and `access_token` is set. Check the environment dropdown shows the correct environment.

### Issue: "Token expired"
**Solution:** Use the **Refresh Token** endpoint to get a new access token.

### Issue: "Request timeout"
**Solution:** Ensure backend services are running:
```bash
docker-compose ps
docker-compose up -d
```

### Issue: "Invalid response format"
**Solution:** Verify the backend is running on the correct port (8080 for HTTP).

## Advanced Usage

### Running Tests Programmatically

Use Newman (Postman CLI) to run tests:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Datifyy_API.postman_collection.json \
  -e Datifyy_Environment.postman_environment.json \
  --reporters cli,json

# Run with detailed output
newman run Datifyy_API.postman_collection.json \
  -e Datifyy_Environment.postman_environment.json \
  --verbose
```

### CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run API Tests
  run: |
    npm install -g newman
    newman run Datifyy_API.postman_collection.json \
      -e Datifyy_Environment.postman_environment.json \
      --reporters cli,junit \
      --reporter-junit-export results.xml
```

## Support

For issues or questions:
- Check the proto files in `/proto` directory for schema details
- Review backend code in `/apps/backend`
- Contact the development team

## Version History

- **v1.0.0** (2025-11-15)
  - Initial collection with all Auth endpoints
  - Automated token management
  - Complete test coverage
  - Example requests and responses
  - Environment variables setup

---

**Happy Testing! 🚀**
