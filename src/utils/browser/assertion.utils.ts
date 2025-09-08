// External library imports
import type { APIResponse, Locator, LocatorAssertions, Page, PageAssertions } from '@playwright/test';
import { expect } from '@playwright/test';

// Core framework imports
import type { LocatorUtils } from '@utils/browser';

/**
 * @fileoverview Assertion Utilities - Comprehensive test assertion framework
 * @description Provides extensive assertion methods for UI elements, pages, and API responses
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { LocatorAssertionUtils, LocatorUtils } from '@utils/browser';
 *
 * const locatorUtils = new LocatorUtils(page);
 * const assertions = new LocatorAssertionUtils(locatorUtils);
 *
 * await assertions.assertElementIsVisible('#submit-button');
 * await assertions.assertElementHasText('#title', 'Welcome');
 * ```
 */

/**
 * Comprehensive locator-based assertion utility class.
 *
 * Provides extensive assertion capabilities for UI elements including:
 * - Visibility and state assertions (visible, hidden, enabled, disabled)
 * - Content assertions (text, value, attributes, CSS properties)
 * - Form element assertions (checked, focused, editable)
 * - Accessibility assertions (accessible name, description, role)
 * - Count and screenshot assertions
 *
 * All assertions automatically resolve selectors to locators and provide
 * detailed error messages for test debugging.
 *
 * @class LocatorAssertionUtils
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { LocatorAssertionUtils, LocatorUtils } from '@utils/browser';
 *
 * test('UI assertions', async ({ page }) => {
 *   const locatorUtils = new LocatorUtils(page);
 *   const assertions = new LocatorAssertionUtils(locatorUtils);
 *
 *   // State assertions
 *   await assertions.assertElementIsVisible('#login-form');
 *   await assertions.assertElementIsEnabled('#submit-button');
 *
 *   // Content assertions
 *   await assertions.assertElementHasText('h1', 'Dashboard');
 *   await assertions.assertElementHasValue('#username', 'john@example.com');
 *
 *   // Accessibility assertions
 *   await assertions.assertElementHasAccessibleName('#submit', 'Submit Form');
 * });
 * ```
 */
export class LocatorAssertionUtils {
  private readonly locatorUtils: LocatorUtils;

  /**
   * Creates a new LocatorAssertionUtils instance.
   *
   * @param {LocatorUtils} locatorUtils - LocatorUtils instance for element location and resolution
   * @example
   * ```typescript
   * import { test } from '@playwright/test';
   * import { LocatorAssertionUtils, LocatorUtils } from '@utils/browser';
   *
   * test('Create assertion utils', async ({ page }) => {
   *   const locatorUtils = new LocatorUtils(page);
   *   const assertions = new LocatorAssertionUtils(locatorUtils);
   *   // Use assertions for UI validation
   * });
   * ```
   */
  constructor(locatorUtils: LocatorUtils) {
    this.locatorUtils = locatorUtils;
  }

  /**
   * Asserts that an element is visible.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeVisibleOptions - Optional toBeVisible assertion options.
   */
  async assertElementIsVisible(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeVisibleOptions?: Parameters<LocatorAssertions['toBeVisible']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeVisible(toBeVisibleOptions);
  }

  /**
   * Asserts that multiple elements are visible.
   * @param selectorOrLocators - CSS selector, XPath, or Locator objects.
   * @param locatorOptions - Optional locator options.
   * @param toBeVisibleOptions - Optional toBeVisible assertion options.
   */
  async assertElementsAreVisible(
    selectorOrLocators: Parameters<Page['locator']>[0][] | Locator[],
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeVisibleOptions?: Parameters<LocatorAssertions['toBeVisible']>[0]
  ): Promise<void> {
    for (const selectorOrLocator of selectorOrLocators) {
      await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeVisible(toBeVisibleOptions);
    }
  }

  /**
   * Asserts that an element is not visible.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param notToBeVisibleOptions - Optional not.toBeVisible assertion options.
   */
  async assertElementIsNotVisible(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    notToBeVisibleOptions?: Parameters<LocatorAssertions['toBeVisible']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).not.toBeVisible(
      notToBeVisibleOptions
    );
  }

  /**
   * Asserts that an element is hidden.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeHiddenOptions - Optional toBeHidden assertion options.
   */
  async assertElementIsHidden(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeHiddenOptions?: Parameters<LocatorAssertions['toBeHidden']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeHidden(toBeHiddenOptions);
  }

  /**
   * Asserts that an element is not hidden.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param notToBeHiddenOptions - Optional not.toBeHidden assertion options.
   */
  async assertElementIsNotHidden(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    notToBeHiddenOptions?: Parameters<LocatorAssertions['toBeHidden']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).not.toBeHidden(
      notToBeHiddenOptions
    );
  }

  /**
   * Asserts that an element is enabled.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeEnabledOptions - Optional toBeEnabled assertion options.
   */
  async assertElementIsEnabled(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeEnabledOptions?: Parameters<LocatorAssertions['toBeEnabled']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeEnabled(toBeEnabledOptions);
  }

  /**
   * Asserts that an element is not enabled.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param notToBeEnabledOptions - Optional not.toBeEnabled assertion options.
   */
  async assertElementIsNotEnabled(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    notToBeEnabledOptions?: Parameters<LocatorAssertions['toBeEnabled']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).not.toBeEnabled(
      notToBeEnabledOptions
    );
  }

  /**
   * Asserts that an element is disabled.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeDisabledOptions - Optional toBeDisabled assertion options.
   */
  async assertElementIsDisabled(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeDisabledOptions?: Parameters<LocatorAssertions['toBeDisabled']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeDisabled(toBeDisabledOptions);
  }

  /**
   * Asserts that an element is not disabled.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param notToBeDisabledOptions - Optional not.toBeDisabled assertion options.
   */
  async assertElementIsNotDisabled(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    notToBeDisabledOptions?: Parameters<LocatorAssertions['toBeDisabled']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).not.toBeDisabled(
      notToBeDisabledOptions
    );
  }

  /**
   * Asserts that an element is focused.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeFocusedOptions - Optional toBeFocused assertion options.
   */
  async assertElementIsFocused(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeFocusedOptions?: Parameters<LocatorAssertions['toBeFocused']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeFocused(toBeFocusedOptions);
  }

  /**
   * Asserts that an element is not focused.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param notToBeFocusedOptions - Optional not.toBeFocused assertion options.
   */
  async assertElementIsNotFocused(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    notToBeFocusedOptions?: Parameters<LocatorAssertions['toBeFocused']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).not.toBeFocused(
      notToBeFocusedOptions
    );
  }

  /**
   * Asserts that an element is checked.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeCheckedOptions - Optional toBeChecked assertion options.
   */
  async assertElementIsChecked(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeCheckedOptions?: Parameters<LocatorAssertions['toBeChecked']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeChecked(toBeCheckedOptions);
  }

  /**
   * Asserts that an element is not checked.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param notToBeCheckedOptions - Optional not.toBeChecked assertion options.
   */
  async assertElementIsNotChecked(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    notToBeCheckedOptions?: Parameters<LocatorAssertions['toBeChecked']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).not.toBeChecked(
      notToBeCheckedOptions
    );
  }

  /**
   * Asserts that an element has the specified text content.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedText - The expected text content.
   * @param locatorOptions - Optional locator options.
   * @param toHaveTextOptions - Optional toHaveText assertion options.
   */
  async assertElementHasText(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedText: Parameters<LocatorAssertions['toHaveText']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveTextOptions?: Parameters<LocatorAssertions['toHaveText']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveText(
      expectedText,
      toHaveTextOptions
    );
  }

  /**
   * Asserts that an element contains the specified text.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedText - The expected text to be contained.
   * @param locatorOptions - Optional locator options.
   * @param toContainTextOptions - Optional toContainText assertion options.
   */
  async assertElementContainsText(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedText: Parameters<LocatorAssertions['toContainText']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toContainTextOptions?: Parameters<LocatorAssertions['toContainText']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toContainText(
      expectedText,
      toContainTextOptions
    );
  }

  /**
   * Asserts that an input element has the specified value.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedValue - The expected input value.
   * @param locatorOptions - Optional locator options.
   * @param toHaveValueOptions - Optional toHaveValue assertion options.
   */
  async assertElementHasValue(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedValue: Parameters<LocatorAssertions['toHaveValue']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveValueOptions?: Parameters<LocatorAssertions['toHaveValue']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveValue(
      expectedValue,
      toHaveValueOptions
    );
  }

  /**
   * Asserts that an element has the specified attribute with the given value.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param attributeName - The name of the attribute to check.
   * @param expectedValue - The expected attribute value.
   * @param locatorOptions - Optional locator options.
   * @param toHaveAttributeOptions - Optional toHaveAttribute assertion options.
   */
  async assertElementHasAttribute(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    attributeName: string,
    expectedValue: Parameters<LocatorAssertions['toHaveAttribute']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveAttributeOptions?: Parameters<LocatorAssertions['toHaveAttribute']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveAttribute(
      attributeName,
      expectedValue,
      toHaveAttributeOptions
    );
  }

  /**
   * Asserts that an element has the specified CSS class.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedClass - The expected CSS class name.
   * @param locatorOptions - Optional locator options.
   * @param toHaveClassOptions - Optional toHaveClass assertion options.
   */
  async assertElementHasClass(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedClass: Parameters<LocatorAssertions['toHaveClass']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveClassOptions?: Parameters<LocatorAssertions['toHaveClass']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveClass(
      expectedClass,
      toHaveClassOptions
    );
  }

  /**
   * Asserts that an element has the specified CSS property with the given value.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param propertyName - The name of the CSS property to check.
   * @param expectedValue - The expected CSS property value.
   * @param locatorOptions - Optional locator options.
   * @param toHaveCSSOptions - Optional toHaveCSS assertion options.
   */
  async assertElementHasCSS(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    propertyName: string,
    expectedValue: Parameters<LocatorAssertions['toHaveCSS']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveCSSOptions?: Parameters<LocatorAssertions['toHaveCSS']>[2]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveCSS(
      propertyName,
      expectedValue,
      toHaveCSSOptions
    );
  }

  /**
   * Asserts that a locator matches the expected number of elements.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedCount - The expected number of elements.
   * @param locatorOptions - Optional locator options.
   * @param toHaveCountOptions - Optional toHaveCount assertion options.
   */
  async assertElementCount(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedCount: number,
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveCountOptions?: Parameters<LocatorAssertions['toHaveCount']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveCount(
      expectedCount,
      toHaveCountOptions
    );
  }

  /**
   * Asserts that an element is empty (has no text content).
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeEmptyOptions - Optional toBeEmpty assertion options.
   */
  async assertElementIsEmpty(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeEmptyOptions?: Parameters<LocatorAssertions['toBeEmpty']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeEmpty(toBeEmptyOptions);
  }

  /**
   * Asserts that an element is not empty (has text content).
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param notToBeEmptyOptions - Optional not.toBeEmpty assertion options.
   */
  async assertElementIsNotEmpty(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    notToBeEmptyOptions?: Parameters<LocatorAssertions['toBeEmpty']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).not.toBeEmpty(
      notToBeEmptyOptions
    );
  }

  /**
   * Asserts that an element has the specified accessible name.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedName - The expected accessible name.
   * @param locatorOptions - Optional locator options.
   * @param toHaveAccessibleNameOptions - Optional toHaveAccessibleName assertion options.
   */
  async assertElementHasAccessibleName(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedName: Parameters<LocatorAssertions['toHaveAccessibleName']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveAccessibleNameOptions?: Parameters<LocatorAssertions['toHaveAccessibleName']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveAccessibleName(
      expectedName,
      toHaveAccessibleNameOptions
    );
  }

  /**
   * Asserts that an element has the specified accessible description.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedDescription - The expected accessible description.
   * @param locatorOptions - Optional locator options.
   * @param toHaveAccessibleDescriptionOptions - Optional toHaveAccessibleDescription assertion options.
   */
  async assertElementHasAccessibleDescription(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedDescription: Parameters<LocatorAssertions['toHaveAccessibleDescription']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveAccessibleDescriptionOptions?: Parameters<LocatorAssertions['toHaveAccessibleDescription']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveAccessibleDescription(
      expectedDescription,
      toHaveAccessibleDescriptionOptions
    );
  }

  /**
   * Asserts that an element has the specified screenshot.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedScreenshot - The expected screenshot name or path.
   * @param locatorOptions - Optional locator options.
   * @param toHaveScreenshotOptions - Optional toHaveScreenshot assertion options.
   */
  async assertElementScreenshot(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedScreenshot: string,
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveScreenshotOptions?: Parameters<LocatorAssertions['toHaveScreenshot']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveScreenshot(
      expectedScreenshot,
      toHaveScreenshotOptions
    );
  }

  /**
   * Asserts that an element is attached to the DOM.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeAttachedOptions - Optional toBeAttached assertion options.
   */
  async assertElementIsAttached(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeAttachedOptions?: Parameters<LocatorAssertions['toBeAttached']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeAttached(toBeAttachedOptions);
  }

  /**
   * Asserts that an element is editable.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeEditableOptions - Optional toBeEditable assertion options.
   */
  async assertElementIsEditable(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeEditableOptions?: Parameters<LocatorAssertions['toBeEditable']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeEditable(toBeEditableOptions);
  }

  /**
   * Asserts that an element is in the viewport.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param locatorOptions - Optional locator options.
   * @param toBeInViewportOptions - Optional toBeInViewport assertion options.
   */
  async assertElementIsInViewport(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    toBeInViewportOptions?: Parameters<LocatorAssertions['toBeInViewport']>[0]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toBeInViewport(
      toBeInViewportOptions
    );
  }

  /**
   * Asserts that an element has the specified ID.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedId - The expected element ID.
   * @param locatorOptions - Optional locator options.
   * @param toHaveIdOptions - Optional toHaveId assertion options.
   */
  async assertElementHasId(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedId: Parameters<LocatorAssertions['toHaveId']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveIdOptions?: Parameters<LocatorAssertions['toHaveId']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveId(
      expectedId,
      toHaveIdOptions
    );
  }

  /**
   * Asserts that an element has the specified JavaScript property.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param propertyName - The name of the JavaScript property.
   * @param expectedValue - The expected property value.
   * @param locatorOptions - Optional locator options.
   * @param toHaveJSPropertyOptions - Optional toHaveJSProperty assertion options.
   */
  async assertElementHasJSProperty(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    propertyName: Parameters<LocatorAssertions['toHaveJSProperty']>[0],
    expectedValue: Parameters<LocatorAssertions['toHaveJSProperty']>[1],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveJSPropertyOptions?: Parameters<LocatorAssertions['toHaveJSProperty']>[2]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveJSProperty(
      propertyName,
      expectedValue,
      toHaveJSPropertyOptions
    );
  }

  /**
   * Asserts that a select element has the specified options selected.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedValues - Array of expected selected values.
   * @param locatorOptions - Optional locator options.
   * @param toHaveValuesOptions - Optional toHaveValues assertion options.
   */
  async assertElementHasValues(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedValues: Parameters<LocatorAssertions['toHaveValues']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveValuesOptions?: Parameters<LocatorAssertions['toHaveValues']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveValues(
      expectedValues,
      toHaveValuesOptions
    );
  }

  /**
   * Asserts that an element has the specified role.
   * @param selectorOrLocator - CSS selector, XPath, or Locator object.
   * @param expectedRole - The expected ARIA role.
   * @param locatorOptions - Optional locator options.
   * @param toHaveRoleOptions - Optional toHaveRole assertion options.
   */
  async assertElementRole(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    expectedRole: Parameters<LocatorAssertions['toHaveRole']>[0],
    locatorOptions?: Parameters<Page['locator']>[1],
    toHaveRoleOptions?: Parameters<LocatorAssertions['toHaveRole']>[1]
  ): Promise<void> {
    await expect(this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions)).toHaveRole(
      expectedRole,
      toHaveRoleOptions
    );
  }
}

/**
 * Utility class for page-level assertions.
 */
export class PageAssertionUtils {
  private readonly page: Page;

  /**
   * Creates an instance of PageAssertionUtils.
   * @param page - The Playwright Page instance to operate on.
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Asserts that the page has the specified URL.
   * @param expectedURL - The expected URL (string or regex).
   * @param toHaveURLOptions - Optional toHaveURL assertion options.
   */
  async assertPageHasURL(
    expectedURL: Parameters<PageAssertions['toHaveURL']>[0],
    toHaveURLOptions?: Parameters<PageAssertions['toHaveURL']>[1]
  ): Promise<void> {
    await expect(this.page).toHaveURL(expectedURL, toHaveURLOptions);
  }

  /**
   * Asserts that the page title matches the expected value.
   * @param expectedTitle - The expected page title (string or regex).
   * @param toHaveTitleOptions - Optional toHaveTitle assertion options.
   */
  async assertPageHasTitle(
    expectedTitle: Parameters<PageAssertions['toHaveTitle']>[0],
    toHaveTitleOptions?: Parameters<PageAssertions['toHaveTitle']>[1]
  ): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle, toHaveTitleOptions);
  }

  /**
   * Asserts that the page has the specified screenshot.
   * @param expectedScreenshot - The expected screenshot name or path.
   * @param toHaveScreenshotOptions - Optional toHaveScreenshot assertion options.
   */
  async assertPageScreenshot(
    expectedScreenshot: string,
    toHaveScreenshotOptions?: Parameters<PageAssertions['toHaveScreenshot']>[0]
  ): Promise<void> {
    await expect(this.page).toHaveScreenshot(expectedScreenshot, toHaveScreenshotOptions);
  }
}

/**
 * Utility class for generic assertions.
 */
export class GenericAssertionsUtils {
  /**
   * Asserts that a value is truthy.
   * @param value - The value to check.
   */
  assertTruthy(value: any): void {
    expect(value).toBeTruthy();
  }

  /**
   * Asserts that a value is falsy.
   * @param value - The value to check.
   */
  assertFalsy(value: any): void {
    expect(value).toBeFalsy();
  }

  /**
   * Asserts that a value is null.
   * @param value - The value to check.
   */
  assertNull(value: any): void {
    expect(value).toBeNull();
  }

  /**
   * Asserts that a value is not null.
   * @param value - The value to check.
   */
  assertNotNull(value: any): void {
    expect(value).not.toBeNull();
  }

  /**
   * Asserts that a value is undefined.
   * @param value - The value to check.
   */
  assertUndefined(value: any): void {
    expect(value).toBeUndefined();
  }

  /**
   * Asserts that a value is not undefined.
   * @param value - The value to check.
   */
  assertNotUndefined(value: any): void {
    expect(value).not.toBeUndefined();
  }

  /**
   * Asserts that a value is NaN.
   * @param value - The value to check.
   */
  assertNaN(value: any): void {
    expect(value).toBeNaN();
  }

  /**
   * Asserts that a value is not NaN.
   * @param value - The value to check.
   */
  assertNotNaN(value: any): void {
    expect(value).not.toBeNaN();
  }

  /**
   * Asserts that a value is greater than the expected value.
   * @param value - The value to check.
   * @param expected - The expected value to compare against.
   */
  assertGreaterThan(value: number, expected: number): void {
    expect(value).toBeGreaterThan(expected);
  }

  /**
   * Asserts that a value is greater than or equal to the expected value.
   * @param value - The value to check.
   * @param expected - The expected value to compare against.
   */
  assertGreaterThanOrEqual(value: number, expected: number): void {
    expect(value).toBeGreaterThanOrEqual(expected);
  }

  /**
   * Asserts that a value is less than the expected value.
   * @param value - The value to check.
   * @param expected - The expected value to compare against.
   */
  assertLessThan(value: number, expected: number): void {
    expect(value).toBeLessThan(expected);
  }

  /**
   * Asserts that a value is less than or equal to the expected value.
   * @param value - The value to check.
   * @param expected - The expected value to compare against.
   */
  assertLessThanOrEqual(value: number, expected: number): void {
    expect(value).toBeLessThanOrEqual(expected);
  }

  /**
   * Asserts that a value is close to the expected value within a specified tolerance.
   * @param value - The value to check.
   * @param expected - The expected value to compare against.
   * @param numDigits - The number of decimal digits after the decimal point that must be equal.
   */
  assertCloseTo(value: number, expected: number, numDigits?: number): void {
    expect(value).toBeCloseTo(expected, numDigits);
  }

  /**
   * Asserts that a value matches a regular expression.
   * @param value - The value to check.
   * @param expected - The expected regular expression.
   */
  assertMatches(value: string, expected: RegExp | string): void {
    expect(value).toMatch(expected);
  }

  /**
   * Asserts that a value does not match a regular expression.
   * @param value - The value to check.
   * @param expected - The expected regular expression.
   */
  assertNotMatches(value: string, expected: RegExp | string): void {
    expect(value).not.toMatch(expected);
  }

  /**
   * Asserts that a value contains the expected substring.
   * @param value - The value to check.
   * @param expected - The expected substring.
   */
  assertContains(value: string | any[], expected: any): void {
    expect(value).toContain(expected);
  }

  /**
   * Asserts that a value does not contain the expected substring.
   * @param value - The value to check.
   * @param expected - The expected substring.
   */
  assertNotContains(value: string | any[], expected: any): void {
    expect(value).not.toContain(expected);
  }

  /**
   * Asserts that a value has the expected length.
   * @param value - The value to check.
   * @param expected - The expected length.
   */
  assertLength(value: string | any[], expected: number): void {
    expect(value).toHaveLength(expected);
  }

  /**
   * Asserts that a value has the expected property.
   * @param value - The value to check.
   * @param property - The property name.
   */
  assertHasProperty(value: any, property: string): void {
    expect(value).toHaveProperty(property);
  }

  /**
   * Asserts that a value has the expected property with the given value.
   * @param value - The value to check.
   * @param property - The property name.
   * @param expectedValue - The expected property value.
   */
  assertPropertyValue(value: any, property: string, expectedValue: any): void {
    expect(value).toHaveProperty(property, expectedValue);
  }

  /**
   * Asserts that a value matches a snapshot.
   * @param value - The value to check.
   * @param expectedSnapshot - The expected snapshot name or path.
   */
  assertMatchesSnapshot(value: any, expectedSnapshot: string): void {
    expect(value).toMatchSnapshot(expectedSnapshot);
  }

  /**
   * Asserts that a value matches a snapshot with a custom name.
   * @param value - The value to check.
   * @param name - The snapshot name.
   */
  assertMatchesNamedSnapshot(value: any, name: string): void {
    expect(value).toMatchSnapshot(name);
  }
}

/**
 * Utility class for API response assertions.
 */
export class ApiResponseAssertionsUtils {
  /**
   * Asserts that an API response has the expected status code.
   * @param response - The API response to check.
   * @param expectedStatus - The expected status code.
   */
  assertResponseStatusToBe(response: APIResponse, expectedStatus: number): void {
    expect(response.status()).toBe(expectedStatus);
  }

  /**
   * Asserts that an API response does not have the expected status code.
   * @param response - The API response to check.
   * @param expectedStatus - The status code that should not match.
   */
  assertResponseStatusNotToBe(response: APIResponse, expectedStatus: number): void {
    expect(response.status()).not.toBe(expectedStatus);
  }

  /**
   * Asserts that an API response JSON has the specified property.
   * @param response - The API response to check.
   * @param property - The property name to check.
   * @param expectedValue - Optional expected property value.
   */
  async assertResponseJsonToHaveProperty(response: APIResponse, property: string, expectedValue?: any): Promise<void> {
    expect(await response.json()).toHaveProperty(property, expectedValue ?? true);
  }

  /**
   * Asserts that an API response JSON does not have the specified property.
   * @param response - The API response to check.
   * @param property - The property name to check.
   * @param expectedValue - Optional expected property value.
   */
  async assertResponseJsonToNotHaveProperty(
    response: APIResponse,
    property: string,
    expectedValue?: any
  ): Promise<void> {
    expect(await response.json()).not.toHaveProperty(property, expectedValue ?? true);
  }
}
