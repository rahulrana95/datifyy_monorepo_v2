package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/lib/pq"
)

// DateSuggestion represents a date suggestion record
type DateSuggestion struct {
	ID                  int
	UserID              int
	SuggestedUserID     int
	CuratedMatchID      *int
	CompatibilityScore  float64
	Reasoning           string
	Status              string
	ScheduledDateID     *int
	CreatedAt           time.Time
	UpdatedAt           time.Time
	RespondedAt         *time.Time
}

// DateRejection represents a date rejection record
type DateRejection struct {
	ID               int
	UserID           int
	RejectedUserID   int
	SuggestionID     *int
	ScheduledDateID  *int
	Reasons          []string
	CustomReason     string
	CreatedAt        time.Time
}

// DateSuggestionsRepository handles database operations for date suggestions
type DateSuggestionsRepository struct {
	db *sql.DB
}

// NewDateSuggestionsRepository creates a new repository
func NewDateSuggestionsRepository(db *sql.DB) *DateSuggestionsRepository {
	return &DateSuggestionsRepository{db: db}
}

// Create creates a new date suggestion
func (r *DateSuggestionsRepository) Create(ctx context.Context, suggestion *DateSuggestion) error {
	query := `
		INSERT INTO datifyy_v2_date_suggestions (
			user_id, suggested_user_id, curated_match_id,
			compatibility_score, reasoning, status
		) VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx, query,
		suggestion.UserID, suggestion.SuggestedUserID, suggestion.CuratedMatchID,
		suggestion.CompatibilityScore, suggestion.Reasoning, suggestion.Status,
	).Scan(&suggestion.ID, &suggestion.CreatedAt, &suggestion.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create date suggestion: %w", err)
	}

	return nil
}

// GetByID retrieves a suggestion by ID
func (r *DateSuggestionsRepository) GetByID(ctx context.Context, id int) (*DateSuggestion, error) {
	query := `
		SELECT id, user_id, suggested_user_id, curated_match_id,
			   compatibility_score, reasoning, status, scheduled_date_id,
			   created_at, updated_at, responded_at
		FROM datifyy_v2_date_suggestions
		WHERE id = $1
	`

	suggestion := &DateSuggestion{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&suggestion.ID, &suggestion.UserID, &suggestion.SuggestedUserID, &suggestion.CuratedMatchID,
		&suggestion.CompatibilityScore, &suggestion.Reasoning, &suggestion.Status, &suggestion.ScheduledDateID,
		&suggestion.CreatedAt, &suggestion.UpdatedAt, &suggestion.RespondedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("suggestion not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get suggestion: %w", err)
	}

	return suggestion, nil
}

// ListByUser retrieves all suggestions for a user with optional status filter
func (r *DateSuggestionsRepository) ListByUser(ctx context.Context, userID int, status string, limit, offset int) ([]*DateSuggestion, error) {
	var query string
	var args []interface{}

	if status != "" {
		query = `
			SELECT id, user_id, suggested_user_id, curated_match_id,
				   compatibility_score, reasoning, status, scheduled_date_id,
				   created_at, updated_at, responded_at
			FROM datifyy_v2_date_suggestions
			WHERE user_id = $1 AND status = $2
			ORDER BY created_at DESC
			LIMIT $3 OFFSET $4
		`
		args = []interface{}{userID, status, limit, offset}
	} else {
		query = `
			SELECT id, user_id, suggested_user_id, curated_match_id,
				   compatibility_score, reasoning, status, scheduled_date_id,
				   created_at, updated_at, responded_at
			FROM datifyy_v2_date_suggestions
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`
		args = []interface{}{userID, limit, offset}
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list suggestions: %w", err)
	}
	defer rows.Close()

	var suggestions []*DateSuggestion
	for rows.Next() {
		suggestion := &DateSuggestion{}
		err := rows.Scan(
			&suggestion.ID, &suggestion.UserID, &suggestion.SuggestedUserID, &suggestion.CuratedMatchID,
			&suggestion.CompatibilityScore, &suggestion.Reasoning, &suggestion.Status, &suggestion.ScheduledDateID,
			&suggestion.CreatedAt, &suggestion.UpdatedAt, &suggestion.RespondedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan suggestion: %w", err)
		}
		suggestions = append(suggestions, suggestion)
	}

	return suggestions, nil
}

// Accept marks a suggestion as accepted
func (r *DateSuggestionsRepository) Accept(ctx context.Context, id int) error {
	now := time.Now()
	query := `UPDATE datifyy_v2_date_suggestions SET status = 'accepted', responded_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, now, id)
	if err != nil {
		return fmt.Errorf("failed to accept suggestion: %w", err)
	}
	return nil
}

// Reject marks a suggestion as rejected
func (r *DateSuggestionsRepository) Reject(ctx context.Context, id int) error {
	now := time.Now()
	query := `UPDATE datifyy_v2_date_suggestions SET status = 'rejected', responded_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, now, id)
	if err != nil {
		return fmt.Errorf("failed to reject suggestion: %w", err)
	}
	return nil
}

// CreateRejection creates a rejection record
func (r *DateSuggestionsRepository) CreateRejection(ctx context.Context, rejection *DateRejection) error {
	query := `
		INSERT INTO date_rejections (
			user_id, rejected_user_id, suggestion_id, scheduled_date_id,
			reasons, custom_reason
		) VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`

	err := r.db.QueryRowContext(
		ctx, query,
		rejection.UserID, rejection.RejectedUserID, rejection.SuggestionID, rejection.ScheduledDateID,
		pq.Array(rejection.Reasons), rejection.CustomReason,
	).Scan(&rejection.ID, &rejection.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create rejection: %w", err)
	}

	return nil
}

// GetRejectionsBetweenUsers checks if users have rejected each other
func (r *DateSuggestionsRepository) GetRejectionsBetweenUsers(ctx context.Context, user1ID, user2ID int) ([]*DateRejection, error) {
	query := `
		SELECT id, user_id, rejected_user_id, suggestion_id, scheduled_date_id,
			   reasons, custom_reason, created_at
		FROM date_rejections
		WHERE (user_id = $1 AND rejected_user_id = $2) OR (user_id = $2 AND rejected_user_id = $1)
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, user1ID, user2ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get rejections: %w", err)
	}
	defer rows.Close()

	var rejections []*DateRejection
	for rows.Next() {
		rejection := &DateRejection{}
		err := rows.Scan(
			&rejection.ID, &rejection.UserID, &rejection.RejectedUserID, &rejection.SuggestionID,
			&rejection.ScheduledDateID, pq.Array(&rejection.Reasons), &rejection.CustomReason,
			&rejection.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan rejection: %w", err)
		}
		rejections = append(rejections, rejection)
	}

	return rejections, nil
}

// CountByUserStatus counts date suggestions by status for a user
func (r *DateSuggestionsRepository) CountByUserStatus(ctx context.Context, userID int, status string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM datifyy_v2_date_suggestions WHERE user_id = $1 AND status = $2`
	err := r.db.QueryRowContext(ctx, query, userID, status).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count suggestions by status: %w", err)
	}
	return count, nil
}

// CountByUser counts total date suggestions for a user
func (r *DateSuggestionsRepository) CountByUser(ctx context.Context, userID int) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM datifyy_v2_date_suggestions WHERE user_id = $1`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count suggestions: %w", err)
	}
	return count, nil
}
