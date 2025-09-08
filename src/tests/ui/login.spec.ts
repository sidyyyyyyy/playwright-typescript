/**
 * @fileoverview Login Page Test Suite - Comprehensive testing for authentication functionality
 * @description Complete test coverage for login page interactions, validation, authentication workflows,
 * performance testing, and error handling scenarios. Tests cover both positive and negative authentication
 * flows with comprehensive page structure validation.
 * @author Anand Sogalad
 *
 * @example Test execution:
 * ```bash
 * # Run login tests only
 * npm run test:ui -- --grep "Login Page Tests"
 *
 * # Run specific test categories
 * npm run test:ui -- --grep "@authentication"
 * npm run test:ui -- --grep "@validation"
 * npm run test:ui -- --grep "@performance"
 * ```
 */

// External library imports
import { test, expect } from '@playwright/test';

// Core framework imports
import { LoginPage, HomePage } from '@pages/index';
import { ushurTestLoginCredentials } from '@data/index';
import { PerformanceThreshold } from '@core/enums';

/**
 * @description Comprehensive test suite for login page functionality and authentication workflows.
 *
 * This test suite covers:
 * - Login page structure validation
 * - Authentication workflows (positive and negative scenarios)
 * - Performance testing for page load times
 * - Error handling and validation
 * - Cross-browser compatibility testing
 *
 * @testTags @ui @authentication @validation @performance @smoke
 *
 * @example Test categories:
 * - @smoke: Critical functionality tests
 * - @validation: Page structure and element validation
 * - @authentication: Login workflows and credential testing
 * - @performance: Page load and response time testing
 * - @positive: Successful authentication scenarios
 * - @negative: Failed authentication and error scenarios
 */
test.describe('Login Page Tests', () => {
  /** Page object instance for login page interactions and validations */
  let loginPage: LoginPage;

  /** Page object instance for home page post-login validations */
  let homePage: HomePage;

  /**
   * @description Test setup - Initializes page objects and navigates to login page.
   *
   * Executed before each test to ensure consistent starting state:
   * 1. Creates fresh LoginPage and HomePage instances
   * 2. Navigates to the login page
   * 3. Ensures page is ready for testing
   *
   * @param {Page} page - Playwright Page instance provided by test context
   */
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);

    await test.step('Navigate to login page', async () => {
      await loginPage.navigateToLoginPage();
    });
  });

  /**
   * @description Validates the complete structure and visibility of login page elements.
   *
   * This test ensures that all critical login page elements are present and visible:
   * - Header elements (logo, welcome text, automation description)
   * - Form elements (email input, password input, login button)
   * - Navigation elements (sign-up link, forgot password link)
   *
   * @testTags @smoke @validation
   * @testType UI Validation
   * @testPriority Critical
   *
   * @example Expected elements validated:
   * - Ushur logo visibility
   * - Welcome text display
   * - Email and password input fields
   * - Login button availability
   * - Additional navigation links
   */
  test('validate complete page structure @smoke @validation', async () => {
    await test.step('Validate all login page elements', async () => {
      await loginPage.validateLoginPageElementsVisibility();
    });
  });

  /**
   * @description Parameterized authentication tests covering positive and negative login scenarios.
   *
   * These tests validate:
   * - Valid credential authentication (positive scenarios)
   * - Invalid credential handling (negative scenarios)
   * - Empty field validation
   * - Error message display for failed attempts
   * - Successful login navigation and logout workflows
   *
   * Test data includes:
   * - Valid user credentials
   * - Invalid email/password combinations
   * - Empty credential scenarios
   * - Special character handling
   *
   * @testTags @authentication @positive @negative
   * @testType Authentication Workflow
   * @testPriority Critical
   *
   * @example Test scenarios:
   * - Valid login → Home page → Logout
   * - Invalid credentials → Error message validation
   * - Empty fields → Field validation
   */
  for (const credential of ushurTestLoginCredentials) {
    test(`${credential.description} @authentication ${credential.loginSuccess ? '@positive' : '@negative'}`, async () => {
      await test.step('Perform login attempt', async () => {
        await loginPage.login(credential.email, credential.password);
      });

      if (credential.loginSuccess) {
        await test.step('Validate successful authentication workflow', async () => {
          // Verify successful login by checking home page elements
          await homePage.validateLogoutButtonVisibility();

          // Complete the workflow by logging out
          await homePage.logout();
        });
      } else {
        await test.step('Validate failed authentication handling', async () => {
          if (!credential.email || !credential.password) {
            // For empty credentials, ensure page structure remains intact
            await loginPage.validateLoginPageElementsVisibility();
          } else {
            // For invalid credentials, verify error message display
            await loginPage.validateLoginErrorMessageVisibility();
          }
        });
      }
    });
  }

  /**
   * @description Validates login page performance and load time thresholds.
   *
   * This test measures and validates:
   * - Page reload and rendering performance
   * - Element visibility load times
   * - Interactive element availability timing
   * - Performance threshold compliance
   *
   * Performance metrics validated:
   * - Total page load time must be under TIME_TO_INTERACTIVE threshold
   * - All critical elements must be visible within threshold
   * - Page must be fully interactive within acceptable timeframe
   *
   * @testTags @performance
   * @testType Performance Validation
   * @testPriority High
   *
   * @example Performance validation workflow:
   * 1. Record start time
   * 2. Trigger page reload
   * 3. Validate all elements are visible
   * 4. Calculate total load time
   * 5. Assert against performance threshold
   *
   * @param {Page} page - Playwright Page instance for performance testing
   */
  test('validate performance thresholds @performance', async ({ page }) => {
    const performanceThreshold = PerformanceThreshold.TIME_TO_INTERACTIVE;

    await test.step('Measure login page load time', async () => {
      const startTime = Date.now();

      // Trigger page reload to measure fresh load performance
      await page.reload();

      // Validate that all critical elements are visible (acts as "time to interactive")
      await loginPage.validateLoginPageElementsVisibility();

      const loadTime = Date.now() - startTime;

      // Assert that load time meets performance requirements
      expect(loadTime).toBeLessThan(performanceThreshold);
    });
  });
});
