// Core framework imports
import { TestEnvironment } from '@core/enums';
import { ciConfig, localConfig, validateConfig } from '@configs/index';

/**
 * @fileoverview Configuration Loader - Smart configuration selection and validation
 * @description Intelligent configuration loading based on environment variables
 * @author Anand Sogalad
 */

/**
 * Environment variable configuration.
 * @description Extract and process environment variables for configuration
 */
const rawEnv = (process.env.TEST_ENV || process.env.NODE_ENV || TestEnvironment.CI).toLowerCase();
const baseURL = process.env.BASE_URL;

/**
 * Configuration mapping.
 * @description Map of supported environments to their config objects
 */
const configMap = {
  [TestEnvironment.CI]: ciConfig,
  [TestEnvironment.LOCAL]: localConfig,
};

/**
 * Get current configuration for the environment.
 * @description Returns validated configuration for the current environment
 * @returns The validated and typed configuration object
 * @throws {z.ZodError} If validation fails
 */
export function getCurrentConfig() {
  const selectedConfig = configMap[rawEnv as keyof typeof configMap] || ciConfig;
  const mergedConfig = {
    ...selectedConfig,
    use: {
      ...selectedConfig.use,
      ...(baseURL ? { baseURL } : {}),
    },
  };
  return validateConfig(mergedConfig);
}

/**
 * Configuration exports.
 * @description Export all configuration modules for easy importing
 */
export * from './base.config';
export * from './ci.config';
export * from './config.schema';
export * from './local.config';
