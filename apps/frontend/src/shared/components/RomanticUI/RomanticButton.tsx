/**
 * Romantic Button Component
 * Beautiful animated buttons with romantic styling
 */

import React from 'react';
import styled from '@emotion/styled';
import { Button } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { datifyyTheme } from '../../../theme/datifyy.theme';
import { glow } from '../../../theme/romantic.animations';

interface RomanticButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glowing?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const shimmerKeyframes = keyframes`
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
`;

const PrimaryButton = styled(Button)<{ glowing?: boolean }>`
  background: ${datifyyTheme.colors.primary.gradient};
  color: white;
  padding: 16px 40px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: -0.01em;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${datifyyTheme.shadows.button};
  position: relative;
  overflow: hidden;
  border: none;

  ${(props) =>
    props.glowing &&
    `
    animation: ${glow} 2s ease-in-out infinite;
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: ${datifyyTheme.shadows.buttonHover};

    &::before {
      animation: ${shimmerKeyframes} 0.8s;
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: ${datifyyTheme.colors.primary[600]};
  border: 2px solid ${datifyyTheme.colors.primary[400]};
  padding: 14px 38px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: -0.01em;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${datifyyTheme.colors.primary[50]};
    border-color: ${datifyyTheme.colors.primary[600]};
    transform: translateY(-2px) scale(1.02);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GhostButton = styled(Button)`
  background: transparent;
  color: ${datifyyTheme.colors.text.secondary};
  padding: 12px 24px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;

  &:hover {
    background: rgba(244, 63, 94, 0.08);
    color: ${datifyyTheme.colors.primary[600]};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GlassButton = styled(Button)`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  color: ${datifyyTheme.colors.text.primary};
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 14px 32px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: ${datifyyTheme.shadows.glass};
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const RomanticButton: React.FC<RomanticButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  glowing = false,
  icon,
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) => {
  const sizeStyles = {
    sm: { px: 4, py: 2, fontSize: 'sm' },
    md: { px: 6, py: 3, fontSize: 'md' },
    lg: { px: 8, py: 4, fontSize: 'lg' },
    xl: { px: 10, py: 5, fontSize: 'xl' },
  };

  const commonProps = {
    onClick,
    disabled,
    type,
    className,
    w: fullWidth ? 'full' : 'auto',
    ...sizeStyles[size],
  };

  const content = (
    <>
      {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
      {children}
    </>
  );

  switch (variant) {
    case 'primary':
      return (
        <PrimaryButton glowing={glowing} {...commonProps}>
          {content}
        </PrimaryButton>
      );

    case 'secondary':
      return <SecondaryButton {...commonProps}>{content}</SecondaryButton>;

    case 'ghost':
      return <GhostButton {...commonProps}>{content}</GhostButton>;

    case 'glass':
      return <GlassButton {...commonProps}>{content}</GlassButton>;

    default:
      return (
        <PrimaryButton glowing={glowing} {...commonProps}>
          {content}
        </PrimaryButton>
      );
  }
};
