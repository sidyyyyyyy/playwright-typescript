// External library imports
import type { Page } from '@playwright/test';

/**
 * @fileoverview Keyboard Utilities - Advanced keyboard input simulation
 * @description Provides comprehensive keyboard interaction methods for text input and key combinations
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { KeyboardUtils } from '@utils/browser';
 *
 * const keyboardUtils = new KeyboardUtils(page);
 * await keyboardUtils.type('Hello World');
 * await keyboardUtils.press('Enter');
 * ```
 */

/**
 * Advanced keyboard interaction utility class.
 *
 * Provides comprehensive keyboard simulation capabilities including:
 * - Text typing with configurable delays
 * - Key press and release operations
 * - Key combinations and modifiers
 * - Direct text insertion without events
 * - Hold and release patterns
 *
 * This class simulates realistic keyboard input patterns and supports
 * both character input and special key operations.
 *
 * @class KeyboardUtils
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { KeyboardUtils } from '@utils/browser';
 *
 * test('Keyboard interactions', async ({ page }) => {
 *   const keyboardUtils = new KeyboardUtils(page);
 *
 *   // Type text naturally
 *   await keyboardUtils.type('Hello World', { delay: 100 });
 *
 *   // Press key combinations
 *   await keyboardUtils.press('Control+A'); // Select all
 *   await keyboardUtils.press('Control+C'); // Copy
 *
 *   // Hold and release pattern
 *   await keyboardUtils.pressAndHold('Shift');
 *   await keyboardUtils.press('ArrowDown'); // Shift+ArrowDown
 *   await keyboardUtils.release('Shift');
 * });
 * ```
 */
export class KeyboardUtils {
  private readonly page: Page;

  /**
   * Creates a new KeyboardUtils instance.
   *
   * @param {Page} page - The Playwright Page instance for keyboard operations
   * @example
   * ```typescript
   * import { test } from '@playwright/test';
   * import { KeyboardUtils } from '@utils/browser';
   *
   * test('Create keyboard utils', async ({ page }) => {
   *   const keyboardUtils = new KeyboardUtils(page);
   *   // Use keyboardUtils for keyboard operations
   * });
   * ```
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Types the specified text as if a user were typing.
   * @param text - The text to type.
   * @param options - Optional typing options (e.g., delay).
   */
  async type(
    text: Parameters<Page['keyboard']['type']>[0],
    options?: Parameters<Page['keyboard']['type']>[1]
  ): Promise<void> {
    await this.page.keyboard.type(text, options);
  }

  /**
   * Presses and releases a key (optionally with modifiers or delay).
   * @param key - The key or key combination to press (e.g., 'Enter', 'Shift+A').
   * @param options - Optional press options (e.g., delay).
   */
  async press(
    key: Parameters<Page['keyboard']['press']>[0],
    options?: Parameters<Page['keyboard']['press']>[1]
  ): Promise<void> {
    await this.page.keyboard.press(key, options);
  }

  /**
   * Presses and holds a key down (does not release).
   * @param key - The key to hold down.
   */
  async pressAndHold(key: Parameters<Page['keyboard']['down']>[0]): Promise<void> {
    await this.page.keyboard.down(key);
  }

  /**
   * Releases a key that was previously pressed down.
   * @param key - The key to release.
   */
  async release(key: Parameters<Page['keyboard']['up']>[0]): Promise<void> {
    await this.page.keyboard.up(key);
  }

  /**
   * Directly inserts the specified text into the focused element (no key events).
   * @param text - The text to insert.
   */
  async insertText(text: Parameters<Page['keyboard']['insertText']>[0]): Promise<void> {
    await this.page.keyboard.insertText(text);
  }
}
