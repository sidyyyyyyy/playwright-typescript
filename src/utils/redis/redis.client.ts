// External library imports
import Redis from 'ioredis';

// Core framework imports
import { RedisConfig } from '@core/constants';

/**
 * @fileoverview Redis Client - Singleton Redis connection and operation management
 * @description Provides Redis connectivity with connection management and common operations
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { redisClient } from '@utils/redis';
 *
 * // Push data to a list
 * await redisClient.push('mylist', 'value');
 *
 * // Pop data from a list
 * const value = await redisClient.pop('mylist');
 * ```
 */

/**
 * Singleton Redis client for consistent connection management.
 *
 * Provides comprehensive Redis operations with automatic connection handling:
 * - Connection management with retry logic
 * - List operations (push, pop, length)
 * - Key management (create, destroy, exists)
 * - TTL operations for key expiration
 * - Connection status monitoring
 *
 * @class RedisClient
 */
export class RedisClient {
  private static instance: RedisClient | null = null;
  private client: Redis | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  /**
   * Private constructor to prevent direct instantiation.
   * @description Ensures singleton pattern by preventing external instantiation
   */
  private constructor() {}

  /**
   * Get singleton instance.
   * @description Returns the single Redis client instance, creating it if necessary
   * @returns The Redis client singleton instance
   */
  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  /**
   * Connect to Redis.
   * @description Establishes connection to Redis server with retry logic
   * @private
   */
  private async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    if (this.connectionPromise) {
      await this.connectionPromise;
      return;
    }

    this.connectionPromise = this.createConnection();
    await this.connectionPromise;
  }

  /**
   * Create Redis connection.
   * @description Creates and configures Redis connection with event handlers
   * @private
   */
  private async createConnection(): Promise<void> {
    try {
      this.client = new Redis(RedisConfig.PORT, RedisConfig.HOST, {
        password: RedisConfig.PASSWORD,
        db: RedisConfig.DB,
        maxRetriesPerRequest: RedisConfig.MAX_RETRIES,
        maxLoadingRetryTime: RedisConfig.RETRY_DELAY,
        connectTimeout: RedisConfig.CONNECT_TIMEOUT,
        commandTimeout: RedisConfig.COMMAND_TIMEOUT,
        keepAlive: RedisConfig.KEEP_ALIVE,
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      await this.client.connect();
      this.connectionPromise = null;
    } catch (error) {
      this.connectionPromise = null;
    }
  }

  /**
   * Ensure Redis connection is established.
   * @description Verifies connection status and connects if needed
   * @private
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }
  }

  /**
   * Create Redis key.
   * @description Creates a new Redis list key with optional initial values
   * @param key - Redis key name
   * @param initialValues - Optional array of initial values to populate the list
   */
  public async createKey(key: string, initialValues?: string[]): Promise<void> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis not connected');
    }

    if (initialValues && initialValues.length > 0) {
      await this.client.rpush(key, ...initialValues);
    } else {
      await this.client.lpush(key, 'temp');
      await this.client.lpop(key);
    }
  }

  /**
   * Push value to Redis key.
   * @description Adds a value to the end of a Redis list
   * @param key - Redis key name
   * @param value - Value to push to the list
   * @returns Promise resolving to new list length
   */
  public async push(key: string, value: string): Promise<number> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis not connected');
    }

    const length = await this.client.rpush(key, value);
    return length;
  }

  /**
   * Push multiple values to Redis key.
   * @description Adds multiple values to the end of a Redis list
   * @param key - Redis key name
   * @param values - Array of values to push to the list
   * @returns Promise resolving to new list length
   */
  public async pushMultiple(key: string, values: string[]): Promise<number> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis not connected');
    }

    if (values.length === 0) {
      return await this.client.llen(key);
    }

    const length = await this.client.rpush(key, ...values);
    return length;
  }

  /**
   * Pop value from Redis key.
   * @description Removes and returns the first value from a Redis list
   * @param key - Redis key name
   * @returns Promise resolving to the popped value or null if list is empty
   */
  public async pop(key: string): Promise<string | null> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis not connected');
    }

    return await this.client.lpop(key);
  }

  /**
   * Pop multiple values from Redis key.
   * @description Removes and returns multiple values from the beginning of a Redis list
   * @param key - Redis key name
   * @param count - Number of values to pop
   * @returns Promise resolving to array of popped values
   */
  public async popMultiple(key: string, count: number): Promise<string[]> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis not connected');
    }

    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      const value = await this.client.lpop(key);
      if (value) {
        values.push(value);
      } else {
        break;
      }
    }
    return values;
  }

  /**
   * Get length of Redis key.
   * @description Returns the number of elements in a Redis list
   * @param key - Redis key name
   * @returns Promise resolving to list length
   */
  public async getLength(key: string): Promise<number> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis not connected');
    }

    return await this.client.llen(key);
  }

  /**
   * Check if Redis key exists.
   * @description Verifies whether a Redis key exists
   * @param key - Redis key name
   * @returns Promise resolving to true if key exists, false otherwise
   */
  public async keyExists(key: string): Promise<boolean> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis not connected');
    }

    const exists = await this.client.exists(key);
    return exists === 1;
  }

  /**
   * Destroy Redis key.
   * @description Deletes a Redis key and all its data
   * @param key - Redis key name
   * @returns Promise resolving to true if key was deleted, false otherwise
   */
  public async destroyKey(key: string): Promise<boolean> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis not connected');
    }

    const deleted = await this.client.del(key);
    return deleted > 0;
  }

  /**
   * Destroy multiple Redis keys.
   * @description Deletes multiple Redis keys in a single operation
   * @param keys - Array of Redis key names
   * @returns Promise resolving to number of keys deleted
   */
  public async destroyKeys(keys: string[]): Promise<number> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis not connected');
    }

    if (keys.length === 0) {
      return 0;
    }

    const deleted = await this.client.del(...keys);
    return deleted;
  }

  /**
   * Get TTL (time to live) for a key.
   * @description Returns the remaining time to live for a Redis key in seconds
   * @param key - Redis key name
   * @returns Promise resolving to TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
   */
  public async getTTL(key: string): Promise<number> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    return await this.client.ttl(key);
  }

  /**
   * Set TTL (time to live) for a key.
   * @description Sets expiration time for a Redis key
   * @param key - Redis key name
   * @param seconds - Expiration time in seconds
   */
  public async setTTL(key: string, seconds: number): Promise<void> {
    await this.ensureConnection();

    if (!this.client) {
      throw new Error('Redis client not connected');
    }

    await this.client.expire(key, seconds);
  }

  /**
   * Get Redis connection status.
   * @description Returns current Redis connection and readiness status
   * @returns Object containing connection status information
   */
  public getStatus(): { connected: boolean; ready: boolean } {
    return {
      connected: this.isConnected,
      ready: this.client?.status === 'ready',
    };
  }

  /**
   * Disconnect from Redis.
   * @description Closes Redis connection and cleans up resources
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
      this.isConnected = false;
      this.connectionPromise = null;
    }
  }

  /**
   * Reset Redis client.
   * @description Resets the singleton instance and disconnects from Redis
   */
  public static async reset(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.disconnect();
      RedisClient.instance = null;
    }
  }
}

/**
 * Redis client singleton instance.
 * @description Pre-initialized Redis client ready for use throughout the application
 */
export const redisClient = RedisClient.getInstance();
