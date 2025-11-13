/**
 * Romantic Card Component
 * Beautiful glass-morphism and premium card styles
 */

import React from 'react';
import styled from '@emotion/styled';
import { Box, Card } from '@chakra-ui/react';
import { datifyyTheme } from '../../../theme/datifyy.theme';
import { fadeInUp, scaleIn } from '../../../theme/romantic.animations';

interface RomanticCardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'premium' | 'elevated' | 'subtle';
  animated?: boolean;
  hoverEffect?: boolean;
  className?: string;
  onClick?: () => void;
}

const GlassCard = styled(Box)`
  background: ${datifyyTheme.colors.background.glass};
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: ${datifyyTheme.radii['3xl']};
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: ${datifyyTheme.shadows.glass};
  transition: all ${datifyyTheme.transitions.slow};
  position: relative;
  overflow: hidden;

  &.animated {
    animation: ${scaleIn} 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  &.hover-effect:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: ${datifyyTheme.shadows.premium};
    border-color: rgba(244, 63, 94, 0.35);
  }
`;

const PremiumCard = styled(Card.Root)`
  background: linear-gradient(145deg, #ffffff 0%, ${datifyyTheme.colors.primary[50]} 100%);
  border-radius: ${datifyyTheme.radii['3xl']};
  border: 1px solid ${datifyyTheme.colors.primary[200]};
  box-shadow: ${datifyyTheme.shadows.card};
  transition: all ${datifyyTheme.transitions.slow};
  position: relative;
  overflow: hidden;

  &.animated {
    animation: ${fadeInUp} 0.7s ease-out;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(244, 63, 94, 0.12),
      rgba(217, 70, 239, 0.10),
      transparent
    );
    transition: left 0.7s ease;
  }

  &.hover-effect:hover {
    transform: translateY(-16px) scale(1.03);
    box-shadow: ${datifyyTheme.shadows.cardHover};
    border-color: ${datifyyTheme.colors.primary[300]};

    &::before {
      left: 100%;
    }
  }
`;

const ElevatedCard = styled(Card.Root)`
  background: white;
  border-radius: ${datifyyTheme.radii['3xl']};
  border: 1px solid ${datifyyTheme.colors.primary[100]};
  box-shadow: ${datifyyTheme.shadows.card};
  transition: all ${datifyyTheme.transitions.slow};

  &.animated {
    animation: ${fadeInUp} 0.7s ease-out;
  }

  &.hover-effect:hover {
    transform: translateY(-8px);
    box-shadow: ${datifyyTheme.shadows.premium};
    border-color: ${datifyyTheme.colors.primary[200]};
  }
`;

const SubtleCard = styled(Box)`
  background: ${datifyyTheme.colors.primary[50]};
  border-radius: ${datifyyTheme.radii['3xl']};
  border: none;
  transition: all ${datifyyTheme.transitions.slow};

  &.animated {
    animation: ${fadeInUp} 0.7s ease-out;
  }

  &.hover-effect:hover {
    background: ${datifyyTheme.colors.primary[100]};
    transform: translateY(-4px);
  }
`;

export const RomanticCard: React.FC<RomanticCardProps> = ({
  children,
  variant = 'elevated',
  animated = true,
  hoverEffect = true,
  className = '',
  onClick,
}) => {
  const classNames = `${animated ? 'animated' : ''} ${hoverEffect ? 'hover-effect' : ''} ${className}`;

  switch (variant) {
    case 'glass':
      return (
        <GlassCard className={classNames} onClick={onClick} cursor={onClick ? 'pointer' : 'default'}>
          {children}
        </GlassCard>
      );

    case 'premium':
      return (
        <PremiumCard className={classNames} onClick={onClick} cursor={onClick ? 'pointer' : 'default'}>
          {children}
        </PremiumCard>
      );

    case 'subtle':
      return (
        <SubtleCard className={classNames} onClick={onClick} cursor={onClick ? 'pointer' : 'default'}>
          {children}
        </SubtleCard>
      );

    case 'elevated':
    default:
      return (
        <ElevatedCard className={classNames} onClick={onClick} cursor={onClick ? 'pointer' : 'default'}>
          {children}
        </ElevatedCard>
      );
  }
};
