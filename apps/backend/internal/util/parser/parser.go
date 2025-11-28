package parser

import (
	"strconv"
	"strings"

	availabilitypb "github.com/datifyy/backend/gen/availability/v1"
)

// ParseInt64 safely parses string to int64
func ParseInt64(s string) (int64, error) {
	if s == "" {
		return 0, nil
	}
	return strconv.ParseInt(s, 10, 64)
}

// ParseInt32 safely parses string to int32
func ParseInt32(s string) (int32, error) {
	if s == "" {
		return 0, nil
	}
	val, err := strconv.ParseInt(s, 10, 32)
	return int32(val), err
}

// ParseBool safely parses string to bool
func ParseBool(s string) bool {
	val, _ := strconv.ParseBool(s)
	return val
}

// StringToDateType converts string to DateType enum
func StringToDateType(s string) availabilitypb.DateType {
	switch strings.ToUpper(s) {
	case "ONLINE":
		return availabilitypb.DateType_DATE_TYPE_ONLINE
	case "OFFLINE":
		return availabilitypb.DateType_DATE_TYPE_OFFLINE
	case "EVENT", "OFFLINE_EVENT":
		return availabilitypb.DateType_DATE_TYPE_OFFLINE_EVENT
	default:
		return availabilitypb.DateType_DATE_TYPE_UNSPECIFIED
	}
}
