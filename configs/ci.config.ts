// Configuration imports
import { baseConfig } from '@configs/index';
import { TestEnvironment } from '@core/enums';

/**
 * @fileoverview CI Configuration - CI pipeline specific settings
 * @description Configuration overrides for continuous integration environments
 * @author Anand Sogalad
 */

/**
 * CI environment configuration.
 * @description Extends base configuration for CI pipeline optimization
 */
export const ciConfig = {
  ...baseConfig,
  environment: TestEnvironment.CI,
};
