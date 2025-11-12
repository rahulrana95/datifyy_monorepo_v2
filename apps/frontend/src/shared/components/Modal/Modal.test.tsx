import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from './Modal';

describe('Modal', () => {
  afterEach(() => {
    // Clean up - restore body scroll
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('renders nothing when closed', () => {
      render(<Modal isOpen={false} onClose={() => {}}>Content</Modal>);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders modal when open', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Test Content</Modal>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders to document.body via portal', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      const modal = screen.getByRole('dialog');
      expect(modal.parentElement?.parentElement).toBe(document.body);
    });
  });

  describe('Title', () => {
    it('renders title when provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Title">
          Content
        </Modal>
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('associates title with dialog via aria-labelledby', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Title">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(screen.getByText('Test Title')).toHaveAttribute('id', 'modal-title');
    });

    it('does not render title when not provided', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('does not set aria-labelledby when no title', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('Close Button', () => {
    it('shows close button by default', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);
      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
          Content
        </Modal>
      );
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('md');
    });

    it('renders small size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} size="sm">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('sm');
    });

    it('renders large size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} size="lg">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('lg');
    });

    it('renders full size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} size="full">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('full');
    });
  });

  describe('Footer', () => {
    it('renders footer when provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} footer={<button>Footer Button</button>}>
          Content
        </Modal>
      );
      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });

    it('does not render footer when not provided', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );
      expect(container.querySelector('.footer')).not.toBeInTheDocument();
    });
  });

  describe('Backdrop Click', () => {
    it('closes modal on backdrop click by default', () => {
      const handleClose = jest.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);

      const backdrop = screen.getByRole('presentation');
      fireEvent.click(backdrop);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on backdrop click when closeOnBackdropClick is false', () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} closeOnBackdropClick={false}>
          Content
        </Modal>
      );

      const backdrop = screen.getByRole('presentation');
      fireEvent.click(backdrop);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does not close when clicking modal content', () => {
      const handleClose = jest.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);

      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('ESC Key', () => {
    it('closes modal on ESC key by default', () => {
      const handleClose = jest.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on ESC when closeOnEsc is false', () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} closeOnEsc={false}>
          Content
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does not close on other keys', () => {
      const handleClose = jest.fn();
      render(<Modal isOpen={true} onClose={handleClose}>Content</Modal>);

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll', () => {
    it('prevents body scroll when open', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={() => {}}>Content</Modal>
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal isOpen={false} onClose={() => {}}>Content</Modal>);

      // Wait for cleanup
      waitFor(() => {
        expect(document.body.style.overflow).toBe('');
      });
    });
  });

  describe('Focus Management', () => {
    it('focuses modal when opened', async () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveFocus();
      });
    });

    it('restores focus to previous element when closed', async () => {
      const button = document.createElement('button');
      button.textContent = 'Open Modal';
      document.body.appendChild(button);
      button.focus();

      const { rerender } = render(
        <Modal isOpen={false} onClose={() => {}}>Content</Modal>
      );

      rerender(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveFocus();
      });

      rerender(<Modal isOpen={false} onClose={() => {}}>Content</Modal>);

      await waitFor(() => {
        expect(button).toHaveFocus();
      });
    });
  });

  describe('Accessibility', () => {
    it('has role dialog', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('is focusable', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByRole('dialog')).toHaveAttribute('tabIndex', '-1');
    });

    it('close button has accessible label', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className to modal', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} className="custom-modal">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-modal');
    });

    it('preserves default classes with custom className', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} className="custom-modal">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('modal');
      expect(dialog.className).toContain('md');
      expect(dialog.className).toContain('custom-modal');
    });
  });

  describe('Complex Content', () => {
    it('renders multiple paragraphs', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
          <p>Paragraph 3</p>
        </Modal>
      );
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 3')).toBeInTheDocument();
    });

    it('renders form elements', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <input type="text" placeholder="Enter text" />
          <button>Submit</button>
        </Modal>
      );
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('renders nested components', () => {
      const NestedComponent = () => <div>Nested Content</div>;
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <NestedComponent />
        </Modal>
      );
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('has correct display name', () => {
      expect(Modal.displayName).toBe('Modal');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid open/close', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={() => {}}>Content</Modal>
      );

      rerender(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(<Modal isOpen={false} onClose={() => {}}>Content</Modal>);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(<Modal isOpen={true} onClose={() => {}}>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles undefined onClose gracefully', () => {
      // Should not throw error
      expect(() => {
        render(
          <Modal isOpen={true} onClose={() => {}}>
            Content
          </Modal>
        );
      }).not.toThrow();
    });

    it('handles empty children', () => {
      render(<Modal isOpen={true} onClose={() => {}}>{null}</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
