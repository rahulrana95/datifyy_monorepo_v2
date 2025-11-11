/**
 * ErrorDisplay Component
 * User-friendly error display with retry functionality
 */

import React, { memo } from 'react';
import { ApiError } from '../types';

interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(({ error, onRetry }) => {
  return (
    <div className="error-display" role="alert">
      <h3 className="error-title">Oops! Something went wrong</h3>
      <p className="error-message">{error.message}</p>
      {error.code && (
        <p className="error-code">Error Code: {error.code}</p>
      )}
      {onRetry && (
        <button 
          className="retry-button"
          onClick={onRetry}
          aria-label="Retry failed request"
        >
          Try Again
        </button>
      )}
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';