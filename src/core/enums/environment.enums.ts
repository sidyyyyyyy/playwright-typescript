/**
 * @fileoverview Environment Enums - Test environments and environment variables
 * @description Environment configuration for test execution contexts
 * @author Anand Sogalad
 */

/**
 * Supported test environments.
 * @description Test execution environments for different contexts
 */
export enum TestEnvironment {
  CI = 'ci',
  LOCAL = 'local',
}

/**
 * Environment variables.
 * @description Environment variables used throughout the framework
 */
export enum EnvironmentVariable {
  NODE_ENV = 'NODE_ENV',
  TEST_ENV = 'TEST_ENV',
}
