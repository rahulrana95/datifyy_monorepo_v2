# AI Service - Compatibility Matching

This package provides an abstraction layer for AI-powered compatibility analysis between users.

## Architecture

The AI service is designed with a provider-agnostic interface, making it easy to switch between different AI providers (Gemini, OpenAI, Claude, etc.) without changing application code.

### Components

1. **AIProvider Interface** (`interface.go`)
   - Defines the contract for all AI providers
   - Main method: `CalculateCompatibility()`
   - Ensures consistent behavior across providers

2. **Types** (`types.go`)
   - `CompatibilityRequest`: Input data for compatibility analysis
   - `UserProfile`: User information
   - `PartnerPreferences`: What user is looking for
   - `CompatibilityResponse`: AI analysis result with score (0-100)

3. **Gemini Provider** (`gemini.go`)
   - Google Gemini AI implementation
   - Uses `gemini-1.5-flash` model by default
   - Structured JSON output for reliability

4. **Factory** (`factory.go`)
   - `NewAIProvider()`: Creates appropriate provider based on config
   - Easy switching between providers

## Usage

### Basic Example

```go
import (
    "context"
    "github.com/datifyy/backend/internal/ai"
)

// Create AI provider
ctx := context.Background()
config := ai.Config{
    Provider: "gemini",
    APIKey:   "your-api-key",
    Model:    "gemini-1.5-flash", // optional
}

provider, err := ai.NewAIProvider(ctx, config)
if err != nil {
    log.Fatal(err)
}
defer provider.Close()

// Calculate compatibility
req := ai.CompatibilityRequest{
    User1Profile: ai.UserProfile{
        UserID:    "user1",
        Name:      "Alice",
        Age:       28,
        Gender:    "female",
        Interests: []string{"hiking", "photography", "cooking"},
        // ... other fields
    },
    User1Preferences: ai.PartnerPreferences{
        AgeMin:           25,
        AgeMax:           35,
        GenderPreference: "male",
        // ... other fields
    },
    User2Profile: ai.UserProfile{
        UserID:    "user2",
        Name:      "Bob",
        Age:       30,
        Gender:    "male",
        Interests: []string{"hiking", "travel", "cooking"},
        // ... other fields
    },
    User2Preferences: ai.PartnerPreferences{
        AgeMin:           24,
        AgeMax:           32,
        GenderPreference: "female",
        // ... other fields
    },
}

result, err := provider.CalculateCompatibility(ctx, req)
if err != nil {
    log.Fatal(err)
}

fmt.Printf("Compatibility Score: %.1f%%\n", result.CompatibilityScore)
fmt.Printf("Is Match: %v\n", result.IsMatch)
fmt.Printf("Reasoning: %s\n", result.Reasoning)
```

### Environment Variables

```bash
# For Gemini
GEMINI_API_KEY=your-gemini-api-key

# For other providers (future)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
```

## Compatibility Scoring

- **Score Range**: 0-100
- **Match Threshold**: ≥ 60% is considered a match
- **Factors Considered**:
  - Age compatibility (mutual)
  - Gender preference match
  - Location compatibility
  - Shared interests
  - Education level compatibility
  - Lifestyle compatibility
  - Overall mutual attraction potential

## Switching AI Providers

To switch from Gemini to another provider (e.g., OpenAI):

```go
// Current (Gemini)
config := ai.Config{
    Provider: "gemini",
    APIKey:   os.Getenv("GEMINI_API_KEY"),
}

// Switch to OpenAI (when implemented)
config := ai.Config{
    Provider: "openai",
    APIKey:   os.Getenv("OPENAI_API_KEY"),
    Model:    "gpt-4", // optional
}

// No other code changes needed!
provider, err := ai.NewAIProvider(ctx, config)
```

## Adding New Providers

1. Create a new file `provider_name.go`
2. Implement the `AIProvider` interface
3. Add to factory in `factory.go`

Example:

```go
// openai.go
type OpenAIProvider struct {
    client *openai.Client
}

func NewOpenAIProvider(ctx context.Context, apiKey, model string) (*OpenAIProvider, error) {
    // Implementation
}

func (o *OpenAIProvider) CalculateCompatibility(ctx context.Context, req CompatibilityRequest) (*CompatibilityResponse, error) {
    // Implementation
}

// factory.go - add case:
case "openai":
    return NewOpenAIProvider(ctx, config.APIKey, config.Model)
```

## Testing

```bash
# Run tests
go test ./internal/ai/...

# Run with coverage
go test -cover ./internal/ai/...
```

## Cost Optimization

- **Gemini 1.5 Flash**: Low cost, fast responses
- Consider caching results for same user pairs
- Batch processing for multiple matches
- Rate limiting to avoid API costs

## Security

- Never commit API keys to version control
- Use environment variables or secret management
- Validate all inputs before sending to AI
- Sanitize AI responses before storing

## Future Enhancements

- [ ] OpenAI provider implementation
- [ ] Claude provider implementation
- [ ] Caching layer for repeated queries
- [ ] Batch compatibility calculations
- [ ] A/B testing between providers
- [ ] Custom scoring weights
- [ ] Multi-language support
