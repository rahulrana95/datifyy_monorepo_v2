package health

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

// Handler handles health check HTTP requests
type Handler struct {
	db    *sql.DB
	redis *redis.Client
}

// NewHandler creates a new health handler
func NewHandler(db *sql.DB, redis *redis.Client) *Handler {
	return &Handler{
		db:    db,
		redis: redis,
	}
}

// Health returns a simple OK response
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

// Ready checks if the service is ready (DB and Redis connected)
func (h *Handler) Ready(w http.ResponseWriter, r *http.Request) {
	// Check database connection
	if h.db != nil {
		if err := h.db.Ping(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Database not ready"))
			return
		}
	}

	// Check Redis connection
	if h.redis != nil {
		ctx := context.Background()
		if err := h.redis.Ping(ctx).Err(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Redis not ready"))
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("READY"))
}

// Root returns service information
func (h *Handler) Root(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"service":   "Datifyy Backend API",
		"version":   "1.0.0",
		"timestamp": time.Now().UTC(),
		"endpoints": map[string]interface{}{
			"grpc": ":9090",
			"http": ":8080",
		},
		"status": map[string]bool{
			"database": h.db != nil && h.db.Ping() == nil,
			"redis":    h.redis != nil && h.redis.Ping(context.Background()).Err() == nil,
		},
		"availableServices": []string{
			"AuthService (gRPC)",
			"UserService (gRPC)",
			"AvailabilityService (gRPC)",
			"AdminService (gRPC)",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// TestDB tests database connection
func (h *Handler) TestDB(w http.ResponseWriter, r *http.Request) {
	if h.db == nil {
		http.Error(w, "Database not connected", http.StatusServiceUnavailable)
		return
	}

	// Test query
	var now time.Time
	err := h.db.QueryRow("SELECT NOW()").Scan(&now)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"database": "connected",
		"time":     now,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// TestRedis tests Redis connection
func (h *Handler) TestRedis(w http.ResponseWriter, r *http.Request) {
	if h.redis == nil {
		http.Error(w, "Redis not connected", http.StatusServiceUnavailable)
		return
	}

	ctx := context.Background()

	// Set a test value
	key := fmt.Sprintf("test:%d", time.Now().Unix())
	value := "Hello from Redis!"

	err := h.redis.Set(ctx, key, value, 10*time.Second).Err()
	if err != nil {
		http.Error(w, fmt.Sprintf("Redis error: %v", err), http.StatusInternalServerError)
		return
	}

	// Get the value back
	result, err := h.redis.Get(ctx, key).Result()
	if err != nil {
		http.Error(w, fmt.Sprintf("Redis error: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"redis":  "connected",
		"key":    key,
		"value":  result,
		"result": "success",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
