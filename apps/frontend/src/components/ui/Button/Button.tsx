import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { datifyyTheme } from '../../../theme/datifyy.theme';

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  gradientOnHover?: boolean;
  fullWidth?: boolean;
}

const StyledButton = styled(ChakraButton)<ButtonProps>`
  font-weight: 600;
  transition: all 0.3s ease;
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: ${datifyyTheme.colors.primary.gradient};
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: ${datifyyTheme.shadows.button};
            opacity: 0.95;
          }
          &:active {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background: ${datifyyTheme.colors.secondary.gradient};
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: ${datifyyTheme.shadows.button};
            opacity: 0.95;
          }
          &:active {
            transform: translateY(0);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${datifyyTheme.colors.primary[600]};
          border: 2px solid ${datifyyTheme.colors.primary[500]};
          &:hover {
            background: ${datifyyTheme.colors.primary[50]};
            border-color: ${datifyyTheme.colors.primary[600]};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${datifyyTheme.colors.gray[700]};
          &:hover {
            background: ${datifyyTheme.colors.gray[100]};
          }
        `;
      default:
        return '';
    }
  }}
  
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  borderRadius = 'xl',
  ...props
}) => {
  return (
    <StyledButton
      variant={variant as any}
      size={size}
      borderRadius={borderRadius}
      {...props}
    />
  );
};