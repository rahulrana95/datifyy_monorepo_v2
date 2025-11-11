// +build integration

package tests

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"testing"
	"time"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

func TestDatabaseConnection(t *testing.T) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		t.Skip("DATABASE_URL not set, skipping integration test")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Test connection
	err = db.Ping()
	if err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}

	// Test query
	var now time.Time
	err = db.QueryRow("SELECT NOW()").Scan(&now)
	if err != nil {
		t.Fatalf("Failed to query database: %v", err)
	}

	t.Logf("Database connected successfully. Server time: %v", now)
}

func TestRedisConnection(t *testing.T) {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		t.Skip("REDIS_URL not set, skipping integration test")
	}

	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		t.Fatalf("Failed to parse Redis URL: %v", err)
	}

	client := redis.NewClient(opts)
	defer client.Close()

	// Test connection
	ctx := context.Background()
	pong, err := client.Ping(ctx).Result()
	if err != nil {
		t.Fatalf("Failed to ping Redis: %v", err)
	}

	if pong != "PONG" {
		t.Errorf("Expected PONG, got %s", pong)
	}

	// Test set/get
	key := fmt.Sprintf("test:integration:%d", time.Now().Unix())
	value := "test-value"

	err = client.Set(ctx, key, value, 10*time.Second).Err()
	if err != nil {
		t.Fatalf("Failed to set value in Redis: %v", err)
	}

	result, err := client.Get(ctx, key).Result()
	if err != nil {
		t.Fatalf("Failed to get value from Redis: %v", err)
	}

	if result != value {
		t.Errorf("Expected %s, got %s", value, result)
	}

	// Cleanup
	client.Del(ctx, key)
	t.Log("Redis connected and working successfully")
}

func TestAPIEndpoints(t *testing.T) {
	baseURL := os.Getenv("API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	tests := []struct {
		name           string
		endpoint       string
		expectedStatus int
	}{
		{"Health Check", "/health", http.StatusOK},
		{"Ready Check", "/ready", http.StatusOK},
		{"Root", "/", http.StatusOK},
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := client.Get(baseURL + tt.endpoint)
			if err != nil {
				t.Fatalf("Failed to call %s: %v", tt.endpoint, err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.StatusCode)
			}
		})
	}
}