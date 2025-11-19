package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

var (
	db          *sql.DB
	redisClient *redis.Client
)

func init() {
	// Initialize database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL != "" {
		var err error
		db, err = sql.Open("postgres", dbURL)
		if err == nil {
			db.SetMaxOpenConns(10)
			db.SetMaxIdleConns(5)
			db.SetConnMaxLifetime(5 * time.Minute)
		}
	}

	// Initialize Redis connection
	redisURL := os.Getenv("REDIS_URL")
	if redisURL != "" {
		opts, err := redis.ParseURL(redisURL)
		if err == nil {
			redisClient = redis.NewClient(opts)
		}
	}
}

// Handler is the main entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Route handling
	switch r.URL.Path {
	case "/", "/api", "/api/":
		rootHandler(w, r)
	case "/health", "/api/health":
		healthHandler(w, r)
	case "/ready", "/api/ready":
		readyHandler(w, r)
	case "/api/test-db":
		testDBHandler(w, r)
	case "/api/test-redis":
		testRedisHandler(w, r)
	default:
		http.NotFound(w, r)
	}
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"service":   "Datifyy Backend API (Vercel)",
		"version":   "1.0.0",
		"timestamp": time.Now().UTC(),
		"status": map[string]bool{
			"database": db != nil && db.Ping() == nil,
			"redis":    redisClient != nil && redisClient.Ping(context.Background()).Err() == nil,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func readyHandler(w http.ResponseWriter, r *http.Request) {
	// Check database connection
	if db != nil {
		if err := db.Ping(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Database not ready"))
			return
		}
	}

	// Check Redis connection
	if redisClient != nil {
		ctx := context.Background()
		if err := redisClient.Ping(ctx).Err(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Redis not ready"))
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("READY"))
}

func testDBHandler(w http.ResponseWriter, r *http.Request) {
	if db == nil {
		http.Error(w, "Database not connected", http.StatusServiceUnavailable)
		return
	}

	var now time.Time
	err := db.QueryRow("SELECT NOW()").Scan(&now)
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

func testRedisHandler(w http.ResponseWriter, r *http.Request) {
	if redisClient == nil {
		http.Error(w, "Redis not connected", http.StatusServiceUnavailable)
		return
	}

	ctx := context.Background()

	key := fmt.Sprintf("test:%d", time.Now().Unix())
	value := "Hello from Redis!"

	err := redisClient.Set(ctx, key, value, 10*time.Second).Err()
	if err != nil {
		http.Error(w, fmt.Sprintf("Redis error: %v", err), http.StatusInternalServerError)
		return
	}

	result, err := redisClient.Get(ctx, key).Result()
	if err != nil {
		http.Error(w, fmt.Sprintf("Redis error: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"redis":  "connected",
		"key":    key,
		"value":  result,
		"ttl":    "10 seconds",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}