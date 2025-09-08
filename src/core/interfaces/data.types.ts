/**
 * @fileoverview Data Types - Interfaces for test data and user credentials
 * @description Type definitions for test data structures and configurations
 * @author Anand Sogalad
 */

/**
 * User credentials for authentication and test scenarios.
 * @description Complete user credential structure for login testing
 * @example const user: UserCredential = { email: 'test@example.com', password: 'Test123!', loginSuccess: true };
 */
export interface UserCredential {
  email: string;
  password: string;
  username?: string;
  role?: string;
  permissions?: string[];
  twoFactorEnabled?: boolean;
  description?: string;
  loginSuccess?: boolean;
}

/**
 * Metadata for test cases.
 * @description Information about test cases for documentation and tracking
 * @example const metadata: TestMetadata = { testId: 'TC001', testName: 'Login Test', author: 'QA Team' };
 */
export interface TestMetadata {
  testId: string;
  testName: string;
  description?: string;
  author?: string;
  createdDate?: Date;
  lastModified?: Date;
  version?: string;
  jiraId?: string;
  requirements?: string[];
}

/**
 * Configuration for test data sources.
 * @description Settings for different test data sources (files, databases, APIs)
 * @example const config: TestDataConfig = { source: 'file', path: './testdata.json' };
 */
export interface TestDataConfig {
  source: 'file' | 'database' | 'api' | 'generator';
  path?: string;
  connection?: DatabaseConnection;
  endpoint?: string;
  generator?: DataGenerator;
}

/**
 * Database connection configuration for test data.
 * @typedef DatabaseConnection
 */
export interface DatabaseConnection {
  type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlite' | 'oracle';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  poolSize?: number;
}

/**
 * Data generator configuration for dynamic test data.
 * @typedef DataGenerator
 */
export interface DataGenerator {
  type: 'faker' | 'custom';
  rules: Record<string, any>;
  count?: number;
  seed?: string;
}
