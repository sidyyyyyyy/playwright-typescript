/**
 * @fileoverview Playwright Enums - Report formats and recording modes
 * @description Playwright configuration enums for reporting and recording
 * @author Anand Sogalad
 */

/**
 * Supported report formats.
 * @description Report formats for reporting framework
 */
export enum ReportFormat {
  LIST = 'list',
  LINE = 'line',
  DOT = 'dot',
  HTML = 'html',
  JSON = 'json',
  JUNIT = 'junit',
  BLOB = 'blob',
  GITHUB = 'github',
  ALLURE = 'allure',
}

/**
 * Screenshot modes.
 * @description Screenshot modes for reporting framework
 */
export enum ScreenshotMode {
  OFF = 'off',
  ON = 'on',
  ONLY_ON_FAILURE = 'only-on-failure',
  ON_FIRST_FAILURE = 'on-first-failure',
}

/**
 * Trace modes.
 * @description Trace modes for reporting framework
 */
export enum TraceMode {
  OFF = 'off',
  ON = 'on',
  ON_FIRST_RETRY = 'on-first-retry',
  ON_ALL_RETRIES = 'on-all-retries',
  RETAIN_ON_FAILURE = 'retain-on-failure',
  RETAIN_ON_FIRST_FAILURE = 'retain-on-first-failure',
}

/**
 * Video recording modes.
 * @description Video modes for reporting framework
 */
export enum VideoMode {
  OFF = 'off',
  ON = 'on',
  RETAIN_ON_FAILURE = 'retain-on-failure',
  ON_FIRST_RETRY = 'on-first-retry',
}
