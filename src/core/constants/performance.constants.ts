// Core framework imports
import { PerformanceMetric } from '@core/enums';

/**
 * @fileoverview Performance Constants - Performance metric groups and categorization
 * @description Organizes performance metrics into Web Vitals and other categories
 * @author Anand Sogalad
 */

/**
 * Performance metric groups.
 * @description Categorizes performance metrics into Web Vitals and other metrics
 */
export const PerformanceMetricGroups = {
  NON_WEB_VITALS: [PerformanceMetric.SPEED_INDEX, PerformanceMetric.TIME_TO_INTERACTIVE],
  WEB_VITALS: [
    PerformanceMetric.CUMULATIVE_LAYOUT_SHIFT,
    PerformanceMetric.FIRST_CONTENTFUL_PAINT,
    PerformanceMetric.FIRST_INPUT_DELAY,
    PerformanceMetric.LARGEST_CONTENTFUL_PAINT,
  ],
} as const;

/**
 * Performance metric group type.
 * @description Type representing performance metric groups
 */
export type PerformanceMetricGroup = (typeof PerformanceMetricGroups)[keyof typeof PerformanceMetricGroups];
