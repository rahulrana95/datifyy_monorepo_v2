# Datifyy API Endpoints Reference

## Available Endpoints

Currently, the backend exposes **REST endpoints** on port 8080 and **gRPC endpoints** on port 9090.

## REST Endpoints (HTTP - Port 8080)

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Service information and status |
| `GET` | `/health` | Simple health check |
| `GET` | `/ready` | Database and Redis readiness check |
| `GET` | `/api/test-db` | Test database connection |
| `GET` | `/api/test-redis` | Test Redis connection |

### Authentication (REST)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/auth/register/email` | Register with email/password | No |
| `POST` | `/api/v1/auth/login/email` | Login with email/password | No |
| `POST` | `/api/v1/auth/token/refresh` | Refresh access token | No |
| `POST` | `/api/v1/auth/token/revoke` | Revoke token (logout) | No |

## REST API Request/Response Format

### Register with Email

**Endpoint:** `POST /api/v1/auth/register/email`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "device_info": {
    "platform": 1,
    "device_name": "Chrome on MacBook Pro",
    "os_version": "macOS 14.0",
    "device_id": "device_12345"
  }
}
```

**Platform Values:**
- `0` - UNSPECIFIED
- `1` - WEB
- `2` - IOS
- `3` - ANDROID
- `4` - DESKTOP

**Response (201 Created):**
```json
{
  "user": {
    "user_id": "123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "account_status": "ACCOUNT_STATUS_PENDING",
    "email_verified": "VERIFICATION_STATUS_UNVERIFIED",
    "created_at": {
      "seconds": 1700000000,
      "nanos": 0
    }
  },
  "tokens": {
    "access_token": {
      "token": "access_token_123_1700000000",
      "token_type": "Bearer",
      "expires_at": {
        "seconds": 1700003600,
        "nanos": 0
      }
    },
    "refresh_token": {
      "token": "refresh_token_123_abc",
      "expires_at": {
        "seconds": 1702592000,
        "nanos": 0
      }
    }
  },
  "session": {
    "session_id": "sess_123_1700000000",
    "user_id": "123"
  },
  "requires_email_verification": true
}
```

### Login with Email

**Endpoint:** `POST /api/v1/auth/login/email`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "device_info": {
    "platform": 1,
    "device_name": "Chrome on MacBook Pro",
    "os_version": "macOS 14.0",
    "device_id": "device_12345"
  }
}
```

**Response (200 OK):**
```json
{
  "user": {
    "user_id": "123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "account_status": "ACCOUNT_STATUS_ACTIVE",
    "email_verified": "VERIFICATION_STATUS_VERIFIED",
    "created_at": {
      "seconds": 1700000000,
      "nanos": 0
    }
  },
  "tokens": {
    "access_token": {
      "token": "access_token_123_1700086400",
      "token_type": "Bearer",
      "expires_at": {
        "seconds": 1700090000,
        "nanos": 0
      }
    },
    "refresh_token": {
      "token": "refresh_token_123_def",
      "expires_at": {
        "seconds": 1702678400,
        "nanos": 0
      }
    }
  },
  "session": {
    "session_id": "sess_123_1700086400",
    "user_id": "123"
  }
}
```

**Error Response (401 Unauthorized):**
```
Login failed: invalid email or password
```

### Refresh Token

**Endpoint:** `POST /api/v1/auth/token/refresh`

**Request Body:**
```json
{
  "refresh_token": "refresh_token_123_abc",
  "device_info": {
    "platform": 1,
    "device_name": "Chrome on MacBook Pro",
    "os_version": "macOS 14.0",
    "device_id": "device_12345"
  }
}
```

**Response (200 OK):**
```json
{
  "tokens": {
    "access_token": {
      "token": "access_token_123_1700090000",
      "token_type": "Bearer",
      "expires_at": {
        "seconds": 1700093600,
        "nanos": 0
      }
    },
    "refresh_token": {
      "token": "refresh_token_123_ghi",
      "expires_at": {
        "seconds": 1702682000,
        "nanos": 0
      }
    }
  }
}
```

### Revoke Token (Logout)

**Endpoint:** `POST /api/v1/auth/token/revoke`

**Request Body:**
```json
{
  "refresh_token": "refresh_token_123_abc"
}
```

**Response (200 OK):**
```json
{
  "message": "Token revoked successfully"
}
```

## gRPC Endpoints (Port 9090)

The gRPC server exposes the full AuthService and UserService as defined in the proto files:

- **AuthService** - All authentication operations
- **UserService** - User profile management

### Using gRPC Endpoints

**With grpcurl:**
```bash
# List services
grpcurl -plaintext localhost:9090 list

# List methods
grpcurl -plaintext localhost:9090 list datifyy.auth.v1.AuthService

# Call RegisterWithEmail
grpcurl -plaintext -d '{
  "credentials": {
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }
}' localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail
```

**With Postman (gRPC):**
1. Create new gRPC request
2. Enter server URL: `localhost:9090`
3. Select method: `datifyy.auth.v1.AuthService/RegisterWithEmail`
4. Add message body

## cURL Examples

### Register
```bash
curl -X POST http://localhost:8080/api/v1/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "device_info": {
      "platform": 1,
      "device_name": "Chrome on MacBook Pro",
      "os_version": "macOS 14.0",
      "device_id": "device_12345"
    }
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "device_info": {
      "platform": 1,
      "device_name": "Chrome on MacBook Pro",
      "os_version": "macOS 14.0",
      "device_id": "device_12345"
    }
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:8080/api/v1/auth/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN",
    "device_info": {
      "platform": 1,
      "device_name": "Chrome on MacBook Pro",
      "os_version": "macOS 14.0",
      "device_id": "device_12345"
    }
  }'
```

## Error Responses

### Bad Request (400)
```
Registration failed: invalid email: invalid email format
```

### Unauthorized (401)
```
Login failed: invalid email or password
```

### Service Unavailable (503)
```
Database not ready
```

## CORS Configuration

The API supports CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, Connect-Protocol-Version, Connect-Timeout-Ms`

## Testing the API

### 1. Check Service Health
```bash
curl http://localhost:8080/
```

### 2. Register a User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123!","name":"Test User"}'
```

### 3. Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123!"}'
```

## Quick Reference

| What | REST Endpoint | gRPC Method |
|------|--------------|-------------|
| Register | `POST /api/v1/auth/register/email` | `RegisterWithEmail` |
| Login | `POST /api/v1/auth/login/email` | `LoginWithEmail` |
| Refresh | `POST /api/v1/auth/token/refresh` | `RefreshToken` |
| Logout | `POST /api/v1/auth/token/revoke` | `RevokeToken` |

## Notes

- **REST endpoints** use snake_case for JSON keys (e.g., `user_id`, `device_info`)
- **gRPC endpoints** use the protobuf format with camelCase
- Only 4 REST endpoints are currently implemented
- Full gRPC service is available on port 9090
- For other operations, use gRPC or wait for REST endpoints to be added

---

**Last Updated:** 2025-11-15
