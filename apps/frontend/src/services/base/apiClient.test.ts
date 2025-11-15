/**
 * Base API Client Tests
 * 100% test coverage for ApiClient
 */

import { ApiClient } from './apiClient';
import type { ApiRequestConfig, ApiResponse } from './types';

// Mock fetch globally
global.fetch = jest.fn();

// Helper to create mock Response
const createMockResponse = (data: unknown, status = 200, ok = true): Response => {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    body: null,
    bodyUsed: false,
    clone: jest.fn(),
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn(),
    json: async () => data,
  } satisfies Response;
};

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const baseURL = 'https://api.example.com';
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
    apiClient = new ApiClient({ baseURL });
  });

  describe('Constructor and Configuration', () => {
    it('should create client with base configuration', () => {
      const config = apiClient.getConfig();
      expect(config.baseURL).toBe(baseURL);
      expect(config.timeout).toBe(30000); // Default timeout
    });

    it('should create client with custom timeout', () => {
      const customClient = new ApiClient({ baseURL, timeout: 5000 });
      const config = customClient.getConfig();
      expect(config.timeout).toBe(5000);
    });

    it('should create client with custom headers', () => {
      const headers = { 'X-Custom-Header': 'test' };
      const customClient = new ApiClient({ baseURL, headers });
      const config = customClient.getConfig();
      expect(config.headers).toEqual(headers);
    });

    it('should update configuration', () => {
      apiClient.updateConfig({ timeout: 10000 });
      const config = apiClient.getConfig();
      expect(config.timeout).toBe(10000);
    });
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ method: 'GET' })
      );
      expect(response.data).toEqual(mockData);
      expect(response.status).toBe(200);
    });

    it('should make GET request with query parameters', async () => {
      const mockData = { results: [] };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await apiClient.get('/users', {
        params: { page: 1, limit: 10, active: true },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10&active=true',
        expect.any(Object)
      );
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockData = { id: 1, created: true };
      const requestBody = { name: 'New Item' };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockData, 201));

      const response = await apiClient.post('/items', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
      expect(response.data).toEqual(mockData);
      expect(response.status).toBe(201);
    });

    it('should make POST request without body', async () => {
      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      await apiClient.post('/action');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/action',
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const mockData = { id: 1, updated: true };
      const requestBody = { name: 'Updated Item' };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await apiClient.put('/items/1', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/items/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestBody),
        })
      );
      expect(response.data).toEqual(mockData);
    });
  });

  describe('PATCH requests', () => {
    it('should make successful PATCH request', async () => {
      const mockData = { id: 1, patched: true };
      const requestBody = { status: 'active' };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await apiClient.patch('/items/1', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/items/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(requestBody),
        })
      );
      expect(response.data).toEqual(mockData);
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      const mockData = { deleted: true };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockData));

      const response = await apiClient.delete('/items/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/items/1',
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(response.data).toEqual(mockData);
    });
  });

  describe('Headers', () => {
    it('should include default Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await apiClient.get('/test');

      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1];
      const headers = requestInit?.headers;
      expect(headers).toHaveProperty('Content-Type', 'application/json');
    });

    it('should include custom headers from config', async () => {
      const customClient = new ApiClient({
        baseURL,
        headers: { 'X-API-Key': 'secret' },
      });

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await customClient.get('/test');

      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1];
      const headers = requestInit?.headers;
      expect(headers).toHaveProperty('X-API-Key', 'secret');
    });

    it('should include custom headers from request config', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await apiClient.get('/test', {
        headers: { 'X-Request-ID': '123' },
      });

      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1];
      const headers = requestInit?.headers;
      expect(headers).toHaveProperty('X-Request-ID', '123');
    });

    it('should include Authorization header when token is available', async () => {
      const customClient = new ApiClient({
        baseURL,
        getAuthToken: () => 'test-token',
      });

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await customClient.get('/test');

      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1];
      const headers = requestInit?.headers;
      expect(headers).toHaveProperty('Authorization', 'Bearer test-token');
    });

    it('should skip Authorization header when skipAuth is true', async () => {
      const customClient = new ApiClient({
        baseURL,
        getAuthToken: () => 'test-token',
      });

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await customClient.get('/test', { skipAuth: true });

      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1];
      const headers = requestInit?.headers;
      expect(headers).not.toHaveProperty('Authorization');
    });

    it('should handle async getAuthToken', async () => {
      const customClient = new ApiClient({
        baseURL,
        getAuthToken: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 'async-token';
        },
      });

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await customClient.get('/test');

      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1];
      const headers = requestInit?.headers;
      expect(headers).toHaveProperty('Authorization', 'Bearer async-token');
    });

    it('should not include Authorization header when token is null', async () => {
      const customClient = new ApiClient({
        baseURL,
        getAuthToken: () => null,
      });

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await customClient.get('/test');

      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1];
      const headers = requestInit?.headers;
      expect(headers).not.toHaveProperty('Authorization');
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      const errorData = {
        message: 'Not found',
        code: 'NOT_FOUND',
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(errorData, 404, false));

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'Not found',
        status: 404,
        code: 'NOT_FOUND',
      });
    });

    it('should handle error response without JSON body', async () => {
      const mockResponse = createMockResponse({}, 500, false);
      mockResponse.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'));

      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'Error',
        status: 500,
      });
    });

    it('should call error interceptor on error', async () => {
      const onError = jest.fn();
      const customClient = new ApiClient({ baseURL, onError });

      mockFetch.mockResolvedValueOnce(
        createMockResponse({ message: 'Unauthorized' }, 401, false)
      );

      await expect(customClient.get('/test')).rejects.toMatchObject({
        message: 'Unauthorized',
        status: 401,
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          status: 401,
        })
      );
    });
  });

  describe('Interceptors', () => {
    it('should call request interceptor', async () => {
      const onRequest = jest.fn((config: ApiRequestConfig) => ({
        ...config,
        headers: { ...config.headers, 'X-Intercepted': 'true' },
      }));

      const customClient = new ApiClient({ baseURL, onRequest });

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await customClient.get('/test');

      expect(onRequest).toHaveBeenCalled();
      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1];
      const headers = requestInit?.headers;
      expect(headers).toHaveProperty('X-Intercepted', 'true');
    });

    it('should call async request interceptor', async () => {
      const onRequest = jest.fn(async (config: ApiRequestConfig) => ({
        ...config,
        headers: { ...config.headers, 'X-Async': 'true' },
      }));

      const customClient = new ApiClient({ baseURL, onRequest });

      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await customClient.get('/test');

      expect(onRequest).toHaveBeenCalled();
      const callArgs = mockFetch.mock.calls[0];
      const requestInit = callArgs[1];
      const headers = requestInit?.headers;
      expect(headers).toHaveProperty('X-Async', 'true');
    });

    it('should call response interceptor', async () => {
      const onResponse = <T,>(response: ApiResponse<T>): ApiResponse<T> => ({
        ...response,
        data: { ...(response.data as object), intercepted: true } as T,
      });

      const customClient = new ApiClient({ baseURL, onResponse });

      mockFetch.mockResolvedValueOnce(createMockResponse({ original: true }));

      const response = await customClient.get('/test');

      expect(response.data).toEqual({ original: true, intercepted: true });
    });

    it('should call async response interceptor', async () => {
      const onResponse = async <T,>(response: ApiResponse<T>): Promise<ApiResponse<T>> => ({
        ...response,
        data: { ...(response.data as object), asyncIntercepted: true } as T,
      });

      const customClient = new ApiClient({ baseURL, onResponse });

      mockFetch.mockResolvedValueOnce(createMockResponse({ original: true }));

      const response = await customClient.get('/test');

      expect(response.data).toEqual({ original: true, asyncIntercepted: true });
    });
  });
});
