package converter

import (
	availabilitypb "github.com/datifyy/backend/gen/availability/v1"
)

// AvailabilitySlotToJSON converts protobuf AvailabilitySlot to JSON map
func AvailabilitySlotToJSON(slot *availabilitypb.AvailabilitySlot) map[string]interface{} {
	if slot == nil {
		return nil
	}

	result := map[string]interface{}{
		"slotId":    slot.SlotId,
		"userId":    slot.UserId,
		"startTime": slot.StartTime,
		"endTime":   slot.EndTime,
		"dateType":  slot.DateType.String(),
		"notes":     slot.Notes,
	}

	if slot.CreatedAt != nil {
		result["createdAt"] = map[string]int64{
			"seconds": slot.CreatedAt.Seconds,
		}
	}

	if slot.UpdatedAt != nil {
		result["updatedAt"] = map[string]int64{
			"seconds": slot.UpdatedAt.Seconds,
		}
	}

	if slot.OfflineLocation != nil {
		result["offlineLocation"] = map[string]interface{}{
			"placeName":     slot.OfflineLocation.PlaceName,
			"address":       slot.OfflineLocation.Address,
			"city":          slot.OfflineLocation.City,
			"state":         slot.OfflineLocation.State,
			"country":       slot.OfflineLocation.Country,
			"zipcode":       slot.OfflineLocation.Zipcode,
			"latitude":      slot.OfflineLocation.Latitude,
			"longitude":     slot.OfflineLocation.Longitude,
			"googlePlaceId": slot.OfflineLocation.GooglePlaceId,
			"googleMapsUrl": slot.OfflineLocation.GoogleMapsUrl,
		}
	}

	return result
}

// AvailabilitySlotsToJSON converts multiple slots to JSON
func AvailabilitySlotsToJSON(slots []*availabilitypb.AvailabilitySlot) []map[string]interface{} {
	if slots == nil {
		return nil
	}

	result := make([]map[string]interface{}, len(slots))
	for i, slot := range slots {
		result[i] = AvailabilitySlotToJSON(slot)
	}
	return result
}
