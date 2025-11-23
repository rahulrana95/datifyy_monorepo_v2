# Rate Limiting

The Datifyy backend implements comprehensive rate limiting to protect against abuse and ensure fair resource allocation across all users.

## Overview

The rate limiting system provides:
- **Per-endpoint limits**: Different endpoints have different rate limits based on their sensitivity and resource requirements
- **Dual-layer limiting**: Both IP-based and user-based rate limiting
- **Flexible configuration**: Rate limits can be updated at deployment time without code changes
- **Redis-backed**: Distributed rate limiting across multiple server instances
- **Graceful fallback**: Local token bucket algorithm when Redis is unavailable

## Rate Limit Tiers

### Admin Endpoints (400 requests/minute)
Admin users get 4x the rate of normal users to support administrative workflows.

**Endpoints:**
- `/api/v1/admin/users` - User management
- `/api/v1/admin/users/search` - User search
- `/api/v1/admin/users/bulk` - Bulk user operations
- `/api/v1/admin/dates` - Date management
- `/api/v1/admin/suggestions/` - Date suggestions
- `/api/v1/admin/curation/candidates` - Curation candidates
- `/api/v1/admin/analytics/*` - All analytics endpoints
  - `/platform`, `/user-growth`, `/active-users`, `/signups`
  - `/demographics`, `/locations`, `/availability`
- `/api/v1/admin/admins` - Admin management
- `/api/v1/admin/profile` - Admin profile updates
- `/api/v1/slack/*` - All Slack notification endpoints

### User Endpoints (100 requests/minute)
Standard rate for authenticated user operations.

**Endpoints:**
- `/api/v1/user/me` - User profile
- `/api/v1/partner-preferences` - Partner preferences
- `/api/v1/availability` - Availability management
- All other unspecified endpoints (default)

### AI Endpoints (100 requests/minute)
Resource-intensive AI operations have moderate limits.

**Endpoints:**
- `/api/v1/admin/curation/analyze` - AI-powered date curation

### Authentication Endpoints (Restrictive)
Security-critical endpoints have very restrictive limits.

**Endpoints:**
- `/api/v1/auth/register/email` - 5 requests per 15 minutes
- `/api/v1/auth/login/email` - 10 requests per 15 minutes
- `/api/v1/admin/login` - 10 requests per 15 minutes
- `/api/v1/auth/token/refresh` - 20 requests per minute
- `/api/v1/auth/token/revoke` - 20 requests per minute

## Response Headers

All rate-limited responses include the following headers:

```http
X-RateLimit-Limit: 100              # Maximum requests allowed in window
X-RateLimit-Remaining: 95           # Requests remaining in current window
X-RateLimit-Reset: 1234567890       # Unix timestamp when window resets
```

When rate limit is exceeded (HTTP 429):
```http
Retry-After: 45                     # Seconds until you can retry
```

## Rate Limit Exceeded Response

When a client exceeds their rate limit, they receive:

**Status Code:** `429 Too Many Requests`

**Response Body:**
```
Rate limit exceeded. Please try again later.
```

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
Retry-After: 45
```

## Implementation Details

### Architecture

The rate limiter uses a **sliding window** approach with two backend implementations:

1. **Redis (Primary)**: For distributed rate limiting across multiple servers
   - Uses Redis INCR with TTL
   - Automatically syncs across all backend instances
   - Handles high-concurrency scenarios efficiently

2. **Token Bucket (Fallback)**: When Redis is unavailable
   - In-memory token bucket algorithm
   - Per-process limiting only
   - Automatic refill based on time elapsed

### IP vs User-Based Limiting

The system applies rate limits based on two identifiers:

**IP-Based Limiting:**
- Used for unauthenticated endpoints (auth, registration)
- Extracts IP from headers: `X-Forwarded-For`, `X-Real-IP`, or `RemoteAddr`
- Prevents abuse from single sources

**User-Based Limiting:**
- Used for authenticated endpoints
- Requires user ID in request context (set by auth middleware)
- Prevents abuse from authenticated accounts

**Both Applied:**
- Most endpoints check both IP and user limits
- Request must pass BOTH checks to proceed
- Provides defense in depth

### Configuring Rate Limits

#### At Application Startup

Rate limits are configured in `internal/middleware/rate_limiter.go`:

```go
// Create custom rate limit config
customConfig := &RateLimitConfig{
    RequestsPerWindow: 50,              // 50 requests
    WindowDuration:    1 * time.Minute, // per minute
    EnableUserLimit:   true,            // Check user ID
    EnableIPLimit:     true,            // Check IP address
}

// Apply to specific endpoint
rateLimiter.endpointLimits.SetLimit("/api/v1/custom/endpoint", customConfig)
```

#### At Deployment Time

Update limits without redeploying:

```go
// Prepare new limits
newLimits := map[string]*RateLimitConfig{
    "/api/v1/some/endpoint": {
        RequestsPerWindow: 200,
        WindowDuration:    1 * time.Minute,
        EnableUserLimit:   true,
        EnableIPLimit:     true,
    },
}

// Apply dynamically
rateLimiter.UpdateLimits(newLimits)
```

## Monitoring

### Check Current Rate Limit Stats

For Redis-backed rate limiting, you can query current stats:

```go
ctx := context.Background()
key := "ratelimit:ip:/api/v1/user/me:192.168.1.1"

count, ttl, err := rateLimiter.GetStats(ctx, key)
if err != nil {
    log.Printf("Error getting stats: %v", err)
}

log.Printf("Requests: %d, Reset in: %v", count, ttl)
```

### Redis Keys

Rate limit counters are stored in Redis with the following key patterns:

```
ratelimit:ip:<endpoint>:<ip_address>
ratelimit:user:<endpoint>:<user_id>
```

Examples:
```
ratelimit:ip:/api/v1/user/me:192.168.1.100
ratelimit:user:/api/v1/admin/users:user-123-abc
```

### Monitoring Dashboard

To monitor rate limiting in production:

1. **Redis monitoring**: Track key counts and expiry times
2. **HTTP 429 responses**: Monitor frequency of rate limit exceeded errors
3. **Response headers**: Check `X-RateLimit-*` headers in logs
4. **User feedback**: Monitor support tickets related to rate limiting

## Best Practices

### For API Clients

1. **Respect rate limit headers**: Always check `X-RateLimit-Remaining`
2. **Implement exponential backoff**: When you receive 429, wait before retrying
3. **Use `Retry-After` header**: Wait at least the specified number of seconds
4. **Batch operations**: Combine multiple operations when possible
5. **Cache responses**: Don't repeatedly fetch the same data

### For Backend Developers

1. **Set appropriate limits**: Balance security and usability
2. **Use tiered limits**: Different limits for different user types
3. **Monitor 429 responses**: High rates may indicate need for limit adjustment
4. **Document limits**: Keep this file up to date with current limits
5. **Test rate limits**: Ensure limits work as expected in tests

### Example Client Implementation

```javascript
async function makeRequest(url, options = {}) {
  const response = await fetch(url, options);

  // Check if rate limited
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After')) || 60;
    console.log(`Rate limited. Retrying after ${retryAfter} seconds`);

    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return makeRequest(url, options);
  }

  // Log remaining requests
  const remaining = response.headers.get('X-RateLimit-Remaining');
  console.log(`Rate limit remaining: ${remaining}`);

  return response;
}
```

## Testing

### Unit Tests

Run the rate limiter test suite:

```bash
go test ./internal/middleware/... -v
```

### Integration Testing

Test rate limits manually:

```bash
# Test user endpoint (100 req/min)
curl -i http://localhost:8080/api/v1/user/me

# Test admin endpoint (400 req/min)
curl -i http://localhost:8080/api/v1/admin/users

# Test auth endpoint (10 req/15min)
curl -i http://localhost:8080/api/v1/auth/login/email
```

### Load Testing

Test rate limiting under load:

```bash
# Send 150 requests rapidly (should get 429 after 100)
for i in {1..150}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/health
done | sort | uniq -c
```

Expected output:
```
    100 200
     50 429
```

## Troubleshooting

### Issue: All requests getting 429

**Possible causes:**
- Redis connection issues (falling back to local limiter with low limits)
- Shared IP address (multiple users behind same proxy)
- Clock skew (time-based calculations incorrect)

**Solutions:**
- Check Redis connection: `docker-compose logs redis`
- Verify Redis client in logs: Look for "Connected to Redis"
- Check for `X-Forwarded-For` header configuration
- Verify system time is synchronized

### Issue: Rate limits not being applied

**Possible causes:**
- Middleware not registered in correct order
- Endpoint path doesn't match configured path
- Redis down and local limiter not initialized

**Solutions:**
- Check middleware order in `main.go`
- Verify exact endpoint path (including trailing slashes)
- Check logs for "Rate limiter initialized"
- Test with direct Redis commands

### Issue: Different limits on different servers

**Possible causes:**
- Redis not shared between instances
- Local limiter being used instead of Redis
- Different configurations deployed

**Solutions:**
- Ensure all servers connect to same Redis instance
- Check REDIS_URL environment variable
- Verify deployment consistency

## Environment Variables

Rate limiting respects the following environment variables:

```bash
# Redis connection (required for distributed rate limiting)
REDIS_URL=redis://localhost:6379
```

If `REDIS_URL` is not set or Redis is unavailable, the system falls back to local in-memory rate limiting.

## Future Enhancements

Planned improvements to the rate limiting system:

- [ ] Dynamic rate limit adjustment based on server load
- [ ] Per-user rate limit overrides (VIP users)
- [ ] Rate limit analytics dashboard
- [ ] Burst allowance for short spikes
- [ ] Geographic rate limiting
- [ ] API key-based rate limiting
- [ ] Rate limit bypass for internal services

## References

- Implementation: `apps/backend/internal/middleware/rate_limiter.go`
- Tests: `apps/backend/internal/middleware/rate_limiter_test.go`
- Integration: `apps/backend/cmd/server/main.go:180-183`
- Algorithm: Token Bucket (local), Sliding Window (Redis)
