package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"
)

// Error definitions
var (
	ErrAdminNotFound     = errors.New("admin user not found")
	ErrAdminEmailExists  = errors.New("admin email already exists")
	ErrDateNotFound      = errors.New("scheduled date not found")
	ErrInvalidDateStatus = errors.New("invalid date status")
)

// AdminUser represents an admin user in the database
type AdminUser struct {
	ID           int
	UserID       sql.NullInt64
	Email        string
	Name         string
	PasswordHash string
	Role         string
	IsGenie      bool
	IsActive     bool
	LastLoginAt  sql.NullTime
	CreatedAt    time.Time
	UpdatedAt    time.Time
	CreatedBy    sql.NullInt64
}

// ScheduledDate represents a scheduled date in the database
type ScheduledDate struct {
	ID              int
	User1ID         int
	User2ID         int
	GenieID         sql.NullInt64
	ScheduledTime   time.Time
	DurationMinutes int
	Status          string
	DateType        string
	PlaceName       sql.NullString
	Address         sql.NullString
	City            sql.NullString
	State           sql.NullString
	Country         sql.NullString
	Zipcode         sql.NullString
	Latitude        sql.NullFloat64
	Longitude       sql.NullFloat64
	Notes           sql.NullString
	AdminNotes      sql.NullString
	CreatedAt       time.Time
	UpdatedAt       time.Time
	ConfirmedAt     sql.NullTime
	CompletedAt     sql.NullTime
	CancelledAt     sql.NullTime
}

// UserWithDetails represents a user with all details for admin view
type UserWithDetails struct {
	User
	PhotoCount        int
	AvailabilityCount int
}

// AdminRepository handles admin database operations
type AdminRepository struct {
	db *sql.DB
}

// NewAdminRepository creates a new admin repository
func NewAdminRepository(db *sql.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

// =============================================================================
// Admin User Operations
// =============================================================================

// GetAdminByEmail retrieves an admin by email
func (r *AdminRepository) GetAdminByEmail(ctx context.Context, email string) (*AdminUser, error) {
	query := `
		SELECT id, user_id, email, name, password_hash, role, is_genie, is_active,
		       last_login_at, created_at, updated_at, created_by
		FROM admin_users
		WHERE email = $1 AND is_active = TRUE
	`

	var admin AdminUser
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&admin.ID, &admin.UserID, &admin.Email, &admin.Name, &admin.PasswordHash,
		&admin.Role, &admin.IsGenie, &admin.IsActive, &admin.LastLoginAt,
		&admin.CreatedAt, &admin.UpdatedAt, &admin.CreatedBy,
	)
	if err == sql.ErrNoRows {
		return nil, ErrAdminNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get admin: %w", err)
	}

	return &admin, nil
}

// GetAdminByID retrieves an admin by ID
func (r *AdminRepository) GetAdminByID(ctx context.Context, id int) (*AdminUser, error) {
	query := `
		SELECT id, user_id, email, name, password_hash, role, is_genie, is_active,
		       last_login_at, created_at, updated_at, created_by
		FROM admin_users
		WHERE id = $1
	`

	var admin AdminUser
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&admin.ID, &admin.UserID, &admin.Email, &admin.Name, &admin.PasswordHash,
		&admin.Role, &admin.IsGenie, &admin.IsActive, &admin.LastLoginAt,
		&admin.CreatedAt, &admin.UpdatedAt, &admin.CreatedBy,
	)
	if err == sql.ErrNoRows {
		return nil, ErrAdminNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get admin: %w", err)
	}

	return &admin, nil
}

// CreateAdmin creates a new admin user
func (r *AdminRepository) CreateAdmin(ctx context.Context, email, name, passwordHash, role string, isGenie bool, createdBy int) (*AdminUser, error) {
	query := `
		INSERT INTO admin_users (email, name, password_hash, role, is_genie, created_by)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, email, name, password_hash, role, is_genie, is_active,
		          last_login_at, created_at, updated_at, created_by
	`

	var admin AdminUser
	var createdByNull sql.NullInt64
	if createdBy > 0 {
		createdByNull = sql.NullInt64{Int64: int64(createdBy), Valid: true}
	}

	err := r.db.QueryRowContext(ctx, query, email, name, passwordHash, role, isGenie, createdByNull).Scan(
		&admin.ID, &admin.UserID, &admin.Email, &admin.Name, &admin.PasswordHash,
		&admin.Role, &admin.IsGenie, &admin.IsActive, &admin.LastLoginAt,
		&admin.CreatedAt, &admin.UpdatedAt, &admin.CreatedBy,
	)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return nil, ErrAdminEmailExists
		}
		return nil, fmt.Errorf("failed to create admin: %w", err)
	}

	return &admin, nil
}

// UpdateLastLogin updates the admin's last login time
func (r *AdminRepository) UpdateLastLogin(ctx context.Context, adminID int) error {
	query := `UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, adminID)
	return err
}

// =============================================================================
// User Management Operations
// =============================================================================

// GetAllUsers retrieves all users with pagination and sorting
func (r *AdminRepository) GetAllUsers(ctx context.Context, page, pageSize int, sortBy, sortOrder, statusFilter, genderFilter string) ([]UserWithDetails, int, error) {
	// Build WHERE clause
	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argCount := 0

	if statusFilter != "" {
		argCount++
		whereClauses = append(whereClauses, fmt.Sprintf("u.account_status = $%d", argCount))
		args = append(args, statusFilter)
	}

	if genderFilter != "" {
		argCount++
		whereClauses = append(whereClauses, fmt.Sprintf("u.gender = $%d", argCount))
		args = append(args, genderFilter)
	}

	whereClause := strings.Join(whereClauses, " AND ")

	// Build ORDER BY clause
	orderColumn := "u.created_at"
	switch sortBy {
	case "name":
		orderColumn = "u.name"
	case "email":
		orderColumn = "u.email"
	case "last_login":
		orderColumn = "u.last_login_at"
	case "age":
		orderColumn = "u.date_of_birth"
		if sortOrder == "asc" {
			sortOrder = "desc" // Reverse for age
		} else {
			sortOrder = "asc"
		}
	}

	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	// Get total count
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM users u WHERE %s`, whereClause)
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	// Get users with pagination
	offset := (page - 1) * pageSize
	argCount++
	args = append(args, pageSize)
	argCount++
	args = append(args, offset)

	query := fmt.Sprintf(`
		SELECT u.id, u.email, u.name, u.phone_number, u.photo_url, u.date_of_birth,
		       u.gender, u.account_status, u.email_verified, u.phone_verified,
		       u.created_at, u.last_login_at,
		       (SELECT COUNT(*) FROM user_photos WHERE user_id = u.id) as photo_count,
		       (SELECT COUNT(*) FROM availability_slots WHERE user_id = u.id) as availability_count
		FROM users u
		WHERE %s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderColumn, sortOrder, argCount-1, argCount)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []UserWithDetails
	for rows.Next() {
		var u UserWithDetails
		err := rows.Scan(
			&u.ID, &u.Email, &u.Name, &u.PhoneNumber, &u.PhotoURL, &u.DateOfBirth,
			&u.Gender, &u.AccountStatus, &u.EmailVerified, &u.PhoneVerified,
			&u.CreatedAt, &u.LastLoginAt, &u.PhotoCount, &u.AvailabilityCount,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, u)
	}

	return users, totalCount, nil
}

// SearchUsers searches users by query across multiple fields
func (r *AdminRepository) SearchUsers(ctx context.Context, query string, page, pageSize int, searchFields []string) ([]UserWithDetails, int, error) {
	// Build search conditions
	searchQuery := "%" + strings.ToLower(query) + "%"

	fields := []string{"name", "email", "phone_number"}
	if len(searchFields) > 0 {
		fields = searchFields
	}

	var conditions []string
	for _, field := range fields {
		switch field {
		case "name":
			conditions = append(conditions, "LOWER(u.name) LIKE $1")
		case "email":
			conditions = append(conditions, "LOWER(u.email) LIKE $1")
		case "phone":
			conditions = append(conditions, "LOWER(u.phone_number) LIKE $1")
		}
	}

	whereClause := strings.Join(conditions, " OR ")

	// Get total count
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM users u WHERE %s`, whereClause)
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, searchQuery).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count search results: %w", err)
	}

	// Get users
	offset := (page - 1) * pageSize
	mainQuery := fmt.Sprintf(`
		SELECT u.id, u.email, u.name, u.phone_number, u.photo_url, u.date_of_birth,
		       u.gender, u.account_status, u.email_verified, u.phone_verified,
		       u.created_at, u.last_login_at,
		       (SELECT COUNT(*) FROM user_photos WHERE user_id = u.id) as photo_count,
		       (SELECT COUNT(*) FROM availability_slots WHERE user_id = u.id) as availability_count
		FROM users u
		WHERE %s
		ORDER BY u.created_at DESC
		LIMIT $2 OFFSET $3
	`, whereClause)

	rows, err := r.db.QueryContext(ctx, mainQuery, searchQuery, pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search users: %w", err)
	}
	defer rows.Close()

	var users []UserWithDetails
	for rows.Next() {
		var u UserWithDetails
		err := rows.Scan(
			&u.ID, &u.Email, &u.Name, &u.PhoneNumber, &u.PhotoURL, &u.DateOfBirth,
			&u.Gender, &u.AccountStatus, &u.EmailVerified, &u.PhoneVerified,
			&u.CreatedAt, &u.LastLoginAt, &u.PhotoCount, &u.AvailabilityCount,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, u)
	}

	return users, totalCount, nil
}

// GetUserByID retrieves a user by ID
func (r *AdminRepository) GetUserByID(ctx context.Context, userID int) (*User, error) {
	query := `
		SELECT id, email, name, password_hash, phone_number, email_verified, phone_verified,
		       account_status, verification_token, password_reset_token, last_login_at,
		       photo_url, date_of_birth, gender, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user User
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.PhoneNumber,
		&user.EmailVerified, &user.PhoneVerified, &user.AccountStatus, &user.VerificationToken,
		&user.PasswordResetToken, &user.LastLoginAt, &user.PhotoURL, &user.DateOfBirth,
		&user.Gender, &user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// =============================================================================
// Date Suggestion Operations
// =============================================================================

// GetOppositeSexUsers gets users of opposite gender for date suggestions
func (r *AdminRepository) GetOppositeSexUsers(ctx context.Context, userID int, limit int) ([]UserWithDetails, error) {
	// First get the user's gender
	var userGender sql.NullString
	err := r.db.QueryRowContext(ctx, "SELECT gender FROM users WHERE id = $1", userID).Scan(&userGender)
	if err != nil {
		return nil, fmt.Errorf("failed to get user gender: %w", err)
	}

	// Determine opposite gender
	oppositeGender := "FEMALE"
	if userGender.Valid && strings.ToUpper(userGender.String) == "FEMALE" {
		oppositeGender = "MALE"
	}

	// Get opposite sex users with availability
	query := `
		SELECT DISTINCT u.id, u.email, u.name, u.phone_number, u.photo_url, u.date_of_birth,
		       u.gender, u.account_status, u.email_verified, u.phone_verified,
		       u.created_at, u.last_login_at,
		       (SELECT COUNT(*) FROM user_photos WHERE user_id = u.id) as photo_count,
		       (SELECT COUNT(*) FROM availability_slots WHERE user_id = u.id) as availability_count
		FROM users u
		INNER JOIN availability_slots a ON a.user_id = u.id
		WHERE u.gender = $1
		  AND u.account_status = 'ACTIVE'
		  AND u.id != $2
		  AND a.start_time > NOW()
		ORDER BY u.created_at DESC
		LIMIT $3
	`

	rows, err := r.db.QueryContext(ctx, query, oppositeGender, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get suggestions: %w", err)
	}
	defer rows.Close()

	var users []UserWithDetails
	for rows.Next() {
		var u UserWithDetails
		err := rows.Scan(
			&u.ID, &u.Email, &u.Name, &u.PhoneNumber, &u.PhotoURL, &u.DateOfBirth,
			&u.Gender, &u.AccountStatus, &u.EmailVerified, &u.PhoneVerified,
			&u.CreatedAt, &u.LastLoginAt, &u.PhotoCount, &u.AvailabilityCount,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, u)
	}

	return users, nil
}

// =============================================================================
// Scheduled Date Operations
// =============================================================================

// CreateScheduledDate creates a new scheduled date
func (r *AdminRepository) CreateScheduledDate(ctx context.Context, date *ScheduledDate) (*ScheduledDate, error) {
	query := `
		INSERT INTO scheduled_dates (
			user1_id, user2_id, genie_id, scheduled_time, duration_minutes,
			date_type, place_name, address, city, state, country, zipcode,
			latitude, longitude, notes
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id, status, created_at, updated_at
	`

	err := r.db.QueryRowContext(ctx, query,
		date.User1ID, date.User2ID, date.GenieID, date.ScheduledTime, date.DurationMinutes,
		date.DateType, date.PlaceName, date.Address, date.City, date.State, date.Country,
		date.Zipcode, date.Latitude, date.Longitude, date.Notes,
	).Scan(&date.ID, &date.Status, &date.CreatedAt, &date.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create scheduled date: %w", err)
	}

	return date, nil
}

// GetScheduledDateByID retrieves a scheduled date by ID
func (r *AdminRepository) GetScheduledDateByID(ctx context.Context, dateID int) (*ScheduledDate, error) {
	query := `
		SELECT id, user1_id, user2_id, genie_id, scheduled_time, duration_minutes,
		       status, date_type, place_name, address, city, state, country, zipcode,
		       latitude, longitude, notes, admin_notes, created_at, updated_at,
		       confirmed_at, completed_at, cancelled_at
		FROM scheduled_dates
		WHERE id = $1
	`

	var d ScheduledDate
	err := r.db.QueryRowContext(ctx, query, dateID).Scan(
		&d.ID, &d.User1ID, &d.User2ID, &d.GenieID, &d.ScheduledTime, &d.DurationMinutes,
		&d.Status, &d.DateType, &d.PlaceName, &d.Address, &d.City, &d.State, &d.Country,
		&d.Zipcode, &d.Latitude, &d.Longitude, &d.Notes, &d.AdminNotes, &d.CreatedAt,
		&d.UpdatedAt, &d.ConfirmedAt, &d.CompletedAt, &d.CancelledAt,
	)
	if err == sql.ErrNoRows {
		return nil, ErrDateNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get scheduled date: %w", err)
	}

	return &d, nil
}

// GetGenieDates retrieves dates assigned to a genie
func (r *AdminRepository) GetGenieDates(ctx context.Context, genieID int, statusFilter string, page, pageSize int) ([]ScheduledDate, int, error) {
	// Build WHERE clause
	whereClause := "genie_id = $1"
	args := []interface{}{genieID}
	argCount := 1

	if statusFilter != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, statusFilter)
	}

	// Get total count
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM scheduled_dates WHERE %s`, whereClause)
	var totalCount int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count dates: %w", err)
	}

	// Get dates
	offset := (page - 1) * pageSize
	argCount++
	args = append(args, pageSize)
	argCount++
	args = append(args, offset)

	query := fmt.Sprintf(`
		SELECT id, user1_id, user2_id, genie_id, scheduled_time, duration_minutes,
		       status, date_type, place_name, address, city, state, country, zipcode,
		       latitude, longitude, notes, admin_notes, created_at, updated_at,
		       confirmed_at, completed_at, cancelled_at
		FROM scheduled_dates
		WHERE %s
		ORDER BY scheduled_time ASC
		LIMIT $%d OFFSET $%d
	`, whereClause, argCount-1, argCount)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query dates: %w", err)
	}
	defer rows.Close()

	var dates []ScheduledDate
	for rows.Next() {
		var d ScheduledDate
		err := rows.Scan(
			&d.ID, &d.User1ID, &d.User2ID, &d.GenieID, &d.ScheduledTime, &d.DurationMinutes,
			&d.Status, &d.DateType, &d.PlaceName, &d.Address, &d.City, &d.State, &d.Country,
			&d.Zipcode, &d.Latitude, &d.Longitude, &d.Notes, &d.AdminNotes, &d.CreatedAt,
			&d.UpdatedAt, &d.ConfirmedAt, &d.CompletedAt, &d.CancelledAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan date: %w", err)
		}
		dates = append(dates, d)
	}

	return dates, totalCount, nil
}

// UpdateDateStatus updates the status of a scheduled date
func (r *AdminRepository) UpdateDateStatus(ctx context.Context, dateID int, status, notes string) (*ScheduledDate, error) {
	// Build update query based on status
	var extraColumn string
	switch status {
	case "confirmed":
		extraColumn = ", confirmed_at = CURRENT_TIMESTAMP"
	case "completed":
		extraColumn = ", completed_at = CURRENT_TIMESTAMP"
	case "cancelled":
		extraColumn = ", cancelled_at = CURRENT_TIMESTAMP"
	}

	query := fmt.Sprintf(`
		UPDATE scheduled_dates
		SET status = $1, admin_notes = COALESCE($2, admin_notes)%s
		WHERE id = $3
		RETURNING id, user1_id, user2_id, genie_id, scheduled_time, duration_minutes,
		          status, date_type, place_name, address, city, state, country, zipcode,
		          latitude, longitude, notes, admin_notes, created_at, updated_at,
		          confirmed_at, completed_at, cancelled_at
	`, extraColumn)

	var d ScheduledDate
	err := r.db.QueryRowContext(ctx, query, status, notes, dateID).Scan(
		&d.ID, &d.User1ID, &d.User2ID, &d.GenieID, &d.ScheduledTime, &d.DurationMinutes,
		&d.Status, &d.DateType, &d.PlaceName, &d.Address, &d.City, &d.State, &d.Country,
		&d.Zipcode, &d.Latitude, &d.Longitude, &d.Notes, &d.AdminNotes, &d.CreatedAt,
		&d.UpdatedAt, &d.ConfirmedAt, &d.CompletedAt, &d.CancelledAt,
	)
	if err == sql.ErrNoRows {
		return nil, ErrDateNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update date status: %w", err)
	}

	return &d, nil
}

// GetUserAvailability gets user's future availability slots
func (r *AdminRepository) GetUserAvailability(ctx context.Context, userID int) ([]AvailabilitySlot, error) {
	query := `
		SELECT id, user_id, start_time, end_time, date_type, notes, created_at, updated_at
		FROM availability_slots
		WHERE user_id = $1 AND start_time > NOW()
		ORDER BY start_time ASC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get availability: %w", err)
	}
	defer rows.Close()

	var slots []AvailabilitySlot
	for rows.Next() {
		var s AvailabilitySlot
		err := rows.Scan(&s.ID, &s.UserID, &s.StartTime, &s.EndTime, &s.DateType, &s.Notes, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan slot: %w", err)
		}
		slots = append(slots, s)
	}

	return slots, nil
}

// GetUserDates gets user's scheduled dates
func (r *AdminRepository) GetUserDates(ctx context.Context, userID int, upcoming bool) ([]ScheduledDate, error) {
	operator := "<"
	order := "DESC"
	if upcoming {
		operator = ">="
		order = "ASC"
	}

	query := fmt.Sprintf(`
		SELECT id, user1_id, user2_id, genie_id, scheduled_time, duration_minutes,
		       status, date_type, place_name, address, city, state, country, zipcode,
		       latitude, longitude, notes, admin_notes, created_at, updated_at,
		       confirmed_at, completed_at, cancelled_at
		FROM scheduled_dates
		WHERE (user1_id = $1 OR user2_id = $1) AND scheduled_time %s NOW()
		ORDER BY scheduled_time %s
		LIMIT 20
	`, operator, order)

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user dates: %w", err)
	}
	defer rows.Close()

	var dates []ScheduledDate
	for rows.Next() {
		var d ScheduledDate
		err := rows.Scan(
			&d.ID, &d.User1ID, &d.User2ID, &d.GenieID, &d.ScheduledTime, &d.DurationMinutes,
			&d.Status, &d.DateType, &d.PlaceName, &d.Address, &d.City, &d.State, &d.Country,
			&d.Zipcode, &d.Latitude, &d.Longitude, &d.Notes, &d.AdminNotes, &d.CreatedAt,
			&d.UpdatedAt, &d.ConfirmedAt, &d.CompletedAt, &d.CancelledAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan date: %w", err)
		}
		dates = append(dates, d)
	}

	return dates, nil
}
