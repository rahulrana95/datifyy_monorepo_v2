package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/lib/pq"
)

// CuratedMatch represents a curated match record
type CuratedMatch struct {
	ID                  int
	User1ID             int
	User2ID             int
	CompatibilityScore  float64
	IsMatch             bool
	Reasoning           string
	MatchedAspects      []string
	MismatchedAspects   []string
	AIProvider          string
	AIModel             string
	Status              string
	CreatedByAdmin      *int
	ScheduledDateID     *int
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

// CuratedMatchesRepository handles database operations for curated matches
type CuratedMatchesRepository struct {
	db *sql.DB
}

// NewCuratedMatchesRepository creates a new repository
func NewCuratedMatchesRepository(db *sql.DB) *CuratedMatchesRepository {
	return &CuratedMatchesRepository{db: db}
}

// Create creates a new curated match
func (r *CuratedMatchesRepository) Create(ctx context.Context, match *CuratedMatch) error {
	query := `
		INSERT INTO curated_matches (
			user1_id, user2_id, compatibility_score, is_match,
			reasoning, matched_aspects, mismatched_aspects,
			ai_provider, ai_model, status, created_by_admin
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx, query,
		match.User1ID, match.User2ID, match.CompatibilityScore, match.IsMatch,
		match.Reasoning, pq.Array(match.MatchedAspects), pq.Array(match.MismatchedAspects),
		match.AIProvider, match.AIModel, match.Status, match.CreatedByAdmin,
	).Scan(&match.ID, &match.CreatedAt, &match.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create curated match: %w", err)
	}

	return nil
}

// GetByID retrieves a curated match by ID
func (r *CuratedMatchesRepository) GetByID(ctx context.Context, id int) (*CuratedMatch, error) {
	query := `
		SELECT id, user1_id, user2_id, compatibility_score, is_match,
			   reasoning, matched_aspects, mismatched_aspects,
			   ai_provider, ai_model, status, created_by_admin,
			   scheduled_date_id, created_at, updated_at
		FROM curated_matches
		WHERE id = $1
	`

	match := &CuratedMatch{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&match.ID, &match.User1ID, &match.User2ID, &match.CompatibilityScore, &match.IsMatch,
		&match.Reasoning, pq.Array(&match.MatchedAspects), pq.Array(&match.MismatchedAspects),
		&match.AIProvider, &match.AIModel, &match.Status, &match.CreatedByAdmin,
		&match.ScheduledDateID, &match.CreatedAt, &match.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("curated match not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get curated match: %w", err)
	}

	return match, nil
}

// GetByUserPair retrieves a match between two users (order-independent)
func (r *CuratedMatchesRepository) GetByUserPair(ctx context.Context, user1ID, user2ID int) (*CuratedMatch, error) {
	query := `
		SELECT id, user1_id, user2_id, compatibility_score, is_match,
			   reasoning, matched_aspects, mismatched_aspects,
			   ai_provider, ai_model, status, created_by_admin,
			   scheduled_date_id, created_at, updated_at
		FROM curated_matches
		WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
	`

	match := &CuratedMatch{}
	err := r.db.QueryRowContext(ctx, query, user1ID, user2ID).Scan(
		&match.ID, &match.User1ID, &match.User2ID, &match.CompatibilityScore, &match.IsMatch,
		&match.Reasoning, pq.Array(&match.MatchedAspects), pq.Array(&match.MismatchedAspects),
		&match.AIProvider, &match.AIModel, &match.Status, &match.CreatedByAdmin,
		&match.ScheduledDateID, &match.CreatedAt, &match.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil // Not found is not an error
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get curated match: %w", err)
	}

	return match, nil
}

// ListByAdmin retrieves all matches created by a specific admin
func (r *CuratedMatchesRepository) ListByAdmin(ctx context.Context, adminID int, limit, offset int) ([]*CuratedMatch, error) {
	query := `
		SELECT id, user1_id, user2_id, compatibility_score, is_match,
			   reasoning, matched_aspects, mismatched_aspects,
			   ai_provider, ai_model, status, created_by_admin,
			   scheduled_date_id, created_at, updated_at
		FROM curated_matches
		WHERE created_by_admin = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, adminID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list curated matches: %w", err)
	}
	defer rows.Close()

	var matches []*CuratedMatch
	for rows.Next() {
		match := &CuratedMatch{}
		err := rows.Scan(
			&match.ID, &match.User1ID, &match.User2ID, &match.CompatibilityScore, &match.IsMatch,
			&match.Reasoning, pq.Array(&match.MatchedAspects), pq.Array(&match.MismatchedAspects),
			&match.AIProvider, &match.AIModel, &match.Status, &match.CreatedByAdmin,
			&match.ScheduledDateID, &match.CreatedAt, &match.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan curated match: %w", err)
		}
		matches = append(matches, match)
	}

	return matches, nil
}

// UpdateStatus updates the status of a curated match
func (r *CuratedMatchesRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	query := `UPDATE curated_matches SET status = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("failed to update curated match status: %w", err)
	}
	return nil
}

// LinkScheduledDate links a scheduled date to a curated match
func (r *CuratedMatchesRepository) LinkScheduledDate(ctx context.Context, matchID, scheduledDateID int) error {
	query := `UPDATE curated_matches SET scheduled_date_id = $1, status = 'scheduled' WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, scheduledDateID, matchID)
	if err != nil {
		return fmt.Errorf("failed to link scheduled date: %w", err)
	}
	return nil
}

// ListByStatus retrieves curated matches filtered by status
func (r *CuratedMatchesRepository) ListByStatus(ctx context.Context, status string, limit, offset int) ([]*CuratedMatch, error) {
	query := `
		SELECT id, user1_id, user2_id, compatibility_score, is_match,
			   reasoning, matched_aspects, mismatched_aspects,
			   ai_provider, ai_model, status, created_by_admin,
			   scheduled_date_id, created_at, updated_at
		FROM curated_matches
		WHERE status = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, status, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list curated matches by status: %w", err)
	}
	defer rows.Close()

	var matches []*CuratedMatch
	for rows.Next() {
		match := &CuratedMatch{}
		err := rows.Scan(
			&match.ID, &match.User1ID, &match.User2ID, &match.CompatibilityScore, &match.IsMatch,
			&match.Reasoning, pq.Array(&match.MatchedAspects), pq.Array(&match.MismatchedAspects),
			&match.AIProvider, &match.AIModel, &match.Status, &match.CreatedByAdmin,
			&match.ScheduledDateID, &match.CreatedAt, &match.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan curated match: %w", err)
		}
		matches = append(matches, match)
	}

	return matches, nil
}

// CountByStatus counts curated matches by status
func (r *CuratedMatchesRepository) CountByStatus(ctx context.Context, status string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM curated_matches WHERE status = $1`
	err := r.db.QueryRowContext(ctx, query, status).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count curated matches by status: %w", err)
	}
	return count, nil
}
