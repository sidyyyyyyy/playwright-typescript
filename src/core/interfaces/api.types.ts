// External library imports
import type { APIResponse } from '@playwright/test';
import type { ZodSchema } from 'zod';

// Core framework imports
import type { ApiMethod, AuthType } from '@core/enums';

/**
 * @fileoverview API Types - Request, response, and authentication interfaces
 * @description Comprehensive API interaction type definitions for testing
 * @author Anand Sogalad
 */

/**
 * Authentication configuration for API requests.
 * @description Configuration object for different authentication methods
 * @example const auth: ApiAuthConfig = { type: AuthType.BEARER, token: 'jwt-token' };
 */
export interface ApiAuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  inHeader?: boolean;
  custom?: Record<string, any>;
}

/**
 * API client configuration options.
 * @description Settings for configuring the API client behavior
 * @example const config: ApiClientConfig = { baseURL: 'https://api.example.com', timeoutMs: 5000 };
 */
export interface ApiClientConfig {
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  auth?: ApiAuthConfig;
  logRequests?: boolean;
  logResponses?: boolean;
  baseURL?: string;
}

/**
 * Options for making an API request.
 * @description Request-specific options that override client defaults
 * @example const options: ApiRequestOptions = { headers: { 'Content-Type': 'application/json' } };
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  body?: any;
  timeoutMs?: number;
  authOverride?: ApiAuthConfig;
  failOnStatusCode?: boolean;
  validateSchema?: boolean;
  responseSchema?: ZodSchema;
  pagination?: ApiPaginationOptions;
}

/**
 * Definition of an API endpoint.
 * @typedef ApiEndpointDefinition
 */
export interface ApiEndpointDefinition<Req = any, Res = any> {
  method: ApiMethod;
  path: string;
  description?: string;
  requestSchema?: any;
  responseSchema?: any;
  defaultParams?: Record<string, any>;
  defaultHeaders?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Standardized API response structure.
 * @typedef ApiResponse
 */
export interface ApiResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  responseTimeMs: number;
  raw: APIResponse;
  error?: ApiError;
  schemaValidation?: SchemaValidationResult;
}

/**
 * Error details for API responses.
 * @typedef ApiError
 */
export interface ApiError {
  message: string;
  status?: number;
  details?: any;
  raw?: APIResponse;
}

/**
 * Result of schema validation for API responses.
 * @typedef SchemaValidationResult
 */
export interface SchemaValidationResult {
  valid: boolean;
  errors?: string[];
  schema?: any;
}

/**
 * Pagination options for API requests.
 * @typedef ApiPaginationOptions
 */
export interface ApiPaginationOptions {
  pageParam?: string;
  pageSizeParam?: string;
  page?: number;
  pageSize?: number;
  maxPages?: number;
  stopCondition?: (response: ApiResponse<any>, page: number) => boolean;
}

/**
 * Map of endpoint names to endpoint definitions.
 * @typedef ApiEndpointMap
 */
export type ApiEndpointMap = Record<string, ApiEndpointDefinition<any, any>>;

/**
 * Extracts the request type from an endpoint definition.
 */
export type ExtractRequestType<T extends ApiEndpointDefinition<any, any>> =
  T extends ApiEndpointDefinition<infer Req, any> ? Req : never;

/**
 * Extracts the response type from an endpoint definition.
 */
export type ExtractResponseType<T extends ApiEndpointDefinition<any, any>> =
  T extends ApiEndpointDefinition<any, infer Res> ? Res : never;

/**
 * Login request payload structure.
 * @description Payload structure for user authentication requests
 * @example const loginData: LoginRequest = { email: 'user@example.com', password: 'password', forceLogin: false };
 */
export interface LoginRequest {
  email: string;
  password: string;
  forceLogin: boolean;
}

/**
 * Login response structure.
 * @typedef LoginResponse
 */
export interface LoginResponse {
  tokenId: string;
  nickName: string;
  admin: string;
  emailId: string;
  eaAssociations: any[];
  tokenRenewThreshold: string;
  freetrial: boolean;
  tokenLeaseTime: string;
  respCode: string;
  status: string;
}
