// External library imports
import { config } from '../../../playwright.config';

// Core framework imports
import type { UserCredential } from '@core/interfaces';
import { UserPoolConfig } from '@core/constants';

// Utils imports
import { redisClient } from '@utils/redis';
import type { RedisClient } from '@utils/redis';

/**
 * @fileoverview User Pool - Redis-based user management for parallel test execution
 * @description Manages test user allocation and cleanup using Redis for concurrent test safety
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { userPool } from '@utils/redis';
 *
 * // Initialize user pool
 * await userPool.initializeTestRun(50);
 *
 * // Get a user for testing
 * const user = await userPool.getUser();
 *
 * // Return user when done
 * await userPool.returnUser(user);
 * ```
 */

/**
 * Singleton user pool for managing test users across parallel test execution.
 *
 * Provides comprehensive user management capabilities:
 * - Redis-based user allocation for parallel safety
 * - Automatic pool initialization and cleanup
 * - User generation and management
 * - Pool statistics and monitoring
 * - Environment-specific user pools
 *
 * @class UserPool
 */
export class UserPool {
  private static instance: UserPool | null = null;
  private redisClient: RedisClient;
  private testRunKey: string | undefined = undefined;
  private baseURL: string | undefined = undefined;
  private initialUserCount: number = 0;

  private constructor() {
    // Don't access config in constructor - defer until needed
    this.redisClient = redisClient;
  }

  /**
   * Get singleton instance.
   * @description Returns the single UserPool instance, creating it if necessary
   * @returns The UserPool singleton instance
   */
  public static getInstance(): UserPool {
    if (!UserPool.instance) {
      UserPool.instance = new UserPool();
    }
    return UserPool.instance;
  }

  /**
   * Get the baseURL from environment variable.
   * @description Lazy loading of baseURL from environment variables
   * @returns The baseURL from environment
   * @private
   */
  private getBaseURL(): string {
    if (!this.baseURL) {
      this.baseURL = process.env.BASE_URL;
      
      if (!this.baseURL) {
        throw new Error('BASE_URL environment variable is not set. Please check your .env file.');
      }
    }
    return this.baseURL;
  }

  /**
   * Get the test run key, creating it if necessary.
   * @description Lazy initialization of test run key
   * @returns The test run key
   * @private
   */
  private getTestRunKey(): string {
    if (!this.testRunKey) {
      const baseURL = this.getBaseURL();
      this.testRunKey = `users:${baseURL.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    }
    return this.testRunKey;
  }

  /**
   * Check if pool exists.
   * @description Verifies pool existence and returns metadata about user count
   * @returns Promise resolving to pool existence status and user count
   * @private
   */
  private async getPoolMetadata(): Promise<{ exists: boolean; userCount: number }> {
    if (!(await this.redisClient.keyExists(this.getTestRunKey()))) {
      return { exists: false, userCount: 0 };
    }

    const userCount = await this.redisClient.getLength(this.getTestRunKey());
    return { exists: true, userCount };
  }

  /**
   * Initialize test run with baseURL-based key.
   * @description Sets up user pool for the current test environment with specified user count
   * @param userCount - Number of users to create in the pool (defaults to configured initial size)
   */
  public async initializeTestRun(userCount: number = UserPoolConfig.INITIAL_SIZE): Promise<void> {
    // Check if pool already exists
    const metadata = await this.getPoolMetadata();

    // If pool exists and has users, return the key
    if (metadata.exists && metadata.userCount > 0) {
      console.log(`[UserPool - initializeTestRun] Using existing User Pool: ${metadata.userCount} users available`);
      // Store the initial user count
      this.initialUserCount = metadata.userCount;
      return;
    }

    // If pool exists but is empty, destroy it
    if (metadata.exists && metadata.userCount === 0) {
      console.log(`[UserPool - initializeTestRun] User Pool exists but empty, recreating fresh pool`);
      await this.redisClient.destroyKey(this.getTestRunKey());
    }

    // Create fresh pool
    console.log(`[UserPool - initializeTestRun] Creating fresh User Pool with ${userCount} users`);
    await this.createFreshPool(userCount);
    // Store the initial user count
    this.initialUserCount = (await this.getPoolMetadata()).userCount;
  }

  /**
   * Create fresh pool with users.
   * @description Generates and stores new users in Redis for the test pool
   * @param userCount - Number of users to generate
   * @private
   */
  private async createFreshPool(userCount: number): Promise<void> {
    // Generate users
    const users = this.generateUsers(userCount);
    const userStrings = users.map((user) => JSON.stringify(user));

    // Create key with all users
    await this.redisClient.createKey(this.getTestRunKey(), userStrings);

    console.log(`[UserPool - createFreshPool] Created User Pool with ${userCount} users`);
  }

  /**
   * Get user from pool.
   * @description Retrieves an available user from the pool, waiting if necessary
   * @returns Promise resolving to a user credential or null if parsing fails
   */
  public async getUser(): Promise<UserCredential | null> {
    let userString = await this.redisClient.pop(this.getTestRunKey());

    // Efficiently wait for a user to become available, polling at intervals
    while (!userString) {
      console.log(
        '[UserPool - getUser] Pool exhausted, no users available. Waiting for users to be available in the pool'
      );
      // Use a Promise-based delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      userString = await this.redisClient.pop(this.getTestRunKey());
    }

    try {
      const user: UserCredential = JSON.parse(userString);
      return user;
    } catch (err) {
      console.error('[UserPool - getUser] Failed to parse user string from Redis:', err);
      return null;
    }
  }

  /**
   * Return user to pool.
   * @description Returns a used test user back to the pool for reuse
   * @param user - User credential to return to the pool
   */
  public async returnUser(user: UserCredential): Promise<void> {
    // this.ensureTestRunInitialized();

    const userString = JSON.stringify(user);
    await this.redisClient.push(this.getTestRunKey(), userString);
  }

  /**
   * Get pool statistics.
   * @description Returns current pool status including available users and configuration
   * @returns Promise resolving to pool statistics
   */
  public async getStats(): Promise<{
    available: number;
    testRunKey: string | null;
    baseURL: string | null;
  }> {
    // this.ensureTestRunInitialized();

    const available = await this.redisClient.getLength(this.getTestRunKey());
    return {
      available,
      testRunKey: this.getTestRunKey(),
      baseURL: this.getBaseURL(),
    };
  }

  /**
   * Check if test run exists.
   * @description Verifies if the current test run pool exists in Redis
   * @returns Promise resolving to true if pool exists, false otherwise
   */
  public async testRunExists(): Promise<boolean> {
    // this.ensureTestRunInitialized();

    return await this.redisClient.keyExists(this.getTestRunKey());
  }

  /**
   * Smart cleanup - only cleanup if no other processes are likely using the pool.
   * @description Intelligently cleans up the user pool based on usage patterns
   */
  public async cleanupTestRun(): Promise<void> {
    // Check current pool status
    const metadata = await this.getPoolMetadata();

    if (!metadata.exists) {
      console.log('[UserPool - cleanupTestRun] User Pool already cleaned up');
      return;
    }

    // Simple heuristic: if pool has less users than initial user count and seems relatively unused, leave it for other processes
    if (metadata.userCount < this.initialUserCount) {
      console.log(
        `[UserPool - cleanupTestRun] User Pool seems active with ${metadata.userCount} users, skipping cleanup`
      );
      return;
    }

    // Cleanup the pool
    await this.redisClient.destroyKey(this.getTestRunKey());
    console.log(`[UserPool - cleanupTestRun] User Pool cleaned up`);

    this.testRunKey = undefined;
    this.baseURL = undefined;
  }

  /**
   * Disconnect from Redis.
   * @description Closes Redis connection and cleans up resources
   */
  public async disconnect(): Promise<void> {
    await this.redisClient.disconnect();
  }

  /**
   * Generate users for the pool.
   * @description Creates test user credentials with incremental naming
   * @param count - Number of users to generate
   * @returns Array of generated user credentials
   * @private
   */
  private generateUsers(count: number): UserCredential[] {
    const users: UserCredential[] = [];

    for (let i = 1; i <= count; i++) {
      users.push({
        email: `test_admin${i}@ushurdummy.me`,
        password: `Ushur@123`,
        username: `test_admin${i}`,
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
        twoFactorEnabled: false,
        description: `Auto-generated test user #${i}`,
        loginSuccess: true,
      });
    }

    return users;
  }

  /**
   * Get current test run key.
   * @description Returns the Redis key used for the current test run
   * @returns Current test run key or undefined if not initialized
   */
  public getCurrentTestRunKey(): string | undefined {
    return this.testRunKey;
  }

  /**
   * Initialize test run (static convenience method).
   * @description Static wrapper for initializing test run
   * @param userCount - Optional number of users to create
   */
  public static async initializeTestRun(userCount?: number): Promise<void> {
    return await UserPool.getInstance().initializeTestRun(userCount);
  }

  /**
   * Get user (static convenience method).
   * @description Static wrapper for getting a user from the pool
   * @returns Promise resolving to a user credential
   */
  public static async getUser(): Promise<UserCredential | null> {
    return await UserPool.getInstance().getUser();
  }

  /**
   * Return user (static convenience method).
   * @description Static wrapper for returning a user to the pool
   * @param user - User credential to return
   */
  public static async returnUser(user: UserCredential): Promise<void> {
    return await UserPool.getInstance().returnUser(user);
  }

  /**
   * Get pool stats (static convenience method).
   * @description Static wrapper for getting pool statistics
   * @returns Promise resolving to pool statistics
   */
  public static async getStats(): Promise<{
    available: number;
    testRunKey: string | null;
    baseURL: string | null;
  }> {
    return await UserPool.getInstance().getStats();
  }

  /**
   * Cleanup test run (static convenience method).
   * @description Static wrapper for cleaning up the test run
   */
  public static async cleanupTestRun(): Promise<void> {
    return UserPool.getInstance().cleanupTestRun();
  }

  /**
   * Disconnect from Redis (static convenience method).
   * @description Static wrapper for disconnecting from Redis
   */
  public static async disconnect(): Promise<void> {
    return UserPool.getInstance().disconnect();
  }
}

/**
 * User pool singleton instance.
 * @description Pre-initialized user pool ready for test user management
 */
export const userPool = UserPool.getInstance();
