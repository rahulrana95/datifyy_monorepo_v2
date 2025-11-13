/**
 * Romantic Animations Library
 * Beautiful, smooth animations for the Datifyy dating app
 * Created by world-class UI designer
 */

import { keyframes } from '@emotion/react';

// ==================== ENTRANCE ANIMATIONS ====================

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const scaleInBounce = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

export const slideInUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const zoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// ==================== ROMANTIC ANIMATIONS ====================

export const heartbeat = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.1);
  }
  20%, 40% {
    transform: scale(0.95);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.88;
  }
`;

export const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.35),
                0 0 40px rgba(244, 63, 94, 0.18),
                0 0 60px rgba(244, 63, 94, 0.08);
  }
  50% {
    box-shadow: 0 0 30px rgba(244, 63, 94, 0.55),
                0 0 60px rgba(244, 63, 94, 0.28),
                0 0 90px rgba(244, 63, 94, 0.15);
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

export const float = keyframes`
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) translateX(15px) rotate(8deg);
  }
  66% {
    transform: translateY(-15px) translateX(-12px) rotate(-6deg);
  }
`;

export const gentleFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const swing = keyframes`
  0%, 100% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(15deg);
  }
  30% {
    transform: rotate(-10deg);
  }
  45% {
    transform: rotate(5deg);
  }
  60% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(2deg);
  }
`;

export const wiggle = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
`;

// ==================== SPARKLE & CONFETTI ====================

export const sparkle = keyframes`
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
`;

export const confetti = keyframes`
  0% {
    transform: translateY(0) rotateZ(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(1000px) rotateZ(720deg);
    opacity: 0;
  }
`;

// ==================== INTERACTIVE ANIMATIONS ====================

export const hoverLift = {
  transform: 'translateY(-4px) scale(1.02)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const hoverGrow = {
  transform: 'scale(1.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const hoverShrink = {
  transform: 'scale(0.95)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const tapScale = {
  transform: 'scale(0.97)',
  transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
};

// ==================== LOADING ANIMATIONS ====================

export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const spinSlow = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const dotPulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
`;

export const wave = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
`;

// ==================== GRADIENT ANIMATIONS ====================

export const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

export const rainbowGlow = keyframes`
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
`;

// ==================== ATTENTION SEEKERS ====================

export const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

export const jello = keyframes`
  0%, 100% {
    transform: skewX(0deg) skewY(0deg);
  }
  30% {
    transform: skewX(-12.5deg) skewY(-12.5deg);
  }
  40% {
    transform: skewX(6.25deg) skewY(6.25deg);
  }
  50% {
    transform: skewX(-3.125deg) skewY(-3.125deg);
  }
  65% {
    transform: skewX(1.5625deg) skewY(1.5625deg);
  }
  75% {
    transform: skewX(-0.78125deg) skewY(-0.78125deg);
  }
`;

export const rubber = keyframes`
  0% {
    transform: scaleX(1) scaleY(1);
  }
  30% {
    transform: scaleX(1.25) scaleY(0.75);
  }
  40% {
    transform: scaleX(0.75) scaleY(1.25);
  }
  50% {
    transform: scaleX(1.15) scaleY(0.85);
  }
  65% {
    transform: scaleX(0.95) scaleY(1.05);
  }
  75% {
    transform: scaleX(1.05) scaleY(0.95);
  }
  100% {
    transform: scaleX(1) scaleY(1);
  }
`;

export const tada = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
  }
  10%, 20% {
    transform: scale(0.9) rotate(-3deg);
  }
  30%, 50%, 70%, 90% {
    transform: scale(1.1) rotate(3deg);
  }
  40%, 60%, 80% {
    transform: scale(1.1) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
`;

// ==================== ANIMATION PRESETS ====================

export const animationPresets = {
  // Durations
  durations: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
    slowest: '700ms',
  },

  // Easings
  easings: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common animation strings
  fadeIn: `${fadeIn} 0.5s ease-out`,
  fadeInUp: `${fadeInUp} 0.7s ease-out`,
  scaleIn: `${scaleIn} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
  heartbeat: `${heartbeat} 1.4s ease-in-out infinite`,
  pulse: `${pulse} 3s ease-in-out infinite`,
  float: `${float} 12s ease-in-out infinite`,
  shimmer: `${shimmer} 6s linear infinite`,
  glow: `${glow} 2s ease-in-out infinite`,
  spin: `${spin} 1s linear infinite`,
  bounce: `${bounce} 2s ease-in-out infinite`,
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Creates a staggered animation delay for lists
 * @param index - Item index in list
 * @param baseDelay - Base delay in milliseconds
 * @param increment - Delay increment per item in milliseconds
 */
export const staggerDelay = (index: number, baseDelay = 0, increment = 100): string => {
  return `${baseDelay + index * increment}ms`;
};

/**
 * Creates an animation string with custom duration and easing
 */
export const createAnimation = (
  animationName: any,
  duration = '500ms',
  easing = 'ease-out',
  delay = '0ms',
  iteration = '1',
  direction = 'normal',
  fillMode = 'both'
): string => {
  return `${animationName} ${duration} ${easing} ${delay} ${iteration} ${direction} ${fillMode}`;
};

export default {
  keyframes: {
    fadeIn,
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    scaleInBounce,
    slideInUp,
    slideInDown,
    zoomIn,
    heartbeat,
    pulse,
    glow,
    shimmer,
    float,
    gentleFloat,
    rotate,
    swing,
    wiggle,
    sparkle,
    confetti,
    spin,
    spinSlow,
    dotPulse,
    wave,
    gradientShift,
    rainbowGlow,
    bounce,
    jello,
    rubber,
    tada,
  },
  presets: animationPresets,
  helpers: {
    staggerDelay,
    createAnimation,
  },
  interactions: {
    hoverLift,
    hoverGrow,
    hoverShrink,
    tapScale,
  },
};
