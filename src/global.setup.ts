// Framework utility imports
import { UserPool } from '@utils/redis/user.pool';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

/**
 * @fileoverview Global Setup - Test run initialization and user pool setup
 * @description Initializes the test environment and user pool for parallel test execution
 * @author Anand Sogalad
 */

/**
 * Global setup for test run.
 * @description Initializes UserPool and prepares the test environment for execution
 * @returns Promise that resolves when setup is complete
 */
async function globalSetup() {
  console.log('[Global Setup] Starting test run initialization...');

  try {
    // Initialize test run with users using static method
    await UserPool.initializeTestRun();

    // Get initial stats using static method
    const stats = await UserPool.getStats();

    console.log(`[Global Setup] Initial pool: ${stats.available} users available and test run initialized`);
  } catch (error) {
    console.error('[Global Setup] Failed to initialize test run:', error);
    throw error;
  }
}

export default globalSetup;
