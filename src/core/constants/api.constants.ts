/**
 * @fileoverview API Constants - Default headers and endpoints for API testing
 * @description Centralized API configuration for consistent request handling
 * @author Anand Sogalad
 */

/**
 * Default headers for API requests.
 * @description Base headers applied to all API calls unless overridden
 */
export const ApiDefaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

/**
 * Supported API endpoints.
 * @description All API endpoints used throughout the framework
 */
export const ApiEndpoints = {
  LOGIN: '/api/rest/v2/accounts/login',
} as const;

/**
 * API header key type.
 * @description Type representing valid API header keys
 */
export type ApiHeaderKey = keyof typeof ApiDefaultHeaders;

/**
 * API header value type.
 * @description Type representing valid API header values
 */
export type ApiHeaderValue = (typeof ApiDefaultHeaders)[ApiHeaderKey];

/**
 * API endpoint type.
 * @description Type representing supported API endpoints
 */
export type ApiEndpoint = (typeof ApiEndpoints)[keyof typeof ApiEndpoints];
