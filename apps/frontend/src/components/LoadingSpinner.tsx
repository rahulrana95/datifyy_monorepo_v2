/**
 * LoadingSpinner Component
 * Accessible loading indicator
 */

import React, { memo } from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="loading-text">{message}</span>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';