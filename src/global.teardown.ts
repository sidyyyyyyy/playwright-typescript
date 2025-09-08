// Framework utility imports
import { UserPool } from '@utils/redis/user.pool';
import { redisClient } from '@utils/redis';

/**
 * @fileoverview Global Teardown - Test run cleanup and resource management
 * @description Cleans up test environment and closes Redis connections after test execution
 * @author Anand Sogalad
 */

/**
 * Global teardown for test run.
 * @description Cleans up user pool and closes Redis connections
 * @returns Promise that resolves when teardown is complete
 */
async function globalTeardown() {
  console.log('[Global Teardown] Starting test run cleanup...');

  try {
    // Cleanup test run using static method
    await UserPool.cleanupTestRun();

    // Disconnect Redis client
    await redisClient.disconnect();
    console.log('[Global Teardown] Redis connection closed and test run cleanup completed');
  } catch (error) {
    console.error('[Global Teardown] Error during cleanup:', error);
  }
}

export default globalTeardown;
