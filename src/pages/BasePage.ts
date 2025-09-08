// External library imports
import { Page } from '@playwright/test';

// Core framework imports
import {
  ApiResponseAssertionsUtils,
  BrowserUtilsContainer,
  ElementUtils,
  FrameUtils,
  GenericAssertionsUtils,
  KeyboardUtils,
  LocatorAssertionUtils,
  LocatorUtils,
  MouseUtils,
  NavigationUtils,
  PageAssertionUtils,
} from '@utils/browser';

/**
 * @fileoverview Base Page - Abstract base class for all page objects
 * @description Provides common page functionality and utility access for all page objects in the framework
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * export class LoginPage extends BasePage {
 *   constructor(page: Page) {
 *     super(page);
 *   }
 *
 *   async login(email: string, password: string): Promise<void> {
 *     await this.navigateTo('/login');
 *     await this.elementUtil.fill('[data-testid="email"]', email);
 *     await this.elementUtil.fill('[data-testid="password"]', password);
 *     await this.elementUtil.click('[data-testid="login-button"]');
 *   }
 * }
 * ```
 */
/**
 * Abstract base class for all page objects in the test framework.
 *
 * @description Provides common page functionality and unified access to browser utilities.
 * All page objects should extend this class to inherit standard page operations and utility access.
 *
 * @abstract
 * @class BasePage
 *
 * @example Creating a page object:
 * ```typescript
 * export class HomePage extends BasePage {
 *   private readonly elements = {
 *     header: this.locatorUtil.getLocatorByTestId('main-header'),
 *     loginButton: this.locatorUtil.getLocatorByRole('button', { name: 'Login' })
 *   };
 *
 *   async clickLogin(): Promise<void> {
 *     await this.elementUtil.click(this.elements.loginButton);
 *   }
 * }
 * ```
 */
export abstract class BasePage {
  /** The Playwright Page instance for browser interactions */
  protected readonly page: Page;

  /** Container providing access to all browser utility classes */
  private readonly utils: BrowserUtilsContainer;

  /**
   * Creates an instance of BasePage.
   *
   * @param {Page} page - The Playwright Page instance
   *
   * @example
   * ```typescript
   * class MyPage extends BasePage {
   *   constructor(page: Page) {
   *     super(page);
   *   }
   * }
   * ```
   */
  constructor(page: Page) {
    this.page = page;
    this.utils = new BrowserUtilsContainer(page);
  }

  /**
   * Gets the current page URL.
   *
   * @returns {string} The current page URL
   *
   * @example
   * ```typescript
   * const currentUrl = basePage.getCurrentUrl();
   * console.log('Current URL:', currentUrl);
   * ```
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Gets the current page title.
   *
   * @returns {Promise<string>} A promise that resolves to the page title
   *
   * @example
   * ```typescript
   * const title = await basePage.getPageTitle();
   * expect(title).toBe('Expected Page Title');
   * ```
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Gets the complete HTML content of the page.
   *
   * @returns {Promise<string>} A promise that resolves to the page content as HTML string
   *
   * @example
   * ```typescript
   * const content = await basePage.getPageContent();
   * expect(content).toContain('<div id="main">');
   * ```
   */
  async getPageContent(): Promise<string> {
    return this.page.content();
  }

  /**
   * Navigates to the specified URL with network idle wait strategy.
   *
   * @param {string} url - The URL to navigate to (can be relative or absolute)
   * @returns {Promise<void>} A promise that resolves when navigation is complete
   *
   * @example
   * ```typescript
   * await basePage.navigateTo('/login');
   * await basePage.navigateTo('https://example.com/dashboard');
   * ```
   */
  async navigateTo(url: string): Promise<void> {
    await this.utils.navigationUtil.goTo(url);
  }

  /**
   * Reloads the current page with network idle wait strategy.
   *
   * @returns {Promise<void>} A promise that resolves when the page reload is complete
   *
   * @example
   * ```typescript
   * await basePage.reloadPage();
   * ```
   */
  async reloadPage(): Promise<void> {
    await this.utils.navigationUtil.reload();
  }

  /**
   * Navigates back in browser history with network idle wait strategy.
   *
   * @returns {Promise<void>} A promise that resolves when navigation is complete
   *
   * @example
   * ```typescript
   * await basePage.goBack();
   * ```
   */
  async goBack(): Promise<void> {
    await this.utils.navigationUtil.goBack();
  }

  /**
   * Navigates forward in browser history with network idle wait strategy.
   *
   * @returns {Promise<void>} A promise that resolves when navigation is complete
   *
   * @example
   * ```typescript
   * await basePage.goForward();
   * ```
   */
  async goForward(): Promise<void> {
    await this.utils.navigationUtil.goForward();
  }

  /**
   * Takes a screenshot of the current page.
   *
   * @param {Parameters<Page['screenshot']>[0]} [options] - Optional screenshot configuration
   * @returns {Promise<Buffer>} A promise that resolves to the screenshot buffer
   *
   * @example
   * ```typescript
   * // Take full page screenshot
   * const screenshot = await basePage.takeScreenshot({ fullPage: true });
   *
   * // Take screenshot of specific element
   * const elementScreenshot = await basePage.takeScreenshot({
   *   clip: { x: 0, y: 0, width: 800, height: 600 }
   * });
   * ```
   */
  async takeScreenshot(options?: Parameters<Page['screenshot']>[0]): Promise<Buffer> {
    return this.page.screenshot(options);
  }

  /**
   * Waits for a specified amount of time.
   *
   * @param {number} ms - The number of milliseconds to wait
   * @returns {Promise<void>} A promise that resolves after the specified time
   *
   * @example
   * ```typescript
   * // Wait for 2 seconds
   * await basePage.waitForTimeout(2000);
   * ```
   *
   * @note Use sparingly - prefer waiting for specific conditions using other utilities
   */
  async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Gets the locator utility for element location strategies.
   *
   * @returns {LocatorUtils} The locator utility instance
   *
   * @example
   * ```typescript
   * const loginButton = this.locatorUtil.getLocatorByRole('button', { name: 'Login' });
   * const emailInput = this.locatorUtil.getLocatorByTestId('email-input');
   * ```
   */
  get locatorUtil(): LocatorUtils {
    return this.utils.locatorUtil;
  }

  /**
   * Gets the element utility for element interactions.
   *
   * @returns {ElementUtils} The element utility instance
   *
   * @example
   * ```typescript
   * await this.elementUtil.click(loginButton);
   * await this.elementUtil.fill(emailInput, 'user@example.com');
   * const isVisible = await this.elementUtil.isVisible(element);
   * ```
   */
  get elementUtil(): ElementUtils {
    return this.utils.elementUtil;
  }

  /**
   * Gets the locator assertion utility for element-based assertions.
   *
   * @returns {LocatorAssertionUtils} The locator assertion utility instance
   *
   * @example
   * ```typescript
   * await this.locatorAssertionUtil.assertElementIsVisible(loginButton);
   * await this.locatorAssertionUtil.assertElementHasText(header, 'Welcome');
   * ```
   */
  get locatorAssertionUtil(): LocatorAssertionUtils {
    return this.utils.locatorAssertionUtil;
  }

  /**
   * Gets the page assertion utility for page-level assertions.
   *
   * @returns {PageAssertionUtils} The page assertion utility instance
   *
   * @example
   * ```typescript
   * await this.pageAssertionUtil.assertPageHasTitle('Dashboard');
   * await this.pageAssertionUtil.assertPageHasURL(/\/dashboard/);
   * ```
   */
  get pageAssertionUtil(): PageAssertionUtils {
    return this.utils.pageAssertionUtil;
  }

  /**
   * Gets the generic assertion utility for custom assertions.
   *
   * @returns {GenericAssertionsUtils} The generic assertion utility instance
   *
   * @example
   * ```typescript
   * this.genericAssertionsUtil.assertTruthy(someValue);
   * this.genericAssertionsUtil.assertLength(array, expectedLength);
   * ```
   */
  get genericAssertionsUtil(): GenericAssertionsUtils {
    return this.utils.genericAssertionsUtil;
  }

  /**
   * Gets the API response assertion utility for API testing.
   *
   * @returns {ApiResponseAssertionsUtils} The API response assertion utility instance
   *
   * @example
   * ```typescript
   * this.apiResponseAssertionsUtil.assertResponseStatusToBe(response, 200);
   * await this.apiResponseAssertionsUtil.assertResponseJsonToHaveProperty(response, 'data');
   * ```
   */
  get apiResponseAssertionsUtil(): ApiResponseAssertionsUtils {
    return this.utils.apiResponseAssertionsUtil;
  }

  /**
   * Gets the navigation utility for page navigation operations.
   *
   * @returns {NavigationUtils} The navigation utility instance
   *
   * @example
   * ```typescript
   * await this.navigationUtil.goTo('/dashboard');
   * await this.navigationUtil.waitForURL(/\/dashboard/);
   * ```
   */
  get navigationUtil(): NavigationUtils {
    return this.utils.navigationUtil;
  }

  /**
   * Gets the keyboard utility for keyboard interactions.
   *
   * @returns {KeyboardUtils} The keyboard utility instance
   *
   * @example
   * ```typescript
   * await this.keyboardUtil.press('Enter');
   * await this.keyboardUtil.type('Hello World');
   * ```
   */
  get keyboardUtil(): KeyboardUtils {
    return this.utils.keyboardUtil;
  }

  /**
   * Gets the mouse utility for mouse interactions.
   *
   * @returns {MouseUtils} The mouse utility instance
   *
   * @example
   * ```typescript
   * await this.mouseUtil.click(100, 200);
   * await this.mouseUtil.doubleClick(150, 300);
   * ```
   */
  get mouseUtil(): MouseUtils {
    return this.utils.mouseUtil;
  }

  /**
   * Gets the frames utility for iframe and frame handling.
   *
   * @returns {FrameUtils} The frames utility instance
   *
   * @example
   * ```typescript
   * const frame = this.framesUtil.getFrameByName('payment-frame');
   * const elementInFrame = this.framesUtil.getLocatorInFrame(frame, '#submit-button');
   * ```
   */
  get framesUtil(): FrameUtils {
    return this.utils.framesUtil;
  }
}
