package service

import (
	"database/sql"

	userpb "github.com/datifyy/backend/gen/user/v1"
	"github.com/datifyy/backend/internal/repository"
	"github.com/redis/go-redis/v9"
)

// UserService handles user profile management and discovery
type UserService struct {
	userpb.UnimplementedUserServiceServer
	db        *sql.DB
	redis     *redis.Client
	userRepo  *repository.UserRepository
	profileRepo *repository.UserProfileRepository
}

// NewUserService creates a new UserService
func NewUserService(db *sql.DB, redisClient *redis.Client) *UserService {
	return &UserService{
		db:        db,
		redis:     redisClient,
		userRepo:  repository.NewUserRepository(db),
		profileRepo: repository.NewUserProfileRepository(db),
	}
}
