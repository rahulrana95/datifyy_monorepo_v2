package converter

import (
	"encoding/json"

	userpb "github.com/datifyy/backend/gen/user/v1"
	"google.golang.org/protobuf/encoding/protojson"
)

// UserProfileToJSON converts protobuf UserProfile to JSON map
func UserProfileToJSON(profile *userpb.UserProfile) map[string]interface{} {
	if profile == nil {
		return nil
	}

	result := map[string]interface{}{
		"userId":               profile.UserId,
		"completionPercentage": profile.CompletionPercentage,
		"isPublic":             profile.IsPublic,
		"isVerified":           profile.IsVerified,
	}

	// Basic Info
	if profile.BasicInfo != nil {
		result["basicInfo"] = map[string]interface{}{
			"name":        profile.BasicInfo.Name,
			"email":       profile.BasicInfo.Email,
			"phoneNumber": profile.BasicInfo.PhoneNumber,
			"age":         profile.BasicInfo.Age,
			"gender":      profile.BasicInfo.Gender.String(),
		}
		if profile.BasicInfo.DateOfBirth != nil {
			result["basicInfo"].(map[string]interface{})["dateOfBirth"] = map[string]int64{
				"seconds": profile.BasicInfo.DateOfBirth.Seconds,
				"nanos":   int64(profile.BasicInfo.DateOfBirth.Nanos),
			}
		}
	}

	// Profile Details
	if profile.ProfileDetails != nil {
		result["profileDetails"] = map[string]interface{}{
			"bio":      profile.ProfileDetails.Bio,
			"company":  profile.ProfileDetails.Company,
			"jobTitle": profile.ProfileDetails.JobTitle,
			"school":   profile.ProfileDetails.School,
			"height":   profile.ProfileDetails.Height,
			"hometown": profile.ProfileDetails.Hometown,
		}
	}

	// Lifestyle Info
	if profile.LifestyleInfo != nil {
		result["lifestyleInfo"] = map[string]interface{}{
			"drinking":           profile.LifestyleInfo.Drinking.String(),
			"smoking":            profile.LifestyleInfo.Smoking.String(),
			"workout":            profile.LifestyleInfo.Workout.String(),
			"dietaryPreference":  profile.LifestyleInfo.DietaryPreference.String(),
			"religion":           profile.LifestyleInfo.Religion.String(),
			"religionImportance": profile.LifestyleInfo.ReligionImportance.String(),
			"politicalView":      profile.LifestyleInfo.PoliticalView.String(),
			"pets":               profile.LifestyleInfo.Pets.String(),
			"children":           profile.LifestyleInfo.Children.String(),
			"personalityType":    profile.LifestyleInfo.PersonalityType,
			"communicationStyle": profile.LifestyleInfo.CommunicationStyle.String(),
			"loveLanguage":       profile.LifestyleInfo.LoveLanguage.String(),
			"sleepSchedule":      profile.LifestyleInfo.SleepSchedule.String(),
		}
	}

	// Photos
	if len(profile.Photos) > 0 {
		photos := make([]map[string]interface{}, len(profile.Photos))
		for i, photo := range profile.Photos {
			photos[i] = map[string]interface{}{
				"photoId":      photo.PhotoId,
				"url":          photo.Url,
				"thumbnailUrl": photo.ThumbnailUrl,
				"order":        photo.Order,
				"isPrimary":    photo.IsPrimary,
				"caption":      photo.Caption,
			}
		}
		result["photos"] = photos
	}

	// Prompts
	if len(profile.Prompts) > 0 {
		result["prompts"] = profile.Prompts
	}

	// Partner Preferences - use protojson to serialize with string enums
	if profile.PartnerPreferences != nil {
		marshaler := protojson.MarshalOptions{
			EmitUnpopulated: true,
		}
		prefsJSON, err := marshaler.Marshal(profile.PartnerPreferences)
		if err == nil {
			var prefsMap map[string]interface{}
			if json.Unmarshal(prefsJSON, &prefsMap) == nil {
				result["partnerPreferences"] = prefsMap
			}
		}
	}

	// User Preferences
	if profile.UserPreferences != nil {
		result["userPreferences"] = profile.UserPreferences
	}

	// Metadata
	if profile.Metadata != nil {
		result["metadata"] = map[string]interface{}{
			"status":        profile.Metadata.Status.String(),
			"emailVerified": profile.Metadata.EmailVerified.String(),
			"phoneVerified": profile.Metadata.PhoneVerified.String(),
			"isVerified":    profile.Metadata.IsVerified,
		}
		if profile.Metadata.CreatedAt != nil {
			result["metadata"].(map[string]interface{})["createdAt"] = map[string]int64{
				"seconds": profile.Metadata.CreatedAt.Seconds,
				"nanos":   int64(profile.Metadata.CreatedAt.Nanos),
			}
		}
		if profile.Metadata.UpdatedAt != nil {
			result["metadata"].(map[string]interface{})["updatedAt"] = map[string]int64{
				"seconds": profile.Metadata.UpdatedAt.Seconds,
				"nanos":   int64(profile.Metadata.UpdatedAt.Nanos),
			}
		}
	}

	return result
}
