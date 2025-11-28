package availability

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	availabilitypb "github.com/datifyy/backend/gen/availability/v1"
	"github.com/datifyy/backend/internal/service"
	"github.com/datifyy/backend/internal/util/converter"
	"github.com/datifyy/backend/internal/util/parser"
)

// Handler handles availability HTTP requests
type Handler struct {
	availabilityService *service.AvailabilityService
}

// NewHandler creates a new availability handler
func NewHandler(availabilityService *service.AvailabilityService) *Handler {
	return &Handler{
		availabilityService: availabilityService,
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

// stringToDateTypeEnum converts string to DateType enum
func stringToDateTypeEnum(s string) availabilitypb.DateType {
	switch s {
	case "online", "DATE_TYPE_ONLINE":
		return availabilitypb.DateType_DATE_TYPE_ONLINE
	case "offline", "DATE_TYPE_OFFLINE":
		return availabilitypb.DateType_DATE_TYPE_OFFLINE
	case "offline_event", "DATE_TYPE_OFFLINE_EVENT":
		return availabilitypb.DateType_DATE_TYPE_OFFLINE_EVENT
	default:
		return availabilitypb.DateType_DATE_TYPE_ONLINE
	}
}

// Availability handles availability GET, POST, and DELETE requests
func (h *Handler) Availability(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from token
	userID, err := extractUserIDFromToken(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Add userID to context
	ctx := context.WithValue(r.Context(), "userID", userID)

	// Handle GET request (GetAvailability)
	if r.Method == http.MethodGet {
		// Parse query parameters
		fromTime := int64(0)
		toTime := int64(0)
		if ft := r.URL.Query().Get("from_time"); ft != "" {
			fromTime, _ = parser.ParseInt64(ft)
		}
		if tt := r.URL.Query().Get("to_time"); tt != "" {
			toTime, _ = parser.ParseInt64(tt)
		}

		grpcReq := &availabilitypb.GetAvailabilityRequest{
			FromTime: fromTime,
			ToTime:   toTime,
		}

		resp, err := h.availabilityService.GetAvailability(ctx, grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get availability: %v", err), http.StatusInternalServerError)
			return
		}

		// Convert to camelCase JSON
		slots := converter.AvailabilitySlotsToJSON(resp.Slots)

		jsonResp := map[string]interface{}{
			"slots":      slots,
			"totalCount": len(slots),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
		return
	}

	// Handle POST request (SubmitAvailability)
	if r.Method == http.MethodPost {
		var reqBody struct {
			Slots []struct {
				StartTime       int64  `json:"startTime"`
				EndTime         int64  `json:"endTime"`
				DateType        string `json:"dateType"`
				Notes           string `json:"notes"`
				OfflineLocation *struct {
					PlaceName     string  `json:"placeName"`
					Address       string  `json:"address"`
					City          string  `json:"city"`
					State         string  `json:"state"`
					Country       string  `json:"country"`
					Zipcode       string  `json:"zipcode"`
					Latitude      float64 `json:"latitude"`
					Longitude     float64 `json:"longitude"`
					GooglePlaceId string  `json:"googlePlaceId"`
					GoogleMapsUrl string  `json:"googleMapsUrl"`
				} `json:"offlineLocation"`
			} `json:"slots"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}

		// Convert to gRPC request
		pbSlots := make([]*availabilitypb.AvailabilitySlotInput, len(reqBody.Slots))
		for i, slot := range reqBody.Slots {
			pbSlot := &availabilitypb.AvailabilitySlotInput{
				StartTime: slot.StartTime,
				EndTime:   slot.EndTime,
				DateType:  stringToDateTypeEnum(slot.DateType),
				Notes:     slot.Notes,
			}

			if slot.OfflineLocation != nil {
				pbSlot.OfflineLocation = &availabilitypb.OfflineLocation{
					PlaceName:     slot.OfflineLocation.PlaceName,
					Address:       slot.OfflineLocation.Address,
					City:          slot.OfflineLocation.City,
					State:         slot.OfflineLocation.State,
					Country:       slot.OfflineLocation.Country,
					Zipcode:       slot.OfflineLocation.Zipcode,
					Latitude:      slot.OfflineLocation.Latitude,
					Longitude:     slot.OfflineLocation.Longitude,
					GooglePlaceId: slot.OfflineLocation.GooglePlaceId,
					GoogleMapsUrl: slot.OfflineLocation.GoogleMapsUrl,
				}
			}

			pbSlots[i] = pbSlot
		}

		grpcReq := &availabilitypb.SubmitAvailabilityRequest{
			Slots: pbSlots,
		}

		resp, err := h.availabilityService.SubmitAvailability(ctx, grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to submit availability: %v", err), http.StatusBadRequest)
			return
		}

		// Convert to camelCase JSON
		createdSlots := make([]map[string]interface{}, len(resp.CreatedSlots))
		for i, slot := range resp.CreatedSlots {
			createdSlots[i] = converter.AvailabilitySlotToJSON(slot)
		}

		// Convert validation errors map
		validationErrors := make(map[string]string)
		for k, v := range resp.ValidationErrors {
			validationErrors[fmt.Sprintf("%d", k)] = v
		}

		jsonResp := map[string]interface{}{
			"createdSlots":     createdSlots,
			"createdCount":     resp.CreatedCount,
			"validationErrors": validationErrors,
			"message":          resp.Message,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
		return
	}

	// Handle DELETE request (DeleteAvailability)
	if r.Method == http.MethodDelete {
		slotID := r.URL.Query().Get("slot_id")
		if slotID == "" {
			http.Error(w, "slot_id query parameter required", http.StatusBadRequest)
			return
		}

		grpcReq := &availabilitypb.DeleteAvailabilityRequest{
			SlotId: slotID,
		}

		resp, err := h.availabilityService.DeleteAvailability(ctx, grpcReq)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to delete availability: %v", err), http.StatusBadRequest)
			return
		}

		jsonResp := map[string]interface{}{
			"success": resp.Success,
			"message": resp.Message,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jsonResp)
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}
