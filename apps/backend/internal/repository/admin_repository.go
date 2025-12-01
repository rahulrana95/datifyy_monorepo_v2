package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
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
		FROM datifyy_v2_admin_users
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
		FROM datifyy_v2_admin_users
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
		INSERT INTO datifyy_v2_admin_users (email, name, password_hash, role, is_genie, created_by)
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
	query := `UPDATE datifyy_v2_admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`
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
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM datifyy_v2_users u WHERE %s`, whereClause)
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
		       (SELECT COUNT(*) FROM datifyy_v2_availability_slots WHERE user_id = u.id) as availability_count
		FROM datifyy_v2_users u
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
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM datifyy_v2_users u WHERE %s`, whereClause)
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
		       (SELECT COUNT(*) FROM datifyy_v2_availability_slots WHERE user_id = u.id) as availability_count
		FROM datifyy_v2_users u
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
		FROM datifyy_v2_users
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
	err := r.db.QueryRowContext(ctx, "SELECT gender FROM datifyy_v2_users WHERE id = $1", userID).Scan(&userGender)
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
		       (SELECT COUNT(*) FROM datifyy_v2_availability_slots WHERE user_id = u.id) as availability_count
		FROM datifyy_v2_users u
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
		INSERT INTO datifyy_v2_scheduled_dates (
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
		FROM datifyy_v2_scheduled_dates
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
	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM datifyy_v2_scheduled_dates WHERE %s`, whereClause)
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
		FROM datifyy_v2_scheduled_dates
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
		UPDATE datifyy_v2_scheduled_dates
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
		FROM datifyy_v2_availability_slots
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
		FROM datifyy_v2_scheduled_dates
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

// =============================================================================
// Analytics Operations
// =============================================================================

// PlatformStats holds platform-wide statistics
type PlatformStats struct {
	TotalUsers           int64
	ActiveUsers          int64
	VerifiedUsers        int64
	AvailableForDating   int64
	TotalDatesScheduled  int64
	TotalDatesCompleted  int64
	TodaySignups         int64
	ThisWeekSignups      int64
	ThisMonthSignups     int64
}

// DataPoint represents a single data point for analytics
type DataPoint struct {
	Label     string
	Value     int64
	Timestamp int64
}

// DemographicData represents demographic statistics
type DemographicData struct {
	Category   string
	Count      int64
	Percentage float64
}

// LocationData represents location-based statistics
type LocationData struct {
	LocationName string
	LocationCode string
	UserCount    int64
	Percentage   float64
}

// GetPlatformStats retrieves platform-wide statistics
func (r *AdminRepository) GetPlatformStats(ctx context.Context) (*PlatformStats, error) {
	stats := &PlatformStats{}

	// Get total users
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM datifyy_v2_users").Scan(&stats.TotalUsers)
	if err != nil {
		return nil, fmt.Errorf("failed to count total users: %w", err)
	}

	// Get active users (logged in within last 30 days)
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM datifyy_v2_users
		WHERE last_login_at > NOW() - INTERVAL '30 days'
	`).Scan(&stats.ActiveUsers)
	if err != nil {
		return nil, fmt.Errorf("failed to count active users: %w", err)
	}

	// Get verified users
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM datifyy_v2_users
		WHERE email_verified = TRUE
	`).Scan(&stats.VerifiedUsers)
	if err != nil {
		return nil, fmt.Errorf("failed to count verified users: %w", err)
	}

	// Get available for dating (users with future availability slots)
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(DISTINCT user_id) FROM datifyy_v2_availability_slots
		WHERE start_time > NOW()
	`).Scan(&stats.AvailableForDating)
	if err != nil {
		return nil, fmt.Errorf("failed to count available users: %w", err)
	}

	// Get total dates scheduled
	err = r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM datifyy_v2_scheduled_dates").Scan(&stats.TotalDatesScheduled)
	if err != nil {
		return nil, fmt.Errorf("failed to count scheduled dates: %w", err)
	}

	// Get total dates completed
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM datifyy_v2_scheduled_dates
		WHERE status = 'completed'
	`).Scan(&stats.TotalDatesCompleted)
	if err != nil {
		return nil, fmt.Errorf("failed to count completed dates: %w", err)
	}

	// Get today's signups
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM datifyy_v2_users
		WHERE DATE(created_at) = CURRENT_DATE
	`).Scan(&stats.TodaySignups)
	if err != nil {
		return nil, fmt.Errorf("failed to count today signups: %w", err)
	}

	// Get this week's signups
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM datifyy_v2_users
		WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
	`).Scan(&stats.ThisWeekSignups)
	if err != nil {
		return nil, fmt.Errorf("failed to count week signups: %w", err)
	}

	// Get this month's signups
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM datifyy_v2_users
		WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
	`).Scan(&stats.ThisMonthSignups)
	if err != nil {
		return nil, fmt.Errorf("failed to count month signups: %w", err)
	}

	return stats, nil
}

// GetUserGrowth retrieves user growth data over time
func (r *AdminRepository) GetUserGrowth(ctx context.Context, period string, startTime, endTime time.Time) ([]DataPoint, int64, error) {
	var query string
	var dateFormat string
	var truncFunc string

	switch period {
	case "daily":
		truncFunc = "DATE_TRUNC('day', created_at)"
		dateFormat = "YYYY-MM-DD"
	case "weekly":
		truncFunc = "DATE_TRUNC('week', created_at)"
		dateFormat = "YYYY-MM-DD"
	case "monthly":
		truncFunc = "DATE_TRUNC('month', created_at)"
		dateFormat = "YYYY-MM"
	case "yearly":
		truncFunc = "DATE_TRUNC('year', created_at)"
		dateFormat = "YYYY"
	default:
		truncFunc = "DATE_TRUNC('day', created_at)"
		dateFormat = "YYYY-MM-DD"
	}

	query = fmt.Sprintf(`
		SELECT
			TO_CHAR(%s, '%s') as label,
			COUNT(*) as value,
			EXTRACT(EPOCH FROM %s)::bigint as timestamp
		FROM datifyy_v2_users
		WHERE created_at >= $1 AND created_at <= $2
		GROUP BY %s
		ORDER BY %s ASC
	`, truncFunc, dateFormat, truncFunc, truncFunc, truncFunc)

	rows, err := r.db.QueryContext(ctx, query, startTime, endTime)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query user growth: %w", err)
	}
	defer rows.Close()

	var dataPoints []DataPoint
	var totalUsers int64
	for rows.Next() {
		var dp DataPoint
		err := rows.Scan(&dp.Label, &dp.Value, &dp.Timestamp)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan data point: %w", err)
		}
		totalUsers += dp.Value
		dataPoints = append(dataPoints, dp)
	}

	return dataPoints, totalUsers, nil
}

// GetActiveUsers retrieves active users data over time
func (r *AdminRepository) GetActiveUsers(ctx context.Context, period string, startTime, endTime time.Time) ([]DataPoint, error) {
	var truncFunc string
	var dateFormat string

	switch period {
	case "daily":
		truncFunc = "DATE_TRUNC('day', last_login_at)"
		dateFormat = "YYYY-MM-DD"
	case "weekly":
		truncFunc = "DATE_TRUNC('week', last_login_at)"
		dateFormat = "YYYY-MM-DD"
	case "monthly":
		truncFunc = "DATE_TRUNC('month', last_login_at)"
		dateFormat = "YYYY-MM"
	case "yearly":
		truncFunc = "DATE_TRUNC('year', last_login_at)"
		dateFormat = "YYYY"
	default:
		truncFunc = "DATE_TRUNC('day', last_login_at)"
		dateFormat = "YYYY-MM-DD"
	}

	query := fmt.Sprintf(`
		SELECT
			TO_CHAR(%s, '%s') as label,
			COUNT(DISTINCT id) as value,
			EXTRACT(EPOCH FROM %s)::bigint as timestamp
		FROM datifyy_v2_users
		WHERE last_login_at >= $1 AND last_login_at <= $2
		GROUP BY %s
		ORDER BY %s ASC
	`, truncFunc, dateFormat, truncFunc, truncFunc, truncFunc)

	rows, err := r.db.QueryContext(ctx, query, startTime, endTime)
	if err != nil {
		return nil, fmt.Errorf("failed to query active users: %w", err)
	}
	defer rows.Close()

	var dataPoints []DataPoint
	for rows.Next() {
		var dp DataPoint
		err := rows.Scan(&dp.Label, &dp.Value, &dp.Timestamp)
		if err != nil {
			return nil, fmt.Errorf("failed to scan data point: %w", err)
		}
		dataPoints = append(dataPoints, dp)
	}

	return dataPoints, nil
}

// GetSignups retrieves signup data over time
func (r *AdminRepository) GetSignups(ctx context.Context, period string, startTime, endTime time.Time) ([]DataPoint, int64, error) {
	// Reuse GetUserGrowth since it's the same query
	return r.GetUserGrowth(ctx, period, startTime, endTime)
}

// GetDemographics retrieves demographic statistics by metric type
func (r *AdminRepository) GetDemographics(ctx context.Context, metricType string) ([]DemographicData, error) {
	var query string
	var column string

	switch metricType {
	case "gender":
		column = "gender"
	case "age_group":
		query = `
			SELECT
				CASE
					WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 25 THEN '18-24'
					WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 35 THEN '25-34'
					WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 45 THEN '35-44'
					WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) < 55 THEN '45-54'
					ELSE '55+'
				END as category,
				COUNT(*) as count
			FROM datifyy_v2_users
			WHERE date_of_birth IS NOT NULL
			GROUP BY category
			ORDER BY category
		`
	default:
		return nil, fmt.Errorf("invalid metric type: %s", metricType)
	}

	if column != "" {
		query = fmt.Sprintf(`
			SELECT
				COALESCE(%s, 'Unknown') as category,
				COUNT(*) as count
			FROM datifyy_v2_users
			GROUP BY %s
			ORDER BY count DESC
		`, column, column)
	}

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query demographics: %w", err)
	}
	defer rows.Close()

	var results []DemographicData
	var total int64
	for rows.Next() {
		var d DemographicData
		err := rows.Scan(&d.Category, &d.Count)
		if err != nil {
			return nil, fmt.Errorf("failed to scan demographic data: %w", err)
		}
		total += d.Count
		results = append(results, d)
	}

	// Calculate percentages
	for i := range results {
		if total > 0 {
			results[i].Percentage = float64(results[i].Count) / float64(total) * 100
		}
	}

	return results, nil
}

// GetLocationStats retrieves location-based statistics
func (r *AdminRepository) GetLocationStats(ctx context.Context, level, parentLocation string) ([]LocationData, error) {
	var query string

	// Get column name from user_profiles table
	switch level {
	case "country":
		query = `
			SELECT
				COALESCE(up.country, 'Unknown') as location_name,
				COALESCE(up.country, '') as location_code,
				COUNT(*) as user_count
			FROM datifyy_v2_users u
			LEFT JOIN user_profiles up ON u.id = up.user_id
			GROUP BY up.country
			ORDER BY user_count DESC
			LIMIT 20
		`
	case "state":
		if parentLocation != "" {
			query = fmt.Sprintf(`
				SELECT
					COALESCE(up.state, 'Unknown') as location_name,
					COALESCE(up.state, '') as location_code,
					COUNT(*) as user_count
				FROM datifyy_v2_users u
				LEFT JOIN user_profiles up ON u.id = up.user_id
				WHERE up.country = '%s'
				GROUP BY up.state
				ORDER BY user_count DESC
				LIMIT 20
			`, parentLocation)
		}
	case "city":
		query = `
			SELECT
				COALESCE(up.city, 'Unknown') as location_name,
				COALESCE(up.city, '') as location_code,
				COUNT(*) as user_count
			FROM datifyy_v2_users u
			LEFT JOIN user_profiles up ON u.id = up.user_id
			GROUP BY up.city
			ORDER BY user_count DESC
			LIMIT 20
		`
		if parentLocation != "" {
			query = fmt.Sprintf(`
				SELECT
					COALESCE(up.city, 'Unknown') as location_name,
					COALESCE(up.city, '') as location_code,
					COUNT(*) as user_count
				FROM datifyy_v2_users u
				LEFT JOIN user_profiles up ON u.id = up.user_id
				WHERE up.state = '%s' OR up.country = '%s'
				GROUP BY up.city
				ORDER BY user_count DESC
				LIMIT 20
			`, parentLocation, parentLocation)
		}
	default:
		return nil, fmt.Errorf("invalid level: %s", level)
	}

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query location stats: %w", err)
	}
	defer rows.Close()

	var results []LocationData
	var total int64
	for rows.Next() {
		var l LocationData
		err := rows.Scan(&l.LocationName, &l.LocationCode, &l.UserCount)
		if err != nil {
			return nil, fmt.Errorf("failed to scan location data: %w", err)
		}
		total += l.UserCount
		results = append(results, l)
	}

	// Calculate percentages
	for i := range results {
		if total > 0 {
			results[i].Percentage = float64(results[i].UserCount) / float64(total) * 100
		}
	}

	return results, nil
}

// GetAvailabilityStats retrieves availability statistics
func (r *AdminRepository) GetAvailabilityStats(ctx context.Context) (int64, int64, error) {
	var availableUsers int64
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(DISTINCT user_id)
		FROM datifyy_v2_availability_slots
		WHERE start_time > NOW()
	`).Scan(&availableUsers)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to count available users: %w", err)
	}

	var totalUsers int64
	err = r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM datifyy_v2_users").Scan(&totalUsers)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to count total users: %w", err)
	}

	unavailableUsers := totalUsers - availableUsers
	return availableUsers, unavailableUsers, nil
}

// =============================================================================
// Admin Management Operations
// =============================================================================

// GetAllAdmins retrieves all admin users with pagination
func (r *AdminRepository) GetAllAdmins(ctx context.Context, page, pageSize int) ([]AdminUser, int, error) {
	// Get total count
	var totalCount int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM datifyy_v2_admin_users").Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count admins: %w", err)
	}

	// Get admins
	offset := (page - 1) * pageSize
	query := `
		SELECT id, user_id, email, name, password_hash, role, is_genie, is_active,
		       last_login_at, created_at, updated_at, created_by
		FROM datifyy_v2_admin_users
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query admins: %w", err)
	}
	defer rows.Close()

	var admins []AdminUser
	for rows.Next() {
		var admin AdminUser
		err := rows.Scan(
			&admin.ID, &admin.UserID, &admin.Email, &admin.Name, &admin.PasswordHash,
			&admin.Role, &admin.IsGenie, &admin.IsActive, &admin.LastLoginAt,
			&admin.CreatedAt, &admin.UpdatedAt, &admin.CreatedBy,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan admin: %w", err)
		}
		admins = append(admins, admin)
	}

	return admins, totalCount, nil
}

// UpdateAdmin updates an admin user's details
func (r *AdminRepository) UpdateAdmin(ctx context.Context, adminID int, name, email, role string) (*AdminUser, error) {
	query := `
		UPDATE datifyy_v2_admin_users
		SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
		RETURNING id, user_id, email, name, password_hash, role, is_genie, is_active,
		          last_login_at, created_at, updated_at, created_by
	`

	var admin AdminUser
	err := r.db.QueryRowContext(ctx, query, name, email, role, adminID).Scan(
		&admin.ID, &admin.UserID, &admin.Email, &admin.Name, &admin.PasswordHash,
		&admin.Role, &admin.IsGenie, &admin.IsActive, &admin.LastLoginAt,
		&admin.CreatedAt, &admin.UpdatedAt, &admin.CreatedBy,
	)
	if err == sql.ErrNoRows {
		return nil, ErrAdminNotFound
	}
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return nil, ErrAdminEmailExists
		}
		return nil, fmt.Errorf("failed to update admin: %w", err)
	}

	return &admin, nil
}

// DeleteAdmin soft deletes an admin user
func (r *AdminRepository) DeleteAdmin(ctx context.Context, adminID int) error {
	query := `UPDATE datifyy_v2_admin_users SET is_active = FALSE WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, adminID)
	if err != nil {
		return fmt.Errorf("failed to delete admin: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrAdminNotFound
	}

	return nil
}

// UpdateAdminProfile updates an admin's profile (name and email only)
func (r *AdminRepository) UpdateAdminProfile(ctx context.Context, adminID int, name, email string) (*AdminUser, error) {
	query := `
		UPDATE datifyy_v2_admin_users
		SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
		RETURNING id, user_id, email, name, password_hash, role, is_genie, is_active,
		          last_login_at, created_at, updated_at, created_by
	`

	var admin AdminUser
	err := r.db.QueryRowContext(ctx, query, name, email, adminID).Scan(
		&admin.ID, &admin.UserID, &admin.Email, &admin.Name, &admin.PasswordHash,
		&admin.Role, &admin.IsGenie, &admin.IsActive, &admin.LastLoginAt,
		&admin.CreatedAt, &admin.UpdatedAt, &admin.CreatedBy,
	)
	if err == sql.ErrNoRows {
		return nil, ErrAdminNotFound
	}
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return nil, ErrAdminEmailExists
		}
		return nil, fmt.Errorf("failed to update admin profile: %w", err)
	}

	return &admin, nil
}

// =============================================================================
// Bulk User Operations
// =============================================================================

// BulkActionResult holds the result of a bulk action
type BulkActionResult struct {
	SuccessCount    int
	FailedCount     int
	FailedUserIDs   []string
	ErrorMessages   []string
}

// BulkUserAction performs bulk actions on users
func (r *AdminRepository) BulkUserAction(ctx context.Context, userIDs []int, action string, reason string) (*BulkActionResult, error) {
	result := &BulkActionResult{
		FailedUserIDs: []string{},
		ErrorMessages: []string{},
	}

	// Start transaction
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	var query string
	switch action {
	case "activate":
		query = `UPDATE datifyy_v2_users SET account_status = 'ACTIVE' WHERE id = $1`
	case "suspend":
		query = `UPDATE datifyy_v2_users SET account_status = 'SUSPENDED' WHERE id = $1`
	case "delete":
		query = `UPDATE datifyy_v2_users SET account_status = 'DELETED' WHERE id = $1`
	case "verify":
		query = `UPDATE datifyy_v2_users SET email_verified = TRUE WHERE id = $1`
	case "unverify":
		query = `UPDATE datifyy_v2_users SET email_verified = FALSE WHERE id = $1`
	default:
		return nil, fmt.Errorf("invalid action: %s", action)
	}

	for _, userID := range userIDs {
		_, err := tx.ExecContext(ctx, query, userID)
		if err != nil {
			result.FailedCount++
			result.FailedUserIDs = append(result.FailedUserIDs, strconv.Itoa(userID))
			result.ErrorMessages = append(result.ErrorMessages, err.Error())
		} else {
			result.SuccessCount++
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return result, nil
}
