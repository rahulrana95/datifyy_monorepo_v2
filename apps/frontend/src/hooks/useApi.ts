/**
 * Custom hook for API calls
 * Implements proper state management and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiState, ApiError } from '../types';

interface UseApiOptions {
  autoFetch?: boolean;
  onSuccess?: <T>(data: T) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): {
  state: ApiState<T>;
  execute: () => Promise<void>;
  reset: () => void;
} {
  const { autoFetch = true, onSuccess, onError } = options;
  const [state, setState] = useState<ApiState<T>>({ status: 'idle' });

  const execute = useCallback(async () => {
    setState({ status: 'loading' });
    
    try {
      const data = await apiCall();
      setState({ status: 'success', data });
      onSuccess?.(data);
    } catch (error) {
      const apiError: ApiError = error instanceof Error 
        ? { message: error.message }
        : { message: 'An unknown error occurred' };
      
      setState({ status: 'error', error: apiError });
      onError?.(apiError);
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return { state, execute, reset };
}