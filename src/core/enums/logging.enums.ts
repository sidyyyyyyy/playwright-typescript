/**
 * @fileoverview Logging Enums - Log levels, formats, and configuration
 * @description Logging system configuration enums for structured logging
 * @author Anand Sogalad
 */

/**
 * Supported log levels.
 * @description Log levels for logging framework
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

/**
 * Supported log formats.
 * @description Log formats for logging framework
 */
export enum LogFormat {
  JSON = 'json',
  SIMPLE = 'simple',
  DETAILED = 'detailed',
}

/**
 * Supported log destinations.
 * @description Log destinations for logging framework
 */
export enum LogDestination {
  CONSOLE = 'console',
  FILE = 'file',
  BOTH = 'both',
}

/**
 * Log level ordering.
 * @description Log level orders for logging framework
 */
export enum LogLevelOrder {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

/**
 * Log color mapping.
 * @description Log colors for logging framework
 */
export enum LogColor {
  ERROR = 'red',
  WARN = 'yellow',
  INFO = 'blue',
  DEBUG = 'gray',
  TRACE = 'cyan',
}
