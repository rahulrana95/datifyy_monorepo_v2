package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

type Server struct {
	db    *sql.DB
	redis *redis.Client
}

func main() {
	// Get configuration from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable"
	}

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	// Connect to PostgreSQL
	db, err := connectPostgres(dbURL)
	if err != nil {
		log.Printf("Warning: Could not connect to PostgreSQL: %v", err)
		log.Println("Running without database connection")
	} else {
		defer db.Close()
		log.Println("Connected to PostgreSQL")
	}

	// Connect to Redis
	redisClient, err := connectRedis(redisURL)
	if err != nil {
		log.Printf("Warning: Could not connect to Redis: %v", err)
		log.Println("Running without Redis connection")
	} else {
		defer redisClient.Close()
		log.Println("Connected to Redis")
	}

	// Create server
	server := &Server{
		db:    db,
		redis: redisClient,
	}

	// Setup routes
	mux := http.NewServeMux()
	mux.HandleFunc("/health", server.healthHandler)
	mux.HandleFunc("/ready", server.readyHandler)
	mux.HandleFunc("/", server.rootHandler)
	mux.HandleFunc("/api/test-db", server.testDBHandler)
	mux.HandleFunc("/api/test-redis", server.testRedisHandler)

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), mux); err != nil {
		log.Fatal(err)
	}
}

func connectPostgres(dbURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test connection with retries
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for i := 0; i < 10; i++ {
		if err := db.PingContext(ctx); err == nil {
			return db, nil
		}
		log.Printf("Waiting for database to be ready... attempt %d/10", i+1)
		time.Sleep(3 * time.Second)
	}

	return nil, fmt.Errorf("database not ready after 30 seconds")
}

func connectRedis(redisURL string) (*redis.Client, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse redis URL: %w", err)
	}

	client := redis.NewClient(opts)

	// Test connection with retries
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for i := 0; i < 10; i++ {
		if err := client.Ping(ctx).Err(); err == nil {
			return client, nil
		}
		log.Printf("Waiting for Redis to be ready... attempt %d/10", i+1)
		time.Sleep(3 * time.Second)
	}

	return nil, fmt.Errorf("redis not ready after 30 seconds")
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func (s *Server) readyHandler(w http.ResponseWriter, r *http.Request) {
	// Check database connection
	if s.db != nil {
		if err := s.db.Ping(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Database not ready"))
			return
		}
	}

	// Check Redis connection
	if s.redis != nil {
		ctx := context.Background()
		if err := s.redis.Ping(ctx).Err(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Redis not ready"))
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("READY"))
}

func (s *Server) rootHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"service":   "Datifyy Backend API",
		"version":   "1.0.0",
		"timestamp": time.Now().UTC(),
		"status": map[string]bool{
			"database": s.db != nil && s.db.Ping() == nil,
			"redis":    s.redis != nil && s.redis.Ping(context.Background()).Err() == nil,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) testDBHandler(w http.ResponseWriter, r *http.Request) {
	if s.db == nil {
		http.Error(w, "Database not connected", http.StatusServiceUnavailable)
		return
	}

	// Test query
	var now time.Time
	err := s.db.QueryRow("SELECT NOW()").Scan(&now)
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

func (s *Server) testRedisHandler(w http.ResponseWriter, r *http.Request) {
	if s.redis == nil {
		http.Error(w, "Redis not connected", http.StatusServiceUnavailable)
		return
	}

	ctx := context.Background()
	
	// Set a test value
	key := fmt.Sprintf("test:%d", time.Now().Unix())
	value := "Hello from Redis!"
	
	err := s.redis.Set(ctx, key, value, 10*time.Second).Err()
	if err != nil {
		http.Error(w, fmt.Sprintf("Redis error: %v", err), http.StatusInternalServerError)
		return
	}

	// Get the value back
	result, err := s.redis.Get(ctx, key).Result()
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