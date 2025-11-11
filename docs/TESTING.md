# Testing Guide

Comprehensive guide for writing unit tests, integration tests, and end-to-end tests for the Datifyy monorepo.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Unit Testing Guidelines](#unit-testing-guidelines)
- [Integration Testing Guidelines](#integration-testing-guidelines)
- [End-to-End Testing](#end-to-end-testing)
- [Test Organization](#test-organization)
- [Running Tests](#running-tests)
- [Code Coverage](#code-coverage)
- [Best Practices](#best-practices)

---

## Testing Philosophy

### Testing Pyramid

```
        /\
       /  \        E2E Tests (Few)
      /____\       - Complete user workflows
     /      \      - Slow, brittle
    /        \
   /Integration\   Integration Tests (Some)
  /____________\   - Service + Database + Redis
 /              \  - Medium speed
/   Unit Tests   \ Unit Tests (Many)
/________________\ - Fast, isolated
                   - Test business logic
```

### Key Principles

1. **Write tests first** (TDD) or immediately after implementation
2. **Test behavior, not implementation** - tests should survive refactoring
3. **One assertion per test** (or logically related assertions)
4. **Independent tests** - no shared state between tests
5. **Fast feedback** - unit tests should run in milliseconds

---

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions and methods in isolation

**Characteristics**:
- No database connections
- No external services
- Use mocks/stubs for dependencies
- Fast (< 10ms per test)

**Location**: `apps/backend/internal/*/`

**Example**: Testing password validation logic

### 2. Integration Tests

**Purpose**: Test interaction between components (service + database + Redis)

**Characteristics**:
- Real database connections (test database)
- Real Redis connections
- No mocks for infrastructure
- Medium speed (< 1s per test)

**Location**: `apps/backend/tests/integration/`

**Example**: Testing user registration end-to-end

### 3. E2E Tests

**Purpose**: Test complete user workflows through the API

**Characteristics**:
- HTTP/gRPC requests to running server
- Real frontend interactions
- Slow (seconds per test)

**Location**: TBD (not yet implemented)

---

## Unit Testing Guidelines

### Structure: Arrange-Act-Assert (AAA)

Every unit test should follow this pattern:

```go
func TestFunctionName_Scenario(t *testing.T) {
    // ARRANGE - Set up test data and conditions
    input := "test@example.com"
    expected := nil // no error expected

    // ACT - Execute the function under test
    result := ValidateEmail(input)

    // ASSERT - Verify the outcome
    if result != expected {
        t.Errorf("ValidateEmail(%q) = %v, want %v", input, result, expected)
    }
}
```

### Test Naming Convention

```
Test<FunctionName>_<Scenario>
```

Examples:
- `TestHashPassword_ValidPassword`
- `TestHashPassword_TooShort`
- `TestHashPassword_MissingUppercase`
- `TestVerifyPassword_CorrectPassword`
- `TestVerifyPassword_WrongPassword`

### Example: Testing Password Utilities

**File**: `apps/backend/internal/auth/password_test.go`

```go
package auth

import (
    "strings"
    "testing"
)

func TestHashPassword_ValidPassword(t *testing.T) {
    // Arrange
    password := "ValidPass123!"

    // Act
    hash, err := HashPassword(password)

    // Assert
    if err != nil {
        t.Fatalf("HashPassword() unexpected error: %v", err)
    }
    if hash == "" {
        t.Error("HashPassword() returned empty hash")
    }
    if hash == password {
        t.Error("HashPassword() returned plaintext password")
    }
    if !strings.HasPrefix(hash, "$2a$") && !strings.HasPrefix(hash, "$2b$") {
        t.Errorf("HashPassword() returned invalid bcrypt hash: %s", hash)
    }
}

func TestHashPassword_TooShort(t *testing.T) {
    password := "Short1!"
    _, err := HashPassword(password)
    if err == nil {
        t.Error("HashPassword() should reject password shorter than 8 characters")
    }
}

func TestHashPassword_MissingUppercase(t *testing.T) {
    password := "lowercase123!"
    _, err := HashPassword(password)
    if err == nil {
        t.Error("HashPassword() should reject password without uppercase letter")
    }
}

func TestHashPassword_MissingLowercase(t *testing.T) {
    password := "UPPERCASE123!"
    _, err := HashPassword(password)
    if err == nil {
        t.Error("HashPassword() should reject password without lowercase letter")
    }
}

func TestHashPassword_MissingNumber(t *testing.T) {
    password := "NoNumbers!"
    _, err := HashPassword(password)
    if err == nil {
        t.Error("HashPassword() should reject password without number")
    }
}

func TestHashPassword_MissingSpecialChar(t *testing.T) {
    password := "NoSpecial123"
    _, err := HashPassword(password)
    if err == nil {
        t.Error("HashPassword() should reject password without special character")
    }
}

func TestVerifyPassword_CorrectPassword(t *testing.T) {
    password := "TestPass123!"
    hash, _ := HashPassword(password)

    err := VerifyPassword(hash, password)
    if err != nil {
        t.Errorf("VerifyPassword() failed for correct password: %v", err)
    }
}

func TestVerifyPassword_WrongPassword(t *testing.T) {
    password := "TestPass123!"
    hash, _ := HashPassword(password)

    err := VerifyPassword(hash, "WrongPass123!")
    if err == nil {
        t.Error("VerifyPassword() should fail for incorrect password")
    }
}

func TestVerifyPassword_EmptyPassword(t *testing.T) {
    hash, _ := HashPassword("TestPass123!")

    err := VerifyPassword(hash, "")
    if err == nil {
        t.Error("VerifyPassword() should fail for empty password")
    }
}
```

### Table-Driven Tests (For Multiple Scenarios)

```go
func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        {
            name:    "valid email",
            email:   "test@example.com",
            wantErr: false,
        },
        {
            name:    "valid email with subdomain",
            email:   "user@mail.example.com",
            wantErr: false,
        },
        {
            name:    "valid email with plus",
            email:   "user+tag@example.com",
            wantErr: false,
        },
        {
            name:    "invalid - no @",
            email:   "notanemail",
            wantErr: true,
        },
        {
            name:    "invalid - missing domain",
            email:   "test@",
            wantErr: true,
        },
        {
            name:    "invalid - missing local part",
            email:   "@example.com",
            wantErr: true,
        },
        {
            name:    "invalid - spaces",
            email:   "test @example.com",
            wantErr: true,
        },
        {
            name:    "empty email",
            email:   "",
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateEmail(%q) error = %v, wantErr %v", tt.email, err, tt.wantErr)
            }
        })
    }
}
```

### Testing Error Cases

Always test both success and failure paths:

```go
func TestCreateUser_DuplicateEmail(t *testing.T) {
    // This test requires a mock database or integration test
    // See Integration Testing section
}
```

---

## Integration Testing Guidelines

### Setup and Teardown

Integration tests need database setup/cleanup:

```go
package integration

import (
    "context"
    "database/sql"
    "os"
    "testing"

    _ "github.com/lib/pq"
)

var testDB *sql.DB

// TestMain runs before all tests
func TestMain(m *testing.M) {
    var err error

    // Connect to test database
    dbURL := os.Getenv("TEST_DATABASE_URL")
    if dbURL == "" {
        dbURL = os.Getenv("DATABASE_URL") // Fallback for Docker
    }

    testDB, err = sql.Open("postgres", dbURL)
    if err != nil {
        panic("failed to connect to test database: " + err.Error())
    }

    // Verify connection
    if err := testDB.Ping(); err != nil {
        panic("failed to ping test database: " + err.Error())
    }

    // Run tests
    code := m.Run()

    // Cleanup
    testDB.Close()

    os.Exit(code)
}

// cleanupDatabase removes test data after each test
func cleanupDatabase(t *testing.T) {
    tables := []string{"sessions", "devices", "user_profiles", "users"}

    for _, table := range tables {
        _, err := testDB.Exec("DELETE FROM " + table)
        if err != nil {
            t.Fatalf("Failed to cleanup %s: %v", table, err)
        }
    }
}
```

### Integration Test Example

**File**: `apps/backend/tests/integration/auth_test.go`

```go
//go:build integration
// +build integration

package integration

import (
    "context"
    "testing"
    "time"

    authpb "github.com/datifyy/backend/gen/auth/v1"
    "github.com/datifyy/backend/internal/repository"
    "github.com/datifyy/backend/internal/service"
)

func TestRegisterWithEmail_Success(t *testing.T) {
    // ARRANGE
    ctx := context.Background()
    userRepo := repository.NewUserRepository(testDB)
    authService := service.NewAuthService(testDB, nil) // nil Redis for simple tests

    req := &authpb.RegisterWithEmailRequest{
        Credentials: &authpb.EmailPasswordCredentials{
            Email:    "integration@example.com",
            Password: "TestPass123!",
            Name:     "Integration Test User",
        },
    }

    // Clean up before test
    cleanupDatabase(t)
    defer cleanupDatabase(t) // Clean up after test

    // ACT
    resp, err := authService.RegisterWithEmail(ctx, req)

    // ASSERT
    if err != nil {
        t.Fatalf("RegisterWithEmail() error = %v", err)
    }

    // Verify response structure
    if resp.User == nil {
        t.Fatal("Response missing user")
    }
    if resp.Tokens == nil {
        t.Fatal("Response missing tokens")
    }
    if resp.Session == nil {
        t.Fatal("Response missing session")
    }

    // Verify user data
    if resp.User.Email != req.Credentials.Email {
        t.Errorf("User email = %v, want %v", resp.User.Email, req.Credentials.Email)
    }
    if resp.User.Name != req.Credentials.Name {
        t.Errorf("User name = %v, want %v", resp.User.Name, req.Credentials.Name)
    }
    if resp.User.AccountStatus.String() != "ACCOUNT_STATUS_PENDING" {
        t.Errorf("Account status = %v, want ACCOUNT_STATUS_PENDING", resp.User.AccountStatus)
    }

    // Verify email verification required
    if !resp.RequiresEmailVerification {
        t.Error("RequiresEmailVerification should be true")
    }

    // Verify user exists in database
    user, err := userRepo.GetByEmail(ctx, req.Credentials.Email)
    if err != nil {
        t.Fatalf("Failed to get user from database: %v", err)
    }
    if user.Email != req.Credentials.Email {
        t.Errorf("Database user email = %v, want %v", user.Email, req.Credentials.Email)
    }

    // Verify profile was created
    var profileExists bool
    err = testDB.QueryRow("SELECT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = $1)", user.ID).Scan(&profileExists)
    if err != nil {
        t.Fatalf("Failed to check profile: %v", err)
    }
    if !profileExists {
        t.Error("User profile was not created")
    }

    // Verify session was created
    var sessionExists bool
    err = testDB.QueryRow("SELECT EXISTS(SELECT 1 FROM sessions WHERE user_id = $1)", user.ID).Scan(&sessionExists)
    if err != nil {
        t.Fatalf("Failed to check session: %v", err)
    }
    if !sessionExists {
        t.Error("Session was not created")
    }

    // Verify tokens are valid
    if resp.Tokens.AccessToken.Token == "" {
        t.Error("Access token is empty")
    }
    if resp.Tokens.RefreshToken.Token == "" {
        t.Error("Refresh token is empty")
    }

    // Verify token expiration
    accessExpiry := time.Unix(resp.Tokens.AccessToken.ExpiresAt.Seconds, 0)
    refreshExpiry := time.Unix(resp.Tokens.RefreshToken.ExpiresAt.Seconds, 0)

    if time.Until(accessExpiry) < 10*time.Minute {
        t.Error("Access token expiry too soon")
    }
    if time.Until(refreshExpiry) < 6*24*time.Hour {
        t.Error("Refresh token expiry too soon")
    }
}

func TestRegisterWithEmail_DuplicateEmail(t *testing.T) {
    ctx := context.Background()
    authService := service.NewAuthService(testDB, nil)

    req := &authpb.RegisterWithEmailRequest{
        Credentials: &authpb.EmailPasswordCredentials{
            Email:    "duplicate@example.com",
            Password: "TestPass123!",
            Name:     "First User",
        },
    }

    cleanupDatabase(t)
    defer cleanupDatabase(t)

    // Register first user
    _, err := authService.RegisterWithEmail(ctx, req)
    if err != nil {
        t.Fatalf("First registration failed: %v", err)
    }

    // Try to register with same email
    req.Credentials.Name = "Second User" // Different name, same email
    _, err = authService.RegisterWithEmail(ctx, req)

    // Should fail
    if err == nil {
        t.Fatal("RegisterWithEmail() should fail for duplicate email")
    }

    // Verify error message
    if !contains(err.Error(), "already exists") && !contains(err.Error(), "duplicate") {
        t.Errorf("Error message should mention duplicate/exists, got: %v", err)
    }
}

func TestRegisterWithEmail_InvalidEmail(t *testing.T) {
    ctx := context.Background()
    authService := service.NewAuthService(testDB, nil)

    invalidEmails := []string{
        "notanemail",
        "missing@domain",
        "@nodomain.com",
        "spaces in@email.com",
        "",
    }

    for _, email := range invalidEmails {
        t.Run(email, func(t *testing.T) {
            req := &authpb.RegisterWithEmailRequest{
                Credentials: &authpb.EmailPasswordCredentials{
                    Email:    email,
                    Password: "TestPass123!",
                    Name:     "Test User",
                },
            }

            _, err := authService.RegisterWithEmail(ctx, req)
            if err == nil {
                t.Errorf("RegisterWithEmail() should fail for invalid email: %s", email)
            }
        })
    }
}

func TestRegisterWithEmail_WeakPassword(t *testing.T) {
    ctx := context.Background()
    authService := service.NewAuthService(testDB, nil)

    weakPasswords := []struct {
        password string
        reason   string
    }{
        {"short", "too short"},
        {"NoNumbers!", "missing numbers"},
        {"nonumbers123", "missing uppercase and special char"},
        {"NOLOWERCASE123!", "missing lowercase"},
        {"NoSpecial123", "missing special character"},
    }

    for _, tc := range weakPasswords {
        t.Run(tc.reason, func(t *testing.T) {
            req := &authpb.RegisterWithEmailRequest{
                Credentials: &authpb.EmailPasswordCredentials{
                    Email:    "test@example.com",
                    Password: tc.password,
                    Name:     "Test User",
                },
            }

            _, err := authService.RegisterWithEmail(ctx, req)
            if err == nil {
                t.Errorf("RegisterWithEmail() should fail for weak password (%s): %s", tc.reason, tc.password)
            }
        })
    }
}

// Helper function
func contains(s, substr string) bool {
    return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
        (len(s) > 0 && len(substr) > 0 && indexOf(s, substr) >= 0))
}

func indexOf(s, substr string) int {
    for i := 0; i <= len(s)-len(substr); i++ {
        if s[i:i+len(substr)] == substr {
            return i
        }
    }
    return -1
}
```

---

## Test Organization

### File Structure

```
apps/backend/
├── internal/
│   ├── auth/
│   │   ├── password.go
│   │   └── password_test.go          # Unit tests alongside code
│   ├── repository/
│   │   ├── user_repository.go
│   │   └── user_repository_test.go   # Unit tests with mocks
│   └── service/
│       ├── auth_service.go
│       └── auth_service_test.go      # Unit tests with mocks
└── tests/
    └── integration/
        ├── auth_test.go               # Integration tests
        ├── user_test.go
        └── helpers.go                 # Test utilities
```

### Build Tags

Use build tags to separate integration tests:

```go
//go:build integration
// +build integration

package integration
```

This prevents integration tests from running with regular unit tests.

---

## Running Tests

### Unit Tests Only

```bash
# All unit tests (excludes integration)
cd apps/backend
go test ./... -short

# Or
make test-backend
```

### Integration Tests

```bash
# Start test database
make test-db

# Run integration tests
cd apps/backend
go test -tags=integration ./tests/integration

# Or
make test-integration

# Stop test database
make test-db-down
```

### All Tests

```bash
make test
```

### Watch Mode (Auto-run on changes)

```bash
# Install gotestsum
go install gotest.tools/gotestsum@latest

# Watch mode
gotestsum --watch
```

### Specific Tests

```bash
# Run single test
go test -run TestRegisterWithEmail_Success ./tests/integration

# Run tests matching pattern
go test -run TestRegister.* ./tests/integration

# Verbose output
go test -v ./tests/integration

# With race detection
go test -race ./...
```

---

## Code Coverage

### Generate Coverage Report

```bash
# Generate coverage
go test ./... -coverprofile=coverage.out

# View in terminal
go tool cover -func=coverage.out

# View in browser (HTML report)
go tool cover -html=coverage.out
```

### Coverage Goals

- **Unit tests**: > 80% coverage
- **Integration tests**: > 60% of critical paths
- **Combined**: > 70% overall

### Exclude from Coverage

Some code doesn't need tests:
- Generated code (`gen/`)
- Main functions
- Simple getters/setters

---

## Best Practices

### DO

✅ **Write tests first** (TDD approach)
✅ **Test one thing per test** - clear focus
✅ **Use descriptive test names** - `TestFunction_Scenario`
✅ **Clean up test data** - independent tests
✅ **Test error cases** - not just happy path
✅ **Use table-driven tests** for multiple scenarios
✅ **Mock external dependencies** in unit tests
✅ **Use real DB in integration tests**
✅ **Keep tests fast** - under 1 second
✅ **Make tests deterministic** - no random data unless seeded
✅ **Test public interfaces** - not private implementation

### DON'T

❌ **Don't test implementation details** - test behavior
❌ **Don't share state** between tests
❌ **Don't use time.Sleep()** in tests - use mocks or test clocks
❌ **Don't skip cleanup** - always clean test data
❌ **Don't test generated code** - trust the generator
❌ **Don't ignore flaky tests** - fix or remove them
❌ **Don't commit failing tests** - maintain green builds
❌ **Don't hardcode timestamps** - use time.Now() or freeze time

### Test Data

Use realistic but fake test data:

```go
// Good - realistic test data
testUser := &User{
    Email: "john.doe@example.com",
    Name:  "John Doe",
    Age:   28,
}

// Bad - lazy test data
testUser := &User{
    Email: "test",
    Name:  "test",
    Age:   1,
}
```

### Assertions

```go
// Good - clear assertion with context
if got != want {
    t.Errorf("GetUser(%d) = %v, want %v", userID, got, want)
}

// Bad - unclear assertion
if got != want {
    t.Error("failed")
}

// Better - use testing helpers
assertEqual(t, got, want, "GetUser(%d)", userID)
```

---

## Example Test Checklist

When implementing a new RPC method, ensure you have:

- [ ] Unit tests for all validation logic
- [ ] Unit tests for error cases (at least 3-5)
- [ ] Unit tests for edge cases (empty input, max values, etc.)
- [ ] Integration test for success case
- [ ] Integration test for duplicate/conflict
- [ ] Integration test for invalid input
- [ ] Integration test verifying database state
- [ ] Integration test verifying side effects (emails, logs, etc.)
- [ ] All tests pass consistently (no flakes)
- [ ] Coverage > 80% for new code

---

## Resources

- [Go Testing Package](https://pkg.go.dev/testing)
- [Table-Driven Tests](https://github.com/golang/go/wiki/TableDrivenTests)
- [Testify](https://github.com/stretchr/testify) - Popular testing toolkit
- [Go Test Comments](https://go.dev/blog/subtests)

---

For gRPC-specific testing, see [GRPC_TESTING.md](./GRPC_TESTING.md).
