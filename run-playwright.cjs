#!/usr/bin/env node
/**
 * @fileoverview Playwright Test Runner Wrapper - CLI argument processing and environment setup
 * @description Extracts environment and base URL arguments, sets environment variables, and passes remaining args to Playwright
 * @author Anand Sogalad
 *
 * @example CLI usage:
 * ```bash
 * # Run tests with environment
 * node run-playwright.cjs --env=staging
 *
 * # Run tests with custom base URL
 * node run-playwright.cjs --baseURL=https://test.example.com
 *
 * # Run specific test suite
 * node run-playwright.cjs src/tests/api --env=local
 * ```
 */

// Node.js core imports
const { spawn } = require('child_process');

/**
 * Extract and process --baseURL argument from command line.
 * @description Finds --baseURL= argument, extracts the URL value, sets BASE_URL environment variable, and removes the argument from argv.
 */
let baseURL;
const baseURLArgIndex = process.argv.findIndex((arg) => arg.startsWith('--baseURL='));
if (baseURLArgIndex !== -1) {
  baseURL = process.argv[baseURLArgIndex].split('=')[1];
  process.env.BASE_URL = baseURL;
  process.argv.splice(baseURLArgIndex, 1);
}

/**
 * Extract and process --env argument from command line.
 * @description Finds --env= argument, extracts the environment value, sets TEST_ENV environment variable, and removes the argument from argv.
 */
const envArgIndex = process.argv.findIndex((arg) => arg.startsWith('--env='));
if (envArgIndex !== -1) {
  const envValue = process.argv[envArgIndex].split('=')[1];
  process.env.TEST_ENV = envValue;
  process.argv.splice(envArgIndex, 1);
}

/**
 * Pass remaining arguments to Playwright and handle process lifecycle.
 * @description Spawns Playwright test runner with remaining CLI arguments and forwards exit codes.
 */
const args = process.argv.slice(2);
const pw = spawn('npx', ['playwright', 'test', ...args], { stdio: 'inherit', env: process.env });

/**
 * Handle Playwright process exit.
 * @description Forwards the exit code from Playwright process to the parent process.
 */
pw.on('exit', (code) => process.exit(code));
