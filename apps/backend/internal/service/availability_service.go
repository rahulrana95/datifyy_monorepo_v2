package service

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"

	availabilitypb "github.com/datifyy/backend/gen/availability/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	"github.com/datifyy/backend/internal/repository"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// AvailabilityService handles availability operations
type AvailabilityService struct {
	availabilitypb.UnimplementedAvailabilityServiceServer
	availabilityRepo *repository.AvailabilityRepository
	db               *sql.DB
}

// NewAvailabilityService creates a new availability service
func NewAvailabilityService(db *sql.DB) *AvailabilityService {
	return &AvailabilityService{
		availabilityRepo: repository.NewAvailabilityRepository(db),
		db:               db,
	}
}

// GetAvailability gets user's availability slots
func (s *AvailabilityService) GetAvailability(
	ctx context.Context,
	req *availabilitypb.GetAvailabilityRequest,
) (*availabilitypb.GetAvailabilityResponse, error) {
	// Get user ID (either from request or context)
	var userID int
	var err error

	if req.UserId != "" {
		userID, err = strconv.Atoi(req.UserId)
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "invalid user_id format")
		}
	} else {
		// Get from auth context
		userID, err = getUserIDFromContext(ctx)
		if err != nil {
			return nil, status.Error(codes.Unauthenticated, "authentication required")
		}
	}

	// Get slots from repository
	slots, err := s.availabilityRepo.GetByUserID(ctx, userID, req.FromTime, req.ToTime)
	if err != nil {
		return nil, status.Error(codes.Internal, fmt.Sprintf("failed to get availability: %v", err))
	}

	// Convert to proto
	pbSlots := make([]*availabilitypb.AvailabilitySlot, len(slots))
	for i, slot := range slots {
		pbSlots[i] = convertSlotToProto(slot)
	}

	return &availabilitypb.GetAvailabilityResponse{
		Slots: pbSlots,
		Pagination: &commonpb.PaginationResponse{
			TotalCount: int64(len(pbSlots)),
		},
	}, nil
}

// SubmitAvailability creates multiple availability slots
func (s *AvailabilityService) SubmitAvailability(
	ctx context.Context,
	req *availabilitypb.SubmitAvailabilityRequest,
) (*availabilitypb.SubmitAvailabilityResponse, error) {
	// Get user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	if len(req.Slots) == 0 {
		return nil, status.Error(codes.InvalidArgument, "at least one slot is required")
	}

	var createdSlots []*availabilitypb.AvailabilitySlot
	validationErrors := make(map[int32]string)

	for i, slotInput := range req.Slots {
		// Convert date type enum to string
		dateTypeStr := dateTypeToString(slotInput.DateType)

		// Build input
		input := repository.CreateSlotInput{
			UserID:    userID,
			StartTime: slotInput.StartTime,
			EndTime:   slotInput.EndTime,
			DateType:  dateTypeStr,
			Notes:     slotInput.Notes,
		}

		// Add offline location if provided
		if slotInput.OfflineLocation != nil {
			input.PlaceName = slotInput.OfflineLocation.PlaceName
			input.Address = slotInput.OfflineLocation.Address
			input.City = slotInput.OfflineLocation.City
			input.State = slotInput.OfflineLocation.State
			input.Country = slotInput.OfflineLocation.Country
			input.Zipcode = slotInput.OfflineLocation.Zipcode
			input.Latitude = slotInput.OfflineLocation.Latitude
			input.Longitude = slotInput.OfflineLocation.Longitude
			input.GooglePlaceID = slotInput.OfflineLocation.GooglePlaceId
			input.GoogleMapsURL = slotInput.OfflineLocation.GoogleMapsUrl
		}

		// Create slot
		slot, err := s.availabilityRepo.Create(ctx, input)
		if err != nil {
			// Record validation error but continue with other slots
			validationErrors[int32(i)] = err.Error()
			continue
		}

		createdSlots = append(createdSlots, convertSlotToProto(slot))
	}

	message := fmt.Sprintf("Successfully created %d out of %d slots", len(createdSlots), len(req.Slots))
	if len(validationErrors) > 0 {
		message += fmt.Sprintf(", %d failed", len(validationErrors))
	}

	return &availabilitypb.SubmitAvailabilityResponse{
		CreatedSlots:     createdSlots,
		CreatedCount:     int32(len(createdSlots)),
		ValidationErrors: validationErrors,
		Message:          message,
	}, nil
}

// DeleteAvailability deletes an availability slot
func (s *AvailabilityService) DeleteAvailability(
	ctx context.Context,
	req *availabilitypb.DeleteAvailabilityRequest,
) (*availabilitypb.DeleteAvailabilityResponse, error) {
	// Get user ID from auth context
	userID, err := getUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "authentication required")
	}

	// Parse slot ID
	slotID, err := strconv.Atoi(req.SlotId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid slot_id format")
	}

	// Delete slot
	err = s.availabilityRepo.Delete(ctx, slotID, userID)
	if err != nil {
		if err == repository.ErrSlotNotFound {
			return nil, status.Error(codes.NotFound, "slot not found or not owned by user")
		}
		return nil, status.Error(codes.Internal, fmt.Sprintf("failed to delete slot: %v", err))
	}

	return &availabilitypb.DeleteAvailabilityResponse{
		Success: true,
		Message: "Slot deleted successfully",
	}, nil
}

// Helper function to convert date type enum to string
func dateTypeToString(dt availabilitypb.DateType) string {
	switch dt {
	case availabilitypb.DateType_DATE_TYPE_ONLINE:
		return "online"
	case availabilitypb.DateType_DATE_TYPE_OFFLINE:
		return "offline"
	case availabilitypb.DateType_DATE_TYPE_OFFLINE_EVENT:
		return "offline_event"
	default:
		return "online"
	}
}

// Helper function to convert string to date type enum
func stringToDateType(s string) availabilitypb.DateType {
	switch s {
	case "online":
		return availabilitypb.DateType_DATE_TYPE_ONLINE
	case "offline":
		return availabilitypb.DateType_DATE_TYPE_OFFLINE
	case "offline_event":
		return availabilitypb.DateType_DATE_TYPE_OFFLINE_EVENT
	default:
		return availabilitypb.DateType_DATE_TYPE_UNSPECIFIED
	}
}

// Helper function to convert repository slot to proto
func convertSlotToProto(slot *repository.AvailabilitySlot) *availabilitypb.AvailabilitySlot {
	pbSlot := &availabilitypb.AvailabilitySlot{
		SlotId:    strconv.Itoa(slot.ID),
		UserId:    strconv.Itoa(slot.UserID),
		StartTime: slot.StartTime,
		EndTime:   slot.EndTime,
		DateType:  stringToDateType(slot.DateType),
		CreatedAt: &commonpb.Timestamp{
			Seconds: slot.CreatedAt.Unix(),
		},
		UpdatedAt: &commonpb.Timestamp{
			Seconds: slot.UpdatedAt.Unix(),
		},
	}

	// Add notes if present
	if slot.Notes.Valid {
		pbSlot.Notes = slot.Notes.String
	}

	// Add offline location if present
	if slot.PlaceName.Valid || slot.Address.Valid {
		pbSlot.OfflineLocation = &availabilitypb.OfflineLocation{
			PlaceName:     slot.PlaceName.String,
			Address:       slot.Address.String,
			City:          slot.City.String,
			State:         slot.State.String,
			Country:       slot.Country.String,
			Zipcode:       slot.Zipcode.String,
			Latitude:      slot.Latitude.Float64,
			Longitude:     slot.Longitude.Float64,
			GooglePlaceId: slot.GooglePlaceID.String,
			GoogleMapsUrl: slot.GoogleMapsURL.String,
		}
	}

	return pbSlot
}
