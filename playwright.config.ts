// External library imports
import { defineConfig } from '@playwright/test';

// Core framework imports
import { getCurrentConfig } from './configs/index';

/**
 * @fileoverview Playwright Configuration - Main configuration entry point
 * @description Configures Playwright test runner with centralized configuration management
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * // Configuration is automatically loaded based on environment
 * // Use playwright.config.ts for default behavior
 * npx playwright test
 * ```
 */

/**
 * Enterprise Test Framework Configuration.
 * @description Uses centralized configuration management system with environment-specific overrides.
 * The entire config object is passed to Playwright. Extra keys are ignored by Playwright,
 * which allows for enterprise extensibility and avoids manual mapping.
 *
 * @see https://playwright.dev/docs/test-configuration
 * @see https://playwright.dev/docs/test-cli
 * @see https://playwright.dev/docs/test-reporters
 */

// Get current configuration
export const config = getCurrentConfig();

export default defineConfig(config);
