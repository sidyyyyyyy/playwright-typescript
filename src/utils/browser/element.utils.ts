// External library imports
import type { Locator, Page } from '@playwright/test';

// Core framework imports
import { MouseButton, WaitState } from '@core/enums';
import type { LocatorUtils } from '@utils/browser';

/**
 * @fileoverview Element Utilities - Comprehensive element interaction and manipulation
 * @description Provides high-level element interaction methods with intelligent locator resolution
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { ElementUtils, LocatorUtils } from '@utils/browser';
 *
 * const locatorUtils = new LocatorUtils(page);
 * const elementUtils = new ElementUtils(locatorUtils);
 *
 * await elementUtils.click('#submit-button');
 * await elementUtils.fill('#email-input', 'user@example.com');
 * ```
 */

/**
 * Comprehensive element interaction utility class.
 *
 * Provides high-level element manipulation capabilities including:
 * - Click operations (left, right, middle, double-click)
 * - Form interactions (fill, clear, check, uncheck)
 * - Element state queries (visible, enabled, checked)
 * - Wait operations with various conditions
 * - Content extraction (text, attributes, values)
 * - Focus and hover operations
 *
 * This class automatically resolves selectors to locators and provides
 * consistent interaction patterns across the framework.
 *
 * @class ElementUtils
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { ElementUtils, LocatorUtils } from '@utils/browser';
 *
 * test('Element interactions', async ({ page }) => {
 *   const locatorUtils = new LocatorUtils(page);
 *   const elementUtils = new ElementUtils(locatorUtils);
 *
 *   // Form interactions
 *   await elementUtils.fill('#username', 'testuser');
 *   await elementUtils.fill('#password', 'password123');
 *   await elementUtils.check('#remember-me');
 *   await elementUtils.click('#login-button');
 *
 *   // Wait for element state
 *   await elementUtils.waitUntilVisible('#dashboard');
 *
 *   // Extract content
 *   const welcomeText = await elementUtils.textContent('#welcome-message');
 * });
 * ```
 */
export class ElementUtils {
  private readonly locatorUtils: LocatorUtils;

  /**
   * Creates a new ElementUtils instance.
   *
   * @param {LocatorUtils} locatorUtils - LocatorUtils instance for element location and resolution
   * @example
   * ```typescript
   * import { test } from '@playwright/test';
   * import { ElementUtils, LocatorUtils } from '@utils/browser';
   *
   * test('Create element utils', async ({ page }) => {
   *   const locatorUtils = new LocatorUtils(page);
   *   const elementUtils = new ElementUtils(locatorUtils);
   *   // Use elementUtils for element interactions
   * });
   * ```
   */
  constructor(locatorUtils: LocatorUtils) {
    this.locatorUtils = locatorUtils;
  }

  /**
   * Clicks an element using the left mouse button.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param clickOptions - Optional click action options
   */
  async click(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    clickOptions?: Parameters<Locator['click']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).click(clickOptions);
  }

  /**
   * Double-clicks an element using the left mouse button.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param doubleClickOptions - Optional double-click action options
   */
  async doubleClick(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    doubleClickOptions?: Parameters<Locator['dblclick']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).dblclick(doubleClickOptions);
  }

  /**
   * Right-clicks an element using the right mouse button.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param rightClickOptions - Optional right-click action options
   */
  async rightClick(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    rightClickOptions?: Parameters<Locator['click']>[0]
  ): Promise<void> {
    await this.click(selectorOrLocator, locatorOptions, {
      button: MouseButton.RIGHT,
      ...rightClickOptions,
    });
  }

  /**
   * Right double-clicks an element using the right mouse button.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param rightDoubleClickOptions - Optional right double-click action options
   */
  async rightDoubleClick(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    rightDoubleClickOptions?: Parameters<Locator['dblclick']>[0]
  ): Promise<void> {
    await this.doubleClick(selectorOrLocator, locatorOptions, {
      button: MouseButton.RIGHT,
      ...rightDoubleClickOptions,
    });
  }

  /**
   * Middle-clicks an element using the middle mouse button.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param middleClickOptions - Optional middle-click action options
   */
  async middleClick(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    middleClickOptions?: Parameters<Locator['click']>[0]
  ): Promise<void> {
    await this.click(selectorOrLocator, locatorOptions, {
      button: MouseButton.MIDDLE,
      ...middleClickOptions,
    });
  }

  /**
   * Middle double-clicks an element using the middle mouse button.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param middleDoubleClickOptions - Optional middle double-click action options
   */
  async middleDoubleClick(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    middleDoubleClickOptions?: Parameters<Locator['dblclick']>[0]
  ): Promise<void> {
    await this.doubleClick(selectorOrLocator, locatorOptions, {
      button: MouseButton.MIDDLE,
      ...middleDoubleClickOptions,
    });
  }

  /**
   * Hovers over an element.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param hoverOptions - Optional hover action options
   */
  async hover(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    hoverOptions?: Parameters<Locator['hover']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).hover(hoverOptions);
  }

  /**
   * Fills an input element with text.
   * @param selectorOrLocator - Selector string or locator object
   * @param value - Text to fill
   * @param locatorOptions - Optional locator options
   * @param fillOptions - Optional fill action options
   */
  async fill(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    value: string,
    locatorOptions?: Parameters<Page['locator']>[1],
    fillOptions?: Parameters<Locator['fill']>[1]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).fill(value, fillOptions);
  }

  /**
   * Clears the content of an input element.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param clearOptions - Optional clear action options
   */
  async clear(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    clearOptions?: Parameters<Locator['clear']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).clear(clearOptions);
  }

  /**
   * Checks a checkbox or radio button.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param checkOptions - Optional check action options
   */
  async check(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    checkOptions?: Parameters<Locator['check']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).check(checkOptions);
  }

  /**
   * Unchecks a checkbox.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param uncheckOptions - Optional uncheck action options
   */
  async uncheck(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    uncheckOptions?: Parameters<Locator['uncheck']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).uncheck(uncheckOptions);
  }

  /**
   * Selects an option from a dropdown.
   * @param selectorOrLocator - Selector string or locator object
   * @param value - Option value to select
   * @param locatorOptions - Optional locator options
   * @param selectOptions - Optional select action options
   */
  async selectOption(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    value: string,
    locatorOptions?: Parameters<Page['locator']>[1],
    selectOptions?: Parameters<Locator['selectOption']>[1]
  ): Promise<Array<string>> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).selectOption(value, selectOptions);
  }

  /**
   * Uploads files to a file input element.
   * @param selectorOrLocator - Selector string or locator object
   * @param files - Array of file paths
   * @param locatorOptions - Optional locator options
   * @param uploadOptions - Optional upload action options
   */
  async uploadFiles(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    files: string[],
    locatorOptions?: Parameters<Page['locator']>[1],
    uploadOptions?: Parameters<Locator['setInputFiles']>[1]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).setInputFiles(files, uploadOptions);
  }

  /**
   * Focuses an element.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param focusOptions - Optional focus action options
   */
  async focus(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    focusOptions?: Parameters<Locator['focus']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).focus(focusOptions);
  }

  /**
   * Removes focus from an element.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param blurOptions - Optional blur action options
   */
  async blur(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    blurOptions?: Parameters<Locator['blur']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).blur(blurOptions);
  }

  /**
   * Checks if an element is visible.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param isVisibleOptions - Optional visibility check options
   * @returns Promise resolving to boolean
   */
  async isVisible(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    isVisibleOptions?: Parameters<Locator['isVisible']>[0]
  ): Promise<boolean> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).isVisible(isVisibleOptions);
  }

  /**
   * Checks if an element is hidden.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param isHiddenOptions - Optional hidden check options
   * @returns Promise resolving to boolean
   */
  async isHidden(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    isHiddenOptions?: Parameters<Locator['isHidden']>[0]
  ): Promise<boolean> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).isHidden(isHiddenOptions);
  }

  /**
   * Checks if a checkbox or radio button is checked.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param isCheckedOptions - Optional checked check options
   * @returns Promise resolving to boolean
   */
  async isChecked(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    isCheckedOptions?: Parameters<Locator['isChecked']>[0]
  ): Promise<boolean> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).isChecked(isCheckedOptions);
  }

  /**
   * Checks if an element is disabled.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param isDisabledOptions - Optional disabled check options
   * @returns Promise resolving to boolean
   */
  async isDisabled(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    isDisabledOptions?: Parameters<Locator['isDisabled']>[0]
  ): Promise<boolean> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).isDisabled(isDisabledOptions);
  }

  /**
   * Checks if an element is editable.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param isEditableOptions - Optional editable check options
   * @returns Promise resolving to boolean
   */
  async isEditable(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    isEditableOptions?: Parameters<Locator['isEditable']>[0]
  ): Promise<boolean> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).isEditable(isEditableOptions);
  }

  /**
   * Checks if an element is enabled.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param isEnabledOptions - Optional enabled check options
   * @returns Promise resolving to boolean
   */
  async isEnabled(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    isEnabledOptions?: Parameters<Locator['isEnabled']>[0]
  ): Promise<boolean> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).isEnabled(isEnabledOptions);
  }

  /**
   * Checks if an element is both visible and enabled.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param isVisibleOptions - Optional visibility check options
   * @param isEnabledOptions - Optional enabled check options
   * @returns Promise resolving to boolean
   */
  async isVisibleAndEnabled(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    isVisibleOptions?: Parameters<Locator['isVisible']>[0],
    isEnabledOptions?: Parameters<Locator['isEnabled']>[0]
  ): Promise<boolean> {
    return (
      (await this.isVisible(selectorOrLocator, locatorOptions, isVisibleOptions)) &&
      (await this.isEnabled(selectorOrLocator, locatorOptions, isEnabledOptions))
    );
  }

  /**
   * Gets an attribute value from an element.
   * @param selectorOrLocator - Selector string or locator object
   * @param name - Attribute name
   * @param locatorOptions - Optional locator options
   * @param getAttributeOptions - Optional get attribute options
   * @returns Promise resolving to attribute value or null
   */
  async getAttribute(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    name: string,
    locatorOptions?: Parameters<Page['locator']>[1],
    getAttributeOptions?: Parameters<Locator['getAttribute']>[1]
  ): Promise<string | null> {
    return await this.locatorUtils
      .resolveLocator(selectorOrLocator, locatorOptions)
      .getAttribute(name, getAttributeOptions);
  }

  /**
   * Gets the text content of an element.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param textContentOptions - Optional text content options
   * @returns Promise resolving to text content or null
   */
  async textContent(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    textContentOptions?: Parameters<Locator['textContent']>[0]
  ): Promise<string | null> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).textContent(textContentOptions);
  }

  /**
   * Gets the inner text of an element.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param innerTextOptions - Optional inner text options
   * @returns Promise resolving to inner text
   */
  async innerText(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    innerTextOptions?: Parameters<Locator['innerText']>[0]
  ): Promise<string> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).innerText(innerTextOptions);
  }

  /**
   * Gets the inner HTML of an element.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param innerHTMLOptions - Optional inner HTML options
   * @returns Promise resolving to inner HTML
   */
  async innerHTML(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    innerHTMLOptions?: Parameters<Locator['innerHTML']>[0]
  ): Promise<string> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).innerHTML(innerHTMLOptions);
  }

  /**
   * Gets the value of an input element.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param valueOptions - Optional value options
   * @returns Promise resolving to input value or null
   */
  async value(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    valueOptions?: Parameters<Locator['inputValue']>[0]
  ): Promise<string | null> {
    return await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).inputValue(valueOptions);
  }

  /**
   * Waits for an element to meet specified conditions.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param waitOptions - Optional wait options
   */
  async waitUntil(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    waitOptions?: Parameters<Locator['waitFor']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).waitFor(waitOptions);
  }

  /**
   * Waits for an element to be attached to the DOM.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param waitOptions - Optional wait options
   */
  async waitUntilAttached(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    waitOptions?: Parameters<Locator['waitFor']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).waitFor({
      state: WaitState.ATTACHED,
      ...waitOptions,
    });
  }

  /**
   * Waits for an element to be detached from the DOM.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param waitOptions - Optional wait options
   */
  async waitUntilDetached(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    waitOptions?: Parameters<Locator['waitFor']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).waitFor({
      state: WaitState.DETACHED,
      ...waitOptions,
    });
  }

  /**
   * Waits for an element to be visible.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param waitOptions - Optional wait options
   */
  async waitUntilVisible(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    waitOptions?: Parameters<Locator['waitFor']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).waitFor({
      state: WaitState.VISIBLE,
      ...waitOptions,
    });
  }

  /**
   * Waits for an element to be hidden.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param waitOptions - Optional wait options
   */
  async waitUntilHidden(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    waitOptions?: Parameters<Locator['waitFor']>[0]
  ): Promise<void> {
    await this.locatorUtils.resolveLocator(selectorOrLocator, locatorOptions).waitFor({
      state: WaitState.HIDDEN,
      ...waitOptions,
    });
  }

  /**
   * Scrolls an element into view if needed.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @param scrollIntoViewOptions - Optional scroll into view options
   */
  async scrollIntoView(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1],
    scrollIntoViewOptions?: Parameters<Locator['scrollIntoViewIfNeeded']>[0]
  ): Promise<void> {
    await this.locatorUtils
      .resolveLocator(selectorOrLocator, locatorOptions)
      .scrollIntoViewIfNeeded(scrollIntoViewOptions);
  }
}
