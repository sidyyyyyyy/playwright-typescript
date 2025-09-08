// External library imports
import type { APIRequestContext, APIResponse } from '@playwright/test';

// Core framework imports
import { ApiClient } from '@utils/api';
import { ApiEndpoints } from '@core/constants';

/**
 * @fileoverview Authentication API Integration Service
 * @description Provides authentication-related API operations with built-in error handling
 * @author Anand Sogalad
 */

/**
 * Authentication API service class.
 *
 * Provides methods for user authentication operations including:
 * - User login with credentials
 * - Session management
 * - Token handling (inherited from ApiClient)
 *
 * This class extends the base ApiClient to inherit all HTTP methods
 * and error handling capabilities while providing authentication-specific methods.
 *
 * @class AuthApi
 * @extends {ApiClient}
 * @example
 * ```typescript
 * import { AuthApi } from '@integrations';
 * import { test } from '@playwright/test';
 *
 * test('User authentication', async ({ request }) => {
 *   const authApi = new AuthApi(request);
 *
 *   // Login with valid credentials
 *   const response = await authApi.login({
 *     email: 'user@example.com',
 *     password: 'securePassword',
 *     forceLogin: false
 *   });
 *
 *   // Check response status
 *   expect(response.status()).toBe(200);
 * });
 * ```
 */
export class AuthApi extends ApiClient {
  /**
   * Creates a new AuthApi instance.
   *
   * @param {APIRequestContext} request - Playwright API request context
   * @example
   * ```typescript
   * import { test } from '@playwright/test';
   * import { AuthApi } from '@integrations';
   *
   * test('Create auth API instance', async ({ request }) => {
   *   const authApi = new AuthApi(request);
   *   // Use authApi for authentication operations
   * });
   * ```
   */
  constructor(request: APIRequestContext) {
    super(request);
  }

  /**
   * Authenticates a user with email and password.
   *
   * Sends a POST request to the login endpoint with user credentials.
   * Automatically handles HTTP errors and network issues through the base ApiClient.
   *
   * @param {Record<string, unknown>} requestBody - Login credentials and options
   * @param {boolean} throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns {Promise<APIResponse>} Promise resolving to the authentication response
   * @throws {Error} When authentication fails due to network issues or invalid credentials (when throwOnError is true)
   *
   * @example Valid login:
   * ```typescript
   * const response = await authApi.login({
   *   email: 'admin@company.com',
   *   password: 'admin123',
   *   forceLogin: true
   * });
   * console.log('Login status:', response.status()); // 200
   * ```
   *
   * @example Invalid credentials (testing scenario):
   * ```typescript
   * // For testing scenarios where you expect failures
   * const response = await authApi.login({
   *   email: 'wrong@email.com',
   *   password: 'wrongpassword'
   * }, false); // Won't throw on non-2xx status
   *
   * // Now you can assert on the response
   * expect(response.status()).toBe(403);
   * ```
   *
   * @example Production usage with error handling:
   * ```typescript
   * try {
   *   const response = await authApi.login({
   *     email: 'user@email.com',
   *     password: 'password'
   *   }); // Default throwOnError = true
   *   console.log('Login successful:', response.status());
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   * ```
   */
  async login(requestBody: Record<string, unknown>, throwOnError: boolean = true): Promise<APIResponse> {
    return this.post(
      ApiEndpoints.LOGIN,
      {
        data: requestBody,
      },
      throwOnError
    );
  }

  /**
   * Logs out the current user session.
   *
   * Note: Implementation pending - will be added when logout endpoint is available.
   *
   * @param {boolean} throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns {Promise<APIResponse>} Promise resolving to the logout response
   * @throws {Error} When logout fails due to network issues or server errors (when throwOnError is true)
   * @todo Implement when logout endpoint is added to ApiEndpoints
   *
   * @example
   * ```typescript
   * const response = await authApi.logout();
   * expect(response.status()).toBe(200);
   * ```
   */
  async logout(throwOnError: boolean = true): Promise<APIResponse> {
    // TODO: Implement when logout endpoint is available
    // return this.post(ApiEndpoints.LOGOUT, {}, throwOnError);
    throw new Error('Logout endpoint not yet implemented');
  }

  /**
   * Refreshes the current user's authentication token.
   *
   * Note: Implementation pending - will be added when refresh endpoint is available.
   *
   * @param {boolean} throwOnError - Whether to throw errors for non-2xx status codes (default: true)
   * @returns {Promise<APIResponse>} Promise resolving to the token refresh response
   * @throws {Error} When token refresh fails due to network issues or server errors (when throwOnError is true)
   * @todo Implement when token refresh endpoint is added to ApiEndpoints
   *
   * @example
   * ```typescript
   * const response = await authApi.refreshToken();
   * expect(response.status()).toBe(200);
   * ```
   */
  async refreshToken(throwOnError: boolean = true): Promise<APIResponse> {
    // TODO: Implement when token refresh endpoint is available
    // return this.post(ApiEndpoints.REFRESH_TOKEN, {}, throwOnError);
    throw new Error('Token refresh endpoint not yet implemented');
  }
}
