# Datifyy API - Postman Testing Guide

Complete guide for testing Datifyy APIs using Postman.

## Table of Contents
- [Setup](#setup)
- [Authentication](#authentication)
- [Collection Overview](#collection-overview)
- [Testing Workflows](#testing-workflows)
- [Environment Variables](#environment-variables)
- [Common Issues](#common-issues)

## Setup

### 1. Install Postman
Download and install Postman from https://www.postman.com/downloads/

### 2. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `Datifyy_API.postman_collection.json` from the repository root
4. Click "Import"

### 3. Set Up Environment
1. Click the environment dropdown (top right)
2. Create new environment called "Datifyy Development"
3. Add the following variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:8080` | `http://localhost:8080` |
| `access_token` | | (auto-populated after login) |
| `refresh_token` | | (auto-populated after login) |
| `admin_token` | | (auto-populated after admin login) |
| `user_id` | | (auto-populated after registration) |
| `gemini_api_key` | `your_gemini_api_key` | `your_gemini_api_key` |

### 4. Activate Environment
- Select "Datifyy Development" from the environment dropdown

## Authentication

### User Authentication Flow

#### 1. Register New User
```
POST {{base_url}}/api/v1/auth/register/email

Body:
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "name": "Test User"
}

Response:
{
  "userId": "123",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

The collection automatically saves `access_token`, `refresh_token`, and `user_id` to environment variables.

#### 2. Login
```
POST {{base_url}}/api/v1/auth/login/email

Body:
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "userId": "123",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

#### 3. Use Protected Endpoints
All subsequent requests automatically include the `Authorization` header:
```
Authorization: Bearer {{access_token}}
```

### Admin Authentication

#### Admin Login
```
POST {{base_url}}/api/v1/admin/login

Body:
{
  "email": "admin@datifyy.com",
  "password": "AdminPass123!"
}

Response:
{
  "adminId": "1",
  "token": "eyJhbGc...",
  "role": "ADMIN_ROLE_SUPER"
}
```

The `admin_token` is automatically saved and used for admin endpoints.

## Collection Overview

The Postman collection includes **34 HTTP REST endpoints** organized in folders:

### 1. Health & Diagnostics (5 endpoints)
- GET Health Check
- GET Readiness Check
- GET Service Info
- GET Test Database
- GET Test Redis

### 2. Authentication (4 endpoints)
- POST Register with Email
- POST Login with Email
- POST Refresh Token
- POST Revoke Token (Logout)

### 3. User Profile (6 endpoints)
- GET My Profile
- PUT Update Profile
- POST Upload Profile Photo
- DELETE Profile Photo
- GET Partner Preferences
- PUT Update Partner Preferences

### 4. Availability (4 endpoints)
- GET User Availability
- POST Add Availability
- PUT Update Availability
- DELETE Availability

### 5. Admin Operations (15 endpoints)
- POST Admin Login
- GET Platform Analytics
- GET All Users (with filters)
- GET User Details
- PUT Update User Status
- PUT Verify User
- GET User Activity Logs
- POST Create Admin
- GET All Admins
- PUT Update Admin Role
- DELETE Admin
- GET Admin Profile
- PUT Update Admin Profile
- GET Curation Candidates (AI)
- POST Curate Dates (AI Analysis)

## Testing Workflows

### Workflow 1: New User Registration & Profile Setup

1. **Register User**
   - Folder: Authentication
   - Request: "POST Register with Email"
   - Verify: `userId` and `access_token` saved to environment

2. **Get Profile**
   - Folder: User Profile
   - Request: "GET My Profile"
   - Verify: Profile data returned

3. **Update Profile**
   - Folder: User Profile
   - Request: "PUT Update Profile"
   - Body:
   ```json
   {
     "name": "John Doe",
     "dateOfBirth": "1995-05-15",
     "gender": "MALE",
     "bio": "Looking for meaningful connections",
     "location": "Mumbai, India",
     "occupation": "Software Engineer"
   }
   ```

4. **Set Partner Preferences**
   - Folder: User Profile
   - Request: "PUT Update Partner Preferences"
   - Body:
   ```json
   {
     "ageMin": 25,
     "ageMax": 35,
     "preferredGenders": ["FEMALE"],
     "maxDistance": 50,
     "interests": ["travel", "music", "technology"]
   }
   ```

5. **Add Availability**
   - Folder: Availability
   - Request: "POST Add Availability"
   - Body:
   ```json
   {
     "startTime": "2025-11-24T18:00:00Z",
     "endTime": "2025-11-24T21:00:00Z",
     "location": "Coffee House, Mumbai"
   }
   ```

### Workflow 2: Admin User Management

1. **Admin Login**
   - Folder: Admin Operations
   - Request: "POST Admin Login"
   - Verify: `admin_token` saved

2. **View Platform Analytics**
   - Folder: Admin Operations
   - Request: "GET Platform Analytics"
   - View: Total users, active users, dates scheduled, etc.

3. **List All Users**
   - Folder: Admin Operations
   - Request: "GET All Users"
   - Query params available:
     - `page=1`
     - `limit=20`
     - `status=ACTIVE`
     - `verified=true`
     - `search=john`

4. **Get User Details**
   - Folder: Admin Operations
   - Request: "GET User Details"
   - Path param: `userId` (set in environment or manually)

5. **Verify User**
   - Folder: Admin Operations
   - Request: "PUT Verify User"
   - Path params: `userId`, `verificationType` (EMAIL, AADHAR, WORK_EMAIL)

### Workflow 3: AI-Powered Date Curation

1. **Get Curation Candidates**
   - Folder: Admin Operations
   - Request: "GET Curation Candidates"
   - Returns: Users available for dates starting tomorrow
   - Response:
   ```json
   {
     "candidates": [
       {
         "userId": "51",
         "email": "test1@test.com",
         "name": "Test User 1",
         "age": 30,
         "gender": "MALE",
         "profileCompletion": 85,
         "availableSlotsCount": 5,
         "nextAvailableDate": 1732406400
       }
     ]
   }
   ```

2. **Analyze Compatibility (AI)**
   - Folder: Admin Operations
   - Request: "POST Curate Dates"
   - Body:
   ```json
   {
     "userId": "51",
     "candidateIds": ["52", "53", "106"]
   }
   ```
   - Response:
   ```json
   {
     "matches": [
       {
         "userId": "52",
         "name": "Test User 2",
         "age": 28,
         "gender": "FEMALE",
         "compatibilityScore": 85,
         "isMatch": true,
         "reasoning": "Strong compatibility based on shared interests...",
         "matchedAspects": [
           "Similar age range",
           "Compatible interests in travel and music",
           "Complementary personalities"
         ],
         "mismatchedAspects": [
           "Different work schedules"
         ]
       }
     ]
   }
   ```

3. **Interpretation**
   - Score >= 80: Excellent match 🌟
   - Score >= 60: Good match 💙
   - Score >= 40: Fair match 🟡
   - Score < 40: Poor match ⚠️

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:8080` |
| `access_token` | User JWT token | Auto-populated |
| `refresh_token` | Refresh token | Auto-populated |
| `admin_token` | Admin JWT token | Auto-populated |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `user_id` | Current user ID | Auto-populated |
| `test_email` | Test email address | `test@example.com` |
| `test_password` | Test password | `SecurePass123!` |

### Auto-Population Scripts

The collection includes **Test Scripts** that automatically populate environment variables:

#### Registration/Login Response
```javascript
// Save tokens from auth responses
pm.test("Save tokens to environment", function () {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.accessToken);
    pm.environment.set("refresh_token", jsonData.refreshToken);
    pm.environment.set("user_id", jsonData.userId);
});
```

#### Admin Login Response
```javascript
// Save admin token
pm.test("Save admin token", function () {
    var jsonData = pm.response.json();
    pm.environment.set("admin_token", jsonData.token);
});
```

## Common Issues

### 1. 401 Unauthorized

**Problem**: Missing or expired access token

**Solution**:
```
1. Login again: POST /api/v1/auth/login/email
2. Or refresh token: POST /api/v1/auth/token/refresh
3. Check Authorization header is set to: Bearer {{access_token}}
```

### 2. 404 Not Found

**Problem**: Backend service not running or incorrect URL

**Solution**:
```bash
# Check backend is running
docker-compose ps backend

# Verify backend logs
docker-compose logs backend

# Test health endpoint
curl http://localhost:8080/health

# Ensure base_url is correct in environment
```

### 3. AI Curation Returns Empty Results

**Problem**: No users with availability or GEMINI_API_KEY not set

**Solution**:
```bash
# Check backend logs
docker-compose logs backend | grep -i gemini

# Verify GEMINI_API_KEY
docker-compose exec backend printenv | grep GEMINI

# Check users with availability
docker-compose exec postgres psql -U devuser -d monorepo_dev -c "
  SELECT u.id, u.email, COUNT(a.id) as slots
  FROM users u
  JOIN availability a ON u.id = a.user_id
  WHERE a.start_time >= NOW()
  GROUP BY u.id
"
```

### 4. CORS Errors (from browser)

**Problem**: Frontend making requests from different origin

**Solution**: Backend already has CORS enabled for `http://localhost:3000`. If testing from Postman, CORS does not apply.

### 5. Validation Errors

**Problem**: Request body doesn't match expected format

**Solution**:
```
1. Check request body matches the example in collection
2. Verify all required fields are present
3. Check data types (strings, numbers, booleans)
4. Verify date formats (ISO 8601: "2025-11-24T18:00:00Z")
```

## Best Practices

### 1. Use Pre-request Scripts
Add to collection or folder level:
```javascript
// Auto-add authorization header for user endpoints
if (pm.environment.get("access_token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("access_token")
    });
}
```

### 2. Use Tests for Validation
```javascript
// Validate status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Validate response structure
pm.test("Response has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('userId');
    pm.expect(jsonData).to.have.property('email');
});

// Validate data types
pm.test("User ID is a string", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.userId).to.be.a('string');
});
```

### 3. Chain Requests
Use Collection Runner to execute workflow sequences:
1. Register → Get Profile → Update Profile → Add Availability
2. Admin Login → Get Users → Verify User
3. Get Candidates → Curate Dates

### 4. Use Variables for Dynamic Data
```javascript
// Generate random email
pm.environment.set("test_email", "user_" + Date.now() + "@test.com");

// Use in request body
{
  "email": "{{test_email}}",
  "password": "SecurePass123!"
}
```

## Advanced Features

### 1. Collection Runner
- Run entire workflow sequences
- Use CSV data files for bulk testing
- View test results and assertions

### 2. Monitor Collection
- Schedule automatic runs
- Get email alerts on failures
- Track API uptime

### 3. Mock Servers
- Create mock endpoints for frontend development
- Test without backend running
- Simulate different response scenarios

### 4. Documentation
- Auto-generate API documentation from collection
- Share with team members
- Publish public documentation

## gRPC Testing

For gRPC endpoints (port 9090), use:
- **Buf Studio** (recommended): Modern web UI for gRPC testing
- **grpcui**: Interactive web UI
- **Postman gRPC** (beta): Native gRPC support in Postman

See [GRPC_TESTING.md](./GRPC_TESTING.md) for detailed gRPC testing instructions.

## Additional Resources

- [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) - Complete API reference with all 100 endpoints
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [TESTING.md](./TESTING.md) - Testing guidelines
- [Postman Learning Center](https://learning.postman.com/) - Official Postman documentation

## Support

For issues with the API:
1. Check backend logs: `docker-compose logs backend`
2. Verify database connection: `curl http://localhost:8080/api/test-db`
3. Review [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) for endpoint details
4. Open an issue in the repository

---

**Happy Testing!** 🚀
