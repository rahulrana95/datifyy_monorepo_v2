/**
 * Login Modal Tests
 * 100% test coverage for LoginModal component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginModal } from './LoginModal';
import { AuthService } from '../../../services/auth';
import type { TokenPair } from '../../../gen/auth/v1/messages_pb';
import { ChakraProvider } from '../../../providers/ChakraProvider';

// Mock the services
jest.mock('../../../services/auth');

// Mock the API client since AuthService creates it internally
jest.mock('../../../services/base', () => ({
  ApiClient: jest.fn().mockImplementation(() => ({})),
}));

// Wrapper for Chakra UI
const wrapper = ({ children }: { children: React.ReactNode }) => <ChakraProvider>{children}</ChakraProvider>;

describe('LoginModal', () => {
  const mockOnClose = jest.fn();
  const mockOnForgotPassword = jest.fn();
  const mockOnSignup = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onForgotPassword: mockOnForgotPassword,
    onSignup: mockOnSignup,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login modal when open', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to continue your journey')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(<LoginModal {...defaultProps} open={false} />, { wrapper });

      expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    });

    it('should render signup link', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update email input value', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input value', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should clear form when modal is closed', async () => {
      const { rerender } = render(<LoginModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');

      // Close modal by changing prop
      rerender(
        <ChakraProvider>
          <LoginModal {...defaultProps} open={false} />
        </ChakraProvider>
      );

      // Reopen modal
      rerender(
        <ChakraProvider>
          <LoginModal {...defaultProps} open={true} />
        </ChakraProvider>
      );

      const newEmailInput = screen.getByPlaceholderText(/your@email.com/i) as HTMLInputElement;
      const newPasswordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;

      // Form should be cleared after reopening
      expect(newEmailInput.value).toBe('');
      expect(newPasswordInput.value).toBe('');
    });
  });

  describe('Navigation', () => {
    it('should call onForgotPassword and close modal when forgot password link is clicked', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      const forgotPasswordLink = screen.getByText('Forgot password?');
      fireEvent.click(forgotPasswordLink);

      expect(mockOnForgotPassword).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSignup and close modal when signup link is clicked', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      const signupLink = screen.getByText('Sign up');
      fireEvent.click(signupLink);

      expect(mockOnSignup).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      const mockTokenPair: TokenPair = {
        $typeName: 'datifyy.auth.v1.TokenPair',
        accessToken: {
          $typeName: 'datifyy.auth.v1.AccessToken',
          token: 'mock-access-token',
          tokenType: 'Bearer',
          expiresAt: undefined,
        },
        refreshToken: {
          $typeName: 'datifyy.auth.v1.RefreshToken',
          token: 'mock-refresh-token',
          expiresAt: undefined,
        },
      };

      const mockLoginResponse = {
        tokens: mockTokenPair,
      };

      const mockAuthService = {
        loginWithEmail: jest.fn().mockResolvedValue(mockLoginResponse),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<LoginModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.loginWithEmail).toHaveBeenCalledWith({
          credentials: {
            $typeName: 'datifyy.auth.v1.EmailPasswordCredentials',
            email: 'test@example.com',
            password: 'password123',
            name: '',
          },
        });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        });
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      const mockAuthService = {
        loginWithEmail: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<LoginModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', async () => {
      const mockAuthService = {
        loginWithEmail: jest.fn().mockRejectedValue('String error'),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<LoginModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const mockTokenPair: TokenPair = {
        $typeName: 'datifyy.auth.v1.TokenPair',
        accessToken: {
          $typeName: 'datifyy.auth.v1.AccessToken',
          token: 'token',
          tokenType: 'Bearer',
          expiresAt: undefined,
        },
        refreshToken: {
          $typeName: 'datifyy.auth.v1.RefreshToken',
          token: 'refresh',
          expiresAt: undefined,
        },
      };

      const mockAuthService = {
        loginWithEmail: jest.fn().mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ tokens: mockTokenPair }), 100))
        ),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<LoginModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Signing in...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
      });
    });

    it('should not call onSuccess if tokens are missing', async () => {
      const mockAuthService = {
        loginWithEmail: jest.fn().mockResolvedValue({}),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<LoginModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.loginWithEmail).toHaveBeenCalled();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should clear error when resubmitting', async () => {
      const mockTokenPair: TokenPair = {
        $typeName: 'datifyy.auth.v1.TokenPair',
        accessToken: {
          $typeName: 'datifyy.auth.v1.AccessToken',
          token: 'token',
          tokenType: 'Bearer',
          expiresAt: undefined,
        },
        refreshToken: {
          $typeName: 'datifyy.auth.v1.RefreshToken',
          token: 'refresh',
          expiresAt: undefined,
        },
      };

      const mockAuthService = {
        loginWithEmail: jest
          .fn()
          .mockRejectedValueOnce(new Error('First error'))
          .mockResolvedValueOnce({
            tokens: mockTokenPair,
          }),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<LoginModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First submission - fails
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission - succeeds
      fireEvent.change(passwordInput, { target: { value: 'correct' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('should not call onSuccess if access token is missing', async () => {
      const mockAuthService = {
        loginWithEmail: jest.fn().mockResolvedValue({
          tokens: {
            $typeName: 'datifyy.auth.v1.TokenPair',
            accessToken: undefined,
            refreshToken: {
              $typeName: 'datifyy.auth.v1.RefreshToken',
              token: 'refresh-token',
              expiresAt: undefined,
            },
          },
        }),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<LoginModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.loginWithEmail).toHaveBeenCalled();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Modal Close', () => {
    it('should call onClose when close button is clicked', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      const backdrop = screen.getByRole('presentation');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      render(<LoginModal {...defaultProps} />, { wrapper });

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
