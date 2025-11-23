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
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// AdminService implements the admin gRPC service
type AdminService struct {
	adminpb.UnimplementedAdminServiceServer
	adminRepo    *repository.AdminRepository
	userRepo     *repository.UserRepository
	datesService *DatesService
	db           *sql.DB
}

// NewAdminService creates a new admin service
func NewAdminService(db *sql.DB, redisClient *redis.Client) (*AdminService, error) {
	datesService, err := NewDatesService(db, redisClient)
	if err != nil {
		return nil, fmt.Errorf("failed to create dates service: %w", err)
	}

	return &AdminService{
		adminRepo:    repository.NewAdminRepository(db),
		userRepo:     repository.NewUserRepository(db),
		datesService: datesService,
		db:           db,
	}, nil
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
// AI-Powered Date Curation
// =============================================================================

// GetCurationCandidates returns users available for dates tomorrow
func (s *AdminService) GetCurationCandidates(ctx context.Context, req *adminpb.GetCurationCandidatesRequest) (*adminpb.GetCurationCandidatesResponse, error) {
	candidates, err := s.datesService.GetCandidatesForCuration(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get curation candidates: %v", err)
	}

	var pbCandidates []*adminpb.CurationCandidate
	for _, c := range candidates {
		candidate := &adminpb.CurationCandidate{
			UserId:              strconv.Itoa(c.UserID),
			Email:               c.Email,
			Name:                c.Name,
			Age:                 int32(c.Age),
			Gender:              c.Gender,
			ProfileCompletion:   int32(c.ProfileCompletion),
			EmailVerified:       c.EmailVerified,
			AadharVerified:      c.AadharVerified,
			WorkEmailVerified:   c.WorkEmailVerified,
			AvailableSlotsCount: int32(c.AvailableSlotsCount),
		}

		if c.NextAvailableDate != nil {
			candidate.NextAvailableDate = timestampFromTime(*c.NextAvailableDate)
		}

		pbCandidates = append(pbCandidates, candidate)
	}

	return &adminpb.GetCurationCandidatesResponse{
		Candidates: pbCandidates,
	}, nil
}

// CurateDates analyzes compatibility between a user and candidates using AI
func (s *AdminService) CurateDates(ctx context.Context, req *adminpb.CurateDatesRequest) (*adminpb.CurateDatesResponse, error) {
	// Validate input
	userID, err := strconv.Atoi(req.UserId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid user ID")
	}

	if len(req.CandidateIds) == 0 {
		return nil, status.Error(codes.InvalidArgument, "at least one candidate ID is required")
	}

	// Convert candidate IDs to ints
	candidateIDs := make([]int, len(req.CandidateIds))
	for i, idStr := range req.CandidateIds {
		id, err := strconv.Atoi(idStr)
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "invalid candidate ID: %s", idStr)
		}
		candidateIDs[i] = id
	}

	// Get admin ID from context (TODO: implement auth context extraction)
	adminID := 1 // Placeholder - should get from auth context

	// Analyze compatibility using AI
	matches, err := s.datesService.AnalyzeCompatibility(ctx, userID, candidateIDs, adminID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to analyze compatibility: %v", err)
	}

	// Convert to protobuf format
	var pbMatches []*adminpb.MatchResult
	for _, m := range matches {
		match := &adminpb.MatchResult{
			UserId:             strconv.Itoa(m.UserID),
			Name:               m.Name,
			Age:                int32(m.Age),
			Gender:             m.Gender,
			CompatibilityScore: m.CompatibilityScore,
			IsMatch:            m.IsMatch,
			Reasoning:          m.Reasoning,
			MatchedAspects:     m.MatchedAspects,
			MismatchedAspects:  m.MismatchedAspects,
		}
		pbMatches = append(pbMatches, match)
	}

	return &adminpb.CurateDatesResponse{
		Matches: pbMatches,
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

// GetAllAdmins retrieves all admin users
func (s *AdminService) GetAllAdmins(ctx context.Context, req *adminpb.GetAllAdminsRequest) (*adminpb.GetAllAdminsResponse, error) {
	page := int(req.Page)
	if page < 1 {
		page = 1
	}
	pageSize := int(req.PageSize)
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	admins, totalCount, err := s.adminRepo.GetAllAdmins(ctx, page, pageSize)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get admins: %v", err)
	}

	var protoAdmins []*adminpb.AdminUser
	for _, admin := range admins {
		protoAdmins = append(protoAdmins, &adminpb.AdminUser{
			AdminId:     strconv.Itoa(admin.ID),
			Email:       admin.Email,
			Name:        admin.Name,
			Role:        convertAdminRole(admin.Role),
			IsGenie:     admin.IsGenie,
			CreatedAt:   timestampFromTime(admin.CreatedAt),
			LastLoginAt: timestampFromNullTime(admin.LastLoginAt),
		})
	}

	return &adminpb.GetAllAdminsResponse{
		Admins:     protoAdmins,
		TotalCount: int32(totalCount),
	}, nil
}

// UpdateAdmin updates an admin user's details
func (s *AdminService) UpdateAdmin(ctx context.Context, req *adminpb.UpdateAdminRequest) (*adminpb.UpdateAdminResponse, error) {
	adminID, err := strconv.Atoi(req.AdminId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid admin ID")
	}

	role := convertAdminRoleToString(req.Role)

	admin, err := s.adminRepo.UpdateAdmin(ctx, adminID, req.Name, req.Email, role)
	if err != nil {
		if err == repository.ErrAdminNotFound {
			return nil, status.Error(codes.NotFound, "admin not found")
		}
		if err == repository.ErrAdminEmailExists {
			return nil, status.Error(codes.AlreadyExists, "email already exists")
		}
		return nil, status.Errorf(codes.Internal, "failed to update admin: %v", err)
	}

	return &adminpb.UpdateAdminResponse{
		Admin: &adminpb.AdminUser{
			AdminId:     strconv.Itoa(admin.ID),
			Email:       admin.Email,
			Name:        admin.Name,
			Role:        req.Role,
			IsGenie:     admin.IsGenie,
			CreatedAt:   timestampFromTime(admin.CreatedAt),
			LastLoginAt: timestampFromNullTime(admin.LastLoginAt),
		},
	}, nil
}

// DeleteAdmin deletes an admin user
func (s *AdminService) DeleteAdmin(ctx context.Context, req *adminpb.DeleteAdminRequest) (*adminpb.DeleteAdminResponse, error) {
	adminID, err := strconv.Atoi(req.AdminId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid admin ID")
	}

	err = s.adminRepo.DeleteAdmin(ctx, adminID)
	if err != nil {
		if err == repository.ErrAdminNotFound {
			return nil, status.Error(codes.NotFound, "admin not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to delete admin: %v", err)
	}

	return &adminpb.DeleteAdminResponse{
		Success: true,
	}, nil
}

// UpdateAdminProfile updates an admin's profile
func (s *AdminService) UpdateAdminProfile(ctx context.Context, req *adminpb.UpdateAdminProfileRequest) (*adminpb.UpdateAdminProfileResponse, error) {
	adminID, err := strconv.Atoi(req.AdminId)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid admin ID")
	}

	admin, err := s.adminRepo.UpdateAdminProfile(ctx, adminID, req.Name, req.Email)
	if err != nil {
		if err == repository.ErrAdminNotFound {
			return nil, status.Error(codes.NotFound, "admin not found")
		}
		if err == repository.ErrAdminEmailExists {
			return nil, status.Error(codes.AlreadyExists, "email already exists")
		}
		return nil, status.Errorf(codes.Internal, "failed to update admin profile: %v", err)
	}

	return &adminpb.UpdateAdminProfileResponse{
		Admin: &adminpb.AdminUser{
			AdminId:     strconv.Itoa(admin.ID),
			Email:       admin.Email,
			Name:        admin.Name,
			Role:        convertAdminRole(admin.Role),
			IsGenie:     admin.IsGenie,
			CreatedAt:   timestampFromTime(admin.CreatedAt),
			LastLoginAt: timestampFromNullTime(admin.LastLoginAt),
		},
	}, nil
}

// BulkUserAction performs bulk actions on users
func (s *AdminService) BulkUserAction(ctx context.Context, req *adminpb.BulkUserActionRequest) (*adminpb.BulkUserActionResponse, error) {
	if len(req.UserIds) == 0 {
		return nil, status.Error(codes.InvalidArgument, "no user IDs provided")
	}

	// Convert string IDs to ints
	var userIDs []int
	for _, idStr := range req.UserIds {
		id, err := strconv.Atoi(idStr)
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "invalid user ID: %s", idStr)
		}
		userIDs = append(userIDs, id)
	}

	// Convert action enum to string
	var action string
	switch req.Action {
	case adminpb.BulkUserAction_BULK_USER_ACTION_ACTIVATE:
		action = "activate"
	case adminpb.BulkUserAction_BULK_USER_ACTION_SUSPEND:
		action = "suspend"
	case adminpb.BulkUserAction_BULK_USER_ACTION_DELETE:
		action = "delete"
	case adminpb.BulkUserAction_BULK_USER_ACTION_VERIFY:
		action = "verify"
	case adminpb.BulkUserAction_BULK_USER_ACTION_UNVERIFY:
		action = "unverify"
	default:
		return nil, status.Error(codes.InvalidArgument, "invalid action")
	}

	result, err := s.adminRepo.BulkUserAction(ctx, userIDs, action, req.Reason)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to perform bulk action: %v", err)
	}

	return &adminpb.BulkUserActionResponse{
		SuccessCount:   int32(result.SuccessCount),
		FailedCount:    int32(result.FailedCount),
		FailedUserIds:  result.FailedUserIDs,
		ErrorMessages:  result.ErrorMessages,
	}, nil
}

// =============================================================================
// Analytics
// =============================================================================

// GetPlatformStats retrieves platform-wide statistics
func (s *AdminService) GetPlatformStats(ctx context.Context, req *adminpb.PlatformStatsRequest) (*adminpb.PlatformStatsResponse, error) {
	stats, err := s.adminRepo.GetPlatformStats(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get platform stats: %v", err)
	}

	return &adminpb.PlatformStatsResponse{
		TotalUsers:          stats.TotalUsers,
		ActiveUsers:         stats.ActiveUsers,
		VerifiedUsers:       stats.VerifiedUsers,
		AvailableForDating:  stats.AvailableForDating,
		TotalDatesScheduled: stats.TotalDatesScheduled,
		TotalDatesCompleted: stats.TotalDatesCompleted,
		TodaySignups:        stats.TodaySignups,
		ThisWeekSignups:     stats.ThisWeekSignups,
		ThisMonthSignups:    stats.ThisMonthSignups,
	}, nil
}

// GetUserGrowth retrieves user growth data
func (s *AdminService) GetUserGrowth(ctx context.Context, req *adminpb.UserGrowthRequest) (*adminpb.UserGrowthResponse, error) {
	period := convertAnalyticsPeriod(req.Period)
	startTime := timeFromTimestamp(req.TimeRange.StartTime)
	endTime := timeFromTimestamp(req.TimeRange.EndTime)

	// Default time range if not provided
	if startTime.IsZero() {
		startTime = time.Now().AddDate(0, -1, 0) // Last month
	}
	if endTime.IsZero() {
		endTime = time.Now()
	}

	dataPoints, totalUsers, err := s.adminRepo.GetUserGrowth(ctx, period, startTime, endTime)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user growth: %v", err)
	}

	// Convert to proto
	var protoDataPoints []*adminpb.DataPoint
	for _, dp := range dataPoints {
		protoDataPoints = append(protoDataPoints, &adminpb.DataPoint{
			Label:     dp.Label,
			Value:     dp.Value,
			Timestamp: &commonpb.Timestamp{Seconds: dp.Timestamp},
		})
	}

	// Calculate growth rate (simple percentage)
	var growthRate float64
	if len(dataPoints) > 1 {
		firstValue := float64(dataPoints[0].Value)
		lastValue := float64(dataPoints[len(dataPoints)-1].Value)
		if firstValue > 0 {
			growthRate = ((lastValue - firstValue) / firstValue) * 100
		}
	}

	return &adminpb.UserGrowthResponse{
		DataPoints: protoDataPoints,
		TotalUsers: totalUsers,
		GrowthRate: growthRate,
	}, nil
}

// GetActiveUsers retrieves active users data
func (s *AdminService) GetActiveUsers(ctx context.Context, req *adminpb.ActiveUsersRequest) (*adminpb.ActiveUsersResponse, error) {
	period := convertAnalyticsPeriod(req.Period)
	startTime := timeFromTimestamp(req.TimeRange.StartTime)
	endTime := timeFromTimestamp(req.TimeRange.EndTime)

	if startTime.IsZero() {
		startTime = time.Now().AddDate(0, -1, 0)
	}
	if endTime.IsZero() {
		endTime = time.Now()
	}

	dataPoints, err := s.adminRepo.GetActiveUsers(ctx, period, startTime, endTime)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get active users: %v", err)
	}

	var protoDataPoints []*adminpb.DataPoint
	var currentActive int64
	for _, dp := range dataPoints {
		protoDataPoints = append(protoDataPoints, &adminpb.DataPoint{
			Label:     dp.Label,
			Value:     dp.Value,
			Timestamp: &commonpb.Timestamp{Seconds: dp.Timestamp},
		})
		currentActive += dp.Value
	}

	// Calculate activity rate
	stats, _ := s.adminRepo.GetPlatformStats(ctx)
	var activityRate float64
	if stats != nil && stats.TotalUsers > 0 {
		activityRate = (float64(stats.ActiveUsers) / float64(stats.TotalUsers)) * 100
	}

	return &adminpb.ActiveUsersResponse{
		DataPoints:    protoDataPoints,
		CurrentActive: currentActive,
		ActivityRate:  activityRate,
	}, nil
}

// GetSignups retrieves signup data
func (s *AdminService) GetSignups(ctx context.Context, req *adminpb.SignupsRequest) (*adminpb.SignupsResponse, error) {
	period := convertAnalyticsPeriod(req.Period)
	startTime := timeFromTimestamp(req.TimeRange.StartTime)
	endTime := timeFromTimestamp(req.TimeRange.EndTime)

	if startTime.IsZero() {
		startTime = time.Now().AddDate(0, -1, 0)
	}
	if endTime.IsZero() {
		endTime = time.Now()
	}

	dataPoints, totalSignups, err := s.adminRepo.GetSignups(ctx, period, startTime, endTime)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get signups: %v", err)
	}

	var protoDataPoints []*adminpb.DataPoint
	for _, dp := range dataPoints {
		protoDataPoints = append(protoDataPoints, &adminpb.DataPoint{
			Label:     dp.Label,
			Value:     dp.Value,
			Timestamp: &commonpb.Timestamp{Seconds: dp.Timestamp},
		})
	}

	return &adminpb.SignupsResponse{
		DataPoints:   protoDataPoints,
		TotalSignups: totalSignups,
	}, nil
}

// GetDemographics retrieves demographic statistics
func (s *AdminService) GetDemographics(ctx context.Context, req *adminpb.DemographicsRequest) (*adminpb.DemographicsResponse, error) {
	data, err := s.adminRepo.GetDemographics(ctx, req.MetricType)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get demographics: %v", err)
	}

	var protoData []*adminpb.DemographicData
	for _, d := range data {
		protoData = append(protoData, &adminpb.DemographicData{
			Category:   d.Category,
			Count:      d.Count,
			Percentage: d.Percentage,
		})
	}

	return &adminpb.DemographicsResponse{
		Data: protoData,
	}, nil
}

// GetLocationStats retrieves location-based statistics
func (s *AdminService) GetLocationStats(ctx context.Context, req *adminpb.LocationStatsRequest) (*adminpb.LocationStatsResponse, error) {
	locations, err := s.adminRepo.GetLocationStats(ctx, req.Level, req.ParentLocation)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get location stats: %v", err)
	}

	var protoLocations []*adminpb.LocationData
	for _, l := range locations {
		protoLocations = append(protoLocations, &adminpb.LocationData{
			LocationName: l.LocationName,
			LocationCode: l.LocationCode,
			UserCount:    l.UserCount,
			Percentage:   l.Percentage,
		})
	}

	return &adminpb.LocationStatsResponse{
		Locations: protoLocations,
	}, nil
}

// GetAvailabilityStats retrieves availability statistics
func (s *AdminService) GetAvailabilityStats(ctx context.Context, req *adminpb.AvailabilityStatsRequest) (*adminpb.AvailabilityStatsResponse, error) {
	availableUsers, unavailableUsers, err := s.adminRepo.GetAvailabilityStats(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get availability stats: %v", err)
	}

	totalUsers := availableUsers + unavailableUsers
	var availabilityRate float64
	if totalUsers > 0 {
		availabilityRate = (float64(availableUsers) / float64(totalUsers)) * 100
	}

	return &adminpb.AvailabilityStatsResponse{
		AvailableUsers:   availableUsers,
		UnavailableUsers: unavailableUsers,
		AvailabilityRate: availabilityRate,
	}, nil
}

// =============================================================================
// Helper Functions
// =============================================================================

func convertAnalyticsPeriod(period adminpb.AnalyticsPeriod) string {
	switch period {
	case adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_DAILY:
		return "daily"
	case adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_WEEKLY:
		return "weekly"
	case adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_MONTHLY:
		return "monthly"
	case adminpb.AnalyticsPeriod_ANALYTICS_PERIOD_YEARLY:
		return "yearly"
	default:
		return "daily"
	}
}

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
