package auth

import (
	"encoding/json"
	"fmt"
	"net/http"

	authpb "github.com/datifyy/backend/gen/auth/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	"github.com/datifyy/backend/internal/service"
)

// Handler handles authentication HTTP requests
type Handler struct {
	authService *service.AuthService
}

// NewHandler creates a new auth handler
func NewHandler(authService *service.AuthService) *Handler {
	return &Handler{
		authService: authService,
	}
}

// Register handles user registration with email
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse JSON request
	var reqBody struct {
		Email      string `json:"email"`
		Password   string `json:"password"`
		Name       string `json:"name"`
		DeviceInfo *struct {
			Platform   int32  `json:"platform"`
			DeviceName string `json:"device_name"`
			OSVersion  string `json:"os_version"`
			DeviceID   string `json:"device_id"`
		} `json:"device_info,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
		return
	}

	// Convert to gRPC request
	grpcReq := &authpb.RegisterWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    reqBody.Email,
			Password: reqBody.Password,
			Name:     reqBody.Name,
		},
	}

	if reqBody.DeviceInfo != nil {
		grpcReq.Credentials.DeviceInfo = &authpb.DeviceInfo{
			Platform:   commonpb.DevicePlatform(reqBody.DeviceInfo.Platform),
			DeviceName: reqBody.DeviceInfo.DeviceName,
			OsVersion:  reqBody.DeviceInfo.OSVersion,
			DeviceId:   reqBody.DeviceInfo.DeviceID,
		}
	}

	// Call gRPC service
	resp, err := h.authService.RegisterWithEmail(r.Context(), grpcReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("Registration failed: %v", err), http.StatusBadRequest)
		return
	}

	// Convert response to JSON (camelCase)
	jsonResp := map[string]interface{}{
		"user": map[string]interface{}{
			"userId":        resp.User.UserId,
			"email":         resp.User.Email,
			"name":          resp.User.Name,
			"accountStatus": resp.User.AccountStatus.String(),
			"emailVerified": resp.User.EmailVerified.String(),
			"createdAt": map[string]int64{
				"seconds": resp.User.CreatedAt.Seconds,
				"nanos":   int64(resp.User.CreatedAt.Nanos),
			},
		},
		"tokens": map[string]interface{}{
			"accessToken": map[string]interface{}{
				"token":     resp.Tokens.AccessToken.Token,
				"tokenType": resp.Tokens.AccessToken.TokenType,
				"expiresAt": map[string]int64{
					"seconds": resp.Tokens.AccessToken.ExpiresAt.Seconds,
					"nanos":   int64(resp.Tokens.AccessToken.ExpiresAt.Nanos),
				},
			},
			"refreshToken": map[string]interface{}{
				"token": resp.Tokens.RefreshToken.Token,
				"expiresAt": map[string]int64{
					"seconds": resp.Tokens.RefreshToken.ExpiresAt.Seconds,
					"nanos":   int64(resp.Tokens.RefreshToken.ExpiresAt.Nanos),
				},
			},
		},
		"session": map[string]interface{}{
			"sessionId": resp.Session.SessionId,
			"userId":    resp.Session.UserId,
		},
		"requiresEmailVerification": resp.RequiresEmailVerification,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(jsonResp)
}

// Login handles user login with email
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse JSON request
	var reqBody struct {
		Email      string `json:"email"`
		Password   string `json:"password"`
		DeviceInfo *struct {
			Platform   int32  `json:"platform"`
			DeviceName string `json:"device_name"`
			OSVersion  string `json:"os_version"`
			DeviceID   string `json:"device_id"`
		} `json:"device_info,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
		return
	}

	// Convert to gRPC request
	grpcReq := &authpb.LoginWithEmailRequest{
		Credentials: &authpb.EmailPasswordCredentials{
			Email:    reqBody.Email,
			Password: reqBody.Password,
		},
	}

	if reqBody.DeviceInfo != nil {
		grpcReq.Credentials.DeviceInfo = &authpb.DeviceInfo{
			Platform:   commonpb.DevicePlatform(reqBody.DeviceInfo.Platform),
			DeviceName: reqBody.DeviceInfo.DeviceName,
			OsVersion:  reqBody.DeviceInfo.OSVersion,
			DeviceId:   reqBody.DeviceInfo.DeviceID,
		}
	}

	// Call gRPC service
	resp, err := h.authService.LoginWithEmail(r.Context(), grpcReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("Login failed: %v", err), http.StatusUnauthorized)
		return
	}

	// Convert response to JSON (camelCase)
	jsonResp := map[string]interface{}{
		"user": map[string]interface{}{
			"userId":        resp.User.UserId,
			"email":         resp.User.Email,
			"name":          resp.User.Name,
			"accountStatus": resp.User.AccountStatus.String(),
			"emailVerified": resp.User.EmailVerified.String(),
			"createdAt": map[string]int64{
				"seconds": resp.User.CreatedAt.Seconds,
				"nanos":   int64(resp.User.CreatedAt.Nanos),
			},
		},
		"tokens": map[string]interface{}{
			"accessToken": map[string]interface{}{
				"token":     resp.Tokens.AccessToken.Token,
				"tokenType": resp.Tokens.AccessToken.TokenType,
				"expiresAt": map[string]int64{
					"seconds": resp.Tokens.AccessToken.ExpiresAt.Seconds,
					"nanos":   int64(resp.Tokens.AccessToken.ExpiresAt.Nanos),
				},
			},
			"refreshToken": map[string]interface{}{
				"token": resp.Tokens.RefreshToken.Token,
				"expiresAt": map[string]int64{
					"seconds": resp.Tokens.RefreshToken.ExpiresAt.Seconds,
					"nanos":   int64(resp.Tokens.RefreshToken.ExpiresAt.Nanos),
				},
			},
		},
		"session": map[string]interface{}{
			"sessionId": resp.Session.SessionId,
			"userId":    resp.Session.UserId,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(jsonResp)
}

// RefreshToken handles token refresh
func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse JSON request
	var reqBody struct {
		RefreshToken string `json:"refresh_token"`
		DeviceInfo   *struct {
			Platform   int32  `json:"platform"`
			DeviceName string `json:"device_name"`
			OSVersion  string `json:"os_version"`
			DeviceID   string `json:"device_id"`
		} `json:"device_info,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
		return
	}

	// Convert to gRPC request
	grpcReq := &authpb.RefreshTokenRequest{
		RefreshToken: reqBody.RefreshToken,
	}

	if reqBody.DeviceInfo != nil {
		grpcReq.DeviceInfo = &authpb.DeviceInfo{
			Platform:   commonpb.DevicePlatform(reqBody.DeviceInfo.Platform),
			DeviceName: reqBody.DeviceInfo.DeviceName,
			OsVersion:  reqBody.DeviceInfo.OSVersion,
			DeviceId:   reqBody.DeviceInfo.DeviceID,
		}
	}

	// Call gRPC service
	resp, err := h.authService.RefreshToken(r.Context(), grpcReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("Token refresh failed: %v", err), http.StatusUnauthorized)
		return
	}

	// Convert response to JSON (camelCase)
	jsonResp := map[string]interface{}{
		"tokens": map[string]interface{}{
			"accessToken": map[string]interface{}{
				"token":     resp.Tokens.AccessToken.Token,
				"tokenType": resp.Tokens.AccessToken.TokenType,
				"expiresAt": map[string]int64{
					"seconds": resp.Tokens.AccessToken.ExpiresAt.Seconds,
					"nanos":   int64(resp.Tokens.AccessToken.ExpiresAt.Nanos),
				},
			},
			"refreshToken": map[string]interface{}{
				"token": resp.Tokens.RefreshToken.Token,
				"expiresAt": map[string]int64{
					"seconds": resp.Tokens.RefreshToken.ExpiresAt.Seconds,
					"nanos":   int64(resp.Tokens.RefreshToken.ExpiresAt.Nanos),
				},
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(jsonResp)
}

// RevokeToken handles token revocation (logout)
func (h *Handler) RevokeToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse JSON request
	var reqBody struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
		return
	}

	// Convert to gRPC request
	grpcReq := &authpb.RevokeTokenRequest{
		RefreshToken: reqBody.RefreshToken,
	}

	// Call gRPC service
	resp, err := h.authService.RevokeToken(r.Context(), grpcReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("Token revocation failed: %v", err), http.StatusBadRequest)
		return
	}

	// Convert response to JSON
	jsonResp := map[string]interface{}{
		"message": resp.Message,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(jsonResp)
}
