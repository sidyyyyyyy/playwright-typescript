// External library imports
import { z } from 'zod';

// Core framework imports
import { ColorScheme, ScreenshotMode, TestEnvironment, TraceMode, VideoMode } from '@core/enums';

/**
 * @fileoverview Configuration Schema - Zod validation schemas for Playwright configuration
 * @description Type-safe configuration validation using Zod schemas
 * @author Anand Sogalad
 */

/**
 * Playwright reporter configuration schema.
 * @description Validates reporter configuration supporting both simple and complex formats
 */
const reporterSchema = z.union([z.tuple([z.string()]), z.tuple([z.string(), z.record(z.any())])]);

/**
 * Playwright expect configuration schema.
 * @description Validates assertion timeout and screenshot comparison settings
 */
const expectSchema = z.object({
  timeout: z.number(),
  toHaveScreenshot: z.object({
    maxDiffPixels: z.number(),
  }),
  toMatchSnapshot: z.object({
    maxDiffPixelRatio: z.number(),
  }),
});

/**
 * Playwright use configuration schema.
 * @description Validates browser settings, recording options, and device configuration
 */
const useSchema = z.object({
  // URL Configuration
  baseURL: z.union([z.string(), z.undefined()]).optional(),

  // Browser Settings
  headless: z.boolean(),
  ignoreHTTPSErrors: z.boolean(),

  // Recording and Debugging
  screenshot: z.nativeEnum(ScreenshotMode),
  trace: z.nativeEnum(TraceMode),
  video: z.nativeEnum(VideoMode),
  recordHar: z.union([z.any(), z.undefined()]).optional(),
  recordVideo: z.union([z.any(), z.undefined()]).optional(),

  // Device and Viewport
  colorScheme: z.union([z.nativeEnum(ColorScheme), z.undefined()]).optional(),
  deviceScaleFactor: z.union([z.number(), z.undefined()]).optional(),
  hasTouch: z.union([z.boolean(), z.undefined()]).optional(),
  isMobile: z.union([z.boolean(), z.undefined()]).optional(),
  locale: z.string().optional(),

  // Location and Permissions
  geolocation: z
    .union([
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      }),
      z.undefined(),
    ])
    .optional(),
  permissions: z.union([z.array(z.string()), z.undefined()]).optional(),
  timezoneId: z.union([z.string(), z.undefined()]).optional(),

  // Authentication and Storage
  httpCredentials: z
    .union([
      z.object({
        username: z.string(),
        password: z.string(),
      }),
      z.undefined(),
    ])
    .optional(),
  storageState: z.union([z.string(), z.undefined()]).optional(),
  userAgent: z.union([z.string(), z.undefined()]).optional(),
});

/**
 * Playwright project configuration schema.
 * @description Validates individual project settings within the configuration
 */
const projectSchema = z.object({
  name: z.string(),
  use: z.record(z.any()),
});

/**
 * Complete Playwright configuration schema.
 * @description Validates the entire Playwright configuration structure
 * @note Matches base.config.ts structure and supports CI/Local extensions
 */
export const configSchema = z.object({
  // Test Configuration
  testDir: z.string(),
  testIgnore: z.union([z.string(), z.array(z.string()), z.undefined()]).optional(),
  testMatch: z.union([z.string(), z.array(z.string()), z.undefined()]).optional(),

  // Execution Configuration
  forbidOnly: z.boolean(),
  fullyParallel: z.boolean(),
  retries: z.number(),
  timeout: z.number(),
  workers: z.number(),

  // Global Setup and Teardown
  globalSetup: z.union([z.string(), z.undefined()]).optional(),
  globalTeardown: z.union([z.string(), z.undefined()]).optional(),

  // Output Configuration
  outputDir: z.string(),
  reporter: z.array(reporterSchema),

  // Server Configuration
  webServer: z.union([z.any(), z.undefined()]).optional(),

  // Assertion Configuration
  expect: expectSchema,

  // Browser Configuration
  use: useSchema,

  // Project Configuration
  projects: z.array(projectSchema),

  // Environment Configuration (used by CI/Local configs)
  environment: z.nativeEnum(TestEnvironment).optional(),
});

/**
 * Playwright configuration type.
 * @description Type inferred from the complete configuration schema
 */
export type PlaywrightConfig = z.infer<typeof configSchema>;

/**
 * Validate configuration against schema.
 * @description Validates configuration object and returns typed result
 * @param config - Configuration object to validate
 * @returns Validated and typed configuration object
 * @throws {z.ZodError} If validation fails
 */
export function validateConfig(config: unknown): PlaywrightConfig {
  return configSchema.parse(config);
}
