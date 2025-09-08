// External library imports
import { Page, Locator } from '@playwright/test';

// Core framework imports
import { BasePage } from '@pages/index';
import { PageUrls, LoginPageConfig } from '@core/constants/ushur';

/**
 * @fileoverview Login Page - Page object for login functionality and validation
 * @description Provides comprehensive login page interactions, element validation, and user authentication operations
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { LoginPage } from '@pages/LoginPage';
 *
 * test('User login flow', async ({ page }) => {
 *   const loginPage = new LoginPage(page);
 *
 *   await loginPage.navigateToLoginPage();
 *   await loginPage.validateLoginPageElements();
 *   await loginPage.login('user@example.com', 'password123');
 * });
 * ```
 */
/**
 * Page object class for login page functionality and validation.
 *
 * @description Handles all login page interactions including navigation, element validation,
 * user authentication, and error message verification. Extends BasePage to inherit common
 * page functionality and browser utilities.
 *
 * @class LoginPage
 * @extends BasePage
 *
 * @example Creating and using LoginPage:
 * ```typescript
 * import { test } from '@playwright/test';
 * import { LoginPage } from '@pages/LoginPage';
 *
 * test('Complete login workflow', async ({ page }) => {
 *   const loginPage = new LoginPage(page);
 *
 *   // Navigate and validate page structure
 *   await loginPage.navigateToLoginPage();
 *   await loginPage.validateLoginPageElements();
 *
 *   // Perform login
 *   await loginPage.login('user@example.com', 'securePassword');
 *
 *   // Validate error scenarios
 *   await loginPage.validateLoginErrorMessage();
 * });
 * ```
 */
export class LoginPage extends BasePage {
  /** Pre-configured locators for all login page elements */
  private readonly elements: Record<string, Locator> = {};

  /**
   * Creates an instance of LoginPage with pre-configured element locators.
   *
   * @param {Page} page - The Playwright Page instance for browser interactions
   *
   * @description Initializes the login page with all necessary element locators using
   * configuration constants. Elements are defined once during construction for optimal
   * performance and consistency.
   *
   * @example
   * ```typescript
   * const loginPage = new LoginPage(page);
   * // All elements are now ready for interaction
   * await loginPage.validateLoginPageElements();
   * ```
   */
  constructor(page: Page) {
    super(page);

    // Initialize all page elements using configuration constants
    this.elements = {
      // Header elements
      ushurLogo: this.locatorUtil.getLocatorByRoleImg({ name: LoginPageConfig.USHUR_LOGO_ALT_TEXT }),
      welcomeBackText: this.locatorUtil.getLocatorByText(LoginPageConfig.WELCOME_TEXT),
      automationThatUnderstandsText: this.locatorUtil.getLocatorByText(LoginPageConfig.AUTOMATION_TEXT),

      // Form elements
      emailInput: this.locatorUtil.getLocatorByRoleTextbox({ name: LoginPageConfig.EMAIL_PLACEHOLDER }),
      passwordInput: this.locatorUtil.getLocatorByRoleTextbox({ name: LoginPageConfig.PASSWORD_PLACEHOLDER }),
      loginButton: this.locatorUtil.getLocatorByRoleButton({ name: LoginPageConfig.LOGIN_BUTTON_TEXT }),

      // Navigation and utility elements
      signUpText: this.locatorUtil.getLocatorByText(LoginPageConfig.SIGNUP_LINK_TEXT),
      forgotPasswordText: this.locatorUtil.getLocatorByText(LoginPageConfig.FORGOT_PASSWORD_TEXT),
      loginErrorMessageText: this.locatorUtil.getLocatorByText(LoginPageConfig.LOGIN_ERROR_MESSAGE),
      tileButtons: this.locatorUtil.getLocator(LoginPageConfig.TILE_BUTTONS),
    };
  }

  /**
   * Navigates to the login page using the configured URL.
   *
   * @returns {Promise<void>} A promise that resolves when navigation is complete
   *
   * @description Uses the predefined login page URL from configuration constants
   * and leverages the parent BasePage navigation utilities for reliable page loading.
   *
   * @example
   * ```typescript
   * const loginPage = new LoginPage(page);
   * await loginPage.navigateToLoginPage();
   * // User is now on the login page
   * ```
   */
  async navigateToLoginPage(): Promise<void> {
    await this.navigateTo(PageUrls.LOGIN);
  }

  /**
   * Validates the visibility of all header elements on the login page.
   *
   * @returns {Promise<void>} A promise that resolves when all header validations pass
   *
   * @description Checks that the Ushur logo, welcome text, and automation description
   * are visible and properly rendered. Useful for verifying page structure integrity.
   *
   * @throws {AssertionError} If any header element is not visible
   *
   * @example
   * ```typescript
   * await loginPage.validateHeaderElements();
   * // Confirms: logo, welcome text, and automation text are visible
   * ```
   */
  async validateHeaderElementsVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementsAreVisible([
      this.elements.ushurLogo,
      this.elements.welcomeBackText,
      this.elements.automationThatUnderstandsText,
    ]);
  }

  /**
   * Validates the visibility of all login form elements.
   *
   * @returns {Promise<void>} A promise that resolves when all form validations pass
   *
   * @description Verifies that email input, password input, and login button are
   * visible and available for user interaction. Essential for form functionality testing.
   *
   * @throws {AssertionError} If any form element is not visible
   *
   * @example
   * ```typescript
   * await loginPage.validateFormElements();
   * // Confirms: email field, password field, and login button are ready
   * ```
   */
  async validateFormElementsVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementsAreVisible([
      this.elements.emailInput,
      this.elements.passwordInput,
      this.elements.loginButton,
    ]);
  }

  /**
   * Validates the visibility of additional navigation and utility links.
   *
   * @returns {Promise<void>} A promise that resolves when all link validations pass
   *
   * @description Checks that sign-up and forgot password links are visible and
   * accessible to users. Important for complete user experience validation.
   *
   * @throws {AssertionError} If any additional link is not visible
   *
   * @example
   * ```typescript
   * await loginPage.validateAdditionalLinks();
   * // Confirms: sign-up link and forgot password link are available
   * ```
   */
  async validateAdditionalLinksVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementsAreVisible([
      this.elements.signUpText,
      this.elements.forgotPasswordText,
    ]);
  }

  /**
   * Validates the presence and visibility of all login page elements.
   *
   * @returns {Promise<void>} A promise that resolves when all page validations pass
   *
   * @description Comprehensive validation method that checks all page sections:
   * header elements, form elements, and additional links. Provides a single
   * entry point for complete page structure validation.
   *
   * @throws {AssertionError} If any page element is not visible
   *
   * @example
   * ```typescript
   * await loginPage.navigateToLoginPage();
   * await loginPage.validateLoginPageElements();
   * // Entire page structure is now validated
   * ```
   */
  async validateLoginPageElementsVisibility(): Promise<void> {
    await this.validateHeaderElementsVisibility();
    await this.validateFormElementsVisibility();
    await this.validateAdditionalLinksVisibility();
  }

  /**
   * Validates if the login error message is displayed on the page.
   *
   * @returns {Promise<void>} A promise that resolves when error message validation passes
   *
   * @description Checks for the visibility of login error messages, typically displayed
   * after failed authentication attempts. Useful for negative testing scenarios.
   *
   * @throws {AssertionError} If the error message is not visible
   *
   * @example
   * ```typescript
   * await loginPage.login('invalid@email.com', 'wrongpassword');
   * await loginPage.validateLoginErrorMessage();
   * // Confirms error message is displayed for invalid credentials
   * ```
   */
  async validateLoginErrorMessageVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.loginErrorMessageText);
  }

  /**
   * Validates tile buttons if they exist on the page.
   *
   * @returns {Promise<void>} A promise that resolves when tile button validations pass
   *
   * @description Verifies the presence and correct count of tile buttons on the login page.
   * Tile buttons may represent different login options or account types.
   *
   * @throws {AssertionError} If tile buttons are not visible or count doesn't match expected value
   *
   * @example
   * ```typescript
   * await loginPage.validateTileButtons();
   * // Confirms tile buttons are present and count matches configuration
   * ```
   */
  async validateTileButtonsVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.tileButtons);
    await this.locatorAssertionUtil.assertElementCount(this.elements.tileButtons, LoginPageConfig.EXPECTED_TILE_COUNT);
  }

  /**
   * Gets a specific tile button by its text content.
   *
   * @param {string} text - The text content of the tile button to locate
   * @returns {Locator} A Playwright Locator for the specific tile button
   *
   * @description Dynamic locator method for finding tile buttons by their visible text.
   * Useful when tile buttons have dynamic content or multiple options are available.
   *
   * @example
   * ```typescript
   * const personalAccountTile = loginPage.getTileButtonByText('Personal Account');
   * const businessAccountTile = loginPage.getTileButtonByText('Business Account');
   *
   * // Use with ElementUtils for interactions
   * await loginPage.elementUtil.click(personalAccountTile);
   * ```
   */
  getTileButtonByText(text: string): Locator {
    return this.elements.tileButtons.getByText(text);
  }

  /**
   * Performs user login with provided credentials.
   *
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @returns {Promise<void>} A promise that resolves when login action is complete
   *
   * @description Fills the email and password fields, then clicks the login button.
   * This method handles the complete login workflow but does not validate the result.
   * Use additional assertions to verify successful login.
   *
   * @example
   * ```typescript
   * // Standard login flow
   * await loginPage.login('user@example.com', 'securePassword123');
   *
   * // Login with error validation
   * await loginPage.login('invalid@email.com', 'wrongpassword');
   * await loginPage.validateLoginErrorMessage();
   * ```
   */
  async login(email: string, password: string): Promise<void> {
    await this.elementUtil.fill(this.elements.emailInput, email);
    await this.elementUtil.fill(this.elements.passwordInput, password);
    await this.elementUtil.click(this.elements.loginButton);
  }

  /**
   * Clicks on a tile button identified by its text content.
   *
   * @param {string} text - The text content of the tile button to click
   * @returns {Promise<void>} A promise that resolves when the click action is complete
   *
   * @description Combines tile button location and click action for convenience.
   * Useful for selecting specific account types or login options represented by tiles.
   *
   * @example
   * ```typescript
   * // Click on specific account type tiles
   * await loginPage.clickTileButtonByText('Personal Account');
   * await loginPage.clickTileButtonByText('Business Account');
   * await loginPage.clickTileButtonByText('Enterprise Account');
   * ```
   */
  async clickTileButtonByText(text: string): Promise<void> {
    await this.getTileButtonByText(text).click();
  }
}
