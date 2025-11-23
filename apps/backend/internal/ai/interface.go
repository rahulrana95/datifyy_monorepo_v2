package ai

import "context"

// AIProvider defines the interface for AI compatibility services
// This abstraction allows easy switching between different AI providers (Gemini, OpenAI, Claude, etc.)
type AIProvider interface {
	// CalculateCompatibility analyzes two users and returns compatibility score
	CalculateCompatibility(ctx context.Context, req CompatibilityRequest) (*CompatibilityResponse, error)

	// GetProviderName returns the name of the AI provider
	GetProviderName() string

	// Close closes any connections and cleans up resources
	Close() error
}

// Config contains configuration for AI providers
type Config struct {
	Provider string // "gemini", "openai", "claude", etc.
	APIKey   string
	Model    string // Optional: specific model to use
}
