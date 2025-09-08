/**
 * @fileoverview Test Enums - Test priority, tags, and types for organization
 * @description Test classification and organization enums for execution planning
 * @author Anand Sogalad
 */

/**
 * Test priority levels for execution planning.
 * @description Priority levels for organizing and scheduling test execution
 * @example const priority = TestPriority.CRITICAL;
 */
export enum TestPriority {
  BLOCKER = 'blocker',
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Test tags for categorization and filtering.
 * @description Tags used to organize and filter tests by type and scope
 * @example const tag = TestTag.SMOKE;
 */
export enum TestTag {
  ACCESSIBILITY = 'accessibility',
  API = 'api',
  BOUNDARY = 'boundary',
  COMPONENT = 'component',
  CUSTOMER = 'customer',
  E2E = 'e2e',
  FUNCTIONAL = 'functional',
  INTEGRATION = 'integration',
  LOAD = 'load',
  NEGATIVE = 'negative',
  PERFORMANCE = 'performance',
  POSITIVE = 'positive',
  REGRESSION = 'regression',
  SANITY = 'sanity',
  SECURITY = 'security',
  SMOKE = 'smoke',
  UI = 'ui',
}

/**
 * Test types for classification and reporting.
 * @description Categories of tests for organization and execution strategies
 * @example const type = TestType.E2E;
 */
export enum TestType {
  ACCESSIBILITY = 'accessibility',
  API = 'api',
  COMPONENT = 'component',
  CUSTOMER = 'customer',
  E2E = 'e2e',
  FUNCTIONAL = 'functional',
  INTEGRATION = 'integration',
  LOAD = 'load',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  UI = 'ui',
}
