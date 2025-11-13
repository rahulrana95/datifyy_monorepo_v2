/**
 * Romantic Heading Component
 * Beautiful gradient text headings with animations
 */

import React from 'react';
import styled from '@emotion/styled';
import { Heading } from '@chakra-ui/react';
import { datifyyTheme } from '../../../theme/datifyy.theme';
import { shimmer, fadeInUp } from '../../../theme/romantic.animations';

interface RomanticHeadingProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  gradient?: boolean;
  animated?: boolean;
  className?: string;
  textAlign?: 'left' | 'center' | 'right';
}

const GradientHeading = styled(Heading)`
  background: ${datifyyTheme.colors.text.gradient};
  background-size: 200% 200%;
  animation: ${shimmer} 6s linear infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: ${datifyyTheme.fonts.heading};
  font-weight: ${datifyyTheme.fontWeights.black};
  line-height: ${datifyyTheme.lineHeights.tight};
  letter-spacing: ${datifyyTheme.letterSpacing.tighter};

  &.animated {
    animation: ${fadeInUp} 0.7s ease-out, ${shimmer} 6s linear infinite;
  }
`;

const StandardHeading = styled(Heading)`
  font-family: ${datifyyTheme.fonts.heading};
  font-weight: ${datifyyTheme.fontWeights.extrabold};
  color: ${datifyyTheme.colors.text.primary};
  letter-spacing: ${datifyyTheme.letterSpacing.tighter};
  line-height: ${datifyyTheme.lineHeights.tight};

  &.animated {
    animation: ${fadeInUp} 0.7s ease-out;
  }
`;

export const RomanticHeading: React.FC<RomanticHeadingProps> = ({
  children,
  size = 'xl',
  gradient = false,
  animated = false,
  className = '',
  textAlign = 'left',
}) => {
  const classNames = `${animated ? 'animated' : ''} ${className}`;

  if (gradient) {
    return (
      <GradientHeading size={size} className={classNames} textAlign={textAlign}>
        {children}
      </GradientHeading>
    );
  }

  return (
    <StandardHeading size={size} className={classNames} textAlign={textAlign}>
      {children}
    </StandardHeading>
  );
};
