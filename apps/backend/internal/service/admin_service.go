package service

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	adminpb "github.com/datifyy/backend/gen/admin/v1"
	commonpb "github.com/datifyy/backend/gen/common/v1"
	"github.com/datifyy/backend/internal/auth"
	"github.com/datifyy/backend/internal/repository"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// AdminService implements the admin gRPC service
type AdminService struct {
	adminpb.UnimplementedAdminServiceServer
	adminRepo *repository.AdminRepository
	userRepo  *repository.UserRepository
	db        *sql.DB
}

// NewAdminService creates a new admin service
func NewAdminService(db *sql.DB) *AdminService {
	return &AdminService{
		adminRepo: repository.NewAdminRepository(db),
		userRepo:  repository.NewUserRepository(db),
		db:        db,
	}
}

// =============================================================================
// Authentication
// =============================================================================

// AdminLogin authenticates an admin user
func (s *AdminService) AdminLogin(ctx context.Context, req *adminpb.AdminLoginRequest) (*adminpb.AdminLoginResponse, error) {
	// Validate input
	if req.Email == "" || req.Password == "" {
		return nil, status.Error(codes.InvalidArgument, "email and password are required")
	}

	// Get admin by email
	admin, err := s.adminRepo.GetAdminByEmail(ctx, req.Email)
	if err != nil {
		if err == repository.ErrAdminNotFound {
			return nil, status.Error(codes.Unauthenticated, "invalid credentials")
		}
		return nil, status.Error(codes.Internal, "failed to authenticate")
	}

	// Verify password
	if err := auth.VerifyPassword(admin.PasswordHash, req.Password); err != nil {
		return nil, status.Error(codes.Unauthenticated, "invalid credentials")
	}

	// Update last login
	if err := s.adminRepo.UpdateLastLogin(ctx, admin.ID); err != nil {
		// Log but don't fail
		fmt.Printf("Failed to update last login: %v\n", err)
	}

	// Generate tokens (simplified - in production use proper JWT)
	accessToken := fmt.Sprintf("admin_access_%d_%d", admin.ID, time.Now().Unix())
	refreshToken := fmt.Sprintf("admin_refresh_%d_%d", admin.ID, time.Now().Unix())

	return &adminpb.AdminLoginResponse{
		Admin: &adminpb.AdminUser{
			AdminId:     strconv.Itoa(admin.ID),
			Email:       admin.Email,
			Name:        admin.Name,
			Role:        convertAdminRole(admin.Role),
			IsGenie:     admin.IsGenie,
			CreatedAt:   timestampFromTime(admin.CreatedAt),
			LastLoginAt: timestampFromNullTime(admin.LastLoginAt),
		},
		Tokens: &adminpb.AdminTokenPair{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresIn:    3600, // 1 hour
		},
	}, nil
}

// =============================================================================
// User Management
// =============================================================================

// GetAllUsers retrieves all users with pagination and sorting
func (s *AdminService) GetAllUsers(ctx context.Context, req *adminpb.GetAllUsersRequest) (*adminpb.GetAllUsersResponse, error) {
	page := int(req.Page)
	if page < 1 {
		page = 1
	}
	pageSize := int(req.PageSize)
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	sortBy := convertSortField(req.SortBy)
	sortOrder := "desc"
	if req.SortOrder == adminpb.SortOrder_SORT_ORDER_ASC {
		sortOrder = "asc"
	}

	users, totalCount, err := s.adminRepo.GetAllUsers(ctx, page, pageSize, sortBy, sortOrder, req.AccountStatusFilter, req.GenderFilter)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get users: %v", err)
	}

	// Convert to proto
	var protoUsers []*adminpb.UserFullDetails
	for _, u := range users {
		protoUsers = append(protoUsers, convertUserToFullDetails(&u))
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	return &adminpb.GetAllUsersResponse{
		Users:      protoUsers,
		TotalCount: int32(totalCount),
		Page:       int32(page),
		PageSize:   int32(pageSize),
		TotalPages: int32(totalPages),
	}, nil
}

// SearchUsers searches users by query
func (s *AdminService) SearchUsers(ctx context.Context, req *adminpb.SearchUsersRequest) (*adminpb.SearchUsersResponse, error) {
	if req.Query == "" {
		return nil, status.Error(codes.InvalidArgument, "search query is required")
	}

	page := int(req.Page)
	if page < 1 {
		page = 1
	}
	pageSize := int(req.PageSize)
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	users, totalCount, err := s.adminRepo.SearchUsers(ctx, req.Query, page, pageSize, req.SearchFields)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to search users: %v", err)
	}

	var protoUsers []*adminpb.UserFullDetails
	for _, u := range users {
		protoUsers = append(protoUsers, convertUserToFullDetails(&u))
	}

	return &adminpb.SearchUsersResponse{
		Users:      protoUsers,
		TotalCount: int32(totalCount),
		Page:       int32(page),
		PageSize:   int32(pageSize),
	}, nil
}

// GetUserDetails retrieves complete user details
func (s *AdminService) GetUserDetails(ctx context.Context, req *adminpb.GetUserDetailsRequest) (*adminpb.GetUserDetailsResponse, error) {
	userID, err := strconv.Atoi(req.UserId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user ID")
	}

	// Get user
	user, err := s.adminRepo.GetUserByID(ctx, userID)
	if err != nil {
		if err == repository.ErrUserNotFound {
			return nil, status.Error(codes.NotFound, "user not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to get user: %v", err)
	}

	// Get availability
	availability, _ := s.adminRepo.GetUserAvailability(ctx, userID)

	// Get past dates
	pastDates, _ := s.adminRepo.GetUserDates(ctx, userID, false)

	// Get upcoming dates
	upcomingDates, _ := s.adminRepo.GetUserDates(ctx, userID, true)

	// Convert to proto
	userDetails := &adminpb.UserFullDetails{
		UserId:        strconv.Itoa(user.ID),
		Email:         user.Email,
		Name:          user.Name,
		Phone:         nullStringValue(user.PhoneNumber),
		PhotoUrl:      nullStringValue(user.PhotoURL),
		Gender:        nullStringValue(user.Gender),
		AccountStatus: user.AccountStatus,
		EmailVerified: user.EmailVerified,
		PhoneVerified: user.PhoneVerified,
		CreatedAt:     timestampFromTime(user.CreatedAt),
		LastLoginAt:   timestampFromNullTime(user.LastLoginAt),
	}

	if user.DateOfBirth.Valid {
		userDetails.DateOfBirth = timestampFromTime(user.DateOfBirth.Time)
		userDetails.Age = int32(calculateAge(user.DateOfBirth.Time))
	}

	// Convert availability
	var protoAvailability []*adminpb.AvailableSlot
	for _, a := range availability {
		protoAvailability = append(protoAvailability, &adminpb.AvailableSlot{
			StartTime: &commonpb.Timestamp{Seconds: a.StartTime},
			EndTime:   &commonpb.Timestamp{Seconds: a.EndTime},
			DateType:  a.DateType,
		})
	}

	// Convert dates
	var protoPastDates []*adminpb.ScheduledDate
	for _, d := range pastDates {
		protoPastDates = append(protoPastDates, convertScheduledDate(&d))
	}

	var protoUpcomingDates []*adminpb.ScheduledDate
	for _, d := range upcomingDates {
		protoUpcomingDates = append(protoUpcomingDates, convertScheduledDate(&d))
	}

	return &adminpb.GetUserDetailsResponse{
		User:          userDetails,
		Availability:  protoAvailability,
		PastDates:     protoPastDates,
		UpcomingDates: protoUpcomingDates,
	}, nil
}

// =============================================================================
// Date Matching
// =============================================================================

// GetDateSuggestions gets opposite sex suggestions for a user
func (s *AdminService) GetDateSuggestions(ctx context.Context, req *adminpb.GetDateSuggestionsRequest) (*adminpb.GetDateSuggestionsResponse, error) {
	userID, err := strconv.Atoi(req.UserId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user ID")
	}

	limit := int(req.Limit)
	if limit < 1 || limit > 50 {
		limit = 10
	}

	users, err := s.adminRepo.GetOppositeSexUsers(ctx, userID, limit)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get suggestions: %v", err)
	}

	var suggestions []*adminpb.DateSuggestion
	for _, u := range users {
		suggestion := &adminpb.DateSuggestion{
			User: &adminpb.UserSummary{
				UserId:   strconv.Itoa(u.ID),
				Name:     u.Name,
				Email:    u.Email,
				Phone:    nullStringValue(u.PhoneNumber),
				PhotoUrl: nullStringValue(u.PhotoURL),
				Gender:   nullStringValue(u.Gender),
			},
			CompatibilityScore: 0.85, // Placeholder - implement actual scoring
			SuggestedDateType:  "online",
		}

		if u.DateOfBirth.Valid {
			suggestion.User.Age = int32(calculateAge(u.DateOfBirth.Time))
		}

		suggestions = append(suggestions, suggestion)
	}

	return &adminpb.GetDateSuggestionsResponse{
		Suggestions: suggestions,
	}, nil
}

// ScheduleDate creates a new scheduled date
func (s *AdminService) ScheduleDate(ctx context.Context, req *adminpb.ScheduleDateRequest) (*adminpb.ScheduleDateResponse, error) {
	user1ID, err := strconv.Atoi(req.User1Id)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user1 ID")
	}

	user2ID, err := strconv.Atoi(req.User2Id)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user2 ID")
	}

	// Create scheduled date
	date := &repository.ScheduledDate{
		User1ID:         user1ID,
		User2ID:         user2ID,
		ScheduledTime:   timeFromTimestamp(req.ScheduledTime),
		DurationMinutes: int(req.DurationMinutes),
		DateType:        req.DateType,
		Notes:           sql.NullString{String: req.Notes, Valid: req.Notes != ""},
	}

	// Set location if offline
	if req.Location != nil {
		date.PlaceName = sql.NullString{String: req.Location.PlaceName, Valid: true}
		date.Address = sql.NullString{String: req.Location.Address, Valid: true}
		date.City = sql.NullString{String: req.Location.City, Valid: true}
		date.State = sql.NullString{String: req.Location.State, Valid: true}
		date.Country = sql.NullString{String: req.Location.Country, Valid: true}
		date.Zipcode = sql.NullString{String: req.Location.Zipcode, Valid: true}
		date.Latitude = sql.NullFloat64{Float64: req.Location.Latitude, Valid: true}
		date.Longitude = sql.NullFloat64{Float64: req.Location.Longitude, Valid: true}
	}

	// TODO: Assign genie based on availability

	createdDate, err := s.adminRepo.CreateScheduledDate(ctx, date)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to schedule date: %v", err)
	}

	return &adminpb.ScheduleDateResponse{
		Date: convertScheduledDate(createdDate),
	}, nil
}

// =============================================================================
// Genie Operations
// =============================================================================

// GetGenieDates retrieves dates assigned to a genie
func (s *AdminService) GetGenieDates(ctx context.Context, req *adminpb.GetGenieDatesRequest) (*adminpb.GetGenieDatesResponse, error) {
	genieID, err := strconv.Atoi(req.GenieId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid genie ID")
	}

	page := int(req.Page)
	if page < 1 {
		page = 1
	}
	pageSize := int(req.PageSize)
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	statusFilter := convertDateStatusToString(req.StatusFilter)

	dates, totalCount, err := s.adminRepo.GetGenieDates(ctx, genieID, statusFilter, page, pageSize)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get genie dates: %v", err)
	}

	var protoDates []*adminpb.ScheduledDate
	for _, d := range dates {
		protoDate := convertScheduledDate(&d)

		// Load user details for each date
		if user1, err := s.adminRepo.GetUserByID(ctx, d.User1ID); err == nil {
			protoDate.User1 = convertUserToSummary(user1)
		}
		if user2, err := s.adminRepo.GetUserByID(ctx, d.User2ID); err == nil {
			protoDate.User2 = convertUserToSummary(user2)
		}

		protoDates = append(protoDates, protoDate)
	}

	return &adminpb.GetGenieDatesResponse{
		Dates:      protoDates,
		TotalCount: int32(totalCount),
		Page:       int32(page),
		PageSize:   int32(pageSize),
	}, nil
}

// UpdateDateStatus updates the status of a date
func (s *AdminService) UpdateDateStatus(ctx context.Context, req *adminpb.UpdateDateStatusRequest) (*adminpb.UpdateDateStatusResponse, error) {
	dateID, err := strconv.Atoi(req.DateId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid date ID")
	}

	statusStr := convertDateStatusToString(req.Status)

	date, err := s.adminRepo.UpdateDateStatus(ctx, dateID, statusStr, req.Notes)
	if err != nil {
		if err == repository.ErrDateNotFound {
			return nil, status.Error(codes.NotFound, "date not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to update date: %v", err)
	}

	return &adminpb.UpdateDateStatusResponse{
		Date: convertScheduledDate(date),
	}, nil
}

// CreateAdminUser creates a new admin user
func (s *AdminService) CreateAdminUser(ctx context.Context, req *adminpb.CreateAdminUserRequest) (*adminpb.CreateAdminUserResponse, error) {
	if req.Email == "" || req.Password == "" || req.Name == "" {
		return nil, status.Error(codes.InvalidArgument, "email, password, and name are required")
	}

	// Hash password
	passwordHash, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to hash password")
	}

	role := convertAdminRoleToString(req.Role)

	admin, err := s.adminRepo.CreateAdmin(ctx, req.Email, req.Name, passwordHash, role, req.IsGenie, 0)
	if err != nil {
		if err == repository.ErrAdminEmailExists {
			return nil, status.Error(codes.AlreadyExists, "email already exists")
		}
		return nil, status.Errorf(codes.Internal, "failed to create admin: %v", err)
	}

	return &adminpb.CreateAdminUserResponse{
		Admin: &adminpb.AdminUser{
			AdminId:   strconv.Itoa(admin.ID),
			Email:     admin.Email,
			Name:      admin.Name,
			Role:      req.Role,
			IsGenie:   admin.IsGenie,
			CreatedAt: timestampFromTime(admin.CreatedAt),
		},
	}, nil
}

// =============================================================================
// Helper Functions
// =============================================================================

func convertAdminRole(role string) adminpb.AdminRole {
	switch role {
	case "super_admin":
		return adminpb.AdminRole_ADMIN_ROLE_SUPER_ADMIN
	case "genie":
		return adminpb.AdminRole_ADMIN_ROLE_GENIE
	case "support":
		return adminpb.AdminRole_ADMIN_ROLE_SUPPORT
	case "moderator":
		return adminpb.AdminRole_ADMIN_ROLE_MODERATOR
	default:
		return adminpb.AdminRole_ADMIN_ROLE_UNSPECIFIED
	}
}

func convertAdminRoleToString(role adminpb.AdminRole) string {
	switch role {
	case adminpb.AdminRole_ADMIN_ROLE_SUPER_ADMIN:
		return "super_admin"
	case adminpb.AdminRole_ADMIN_ROLE_GENIE:
		return "genie"
	case adminpb.AdminRole_ADMIN_ROLE_SUPPORT:
		return "support"
	case adminpb.AdminRole_ADMIN_ROLE_MODERATOR:
		return "moderator"
	default:
		return "support"
	}
}

func convertSortField(field adminpb.UserSortField) string {
	switch field {
	case adminpb.UserSortField_USER_SORT_FIELD_NAME:
		return "name"
	case adminpb.UserSortField_USER_SORT_FIELD_EMAIL:
		return "email"
	case adminpb.UserSortField_USER_SORT_FIELD_LAST_LOGIN:
		return "last_login"
	case adminpb.UserSortField_USER_SORT_FIELD_AGE:
		return "age"
	default:
		return "created_at"
	}
}

func convertDateStatusToString(status adminpb.DateStatus) string {
	switch status {
	case adminpb.DateStatus_DATE_STATUS_SCHEDULED:
		return "scheduled"
	case adminpb.DateStatus_DATE_STATUS_CONFIRMED:
		return "confirmed"
	case adminpb.DateStatus_DATE_STATUS_IN_PROGRESS:
		return "in_progress"
	case adminpb.DateStatus_DATE_STATUS_COMPLETED:
		return "completed"
	case adminpb.DateStatus_DATE_STATUS_CANCELLED:
		return "cancelled"
	case adminpb.DateStatus_DATE_STATUS_NO_SHOW:
		return "no_show"
	default:
		return ""
	}
}

func timestampFromTime(t time.Time) *commonpb.Timestamp {
	return &commonpb.Timestamp{
		Seconds: t.Unix(),
		Nanos:   int32(t.Nanosecond()),
	}
}

func timestampFromNullTime(t sql.NullTime) *commonpb.Timestamp {
	if !t.Valid {
		return nil
	}
	return timestampFromTime(t.Time)
}

func timeFromTimestamp(ts *commonpb.Timestamp) time.Time {
	if ts == nil {
		return time.Time{}
	}
	return time.Unix(ts.Seconds, int64(ts.Nanos))
}

func nullStringValue(s sql.NullString) string {
	if s.Valid {
		return s.String
	}
	return ""
}

func convertUserToFullDetails(u *repository.UserWithDetails) *adminpb.UserFullDetails {
	details := &adminpb.UserFullDetails{
		UserId:            strconv.Itoa(u.ID),
		Email:             u.Email,
		Name:              u.Name,
		Phone:             nullStringValue(u.PhoneNumber),
		PhotoUrl:          nullStringValue(u.PhotoURL),
		Gender:            nullStringValue(u.Gender),
		AccountStatus:     u.AccountStatus,
		EmailVerified:     u.EmailVerified,
		PhoneVerified:     u.PhoneVerified,
		CreatedAt:         timestampFromTime(u.CreatedAt),
		LastLoginAt:       timestampFromNullTime(u.LastLoginAt),
		PhotoCount:        int32(u.PhotoCount),
		AvailabilityCount: int32(u.AvailabilityCount),
	}

	if u.DateOfBirth.Valid {
		details.DateOfBirth = timestampFromTime(u.DateOfBirth.Time)
		details.Age = int32(calculateAge(u.DateOfBirth.Time))
	}

	return details
}

func convertUserToSummary(u *repository.User) *adminpb.UserSummary {
	summary := &adminpb.UserSummary{
		UserId:   strconv.Itoa(u.ID),
		Name:     u.Name,
		Email:    u.Email,
		Phone:    nullStringValue(u.PhoneNumber),
		PhotoUrl: nullStringValue(u.PhotoURL),
		Gender:   nullStringValue(u.Gender),
	}

	if u.DateOfBirth.Valid {
		summary.Age = int32(calculateAge(u.DateOfBirth.Time))
	}

	return summary
}

func convertScheduledDate(d *repository.ScheduledDate) *adminpb.ScheduledDate {
	protoDate := &adminpb.ScheduledDate{
		DateId:          strconv.Itoa(d.ID),
		User1Id:         strconv.Itoa(d.User1ID),
		User2Id:         strconv.Itoa(d.User2ID),
		ScheduledTime:   timestampFromTime(d.ScheduledTime),
		DurationMinutes: int64(d.DurationMinutes),
		Status:          convertDateStatus(d.Status),
		DateType:        d.DateType,
		Notes:           nullStringValue(d.Notes),
		CreatedAt:       timestampFromTime(d.CreatedAt),
		UpdatedAt:       timestampFromTime(d.UpdatedAt),
	}

	if d.GenieID.Valid {
		protoDate.GenieId = strconv.FormatInt(d.GenieID.Int64, 10)
	}

	// Set location if available
	if d.PlaceName.Valid {
		protoDate.Location = &adminpb.OfflineLocation{
			PlaceName: d.PlaceName.String,
			Address:   nullStringValue(d.Address),
			City:      nullStringValue(d.City),
			State:     nullStringValue(d.State),
			Country:   nullStringValue(d.Country),
			Zipcode:   nullStringValue(d.Zipcode),
		}
		if d.Latitude.Valid {
			protoDate.Location.Latitude = d.Latitude.Float64
		}
		if d.Longitude.Valid {
			protoDate.Location.Longitude = d.Longitude.Float64
		}
	}

	return protoDate
}

func convertDateStatus(status string) adminpb.DateStatus {
	switch status {
	case "scheduled":
		return adminpb.DateStatus_DATE_STATUS_SCHEDULED
	case "confirmed":
		return adminpb.DateStatus_DATE_STATUS_CONFIRMED
	case "in_progress":
		return adminpb.DateStatus_DATE_STATUS_IN_PROGRESS
	case "completed":
		return adminpb.DateStatus_DATE_STATUS_COMPLETED
	case "cancelled":
		return adminpb.DateStatus_DATE_STATUS_CANCELLED
	case "no_show":
		return adminpb.DateStatus_DATE_STATUS_NO_SHOW
	default:
		return adminpb.DateStatus_DATE_STATUS_UNSPECIFIED
	}
}
