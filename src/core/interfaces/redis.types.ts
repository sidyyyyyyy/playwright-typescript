/**
 * @fileoverview Redis Types - Redis connection and UserPool management interfaces
 * @description Type definitions for Redis configuration, connection, and user pool management
 * @author Anand Sogalad
 */

/**
 * Redis connection configuration interface
 */
export interface RedisConnectionConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxClients: number;
  minClients: number;
  connectTimeout: number;
  commandTimeout: number;
  keepAlive: number;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Redis UserPool configuration interface
 */
export interface RedisUserPoolConfig {
  connectionConfig: RedisConnectionConfig;
  keyPrefix: string;
  sessionPrefix: string;
  sessionTTL: number;
  userTTL: number;
  batchSize: number;
  pipelineSize: number;
}

/**
 * Redis pool statistics interface
 */
export interface RedisPoolStats {
  available: number;
  inUse: number;
  total: number;
  generated: number;
  maxSize: number;
  sessionId: string;
  utilization: number;
}

/**
 * Redis error types
 */
export type RedisErrorType =
  | 'CONNECTION_FAILED'
  | 'SESSION_NOT_FOUND'
  | 'POOL_EXHAUSTED'
  | 'USER_NOT_FOUND'
  | 'OPERATION_TIMEOUT'
  | 'INVALID_CONFIG';
