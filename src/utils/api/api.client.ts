// External library imports
import type { APIRequestContext, APIResponse } from '@playwright/test';

// Core framework imports
import { APIErrorMessages } from '@core/constants';
import { ApiMethod } from '@core/enums';

/**
 * @fileoverview API Client - Base HTTP client for API testing
 * @description Provides HTTP methods with error handling and response processing
 * @author Anand Sogalad
 */

/**
 * API client wrapper with intelligent error handling and logging.
 *
 * Features:
 * - Automatic HTTP status code error handling
 * - Network error detection and logging
 * - Consistent error message formatting
 * - Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, FETCH)
 * - Context management (dispose, storage state)
 *
 * @description HTTP client wrapper that provides consistent error handling across all API requests
 * @example
 * ```typescript
 * import { ApiClient } from '@utils/api';
 *
 * const apiClient = new ApiClient(request);
 * const response = await apiClient.get('/api/users');
 * const userData = await response.json();
 * ```
 */
export class ApiClient {
  private readonly context: APIRequestContext;

  /**
   * Creates a new ApiClient instance.
   *
   * @param context - The Playwright APIRequestContext to wrap
   * @example
   * ```typescript
   * import { test } from '@playwright/test';
   * import { ApiClient } from '@utils/api';
   *
   * test('API test', async ({ request }) => {
   *   const apiClient = new ApiClient(request);
   *   const response = await apiClient.get('/api/users');
   * });
   * ```
   */
  constructor(context: APIRequestContext) {
    this.context = context;
  }

  /**
   * Handles HTTP status codes and optionally throws descriptive errors for failed requests.
   *
   * @param response - The API response to handle
   * @param method - The HTTP method used (GET, POST, etc.)
   * @param url - The requested URL
   * @param throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns The original response regardless of status when throwOnError is false
   * @throws Error with descriptive message for HTTP errors when throwOnError is true
   * @private
   */
  private async handleResponse(
    response: APIResponse,
    method: string,
    url: string,
    throwOnError: boolean = true
  ): Promise<APIResponse> {
    if (!response.ok() && throwOnError) {
      let message: string;
      switch (response.status()) {
        case 400:
          message = APIErrorMessages.INVALID_REQUEST;
          break;
        case 401:
          message = APIErrorMessages.UNAUTHORIZED;
          break;
        case 403:
          message = APIErrorMessages.FORBIDDEN;
          break;
        case 404:
          message = APIErrorMessages.NOT_FOUND;
          break;
        case 405:
          message = APIErrorMessages.METHOD_NOT_ALLOWED;
          break;
        case 500:
        default:
          message = APIErrorMessages.INTERNAL_SERVER_ERROR;
          break;
      }
      console.error(`${method} request failed: ${url} - ${message} (Status: ${response.status()})`);
      throw new Error(`${method} request failed: ${url} - ${message} (Status: ${response.status()})`);
    }

    // Always log errors for monitoring, but don't throw if throwOnError is false
    if (!response.ok() && !throwOnError) {
      console.warn(`${method} request returned non-2xx status: ${url} (Status: ${response.status()})`);
    }

    return response;
  }

  /**
   * Performs a GET request with automatic error handling.
   *
   * @param url - The URL to make the GET request to
   * @param options - Optional request configuration
   * @param throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns Promise resolving to the API response
   * @throws Error for HTTP errors (4xx, 5xx) or network issues (when throwOnError is true)
   * @example
   * ```typescript
   * const response = await apiClient.get('/api/users');
   * const users = await response.json();
   * ```
   *
   * @example Testing scenarios that expect non-2xx responses:
   * ```typescript
   * const response = await apiClient.get('/api/protected', undefined, false);
   * expect(response.status()).toBe(401);
   * ```
   */
  async get(
    url: Parameters<APIRequestContext['get']>[0],
    options?: Parameters<APIRequestContext['get']>[1],
    throwOnError: boolean = true
  ): Promise<APIResponse> {
    try {
      const response = await this.context.get(url, options);
      return await this.handleResponse(response, ApiMethod.GET, url as string, throwOnError);
    } catch (error) {
      // HTTP error → re-throw as-is, Network error → log & wrap
      if (error instanceof Error && error.message.includes('request failed:')) {
        throw error;
      }
      console.error(`GET network error: ${url}`, error);
      throw new Error(`GET network error: ${url} - ${(error as Error).message}`);
    }
  }

  /**
   * Performs a POST request with automatic error handling.
   *
   * @param url - The URL to make the POST request to
   * @param options - Optional request configuration including data payload
   * @param throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns Promise resolving to the API response
   * @throws Error for HTTP errors (4xx, 5xx) or network issues (when throwOnError is true)
   * @example
   * ```typescript
   * const response = await apiClient.post('/api/users', {
   *   data: { name: 'John', email: 'john@example.com' }
   * });
   * ```
   *
   * @example Testing scenarios that expect non-2xx responses:
   * ```typescript
   * const response = await apiClient.post('/api/login', {
   *   data: { email: 'invalid', password: 'test' }
   * }, false); // Won't throw on 403, 400, etc.
   * expect(response.status()).toBe(403);
   * ```
   */
  async post(
    url: Parameters<APIRequestContext['post']>[0],
    options?: Parameters<APIRequestContext['post']>[1],
    throwOnError: boolean = true
  ): Promise<APIResponse> {
    try {
      const response = await this.context.post(url, options);
      return await this.handleResponse(response, ApiMethod.POST, url as string, throwOnError);
    } catch (error) {
      // HTTP error → re-throw as-is, Network error → log & wrap
      if (error instanceof Error && error.message.includes('request failed:')) {
        throw error;
      }
      console.error(`POST network error: ${url}`, error);
      throw new Error(`POST network error: ${url} - ${(error as Error).message}`);
    }
  }

  /**
   * Performs a PUT request with automatic error handling.
   *
   * @param url - The URL to make the PUT request to
   * @param options - Optional request configuration including data payload
   * @param throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns Promise resolving to the API response
   * @throws Error for HTTP errors (4xx, 5xx) or network issues (when throwOnError is true)
   * @example
   * ```typescript
   * const response = await apiClient.put('/api/users/123', {
   *   data: { name: 'Updated Name' }
   * });
   * ```
   *
   * @example Testing scenarios that expect non-2xx responses:
   * ```typescript
   * const response = await apiClient.put('/api/users/999', {
   *   data: { name: 'Test' }
   * }, false); // Won't throw on 404
   * expect(response.status()).toBe(404);
   * ```
   */
  async put(
    url: Parameters<APIRequestContext['put']>[0],
    options?: Parameters<APIRequestContext['put']>[1],
    throwOnError: boolean = true
  ): Promise<APIResponse> {
    try {
      const response = await this.context.put(url, options);
      return await this.handleResponse(response, ApiMethod.PUT, url as string, throwOnError);
    } catch (error) {
      // HTTP error → re-throw as-is, Network error → log & wrap
      if (error instanceof Error && error.message.includes('request failed:')) {
        throw error;
      }
      console.error(`PUT network error: ${url}`, error);
      throw new Error(`PUT network error: ${url} - ${(error as Error).message}`);
    }
  }

  /**
   * Performs a DELETE request with automatic error handling.
   *
   * @param url - The URL to make the DELETE request to
   * @param options - Optional request configuration
   * @param throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns Promise resolving to the API response
   * @throws Error for HTTP errors (4xx, 5xx) or network issues (when throwOnError is true)
   * @example
   * ```typescript
   * const response = await apiClient.delete('/api/users/123');
   * ```
   *
   * @example Testing scenarios that expect non-2xx responses:
   * ```typescript
   * const response = await apiClient.delete('/api/users/999', undefined, false);
   * expect(response.status()).toBe(404);
   * ```
   */
  async delete(
    url: Parameters<APIRequestContext['delete']>[0],
    options?: Parameters<APIRequestContext['delete']>[1],
    throwOnError: boolean = true
  ): Promise<APIResponse> {
    try {
      const response = await this.context.delete(url, options);
      return await this.handleResponse(response, ApiMethod.DELETE, url as string, throwOnError);
    } catch (error) {
      // HTTP error → re-throw as-is, Network error → log & wrap
      if (error instanceof Error && error.message.includes('request failed:')) {
        throw error;
      }
      console.error(`DELETE network error: ${url}`, error);
      throw new Error(`DELETE network error: ${url} - ${(error as Error).message}`);
    }
  }

  /**
   * Performs a PATCH request with automatic error handling.
   *
   * @param url - The URL to make the PATCH request to
   * @param options - Optional request configuration including data payload
   * @param throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns Promise resolving to the API response
   * @throws Error for HTTP errors (4xx, 5xx) or network issues (when throwOnError is true)
   * @example
   * ```typescript
   * const response = await apiClient.patch('/api/users/123', {
   *   data: { email: 'newemail@example.com' }
   * });
   * ```
   *
   * @example Testing scenarios that expect non-2xx responses:
   * ```typescript
   * const response = await apiClient.patch('/api/users/123', {
   *   data: { invalid: 'data' }
   * }, false); // Won't throw on 400
   * expect(response.status()).toBe(400);
   * ```
   */
  async patch(
    url: Parameters<APIRequestContext['patch']>[0],
    options?: Parameters<APIRequestContext['patch']>[1],
    throwOnError: boolean = true
  ): Promise<APIResponse> {
    try {
      const response = await this.context.patch(url, options);
      return await this.handleResponse(response, ApiMethod.PATCH, url as string, throwOnError);
    } catch (error) {
      // HTTP error → re-throw as-is, Network error → log & wrap
      if (error instanceof Error && error.message.includes('request failed:')) {
        throw error;
      }
      console.error(`PATCH network error: ${url}`, error);
      throw new Error(`PATCH network error: ${url} - ${(error as Error).message}`);
    }
  }

  /**
   * Performs a HEAD request with automatic error handling.
   *
   * @param url - The URL to make the HEAD request to
   * @param options - Optional request configuration
   * @param throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns Promise resolving to the API response (headers only)
   * @throws Error for HTTP errors (4xx, 5xx) or network issues (when throwOnError is true)
   * @example
   * ```typescript
   * const response = await apiClient.head('/api/users/123');
   * console.log('Content-Type:', response.headers()['content-type']);
   * ```
   *
   * @example Testing scenarios that expect non-2xx responses:
   * ```typescript
   * const response = await apiClient.head('/api/users/999', undefined, false);
   * expect(response.status()).toBe(404);
   * ```
   */
  async head(
    url: Parameters<APIRequestContext['head']>[0],
    options?: Parameters<APIRequestContext['head']>[1],
    throwOnError: boolean = true
  ): Promise<APIResponse> {
    try {
      const response = await this.context.head(url, options);
      return await this.handleResponse(response, ApiMethod.HEAD, url as string, throwOnError);
    } catch (error) {
      // HTTP error → re-throw as-is, Network error → log & wrap
      if (error instanceof Error && error.message.includes('request failed:')) {
        throw error;
      }
      console.error(`HEAD network error: ${url}`, error);
      throw new Error(`HEAD network error: ${url} - ${(error as Error).message}`);
    }
  }

  /**
   * Disposes the API request context and cleans up resources.
   *
   * @param options - Optional disposal configuration
   * @returns Promise that resolves when disposal is complete
   * @throws Error if disposal fails
   * @example
   * ```typescript
   * await apiClient.dispose();
   * ```
   */
  async dispose(options?: Parameters<APIRequestContext['dispose']>[0]): Promise<void> {
    try {
      await this.context.dispose(options);
    } catch (error) {
      console.error(`Dispose failed`, error);
      throw new Error(`Dispose failed: ${(error as Error).message}`);
    }
  }

  /**
   * Performs a FETCH request with automatic error handling.
   *
   * @param url - The URL or Request object to fetch
   * @param options - Optional request configuration
   * @param throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns Promise resolving to the API response
   * @throws Error for HTTP errors (4xx, 5xx) or network issues (when throwOnError is true)
   * @example
   * ```typescript
   * const response = await apiClient.fetch('/api/data', {
   *   method: 'GET',
   *   headers: { 'Authorization': 'Bearer token' }
   * });
   * ```
   *
   * @example Testing scenarios that expect non-2xx responses:
   * ```typescript
   * const response = await apiClient.fetch('/api/protected', {
   *   method: 'GET'
   * }, false); // Won't throw on 401
   * expect(response.status()).toBe(401);
   * ```
   */
  async fetch(
    url: Parameters<APIRequestContext['fetch']>[0],
    options?: Parameters<APIRequestContext['fetch']>[1],
    throwOnError: boolean = true
  ): Promise<APIResponse> {
    try {
      const response = await this.context.fetch(url, options);
      return await this.handleResponse(response, ApiMethod.FETCH, url as string, throwOnError);
    } catch (error) {
      // HTTP error → re-throw as-is, Network error → log & wrap
      if (error instanceof Error && error.message.includes('request failed:')) {
        throw error;
      }
      console.error(`FETCH network error: ${url}`, error);
      throw new Error(`FETCH network error: ${url} - ${(error as Error).message}`);
    }
  }

  /**
   * Saves or loads the storage state (cookies, localStorage, sessionStorage).
   *
   * @param options - Optional storage state configuration
   * @returns Promise that resolves when storage state operation is complete
   * @throws Error if storage state operation fails
   * @example
   * ```typescript
   * // Save current state
   * await apiClient.storageState({ path: 'state.json' });
   * ```
   */
  async storageState(options?: Parameters<APIRequestContext['storageState']>[0]): Promise<void> {
    try {
      await this.context.storageState(options);
    } catch (error) {
      console.error(`StorageState failed`, error);
      throw new Error(`StorageState failed: ${(error as Error).message}`);
    }
  }
}
