// External library imports
import type { Locator } from '@playwright/test';

/**
 * @fileoverview UI Types - User interface interaction and navigation interfaces
 * @description Type definitions for UI element interaction and navigation structures
 * @author Anand Sogalad
 */

/**
 * Navigation item for UI navigation menus.
 * @description Structure for defining navigation menu items with locators and validation
 * @example const subSection = (text: string, urlPattern: string): SubSection => ({
      link: page.locator('div.menu-item.text-dark-blue', { hasText: text }),
      expectedUrl: new RegExp(urlPattern),
    });
 */
export interface SubSection {
  link: Locator;
  expectedUrl: RegExp;
  text?: string;
  isVisible?: boolean;
}

/**
 * Locator definition for UI elements.
 * @description Configuration for finding and interacting with UI elements
 * @example const locator: ElementLocator = { selector: '#login-button', type: 'css', description: 'Login button' };
 */
export interface ElementLocator {
  selector: string;
  type: 'css' | 'xpath' | 'text' | 'role' | 'testId' | 'label';
  description?: string;
  timeout?: number;
  waitForState?: 'visible' | 'hidden' | 'stable' | 'attached' | 'detached';
}
