/**
 * @fileoverview File Path Constants - Standardized directory and file paths
 * @description Consistent path constants for file operations and configuration
 * @author Anand Sogalad
 */

/**
 * Standardized file and directory paths.
 * @description Consistent path constants for framework file operations
 */
export const FilePaths = {
  // Source Directories
  CONFIG_DIR: 'configs',
  CORE_DIR: 'src/core',
  DATA_DIR: 'src/data',
  FIXTURES_DIR: 'src/fixtures',
  INTEGRATIONS_DIR: 'src/integrations',
  PAGES_DIR: 'src/pages',
  SRC_DIR: 'src',
  TESTS_DIR: 'src/tests',
  UTILS_DIR: 'src/utils',

  // Documentation and Scripts
  DOCS_DIR: 'docs',
  SCRIPTS_DIR: 'scripts',

  // Report Directories
  LOGS_DIR: 'reports/logs',
  REPORTS_DIR: 'reports',
  SCREENSHOTS_DIR: 'reports/screenshots',
  TRACES_DIR: 'reports/traces',
  VIDEOS_DIR: 'reports/videos',

  // Global Files
  GLOBAL_SETUP_FILE: 'src/global.setup.ts',
  GLOBAL_TEARDOWN_FILE: 'src/global.teardown.ts',
} as const;

/**
 * File path type.
 * @description Type representing standardized file or directory paths
 */
export type FilePath = (typeof FilePaths)[keyof typeof FilePaths];
