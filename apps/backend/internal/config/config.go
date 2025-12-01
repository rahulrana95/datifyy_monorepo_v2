package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	// Server Configuration
	HTTPPort string
	GRPCPort string

	// Database
	DatabaseURL string

	// Cache
	RedisURL string

	// Email Service
	MailerSendAPIKey string
	EmailFrom        string
	EmailFromName    string

	// AI Service
	GeminiAPIKey string

	// Notifications
	SlackWebhookURL string

	// Environment
	Environment string
}

// Load reads configuration from environment variables
// It will attempt to load .env files in this order:
// 1. .env.production (if ENV=production or --env=production flag)
// 2. .env (default fallback)
func Load() *Config {
	loadEnvFile()

	return &Config{
		// Server
		HTTPPort: getEnv("PORT", "8080"),
		GRPCPort: getEnv("GRPC_PORT", "9090"),

		// Database
		DatabaseURL: getEnv(
			"DATABASE_URL",
			"postgres://devuser:devpass@localhost:5432/monorepo_dev?sslmode=disable",
		),

		// Cache
		RedisURL: getEnv("REDIS_URL", "redis://localhost:6379"),

		// Email
		MailerSendAPIKey: os.Getenv("MAILERSEND_API_KEY"),
		EmailFrom:        getEnv("EMAIL_FROM", "noreply@datifyy.com"),
		EmailFromName:    getEnv("EMAIL_FROM_NAME", "Datifyy"),

		// AI
		GeminiAPIKey: os.Getenv("GEMINI_API_KEY"),

		// Notifications
		SlackWebhookURL: os.Getenv("SLACK_WEBHOOK_URL"),

		// Environment
		Environment: getEnv("ENV", "development"),
	}
}

// Validate checks if required configuration is present
func (c *Config) Validate() error {
	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	if c.RedisURL == "" {
		return fmt.Errorf("REDIS_URL is required")
	}
	return nil
}

// IsDevelopment returns true if running in development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction returns true if running in production
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

// getEnv gets environment variable with fallback default
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// loadEnvFile loads the appropriate .env file based on environment
func loadEnvFile() {
	env := os.Getenv("ENV")

	// Priority order:
	// 1. .env.production (if ENV=production) - check both current dir and parent dir
	// 2. .env (default)

	var envFiles []string
	if env == "production" {
		envFiles = []string{
			".env.production",
			"../.env.production",           // Check parent directory (monorepo root)
			"../../.env.production",         // Check two levels up (for nested structures)
		}
	} else {
		envFiles = []string{
			".env",
			"../.env",
			"../../.env",
		}
	}

	// Try to load the environment-specific file from multiple locations
	loaded := false
	for _, envFile := range envFiles {
		if err := godotenv.Load(envFile); err == nil {
			log.Printf("Loaded configuration from %s", envFile)
			loaded = true
			break
		}
	}

	if !loaded {
		// It's okay if no file exists (e.g., in Docker/production with env vars set directly)
		log.Printf("No .env file loaded (using system environment variables)")
	}
}
