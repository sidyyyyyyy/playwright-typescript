/**
 * @fileoverview Integration API Services - Centralized API integration layer
 * @description Provides a unified interface for all API service integrations
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { AuthApi } from '@integrations';
 * import { test } from '@playwright/test';
 *
 * test('Login API test', async ({ request }) => {
 *   const authApi = new AuthApi(request);
 *   const response = await authApi.login({ email: 'user@example.com', password: 'password' });
 * });
 * ```
 */

// Authentication API Services
export { AuthApi } from './auth.api';

// Organization API Services
// TODO: Add UserApi, RoleApi, PermissionApi when implemented

// Data Management API Services
// TODO: Add DataApi, FileApi, ReportApi when implemented

// System API Services
// TODO: Add HealthApi, ConfigApi, LogApi when implemented
