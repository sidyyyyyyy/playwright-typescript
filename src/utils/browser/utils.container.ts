// External library imports
import type { Page } from '@playwright/test';

// Core framework imports
import {
  LocatorUtils,
  ElementUtils,
  FrameUtils,
  MouseUtils,
  KeyboardUtils,
  NavigationUtils,
  LocatorAssertionUtils,
  PageAssertionUtils,
  GenericAssertionsUtils,
  ApiResponseAssertionsUtils,
} from '@utils/browser';

/**
 * @fileoverview Browser Utils Container - Centralized utility access
 * @description Provides a single access point for all browser utilities with proper dependency injection
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { BrowserUtilsContainer } from '@utils/browser';
 *
 * const utils = new BrowserUtilsContainer(page);
 * await utils.elementUtil.click('#submit');
 * await utils.locatorAssertionUtil.assertElementIsVisible('#success');
 * ```
 */

/**
 * Centralized container for all browser utility classes.
 *
 * Provides a single access point for all browser utilities with proper
 * dependency injection and consistent instance management. This container
 * ensures that all utilities share the same page context and dependencies.
 *
 * Available utilities:
 * - LocatorUtils: Element location strategies
 * - ElementUtils: Element interactions
 * - MouseUtils: Mouse operations
 * - KeyboardUtils: Keyboard input
 * - NavigationUtils: Page navigation
 * - FrameUtils: Frame management
 * - Assertion utilities: UI and API validation
 *
 * @class BrowserUtilsContainer
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { BrowserUtilsContainer } from '@utils/browser';
 *
 * test('Using utilities container', async ({ page }) => {
 *   const utils = new BrowserUtilsContainer(page);
 *
 *   // Element interactions
 *   await utils.elementUtil.fill('#email', 'user@example.com');
 *   await utils.elementUtil.click('#submit');
 *
 *   // Assertions
 *   await utils.locatorAssertionUtil.assertElementIsVisible('#success-message');
 *
 *   // Navigation
 *   await utils.navigationUtil.goBack();
 *
 *   // Get all utilities at once
 *   const allUtils = utils.all;
 *   const { locatorUtil, elementUtil } = allUtils;
 * });
 * ```
 */
export class BrowserUtilsContainer {
  private readonly locatorUtils: LocatorUtils;
  private readonly elementUtils: ElementUtils;
  private readonly locatorAssertionUtils: LocatorAssertionUtils;
  private readonly pageAssertionUtils: PageAssertionUtils;
  private readonly genericAssertionsUtils: GenericAssertionsUtils;
  private readonly apiResponseAssertionsUtils: ApiResponseAssertionsUtils;
  private readonly navigationUtils: NavigationUtils;
  private readonly keyboardUtils: KeyboardUtils;
  private readonly mouseUtils: MouseUtils;
  private readonly frameUtils: FrameUtils;

  /**
   * Creates a new BrowserUtilsContainer instance with all utilities.
   *
   * @param {Page} page - The Playwright Page instance for all utility operations
   * @example
   * ```typescript
   * import { test } from '@playwright/test';
   * import { BrowserUtilsContainer } from '@utils/browser';
   *
   * test('Create utils container', async ({ page }) => {
   *   const utils = new BrowserUtilsContainer(page);
   *   // All utilities are now ready to use
   * });
   * ```
   */
  constructor(page: Page) {
    this.locatorUtils = new LocatorUtils(page);
    this.elementUtils = new ElementUtils(this.locatorUtils);
    this.locatorAssertionUtils = new LocatorAssertionUtils(this.locatorUtils);
    this.pageAssertionUtils = new PageAssertionUtils(page);
    this.genericAssertionsUtils = new GenericAssertionsUtils();
    this.apiResponseAssertionsUtils = new ApiResponseAssertionsUtils();
    this.navigationUtils = new NavigationUtils(page);
    this.keyboardUtils = new KeyboardUtils(page);
    this.mouseUtils = new MouseUtils(page);
    this.frameUtils = new FrameUtils(page, this.locatorUtils);
  }

  get locatorUtil(): LocatorUtils {
    return this.locatorUtils;
  }

  get elementUtil(): ElementUtils {
    return this.elementUtils;
  }

  get locatorAssertionUtil(): LocatorAssertionUtils {
    return this.locatorAssertionUtils;
  }

  get pageAssertionUtil(): PageAssertionUtils {
    return this.pageAssertionUtils;
  }

  get genericAssertionsUtil(): GenericAssertionsUtils {
    return this.genericAssertionsUtils;
  }

  get apiResponseAssertionsUtil(): ApiResponseAssertionsUtils {
    return this.apiResponseAssertionsUtils;
  }

  get navigationUtil(): NavigationUtils {
    return this.navigationUtils;
  }

  get keyboardUtil(): KeyboardUtils {
    return this.keyboardUtils;
  }

  get mouseUtil(): MouseUtils {
    return this.mouseUtils;
  }

  get framesUtil(): FrameUtils {
    return this.frameUtils;
  }

  get all() {
    return {
      locatorUtil: this.locatorUtil,
      elementUtil: this.elementUtil,
      locatorAssertionUtil: this.locatorAssertionUtil,
      pageAssertionUtil: this.pageAssertionUtil,
      genericAssertionsUtil: this.genericAssertionsUtil,
      apiResponseAssertionsUtil: this.apiResponseAssertionsUtil,
      navigationUtil: this.navigationUtil,
      keyboardUtil: this.keyboardUtil,
      mouseUtil: this.mouseUtil,
      framesUtil: this.framesUtil,
    };
  }
}
