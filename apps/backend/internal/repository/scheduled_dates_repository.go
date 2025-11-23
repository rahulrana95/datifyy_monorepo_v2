package repository

import (
	"context"
	"database/sql"
	"fmt"
)

// ScheduledDatesRepository handles database operations for scheduled dates
type ScheduledDatesRepository struct {
	db *sql.DB
}

// NewScheduledDatesRepository creates a new repository
func NewScheduledDatesRepository(db *sql.DB) *ScheduledDatesRepository {
	return &ScheduledDatesRepository{db: db}
}

// Create creates a new scheduled date
func (r *ScheduledDatesRepository) Create(ctx context.Context, date *ScheduledDate) error {
	query := `
		INSERT INTO scheduled_dates (
			user1_id, user2_id, genie_id, scheduled_time, duration_minutes,
			status, date_type, notes, admin_notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx, query,
		date.User1ID, date.User2ID, date.GenieID, date.ScheduledTime, date.DurationMinutes,
		date.Status, date.DateType, date.Notes, date.AdminNotes,
	).Scan(&date.ID, &date.CreatedAt, &date.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create scheduled date: %w", err)
	}

	return nil
}

// GetByID retrieves a scheduled date by ID
func (r *ScheduledDatesRepository) GetByID(ctx context.Context, id int) (*ScheduledDate, error) {
	query := `
		SELECT id, user1_id, user2_id, genie_id, scheduled_time, duration_minutes,
			   status, date_type, place_name, address, city, state, country, zipcode,
			   latitude, longitude, notes, admin_notes, created_at, updated_at,
			   confirmed_at, completed_at, cancelled_at
		FROM scheduled_dates
		WHERE id = $1
	`

	date := &ScheduledDate{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&date.ID, &date.User1ID, &date.User2ID, &date.GenieID, &date.ScheduledTime, &date.DurationMinutes,
		&date.Status, &date.DateType, &date.PlaceName, &date.Address, &date.City, &date.State, &date.Country, &date.Zipcode,
		&date.Latitude, &date.Longitude, &date.Notes, &date.AdminNotes, &date.CreatedAt, &date.UpdatedAt,
		&date.ConfirmedAt, &date.CompletedAt, &date.CancelledAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("scheduled date not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get scheduled date: %w", err)
	}

	return date, nil
}

// UpdateStatus updates the status of a scheduled date
func (r *ScheduledDatesRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	query := `UPDATE scheduled_dates SET status = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, status, id)
	if err != nil {
		return fmt.Errorf("failed to update scheduled date status: %w", err)
	}
	return nil
}

// ListByUserUpcoming retrieves upcoming scheduled dates for a user
func (r *ScheduledDatesRepository) ListByUserUpcoming(ctx context.Context, userID int, limit, offset int) ([]*ScheduledDate, error) {
	query := `
		SELECT id, user1_id, user2_id, genie_id, scheduled_time, duration_minutes,
			   status, date_type, place_name, address, city, state, country, zipcode,
			   latitude, longitude, notes, admin_notes, created_at, updated_at,
			   confirmed_at, completed_at, cancelled_at
		FROM scheduled_dates
		WHERE (user1_id = $1 OR user2_id = $1)
		  AND scheduled_time > NOW()
		  AND status IN ('scheduled', 'confirmed')
		ORDER BY scheduled_time ASC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list upcoming dates: %w", err)
	}
	defer rows.Close()

	var dates []*ScheduledDate
	for rows.Next() {
		date := &ScheduledDate{}
		err := rows.Scan(
			&date.ID, &date.User1ID, &date.User2ID, &date.GenieID, &date.ScheduledTime, &date.DurationMinutes,
			&date.Status, &date.DateType, &date.PlaceName, &date.Address, &date.City, &date.State, &date.Country, &date.Zipcode,
			&date.Latitude, &date.Longitude, &date.Notes, &date.AdminNotes, &date.CreatedAt, &date.UpdatedAt,
			&date.ConfirmedAt, &date.CompletedAt, &date.CancelledAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan scheduled date: %w", err)
		}
		dates = append(dates, date)
	}

	return dates, nil
}

// ListByUserPast retrieves past scheduled dates for a user
func (r *ScheduledDatesRepository) ListByUserPast(ctx context.Context, userID int, limit, offset int) ([]*ScheduledDate, error) {
	query := `
		SELECT id, user1_id, user2_id, genie_id, scheduled_time, duration_minutes,
			   status, date_type, place_name, address, city, state, country, zipcode,
			   latitude, longitude, notes, admin_notes, created_at, updated_at,
			   confirmed_at, completed_at, cancelled_at
		FROM scheduled_dates
		WHERE (user1_id = $1 OR user2_id = $1)
		  AND (
			status = 'completed'
			OR status = 'cancelled'
			OR status = 'no_show'
			OR (scheduled_time < NOW() AND status IN ('scheduled', 'confirmed'))
		  )
		ORDER BY scheduled_time DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list past dates: %w", err)
	}
	defer rows.Close()

	var dates []*ScheduledDate
	for rows.Next() {
		date := &ScheduledDate{}
		err := rows.Scan(
			&date.ID, &date.User1ID, &date.User2ID, &date.GenieID, &date.ScheduledTime, &date.DurationMinutes,
			&date.Status, &date.DateType, &date.PlaceName, &date.Address, &date.City, &date.State, &date.Country, &date.Zipcode,
			&date.Latitude, &date.Longitude, &date.Notes, &date.AdminNotes, &date.CreatedAt, &date.UpdatedAt,
			&date.ConfirmedAt, &date.CompletedAt, &date.CancelledAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan scheduled date: %w", err)
		}
		dates = append(dates, date)
	}

	return dates, nil
}

// CountByUserUpcoming counts upcoming dates for a user
func (r *ScheduledDatesRepository) CountByUserUpcoming(ctx context.Context, userID int) (int, error) {
	var count int
	query := `
		SELECT COUNT(*)
		FROM scheduled_dates
		WHERE (user1_id = $1 OR user2_id = $1)
		  AND scheduled_time > NOW()
		  AND status IN ('scheduled', 'confirmed')
	`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count upcoming dates: %w", err)
	}
	return count, nil
}

// CountByUserPast counts past dates for a user
func (r *ScheduledDatesRepository) CountByUserPast(ctx context.Context, userID int) (int, error) {
	var count int
	query := `
		SELECT COUNT(*)
		FROM scheduled_dates
		WHERE (user1_id = $1 OR user2_id = $1)
		  AND (
			status = 'completed'
			OR status = 'cancelled'
			OR status = 'no_show'
			OR (scheduled_time < NOW() AND status IN ('scheduled', 'confirmed'))
		  )
	`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count past dates: %w", err)
	}
	return count, nil
}

// CountByUserStatus counts dates by status for a user
func (r *ScheduledDatesRepository) CountByUserStatus(ctx context.Context, userID int, status string) (int, error) {
	var count int
	query := `
		SELECT COUNT(*)
		FROM scheduled_dates
		WHERE (user1_id = $1 OR user2_id = $1)
		  AND status = $2
	`
	err := r.db.QueryRowContext(ctx, query, userID, status).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count dates by status: %w", err)
	}
	return count, nil
}

// CountByUser counts total scheduled dates for a user
func (r *ScheduledDatesRepository) CountByUser(ctx context.Context, userID int) (int, error) {
	var count int
	query := `
		SELECT COUNT(*)
		FROM scheduled_dates
		WHERE user1_id = $1 OR user2_id = $1
	`
	err := r.db.QueryRowContext(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count user dates: %w", err)
	}
	return count, nil
}
