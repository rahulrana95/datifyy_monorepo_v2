/**
 * StatusIndicator Component
 * Displays service connection status with accessibility support
 */

import React, { memo } from 'react';

interface StatusIndicatorProps {
  label: string;
  status: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = memo(({ label, status }) => {
  const statusText = status ? 'Connected' : 'Disconnected';
  const statusClass = status ? 'status-connected' : 'status-disconnected';

  return (
    <div 
      className={`status-indicator ${statusClass}`}
      role="status"
      aria-label={`${label} is ${statusText}`}
    >
      <span className="status-dot" aria-hidden="true" />
      <span className="status-label">{label}:</span>
      <span className="status-text">{statusText}</span>
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';