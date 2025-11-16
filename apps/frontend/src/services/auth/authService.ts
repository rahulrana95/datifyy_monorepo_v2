/**
 * Auth Service
 * Handles all authentication-related API calls
 */

import { ApiClient } from '../base';
import {
  transformLoginRequest,
  transformRegisterRequest,
  transformRegisterWithPhoneRequest,
  transformRequestPhoneOTPRequest,
  transformLoginWithPhoneRequest,
  transformLoginWithOAuthRequest,
  transformRefreshTokenRequest,
  transformRevokeTokenRequest,
  transformValidateTokenRequest,
  transformSendEmailVerificationRequest,
  transformVerifyEmailRequest,
  transformSendPhoneVerificationRequest,
  transformVerifyPhoneRequest,
  transformResendVerificationCodeRequest,
  transformRequestPasswordResetRequest,
  transformConfirmPasswordResetRequest,
  transformChangePasswordRequest,
  transformRevokeSessionRequest,
  transformRevokeAllSessionsRequest,
  transformTrustDeviceRequest,
  transformRevokeDeviceRequest,
  transformLogoutRequest,
  transformLogoutAllRequest,
  transformAuthResponse,
  transformVerificationResponse,
  transformSessionListResponse,
  transformDeviceListResponse,
  transformSuccessResponse,
} from './authRestAdapter';
import type {
  RegisterWithEmailRequest,
  RegisterWithEmailResponse,
  RegisterWithPhoneRequest,
  RegisterWithPhoneResponse,
  LoginWithEmailRequest,
  LoginWithEmailResponse,
  RequestPhoneOTPRequest,
  RequestPhoneOTPResponse,
  LoginWithPhoneRequest,
  LoginWithPhoneResponse,
  LoginWithOAuthRequest,
  LoginWithOAuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  SendEmailVerificationRequest,
  SendEmailVerificationResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationCodeRequest,
  ResendVerificationCodeResponse,
  SendPhoneVerificationRequest,
  SendPhoneVerificationResponse,
  VerifyPhoneRequest,
  VerifyPhoneResponse,
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
  ConfirmPasswordResetRequest,
  ConfirmPasswordResetResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  GetCurrentSessionRequest,
  GetCurrentSessionResponse,
  ListSessionsRequest,
  ListSessionsResponse,
  RevokeSessionRequest,
  RevokeSessionResponse,
  RevokeAllSessionsRequest,
  RevokeAllSessionsResponse,
  ListDevicesRequest,
  ListDevicesResponse,
  TrustDeviceRequest,
  TrustDeviceResponse,
  RevokeDeviceRequest,
  RevokeDeviceResponse,
  LogoutRequest,
  LogoutResponse,
  LogoutAllRequest,
  LogoutAllResponse,
} from '../../gen/auth/v1/auth_pb';

/**
 * Extract plain object type from protobuf Message
 */
type PlainMessage<T> = Omit<T, '$typeName'>;

/**
 * Auth Service Interface
 * Defines all authentication-related methods
 */
export interface IAuthService {
  // Registration
  registerWithEmail(request: PlainMessage<RegisterWithEmailRequest>): Promise<RegisterWithEmailResponse>;
  registerWithPhone(request: PlainMessage<RegisterWithPhoneRequest>): Promise<RegisterWithPhoneResponse>;

  // Login
  loginWithEmail(request: PlainMessage<LoginWithEmailRequest>): Promise<LoginWithEmailResponse>;
  requestPhoneOTP(request: PlainMessage<RequestPhoneOTPRequest>): Promise<RequestPhoneOTPResponse>;
  loginWithPhone(request: PlainMessage<LoginWithPhoneRequest>): Promise<LoginWithPhoneResponse>;
  loginWithOAuth(request: PlainMessage<LoginWithOAuthRequest>): Promise<LoginWithOAuthResponse>;

  // Token Management
  refreshToken(request: PlainMessage<RefreshTokenRequest>): Promise<RefreshTokenResponse>;
  revokeToken(request: PlainMessage<RevokeTokenRequest>): Promise<RevokeTokenResponse>;
  validateToken(request: PlainMessage<ValidateTokenRequest>): Promise<ValidateTokenResponse>;

  // Email Verification
  sendEmailVerification(request: PlainMessage<SendEmailVerificationRequest>): Promise<SendEmailVerificationResponse>;
  verifyEmail(request: PlainMessage<VerifyEmailRequest>): Promise<VerifyEmailResponse>;

  // Phone Verification
  sendPhoneVerification(request: PlainMessage<SendPhoneVerificationRequest>): Promise<SendPhoneVerificationResponse>;
  verifyPhone(request: PlainMessage<VerifyPhoneRequest>): Promise<VerifyPhoneResponse>;

  // Verification Code
  resendVerificationCode(request: PlainMessage<ResendVerificationCodeRequest>): Promise<ResendVerificationCodeResponse>;

  // Password Management
  requestPasswordReset(request: PlainMessage<RequestPasswordResetRequest>): Promise<RequestPasswordResetResponse>;
  confirmPasswordReset(request: PlainMessage<ConfirmPasswordResetRequest>): Promise<ConfirmPasswordResetResponse>;
  changePassword(request: PlainMessage<ChangePasswordRequest>): Promise<ChangePasswordResponse>;

  // Session Management
  getCurrentSession(request: PlainMessage<GetCurrentSessionRequest>): Promise<GetCurrentSessionResponse>;
  listSessions(request: PlainMessage<ListSessionsRequest>): Promise<ListSessionsResponse>;
  revokeSession(request: PlainMessage<RevokeSessionRequest>): Promise<RevokeSessionResponse>;
  revokeAllSessions(request: PlainMessage<RevokeAllSessionsRequest>): Promise<RevokeAllSessionsResponse>;

  // Device Management
  listDevices(request: PlainMessage<ListDevicesRequest>): Promise<ListDevicesResponse>;
  trustDevice(request: PlainMessage<TrustDeviceRequest>): Promise<TrustDeviceResponse>;
  revokeDevice(request: PlainMessage<RevokeDeviceRequest>): Promise<RevokeDeviceResponse>;

  // Logout
  logout(request: PlainMessage<LogoutRequest>): Promise<LogoutResponse>;
  logoutAll(request: PlainMessage<LogoutAllRequest>): Promise<LogoutAllResponse>;
}

/**
 * Auth Service Implementation
 * Implements all authentication-related methods using the base API client
 */
export class AuthService implements IAuthService {
  private readonly basePath = '/api/v1/auth';

  constructor(private apiClient: ApiClient) {}

  // ============================================================================
  // Registration Methods
  // ============================================================================

  async registerWithEmail(request: PlainMessage<RegisterWithEmailRequest>): Promise<RegisterWithEmailResponse> {
    const restRequest = transformRegisterRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/register/email`,
      restRequest,
      { skipAuth: true }
    );
    return transformAuthResponse(response.data) as unknown as RegisterWithEmailResponse;
  }

  async registerWithPhone(request: PlainMessage<RegisterWithPhoneRequest>): Promise<RegisterWithPhoneResponse> {
    const restRequest = transformRegisterWithPhoneRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/register/phone`,
      restRequest,
      { skipAuth: true }
    );
    return transformAuthResponse(response.data) as unknown as RegisterWithPhoneResponse;
  }

  // ============================================================================
  // Login Methods
  // ============================================================================

  async loginWithEmail(request: PlainMessage<LoginWithEmailRequest>): Promise<LoginWithEmailResponse> {
    const restRequest = transformLoginRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/login/email`,
      restRequest,
      { skipAuth: true }
    );
    return transformAuthResponse(response.data) as unknown as LoginWithEmailResponse;
  }

  async requestPhoneOTP(request: PlainMessage<RequestPhoneOTPRequest>): Promise<RequestPhoneOTPResponse> {
    const restRequest = transformRequestPhoneOTPRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/otp/request`,
      restRequest,
      { skipAuth: true }
    );
    return transformSuccessResponse(response.data) as unknown as RequestPhoneOTPResponse;
  }

  async loginWithPhone(request: PlainMessage<LoginWithPhoneRequest>): Promise<LoginWithPhoneResponse> {
    const restRequest = transformLoginWithPhoneRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/login/phone`,
      restRequest,
      { skipAuth: true }
    );
    return transformAuthResponse(response.data) as unknown as LoginWithPhoneResponse;
  }

  async loginWithOAuth(request: PlainMessage<LoginWithOAuthRequest>): Promise<LoginWithOAuthResponse> {
    const restRequest = transformLoginWithOAuthRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/login/oauth`,
      restRequest,
      { skipAuth: true }
    );
    return transformAuthResponse(response.data) as unknown as LoginWithOAuthResponse;
  }

  // ============================================================================
  // Token Management Methods
  // ============================================================================

  async refreshToken(request: PlainMessage<RefreshTokenRequest>): Promise<RefreshTokenResponse> {
    const restRequest = transformRefreshTokenRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/token/refresh`,
      restRequest,
      { skipAuth: true }
    );
    const transformed = transformAuthResponse(response.data);
    return { tokens: transformed.tokens } as unknown as RefreshTokenResponse;
  }

  async revokeToken(request: PlainMessage<RevokeTokenRequest>): Promise<RevokeTokenResponse> {
    const restRequest = transformRevokeTokenRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/token/revoke`,
      restRequest
    );
    const data = response.data as { message?: string };
    return { success: true, message: data.message || 'Token revoked successfully' } as unknown as RevokeTokenResponse;
  }

  async validateToken(request: PlainMessage<ValidateTokenRequest>): Promise<ValidateTokenResponse> {
    const restRequest = transformValidateTokenRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/token/validate`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as ValidateTokenResponse;
  }

  // ============================================================================
  // Email Verification Methods
  // ============================================================================

  async sendEmailVerification(request: PlainMessage<SendEmailVerificationRequest>): Promise<SendEmailVerificationResponse> {
    const restRequest = transformSendEmailVerificationRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/verification/email/send`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as SendEmailVerificationResponse;
  }

  async verifyEmail(request: PlainMessage<VerifyEmailRequest>): Promise<VerifyEmailResponse> {
    const restRequest = transformVerifyEmailRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/verification/email/verify`,
      restRequest,
      { skipAuth: true }
    );
    return transformVerificationResponse(response.data) as unknown as VerifyEmailResponse;
  }

  // ============================================================================
  // Phone Verification Methods
  // ============================================================================

  async sendPhoneVerification(request: PlainMessage<SendPhoneVerificationRequest>): Promise<SendPhoneVerificationResponse> {
    const restRequest = transformSendPhoneVerificationRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/verification/phone/send`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as SendPhoneVerificationResponse;
  }

  async verifyPhone(request: PlainMessage<VerifyPhoneRequest>): Promise<VerifyPhoneResponse> {
    const restRequest = transformVerifyPhoneRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/verification/phone/verify`,
      restRequest,
      { skipAuth: true }
    );
    return transformVerificationResponse(response.data) as unknown as VerifyPhoneResponse;
  }

  // ============================================================================
  // Verification Code Methods
  // ============================================================================

  async resendVerificationCode(request: PlainMessage<ResendVerificationCodeRequest>): Promise<ResendVerificationCodeResponse> {
    const restRequest = transformResendVerificationCodeRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/verification/resend`,
      restRequest,
      { skipAuth: true }
    );
    return transformSuccessResponse(response.data) as unknown as ResendVerificationCodeResponse;
  }

  // ============================================================================
  // Password Management Methods
  // ============================================================================

  async requestPasswordReset(request: PlainMessage<RequestPasswordResetRequest>): Promise<RequestPasswordResetResponse> {
    const restRequest = transformRequestPasswordResetRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/password/reset/request`,
      restRequest,
      { skipAuth: true }
    );
    return transformSuccessResponse(response.data) as unknown as RequestPasswordResetResponse;
  }

  async confirmPasswordReset(request: PlainMessage<ConfirmPasswordResetRequest>): Promise<ConfirmPasswordResetResponse> {
    const restRequest = transformConfirmPasswordResetRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/password/reset/confirm`,
      restRequest,
      { skipAuth: true }
    );
    return transformSuccessResponse(response.data) as unknown as ConfirmPasswordResetResponse;
  }

  async changePassword(request: PlainMessage<ChangePasswordRequest>): Promise<ChangePasswordResponse> {
    const restRequest = transformChangePasswordRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/password/change`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as ChangePasswordResponse;
  }

  // ============================================================================
  // Session Management Methods
  // ============================================================================

  async getCurrentSession(_request: PlainMessage<GetCurrentSessionRequest>): Promise<GetCurrentSessionResponse> {
    const response = await this.apiClient.get(
      `${this.basePath}/session/current`
    );
    // Transform session response
    const session = response.data as any;
    return {
      session: {
        sessionId: session.session_id,
        userId: session.user_id,
        deviceInfo: session.device_info,
        createdAt: session.created_at,
        lastActiveAt: session.last_active_at,
        expiresAt: session.expires_at,
        ipAddress: session.ip_address,
        location: session.location,
        isCurrent: session.is_current,
      }
    } as unknown as GetCurrentSessionResponse;
  }

  async listSessions(request: PlainMessage<ListSessionsRequest>): Promise<ListSessionsResponse> {
    const params = request.pagination ? {
      page: request.pagination.page,
      page_size: request.pagination.pageSize,
    } : undefined;

    const response = await this.apiClient.get(
      `${this.basePath}/sessions`,
      { params }
    );
    return transformSessionListResponse(response.data) as unknown as ListSessionsResponse;
  }

  async revokeSession(request: PlainMessage<RevokeSessionRequest>): Promise<RevokeSessionResponse> {
    const restRequest = transformRevokeSessionRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/session/revoke`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as RevokeSessionResponse;
  }

  async revokeAllSessions(request: PlainMessage<RevokeAllSessionsRequest>): Promise<RevokeAllSessionsResponse> {
    const restRequest = transformRevokeAllSessionsRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/sessions/revoke-all`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as RevokeAllSessionsResponse;
  }

  // ============================================================================
  // Device Management Methods
  // ============================================================================

  async listDevices(request: PlainMessage<ListDevicesRequest>): Promise<ListDevicesResponse> {
    const params = request.pagination ? {
      page: request.pagination.page,
      page_size: request.pagination.pageSize,
    } : undefined;

    const response = await this.apiClient.get(
      `${this.basePath}/devices`,
      { params }
    );
    return transformDeviceListResponse(response.data) as unknown as ListDevicesResponse;
  }

  async trustDevice(request: PlainMessage<TrustDeviceRequest>): Promise<TrustDeviceResponse> {
    const restRequest = transformTrustDeviceRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/device/trust`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as TrustDeviceResponse;
  }

  async revokeDevice(request: PlainMessage<RevokeDeviceRequest>): Promise<RevokeDeviceResponse> {
    const restRequest = transformRevokeDeviceRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/device/revoke`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as RevokeDeviceResponse;
  }

  // ============================================================================
  // Logout Methods
  // ============================================================================

  async logout(request: PlainMessage<LogoutRequest>): Promise<LogoutResponse> {
    const restRequest = transformLogoutRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/logout`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as LogoutResponse;
  }

  async logoutAll(request: PlainMessage<LogoutAllRequest>): Promise<LogoutAllResponse> {
    const restRequest = transformLogoutAllRequest(request);
    const response = await this.apiClient.post(
      `${this.basePath}/logout/all`,
      restRequest
    );
    return transformSuccessResponse(response.data) as unknown as LogoutAllResponse;
  }
}
