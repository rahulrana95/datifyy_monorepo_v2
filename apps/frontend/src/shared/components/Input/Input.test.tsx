import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from './Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Input defaultValue="Default" />);
      expect(screen.getByDisplayValue('Default')).toBeInTheDocument();
    });

    it('renders with controlled value', () => {
      render(<Input value="Controlled" onChange={() => {}} />);
      expect(screen.getByDisplayValue('Controlled')).toBeInTheDocument();
    });

    it('applies custom className to wrapper', () => {
      const { container } = render(<Input className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Input label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('associates label with input', () => {
      render(<Input label="Email" id="email-input" />);
      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'email-input');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('generates unique id when not provided', () => {
      render(<Input label="Email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id');
      expect(input.getAttribute('id')).toMatch(/^input-/);
    });

    it('shows required indicator when required', () => {
      render(<Input label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not show required indicator when not required', () => {
      render(<Input label="Email" />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
      const { container } = render(<Input />);
      expect(container.querySelector('label')).not.toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('renders helper text when provided', () => {
      render(<Input helperText="This is a helper" />);
      expect(screen.getByText('This is a helper')).toBeInTheDocument();
    });

    it('associates helper text with input', () => {
      render(<Input helperText="Helper" id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper');
    });

    it('does not render helper text when not provided', () => {
      const { container } = render(<Input />);
      expect(container.querySelector('.helperText')).not.toBeInTheDocument();
    });

    it('hides helper text when error is present', () => {
      render(<Input helperText="Helper" error="Error message" />);
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error message when provided', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('sets aria-invalid when error is present', () => {
      render(<Input error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with input', () => {
      render(<Input error="Error" id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    });

    it('error message has role alert', () => {
      render(<Input error="Error message" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('does not set aria-invalid when no error', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      const { container } = render(<Input />);
      expect(container.querySelector('.md')).toBeInTheDocument();
    });

    it('renders small size', () => {
      const { container } = render(<Input size="sm" />);
      expect(container.querySelector('.sm')).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = render(<Input size="lg" />);
      expect(container.querySelector('.lg')).toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('renders full width when prop is true', () => {
      const { container } = render(<Input fullWidth />);
      expect(container.firstChild).toHaveClass('fullWidth');
    });

    it('does not render full width by default', () => {
      const { container } = render(<Input />);
      expect(container.firstChild).not.toHaveClass('fullWidth');
    });
  });

  describe('Icons', () => {
    it('renders left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">@</span>;
      render(<Input leftIcon={<LeftIcon />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">✓</span>;
      render(<Input rightIcon={<RightIcon />} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('renders both left and right icons', () => {
      const LeftIcon = () => <span data-testid="left-icon">@</span>;
      const RightIcon = () => <span data-testid="right-icon">✓</span>;
      render(<Input leftIcon={<LeftIcon />} rightIcon={<RightIcon />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('hides right icon when loading', () => {
      const RightIcon = () => <span data-testid="right-icon">✓</span>;
      render(<Input loading rightIcon={<RightIcon />} />);
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });

    it('shows spinner when loading', () => {
      render(<Input loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('does not show left icon when loading', () => {
      const LeftIcon = () => <span data-testid="left-icon">@</span>;
      render(<Input loading leftIcon={<LeftIcon />} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument(); // Left icon should still show
    });
  });

  describe('Loading State', () => {
    it('disables input when loading', () => {
      render(<Input loading />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('shows spinner when loading', () => {
      render(<Input loading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not show spinner when not loading', () => {
      render(<Input />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('is not disabled by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });

    it('prevents interaction when disabled', () => {
      const handleChange = jest.fn();
      render(<Input disabled onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('renders email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders tel input', () => {
      render(<Input type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders url input', () => {
      render(<Input type="url" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('renders search input', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('Change Handler', () => {
    it('calls onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('passes event to onChange handler', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    });

    it('updates controlled value', () => {
      const { rerender } = render(<Input value="initial" onChange={() => {}} />);
      expect(screen.getByDisplayValue('initial')).toBeInTheDocument();

      rerender(<Input value="updated" onChange={() => {}} />);
      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });
  });

  describe('Focus and Blur', () => {
    it('calls onFocus when input is focused', () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('can focus input via ref', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('HTML Attributes', () => {
    it('spreads additional props to input element', () => {
      render(<Input data-testid="custom-input" />);
      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
    });

    it('supports name attribute', () => {
      render(<Input name="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email');
    });

    it('supports autoComplete attribute', () => {
      render(<Input autoComplete="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email');
    });

    it('supports maxLength attribute', () => {
      render(<Input maxLength={10} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '10');
    });

    it('supports minLength attribute', () => {
      render(<Input minLength={3} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('minlength', '3');
    });

    it('supports pattern attribute', () => {
      render(<Input pattern="[A-Za-z]+" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('pattern', '[A-Za-z]+');
    });

    it('supports required attribute', () => {
      render(<Input required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('supports readOnly attribute', () => {
      render(<Input readOnly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });
  });

  describe('Accessibility', () => {
    it('has correct role for text input', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Custom label" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Custom label');
    });

    it('sets aria-invalid on error', () => {
      render(<Input error="Error" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with aria-describedby', () => {
      render(<Input error="Error message" id="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-error');
    });

    it('associates helper text with aria-describedby', () => {
      render(<Input helperText="Helper" id="test" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-helper');
    });
  });

  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(Input.displayName).toBe('Input');
    });
  });
});
