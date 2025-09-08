/**
 * @fileoverview Message Constants - Standardized error and success messages
 * @description Consistent messaging for test results and framework operations
 * @author Anand Sogalad
 */

/**
 * Common error messages.
 * @description Standardized error messages for general test failures
 */
export const CommonErrorMessages = {
  TEST_FAILED: 'Test execution failed',
  SETUP_FAILED: 'Test setup failed',
  CLEANUP_FAILED: 'Test cleanup failed',
  REPORT_GENERATION_FAILED: 'Failed to generate test report',
} as const;

/**
 * Common error message type.
 * @description Type representing common error messages
 */
export type CommonErrorMessage = (typeof CommonErrorMessages)[keyof typeof CommonErrorMessages];

/**
 * UI error messages.
 * @description Error messages specific to user interface testing
 */
export const UIErrorMessages = {
  ELEMENT_NOT_FOUND: 'UI element not found',
  TIMEOUT_EXCEEDED: 'Action timed out',
  ASSERTION_FAILED: 'UI assertion failed',
  NETWORK_ERROR: 'Network error occurred during UI interaction',
  AUTHENTICATION_FAILED: 'Authentication failed on UI',
  PERMISSION_DENIED: 'Permission denied on UI action',
  INVALID_CONFIGURATION: 'Invalid UI configuration',
  TEST_DATA_NOT_FOUND: 'Required test data not found',
} as const;

/**
 * UI error message type.
 * @description Type representing UI-specific error messages
 */
export type UIErrorMessage = (typeof UIErrorMessages)[keyof typeof UIErrorMessages];

/**
 * API error messages.
 * @description Error messages specific to API testing and HTTP responses
 */
export const APIErrorMessages = {
  INVALID_REQUEST: 'Invalid API request',
  UNAUTHORIZED: 'Unauthorized API access',
  FORBIDDEN: 'Forbidden API operation',
  NOT_FOUND: 'API resource not found',
  METHOD_NOT_ALLOWED: 'HTTP method not allowed',
  INTERNAL_SERVER_ERROR: 'API returned internal server error',
} as const;

/**
 * API error message type.
 * @description Type representing API-specific error messages
 */
export type APIErrorMessage = (typeof APIErrorMessages)[keyof typeof APIErrorMessages];

/**
 * Accessibility error messages used throughout the framework.
 * Contains error messages specific to accessibility testing and violations.
 */
export const AccessibilityErrorMessages = {
  VIOLATION_FOUND: 'Accessibility violations detected',
  INSUFFICIENT_CONTRAST: 'Insufficient color contrast found',
  MISSING_ALT_TEXT: 'Image is missing alt text',
  MISSING_LABEL: 'Form element is missing a label',
  KEYBOARD_NAVIGATION_FAILED: 'Keyboard navigation is not functioning correctly',
} as const;

/**
 * Accessibility error message type used throughout the framework.
 */
export type AccessibilityErrorMessage = (typeof AccessibilityErrorMessages)[keyof typeof AccessibilityErrorMessages];

/**
 * Common success messages used throughout the framework.
 * Provides standardized success messages for general test completions.
 */
export const CommonSuccessMessages = {
  TEST_PASSED: 'Test passed successfully',
  SETUP_COMPLETED: 'Test setup completed successfully',
  CLEANUP_COMPLETED: 'Test cleanup completed successfully',
  REPORT_GENERATED: 'Test report generated successfully',
} as const;

/**
 * Common success message type used throughout the framework.
 */
export type CommonSuccessMessage = (typeof CommonSuccessMessages)[keyof typeof CommonSuccessMessages];

/**
 * UI success messages used throughout the framework.
 * Contains success messages specific to user interface testing.
 */
export const UISuccessMessages = {
  TEST_PASSED: 'UI test passed successfully',
  SETUP_COMPLETED: 'UI setup completed successfully',
  CLEANUP_COMPLETED: 'UI cleanup completed successfully',
  REPORT_GENERATED: 'UI report generated successfully',
} as const;

/**
 * UI success message type used throughout the framework.
 */
export type UISuccessMessage = (typeof UISuccessMessages)[keyof typeof UISuccessMessages];

/**
 * API success messages used throughout the framework.
 * Contains success messages specific to API testing and HTTP responses.
 */
export const APISuccessMessages = {
  TEST_PASSED: 'API test passed successfully',
  SETUP_COMPLETED: 'API setup completed successfully',
  CLEANUP_COMPLETED: 'API cleanup completed successfully',
  REPORT_GENERATED: 'API report generated successfully',
} as const;

/**
 * API success message type used throughout the framework.
 */
export type APISuccessMessage = (typeof APISuccessMessages)[keyof typeof APISuccessMessages];

/**
 * Accessibility success messages used throughout the framework.
 * Contains success messages specific to accessibility testing and compliance.
 */
export const AccessibilitySuccessMessages = {
  TEST_PASSED: 'Accessibility test passed successfully',
  NO_VIOLATIONS: 'No accessibility violations detected',
  ALL_ELEMENTS_LABELED: 'All form elements have associated labels',
  SUFFICIENT_CONTRAST: 'All visual elements meet contrast standards',
  KEYBOARD_NAVIGATION_SUCCESS: 'Keyboard navigation functions correctly',
} as const;

/**
 * Accessibility success message type used throughout the framework.
 */
export type AccessibilitySuccessMessage =
  (typeof AccessibilitySuccessMessages)[keyof typeof AccessibilitySuccessMessages];
