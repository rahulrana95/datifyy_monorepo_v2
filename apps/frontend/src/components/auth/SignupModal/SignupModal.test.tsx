/**
 * Signup Modal Tests
 * 100% test coverage for SignupModal component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupModal } from './SignupModal';
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

describe('SignupModal', () => {
  const mockOnClose = jest.fn();
  const mockOnLogin = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onLogin: mockOnLogin,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render signup modal when open', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Join us and start your journey')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/re-enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(<SignupModal {...defaultProps} open={false} />, { wrapper });

      expect(screen.queryByText('Create Account')).not.toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update name input value', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      expect(nameInput.value).toBe('Test User');
    });

    it('should update email input value', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input value', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should update confirm password input value', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i) as HTMLInputElement;
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      expect(confirmPasswordInput.value).toBe('password123');
    });

    it('should clear form when modal is closed', () => {
      const { rerender } = render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i) as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText(/your@email.com/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i) as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      expect(nameInput.value).toBe('Test User');
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
      expect(confirmPasswordInput.value).toBe('password123');

      // Close modal
      rerender(
        <ChakraProvider>
          <SignupModal {...defaultProps} open={false} />
        </ChakraProvider>
      );
      rerender(
        <ChakraProvider>
          <SignupModal {...defaultProps} open={true} />
        </ChakraProvider>
      );

      const newNameInput = screen.getByPlaceholderText(/john doe/i) as HTMLInputElement;
      const newEmailInput = screen.getByPlaceholderText(/your@email.com/i) as HTMLInputElement;
      const newPasswordInput = screen.getByPlaceholderText(/at least 8 characters/i) as HTMLInputElement;
      const newConfirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i) as HTMLInputElement;

      // Form should be cleared after reopening
      expect(newNameInput.value).toBe('');
      expect(newEmailInput.value).toBe('');
      expect(newPasswordInput.value).toBe('');
      expect(newConfirmPasswordInput.value).toBe('');
    });
  });

  describe('Navigation', () => {
    it('should call onLogin and close modal when login link is clicked', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      const loginLink = screen.getByText('Sign in');
      fireEvent.click(loginLink);

      expect(mockOnLogin).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    it('should show error when passwords do not match', async () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should show error when password is too short', async () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
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

      const mockSignupResponse = {
        tokens: mockTokenPair,
      };

      const mockAuthService = {
        registerWithEmail: jest.fn().mockResolvedValue(mockSignupResponse),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.registerWithEmail).toHaveBeenCalledWith({
          credentials: {
            $typeName: 'datifyy.auth.v1.EmailPasswordCredentials',
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
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

    it('should handle signup error', async () => {
      const mockAuthService = {
        registerWithEmail: jest.fn().mockRejectedValue(new Error('Email already exists')),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', async () => {
      const mockAuthService = {
        registerWithEmail: jest.fn().mockRejectedValue('String error'),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Signup failed. Please try again.')).toBeInTheDocument();
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
        registerWithEmail: jest.fn().mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ tokens: mockTokenPair }), 100))
        ),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Creating account...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
      });
    });

    it('should not call onSuccess if tokens are missing', async () => {
      const mockAuthService = {
        registerWithEmail: jest.fn().mockResolvedValue({}),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.registerWithEmail).toHaveBeenCalled();
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
        registerWithEmail: jest
          .fn()
          .mockRejectedValueOnce(new Error('First error'))
          .mockResolvedValueOnce({
            tokens: mockTokenPair,
          }),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      // First submission - fails
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission - succeeds
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('should not call onSuccess if access token is missing', async () => {
      const mockAuthService = {
        registerWithEmail: jest.fn().mockResolvedValue({
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

      render(<SignupModal {...defaultProps} />, { wrapper });

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.registerWithEmail).toHaveBeenCalled();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Modal Close', () => {
    it('should call onClose when close button is clicked', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      const backdrop = screen.getByRole('presentation');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      render(<SignupModal {...defaultProps} />, { wrapper });

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
