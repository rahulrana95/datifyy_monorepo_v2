/**
 * Auth Service
 * Handles all authentication-related API calls
 */

import { ApiClient } from '../base';
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
    const response = await this.apiClient.post<RegisterWithEmailResponse>(
      `${this.basePath}/register/email`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  async registerWithPhone(request: PlainMessage<RegisterWithPhoneRequest>): Promise<RegisterWithPhoneResponse> {
    const response = await this.apiClient.post<RegisterWithPhoneResponse>(
      `${this.basePath}/register/phone`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  // ============================================================================
  // Login Methods
  // ============================================================================

  async loginWithEmail(request: PlainMessage<LoginWithEmailRequest>): Promise<LoginWithEmailResponse> {
    const response = await this.apiClient.post<LoginWithEmailResponse>(
      `${this.basePath}/login/email`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  async requestPhoneOTP(request: PlainMessage<RequestPhoneOTPRequest>): Promise<RequestPhoneOTPResponse> {
    const response = await this.apiClient.post<RequestPhoneOTPResponse>(
      `${this.basePath}/otp/request`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  async loginWithPhone(request: PlainMessage<LoginWithPhoneRequest>): Promise<LoginWithPhoneResponse> {
    const response = await this.apiClient.post<LoginWithPhoneResponse>(
      `${this.basePath}/login/phone`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  async loginWithOAuth(request: PlainMessage<LoginWithOAuthRequest>): Promise<LoginWithOAuthResponse> {
    const response = await this.apiClient.post<LoginWithOAuthResponse>(
      `${this.basePath}/login/oauth`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  // ============================================================================
  // Token Management Methods
  // ============================================================================

  async refreshToken(request: PlainMessage<RefreshTokenRequest>): Promise<RefreshTokenResponse> {
    const response = await this.apiClient.post<RefreshTokenResponse>(
      `${this.basePath}/token/refresh`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  async revokeToken(request: PlainMessage<RevokeTokenRequest>): Promise<RevokeTokenResponse> {
    const response = await this.apiClient.post<RevokeTokenResponse>(
      `${this.basePath}/token/revoke`,
      request
    );
    return response.data;
  }

  async validateToken(request: PlainMessage<ValidateTokenRequest>): Promise<ValidateTokenResponse> {
    const response = await this.apiClient.post<ValidateTokenResponse>(
      `${this.basePath}/token/validate`,
      request
    );
    return response.data;
  }

  // ============================================================================
  // Email Verification Methods
  // ============================================================================

  async sendEmailVerification(request: PlainMessage<SendEmailVerificationRequest>): Promise<SendEmailVerificationResponse> {
    const response = await this.apiClient.post<SendEmailVerificationResponse>(
      `${this.basePath}/verification/email/send`,
      request
    );
    return response.data;
  }

  async verifyEmail(request: PlainMessage<VerifyEmailRequest>): Promise<VerifyEmailResponse> {
    const response = await this.apiClient.post<VerifyEmailResponse>(
      `${this.basePath}/verification/email/verify`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  // ============================================================================
  // Phone Verification Methods
  // ============================================================================

  async sendPhoneVerification(request: PlainMessage<SendPhoneVerificationRequest>): Promise<SendPhoneVerificationResponse> {
    const response = await this.apiClient.post<SendPhoneVerificationResponse>(
      `${this.basePath}/verification/phone/send`,
      request
    );
    return response.data;
  }

  async verifyPhone(request: PlainMessage<VerifyPhoneRequest>): Promise<VerifyPhoneResponse> {
    const response = await this.apiClient.post<VerifyPhoneResponse>(
      `${this.basePath}/verification/phone/verify`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  // ============================================================================
  // Verification Code Methods
  // ============================================================================

  async resendVerificationCode(request: PlainMessage<ResendVerificationCodeRequest>): Promise<ResendVerificationCodeResponse> {
    const response = await this.apiClient.post<ResendVerificationCodeResponse>(
      `${this.basePath}/verification/resend`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  // ============================================================================
  // Password Management Methods
  // ============================================================================

  async requestPasswordReset(request: PlainMessage<RequestPasswordResetRequest>): Promise<RequestPasswordResetResponse> {
    const response = await this.apiClient.post<RequestPasswordResetResponse>(
      `${this.basePath}/password/reset/request`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  async confirmPasswordReset(request: PlainMessage<ConfirmPasswordResetRequest>): Promise<ConfirmPasswordResetResponse> {
    const response = await this.apiClient.post<ConfirmPasswordResetResponse>(
      `${this.basePath}/password/reset/confirm`,
      request,
      { skipAuth: true }
    );
    return response.data;
  }

  async changePassword(request: PlainMessage<ChangePasswordRequest>): Promise<ChangePasswordResponse> {
    const response = await this.apiClient.post<ChangePasswordResponse>(
      `${this.basePath}/password/change`,
      request
    );
    return response.data;
  }

  // ============================================================================
  // Session Management Methods
  // ============================================================================

  async getCurrentSession(_request: PlainMessage<GetCurrentSessionRequest>): Promise<GetCurrentSessionResponse> {
    const response = await this.apiClient.get<GetCurrentSessionResponse>(
      `${this.basePath}/session/current`
    );
    return response.data;
  }

  async listSessions(request: PlainMessage<ListSessionsRequest>): Promise<ListSessionsResponse> {
    const params = request.pagination ? {
      page: request.pagination.page,
      pageSize: request.pagination.pageSize,
    } : undefined;

    const response = await this.apiClient.get<ListSessionsResponse>(
      `${this.basePath}/sessions`,
      { params }
    );
    return response.data;
  }

  async revokeSession(request: PlainMessage<RevokeSessionRequest>): Promise<RevokeSessionResponse> {
    const response = await this.apiClient.post<RevokeSessionResponse>(
      `${this.basePath}/session/revoke`,
      request
    );
    return response.data;
  }

  async revokeAllSessions(request: PlainMessage<RevokeAllSessionsRequest>): Promise<RevokeAllSessionsResponse> {
    const response = await this.apiClient.post<RevokeAllSessionsResponse>(
      `${this.basePath}/sessions/revoke-all`,
      request
    );
    return response.data;
  }

  // ============================================================================
  // Device Management Methods
  // ============================================================================

  async listDevices(request: PlainMessage<ListDevicesRequest>): Promise<ListDevicesResponse> {
    const params = request.pagination ? {
      page: request.pagination.page,
      pageSize: request.pagination.pageSize,
    } : undefined;

    const response = await this.apiClient.get<ListDevicesResponse>(
      `${this.basePath}/devices`,
      { params }
    );
    return response.data;
  }

  async trustDevice(request: PlainMessage<TrustDeviceRequest>): Promise<TrustDeviceResponse> {
    const response = await this.apiClient.post<TrustDeviceResponse>(
      `${this.basePath}/device/trust`,
      request
    );
    return response.data;
  }

  async revokeDevice(request: PlainMessage<RevokeDeviceRequest>): Promise<RevokeDeviceResponse> {
    const response = await this.apiClient.post<RevokeDeviceResponse>(
      `${this.basePath}/device/revoke`,
      request
    );
    return response.data;
  }

  // ============================================================================
  // Logout Methods
  // ============================================================================

  async logout(request: PlainMessage<LogoutRequest>): Promise<LogoutResponse> {
    const response = await this.apiClient.post<LogoutResponse>(
      `${this.basePath}/logout`,
      request
    );
    return response.data;
  }

  async logoutAll(request: PlainMessage<LogoutAllRequest>): Promise<LogoutAllResponse> {
    const response = await this.apiClient.post<LogoutAllResponse>(
      `${this.basePath}/logout/all`,
      request
    );
    return response.data;
  }
}
