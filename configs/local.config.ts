// Configuration imports
import { baseConfig } from '@configs/index';
import { TestEnvironment } from '@core/enums';

/**
 * @fileoverview Local Configuration - Local development specific settings
 * @description Configuration overrides for local development environments
 * @author Anand Sogalad
 */

/**
 * Local development environment configuration.
 * @description Extends base configuration for local development with optimized settings
 */
export const localConfig = {
  ...baseConfig,
  environment: TestEnvironment.LOCAL,
  workers: 10,
  use: {
    ...baseConfig.use,
    headless: false, // Force headed mode for local development
  },
};
