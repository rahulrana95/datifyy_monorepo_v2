package user

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/service"
	"github.com/datifyy/backend/internal/util/converter"
	"google.golang.org/protobuf/encoding/protojson"
)

// Handler handles user HTTP requests
type Handler struct {
	userService *service.UserService
}

// NewHandler creates a new user handler
func NewHandler(userService *service.UserService) *Handler {
	return &Handler{
		userService: userService,
	}
}

// extractUserIDFromToken extracts user ID from Authorization header
func extractUserIDFromToken(r *http.Request) (int, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return 0, fmt.Errorf("authorization header required")
	}

	// Remove "Bearer " prefix
	accessToken := authHeader
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		accessToken = authHeader[7:]
	}

	// Parse access token to get user ID
	var userID int
	var timestamp int64
	_, err := fmt.Sscanf(accessToken, "access_token_%d_%d", &userID, &timestamp)
	if err != nil {
		return 0, fmt.Errorf("invalid access token format")
	}

	return userID, nil
}

// Profile handles user profile GET and PUT requests
func (h *Handler) Profile(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from token
	userID, err := extractUserIDFromToken(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Add userID to context
	ctx := context.WithValue(r.Context(), "userID", userID)

	// Handle GET request (GetMyProfile)
	if r.Method == http.MethodGet {
		grpcReq := &userpb.GetMyProfileRequest{}

		// Call gRPC service
		resp, err := h.userService.GetMyProfile(ctx, grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get profile: %v", err), http.StatusInternalServerError)
			return
		}

		// Convert response to JSON
		jsonResp := map[string]interface{}{
			"profile": converter.UserProfileToJSON(resp.Profile),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
		return
	}

	// Handle PUT request (UpdateProfile)
	if r.Method == http.MethodPut {
		// Read request body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusBadRequest)
			return
		}

		// Parse using protojson to handle string enums
		grpcReq := &userpb.UpdateProfileRequest{}
		unmarshaler := protojson.UnmarshalOptions{
			DiscardUnknown: true,
		}
		if err := unmarshaler.Unmarshal(body, grpcReq); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		// Call gRPC service
		resp, err := h.userService.UpdateProfile(ctx, grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to update profile: %v", err), http.StatusBadRequest)
			return
		}

		// Convert response to JSON
		jsonResp := map[string]interface{}{
			"profile": converter.UserProfileToJSON(resp.Profile),
			"message": resp.Message,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

// PartnerPreferences handles partner preferences GET and PUT requests
func (h *Handler) PartnerPreferences(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from token
	userID, err := extractUserIDFromToken(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Add userID to context
	ctx := context.WithValue(r.Context(), "userID", userID)

	// Handle GET request (GetPartnerPreferences)
	if r.Method == http.MethodGet {
		grpcReq := &userpb.GetPartnerPreferencesRequest{}

		// Call gRPC service
		resp, err := h.userService.GetPartnerPreferences(ctx, grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get partner preferences: %v", err), http.StatusInternalServerError)
			return
		}

		// Use protojson to marshal with all fields (including zero values) in camelCase
		marshaler := protojson.MarshalOptions{
			EmitUnpopulated: true,
		}

		prefsJSON, err := marshaler.Marshal(resp.Preferences)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to marshal preferences: %v", err), http.StatusInternalServerError)
			return
		}

		// Wrap in response object
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"preferences":%s}`, prefsJSON)
		return
	}

	// Handle PUT request (UpdatePartnerPreferences)
	if r.Method == http.MethodPut {
		// Read request body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to read request body: %v", err), http.StatusBadRequest)
			return
		}

		// Parse JSON to extract update_fields first
		var rawReq map[string]json.RawMessage
		if err := json.Unmarshal(body, &rawReq); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		// Extract update_fields if present
		var updateFields []string
		if uf, ok := rawReq["update_fields"]; ok {
			if err := json.Unmarshal(uf, &updateFields); err != nil {
				http.Error(w, fmt.Sprintf("Invalid update_fields: %v", err), http.StatusBadRequest)
				return
			}
		}

		// Parse preferences using protojson
		preferences := &userpb.PartnerPreferences{}
		if prefsJSON, ok := rawReq["preferences"]; ok {
			unmarshaler := protojson.UnmarshalOptions{
				DiscardUnknown: true,
			}
			if err := unmarshaler.Unmarshal(prefsJSON, preferences); err != nil {
				http.Error(w, fmt.Sprintf("Invalid preferences: %v", err), http.StatusBadRequest)
				return
			}
		}

		// If no update fields specified, update all fields
		if len(updateFields) == 0 {
			updateFields = []string{
				"looking_for_gender",
				"age_range",
				"distance_preference",
				"height_range",
				"relationship_goals",
				"education_levels",
				"occupations",
				"religions",
				"children_preferences",
				"drinking_preferences",
				"smoking_preferences",
				"dietary_preferences",
				"pet_preferences",
				"verified_only",
				"dealbreakers",
			}
		}

		// Convert to gRPC request
		grpcReq := &userpb.UpdatePartnerPreferencesRequest{
			Preferences:  preferences,
			UpdateFields: updateFields,
		}

		// Call gRPC service
		resp, err := h.userService.UpdatePartnerPreferences(ctx, grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to update partner preferences: %v", err), http.StatusBadRequest)
			return
		}

		// Use protojson to marshal with all fields (including zero values) in camelCase
		marshaler := protojson.MarshalOptions{
			EmitUnpopulated: true,
		}

		prefsJSON, err := marshaler.Marshal(resp.Preferences)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to marshal preferences: %v", err), http.StatusInternalServerError)
			return
		}

		// Wrap in response object with message
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"preferences":%s,"message":"%s"}`, prefsJSON, resp.Message)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}
