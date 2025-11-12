package service

import (
	"context"
	"fmt"
	"time"
)

// extractTokenFromContext extracts the access token from gRPC metadata context
func extractTokenFromContext(ctx context.Context) string {
	// TODO: Import google.golang.org/grpc/metadata when implementing
	// For now, return empty string - this will be implemented with auth middleware
	// md, ok := metadata.FromIncomingContext(ctx)
	// if !ok {
	//     return ""
	// }
	//
	// authHeaders := md.Get("authorization")
	// if len(authHeaders) == 0 {
	//     return ""
	// }
	//
	// // Handle "Bearer {token}" format
	// token := strings.TrimPrefix(authHeaders[0], "Bearer ")
	// return token

	return "" // Placeholder until we add gRPC metadata support
}

// generatePlaceholderToken generates a simple placeholder token
// TODO: Replace with proper JWT implementation
func generatePlaceholderToken(userID int, tokenType string) string {
	return fmt.Sprintf("%s_token_%d_%d", tokenType, userID, time.Now().Unix())
}
