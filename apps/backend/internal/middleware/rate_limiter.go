package middleware

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

// RateLimitConfig holds configuration for rate limiting
type RateLimitConfig struct {
	// Requests per window
	RequestsPerWindow int
	// Window duration
	WindowDuration time.Duration
	// Enable user-based limiting (requires authentication)
	EnableUserLimit bool
	// Enable IP-based limiting
	EnableIPLimit bool
}

// EndpointLimits stores rate limit configurations for different endpoints
type EndpointLimits struct {
	mu            sync.RWMutex
	limits        map[string]*RateLimitConfig
	defaultConfig *RateLimitConfig
}

// RateLimiter implements rate limiting middleware
type RateLimiter struct {
	redis           *redis.Client
	endpointLimits  *EndpointLimits
	enableRedis     bool
	localLimiters   sync.Map // Fallback for when Redis is unavailable
}

// tokenBucket represents a simple token bucket for local rate limiting
type tokenBucket struct {
	tokens         int
	lastRefillTime time.Time
	maxTokens      int
	refillRate     time.Duration
	mu             sync.Mutex
}

// NewRateLimiter creates a new rate limiter middleware
func NewRateLimiter(redisClient *redis.Client) *RateLimiter {
	defaultConfig := &RateLimitConfig{
		RequestsPerWindow: 100,                // 100 requests
		WindowDuration:    1 * time.Minute,    // per minute
		EnableUserLimit:   true,
		EnableIPLimit:     true,
	}

	endpointLimits := &EndpointLimits{
		limits:        make(map[string]*RateLimitConfig),
		defaultConfig: defaultConfig,
	}

	// Admin endpoints config (4x normal user rate)
	adminConfig := &RateLimitConfig{
		RequestsPerWindow: 400, // 4x normal users
		WindowDuration:    1 * time.Minute,
		EnableUserLimit:   true,
		EnableIPLimit:     true,
	}

	// Auth endpoints (restrictive for security)
	endpointLimits.SetLimit("/api/v1/auth/register/email", &RateLimitConfig{
		RequestsPerWindow: 5,
		WindowDuration:    15 * time.Minute,
		EnableUserLimit:   false, // Not authenticated yet
		EnableIPLimit:     true,
	})

	endpointLimits.SetLimit("/api/v1/auth/login/email", &RateLimitConfig{
		RequestsPerWindow: 10,
		WindowDuration:    15 * time.Minute,
		EnableUserLimit:   false, // Not authenticated yet
		EnableIPLimit:     true,
	})

	endpointLimits.SetLimit("/api/v1/auth/token/refresh", &RateLimitConfig{
		RequestsPerWindow: 20,
		WindowDuration:    1 * time.Minute,
		EnableUserLimit:   true,
		EnableIPLimit:     true,
	})

	endpointLimits.SetLimit("/api/v1/auth/token/revoke", &RateLimitConfig{
		RequestsPerWindow: 20,
		WindowDuration:    1 * time.Minute,
		EnableUserLimit:   true,
		EnableIPLimit:     true,
	})

	// User endpoints (normal rate)
	endpointLimits.SetLimit("/api/v1/user/me", defaultConfig)
	endpointLimits.SetLimit("/api/v1/partner-preferences", defaultConfig)
	endpointLimits.SetLimit("/api/v1/availability", defaultConfig)

	// Admin authentication
	endpointLimits.SetLimit("/api/v1/admin/login", &RateLimitConfig{
		RequestsPerWindow: 10,
		WindowDuration:    15 * time.Minute,
		EnableUserLimit:   false,
		EnableIPLimit:     true,
	})

	// Admin user management endpoints
	endpointLimits.SetLimit("/api/v1/admin/users", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/users/search", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/users/bulk", adminConfig)

	// Admin date management
	endpointLimits.SetLimit("/api/v1/admin/dates", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/suggestions/", adminConfig)

	// Admin curation endpoints (AI-powered, slightly more restrictive)
	endpointLimits.SetLimit("/api/v1/admin/curation/candidates", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/curation/analyze", &RateLimitConfig{
		RequestsPerWindow: 100, // AI endpoint, more restrictive than general admin
		WindowDuration:    1 * time.Minute,
		EnableUserLimit:   true,
		EnableIPLimit:     true,
	})

	// Admin analytics endpoints
	endpointLimits.SetLimit("/api/v1/admin/analytics/platform", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/analytics/user-growth", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/analytics/active-users", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/analytics/signups", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/analytics/demographics", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/analytics/locations", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/analytics/availability", adminConfig)

	// Admin management endpoints
	endpointLimits.SetLimit("/api/v1/admin/admins", adminConfig)
	endpointLimits.SetLimit("/api/v1/admin/profile", adminConfig)

	// Slack endpoints
	endpointLimits.SetLimit("/api/v1/slack/send", adminConfig)
	endpointLimits.SetLimit("/api/v1/slack/alert", adminConfig)
	endpointLimits.SetLimit("/api/v1/slack/notification", adminConfig)
	endpointLimits.SetLimit("/api/v1/slack/test", adminConfig)

	return &RateLimiter{
		redis:          redisClient,
		endpointLimits: endpointLimits,
		enableRedis:    redisClient != nil,
	}
}

// SetLimit sets rate limit configuration for a specific endpoint
func (el *EndpointLimits) SetLimit(endpoint string, config *RateLimitConfig) {
	el.mu.Lock()
	defer el.mu.Unlock()
	el.limits[endpoint] = config
}

// GetLimit retrieves rate limit configuration for an endpoint
func (el *EndpointLimits) GetLimit(endpoint string) *RateLimitConfig {
	el.mu.RLock()
	defer el.mu.RUnlock()

	if config, exists := el.limits[endpoint]; exists {
		return config
	}
	return el.defaultConfig
}

// UpdateLimits updates multiple endpoint limits (for deployment-time config updates)
func (rl *RateLimiter) UpdateLimits(limits map[string]*RateLimitConfig) {
	rl.endpointLimits.mu.Lock()
	defer rl.endpointLimits.mu.Unlock()

	for endpoint, config := range limits {
		rl.endpointLimits.limits[endpoint] = config
	}
}

// Middleware returns an HTTP middleware function for rate limiting
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get rate limit config for this endpoint
		config := rl.endpointLimits.GetLimit(r.URL.Path)

		// Check rate limits
		allowed, retryAfter := rl.checkRateLimit(r, config)
		if !allowed {
			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", config.RequestsPerWindow))
			w.Header().Set("X-RateLimit-Remaining", "0")
			w.Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(retryAfter).Unix()))
			w.Header().Set("Retry-After", fmt.Sprintf("%d", int(retryAfter.Seconds())))

			http.Error(w, "Rate limit exceeded. Please try again later.", http.StatusTooManyRequests)
			return
		}

		// Set rate limit headers
		w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", config.RequestsPerWindow))

		next.ServeHTTP(w, r)
	})
}

// checkRateLimit checks if the request should be rate limited
func (rl *RateLimiter) checkRateLimit(r *http.Request, config *RateLimitConfig) (bool, time.Duration) {
	ctx := r.Context()

	// Build keys for rate limiting
	var keys []string

	// IP-based key
	if config.EnableIPLimit {
		ip := getClientIP(r)
		ipKey := fmt.Sprintf("ratelimit:ip:%s:%s", r.URL.Path, ip)
		keys = append(keys, ipKey)
	}

	// User-based key (if authenticated)
	if config.EnableUserLimit {
		userID := getUserID(r)
		if userID != "" {
			userKey := fmt.Sprintf("ratelimit:user:%s:%s", r.URL.Path, userID)
			keys = append(keys, userKey)
		}
	}

	// Check each key
	for _, key := range keys {
		allowed, retryAfter := rl.checkKey(ctx, key, config)
		if !allowed {
			return false, retryAfter
		}
	}

	return true, 0
}

// checkKey checks rate limit for a specific key
func (rl *RateLimiter) checkKey(ctx context.Context, key string, config *RateLimitConfig) (bool, time.Duration) {
	if rl.enableRedis {
		return rl.checkRedis(ctx, key, config)
	}
	return rl.checkLocal(key, config)
}

// checkRedis uses Redis for distributed rate limiting
func (rl *RateLimiter) checkRedis(ctx context.Context, key string, config *RateLimitConfig) (bool, time.Duration) {
	// Use Redis INCR with expiry for sliding window
	pipe := rl.redis.Pipeline()

	incrCmd := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, config.WindowDuration)

	_, err := pipe.Exec(ctx)
	if err != nil {
		// Fallback to local limiting if Redis fails
		return rl.checkLocal(key, config)
	}

	count := incrCmd.Val()

	if count > int64(config.RequestsPerWindow) {
		// Get TTL for retry-after header
		ttl := rl.redis.TTL(ctx, key).Val()
		if ttl < 0 {
			ttl = config.WindowDuration
		}
		return false, ttl
	}

	return true, 0
}

// checkLocal uses in-memory token bucket for rate limiting
func (rl *RateLimiter) checkLocal(key string, config *RateLimitConfig) (bool, time.Duration) {
	bucketInterface, _ := rl.localLimiters.LoadOrStore(key, &tokenBucket{
		tokens:         config.RequestsPerWindow,
		lastRefillTime: time.Now(),
		maxTokens:      config.RequestsPerWindow,
		refillRate:     config.WindowDuration,
	})

	bucket := bucketInterface.(*tokenBucket)
	return bucket.take()
}

// take attempts to take a token from the bucket
func (tb *tokenBucket) take() (bool, time.Duration) {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	// Refill tokens based on time passed
	now := time.Now()
	timePassed := now.Sub(tb.lastRefillTime)

	if timePassed >= tb.refillRate {
		tb.tokens = tb.maxTokens
		tb.lastRefillTime = now
	}

	if tb.tokens > 0 {
		tb.tokens--
		return true, 0
	}

	// Calculate retry-after duration
	retryAfter := tb.refillRate - timePassed
	return false, retryAfter
}

// getClientIP extracts the client IP address from the request
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header (for proxies/load balancers)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// Take the first IP in the list
		return xff
	}

	// Check X-Real-IP header
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}

	// Fallback to RemoteAddr
	return r.RemoteAddr
}

// getUserID extracts the user ID from the request context (set by auth middleware)
func getUserID(r *http.Request) string {
	// This assumes auth middleware sets "user_id" in context
	// Adjust based on your actual auth implementation
	if userID := r.Context().Value("user_id"); userID != nil {
		if uid, ok := userID.(string); ok {
			return uid
		}
	}
	return ""
}

// GetStats returns current rate limit statistics (for monitoring/debugging)
func (rl *RateLimiter) GetStats(ctx context.Context, key string) (int64, time.Duration, error) {
	if !rl.enableRedis {
		return 0, 0, fmt.Errorf("stats only available with Redis backend")
	}

	count, err := rl.redis.Get(ctx, key).Int64()
	if err == redis.Nil {
		return 0, 0, nil
	}
	if err != nil {
		return 0, 0, err
	}

	ttl := rl.redis.TTL(ctx, key).Val()
	return count, ttl, nil
}
