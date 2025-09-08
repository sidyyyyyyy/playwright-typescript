/**
 * @fileoverview Performance Enums - Performance metrics, thresholds, and labels
 * @description Performance testing configuration and measurement enums
 * @author Anand Sogalad
 */

/**
 * Supported performance metrics.
 * @description Performance metrics for performance testing
 */
export enum PerformanceMetric {
  CUMULATIVE_LAYOUT_SHIFT = 'cumulative-layout-shift',
  FIRST_CONTENTFUL_PAINT = 'first-contentful-paint',
  FIRST_INPUT_DELAY = 'first-input-delay',
  LARGEST_CONTENTFUL_PAINT = 'largest-contentful-paint',
  SPEED_INDEX = 'speed-index',
  TIME_TO_INTERACTIVE = 'interactive',
}

/**
 * Performance thresholds.
 * @description Performance thresholds for performance testing
 */
export enum PerformanceThreshold {
  CUMULATIVE_LAYOUT_SHIFT = 0.1,
  FIRST_CONTENTFUL_PAINT = 2000,
  FIRST_INPUT_DELAY = 100,
  LARGEST_CONTENTFUL_PAINT = 2500,
  SPEED_INDEX = 3000,
  TIME_TO_INTERACTIVE = 5000,
}

/**
 * Performance metric labels.
 * @description Performance metric labels for performance testing
 */
export enum PerformanceMetricLabel {
  CUMULATIVE_LAYOUT_SHIFT = 'Cumulative Layout Shift (CLS)',
  FIRST_CONTENTFUL_PAINT = 'First Contentful Paint (FCP)',
  FIRST_INPUT_DELAY = 'First Input Delay (FID)',
  LARGEST_CONTENTFUL_PAINT = 'Largest Contentful Paint (LCP)',
  SPEED_INDEX = 'Speed Index',
  TIME_TO_INTERACTIVE = 'Time to Interactive (TTI)',
}

/**
 * Performance metric units.
 * @description Performance metric units for performance testing
 */
export enum PerformanceMetricUnit {
  CUMULATIVE_LAYOUT_SHIFT = 'score',
  FIRST_CONTENTFUL_PAINT = 'ms',
  FIRST_INPUT_DELAY = 'ms',
  LARGEST_CONTENTFUL_PAINT = 'ms',
  SPEED_INDEX = 'ms',
  TIME_TO_INTERACTIVE = 'ms',
}
