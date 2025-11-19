package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

var (
	ErrSlotNotFound       = errors.New("availability slot not found")
	ErrDuplicateSlot      = errors.New("duplicate availability slot")
	ErrInvalidTimeRange   = errors.New("invalid time range")
	ErrInvalidDuration    = errors.New("slot duration must be exactly 1 hour")
	ErrSlotTooSoon        = errors.New("slot must be at least 24 hours in the future")
	ErrMissingOfflineInfo = errors.New("offline location info required for offline/offline_event dates")
)

// AvailabilitySlot represents an availability slot in the database
type AvailabilitySlot struct {
	ID            int
	UserID        int
	StartTime     int64
	EndTime       int64
	DateType      string
	PlaceName     sql.NullString
	Address       sql.NullString
	City          sql.NullString
	State         sql.NullString
	Country       sql.NullString
	Zipcode       sql.NullString
	Latitude      sql.NullFloat64
	Longitude     sql.NullFloat64
	GooglePlaceID sql.NullString
	GoogleMapsURL sql.NullString
	Notes         sql.NullString
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// CreateSlotInput represents input for creating an availability slot
type CreateSlotInput struct {
	UserID        int
	StartTime     int64
	EndTime       int64
	DateType      string
	PlaceName     string
	Address       string
	City          string
	State         string
	Country       string
	Zipcode       string
	Latitude      float64
	Longitude     float64
	GooglePlaceID string
	GoogleMapsURL string
	Notes         string
}

// AvailabilityRepository handles availability database operations
type AvailabilityRepository struct {
	db *sql.DB
}

// NewAvailabilityRepository creates a new availability repository
func NewAvailabilityRepository(db *sql.DB) *AvailabilityRepository {
	return &AvailabilityRepository{db: db}
}

// ValidateSlot validates a slot before creation
func (r *AvailabilityRepository) ValidateSlot(input CreateSlotInput) error {
	// Check that end time is after start time
	if input.EndTime <= input.StartTime {
		return ErrInvalidTimeRange
	}

	// Check that duration is exactly 1 hour (3600 seconds)
	if input.EndTime-input.StartTime != 3600 {
		return ErrInvalidDuration
	}

	// Check that slot is at least 24 hours in the future
	now := time.Now().Unix()
	minTime := now + (24 * 3600) // 24 hours from now
	if input.StartTime < minTime {
		return ErrSlotTooSoon
	}

	// Check offline location info for offline/offline_event types
	if input.DateType == "offline" || input.DateType == "offline_event" {
		if input.PlaceName == "" || input.Address == "" || input.City == "" ||
			input.State == "" || input.Country == "" || input.Zipcode == "" {
			return ErrMissingOfflineInfo
		}
	}

	return nil
}

// Create creates a new availability slot
func (r *AvailabilityRepository) Create(ctx context.Context, input CreateSlotInput) (*AvailabilitySlot, error) {
	// Validate the slot
	if err := r.ValidateSlot(input); err != nil {
		return nil, err
	}

	// Check for duplicate slot
	var exists bool
	err := r.db.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM availability_slots WHERE user_id = $1 AND start_time = $2)",
		input.UserID, input.StartTime,
	).Scan(&exists)

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	if exists {
		return nil, ErrDuplicateSlot
	}

	// Insert slot
	query := `
		INSERT INTO availability_slots (
			user_id, start_time, end_time, date_type,
			place_name, address, city, state, country, zipcode,
			latitude, longitude, google_place_id, google_maps_url, notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id, user_id, start_time, end_time, date_type,
		          place_name, address, city, state, country, zipcode,
		          latitude, longitude, google_place_id, google_maps_url, notes,
		          created_at, updated_at
	`

	slot := &AvailabilitySlot{}
	err = r.db.QueryRowContext(ctx, query,
		input.UserID,
		input.StartTime,
		input.EndTime,
		input.DateType,
		nullString(input.PlaceName),
		nullString(input.Address),
		nullString(input.City),
		nullString(input.State),
		nullString(input.Country),
		nullString(input.Zipcode),
		nullFloat64(input.Latitude),
		nullFloat64(input.Longitude),
		nullString(input.GooglePlaceID),
		nullString(input.GoogleMapsURL),
		nullString(input.Notes),
	).Scan(
		&slot.ID,
		&slot.UserID,
		&slot.StartTime,
		&slot.EndTime,
		&slot.DateType,
		&slot.PlaceName,
		&slot.Address,
		&slot.City,
		&slot.State,
		&slot.Country,
		&slot.Zipcode,
		&slot.Latitude,
		&slot.Longitude,
		&slot.GooglePlaceID,
		&slot.GoogleMapsURL,
		&slot.Notes,
		&slot.CreatedAt,
		&slot.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return slot, nil
}

// GetByUserID gets all availability slots for a user
func (r *AvailabilityRepository) GetByUserID(ctx context.Context, userID int, fromTime, toTime int64) ([]*AvailabilitySlot, error) {
	query := `
		SELECT id, user_id, start_time, end_time, date_type,
		       place_name, address, city, state, country, zipcode,
		       latitude, longitude, google_place_id, google_maps_url, notes,
		       created_at, updated_at
		FROM availability_slots
		WHERE user_id = $1
	`
	args := []interface{}{userID}

	if fromTime > 0 {
		query += fmt.Sprintf(" AND start_time >= $%d", len(args)+1)
		args = append(args, fromTime)
	}

	if toTime > 0 {
		query += fmt.Sprintf(" AND start_time <= $%d", len(args)+1)
		args = append(args, toTime)
	}

	query += " ORDER BY start_time ASC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}
	defer rows.Close()

	var slots []*AvailabilitySlot
	for rows.Next() {
		slot := &AvailabilitySlot{}
		err := rows.Scan(
			&slot.ID,
			&slot.UserID,
			&slot.StartTime,
			&slot.EndTime,
			&slot.DateType,
			&slot.PlaceName,
			&slot.Address,
			&slot.City,
			&slot.State,
			&slot.Country,
			&slot.Zipcode,
			&slot.Latitude,
			&slot.Longitude,
			&slot.GooglePlaceID,
			&slot.GoogleMapsURL,
			&slot.Notes,
			&slot.CreatedAt,
			&slot.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
		}
		slots = append(slots, slot)
	}

	return slots, nil
}

// GetByID gets a slot by ID
func (r *AvailabilityRepository) GetByID(ctx context.Context, slotID int) (*AvailabilitySlot, error) {
	query := `
		SELECT id, user_id, start_time, end_time, date_type,
		       place_name, address, city, state, country, zipcode,
		       latitude, longitude, google_place_id, google_maps_url, notes,
		       created_at, updated_at
		FROM availability_slots
		WHERE id = $1
	`

	slot := &AvailabilitySlot{}
	err := r.db.QueryRowContext(ctx, query, slotID).Scan(
		&slot.ID,
		&slot.UserID,
		&slot.StartTime,
		&slot.EndTime,
		&slot.DateType,
		&slot.PlaceName,
		&slot.Address,
		&slot.City,
		&slot.State,
		&slot.Country,
		&slot.Zipcode,
		&slot.Latitude,
		&slot.Longitude,
		&slot.GooglePlaceID,
		&slot.GoogleMapsURL,
		&slot.Notes,
		&slot.CreatedAt,
		&slot.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrSlotNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	return slot, nil
}

// Delete deletes an availability slot
func (r *AvailabilityRepository) Delete(ctx context.Context, slotID, userID int) error {
	result, err := r.db.ExecContext(ctx,
		"DELETE FROM availability_slots WHERE id = $1 AND user_id = $2",
		slotID, userID,
	)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrDatabaseError, err)
	}

	if rowsAffected == 0 {
		return ErrSlotNotFound
	}

	return nil
}

// Helper functions for nullable types
func nullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}

func nullFloat64(f float64) sql.NullFloat64 {
	if f == 0 {
		return sql.NullFloat64{}
	}
	return sql.NullFloat64{Float64: f, Valid: true}
}
