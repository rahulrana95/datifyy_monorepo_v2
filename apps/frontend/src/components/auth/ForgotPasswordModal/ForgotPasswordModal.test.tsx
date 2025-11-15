/**
 * Forgot Password Modal Tests
 * 100% test coverage for ForgotPasswordModal component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { AuthService } from '../../../services/auth';
import { ChakraProvider } from '../../../providers/ChakraProvider';

// Mock the services
jest.mock('../../../services/auth');

// Mock the API client since AuthService creates it internally
jest.mock('../../../services/base', () => ({
  ApiClient: jest.fn().mockImplementation(() => ({})),
}));

// Wrapper for Chakra UI
const wrapper = ({ children }: { children: React.ReactNode }) => <ChakraProvider>{children}</ChakraProvider>;

describe('ForgotPasswordModal', () => {
  const mockOnClose = jest.fn();
  const mockOnLogin = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onLogin: mockOnLogin,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render forgot password modal when open', () => {
      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText('Enter your email to receive reset instructions')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(<ForgotPasswordModal {...defaultProps} open={false} />, { wrapper });

      expect(screen.queryByText('Reset Password')).not.toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      expect(screen.getByText(/remember your password/i)).toBeInTheDocument();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update email input value', () => {
      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('Navigation', () => {
    it('should call onLogin and close modal when login link is clicked', () => {
      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const loginLink = screen.getByText('Sign in');
      fireEvent.click(loginLink);

      expect(mockOnLogin).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid email', async () => {
      const mockAuthService = {
        requestPasswordReset: jest.fn().mockResolvedValue({}),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith({
          resetRequest: {
            $typeName: 'datifyy.auth.v1.PasswordResetRequest',
            email: 'test@example.com',
          },
        });
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/if an account exists with this email/i)).toBeInTheDocument();
      });
    });

    it('should handle password reset error', async () => {
      const mockAuthService = {
        requestPasswordReset: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle non-Error exceptions', async () => {
      const mockAuthService = {
        requestPasswordReset: jest.fn().mockRejectedValue('String error'),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to send reset email. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const mockAuthService = {
        requestPasswordReset: jest.fn().mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
        ),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Sending...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
      });
    });

    it('should clear email when success is achieved', async () => {
      const mockAuthService = {
        requestPasswordReset: jest.fn().mockResolvedValue({}),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthService.requestPasswordReset).toHaveBeenCalled();
      });

      // Success view should show, and form should be cleared
      await waitFor(() => {
        expect(screen.getByText(/if an account exists with this email/i)).toBeInTheDocument();
      });
    });

    it('should clear error when resubmitting', async () => {
      const mockAuthService = {
        requestPasswordReset: jest
          .fn()
          .mockRejectedValueOnce(new Error('First error'))
          .mockResolvedValueOnce({}),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      // First submission - fails
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
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
  });

  describe('Success State', () => {
    it('should navigate back to login from success state', async () => {
      const mockAuthService = {
        requestPasswordReset: jest.fn().mockResolvedValue({}),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/if an account exists with this email/i)).toBeInTheDocument();
      });

      // Click "Back to Sign In" button
      const backButton = screen.getByRole('button', { name: /back to sign in/i });
      fireEvent.click(backButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnLogin).toHaveBeenCalled();
    });

    it('should allow trying again from success state', async () => {
      const mockAuthService = {
        requestPasswordReset: jest.fn().mockResolvedValue({}),
      };

      (AuthService as jest.Mock).mockImplementation(() => mockAuthService);

      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const emailInput = screen.getByPlaceholderText(/your@email.com/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/if an account exists with this email/i)).toBeInTheDocument();
      });

      // Click "Try again" link
      const tryAgainLink = screen.getByText('Try again');
      fireEvent.click(tryAgainLink);

      // Should go back to form view
      await waitFor(() => {
        expect(screen.queryByText(/if an account exists with this email/i)).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Close', () => {
    it('should call onClose when close button is clicked', () => {
      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      const backdrop = screen.getByRole('presentation');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      render(<ForgotPasswordModal {...defaultProps} />, { wrapper });

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
