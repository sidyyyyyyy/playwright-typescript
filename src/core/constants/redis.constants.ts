// Core framework imports
import type { RedisErrorType } from '@core/interfaces/redis.types';

/**
 * @fileoverview Redis Constants - Redis configuration and key management
 * @description Redis connection settings, key patterns, and error definitions
 * @author Anand Sogalad
 */

/**
 * Redis configuration constants.
 * @description Redis connection and configuration settings for UserPool
 */
export const RedisConfig = {
  // Connection settings
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: parseInt(process.env.REDIS_PORT || '6379'),
  PASSWORD: process.env.REDIS_PASSWORD || undefined,
  DB: parseInt(process.env.REDIS_DB || '0'),

  // Connection pool settings
  MAX_CLIENTS: parseInt(process.env.REDIS_MAX_CLIENTS || '10'),
  MIN_CLIENTS: parseInt(process.env.REDIS_MIN_CLIENTS || '2'),

  // Timeout settings
  CONNECT_TIMEOUT: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000'),
  COMMAND_TIMEOUT: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000'),
  KEEP_ALIVE: parseInt(process.env.REDIS_KEEP_ALIVE || '30000'),

  // Retry settings
  MAX_RETRIES: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
  RETRY_DELAY: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),

  // Key prefix for UserPool
  KEY_PREFIX: 'userpool:',
  SESSION_PREFIX: 'session:',

  // TTL settings (in seconds)
  SESSION_TTL: parseInt(process.env.REDIS_SESSION_TTL || '3600'), // 1 hour
  USER_TTL: parseInt(process.env.REDIS_USER_TTL || '1800'), // 30 minutes

  // Batch settings
  BATCH_SIZE: parseInt(process.env.REDIS_BATCH_SIZE || '50'),
  PIPELINE_SIZE: parseInt(process.env.REDIS_PIPELINE_SIZE || '10'),
} as const;

/**
 * Redis key generators.
 * @description Functions to generate consistent Redis keys for UserPool
 */
export const RedisKeys = {
  SESSION: (sessionId: string) => `${RedisConfig.SESSION_PREFIX}${sessionId}`,
  USER_POOL: (sessionId: string) => `${RedisConfig.KEY_PREFIX}pool:${sessionId}`,
  USER_IN_USE: (sessionId: string) => `${RedisConfig.KEY_PREFIX}inuse:${sessionId}`,
  USER_STATS: (sessionId: string) => `${RedisConfig.KEY_PREFIX}stats:${sessionId}`,
  USER_CONFIG: (sessionId: string) => `${RedisConfig.KEY_PREFIX}config:${sessionId}`,
} as const;

/**
 * Redis error types.
 * @description All possible Redis-related error conditions
 */
export const RedisErrors: Record<RedisErrorType, RedisErrorType> = {
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  POOL_EXHAUSTED: 'POOL_EXHAUSTED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  OPERATION_TIMEOUT: 'OPERATION_TIMEOUT',
  INVALID_CONFIG: 'INVALID_CONFIG',
} as const;
