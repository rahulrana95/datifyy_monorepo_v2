/**
 * Auth Service Tests
 * 100% test coverage for AuthService
 */

import { ApiClient } from '../base';
import { AuthService } from './authService';
import type { ApiResponse } from '../base/types';

// Mock the ApiClient
jest.mock('../base');

describe('AuthService', () => {
  let authService: AuthService;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;

    authService = new AuthService(mockApiClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Registration Methods
  // ============================================================================

  describe('Registration Methods', () => {
    describe('registerWithEmail', () => {
      it('should register user with email', async () => {
        const mockRequest = {
          credentials: {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            user: { userId: '1', email: 'test@example.com' },
            tokens: { accessToken: { token: 'access' }, refreshToken: { token: 'refresh' } },
            session: { sessionId: 'session1' },
            requiresEmailVerification: true,
          },
          status: 201,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.registerWithEmail(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/register/email',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('registerWithPhone', () => {
      it('should register user with phone', async () => {
        const mockRequest = {
          phoneNumber: '+1234567890',
          name: 'Test User',
          deviceInfo: { platform: 1, deviceName: 'iPhone' },
        };

        const mockResponse: ApiResponse = {
          data: {
            verification: { codeId: 'code1', expiresAt: {} },
            tempUserId: 'temp123',
            message: 'OTP sent',
          },
          status: 201,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.registerWithPhone(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/register/phone',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  // ============================================================================
  // Login Methods
  // ============================================================================

  describe('Login Methods', () => {
    describe('loginWithEmail', () => {
      it('should login user with email', async () => {
        const mockRequest = {
          credentials: {
            email: 'test@example.com',
            password: 'password123',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            user: { userId: '1', email: 'test@example.com' },
            tokens: { accessToken: { token: 'access' }, refreshToken: { token: 'refresh' } },
            session: { sessionId: 'session1' },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.loginWithEmail(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/login/email',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('requestPhoneOTP', () => {
      it('should request phone OTP', async () => {
        const mockRequest = {
          phoneNumber: '+1234567890',
          deviceInfo: { platform: 1, deviceName: 'iPhone' },
        };

        const mockResponse: ApiResponse = {
          data: {
            verification: { codeId: 'code1', expiresAt: {} },
            message: 'OTP sent',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.requestPhoneOTP(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/otp/request',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('loginWithPhone', () => {
      it('should login user with phone', async () => {
        const mockRequest = {
          credentials: {
            phoneNumber: '+1234567890',
            code: '123456',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            user: { userId: '1', phoneNumber: '+1234567890' },
            tokens: { accessToken: { token: 'access' }, refreshToken: { token: 'refresh' } },
            session: { sessionId: 'session1' },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.loginWithPhone(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/login/phone',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('loginWithOAuth', () => {
      it('should login user with OAuth', async () => {
        const mockRequest = {
          credentials: {
            provider: 'google',
            accessToken: 'oauth-token',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            user: { userId: '1', email: 'test@example.com' },
            tokens: { accessToken: { token: 'access' }, refreshToken: { token: 'refresh' } },
            session: { sessionId: 'session1' },
            isNewUser: false,
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.loginWithOAuth(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/login/oauth',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  // ============================================================================
  // Token Management Methods
  // ============================================================================

  describe('Token Management Methods', () => {
    describe('refreshToken', () => {
      it('should refresh access token', async () => {
        const mockRequest = {
          refreshToken: 'refresh-token',
          deviceInfo: { platform: 1, deviceName: 'iPhone' },
        };

        const mockResponse: ApiResponse = {
          data: {
            tokens: { accessToken: { token: 'new-access' }, refreshToken: { token: 'new-refresh' } },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.refreshToken(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/token/refresh',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('revokeToken', () => {
      it('should revoke refresh token', async () => {
        const mockRequest = {
          refreshToken: 'refresh-token',
        };

        const mockResponse: ApiResponse = {
          data: {
            message: 'Token revoked successfully',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.revokeToken(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/token/revoke',
          mockRequest
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('validateToken', () => {
      it('should validate access token', async () => {
        const mockRequest = {
          accessToken: 'access-token',
        };

        const mockResponse: ApiResponse = {
          data: {
            valid: true,
            userId: '1',
            sessionId: 'session1',
            expiresAt: {},
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.validateToken(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/token/validate',
          mockRequest
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  // ============================================================================
  // Email Verification Methods
  // ============================================================================

  describe('Email Verification Methods', () => {
    describe('sendEmailVerification', () => {
      it('should send email verification', async () => {
        const mockRequest = {
          email: 'test@example.com',
        };

        const mockResponse: ApiResponse = {
          data: {
            verification: { codeId: 'code1', expiresAt: {} },
            message: 'Verification email sent',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.sendEmailVerification(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/verification/email/send',
          mockRequest
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('verifyEmail', () => {
      it('should verify email with code', async () => {
        const mockRequest = {
          verification: {
            identifier: 'test@example.com',
            code: '123456',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            success: true,
            message: 'Email verified successfully',
            user: { userId: '1', emailVerified: true },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.verifyEmail(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/verification/email/verify',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  // ============================================================================
  // Phone Verification Methods
  // ============================================================================

  describe('Phone Verification Methods', () => {
    describe('sendPhoneVerification', () => {
      it('should send phone verification', async () => {
        const mockRequest = {
          phoneNumber: '+1234567890',
        };

        const mockResponse: ApiResponse = {
          data: {
            verification: { codeId: 'code1', expiresAt: {} },
            message: 'Verification SMS sent',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.sendPhoneVerification(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/verification/phone/send',
          mockRequest
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('verifyPhone', () => {
      it('should verify phone with code', async () => {
        const mockRequest = {
          verification: {
            identifier: '+1234567890',
            code: '123456',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            success: true,
            message: 'Phone verified successfully',
            user: { userId: '1', phoneVerified: true },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.verifyPhone(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/verification/phone/verify',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  // ============================================================================
  // Verification Code Methods
  // ============================================================================

  describe('Verification Code Methods', () => {
    describe('resendVerificationCode', () => {
      it('should resend verification code', async () => {
        const mockRequest = {
          identifier: 'test@example.com',
          type: 1, // EMAIL
        };

        const mockResponse: ApiResponse = {
          data: {
            verification: { codeId: 'code2', expiresAt: {} },
            message: 'Verification code resent',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.resendVerificationCode(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/verification/resend',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  // ============================================================================
  // Password Management Methods
  // ============================================================================

  describe('Password Management Methods', () => {
    describe('requestPasswordReset', () => {
      it('should request password reset', async () => {
        const mockRequest = {
          resetRequest: {
            email: 'test@example.com',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            message: 'Password reset email sent',
            expiresAt: {},
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.requestPasswordReset(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/password/reset/request',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('confirmPasswordReset', () => {
      it('should confirm password reset', async () => {
        const mockRequest = {
          confirmation: {
            token: 'reset-token',
            newPassword: 'newpassword123',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            success: true,
            message: 'Password reset successful',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.confirmPasswordReset(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/password/reset/confirm',
          mockRequest,
          { skipAuth: true }
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('changePassword', () => {
      it('should change password', async () => {
        const mockRequest = {
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
          revokeOtherSessions: true,
        };

        const mockResponse: ApiResponse = {
          data: {
            success: true,
            message: 'Password changed successfully',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.changePassword(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/password/change',
          mockRequest
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  // ============================================================================
  // Session Management Methods
  // ============================================================================

  describe('Session Management Methods', () => {
    describe('getCurrentSession', () => {
      it('should get current session', async () => {
        const mockRequest = {};

        const mockResponse: ApiResponse = {
          data: {
            session: {
              sessionId: 'session1',
              userId: '1',
              deviceInfo: {},
              createdAt: {},
              lastActiveAt: {},
            },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await authService.getCurrentSession(mockRequest);

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/auth/session/current');
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('listSessions', () => {
      it('should list sessions without pagination', async () => {
        const mockRequest = {};

        const mockResponse: ApiResponse = {
          data: {
            sessions: [{ sessionId: 'session1' }, { sessionId: 'session2' }],
            pagination: { totalCount: 2 },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await authService.listSessions(mockRequest);

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/auth/sessions', {
          params: undefined,
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('should list sessions with pagination', async () => {
        const mockRequest = {
          pagination: {
            page: 1,
            pageSize: 10,
            cursor: '',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            sessions: [{ sessionId: 'session1' }],
            pagination: { totalCount: 1 },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await authService.listSessions(mockRequest);

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/auth/sessions', {
          params: { page: 1, pageSize: 10 },
        });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('revokeSession', () => {
      it('should revoke specific session', async () => {
        const mockRequest = {
          sessionId: 'session1',
        };

        const mockResponse: ApiResponse = {
          data: {
            message: 'Session revoked successfully',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.revokeSession(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/session/revoke',
          mockRequest
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('revokeAllSessions', () => {
      it('should revoke all sessions', async () => {
        const mockRequest = {};

        const mockResponse: ApiResponse = {
          data: {
            revokedCount: 5,
            message: 'All sessions revoked successfully',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.revokeAllSessions(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/sessions/revoke-all',
          mockRequest
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  // ============================================================================
  // Device Management Methods
  // ============================================================================

  describe('Device Management Methods', () => {
    describe('listDevices', () => {
      it('should list devices without pagination', async () => {
        const mockRequest = {};

        const mockResponse: ApiResponse = {
          data: {
            devices: { items: [{ deviceId: 'device1' }, { deviceId: 'device2' }] },
            pagination: { totalCount: 2 },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await authService.listDevices(mockRequest);

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/auth/devices', {
          params: undefined,
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('should list devices with pagination', async () => {
        const mockRequest = {
          pagination: {
            page: 1,
            pageSize: 10,
            cursor: '',
          },
        };

        const mockResponse: ApiResponse = {
          data: {
            devices: { items: [{ deviceId: 'device1' }] },
            pagination: { totalCount: 1 },
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await authService.listDevices(mockRequest);

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/auth/devices', {
          params: { page: 1, pageSize: 10 },
        });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('trustDevice', () => {
      it('should trust a device', async () => {
        const mockRequest = {
          deviceId: 'device1',
        };

        const mockResponse: ApiResponse = {
          data: {
            success: true,
            message: 'Device trusted successfully',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.trustDevice(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/device/trust',
          mockRequest
        );
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('revokeDevice', () => {
      it('should revoke a device', async () => {
        const mockRequest = {
          deviceId: 'device1',
        };

        const mockResponse: ApiResponse = {
          data: {
            sessionsRevoked: 2,
            message: 'Device revoked successfully',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.revokeDevice(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/auth/device/revoke',
          mockRequest
        );
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  // ============================================================================
  // Logout Methods
  // ============================================================================

  describe('Logout Methods', () => {
    describe('logout', () => {
      it('should logout current session', async () => {
        const mockRequest = {};

        const mockResponse: ApiResponse = {
          data: {
            message: 'Logged out successfully',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.logout(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/logout', mockRequest);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('logoutAll', () => {
      it('should logout from all sessions', async () => {
        const mockRequest = {};

        const mockResponse: ApiResponse = {
          data: {
            sessionsLoggedOut: 3,
            message: 'Logged out from all sessions successfully',
          },
          status: 200,
          headers: new Headers(),
        };

        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await authService.logoutAll(mockRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/logout/all', mockRequest);
        expect(result).toEqual(mockResponse.data);
      });
    });
  });
});
