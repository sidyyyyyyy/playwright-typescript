// External library imports
import type { Page, Response } from '@playwright/test';

// Core framework imports
import { WaitUntil } from '@core/enums';

/**
 * @fileoverview Navigation Utilities - Browser navigation and load state management
 * @description Provides navigation controls with intelligent wait strategies for reliable page loads
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { NavigationUtils } from '@utils/browser';
 *
 * const navUtils = new NavigationUtils(page);
 * await navUtils.goTo('https://example.com');
 * await navUtils.waitForLoadStateNetworkIdle();
 * ```
 */

/**
 * Comprehensive navigation utility class for browser operations.
 *
 * Provides intelligent navigation capabilities with:
 * - URL navigation with customizable wait strategies
 * - Browser history management (back/forward)
 * - Page reload operations
 * - Load state monitoring (load, DOMContentLoaded, networkidle)
 * - URL pattern waiting
 *
 * All navigation methods support configurable wait strategies to ensure
 * reliable page loads and reduce test flakiness.
 *
 * @class NavigationUtils
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { NavigationUtils } from '@utils/browser';
 *
 * test('Navigation example', async ({ page }) => {
 *   const navUtils = new NavigationUtils(page);
 *
 *   // Navigate to URL
 *   await navUtils.goTo('https://example.com');
 *
 *   // Wait for network to be idle
 *   await navUtils.waitForLoadStateNetworkIdle();
 *
 *   // Navigate back
 *   await navUtils.goBack();
 *
 *   // Wait for specific URL pattern
 *   await navUtils.waitForURL(/dashboard/);
 * });
 * ```
 */
export class NavigationUtils {
  private readonly page: Page;

  /**
   * Creates a new NavigationUtils instance.
   *
   * @param {Page} page - The Playwright Page instance for navigation operations
   * @example
   * ```typescript
   * import { test } from '@playwright/test';
   * import { NavigationUtils } from '@utils/browser';
   *
   * test('Create navigation utils', async ({ page }) => {
   *   const navUtils = new NavigationUtils(page);
   *   // Use navUtils for navigation operations
   * });
   * ```
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to URL with network idle wait strategy.
   * @param url - URL to navigate to
   * @param options - Navigation options
   * @returns Promise resolving to response or null
   */
  async goTo(url: Parameters<Page['goto']>[0], options?: Parameters<Page['goto']>[1]): Promise<null | Response> {
    return await this.page.goto(url, options);
  }

  /**
   * Reloads page with network idle wait strategy.
   * @param options - Reload options
   * @returns Promise resolving to response or null
   */
  async reload(options?: Parameters<Page['reload']>[0]): Promise<null | Response> {
    return await this.page.reload(options);
  }

  /**
   * Navigates back in browser history with network idle wait strategy.
   * @param options - Navigation options
   * @returns Promise resolving to response or null
   */
  async goBack(options?: Parameters<Page['goBack']>[0]): Promise<null | Response> {
    return await this.page.goBack(options);
  }

  /**
   * Navigates forward in browser history with network idle wait strategy.
   * @param options - Navigation options
   * @returns Promise resolving to response or null
   */
  async goForward(options?: Parameters<Page['goForward']>[0]): Promise<null | Response> {
    return await this.page.goForward(options);
  }

  /**
   * Waits for URL to match pattern with network idle wait strategy.
   * @param url - URL pattern to wait for
   * @param options - Wait options
   */
  async waitForURL(url: Parameters<Page['waitForURL']>[0], options?: Parameters<Page['waitForURL']>[1]): Promise<void> {
    await this.page.waitForURL(url, options);
  }

  /**
   * Waits for a specific load state to be reached.
   * @param state - The load state to wait for
   * @param options - Wait options
   */
  protected async waitForLoadState(
    state: Parameters<Page['waitForLoadState']>[0],
    options?: Parameters<Page['waitForLoadState']>[1]
  ): Promise<void> {
    await this.page.waitForLoadState(state, options);
  }

  /**
   * Waits for 'load' event to complete.
   * @param options - Wait options
   */
  async waitForLoadStateLoad(options?: Parameters<Page['waitForLoadState']>[1]): Promise<void> {
    await this.waitForLoadState(WaitUntil.LOAD, options);
  }

  /**
   * Waits for DOM content loaded event.
   * @param options - Wait options
   */
  async waitForLoadStateDomContentLoaded(options?: Parameters<Page['waitForLoadState']>[1]): Promise<void> {
    await this.waitForLoadState(WaitUntil.DOMCONTENTLOADED, options);
  }

  /**
   * Waits for network to be idle.
   * @param options - Wait options
   */
  async waitForLoadStateNetworkIdle(options?: Parameters<Page['waitForLoadState']>[1]): Promise<void> {
    await this.waitForLoadState(WaitUntil.NETWORKIDLE, options);
  }

  /**
   * Closes the current page.
   * @param options - Close options
   */
  async close(options?: Parameters<Page['close']>[0]): Promise<void> {
    await this.page.close(options);
  }
}
