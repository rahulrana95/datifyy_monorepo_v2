/**
 * Auth REST Adapter
 * Transforms protobuf format to REST API format for backend endpoints
 */

import type {
  LoginWithEmailRequest,
  RegisterWithEmailRequest,
  RegisterWithPhoneRequest,
  RequestPhoneOTPRequest,
  LoginWithPhoneRequest,
  LoginWithOAuthRequest,
  RefreshTokenRequest,
  RevokeTokenRequest,
  ValidateTokenRequest,
  SendEmailVerificationRequest,
  VerifyEmailRequest,
  SendPhoneVerificationRequest,
  VerifyPhoneRequest,
  ResendVerificationCodeRequest,
  RequestPasswordResetRequest,
  ConfirmPasswordResetRequest,
  ChangePasswordRequest,
  RevokeSessionRequest,
  RevokeAllSessionsRequest,
  TrustDeviceRequest,
  RevokeDeviceRequest,
  LogoutRequest,
  LogoutAllRequest,
} from '../../gen/auth/v1/auth_pb';

/**
 * Helper function to transform device info
 */
function transformDeviceInfo(deviceInfo?: any) {
  if (!deviceInfo) return undefined;

  return {
    platform: deviceInfo.platform || 1,
    device_name: deviceInfo.deviceName || 'Unknown Device',
    os_version: deviceInfo.osVersion || '',
    device_id: deviceInfo.deviceId || '',
    app_version: deviceInfo.appVersion || '',
    browser: deviceInfo.browser || '',
  };
}

// ============================================================================
// Registration Transformations
// ============================================================================

/**
 * Transform protobuf RegisterWithEmailRequest to REST format
 */
export function transformRegisterRequest(request: Partial<RegisterWithEmailRequest>) {
  const credentials = request.credentials;

  if (!credentials) {
    throw new Error('Credentials are required');
  }

  return {
    email: credentials.email,
    password: credentials.password,
    name: credentials.name || '',
    device_info: transformDeviceInfo(credentials.deviceInfo),
  };
}

/**
 * Transform protobuf RegisterWithPhoneRequest to REST format
 */
export function transformRegisterWithPhoneRequest(request: any) {
  const credentials = request.credentials;

  if (!credentials) {
    throw new Error('Credentials are required');
  }

  return {
    phone_number: credentials.phoneNumber,
    password: credentials.password,
    name: credentials.name || '',
    device_info: transformDeviceInfo(credentials.deviceInfo),
  };
}

// ============================================================================
// Login Transformations
// ============================================================================

/**
 * Transform protobuf LoginWithEmailRequest to REST format
 */
export function transformLoginRequest(request: Partial<LoginWithEmailRequest>) {
  const credentials = request.credentials;

  if (!credentials) {
    throw new Error('Credentials are required');
  }

  return {
    email: credentials.email,
    password: credentials.password,
    device_info: transformDeviceInfo(credentials.deviceInfo),
  };
}

/**
 * Transform protobuf RequestPhoneOTPRequest to REST format
 */
export function transformRequestPhoneOTPRequest(request: Partial<RequestPhoneOTPRequest>) {
  return {
    phone_number: request.phoneNumber,
  };
}

/**
 * Transform protobuf LoginWithPhoneRequest to REST format
 */
export function transformLoginWithPhoneRequest(request: any) {
  return {
    phone_number: request.phoneNumber,
    otp_code: request.otpCode,
    device_info: transformDeviceInfo(request.deviceInfo),
  };
}

/**
 * Transform protobuf LoginWithOAuthRequest to REST format
 */
export function transformLoginWithOAuthRequest(request: any) {
  return {
    provider: request.provider,
    access_token: request.accessToken,
    id_token: request.idToken,
    device_info: transformDeviceInfo(request.deviceInfo),
  };
}

// ============================================================================
// Token Management Transformations
// ============================================================================

/**
 * Transform protobuf RefreshTokenRequest to REST format
 */
export function transformRefreshTokenRequest(request: Partial<RefreshTokenRequest>) {
  return {
    refresh_token: request.refreshToken,
    device_info: transformDeviceInfo(request.deviceInfo),
  };
}

/**
 * Transform protobuf RevokeTokenRequest to REST format
 */
export function transformRevokeTokenRequest(request: Partial<RevokeTokenRequest>) {
  return {
    refresh_token: request.refreshToken,
  };
}

/**
 * Transform protobuf ValidateTokenRequest to REST format
 */
export function transformValidateTokenRequest(request: Partial<ValidateTokenRequest>) {
  return {
    access_token: request.accessToken,
  };
}

// ============================================================================
// Email Verification Transformations
// ============================================================================

/**
 * Transform protobuf SendEmailVerificationRequest to REST format
 */
export function transformSendEmailVerificationRequest(request: Partial<SendEmailVerificationRequest>) {
  return {
    email: request.email,
  };
}

/**
 * Transform protobuf VerifyEmailRequest to REST format
 */
export function transformVerifyEmailRequest(request: any) {
  return {
    email: request.email,
    verification_code: request.verificationCode || request.code,
  };
}

// ============================================================================
// Phone Verification Transformations
// ============================================================================

/**
 * Transform protobuf SendPhoneVerificationRequest to REST format
 */
export function transformSendPhoneVerificationRequest(request: any) {
  return {
    phone_number: request.phoneNumber,
  };
}

/**
 * Transform protobuf VerifyPhoneRequest to REST format
 */
export function transformVerifyPhoneRequest(request: any) {
  return {
    phone_number: request.phoneNumber,
    otp_code: request.otpCode || request.code,
  };
}

/**
 * Transform protobuf ResendVerificationCodeRequest to REST format
 */
export function transformResendVerificationCodeRequest(request: any) {
  return {
    email: request.email,
    phone_number: request.phoneNumber,
    verification_type: request.verificationType,
  };
}

// ============================================================================
// Password Management Transformations
// ============================================================================

/**
 * Transform protobuf RequestPasswordResetRequest to REST format
 */
export function transformRequestPasswordResetRequest(request: any) {
  return {
    email: request.email,
  };
}

/**
 * Transform protobuf ConfirmPasswordResetRequest to REST format
 */
export function transformConfirmPasswordResetRequest(request: any) {
  return {
    email: request.email,
    reset_token: request.resetToken || request.token,
    new_password: request.newPassword,
  };
}

/**
 * Transform protobuf ChangePasswordRequest to REST format
 */
export function transformChangePasswordRequest(request: Partial<ChangePasswordRequest>) {
  return {
    current_password: request.currentPassword,
    new_password: request.newPassword,
  };
}

// ============================================================================
// Session Management Transformations
// ============================================================================

/**
 * Transform protobuf RevokeSessionRequest to REST format
 */
export function transformRevokeSessionRequest(request: Partial<RevokeSessionRequest>) {
  return {
    session_id: request.sessionId,
  };
}

/**
 * Transform protobuf RevokeAllSessionsRequest to REST format
 */
export function transformRevokeAllSessionsRequest(request: any) {
  return {
    exclude_current: request.excludeCurrent,
  };
}

// ============================================================================
// Device Management Transformations
// ============================================================================

/**
 * Transform protobuf TrustDeviceRequest to REST format
 */
export function transformTrustDeviceRequest(request: Partial<TrustDeviceRequest>) {
  return {
    device_id: request.deviceId,
  };
}

/**
 * Transform protobuf RevokeDeviceRequest to REST format
 */
export function transformRevokeDeviceRequest(request: Partial<RevokeDeviceRequest>) {
  return {
    device_id: request.deviceId,
  };
}

// ============================================================================
// Logout Transformations
// ============================================================================

/**
 * Transform protobuf LogoutRequest to REST format
 */
export function transformLogoutRequest(request: any) {
  return {
    refresh_token: request.refreshToken,
  };
}

/**
 * Transform protobuf LogoutAllRequest to REST format
 */
export function transformLogoutAllRequest(request: any) {
  return {
    refresh_token: request.refreshToken,
  };
}

// ============================================================================
// Response Transformations
// ============================================================================

/**
 * Transform REST response to protobuf-compatible format
 * Converts snake_case to camelCase
 * Used for login and registration responses
 */
export function transformAuthResponse(restResponse: any) {
  return {
    user: restResponse.user ? {
      userId: restResponse.user.user_id,
      email: restResponse.user.email,
      name: restResponse.user.name,
      phoneNumber: restResponse.user.phone_number,
      photoUrl: restResponse.user.photo_url,
      accountStatus: restResponse.user.account_status,
      emailVerified: restResponse.user.email_verified,
      phoneVerified: restResponse.user.phone_verified,
      createdAt: restResponse.user.created_at,
      lastLoginAt: restResponse.user.last_login_at,
    } : undefined,
    tokens: restResponse.tokens ? {
      accessToken: {
        token: restResponse.tokens.access_token?.token,
        expiresAt: restResponse.tokens.access_token?.expires_at,
        tokenType: restResponse.tokens.access_token?.token_type || 'Bearer',
      },
      refreshToken: {
        token: restResponse.tokens.refresh_token?.token,
        expiresAt: restResponse.tokens.refresh_token?.expires_at,
      },
    } : undefined,
    session: restResponse.session ? {
      sessionId: restResponse.session.session_id,
      userId: restResponse.session.user_id,
      deviceInfo: restResponse.session.device_info,
      createdAt: restResponse.session.created_at,
      lastActiveAt: restResponse.session.last_active_at,
      expiresAt: restResponse.session.expires_at,
      ipAddress: restResponse.session.ip_address,
      location: restResponse.session.location,
      isCurrent: restResponse.session.is_current,
    } : undefined,
    requiresEmailVerification: restResponse.requires_email_verification,
  };
}

/**
 * Transform verification response
 */
export function transformVerificationResponse(restResponse: any) {
  return {
    success: restResponse.success,
    message: restResponse.message,
    verified: restResponse.verified,
    expiresAt: restResponse.expires_at,
  };
}

/**
 * Transform session list response
 */
export function transformSessionListResponse(restResponse: any) {
  return {
    sessions: restResponse.sessions?.map((session: any) => ({
      sessionId: session.session_id,
      userId: session.user_id,
      deviceInfo: session.device_info,
      createdAt: session.created_at,
      lastActiveAt: session.last_active_at,
      expiresAt: session.expires_at,
      ipAddress: session.ip_address,
      location: session.location,
      isCurrent: session.is_current,
    })) || [],
    pagination: restResponse.pagination ? {
      page: restResponse.pagination.page,
      pageSize: restResponse.pagination.page_size,
      totalPages: restResponse.pagination.total_pages,
      totalItems: restResponse.pagination.total_items,
    } : undefined,
  };
}

/**
 * Transform device list response
 */
export function transformDeviceListResponse(restResponse: any) {
  return {
    devices: restResponse.devices?.map((device: any) => ({
      deviceId: device.device_id,
      userId: device.user_id,
      deviceName: device.device_name,
      platform: device.platform,
      osVersion: device.os_version,
      appVersion: device.app_version,
      browser: device.browser,
      isTrusted: device.is_trusted,
      lastUsedAt: device.last_used_at,
      createdAt: device.created_at,
    })) || [],
    pagination: restResponse.pagination ? {
      page: restResponse.pagination.page,
      pageSize: restResponse.pagination.page_size,
      totalPages: restResponse.pagination.total_pages,
      totalItems: restResponse.pagination.total_items,
    } : undefined,
  };
}

/**
 * Transform simple success response
 */
export function transformSuccessResponse(restResponse: any) {
  return {
    success: restResponse.success !== false,
    message: restResponse.message || 'Operation successful',
  };
}
