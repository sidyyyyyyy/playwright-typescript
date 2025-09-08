/**
 * @fileoverview Accessibility Enums - Standards, impact levels, and categorization
 * @description Accessibility testing enums for WCAG compliance and violation categorization
 * @author Anand Sogalad
 */

/**
 * Accessibility standards for compliance testing.
 * @description Supported WCAG standards for automated accessibility checks
 * @example const standard = AccessibilityStandard.WCAG2AA;
 */
export enum AccessibilityStandard {
  WCAG2A = 'wcag2a',
  WCAG2AA = 'wcag2aa',
  WCAG2AAA = 'wcag2aaa',
  WCAG21AA = 'wcag21aa',
}

/**
 * Severity levels for accessibility violations.
 * @description Impact levels used to categorize accessibility issues
 * @example const level = AccessibilityImpactLevel.CRITICAL;
 */
export enum AccessibilityImpactLevel {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SERIOUS = 'serious',
  CRITICAL = 'critical',
}

/**
 * Tags for categorizing accessibility rules.
 * @description Rule categories for organizing accessibility checks
 * @example const tag = AccessibilityTag.WCAG2AA;
 */
export enum AccessibilityTag {
  WCAG2A = 'wcag2a',
  WCAG2AA = 'wcag2aa',
  WCAG21AA = 'wcag21aa',
  BEST_PRACTICE = 'best-practice',
}
