// External library imports
import { devices } from '@playwright/test';

// Core framework imports
import { BooleanValues, DefaultViewports, FilePaths, TimeoutValues, UndefinedValue } from '@core/constants';
import { BrowserDevice, BrowserName, ReportFormat, ScreenshotMode, TraceMode, VideoMode } from '@core/enums';

/**
 * @fileoverview Base Configuration - Common settings for all test environments
 * @description Foundation configuration inherited by all environment-specific configs
 * @author Anand Sogalad
 */

/**
 * Base configuration for all environments.
 * @description Common settings shared across CI, local, and other environments
 */
export const baseConfig = {
  // Test Configuration
  testDir: FilePaths.TESTS_DIR,
  testIgnore: UndefinedValue,
  testMatch: UndefinedValue,

  // Execution Configuration
  forbidOnly: BooleanValues.TRUE,
  fullyParallel: BooleanValues.TRUE,
  retries: 1,
  timeout: TimeoutValues.TEST_TIMEOUT,
  workers: 500,

  // Global Setup and Teardown
  globalSetup: FilePaths.GLOBAL_SETUP_FILE,
  globalTeardown: FilePaths.GLOBAL_TEARDOWN_FILE,

  // Output Configuration
  outputDir: `${FilePaths.REPORTS_DIR}/test-results`,
  reporter: [
    [ReportFormat.LIST, { printSteps: BooleanValues.FALSE }],
    [
      ReportFormat.HTML,
      { outputFolder: `${FilePaths.REPORTS_DIR}/html`, open: 'never', title: 'Ushur Automation Test Report' },
    ],
    [ReportFormat.JSON, { outputFile: `${FilePaths.REPORTS_DIR}/json/results.json` }],
  ],

  // Server Configuration
  webServer: UndefinedValue,

  // Assertion Configuration
  expect: {
    timeout: TimeoutValues.EXPECT_TIMEOUT,
    toHaveScreenshot: {
      maxDiffPixels: 10,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.1,
    },
  },

  // Browser Configuration
  use: {
    // URL Configuration
    baseURL: UndefinedValue,

    // Browser Settings
    headless: BooleanValues.TRUE,
    ignoreHTTPSErrors: BooleanValues.TRUE,

    // Recording and Debugging
    screenshot: ScreenshotMode.ONLY_ON_FAILURE,
    trace: TraceMode.RETAIN_ON_FAILURE,
    video: VideoMode.RETAIN_ON_FAILURE,
    recordHar: UndefinedValue,
    recordVideo: UndefinedValue,

    // Device and Viewport
    colorScheme: UndefinedValue,
    deviceScaleFactor: UndefinedValue,
    hasTouch: UndefinedValue,
    isMobile: UndefinedValue,
    locale: 'en-US',

    // Location and Permissions
    geolocation: UndefinedValue,
    permissions: UndefinedValue,
    timezoneId: UndefinedValue,

    // Authentication and Storage
    httpCredentials: UndefinedValue,
    storageState: UndefinedValue,
    userAgent: UndefinedValue,
  },

  // Project Configuration
  projects: [
    {
      name: BrowserName.CHROMIUM,
      use: { ...devices[BrowserDevice.DESKTOP_CHROME], viewport: DefaultViewports.DESKTOP },
    },
  ],
};
