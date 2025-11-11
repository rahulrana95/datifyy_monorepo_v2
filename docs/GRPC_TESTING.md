# gRPC Testing Guide

Complete guide for testing gRPC endpoints using various tools and methods.

## Table of Contents

- [Overview](#overview)
- [Available Tools](#available-tools)
- [grpcui - Web Interface](#grpcui---web-interface)
- [grpcurl - Command Line](#grpcurl---command-line)
- [Buf CLI](#buf-cli)
- [Postman](#postman)
- [Browser Test Page](#browser-test-page)
- [Testing Workflows](#testing-workflows)
- [Troubleshooting](#troubleshooting)

---

## Overview

The backend exposes two servers simultaneously:

- **gRPC Server**: `localhost:9090` (primary interface)
- **HTTP REST Server**: `localhost:8080` (REST wrappers)

All testing tools connect to the gRPC server which has **server reflection enabled**, allowing automatic service discovery.

---

## Available Tools

| Tool | Type | Best For | Installation |
|------|------|----------|--------------|
| **Buf Studio** | Web | Official Buf web UI, modern interface | `brew install bufbuild/buf/buf` |
| **grpcui** | Web UI | Interactive testing, exploration | `brew install grpcui` |
| **grpcurl** | CLI | Automation, scripts, CI/CD | `brew install grpcurl` |
| **Buf CLI** | CLI | Schema-first development | `brew install bufbuild/buf/buf` |
| **Postman** | GUI | Complex workflows, collections | Download from postman.com |
| **Browser** | Web | Quick REST testing | No install (built-in) |

---

## Buf Studio - Official Web UI

**Best for**: Modern, official Buf interface with excellent UX

### How It Works

Buf Studio is a web application that requires a local agent to connect to your gRPC server:

```
Web Browser (https://studio.buf.build)
         ↓
Buf Studio Agent (localhost:8081) ← Proxy
         ↓
Your gRPC Server (localhost:9090)
```

### Quick Start

**Terminal 1** - Start the agent:
```bash
make buf-studio-agent
```

**Terminal 2** - Open Buf Studio:
```bash
make buf-studio
```

Or manually:
```bash
# Start agent
buf beta studio-agent --port 8081 --private-network

# Open Buf Studio
open https://studio.buf.build
```

### Using Buf Studio

#### 1. Connect to Agent

In the Buf Studio web interface:
- Look for the **"Target"** input at the top
- Enter: `http://localhost:8081`
- Click **"Connect"**

#### 2. Select Service

- Left sidebar shows all available services
- Expand `datifyy.auth.v1.AuthService`
- You'll see all 26 methods

#### 3. Test an Endpoint

Click on `RegisterWithEmail`:

**Request**:
```json
{
  "credentials": {
    "email": "bufstudio@example.com",
    "password": "TestPass123*",
    "name": "Buf Studio User"
  }
}
```

Click **"Send"** → See formatted response below

### Features

✅ **Modern UI** - Clean, intuitive interface
✅ **Real-time validation** - Proto-aware autocomplete
✅ **Request history** - Save and replay requests
✅ **Error handling** - Clear error messages
✅ **Metadata support** - Add headers easily
✅ **Streaming support** - Handle streaming RPCs

### Troubleshooting

**Connection refused**:
```bash
# Verify agent is running
lsof -ti:8081

# Restart agent
make buf-studio-agent
```

**CORS errors**:
Make sure you used `--private-network` flag (already in Makefile command)

**Can't see services**:
Check that your gRPC server has reflection enabled (it does!)

### Stop the Agent

```bash
# Find and kill the agent process
lsof -ti:8081 | xargs kill
```

---

## grpcui - Web Interface

**Best for**: Interactive testing and exploring available services

### Installation

```bash
brew install grpcui
```

### Launch grpcui

```bash
# Start grpcui (opens in browser automatically)
grpcui -plaintext localhost:9090
```

Or use the Makefile command:
```bash
make grpc-ui
```

### Using grpcui

#### 1. Select Service

![grpcui interface]

- Left sidebar shows all available services
- Expand `datifyy.auth.v1.AuthService` to see all 26 methods
- Click on any method (e.g., `RegisterWithEmail`)

#### 2. Fill Request

The right panel shows an interactive form based on the proto definition:

```
Method name: RegisterWithEmail

Request data:
{
  "credentials": {
    "email": "",           ← Fill this
    "password": "",        ← Fill this
    "name": "",           ← Fill this
    "device_info": {      ← Optional
      "platform": 0,
      "device_name": "",
      "os_version": "",
      "device_id": ""
    }
  }
}
```

**Example values**:
```json
{
  "credentials": {
    "email": "grpcui@example.com",
    "password": "TestPass123*",
    "name": "gRPC UI User",
    "device_info": {
      "platform": 1,
      "device_name": "Chrome Browser",
      "os_version": "macOS 13",
      "device_id": "browser-12345"
    }
  }
}
```

#### 3. Invoke

- Click **"Invoke"** button
- Response appears in the panel below
- View formatted JSON with syntax highlighting

#### 4. Advanced Features

**Request Metadata** (Headers):
```
Authorization: Bearer <token>
```

**Copy as grpcurl**:
- Click "Copy as grpcurl" to get CLI command
- Useful for automation

**Request History**:
- Previous requests are saved
- Re-run with one click

### Common Use Cases

**Test Registration**:
```
Service: datifyy.auth.v1.AuthService
Method: RegisterWithEmail
Data: { "credentials": { "email": "test@example.com", "password": "Pass123!", "name": "Test User" } }
```

**Test Login** (after implementing):
```
Service: datifyy.auth.v1.AuthService
Method: LoginWithEmail
Data: { "credentials": { "email": "test@example.com", "password": "Pass123!" } }
```

**Explore All Methods**:
- Click through all 26 methods in AuthService
- See request/response structures
- Understand what's already implemented

---

## grpcurl - Command Line

**Best for**: Automation, scripts, CI/CD pipelines

### Installation

```bash
brew install grpcurl
```

### Basic Usage

#### List All Services

```bash
grpcurl -plaintext localhost:9090 list
```

Output:
```
datifyy.auth.v1.AuthService
grpc.reflection.v1.ServerReflection
grpc.reflection.v1alpha.ServerReflection
```

#### List Service Methods

```bash
grpcurl -plaintext localhost:9090 list datifyy.auth.v1.AuthService
```

Output:
```
datifyy.auth.v1.AuthService.RegisterWithEmail
datifyy.auth.v1.AuthService.LoginWithEmail
datifyy.auth.v1.AuthService.RefreshToken
... (23 more methods)
```

#### Describe a Method

```bash
grpcurl -plaintext localhost:9090 describe datifyy.auth.v1.AuthService.RegisterWithEmail
```

Output shows full proto definition:
```
datifyy.auth.v1.AuthService.RegisterWithEmail is a method:
rpc RegisterWithEmail ( .datifyy.auth.v1.RegisterWithEmailRequest ) returns ( .datifyy.auth.v1.RegisterWithEmailResponse );
```

#### Invoke a Method

**Using inline JSON**:
```bash
# Note: Special characters need proper escaping or use heredoc
echo '{"credentials":{"email":"test@example.com","password":"TestPass123*","name":"Test User"}}' | \
  grpcurl -plaintext -d @ localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail
```

**Using heredoc** (recommended for complex JSON):
```bash
grpcurl -plaintext -d @ localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail <<EOF
{
  "credentials": {
    "email": "grpcurl@example.com",
    "password": "TestPass123*",
    "name": "gRPC URL User"
  }
}
EOF
```

**From a file**:
```bash
# Create request file
cat > request.json <<EOF
{
  "credentials": {
    "email": "file@example.com",
    "password": "TestPass123*",
    "name": "From File User"
  }
}
EOF

# Use the file
grpcurl -plaintext -d @request.json localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail
```

### Advanced Usage

#### With Authentication Headers

```bash
grpcurl -plaintext \
  -H "Authorization: Bearer <access_token>" \
  -d '{"credentials":{...}}' \
  localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail
```

#### Format Output

```bash
# Pretty print (default)
grpcurl -plaintext -d @request.json localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail

# Compact JSON
grpcurl -plaintext -format text -d @request.json localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail
```

#### Save Response to File

```bash
grpcurl -plaintext -d @request.json localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail > response.json
```

### Testing Script Example

```bash
#!/bin/bash

# Test script for auth endpoints

echo "Testing RegisterWithEmail..."
grpcurl -plaintext -d @ localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail <<EOF
{
  "credentials": {
    "email": "script@example.com",
    "password": "TestPass123*",
    "name": "Script Test User"
  }
}
EOF

if [ $? -eq 0 ]; then
    echo "✅ Registration successful"
else
    echo "❌ Registration failed"
    exit 1
fi

echo "Testing LoginWithEmail..."
# Add login test here...
```

---

## Buf CLI

**Best for**: Schema-first development, proto validation

### Installation

```bash
brew install bufbuild/buf/buf
```

### Verify Installation

```bash
buf --version
```

### Using Buf

#### Lint Proto Files

```bash
cd proto
buf lint
```

#### Check for Breaking Changes

```bash
buf breaking --against '.git#branch=main'
```

#### Call gRPC Endpoints

```bash
buf curl --schema proto --reflect http://localhost:9090 \
  datifyy.auth.v1.AuthService/RegisterWithEmail \
  -d '{
    "credentials": {
      "email": "buf@example.com",
      "password": "TestPass123*",
      "name": "Buf User"
    }
  }'
```

#### List Methods

```bash
buf curl --schema proto --reflect http://localhost:9090 --list-methods
```

---

## Postman

**Best for**: Complex workflows, test collections, team collaboration

### Setup

1. **Download Postman**: https://www.postman.com/downloads/
2. **Create New gRPC Request**:
   - Click "New" → "gRPC Request"
3. **Configure Server**:
   - Server URL: `localhost:9090`
   - Enable "Use server reflection"

### Using Postman

#### 1. Select Method

- Service dropdown: `datifyy.auth.v1.AuthService`
- Method dropdown: `RegisterWithEmail`

#### 2. Set Request Body

Switch to "Message" tab:
```json
{
  "credentials": {
    "email": "postman@example.com",
    "password": "TestPass123*",
    "name": "Postman User"
  }
}
```

#### 3. Invoke

- Click "Invoke"
- View response in lower panel

#### 4. Save to Collection

- Save request for reuse
- Create test suites
- Share with team

### Advantages

- GUI-based (user-friendly)
- Save and organize requests
- Collection runner for automated tests
- Environment variables
- Pre-request scripts
- Tests/assertions

---

## Browser Test Page

**Best for**: Quick REST API testing (uses HTTP wrapper, not pure gRPC)

### Open Test Page

```bash
open grpc-test.html
```

Or navigate to:
```
file:///Users/rahulrana/repo/datifyy_monorepo_v2/grpc-test.html
```

### Features

- 🎨 User-friendly form interface
- ✅ Input validation
- 📊 Formatted JSON responses
- 🔴 Error handling
- 🚀 Tests REST endpoint (port 8080)

**Note**: This tests the HTTP REST wrapper, not the pure gRPC endpoint. Use grpcui/grpcurl for pure gRPC testing.

---

## Testing Workflows

### 1. Quick Manual Test

**Goal**: Quickly verify an endpoint works

**Tool**: grpcui

```bash
make grpc-ui
# Or: grpcui -plaintext localhost:9090
```

1. Select service and method
2. Fill in test data
3. Click Invoke
4. Verify response

---

### 2. Automated Testing

**Goal**: Run tests in CI/CD

**Tool**: grpcurl + bash script

```bash
#!/bin/bash
# test_auth.sh

# Test registration
RESPONSE=$(grpcurl -plaintext -d '{"credentials":{"email":"ci@example.com","password":"Pass123!","name":"CI User"}}' \
  localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail 2>&1)

if echo "$RESPONSE" | grep -q "user_id"; then
    echo "✅ Registration test passed"
else
    echo "❌ Registration test failed"
    echo "$RESPONSE"
    exit 1
fi
```

---

### 3. Load Testing

**Goal**: Test performance under load

**Tool**: ghz (gRPC load testing tool)

```bash
# Install ghz
brew install ghz

# Run load test
ghz --insecure \
  --proto proto/auth/v1/auth.proto \
  --import-paths proto \
  --call datifyy.auth.v1.AuthService/RegisterWithEmail \
  -d '{"credentials":{"email":"load@example.com","password":"Pass123!","name":"Load Test"}}' \
  -n 1000 \
  -c 50 \
  localhost:9090
```

Output shows requests/sec, latency percentiles, etc.

---

### 4. Integration Tests

**Goal**: Test full workflows

**Tool**: Go integration tests

See [TESTING.md](./TESTING.md) for details.

```go
func TestRegistrationAndLogin(t *testing.T) {
    // 1. Register user
    regResp := registerUser(t, "test@example.com", "Pass123!")

    // 2. Login with credentials
    loginResp := loginUser(t, "test@example.com", "Pass123!")

    // 3. Verify tokens match user
    assert.Equal(t, regResp.User.UserId, loginResp.User.UserId)
}
```

---

## Troubleshooting

### Connection Refused

```
Error: connection refused
```

**Solution**:
```bash
# Verify server is running
docker-compose ps backend

# Check logs
docker-compose logs backend

# Restart if needed
docker-compose restart backend
```

### Server Reflection Not Available

```
Error: server does not support the reflection API
```

**Solution**: Server reflection is already enabled in main.go:
```go
reflection.Register(grpcServer)
```

If still failing, check if gRPC server started:
```bash
docker-compose logs backend | grep "gRPC server listening"
```

### Method Not Found

```
Error: unknown service or method
```

**Solution**:
```bash
# List available methods
grpcurl -plaintext localhost:9090 list datifyy.auth.v1.AuthService

# Verify correct spelling
grpcurl -plaintext localhost:9090 describe datifyy.auth.v1.AuthService.RegisterWithEmail
```

### Invalid JSON

```
Error: invalid character '!' in string escape code
```

**Solution**: Use heredoc to avoid shell escaping issues:
```bash
grpcurl -plaintext -d @ localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail <<'EOF'
{
  "credentials": {
    "password": "With!Special@Chars"
  }
}
EOF
```

### Port Already in Use

```
Error: bind: address already in use
```

**Solution**:
```bash
# Find process using port 9090
lsof -ti:9090 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "9091:9090"  # Map to different host port
```

### CORS Issues (grpcui)

grpcui runs locally and connects directly to the gRPC server - CORS doesn't apply. If you see CORS errors, you're likely hitting the HTTP server instead.

**Verify**:
```bash
# Correct (grpcui on port 9090)
grpcui -plaintext localhost:9090

# Wrong (HTTP server, will fail)
# Don't do this: grpcui http://localhost:8080
```

---

## Quick Reference

### Common Commands

```bash
# Start gRPC UI
make grpc-ui
# Or: grpcui -plaintext localhost:9090

# List services
grpcurl -plaintext localhost:9090 list

# List methods
grpcurl -plaintext localhost:9090 list datifyy.auth.v1.AuthService

# Describe method
grpcurl -plaintext localhost:9090 describe datifyy.auth.v1.AuthService.RegisterWithEmail

# Call method
echo '{"credentials":{...}}' | grpcurl -plaintext -d @ localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail

# Buf curl
buf curl --reflect http://localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail -d '{...}'
```

### Test Data Templates

**RegisterWithEmail**:
```json
{
  "credentials": {
    "email": "unique@example.com",
    "password": "ValidPass123!",
    "name": "Test User"
  }
}
```

**LoginWithEmail** (when implemented):
```json
{
  "credentials": {
    "email": "existing@example.com",
    "password": "ValidPass123!"
  }
}
```

---

## Resources

- [grpcui GitHub](https://github.com/fullstorydev/grpcui)
- [grpcurl GitHub](https://github.com/fullstorydev/grpcurl)
- [Buf Documentation](https://buf.build/docs)
- [gRPC Testing Best Practices](https://grpc.io/docs/guides/testing/)

---

**Next Steps**:
- See [DEVELOPMENT.md](./DEVELOPMENT.md) for adding new RPC methods
- See [TESTING.md](./TESTING.md) for writing automated tests
