/**
 * @fileoverview Browser Enums - Browser names, devices, and configurations
 * @description Browser-related enums for test execution and device simulation
 * @author Anand Sogalad
 */

/**
 * Browser names for test execution.
 * @description Supported browsers for automated testing
 * @example const browser = BrowserName.CHROME;
 */
export enum BrowserName {
  CHROMIUM = 'Chromium',
  CHROME = 'Google Chrome',
  EDGE = 'Microsoft Edge',
  FIREFOX = 'Mozilla Firefox',
  SAFARI = 'Safari',
}

/**
 * Device configurations for browser testing.
 * @description Browser and device combinations for responsive testing
 * @example const device = BrowserDevice.MOBILE_CHROME;
 */
export enum BrowserDevice {
  DESKTOP_CHROME = 'Desktop Chrome',
  DESKTOP_FIREFOX = 'Desktop Firefox',
  DESKTOP_EDGE = 'Desktop Edge',
  DESKTOP_SAFARI = 'Desktop Safari',
  MOBILE_CHROME = 'Mobile Chrome',
  MOBILE_SAFARI = 'Mobile Safari',
}

/**
 * Browser channels for Playwright.
 * @description Browser channel identifiers for Playwright configuration
 * @example const channel = BrowserChannel.CHROME;
 */
export enum BrowserChannel {
  CHROME = 'chrome',
  EDGE = 'msedge',
  FIREFOX = 'firefox',
  SAFARI = 'webkit',
}

/**
 * Color schemes for browser testing.
 * @description Visual themes for testing dark/light mode functionality
 * @example const scheme = ColorScheme.DARK;
 */
export enum ColorScheme {
  LIGHT = 'light',
  DARK = 'dark',
}
