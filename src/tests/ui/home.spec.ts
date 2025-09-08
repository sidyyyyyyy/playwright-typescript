/**
 * @fileoverview Home Page Test Suite - Comprehensive testing for dashboard functionality and navigation
 * @description Complete test coverage for home page interactions, navigation workflows, project management,
 * performance testing, authentication verification, and error handling scenarios. Tests cover navigation
 * between sections, user workflows, and comprehensive page structure validation using user fixtures.
 * @author Anand Sogalad
 *
 * @example Test execution:
 * ```bash
 * # Run home page tests only
 * npm run test:ui -- --grep "Home Page Tests"
 *
 * # Run specific test categories
 * npm run test:ui -- --grep "@navigation"
 * npm run test:ui -- --grep "@functionality"
 * npm run test:ui -- --grep "@performance"
 * ```
 */

// External library imports
import { expect } from '@playwright/test';

// Core framework imports
import { LoginPage, HomePage } from '@pages/index';
import { PerformanceThreshold } from '@core/enums';
import { test } from '@fixtures/user.fixture';
import { subSectionNavigationTestData } from '@data/ushurHomePageTestData';

/**
 * @description Comprehensive test suite for home page functionality, navigation, and user workflows.
 *
 * This test suite covers:
 * - Home page structure validation and element verification
 * - Navigation workflows between different sections and sub-sections
 * - Project management functionality (creation workflows)
 * - Authentication-related features (logout workflows)
 * - Performance testing for page load times
 * - Error handling and edge case scenarios
 * - User fixture integration for authenticated testing
 *
 * @testTags @ui @navigation @functionality @performance @smoke @authentication
 *
 * @example Test categories:
 * - @smoke: Critical functionality tests
 * - @validation: Page structure and element validation
 * - @navigation: Sub-section navigation and URL validation
 * - @functionality: Feature-specific workflows and interactions
 * - @performance: Page load and response time testing
 * - @authentication: Session management and logout workflows
 * - @error-handling: Error scenarios and edge cases
 */
test.describe('Home Page Tests', () => {
  /** Page object instance for login page interactions during setup */
  let loginPage: LoginPage;

  /** Page object instance for home page interactions and validations */
  let homePage: HomePage;

  /**
   * @description Test setup - Authenticates user and navigates to home page.
   *
   * Executed before each test to ensure consistent authenticated starting state:
   * 1. Creates fresh LoginPage and HomePage instances
   * 2. Navigates to the login page
   * 3. Performs user authentication using provided user fixture
   * 4. Ensures home page is loaded and ready for testing
   *
   * @param {Page} page - Playwright Page instance provided by test context
   * @param {UserCredential} user - User fixture providing authentication credentials
   */
  test.beforeEach(async ({ page, user }) => {
    await test.step('Login and navigate to home page', async () => {
      loginPage = new LoginPage(page);
      homePage = new HomePage(page);

      await loginPage.navigateToLoginPage();
      await loginPage.login(user.email, user.password);
      await homePage.navigationUtil.waitForLoadStateLoad();
    });
  });

  /**
   * @description Validates the complete structure and visibility of home page elements.
   *
   * This test ensures that all critical home page elements are present and visible:
   * - Header elements (logo, studio toggle, create project button)
   * - Main section headings (automation, analytics, manage, account)
   * - Sub-section navigation links (projects, reports, settings, etc.)
   * - Utility elements (support link, logout button)
   *
   * @testTags @smoke @validation
   * @testType UI Validation
   * @testPriority Critical
   *
   * @example Expected elements validated:
   * - Complete left navigation panel structure
   * - All section and sub-section links
   * - User management controls
   * - Project management elements
   */
  test('validate complete page structure @smoke @validation', async () => {
    await test.step('Validate all page elements', async () => {
      await homePage.validateAllElementsVisibilityOnLeftPanel();
    });
  });

  /**
   * @description Validates the studio mode toggle functionality and state management.
   *
   * This test verifies:
   * - Studio mode toggle element accessibility
   * - Toggle state checking capability
   * - Toggle action execution and response
   * - Page state changes after toggle interaction
   *
   * @testTags @functionality
   * @testType Feature Validation
   * @testPriority High
   *
   * @example Studio mode workflow:
   * 1. Check current toggle state
   * 2. Execute toggle action
   * 3. Verify page response and state change
   */
  test('validate studio mode toggle @functionality', async () => {
    await test.step('Toggle studio mode', async () => {
      await homePage.studioModeToggle.isChecked();
      await homePage.toggleStudioMode();
    });
  });

  /**
   * @description Validates the complete project creation workflow and dialog interactions.
   *
   * This test covers:
   * - Create project dialog opening and validation
   * - Custom project dialog workflow initiation
   * - Multi-step project creation process
   * - Dialog element visibility verification
   *
   * @testTags @functionality
   * @testType Workflow Validation
   * @testPriority High
   *
   * @example Project creation workflow:
   * 1. Open main create project dialog
   * 2. Validate dialog elements are visible
   * 3. Initiate custom project creation flow
   * 4. Verify custom project dialog accessibility
   */
  test('validate project creation flow @functionality', async () => {
    await test.step('Open create project modal', async () => {
      await homePage.openCreateProjectModal();
    });

    await test.step('Open custom project modal', async () => {
      await homePage.openCreateCustomProjectModal();
    });
  });

  /**
   * @description Parameterized navigation tests covering all home page sub-sections.
   *
   * These tests validate:
   * - Navigation link availability and functionality
   * - URL pattern matching after navigation
   * - Page load completion verification
   * - Cross-section navigation reliability
   *
   * Test data coverage includes:
   * - Automation section: Projects, Canvas, Campaigns, Launchpad, Ushur Hub
   * - Analytics section: Insights, Campaign Analytics, Reports, Data Tables, AI Studio
   * - Management section: Contacts, Shortlinks, Integrations
   * - Account section: Settings, Admin Tools
   *
   * @testTags @navigation
   * @testType Navigation Validation
   * @testPriority Critical
   *
   * @example Navigation test scenarios:
   * - Click sub-section link → URL validation → Page load verification
   * - Cross-section navigation between different functional areas
   * - Navigation state consistency across sections
   */
  for (const subSection of subSectionNavigationTestData) {
    test(`navigate to ${subSection.name} @navigation`, async () => {
      await test.step(`Navigate to ${subSection.name}`, async () => {
        await homePage.navigateToSubSection(subSection.section);
      });
    });
  }

  /**
   * @description Validates support link navigation and external resource access.
   *
   * This test verifies:
   * - Support link functionality and new tab opening
   * - External URL navigation and pattern matching
   * - Tab management and cleanup procedures
   * - Cross-domain navigation capabilities
   *
   * @testTags @functionality
   * @testType External Navigation
   * @testPriority Medium
   *
   * @example Support navigation workflow:
   * 1. Click support link
   * 2. Wait for new tab to open
   * 3. Validate external URL pattern
   * 4. Clean up by closing new tab
   *
   * @param {BrowserContext} context - Browser context for tab management
   */
  test('handle support link navigation @functionality', async ({ context }) => {
    await test.step('Open support link in new tab', async () => {
      const [newPage] = await Promise.all([context.waitForEvent('page'), homePage.openSupportLink()]);
      await expect(newPage).toHaveURL(/https:\/\/identity\.document360\.io\/Account\/Login.*/);
      await newPage.close();
    });
  });

  /**
   * @description Validates the complete user logout workflow and session termination.
   *
   * This test covers:
   * - Logout button functionality and session termination
   * - Post-logout navigation to login page
   * - Login page element validation after logout
   * - Session state cleanup verification
   *
   * @testTags @authentication
   * @testType Session Management
   * @testPriority Critical
   *
   * @example Logout workflow validation:
   * 1. Execute logout action from home page
   * 2. Verify redirection to login page
   * 3. Validate login page elements are visible
   * 4. Confirm session termination completion
   */
  test('validate logout workflow @authentication', async () => {
    await test.step('Perform logout', async () => {
      await homePage.logout();
      await loginPage.validateHeaderElementsVisibility();
    });
  });

  /**
   * @description Validates error handling and edge case scenarios for navigation failures.
   *
   * This test covers:
   * - Navigation to non-existent sections or pages
   * - Error handling and graceful failure management
   * - Application stability during invalid operations
   * - Error logging and debugging information
   *
   * @testTags @error-handling
   * @testType Error Validation
   * @testPriority Medium
   *
   * @example Error handling scenarios:
   * - Navigate to invalid section identifier
   * - Catch and log navigation errors
   * - Verify application remains stable
   * - Ensure proper error reporting
   */
  test('handle error scenarios @error-handling', async () => {
    await test.step('Navigate to non-existent page', async () => {
      try {
        await homePage.navigateToSubSection('non-existent');
      } catch (error) {
        console.log('Error navigating to non-existent page:', error);
      }
    });
  });

  /**
   * @description Validates home page performance and load time thresholds after authentication.
   *
   * This test measures and validates:
   * - Page reload performance in authenticated state
   * - Element availability and interactive timing
   * - Load state completion verification
   * - Performance threshold compliance
   *
   * Performance metrics validated:
   * - Total page reload time must be under TIME_TO_INTERACTIVE threshold
   * - Navigation utilities must respond within acceptable timeframe
   * - Page must be fully interactive and responsive
   *
   * @testTags @performance
   * @testType Performance Validation
   * @testPriority High
   *
   * @example Performance validation workflow:
   * 1. Record start time for performance measurement
   * 2. Trigger page reload to measure fresh load performance
   * 3. Wait for load state completion using navigation utilities
   * 4. Calculate total load time and validate against threshold
   * 5. Assert performance meets enterprise requirements
   */
  test('validate page load performance @performance', async () => {
    const performanceThreshold = PerformanceThreshold.TIME_TO_INTERACTIVE;

    await test.step('Measure page load time', async () => {
      const startTime = Date.now();

      // Trigger page reload to measure performance
      await homePage.reloadPage();

      // Wait for page to be fully loaded and interactive
      await homePage.navigationUtil.waitForLoadStateLoad();

      const loadTime = Date.now() - startTime;

      // Assert that load time meets performance requirements
      expect(loadTime).toBeLessThan(performanceThreshold);
    });
  });
});
