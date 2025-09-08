/**
 * @fileoverview Test Constants - Timeout values and test configuration
 * @description Test timing and user pool configuration constants
 * @author Anand Sogalad
 */

/**
 * Timeout values for tests and expectations.
 * @description Consistent timeout configurations across the framework
 */
export const TimeoutValues = {
  EXPECT_TIMEOUT: 5000,
  TEST_TIMEOUT: 60000,
} as const;

/**
 * User pool configuration.
 * @description Settings for Redis-based user pool management
 */
export const UserPoolConfig = {
  DEFAULT_TTL: 3600, // 1 hour in seconds
  INITIAL_SIZE: 200,
  MAX_SIZE: 1000,
} as const;

/**
 * Timeout key type.
 * @description Type representing timeout configuration keys
 */
export type TimeoutKey = keyof typeof TimeoutValues;

/**
 * Timeout value type.
 * @description Type representing timeout values
 */
export type TimeoutValue = (typeof TimeoutValues)[TimeoutKey];

/**
 * User pool configuration key type.
 * @description Type representing user pool configuration keys
 */
export type UserPoolConfigKey = keyof typeof UserPoolConfig;
