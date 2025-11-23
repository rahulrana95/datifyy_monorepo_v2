package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestNewRateLimiter(t *testing.T) {
	rl := NewRateLimiter(nil)

	if rl == nil {
		t.Fatal("NewRateLimiter returned nil")
	}

	if rl.endpointLimits == nil {
		t.Fatal("endpointLimits is nil")
	}

	if rl.endpointLimits.defaultConfig == nil {
		t.Fatal("default config is nil")
	}

	// Check default config
	if rl.endpointLimits.defaultConfig.RequestsPerWindow != 100 {
		t.Errorf("Expected default RequestsPerWindow=100, got %d", rl.endpointLimits.defaultConfig.RequestsPerWindow)
	}
}

func TestEndpointLimitsGetLimit(t *testing.T) {
	rl := NewRateLimiter(nil)

	// Test getting configured endpoint limit
	config := rl.endpointLimits.GetLimit("/api/v1/auth/login/email")
	if config.RequestsPerWindow != 10 {
		t.Errorf("Expected login endpoint to have 10 requests per window, got %d", config.RequestsPerWindow)
	}

	// Test getting default limit for unconfigured endpoint
	config = rl.endpointLimits.GetLimit("/api/v1/some/other/endpoint")
	if config.RequestsPerWindow != 100 {
		t.Errorf("Expected default 100 requests per window, got %d", config.RequestsPerWindow)
	}
}

func TestRateLimiterSetLimit(t *testing.T) {
	rl := NewRateLimiter(nil)

	newConfig := &RateLimitConfig{
		RequestsPerWindow: 5,
		WindowDuration:    10 * time.Second,
		EnableUserLimit:   true,
		EnableIPLimit:     false,
	}

	rl.endpointLimits.SetLimit("/api/v1/test/endpoint", newConfig)

	config := rl.endpointLimits.GetLimit("/api/v1/test/endpoint")
	if config.RequestsPerWindow != 5 {
		t.Errorf("Expected 5 requests per window, got %d", config.RequestsPerWindow)
	}
	if config.WindowDuration != 10*time.Second {
		t.Errorf("Expected 10s window, got %v", config.WindowDuration)
	}
}

func TestRateLimiterUpdateLimits(t *testing.T) {
	rl := NewRateLimiter(nil)

	limits := map[string]*RateLimitConfig{
		"/api/v1/endpoint1": {
			RequestsPerWindow: 20,
			WindowDuration:    30 * time.Second,
		},
		"/api/v1/endpoint2": {
			RequestsPerWindow: 50,
			WindowDuration:    1 * time.Minute,
		},
	}

	rl.UpdateLimits(limits)

	// Verify first endpoint
	config1 := rl.endpointLimits.GetLimit("/api/v1/endpoint1")
	if config1.RequestsPerWindow != 20 {
		t.Errorf("Expected 20 requests for endpoint1, got %d", config1.RequestsPerWindow)
	}

	// Verify second endpoint
	config2 := rl.endpointLimits.GetLimit("/api/v1/endpoint2")
	if config2.RequestsPerWindow != 50 {
		t.Errorf("Expected 50 requests for endpoint2, got %d", config2.RequestsPerWindow)
	}
}

func TestTokenBucketTake(t *testing.T) {
	bucket := &tokenBucket{
		tokens:         3,
		lastRefillTime: time.Now(),
		maxTokens:      3,
		refillRate:     1 * time.Minute,
	}

	// Should allow first 3 requests
	for i := 0; i < 3; i++ {
		allowed, _ := bucket.take()
		if !allowed {
			t.Errorf("Request %d should be allowed", i+1)
		}
	}

	// 4th request should be denied
	allowed, retryAfter := bucket.take()
	if allowed {
		t.Error("4th request should be denied")
	}
	if retryAfter <= 0 {
		t.Error("retryAfter should be positive")
	}
}

func TestTokenBucketRefill(t *testing.T) {
	bucket := &tokenBucket{
		tokens:         0,
		lastRefillTime: time.Now().Add(-2 * time.Minute), // 2 minutes ago
		maxTokens:      5,
		refillRate:     1 * time.Minute,
	}

	// Should refill and allow request
	allowed, _ := bucket.take()
	if !allowed {
		t.Error("Request should be allowed after refill")
	}

	// Tokens should be refilled to max - 1
	if bucket.tokens != 4 {
		t.Errorf("Expected 4 tokens after refill and take, got %d", bucket.tokens)
	}
}

func TestGetClientIP(t *testing.T) {
	tests := []struct {
		name           string
		xForwardedFor  string
		xRealIP        string
		remoteAddr     string
		expectedIP     string
	}{
		{
			name:           "X-Forwarded-For header",
			xForwardedFor:  "192.168.1.1",
			expectedIP:     "192.168.1.1",
		},
		{
			name:           "X-Real-IP header",
			xRealIP:        "10.0.0.1",
			expectedIP:     "10.0.0.1",
		},
		{
			name:           "RemoteAddr fallback",
			remoteAddr:     "127.0.0.1:1234",
			expectedIP:     "127.0.0.1:1234",
		},
		{
			name:           "X-Forwarded-For takes precedence",
			xForwardedFor:  "192.168.1.1",
			xRealIP:        "10.0.0.1",
			remoteAddr:     "127.0.0.1:1234",
			expectedIP:     "192.168.1.1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/test", nil)
			if tt.xForwardedFor != "" {
				req.Header.Set("X-Forwarded-For", tt.xForwardedFor)
			}
			if tt.xRealIP != "" {
				req.Header.Set("X-Real-IP", tt.xRealIP)
			}
			if tt.remoteAddr != "" {
				req.RemoteAddr = tt.remoteAddr
			}

			ip := getClientIP(req)
			if ip != tt.expectedIP {
				t.Errorf("Expected IP %s, got %s", tt.expectedIP, ip)
			}
		})
	}
}

func TestRateLimiterMiddleware(t *testing.T) {
	rl := NewRateLimiter(nil)

	// Set a very low limit for testing
	rl.endpointLimits.SetLimit("/test", &RateLimitConfig{
		RequestsPerWindow: 2,
		WindowDuration:    1 * time.Minute,
		EnableUserLimit:   false,
		EnableIPLimit:     true,
	})

	handler := rl.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}))

	// First request - should pass
	req1 := httptest.NewRequest("GET", "/test", nil)
	req1.RemoteAddr = "127.0.0.1:1234"
	w1 := httptest.NewRecorder()
	handler.ServeHTTP(w1, req1)

	if w1.Code != http.StatusOK {
		t.Errorf("First request should pass, got status %d", w1.Code)
	}

	// Second request - should pass
	req2 := httptest.NewRequest("GET", "/test", nil)
	req2.RemoteAddr = "127.0.0.1:1234"
	w2 := httptest.NewRecorder()
	handler.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Errorf("Second request should pass, got status %d", w2.Code)
	}

	// Third request - should be rate limited
	req3 := httptest.NewRequest("GET", "/test", nil)
	req3.RemoteAddr = "127.0.0.1:1234"
	w3 := httptest.NewRecorder()
	handler.ServeHTTP(w3, req3)

	if w3.Code != http.StatusTooManyRequests {
		t.Errorf("Third request should be rate limited, got status %d", w3.Code)
	}

	// Check rate limit headers
	if w3.Header().Get("X-RateLimit-Limit") == "" {
		t.Error("X-RateLimit-Limit header should be set")
	}
	if w3.Header().Get("Retry-After") == "" {
		t.Error("Retry-After header should be set")
	}
}

func TestRateLimiterDifferentIPs(t *testing.T) {
	rl := NewRateLimiter(nil)

	rl.endpointLimits.SetLimit("/test", &RateLimitConfig{
		RequestsPerWindow: 1,
		WindowDuration:    1 * time.Minute,
		EnableUserLimit:   false,
		EnableIPLimit:     true,
	})

	handler := rl.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Request from IP 1
	req1 := httptest.NewRequest("GET", "/test", nil)
	req1.RemoteAddr = "192.168.1.1:1234"
	w1 := httptest.NewRecorder()
	handler.ServeHTTP(w1, req1)

	if w1.Code != http.StatusOK {
		t.Errorf("Request from IP1 should pass, got status %d", w1.Code)
	}

	// Request from IP 2 (different IP, should also pass)
	req2 := httptest.NewRequest("GET", "/test", nil)
	req2.RemoteAddr = "192.168.1.2:1234"
	w2 := httptest.NewRecorder()
	handler.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Errorf("Request from IP2 should pass, got status %d", w2.Code)
	}
}
