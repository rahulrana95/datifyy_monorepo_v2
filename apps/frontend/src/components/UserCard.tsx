/**
 * User Card Component
 * Displays user information using proto types
 */

import React from 'react';
import type { User } from '../services/proto.client';
import { ProtoUtils } from '../services/proto.client';
import '../styles/UserCard.css';

interface UserCardProps {
  user: User;
  onRefresh?: () => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onRefresh, 
  className = '' 
}) => {
  // Convert proto to plain object for easier access
  const userData = ProtoUtils.userToObject(user);

  return (
    <div className={`user-card ${className}`}>
      <div className="user-card-header">
        <h3>User Profile</h3>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="refresh-btn"
            aria-label="Refresh user"
          >
            🔄
          </button>
        )}
      </div>
      
      <div className="user-card-body">
        <div className="user-field">
          <span className="field-label">ID:</span>
          <span className="field-value">{userData.id}</span>
        </div>
        
        <div className="user-field">
          <span className="field-label">Name:</span>
          <span className="field-value">{userData.name}</span>
        </div>
        
        <div className="user-field">
          <span className="field-label">Email:</span>
          <span className="field-value">
            <a href={`mailto:${userData.email}`}>{userData.email}</a>
          </span>
        </div>
      </div>

      <div className="user-card-footer">
        <small>Proto-powered component</small>
      </div>
    </div>
  );
};

/**
 * User Card Skeleton for loading state
 */
export const UserCardSkeleton: React.FC = () => {
  return (
    <div className="user-card skeleton">
      <div className="user-card-header">
        <div className="skeleton-text skeleton-title"></div>
      </div>
      <div className="user-card-body">
        <div className="user-field">
          <div className="skeleton-text skeleton-label"></div>
          <div className="skeleton-text skeleton-value"></div>
        </div>
        <div className="user-field">
          <div className="skeleton-text skeleton-label"></div>
          <div className="skeleton-text skeleton-value"></div>
        </div>
        <div className="user-field">
          <div className="skeleton-text skeleton-label"></div>
          <div className="skeleton-text skeleton-value"></div>
        </div>
      </div>
    </div>
  );
};