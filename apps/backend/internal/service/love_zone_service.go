package service

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/datifyy/backend/internal/repository"
)

// LoveZoneService handles Love Zone dashboard operations
type LoveZoneService struct {
	db                   *sql.DB
	suggestionsRepo      *repository.DateSuggestionsRepository
	scheduledDatesRepo   *repository.ScheduledDatesRepository
	userRepo             *repository.UserRepository
	profileRepo          *repository.UserProfileRepository
}

// NewLoveZoneService creates a new Love Zone service
func NewLoveZoneService(db *sql.DB) *LoveZoneService {
	return &LoveZoneService{
		db:                 db,
		suggestionsRepo:    repository.NewDateSuggestionsRepository(db),
		scheduledDatesRepo: repository.NewScheduledDatesRepository(db),
		userRepo:           repository.NewUserRepository(db),
		profileRepo:        repository.NewUserProfileRepository(db),
	}
}

// UserSummary represents a light user summary for date displays
type UserSummary struct {
	ID         int
	Name       string
	Age        int
	Gender     string
	Location   string
	PhotoURL   string
	Bio        string
	Occupation string
}

// DateSuggestionDetail represents a date suggestion with user details
type DateSuggestionDetail struct {
	ID                 int
	SuggestedUser      *UserSummary
	CompatibilityScore float64
	Reasoning          string
	Status             string
	CreatedAt          string
}

// ScheduledDateDetail represents a scheduled date with user details
type ScheduledDateDetail struct {
	ID              int
	OtherUser       *UserSummary
	ScheduledTime   string
	DurationMinutes int
	Status          string
	DateType        string
	PlaceName       string
	Address         string
	City            string
	Notes           string
	CreatedAt       string
	ConfirmedAt     *string
	CompletedAt     *string
}

// RejectedDateDetail represents a rejected date suggestion
type RejectedDateDetail struct {
	ID                 int
	RejectedUser       *UserSummary
	CompatibilityScore float64
	RejectedAt         string
}

// LoveZoneStatistics represents Love Zone dashboard statistics
type LoveZoneStatistics struct {
	TotalSuggestions     int
	PendingSuggestions   int
	AcceptedSuggestions  int
	RejectedSuggestions  int
	TotalScheduledDates  int
	UpcomingDates        int
	PastDates            int
	CompletedDates       int
	CancelledDates       int
	AcceptanceRate       float64
	CompletionRate       float64
}

// LoveZoneDashboard represents the complete Love Zone dashboard
type LoveZoneDashboard struct {
	PendingSuggestions []*DateSuggestionDetail
	UpcomingDates      []*ScheduledDateDetail
	PastDates          []*ScheduledDateDetail
	RejectedDates      []*RejectedDateDetail
	Statistics         *LoveZoneStatistics
}

// getUserSummary fetches a light user summary by ID
func (s *LoveZoneService) getUserSummary(ctx context.Context, userID int) (*UserSummary, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	profile, err := s.profileRepo.GetProfileByUserID(ctx, userID)
	if err != nil && err.Error() != "profile not found" {
		return nil, fmt.Errorf("failed to get profile: %w", err)
	}

	summary := &UserSummary{
		ID:   user.ID,
		Name: user.Name,
	}

	if user.Gender.Valid {
		summary.Gender = user.Gender.String
	}

	if profile != nil {
		// Calculate age from date of birth if available
		if user.DateOfBirth.Valid {
			age := int(time.Since(user.DateOfBirth.Time).Hours() / 24 / 365)
			summary.Age = age
		}

		if profile.Bio.Valid {
			// Limit bio to 100 characters for summary
			if len(profile.Bio.String) > 100 {
				summary.Bio = profile.Bio.String[:100] + "..."
			} else {
				summary.Bio = profile.Bio.String
			}
		}

		// Occupation is JSONB, keep it simple for now
		if profile.Company.Valid {
			summary.Occupation = profile.Company.String
		} else if profile.JobTitle.Valid {
			summary.Occupation = profile.JobTitle.String
		}

		// Location is JSONB, keep it simple
		if profile.Hometown.Valid {
			summary.Location = profile.Hometown.String
		}

		// TODO: Add photo URL when photo storage is implemented
		summary.PhotoURL = ""
	}

	return summary, nil
}

// GetLoveZoneDashboard retrieves the complete Love Zone dashboard for a user
func (s *LoveZoneService) GetLoveZoneDashboard(ctx context.Context, userID int) (*LoveZoneDashboard, error) {
	// Fetch all data in parallel (could be optimized with goroutines)
	pendingSuggestions, err := s.GetDateSuggestions(ctx, userID, "pending", 10, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get pending suggestions: %w", err)
	}

	upcomingDates, err := s.GetUpcomingDates(ctx, userID, 10, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get upcoming dates: %w", err)
	}

	pastDates, err := s.GetPastDates(ctx, userID, 10, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get past dates: %w", err)
	}

	rejectedDates, err := s.GetRejectedDates(ctx, userID, 10, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get rejected dates: %w", err)
	}

	statistics, err := s.GetLoveZoneStatistics(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get statistics: %w", err)
	}

	return &LoveZoneDashboard{
		PendingSuggestions: pendingSuggestions,
		UpcomingDates:      upcomingDates,
		PastDates:          pastDates,
		RejectedDates:      rejectedDates,
		Statistics:         statistics,
	}, nil
}

// GetDateSuggestions retrieves date suggestions for a user
func (s *LoveZoneService) GetDateSuggestions(ctx context.Context, userID int, status string, limit, offset int) ([]*DateSuggestionDetail, error) {
	suggestions, err := s.suggestionsRepo.ListByUser(ctx, userID, status, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list suggestions: %w", err)
	}

	var details []*DateSuggestionDetail
	for _, suggestion := range suggestions {
		userSummary, err := s.getUserSummary(ctx, suggestion.SuggestedUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to get user summary: %w", err)
		}

		details = append(details, &DateSuggestionDetail{
			ID:                 suggestion.ID,
			SuggestedUser:      userSummary,
			CompatibilityScore: suggestion.CompatibilityScore,
			Reasoning:          suggestion.Reasoning,
			Status:             suggestion.Status,
			CreatedAt:          suggestion.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	return details, nil
}

// GetUpcomingDates retrieves upcoming scheduled dates for a user
func (s *LoveZoneService) GetUpcomingDates(ctx context.Context, userID int, limit, offset int) ([]*ScheduledDateDetail, error) {
	dates, err := s.scheduledDatesRepo.ListByUserUpcoming(ctx, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list upcoming dates: %w", err)
	}

	var details []*ScheduledDateDetail
	for _, date := range dates {
		// Determine which user is the "other user"
		otherUserID := date.User1ID
		if date.User1ID == userID {
			otherUserID = date.User2ID
		}

		otherUser, err := s.getUserSummary(ctx, otherUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to get other user summary: %w", err)
		}

		detail := &ScheduledDateDetail{
			ID:              date.ID,
			OtherUser:       otherUser,
			ScheduledTime:   date.ScheduledTime.Format("2006-01-02T15:04:05Z07:00"),
			DurationMinutes: date.DurationMinutes,
			Status:          date.Status,
			DateType:        date.DateType,
			CreatedAt:       date.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}

		if date.PlaceName.Valid {
			detail.PlaceName = date.PlaceName.String
		}
		if date.Address.Valid {
			detail.Address = date.Address.String
		}
		if date.City.Valid {
			detail.City = date.City.String
		}
		if date.Notes.Valid {
			detail.Notes = date.Notes.String
		}
		if date.ConfirmedAt.Valid {
			confirmedStr := date.ConfirmedAt.Time.Format("2006-01-02T15:04:05Z07:00")
			detail.ConfirmedAt = &confirmedStr
		}

		details = append(details, detail)
	}

	return details, nil
}

// GetPastDates retrieves past scheduled dates for a user
func (s *LoveZoneService) GetPastDates(ctx context.Context, userID int, limit, offset int) ([]*ScheduledDateDetail, error) {
	dates, err := s.scheduledDatesRepo.ListByUserPast(ctx, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list past dates: %w", err)
	}

	var details []*ScheduledDateDetail
	for _, date := range dates {
		// Determine which user is the "other user"
		otherUserID := date.User1ID
		if date.User1ID == userID {
			otherUserID = date.User2ID
		}

		otherUser, err := s.getUserSummary(ctx, otherUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to get other user summary: %w", err)
		}

		detail := &ScheduledDateDetail{
			ID:              date.ID,
			OtherUser:       otherUser,
			ScheduledTime:   date.ScheduledTime.Format("2006-01-02T15:04:05Z07:00"),
			DurationMinutes: date.DurationMinutes,
			Status:          date.Status,
			DateType:        date.DateType,
			CreatedAt:       date.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}

		if date.PlaceName.Valid {
			detail.PlaceName = date.PlaceName.String
		}
		if date.Address.Valid {
			detail.Address = date.Address.String
		}
		if date.City.Valid {
			detail.City = date.City.String
		}
		if date.Notes.Valid {
			detail.Notes = date.Notes.String
		}
		if date.ConfirmedAt.Valid {
			confirmedStr := date.ConfirmedAt.Time.Format("2006-01-02T15:04:05Z07:00")
			detail.ConfirmedAt = &confirmedStr
		}
		if date.CompletedAt.Valid {
			completedStr := date.CompletedAt.Time.Format("2006-01-02T15:04:05Z07:00")
			detail.CompletedAt = &completedStr
		}

		details = append(details, detail)
	}

	return details, nil
}

// GetRejectedDates retrieves rejected date suggestions for a user
func (s *LoveZoneService) GetRejectedDates(ctx context.Context, userID int, limit, offset int) ([]*RejectedDateDetail, error) {
	suggestions, err := s.suggestionsRepo.ListByUser(ctx, userID, "rejected", limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list rejected suggestions: %w", err)
	}

	var details []*RejectedDateDetail
	for _, suggestion := range suggestions {
		userSummary, err := s.getUserSummary(ctx, suggestion.SuggestedUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to get user summary: %w", err)
		}

		rejectedAt := suggestion.CreatedAt.Format("2006-01-02T15:04:05Z07:00")
		if suggestion.RespondedAt != nil {
			rejectedAt = suggestion.RespondedAt.Format("2006-01-02T15:04:05Z07:00")
		}

		details = append(details, &RejectedDateDetail{
			ID:                 suggestion.ID,
			RejectedUser:       userSummary,
			CompatibilityScore: suggestion.CompatibilityScore,
			RejectedAt:         rejectedAt,
		})
	}

	return details, nil
}

// GetLoveZoneStatistics retrieves statistics for the Love Zone dashboard
func (s *LoveZoneService) GetLoveZoneStatistics(ctx context.Context, userID int) (*LoveZoneStatistics, error) {
	// Get suggestion counts
	totalSuggestions, err := s.suggestionsRepo.CountByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to count total suggestions: %w", err)
	}

	pendingSuggestions, err := s.suggestionsRepo.CountByUserStatus(ctx, userID, "pending")
	if err != nil {
		return nil, fmt.Errorf("failed to count pending suggestions: %w", err)
	}

	acceptedSuggestions, err := s.suggestionsRepo.CountByUserStatus(ctx, userID, "accepted")
	if err != nil {
		return nil, fmt.Errorf("failed to count accepted suggestions: %w", err)
	}

	rejectedSuggestions, err := s.suggestionsRepo.CountByUserStatus(ctx, userID, "rejected")
	if err != nil {
		return nil, fmt.Errorf("failed to count rejected suggestions: %w", err)
	}

	// Get scheduled date counts
	totalScheduledDates, err := s.scheduledDatesRepo.CountByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to count total dates: %w", err)
	}

	upcomingDates, err := s.scheduledDatesRepo.CountByUserUpcoming(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to count upcoming dates: %w", err)
	}

	pastDates, err := s.scheduledDatesRepo.CountByUserPast(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to count past dates: %w", err)
	}

	completedDates, err := s.scheduledDatesRepo.CountByUserStatus(ctx, userID, "completed")
	if err != nil {
		return nil, fmt.Errorf("failed to count completed dates: %w", err)
	}

	cancelledDates, err := s.scheduledDatesRepo.CountByUserStatus(ctx, userID, "cancelled")
	if err != nil {
		return nil, fmt.Errorf("failed to count cancelled dates: %w", err)
	}

	// Calculate rates
	acceptanceRate := 0.0
	if totalSuggestions > 0 {
		acceptanceRate = (float64(acceptedSuggestions) / float64(totalSuggestions)) * 100.0
	}

	completionRate := 0.0
	if totalScheduledDates > 0 {
		completionRate = (float64(completedDates) / float64(totalScheduledDates)) * 100.0
	}

	return &LoveZoneStatistics{
		TotalSuggestions:    totalSuggestions,
		PendingSuggestions:  pendingSuggestions,
		AcceptedSuggestions: acceptedSuggestions,
		RejectedSuggestions: rejectedSuggestions,
		TotalScheduledDates: totalScheduledDates,
		UpcomingDates:       upcomingDates,
		PastDates:           pastDates,
		CompletedDates:      completedDates,
		CancelledDates:      cancelledDates,
		AcceptanceRate:      acceptanceRate,
		CompletionRate:      completionRate,
	}, nil
}
