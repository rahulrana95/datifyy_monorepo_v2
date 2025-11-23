package ai

import (
	"context"
	"fmt"
	"strings"
)

// NewAIProvider creates a new AI provider based on configuration
// This factory makes it easy to switch between different AI providers
func NewAIProvider(ctx context.Context, config Config) (AIProvider, error) {
	if config.APIKey == "" {
		return nil, fmt.Errorf("API key is required")
	}

	providerName := strings.ToLower(config.Provider)

	switch providerName {
	case "gemini", "google":
		return NewGeminiProvider(ctx, config.APIKey, config.Model)
	case "openai":
		// Future: Implement OpenAI provider
		return nil, fmt.Errorf("OpenAI provider not yet implemented")
	case "claude", "anthropic":
		// Future: Implement Claude provider
		return nil, fmt.Errorf("Claude provider not yet implemented")
	default:
		return nil, fmt.Errorf("unknown AI provider: %s. Supported providers: gemini, openai, claude", config.Provider)
	}
}
