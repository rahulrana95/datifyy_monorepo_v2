package service

import (
	"time"

	commonpb "github.com/datifyy/backend/gen/common/v1"
)

// accountStatusToProto converts database account status to proto enum
func accountStatusToProto(status string) commonpb.AccountStatus {
	switch status {
	case "ACTIVE":
		return commonpb.AccountStatus_ACCOUNT_STATUS_ACTIVE
	case "PENDING":
		return commonpb.AccountStatus_ACCOUNT_STATUS_PENDING
	case "SUSPENDED":
		return commonpb.AccountStatus_ACCOUNT_STATUS_SUSPENDED
	case "BANNED":
		return commonpb.AccountStatus_ACCOUNT_STATUS_BANNED
	case "DELETED":
		return commonpb.AccountStatus_ACCOUNT_STATUS_DELETED
	default:
		return commonpb.AccountStatus_ACCOUNT_STATUS_UNSPECIFIED
	}
}

// emailVerificationStatusToProto converts boolean verification status to proto enum
func emailVerificationStatusToProto(verified bool) commonpb.VerificationStatus {
	if verified {
		return commonpb.VerificationStatus_VERIFICATION_STATUS_VERIFIED
	}
	return commonpb.VerificationStatus_VERIFICATION_STATUS_UNVERIFIED
}

// timeToProto converts a Go time.Time to proto Timestamp
func timeToProto(t time.Time) *commonpb.Timestamp {
	return &commonpb.Timestamp{
		Seconds: t.Unix(),
		Nanos:   int32(t.Nanosecond()),
	}
}
