/**
 * @fileoverview API Enums - HTTP methods and authentication types for API testing
 * @description Standard enums for API client operations and authentication
 * @author Anand Sogalad
 */

/**
 * HTTP methods for API testing.
 * @description Standard HTTP methods supported by the API client
 * @example const method = ApiMethod.POST;
 */
export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  FETCH = 'FETCH',
}

/**
 * Authentication types for API requests.
 * @description Supported authentication methods for API testing
 * @example const auth = AuthType.BEARER;
 */
export enum AuthType {
  NONE = 'none',
  BEARER = 'bearer',
  BASIC = 'basic',
  API_KEY = 'apiKey',
  CUSTOM = 'custom',
}
