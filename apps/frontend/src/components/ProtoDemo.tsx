/**
 * Proto Demo Component
 * Demonstrates usage of proto types and API calls
 */

import React, { useState } from 'react';
import { useUser, useMockUser } from '../hooks/useProtoApi';
import { UserCard, UserCardSkeleton } from './UserCard';

export const ProtoDemo: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [ytParam, setYtParam] = useState<string>('');
  const [searchId, setSearchId] = useState<string>('');
  
  const { user, loading, error, fetchUser, refetch } = useUser(searchId);
  const { createMockUser } = useMockUser();

  const handleSearch = () => {
    if (userId) {
      setSearchId(userId);
    }
  };

  const handleMockUser = () => {
    const mockUser = createMockUser(
      Math.random().toString(36).substring(7),
      'Mock User',
      'mock@example.com'
    );
    console.log('Created mock user:', mockUser);
    alert('Check console for mock user data');
  };

  const handleManualFetch = async () => {
    if (userId) {
      try {
        await fetchUser(userId, ytParam);
      } catch (err) {
        console.error('Manual fetch failed:', err);
      }
    }
  };

  return (
    <div className="proto-demo">
      <h2>Proto Types Demo</h2>
      
      {/* Search Form */}
      <div className="search-section">
        <h3>Search User</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="YT Parameter (optional)"
            value={ytParam}
            onChange={(e) => setYtParam(e.target.value)}
            className="input-field"
          />
          <button onClick={handleSearch} className="btn btn-primary">
            Search
          </button>
          <button onClick={handleManualFetch} className="btn btn-secondary">
            Fetch with Params
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        {loading && <UserCardSkeleton />}
        
        {error && (
          <div className="error-message">
            <span>❌</span> {error.message}
          </div>
        )}
        
        {user && !loading && (
          <UserCard user={user} onRefresh={refetch} />
        )}
        
        {!loading && !error && !user && searchId && (
          <div className="no-results">
            No user found with ID: {searchId}
          </div>
        )}
      </div>

      {/* Mock Data Section */}
      <div className="mock-section">
        <h3>Generate Mock Data</h3>
        <button onClick={handleMockUser} className="btn btn-outline">
          Create Mock User (Proto Type)
        </button>
        <p className="hint">
          This creates a User proto message locally using the generated types
        </p>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>ℹ️ About This Demo</h3>
        <ul>
          <li>Uses generated TypeScript types from <code>proto/example.proto</code></li>
          <li>Type-safe API calls with proto message validation</li>
          <li>Located in <code>apps/frontend/src/gen/</code></li>
          <li>Auto-generated when proto files change</li>
        </ul>
      </div>
    </div>
  );
};