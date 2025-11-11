/**
 * Proto API Hooks
 * React hooks for proto-based API calls with type safety
 */

import { useState, useEffect, useCallback } from 'react';
import { userServiceClient, type User } from '../services/proto.client';

/**
 * Hook state for async operations
 */
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch a user by ID using proto types
 */
export function useUser(userId?: string) {
  const [state, setState] = useState<AsyncState<User>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchUser = useCallback(async (id: string, yt: string = '') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await userServiceClient.getUser(id, yt);
      setState({
        data: user,
        loading: false,
        error: user ? null : new Error('User not found')
      });
      return user;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch user');
      setState({
        data: null,
        loading: false,
        error: err
      });
      throw err;
    }
  }, []);

  // Auto-fetch if userId is provided
  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);

  const refetch = useCallback(() => {
    if (userId) {
      return fetchUser(userId);
    }
    return Promise.reject(new Error('No user ID provided'));
  }, [userId, fetchUser]);

  return {
    user: state.data,
    loading: state.loading,
    error: state.error,
    fetchUser,
    refetch
  };
}

/**
 * Hook to manage multiple users with proto types
 */
export function useUsers() {
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, Error>>(new Map());

  const fetchUser = useCallback(async (id: string, yt?: string) => {
    // Mark as loading
    setLoading(prev => new Set(prev).add(id));
    setErrors(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    try {
      const user = await userServiceClient.getUser(id, yt || '');
      if (user) {
        setUsers(prev => new Map(prev).set(id, user));
      } else {
        throw new Error(`User ${id} not found`);
      }
      return user;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch user');
      setErrors(prev => new Map(prev).set(id, err));
      throw err;
    } finally {
      setLoading(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  const getUser = useCallback((id: string): User | undefined => {
    return users.get(id);
  }, [users]);

  const isLoading = useCallback((id: string): boolean => {
    return loading.has(id);
  }, [loading]);

  const getError = useCallback((id: string): Error | undefined => {
    return errors.get(id);
  }, [errors]);

  const clearError = useCallback((id: string) => {
    setErrors(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return {
    users: Array.from(users.values()),
    userMap: users,
    fetchUser,
    getUser,
    isLoading,
    getError,
    clearError,
    loadingCount: loading.size,
    errorCount: errors.size
  };
}

/**
 * Hook for creating mock users (for testing)
 */
export function useMockUser() {
  const createMockUser = useCallback((
    id: string = '1',
    name: string = 'John Doe',
    email: string = 'john@example.com'
  ): User => {
    return userServiceClient.createUserMessage(id, name, email);
  }, []);

  return { createMockUser };
}