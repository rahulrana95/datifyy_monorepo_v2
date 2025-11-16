/**
 * Auth REST Adapter Tests
 * Comprehensive test coverage for all transformation functions
 */

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

describe('authRestAdapter', () => {
  // ============================================================================
  // Registration Transformations
  // ============================================================================

  describe('transformRegisterRequest', () => {
    it('should transform email registration request with all fields', () => {
      const request = {
        credentials: {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
          deviceInfo: {
            platform: 1,
            deviceName: 'Chrome on Mac',
            osVersion: 'macOS 14.0',
            deviceId: 'device_123',
            appVersion: '1.0.0',
            browser: 'Chrome 120',
          },
        },
      };

      const result = transformRegisterRequest(request);

      expect(result).toEqual({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        device_info: {
          platform: 1,
          device_name: 'Chrome on Mac',
          os_version: 'macOS 14.0',
          device_id: 'device_123',
          app_version: '1.0.0',
          browser: 'Chrome 120',
        },
      });
    });

    it('should use default values for missing device info', () => {
      const request = {
        credentials: {
          email: 'test@example.com',
          password: 'SecurePass123!',
          deviceInfo: {
            platform: 0,
          },
        },
      };

      const result = transformRegisterRequest(request);

      expect(result.device_info).toEqual({
        platform: 1, // Default to WEB
        device_name: 'Unknown Device',
        os_version: '',
        device_id: '',
        app_version: '',
        browser: '',
      });
    });

    it('should handle missing device info', () => {
      const request = {
        credentials: {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Test User',
        },
      };

      const result = transformRegisterRequest(request);

      expect(result.device_info).toBeUndefined();
    });

    it('should handle empty name', () => {
      const request = {
        credentials: {
          email: 'test@example.com',
          password: 'SecurePass123!',
        },
      };

      const result = transformRegisterRequest(request);

      expect(result.name).toBe('');
    });

    it('should throw error if credentials are missing', () => {
      const request = {};

      expect(() => transformRegisterRequest(request)).toThrow('Credentials are required');
    });
  });

  describe('transformRegisterWithPhoneRequest', () => {
    it('should transform phone registration request', () => {
      const request = {
        credentials: {
          phoneNumber: '+1234567890',
          password: 'SecurePass123!',
          name: 'Test User',
          deviceInfo: {
            platform: 2,
            deviceName: 'iPhone 15',
            osVersion: 'iOS 17',
            deviceId: 'iphone_123',
          },
        },
      };

      const result = transformRegisterWithPhoneRequest(request);

      expect(result).toEqual({
        phone_number: '+1234567890',
        password: 'SecurePass123!',
        name: 'Test User',
        device_info: {
          platform: 2,
          device_name: 'iPhone 15',
          os_version: 'iOS 17',
          device_id: 'iphone_123',
          app_version: '',
          browser: '',
        },
      });
    });

    it('should throw error if credentials are missing', () => {
      const request = {};

      expect(() => transformRegisterWithPhoneRequest(request)).toThrow('Credentials are required');
    });
  });

  // ============================================================================
  // Login Transformations
  // ============================================================================

  describe('transformLoginRequest', () => {
    it('should transform login request with device info', () => {
      const request = {
        credentials: {
          email: 'test@example.com',
          password: 'SecurePass123!',
          deviceInfo: {
            platform: 1,
            deviceName: 'Chrome on Mac',
            osVersion: 'macOS 14.0',
            deviceId: 'device_123',
          },
        },
      };

      const result = transformLoginRequest(request);

      expect(result).toEqual({
        email: 'test@example.com',
        password: 'SecurePass123!',
        device_info: {
          platform: 1,
          device_name: 'Chrome on Mac',
          os_version: 'macOS 14.0',
          device_id: 'device_123',
          app_version: '',
          browser: '',
        },
      });
    });

    it('should throw error if credentials are missing', () => {
      const request = {};

      expect(() => transformLoginRequest(request)).toThrow('Credentials are required');
    });
  });

  describe('transformRequestPhoneOTPRequest', () => {
    it('should transform phone OTP request', () => {
      const request = {
        phoneNumber: '+1234567890',
      };

      const result = transformRequestPhoneOTPRequest(request);

      expect(result).toEqual({
        phone_number: '+1234567890',
      });
    });
  });

  describe('transformLoginWithPhoneRequest', () => {
    it('should transform phone login request', () => {
      const request = {
        phoneNumber: '+1234567890',
        otpCode: '123456',
        deviceInfo: {
          platform: 2,
          deviceName: 'iPhone 15',
        },
      };

      const result = transformLoginWithPhoneRequest(request);

      expect(result).toEqual({
        phone_number: '+1234567890',
        otp_code: '123456',
        device_info: {
          platform: 2,
          device_name: 'iPhone 15',
          os_version: '',
          device_id: '',
          app_version: '',
          browser: '',
        },
      });
    });
  });

  describe('transformLoginWithOAuthRequest', () => {
    it('should transform OAuth login request', () => {
      const request = {
        provider: 'google',
        accessToken: 'access_token_123',
        idToken: 'id_token_123',
        deviceInfo: {
          platform: 1,
          deviceName: 'Chrome',
        },
      };

      const result = transformLoginWithOAuthRequest(request);

      expect(result).toEqual({
        provider: 'google',
        access_token: 'access_token_123',
        id_token: 'id_token_123',
        device_info: {
          platform: 1,
          device_name: 'Chrome',
          os_version: '',
          device_id: '',
          app_version: '',
          browser: '',
        },
      });
    });
  });

  // ============================================================================
  // Token Management Transformations
  // ============================================================================

  describe('transformRefreshTokenRequest', () => {
    it('should transform refresh token request', () => {
      const request = {
        refreshToken: 'refresh_token_123',
        deviceInfo: {
          platform: 1,
          deviceName: 'Chrome',
        },
      };

      const result = transformRefreshTokenRequest(request);

      expect(result).toEqual({
        refresh_token: 'refresh_token_123',
        device_info: {
          platform: 1,
          device_name: 'Chrome',
          os_version: '',
          device_id: '',
          app_version: '',
          browser: '',
        },
      });
    });
  });

  describe('transformRevokeTokenRequest', () => {
    it('should transform revoke token request', () => {
      const request = {
        refreshToken: 'refresh_token_123',
      };

      const result = transformRevokeTokenRequest(request);

      expect(result).toEqual({
        refresh_token: 'refresh_token_123',
      });
    });
  });

  describe('transformValidateTokenRequest', () => {
    it('should transform validate token request', () => {
      const request = {
        accessToken: 'access_token_123',
      };

      const result = transformValidateTokenRequest(request);

      expect(result).toEqual({
        access_token: 'access_token_123',
      });
    });
  });

  // ============================================================================
  // Email Verification Transformations
  // ============================================================================

  describe('transformSendEmailVerificationRequest', () => {
    it('should transform send email verification request', () => {
      const request = {
        email: 'test@example.com',
      };

      const result = transformSendEmailVerificationRequest(request);

      expect(result).toEqual({
        email: 'test@example.com',
      });
    });
  });

  describe('transformVerifyEmailRequest', () => {
    it('should transform verify email request with verificationCode', () => {
      const request = {
        email: 'test@example.com',
        verificationCode: '123456',
      };

      const result = transformVerifyEmailRequest(request);

      expect(result).toEqual({
        email: 'test@example.com',
        verification_code: '123456',
      });
    });

    it('should use code as fallback for verificationCode', () => {
      const request = {
        email: 'test@example.com',
        code: '654321',
      };

      const result = transformVerifyEmailRequest(request);

      expect(result).toEqual({
        email: 'test@example.com',
        verification_code: '654321',
      });
    });
  });

  // ============================================================================
  // Phone Verification Transformations
  // ============================================================================

  describe('transformSendPhoneVerificationRequest', () => {
    it('should transform send phone verification request', () => {
      const request = {
        phoneNumber: '+1234567890',
      };

      const result = transformSendPhoneVerificationRequest(request);

      expect(result).toEqual({
        phone_number: '+1234567890',
      });
    });
  });

  describe('transformVerifyPhoneRequest', () => {
    it('should transform verify phone request with otpCode', () => {
      const request = {
        phoneNumber: '+1234567890',
        otpCode: '123456',
      };

      const result = transformVerifyPhoneRequest(request);

      expect(result).toEqual({
        phone_number: '+1234567890',
        otp_code: '123456',
      });
    });

    it('should use code as fallback for otpCode', () => {
      const request = {
        phoneNumber: '+1234567890',
        code: '654321',
      };

      const result = transformVerifyPhoneRequest(request);

      expect(result).toEqual({
        phone_number: '+1234567890',
        otp_code: '654321',
      });
    });
  });

  describe('transformResendVerificationCodeRequest', () => {
    it('should transform resend verification code request', () => {
      const request = {
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        verificationType: 'email',
      };

      const result = transformResendVerificationCodeRequest(request);

      expect(result).toEqual({
        email: 'test@example.com',
        phone_number: '+1234567890',
        verification_type: 'email',
      });
    });
  });

  // ============================================================================
  // Password Management Transformations
  // ============================================================================

  describe('transformRequestPasswordResetRequest', () => {
    it('should transform request password reset request', () => {
      const request = {
        email: 'test@example.com',
      };

      const result = transformRequestPasswordResetRequest(request);

      expect(result).toEqual({
        email: 'test@example.com',
      });
    });
  });

  describe('transformConfirmPasswordResetRequest', () => {
    it('should transform confirm password reset request with resetToken', () => {
      const request = {
        email: 'test@example.com',
        resetToken: 'reset_token_123',
        newPassword: 'NewPass123!',
      };

      const result = transformConfirmPasswordResetRequest(request);

      expect(result).toEqual({
        email: 'test@example.com',
        reset_token: 'reset_token_123',
        new_password: 'NewPass123!',
      });
    });

    it('should use token as fallback for resetToken', () => {
      const request = {
        email: 'test@example.com',
        token: 'token_123',
        newPassword: 'NewPass123!',
      };

      const result = transformConfirmPasswordResetRequest(request);

      expect(result).toEqual({
        email: 'test@example.com',
        reset_token: 'token_123',
        new_password: 'NewPass123!',
      });
    });
  });

  describe('transformChangePasswordRequest', () => {
    it('should transform change password request', () => {
      const request = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      };

      const result = transformChangePasswordRequest(request);

      expect(result).toEqual({
        current_password: 'OldPass123!',
        new_password: 'NewPass123!',
      });
    });
  });

  // ============================================================================
  // Session Management Transformations
  // ============================================================================

  describe('transformRevokeSessionRequest', () => {
    it('should transform revoke session request', () => {
      const request = {
        sessionId: 'session_123',
      };

      const result = transformRevokeSessionRequest(request);

      expect(result).toEqual({
        session_id: 'session_123',
      });
    });
  });

  describe('transformRevokeAllSessionsRequest', () => {
    it('should transform revoke all sessions request', () => {
      const request = {
        excludeCurrent: true,
      };

      const result = transformRevokeAllSessionsRequest(request);

      expect(result).toEqual({
        exclude_current: true,
      });
    });
  });

  // ============================================================================
  // Device Management Transformations
  // ============================================================================

  describe('transformTrustDeviceRequest', () => {
    it('should transform trust device request', () => {
      const request = {
        deviceId: 'device_123',
      };

      const result = transformTrustDeviceRequest(request);

      expect(result).toEqual({
        device_id: 'device_123',
      });
    });
  });

  describe('transformRevokeDeviceRequest', () => {
    it('should transform revoke device request', () => {
      const request = {
        deviceId: 'device_123',
      };

      const result = transformRevokeDeviceRequest(request);

      expect(result).toEqual({
        device_id: 'device_123',
      });
    });
  });

  // ============================================================================
  // Logout Transformations
  // ============================================================================

  describe('transformLogoutRequest', () => {
    it('should transform logout request', () => {
      const request = {
        refreshToken: 'refresh_token_123',
      };

      const result = transformLogoutRequest(request);

      expect(result).toEqual({
        refresh_token: 'refresh_token_123',
      });
    });
  });

  describe('transformLogoutAllRequest', () => {
    it('should transform logout all request', () => {
      const request = {
        refreshToken: 'refresh_token_123',
      };

      const result = transformLogoutAllRequest(request);

      expect(result).toEqual({
        refresh_token: 'refresh_token_123',
      });
    });
  });

  // ============================================================================
  // Response Transformations
  // ============================================================================

  describe('transformAuthResponse', () => {
    it('should transform complete auth response', () => {
      const restResponse = {
        user: {
          user_id: '123',
          email: 'test@example.com',
          name: 'Test User',
          phone_number: '+1234567890',
          photo_url: 'https://example.com/photo.jpg',
          account_status: 'ACTIVE',
          email_verified: 'VERIFIED',
          phone_verified: 'VERIFIED',
          created_at: { seconds: 1700000000, nanos: 0 },
          last_login_at: { seconds: 1700000000, nanos: 0 },
        },
        tokens: {
          access_token: {
            token: 'access_token_123',
            expires_at: { seconds: 1700003600, nanos: 0 },
            token_type: 'Bearer',
          },
          refresh_token: {
            token: 'refresh_token_123',
            expires_at: { seconds: 1702592000, nanos: 0 },
          },
        },
        session: {
          session_id: 'session_123',
          user_id: '123',
          device_info: { platform: 1, device_name: 'Chrome' },
          created_at: { seconds: 1700000000, nanos: 0 },
          last_active_at: { seconds: 1700000000, nanos: 0 },
          expires_at: { seconds: 1700003600, nanos: 0 },
          ip_address: '192.168.1.1',
          location: 'San Francisco, CA',
          is_current: true,
        },
        requires_email_verification: true,
      };

      const result = transformAuthResponse(restResponse);

      expect(result).toEqual({
        user: {
          userId: '123',
          email: 'test@example.com',
          name: 'Test User',
          phoneNumber: '+1234567890',
          photoUrl: 'https://example.com/photo.jpg',
          accountStatus: 'ACTIVE',
          emailVerified: 'VERIFIED',
          phoneVerified: 'VERIFIED',
          createdAt: { seconds: 1700000000, nanos: 0 },
          lastLoginAt: { seconds: 1700000000, nanos: 0 },
        },
        tokens: {
          accessToken: {
            token: 'access_token_123',
            expiresAt: { seconds: 1700003600, nanos: 0 },
            tokenType: 'Bearer',
          },
          refreshToken: {
            token: 'refresh_token_123',
            expiresAt: { seconds: 1702592000, nanos: 0 },
          },
        },
        session: {
          sessionId: 'session_123',
          userId: '123',
          deviceInfo: { platform: 1, device_name: 'Chrome' },
          createdAt: { seconds: 1700000000, nanos: 0 },
          lastActiveAt: { seconds: 1700000000, nanos: 0 },
          expiresAt: { seconds: 1700003600, nanos: 0 },
          ipAddress: '192.168.1.1',
          location: 'San Francisco, CA',
          isCurrent: true,
        },
        requiresEmailVerification: true,
      });
    });

    it('should handle missing user', () => {
      const restResponse = {
        tokens: {
          access_token: { token: 'token_123' },
          refresh_token: { token: 'refresh_123' },
        },
      };

      const result = transformAuthResponse(restResponse);

      expect(result.user).toBeUndefined();
    });

    it('should handle missing tokens', () => {
      const restResponse = {
        user: {
          user_id: '123',
          email: 'test@example.com',
        },
      };

      const result = transformAuthResponse(restResponse);

      expect(result.tokens).toBeUndefined();
    });

    it('should handle missing session', () => {
      const restResponse = {
        user: {
          user_id: '123',
          email: 'test@example.com',
        },
      };

      const result = transformAuthResponse(restResponse);

      expect(result.session).toBeUndefined();
    });

    it('should default token type to Bearer', () => {
      const restResponse = {
        tokens: {
          access_token: {
            token: 'token_123',
          },
          refresh_token: {
            token: 'refresh_123',
          },
        },
      };

      const result = transformAuthResponse(restResponse);

      expect(result.tokens?.accessToken.tokenType).toBe('Bearer');
    });
  });

  describe('transformVerificationResponse', () => {
    it('should transform verification response', () => {
      const restResponse = {
        success: true,
        message: 'Verification successful',
        verified: true,
        expires_at: { seconds: 1700003600, nanos: 0 },
      };

      const result = transformVerificationResponse(restResponse);

      expect(result).toEqual({
        success: true,
        message: 'Verification successful',
        verified: true,
        expiresAt: { seconds: 1700003600, nanos: 0 },
      });
    });
  });

  describe('transformSessionListResponse', () => {
    it('should transform session list with pagination', () => {
      const restResponse = {
        sessions: [
          {
            session_id: 'session_1',
            user_id: '123',
            device_info: { platform: 1 },
            created_at: { seconds: 1700000000, nanos: 0 },
            last_active_at: { seconds: 1700000000, nanos: 0 },
            expires_at: { seconds: 1700003600, nanos: 0 },
            ip_address: '192.168.1.1',
            location: 'SF',
            is_current: true,
          },
          {
            session_id: 'session_2',
            user_id: '123',
            device_info: { platform: 2 },
            created_at: { seconds: 1699000000, nanos: 0 },
            last_active_at: { seconds: 1699000000, nanos: 0 },
            expires_at: { seconds: 1699003600, nanos: 0 },
            ip_address: '192.168.1.2',
            location: 'NYC',
            is_current: false,
          },
        ],
        pagination: {
          page: 1,
          page_size: 10,
          total_pages: 2,
          total_items: 15,
        },
      };

      const result = transformSessionListResponse(restResponse);

      expect(result.sessions).toHaveLength(2);
      expect(result.sessions[0]).toEqual({
        sessionId: 'session_1',
        userId: '123',
        deviceInfo: { platform: 1 },
        createdAt: { seconds: 1700000000, nanos: 0 },
        lastActiveAt: { seconds: 1700000000, nanos: 0 },
        expiresAt: { seconds: 1700003600, nanos: 0 },
        ipAddress: '192.168.1.1',
        location: 'SF',
        isCurrent: true,
      });
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        totalPages: 2,
        totalItems: 15,
      });
    });

    it('should handle missing sessions', () => {
      const restResponse = {};

      const result = transformSessionListResponse(restResponse);

      expect(result.sessions).toEqual([]);
    });

    it('should handle missing pagination', () => {
      const restResponse = {
        sessions: [],
      };

      const result = transformSessionListResponse(restResponse);

      expect(result.pagination).toBeUndefined();
    });
  });

  describe('transformDeviceListResponse', () => {
    it('should transform device list with pagination', () => {
      const restResponse = {
        devices: [
          {
            device_id: 'device_1',
            user_id: '123',
            device_name: 'Chrome on Mac',
            platform: 1,
            os_version: 'macOS 14.0',
            app_version: '1.0.0',
            browser: 'Chrome 120',
            is_trusted: true,
            last_used_at: { seconds: 1700000000, nanos: 0 },
            created_at: { seconds: 1699000000, nanos: 0 },
          },
          {
            device_id: 'device_2',
            user_id: '123',
            device_name: 'iPhone 15',
            platform: 2,
            os_version: 'iOS 17',
            app_version: '1.0.0',
            browser: '',
            is_trusted: false,
            last_used_at: { seconds: 1700000000, nanos: 0 },
            created_at: { seconds: 1699000000, nanos: 0 },
          },
        ],
        pagination: {
          page: 1,
          page_size: 10,
          total_pages: 1,
          total_items: 2,
        },
      };

      const result = transformDeviceListResponse(restResponse);

      expect(result.devices).toHaveLength(2);
      expect(result.devices[0]).toEqual({
        deviceId: 'device_1',
        userId: '123',
        deviceName: 'Chrome on Mac',
        platform: 1,
        osVersion: 'macOS 14.0',
        appVersion: '1.0.0',
        browser: 'Chrome 120',
        isTrusted: true,
        lastUsedAt: { seconds: 1700000000, nanos: 0 },
        createdAt: { seconds: 1699000000, nanos: 0 },
      });
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 2,
      });
    });

    it('should handle missing devices', () => {
      const restResponse = {};

      const result = transformDeviceListResponse(restResponse);

      expect(result.devices).toEqual([]);
    });

    it('should handle missing pagination', () => {
      const restResponse = {
        devices: [],
      };

      const result = transformDeviceListResponse(restResponse);

      expect(result.pagination).toBeUndefined();
    });
  });

  describe('transformSuccessResponse', () => {
    it('should transform success response', () => {
      const restResponse = {
        success: true,
        message: 'Operation completed successfully',
      };

      const result = transformSuccessResponse(restResponse);

      expect(result).toEqual({
        success: true,
        message: 'Operation completed successfully',
      });
    });

    it('should default success to true if not false', () => {
      const restResponse = {
        message: 'Done',
      };

      const result = transformSuccessResponse(restResponse);

      expect(result.success).toBe(true);
    });

    it('should use default message if missing', () => {
      const restResponse = {
        success: true,
      };

      const result = transformSuccessResponse(restResponse);

      expect(result.message).toBe('Operation successful');
    });

    it('should handle success: false', () => {
      const restResponse = {
        success: false,
        message: 'Operation failed',
      };

      const result = transformSuccessResponse(restResponse);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Operation failed');
    });
  });
});
