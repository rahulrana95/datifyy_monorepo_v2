package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// GeminiProvider implements AIProvider using Google's Gemini API
type GeminiProvider struct {
	client *genai.Client
	model  string
}

// NewGeminiProvider creates a new Gemini AI provider
func NewGeminiProvider(ctx context.Context, apiKey string, model string) (*GeminiProvider, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("gemini API key is required")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create gemini client: %w", err)
	}

	if model == "" {
		model = "gemini-2.5-flash" // Default model
	}

	return &GeminiProvider{
		client: client,
		model:  model,
	}, nil
}

// GetProviderName returns the provider name
func (g *GeminiProvider) GetProviderName() string {
	return "Gemini"
}

// Close closes the Gemini client
func (g *GeminiProvider) Close() error {
	if g.client != nil {
		return g.client.Close()
	}
	return nil
}

// CalculateCompatibility analyzes compatibility between two users
func (g *GeminiProvider) CalculateCompatibility(ctx context.Context, req CompatibilityRequest) (*CompatibilityResponse, error) {
	// Build the prompt for Gemini
	prompt := g.buildCompatibilityPrompt(req)

	// Get the model
	model := g.client.GenerativeModel(g.model)

	// Configure the model for JSON response
	model.ResponseMIMEType = "application/json"

	// Generate content
	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, fmt.Errorf("failed to generate compatibility analysis: %w", err)
	}

	// Parse the response
	if len(resp.Candidates) == 0 {
		return nil, fmt.Errorf("no response from Gemini")
	}

	// Extract text from response
	var responseText string
	for _, part := range resp.Candidates[0].Content.Parts {
		if txt, ok := part.(genai.Text); ok {
			responseText = string(txt)
		}
	}

	if responseText == "" {
		return nil, fmt.Errorf("empty response from Gemini")
	}

	// Parse JSON response
	var result CompatibilityResponse
	if err := json.Unmarshal([]byte(responseText), &result); err != nil {
		log.Printf("Failed to parse Gemini response as JSON: %v. Raw response: %s", err, responseText)
		return nil, fmt.Errorf("failed to parse compatibility response: %w", err)
	}

	// Ensure score is within 0-100 range
	if result.CompatibilityScore < 0 {
		result.CompatibilityScore = 0
	} else if result.CompatibilityScore > 100 {
		result.CompatibilityScore = 100
	}

	// Set IsMatch based on score
	result.IsMatch = result.CompatibilityScore >= 60.0

	return &result, nil
}

// buildCompatibilityPrompt creates a detailed prompt for Gemini
func (g *GeminiProvider) buildCompatibilityPrompt(req CompatibilityRequest) string {
	return fmt.Sprintf(`You are a professional dating compatibility analyzer. Analyze the compatibility between these two users for a potential romantic match.

User 1 Profile:
- Name: %s
- Age: %d
- Gender: %s
- Location: %s
- Bio: %s
- Interests: %s
- Occupation: %s
- Education: %s
- Lifestyle: %s

User 1 Partner Preferences:
- Age Range: %d - %d
- Gender Preference: %s
- Location Preference: %s
- Preferred Interests: %s
- Education Preference: %s
- Lifestyle Preference: %s

User 2 Profile:
- Name: %s
- Age: %d
- Gender: %s
- Location: %s
- Bio: %s
- Interests: %s
- Occupation: %s
- Education: %s
- Lifestyle: %s

User 2 Partner Preferences:
- Age Range: %d - %d
- Gender Preference: %s
- Location Preference: %s
- Preferred Interests: %s
- Education Preference: %s
- Lifestyle Preference: %s

Analyze their compatibility considering:
1. Age compatibility with each other's preferences
2. Gender preference match
3. Location compatibility
4. Shared interests and hobbies
5. Education level compatibility
6. Lifestyle compatibility
7. Mutual attraction potential based on preferences

Provide a comprehensive compatibility analysis in the following JSON format:
{
  "compatibility_score": <number between 0-100>,
  "is_match": <true if score >= 60, false otherwise>,
  "reasoning": "<detailed explanation of the compatibility score>",
  "matched_aspects": ["<aspect 1>", "<aspect 2>", ...],
  "mismatched_aspects": ["<aspect 1>", "<aspect 2>", ...]
}

Be objective and consider both mutual compatibility (do they match each other's preferences) and common ground (shared interests, values, etc.).`,
		// User 1
		req.User1Profile.Name,
		req.User1Profile.Age,
		req.User1Profile.Gender,
		req.User1Profile.Location,
		req.User1Profile.Bio,
		strings.Join(req.User1Profile.Interests, ", "),
		req.User1Profile.Occupation,
		req.User1Profile.Education,
		req.User1Profile.Lifestyle,
		// User 1 Preferences
		req.User1Preferences.AgeMin,
		req.User1Preferences.AgeMax,
		req.User1Preferences.GenderPreference,
		req.User1Preferences.LocationPreference,
		strings.Join(req.User1Preferences.InterestsPreferred, ", "),
		req.User1Preferences.EducationPreference,
		req.User1Preferences.LifestylePreference,
		// User 2
		req.User2Profile.Name,
		req.User2Profile.Age,
		req.User2Profile.Gender,
		req.User2Profile.Location,
		req.User2Profile.Bio,
		strings.Join(req.User2Profile.Interests, ", "),
		req.User2Profile.Occupation,
		req.User2Profile.Education,
		req.User2Profile.Lifestyle,
		// User 2 Preferences
		req.User2Preferences.AgeMin,
		req.User2Preferences.AgeMax,
		req.User2Preferences.GenderPreference,
		req.User2Preferences.LocationPreference,
		strings.Join(req.User2Preferences.InterestsPreferred, ", "),
		req.User2Preferences.EducationPreference,
		req.User2Preferences.LifestylePreference,
	)
}
