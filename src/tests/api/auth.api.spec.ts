/**
 * @fileoverview Authentication API Test Suite - Comprehensive testing for authentication endpoints
 * @description Complete test coverage for login API functionality including positive scenarios,
 * negative scenarios, security validation (SQL injection, XSS), and error handling. Tests use
 * data-driven approach with various credential combinations and security attack patterns.
 * @author Anand Sogalad
 *
 * @example Test execution:
 * ```bash
 * # Run authentication API tests only
 * npm run test:api -- --grep "AuthApi Login"
 *
 * # Run specific test scenarios
 * npm run test:api -- --grep "should succeed"
 * npm run test:api -- --grep "should fail"
 * ```
 */

// External library imports
import { test } from '@playwright/test';

// Core framework imports
import { AuthApi } from '@integrations/auth.api';
import { ushurTestLoginCredentials } from '@data/ushurLoginTestData';
import { ApiResponseAssertionsUtils } from '@utils/browser';

/**
 * @description Comprehensive test suite for authentication API functionality with data-driven approach.
 *
 * This test suite covers:
 * - Valid credential authentication scenarios
 * - Invalid credential handling and error responses
 * - Security validation (SQL injection, XSS attack patterns)
 * - Empty/missing credential validation
 * - Response status code verification
 * - Response payload validation
 *
 * @testTags @api @authentication @security @data-driven
 *
 * @example Test categories covered:
 * - @positive: Valid login scenarios that should succeed
 * - @negative: Invalid login scenarios that should fail gracefully
 * - @security: SQL injection and XSS attack pattern validation
 * - @validation: Response structure and status code verification
 */
test.describe('AuthApi Login (data-driven)', () => {
  /** API response assertion utilities for comprehensive validation */
  let assert: ApiResponseAssertionsUtils;

  /**
   * @description Test setup - Initializes assertion utilities for API response validation.
   *
   * Executed once before all tests to ensure consistent assertion capabilities:
   * 1. Creates ApiResponseAssertionsUtils instance for response validation
   * 2. Provides reusable assertion methods for all test scenarios
   */
  test.beforeAll(async () => {
    assert = new ApiResponseAssertionsUtils();
  });

  /**
   * @description Parameterized authentication tests covering positive, negative, and security scenarios.
   *
   * These tests validate:
   * - Valid credentials → 200 status with successful authentication
   * - Invalid credentials → 200 status with failure response payload
   * - Security attacks (SQL injection, XSS) → 403 status (security protection)
   * - Empty/missing credentials → Appropriate error handling
   *
   * Test approach:
   * - Uses throwOnError: false to handle all response scenarios without exceptions
   * - Validates response status codes based on credential type and security patterns
   * - Verifies response payload structure for failed authentication attempts
   * - Logs response details for debugging and monitoring
   *
   * @testTags @authentication @security @data-driven @positive @negative
   * @testType API Integration Testing
   * @testPriority Critical
   */
  ushurTestLoginCredentials.forEach((cred, idx) => {
    test(`login #${idx + 1} as ${cred.email || '[empty email]'} (${cred.loginSuccess ? 'should succeed' : 'should fail'})`, async ({
      request,
    }) => {
      const authApi = new AuthApi(request);

      // Use throwOnError: false to handle all response types without exceptions
      const response = await authApi.login(
        {
          email: cred.email,
          password: cred.password,
          forceLogin: false,
        },
        false
      ); // Key fix: Don't throw on non-2xx status codes

      // Log the response for debugging and monitoring
      console.log(`Test ${idx + 1}: ${cred.email} - Status: ${response.status()}, URL: ${response.url()}`);

      if (cred.loginSuccess) {
        // Valid credentials should return 200 with successful authentication
        assert.assertResponseStatusToBe(response, 200);
      } else if (
        cred.description?.toLowerCase().includes('sql injection') ||
        cred.description?.toLowerCase().includes('xss')
      ) {
        // Security attacks should be blocked with 403 Forbidden
        assert.assertResponseStatusToBe(response, 403);
      } else {
        // Invalid credentials should return 200 with failure status in payload
        assert.assertResponseStatusToBe(response, 200);
        await assert.assertResponseJsonToHaveProperty(response, 'status', 'failure');
      }
    });
  });
});
