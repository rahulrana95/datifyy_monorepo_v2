package converter

import (
	adminpb "github.com/datifyy/backend/gen/admin/v1"
)

// UserFullDetailsToJSON converts protobuf UserFullDetails to JSON map
func UserFullDetailsToJSON(user *adminpb.UserFullDetails) map[string]interface{} {
	if user == nil {
		return nil
	}

	result := map[string]interface{}{
		"userId":            user.UserId,
		"email":             user.Email,
		"name":              user.Name,
		"phone":             user.Phone,
		"photoUrl":          user.PhotoUrl,
		"age":               user.Age,
		"gender":            user.Gender,
		"accountStatus":     user.AccountStatus,
		"emailVerified":     user.EmailVerified,
		"phoneVerified":     user.PhoneVerified,
		"photoCount":        user.PhotoCount,
		"availabilityCount": user.AvailabilityCount,
	}

	if user.DateOfBirth != nil {
		result["dateOfBirth"] = user.DateOfBirth.Seconds
	}
	if user.CreatedAt != nil {
		result["createdAt"] = user.CreatedAt.Seconds
	}
	if user.LastLoginAt != nil {
		result["lastLoginAt"] = user.LastLoginAt.Seconds
	}

	return result
}

// ScheduledDateToJSON converts protobuf ScheduledDate to JSON map
func ScheduledDateToJSON(date *adminpb.ScheduledDate) map[string]interface{} {
	if date == nil {
		return nil
	}

	result := map[string]interface{}{
		"dateId":          date.DateId,
		"user1Id":         date.User1Id,
		"user2Id":         date.User2Id,
		"genieId":         date.GenieId,
		"durationMinutes": date.DurationMinutes,
		"status":          date.Status.String(),
		"dateType":        date.DateType,
		"notes":           date.Notes,
	}

	if date.User1 != nil {
		result["user1"] = map[string]interface{}{
			"userId":     date.User1.UserId,
			"name":       date.User1.Name,
			"email":      date.User1.Email,
			"phone":      date.User1.Phone,
			"photoUrl":   date.User1.PhotoUrl,
			"age":        date.User1.Age,
			"gender":     date.User1.Gender,
			"city":       date.User1.City,
			"occupation": date.User1.Occupation,
		}
	}

	if date.User2 != nil {
		result["user2"] = map[string]interface{}{
			"userId":     date.User2.UserId,
			"name":       date.User2.Name,
			"email":      date.User2.Email,
			"phone":      date.User2.Phone,
			"photoUrl":   date.User2.PhotoUrl,
			"age":        date.User2.Age,
			"gender":     date.User2.Gender,
			"city":       date.User2.City,
			"occupation": date.User2.Occupation,
		}
	}

	if date.ScheduledTime != nil {
		result["scheduledTime"] = date.ScheduledTime.Seconds
	}
	if date.CreatedAt != nil {
		result["createdAt"] = date.CreatedAt.Seconds
	}
	if date.UpdatedAt != nil {
		result["updatedAt"] = date.UpdatedAt.Seconds
	}

	if date.Location != nil {
		result["location"] = map[string]interface{}{
			"placeName": date.Location.PlaceName,
			"address":   date.Location.Address,
			"city":      date.Location.City,
			"state":     date.Location.State,
			"country":   date.Location.Country,
			"zipcode":   date.Location.Zipcode,
			"latitude":  date.Location.Latitude,
			"longitude": date.Location.Longitude,
		}
	}

	return result
}
