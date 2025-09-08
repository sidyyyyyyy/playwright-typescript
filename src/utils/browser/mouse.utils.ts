// External library imports
import type { Page } from '@playwright/test';

// Core framework imports
import { MouseButton } from '@core/enums';

/**
 * @fileoverview Mouse Utilities - Comprehensive mouse interaction controls
 * @description Provides precise mouse control including clicks, movements, and scroll operations
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { MouseUtils } from '@utils/browser';
 *
 * const mouseUtils = new MouseUtils(page);
 * await mouseUtils.click(100, 200); // Click at coordinates
 * await mouseUtils.rightClick(150, 250); // Right-click
 * ```
 */

/**
 * Comprehensive mouse action utility class for Playwright.
 *
 * Provides precise mouse control capabilities including:
 * - Left, right, and middle button clicks
 * - Single and double-click operations
 * - Mouse movement and positioning
 * - Press and release actions
 * - Scroll wheel operations in all directions
 *
 * All operations work with pixel-perfect coordinate positioning,
 * making it ideal for testing complex UI interactions.
 *
 * @class MouseUtils
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { MouseUtils } from '@utils/browser';
 *
 * test('Mouse interactions', async ({ page }) => {
 *   const mouseUtils = new MouseUtils(page);
 *
 *   // Click at specific coordinates
 *   await mouseUtils.click(300, 400);
 *
 *   // Right-click for context menu
 *   await mouseUtils.rightClick(250, 300);
 *
 *   // Drag operation
 *   await mouseUtils.press(); // Press down
 *   await mouseUtils.moveTo(400, 500); // Move while pressed
 *   await mouseUtils.release(); // Release
 *
 *   // Scroll wheel
 *   await mouseUtils.scrollDown(100);
 * });
 * ```
 */
export class MouseUtils {
  private readonly page: Page;

  /**
   * Creates a new MouseUtils instance.
   *
   * @param {Page} page - The Playwright Page instance for mouse operations
   * @example
   * ```typescript
   * import { test } from '@playwright/test';
   * import { MouseUtils } from '@utils/browser';
   *
   * test('Create mouse utils', async ({ page }) => {
   *   const mouseUtils = new MouseUtils(page);
   *   // Use mouseUtils for mouse operations
   * });
   * ```
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Clicks at the specified coordinates.
   * @param x - The x-coordinate.
   * @param y - The y-coordinate.
   * @param options - Optional click options.
   */
  async click(
    x: Parameters<Page['mouse']['click']>[0],
    y: Parameters<Page['mouse']['click']>[1],
    options?: Parameters<Page['mouse']['click']>[2]
  ): Promise<void> {
    await this.page.mouse.click(x, y, options);
  }

  /**
   * Double-clicks at the specified coordinates.
   * @param x - The x-coordinate.
   * @param y - The y-coordinate.
   * @param options - Optional double-click options.
   */
  async doubleClick(
    x: Parameters<Page['mouse']['dblclick']>[0],
    y: Parameters<Page['mouse']['dblclick']>[1],
    options?: Parameters<Page['mouse']['dblclick']>[2]
  ): Promise<void> {
    await this.page.mouse.dblclick(x, y, options);
  }

  /**
   * Right-clicks at the specified coordinates.
   * @param x - The x-coordinate.
   * @param y - The y-coordinate.
   * @param options - Optional click options.
   */
  async rightClick(
    x: Parameters<Page['mouse']['click']>[0],
    y: Parameters<Page['mouse']['click']>[1],
    options?: Parameters<Page['mouse']['click']>[2]
  ): Promise<void> {
    await this.click(x, y, { button: MouseButton.RIGHT, ...options });
  }

  /**
   * Right double-clicks at the specified coordinates.
   * @param x - The x-coordinate.
   * @param y - The y-coordinate.
   * @param options - Optional double-click options.
   */
  async rightDoubleClick(
    x: Parameters<Page['mouse']['dblclick']>[0],
    y: Parameters<Page['mouse']['dblclick']>[1],
    options?: Parameters<Page['mouse']['dblclick']>[2]
  ): Promise<void> {
    await this.doubleClick(x, y, { button: MouseButton.RIGHT, ...options });
  }

  /**
   * Middle-clicks at the specified coordinates.
   * @param x - The x-coordinate.
   * @param y - The y-coordinate.
   * @param options - Optional click options.
   */
  async middleClick(
    x: Parameters<Page['mouse']['click']>[0],
    y: Parameters<Page['mouse']['click']>[1],
    options?: Parameters<Page['mouse']['click']>[2]
  ): Promise<void> {
    await this.click(x, y, { button: MouseButton.MIDDLE, ...options });
  }

  /**
   * Middle double-clicks at the specified coordinates.
   * @param x - The x-coordinate.
   * @param y - The y-coordinate.
   * @param options - Optional double-click options.
   */
  async middleDoubleClick(
    x: Parameters<Page['mouse']['dblclick']>[0],
    y: Parameters<Page['mouse']['dblclick']>[1],
    options?: Parameters<Page['mouse']['dblclick']>[2]
  ): Promise<void> {
    await this.doubleClick(x, y, { button: MouseButton.MIDDLE, ...options });
  }

  /**
   * Moves the mouse to the specified coordinates.
   * @param x - The x-coordinate.
   * @param y - The y-coordinate.
   * @param options - Optional move options.
   */
  async moveTo(
    x: Parameters<Page['mouse']['move']>[0],
    y: Parameters<Page['mouse']['move']>[1],
    options?: Parameters<Page['mouse']['move']>[2]
  ): Promise<void> {
    await this.page.mouse.move(x, y, options);
  }

  /**
   * Presses the left mouse button (or specified button).
   * @param options - Optional mouse down options.
   */
  async press(options?: Parameters<Page['mouse']['down']>[0]): Promise<void> {
    await this.page.mouse.down(options);
  }

  /**
   * Presses the right mouse button.
   * @param options - Optional mouse down options.
   */
  async rightPress(options?: Parameters<Page['mouse']['down']>[0]): Promise<void> {
    await this.press({ button: MouseButton.RIGHT, ...options });
  }

  /**
   * Presses the middle mouse button.
   * @param options - Optional mouse down options.
   */
  async middlePress(options?: Parameters<Page['mouse']['down']>[0]): Promise<void> {
    await this.press({ button: MouseButton.MIDDLE, ...options });
  }

  /**
   * Releases the left mouse button (or specified button).
   * @param options - Optional mouse up options.
   */
  async release(options?: Parameters<Page['mouse']['up']>[0]): Promise<void> {
    await this.page.mouse.up(options);
  }

  /**
   * Releases the right mouse button.
   * @param options - Optional mouse up options.
   */
  async rightRelease(options?: Parameters<Page['mouse']['up']>[0]): Promise<void> {
    await this.release({ button: MouseButton.RIGHT, ...options });
  }

  /**
   * Releases the middle mouse button.
   * @param options - Optional mouse up options.
   */
  async middleRelease(options?: Parameters<Page['mouse']['up']>[0]): Promise<void> {
    await this.release({ button: MouseButton.MIDDLE, ...options });
  }

  /**
   * Scrolls the mouse wheel by the specified deltas.
   * @param deltaX - Horizontal scroll amount.
   * @param deltaY - Vertical scroll amount.
   */
  async scroll(
    deltaX: Parameters<Page['mouse']['wheel']>[0],
    deltaY: Parameters<Page['mouse']['wheel']>[1]
  ): Promise<void> {
    await this.page.mouse.wheel(deltaX, deltaY);
  }

  /**
   * Scrolls the mouse wheel up by the specified amount.
   * @param deltaY - Vertical scroll amount (positive value scrolls up).
   */
  async scrollUp(deltaY: Parameters<Page['mouse']['wheel']>[1]): Promise<void> {
    await this.scroll(0, -deltaY);
  }

  /**
   * Scrolls the mouse wheel down by the specified amount.
   * @param deltaY - Vertical scroll amount (positive value scrolls down).
   */
  async scrollDown(deltaY: Parameters<Page['mouse']['wheel']>[1]): Promise<void> {
    await this.scroll(0, deltaY);
  }

  /**
   * Scrolls the mouse wheel left by the specified amount.
   * @param deltaX - Horizontal scroll amount (positive value scrolls left).
   */
  async scrollLeft(deltaX: Parameters<Page['mouse']['wheel']>[0]): Promise<void> {
    await this.scroll(-deltaX, 0);
  }

  /**
   * Scrolls the mouse wheel right by the specified amount.
   * @param deltaX - Horizontal scroll amount (positive value scrolls right).
   */
  async scrollRight(deltaX: Parameters<Page['mouse']['wheel']>[0]): Promise<void> {
    await this.scroll(deltaX, 0);
  }
}
