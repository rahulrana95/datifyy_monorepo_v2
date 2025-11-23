# HTTP Endpoint Analysis - Proto vs Implementation

**Analysis Date:** 2025-11-23
**Total Proto RPCs:** 66
**Total HTTP Endpoints:** 22 registered
**Coverage:** ~33%

---

## 1. AuthService (20 RPCs defined)

### ✅ Implemented (4/20):
| RPC Method | HTTP Endpoint | Status |
|------------|---------------|--------|
| `RegisterWithEmail` | `POST /api/v1/auth/register/email` | ✅ |
| `LoginWithEmail` | `POST /api/v1/auth/login/email` | ✅ |
| `RefreshToken` | `POST /api/v1/auth/token/refresh` | ✅ |
| `RevokeToken` | `POST /api/v1/auth/token/revoke` | ✅ |

### ❌ Missing (16/20):
| RPC Method | Suggested HTTP Endpoint | Priority |
|------------|------------------------|----------|
| `RegisterWithPhone` | `POST /api/v1/auth/register/phone` | HIGH |
| `RequestPhoneOTP` | `POST /api/v1/auth/phone/otp/request` | HIGH |
| `LoginWithPhone` | `POST /api/v1/auth/login/phone` | HIGH |
| `LoginWithOAuth` | `POST /api/v1/auth/login/oauth` | MEDIUM |
| `ValidateToken` | `POST /api/v1/auth/token/validate` | HIGH |
| `SendEmailVerification` | `POST /api/v1/auth/email/verification/send` | HIGH |
| `VerifyEmail` | `POST /api/v1/auth/email/verification/confirm` | HIGH |
| `ResendVerificationCode` | `POST /api/v1/auth/verification/resend` | MEDIUM |
| `SendPhoneVerification` | `POST /api/v1/auth/phone/verification/send` | MEDIUM |
| `VerifyPhone` | `POST /api/v1/auth/phone/verification/confirm` | MEDIUM |
| `RequestPasswordReset` | `POST /api/v1/auth/password/reset/request` | HIGH |
| `ConfirmPasswordReset` | `POST /api/v1/auth/password/reset/confirm` | HIGH |
| `ChangePassword` | `POST /api/v1/auth/password/change` | HIGH |
| `GetCurrentSession` | `GET /api/v1/auth/session/current` | MEDIUM |
| `ListSessions` | `GET /api/v1/auth/sessions` | LOW |
| `RevokeSession` | `DELETE /api/v1/auth/sessions/{sessionId}` | LOW |

---

## 2. AdminService (23 RPCs defined)

### ✅ Implemented (23/23):
| RPC Method | HTTP Endpoint | Status |
|------------|---------------|--------|
| `AdminLogin` | `POST /api/v1/admin/login` | ✅ |
| `GetAllUsers` | `GET /api/v1/admin/users` | ✅ |
| `SearchUsers` | `GET /api/v1/admin/users/search` | ✅ |
| `GetUserDetails` | `GET /api/v1/admin/users/{id}` | ✅ |
| `BulkUserAction` | `POST /api/v1/admin/users/bulk` | ✅ |
| `GetDateSuggestions` | `GET /api/v1/admin/suggestions/{id}` | ✅ |
| `ScheduleDate` | `POST /api/v1/admin/dates` | ✅ |
| `GetCurationCandidates` | `GET /api/v1/admin/curation/candidates` | ✅ |
| `CurateDates` | `POST /api/v1/admin/curation/analyze` | ✅ |
| `GetGenieDates` | `GET /api/v1/admin/dates` | ✅ |
| `UpdateDateStatus` | `PUT /api/v1/admin/dates/{id}` | ✅ |
| `CreateAdminUser` | `POST /api/v1/admin/admins` | ✅ |
| `GetAllAdmins` | `GET /api/v1/admin/admins` | ✅ |
| `UpdateAdmin` | `PUT /api/v1/admin/admins/{id}` | ✅ |
| `DeleteAdmin` | `DELETE /api/v1/admin/admins/{id}` | ✅ |
| `UpdateAdminProfile` | `PUT /api/v1/admin/profile` | ✅ |
| `GetPlatformStats` | `GET /api/v1/admin/analytics/platform` | ✅ |
| `GetUserGrowth` | `GET /api/v1/admin/analytics/user-growth` | ✅ |
| `GetActiveUsers` | `GET /api/v1/admin/analytics/active-users` | ✅ |
| `GetSignups` | `GET /api/v1/admin/analytics/signups` | ✅ |
| `GetDemographics` | `GET /api/v1/admin/analytics/demographics` | ✅ |
| `GetLocationStats` | `GET /api/v1/admin/analytics/locations` | ✅ |
| `GetAvailabilityStats` | `GET /api/v1/admin/analytics/availability` | ✅ |

**🎉 Admin Service: 100% Coverage!**

---

## 3. UserService (16 RPCs defined)

### ✅ Implemented (2/16):
| RPC Method | HTTP Endpoint | Status |
|------------|---------------|--------|
| `GetMyProfile` | `GET /api/v1/user/me` | ✅ |
| `GetPartnerPreferences` | `GET /api/v1/partner-preferences` | ✅ |
| `UpdatePartnerPreferences` | `PUT /api/v1/partner-preferences` | ✅ |

### ❌ Missing (13/16):
| RPC Method | Suggested HTTP Endpoint | Priority |
|------------|------------------------|----------|
| `GetUserProfile` | `GET /api/v1/user/profile/{userId}` | HIGH |
| `UpdateProfile` | `PUT /api/v1/user/profile` | HIGH |
| `DeleteAccount` | `DELETE /api/v1/user/account` | MEDIUM |
| `UploadProfilePhoto` | `POST /api/v1/user/photos` | HIGH |
| `DeleteProfilePhoto` | `DELETE /api/v1/user/photos/{photoId}` | MEDIUM |
| `SearchUsers` | `GET /api/v1/user/search` | HIGH |
| `GetRecommendations` | `GET /api/v1/user/recommendations` | HIGH |
| `GetUserPreferences` | `GET /api/v1/user/preferences` | MEDIUM |
| `UpdateUserPreferences` | `PUT /api/v1/user/preferences` | MEDIUM |
| `BlockUser` | `POST /api/v1/user/block/{userId}` | HIGH |
| `UnblockUser` | `DELETE /api/v1/user/block/{userId}` | MEDIUM |
| `ListBlockedUsers` | `GET /api/v1/user/blocked` | LOW |
| `ReportUser` | `POST /api/v1/user/report/{userId}` | HIGH |

---

## 4. AvailabilityService (3 RPCs defined)

### ⚠️ Partially Implemented (1/3):
| RPC Method | HTTP Endpoint | Status |
|------------|---------------|--------|
| `GetAvailability` | `GET /api/v1/availability` | ✅ |
| `SubmitAvailability` | `POST /api/v1/availability` | ✅ |
| `DeleteAvailability` | `DELETE /api/v1/availability/{slotId}` | ❌ MISSING |

**Note:** The availability handler uses a single endpoint with method routing, but may not support all operations correctly.

---

## Summary by Service

| Service | Implemented | Missing | Coverage |
|---------|------------|---------|----------|
| **AuthService** | 4 | 16 | 20% |
| **AdminService** | 23 | 0 | 100% ✅ |
| **UserService** | 3 | 13 | 19% |
| **AvailabilityService** | 2 | 1 | 67% |
| **TOTAL** | **32** | **30** | **52%** |

---

## Priority Recommendations

### 🔴 Critical (Must Have):
1. **Auth:** Email verification flow (SendEmailVerification, VerifyEmail)
2. **Auth:** Password reset flow (RequestPasswordReset, ConfirmPasswordReset)
3. **Auth:** Token validation (ValidateToken)
4. **User:** Profile updates (UpdateProfile)
5. **User:** Photo upload (UploadProfilePhoto)
6. **User:** User search (SearchUsers)
7. **User:** Recommendations (GetRecommendations)
8. **User:** Block/Report functionality

### 🟡 Important (Should Have):
1. **Auth:** Phone authentication (RegisterWithPhone, LoginWithPhone, RequestPhoneOTP)
2. **Auth:** Password change (ChangePassword)
3. **User:** Get other user profiles (GetUserProfile)
4. **User:** User preferences management
5. **Availability:** Delete availability slot

### 🟢 Nice to Have:
1. **Auth:** OAuth login
2. **Auth:** Session management (GetCurrentSession, ListSessions, RevokeSession)
3. **User:** Delete account
4. **User:** List blocked users

---

## Next Steps

1. **Implement Critical Auth Endpoints** (Email verification, Password reset, Token validation)
2. **Implement Critical User Endpoints** (Profile update, Photos, Search, Recommendations)
3. **Complete Availability Service** (Delete endpoint)
4. **Add Comprehensive Testing** for all new endpoints
5. **Update API Documentation**

---

## Notes

- Admin service has **excellent coverage (100%)** - well done!
- Auth service needs immediate attention - core auth features are missing
- User service needs most work - only 19% coverage
- Consider using a REST framework or adding OpenAPI/Swagger documentation
- All endpoints should have proper authentication middleware
- Consider rate limiting for auth endpoints
