// External library imports
import type { Locator, Page } from '@playwright/test';

// Core framework imports
import { LocatorRole } from '@core/enums';

/**
 * @fileoverview Locator Utilities - Comprehensive element location strategies
 * @description Provides extensive locator methods for finding elements using various strategies
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { LocatorUtils } from '@utils/browser';
 *
 * const locatorUtils = new LocatorUtils(page);
 * const button = locatorUtils.getLocatorByRole('button', { name: 'Submit' });
 * await button.click();
 * ```
 */

/**
 * Advanced locator utility class for Playwright element location strategies.
 *
 * Provides comprehensive methods for locating elements using:
 * - CSS selectors and XPath
 * - Text content and labels
 * - ARIA roles and accessibility attributes
 * - Test IDs and data attributes
 * - Complex element relationships
 *
 * This class serves as the foundation for all element interactions in the framework,
 * offering consistent and reliable element location patterns.
 *
 * @class LocatorUtils
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { LocatorUtils } from '@utils/browser';
 *
 * test('Find elements example', async ({ page }) => {
 *   const locatorUtils = new LocatorUtils(page);
 *
 *   // Find by text
 *   const submitButton = locatorUtils.getLocatorByText('Submit');
 *
 *   // Find by role and name
 *   const loginButton = locatorUtils.getLocatorByRole('button', { name: 'Login' });
 *
 *   // Find by test ID
 *   const userInput = locatorUtils.getLocatorByTestId('user-email');
 *
 *   // Find with CSS selector
 *   const header = locatorUtils.getLocator('header.main-header');
 * });
 * ```
 */
export class LocatorUtils {
  private readonly page: Page;

  /**
   * Creates an instance of LocatorUtils.
   * @param page - The Playwright Page instance to operate on.
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Returns a locator for the given selector.
   * @param selector - The selector string.
   * @param options - Optional locator options.
   */
  getLocator(selector: Parameters<Page['locator']>[0], options?: Parameters<Page['locator']>[1]): Locator {
    return this.page.locator(selector, options);
  }

  /**
   * Helper method to resolve selector or locator to a locator object.
   * @param selectorOrLocator - Selector string or locator object
   * @param locatorOptions - Optional locator options
   * @returns Promise resolving to locator object
   */
  resolveLocator(
    selectorOrLocator: Parameters<Page['locator']>[0] | Locator,
    locatorOptions?: Parameters<Page['locator']>[1]
  ): Locator {
    if (typeof selectorOrLocator === 'string') {
      return this.getLocator(selectorOrLocator, locatorOptions);
    }
    return selectorOrLocator;
  }

  /**
   * Returns a locator matching the given text or RegExp.
   * @param text - The text or RegExp to match.
   * @param options - Optional getByText options.
   */
  getLocatorByText(text: Parameters<Page['getByText']>[0], options?: Parameters<Page['getByText']>[1]): Locator {
    return this.page.getByText(text, options);
  }

  /**
   * Returns a locator matching the given placeholder text or RegExp.
   * @param text - The placeholder text or RegExp.
   * @param options - Optional getByPlaceholder options.
   */
  getLocatorByPlaceholder(
    text: Parameters<Page['getByPlaceholder']>[0],
    options?: Parameters<Page['getByPlaceholder']>[1]
  ): Locator {
    return this.page.getByPlaceholder(text, options);
  }

  /**
   * Returns a locator matching the given label text or RegExp.
   * @param text - The label text or RegExp.
   * @param options - Optional getByLabel options.
   */
  getLocatorByLabel(text: Parameters<Page['getByLabel']>[0], options?: Parameters<Page['getByLabel']>[1]): Locator {
    return this.page.getByLabel(text, options);
  }

  /**
   * Returns a locator matching the given alt text or RegExp.
   * @param text - The alt text or RegExp.
   * @param options - Optional getByAltText options.
   */
  getLocatorByAltText(
    text: Parameters<Page['getByAltText']>[0],
    options?: Parameters<Page['getByAltText']>[1]
  ): Locator {
    return this.page.getByAltText(text, options);
  }

  /**
   * Returns a locator matching the given title text or RegExp.
   * @param text - The title text or RegExp.
   * @param options - Optional getByTitle options.
   */
  getLocatorByTitle(text: Parameters<Page['getByTitle']>[0], options?: Parameters<Page['getByTitle']>[1]): Locator {
    return this.page.getByTitle(text, options);
  }

  /**
   * Returns a locator matching the given test ID or RegExp.
   * @param testId - The test ID string or RegExp.
   */
  getLocatorByTestId(testId: Parameters<Page['getByTestId']>[0]): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Returns a locator matching the given ARIA role and options.
   * @param role - The ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Returns a locator matching the alert ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleAlert(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.ALERT, options);
  }

  /**
   * Returns a locator matching the alertdialog ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleAlertDialog(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.ALERT_DIALOG, options);
  }

  /**
   * Returns a locator matching the application ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleApplication(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.APPLICATION, options);
  }

  /**
   * Returns a locator matching the article ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleArticle(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.ARTICLE, options);
  }

  /**
   * Returns a locator matching the banner ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleBanner(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.BANNER, options);
  }

  /**
   * Returns a locator matching the blockquote ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleBlockquote(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.BLOCKQUOTE, options);
  }

  /**
   * Returns a locator matching the button ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleButton(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.BUTTON, options);
  }

  /**
   * Returns a locator matching the caption ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleCaption(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.CAPTION, options);
  }

  /**
   * Returns a locator matching the cell ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleCell(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.CELL, options);
  }

  /**
   * Returns a locator matching the checkbox ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleCheckbox(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.CHECKBOX, options);
  }

  /**
   * Returns a locator matching the code ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleCode(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.CODE, options);
  }

  /**
   * Returns a locator matching the columnheader ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleColumnHeader(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.COLUMN_HEADER, options);
  }

  /**
   * Returns a locator matching the combobox ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleCombobox(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.COMBOBOX, options);
  }

  /**
   * Returns a locator matching the complementary ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleComplementary(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.COMPLEMENTARY, options);
  }

  /**
   * Returns a locator matching the contentinfo ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleContentInfo(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.CONTENT_INFO, options);
  }

  /**
   * Returns a locator matching the definition ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleDefinition(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.DEFINITION, options);
  }

  /**
   * Returns a locator matching the deletion ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleDeletion(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.DELETION, options);
  }

  /**
   * Returns a locator matching the dialog ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleDialog(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.DIALOG, options);
  }

  /**
   * Returns a locator matching the directory ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleDirectory(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.DIRECTORY, options);
  }

  /**
   * Returns a locator matching the document ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleDocument(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.DOCUMENT, options);
  }

  /**
   * Returns a locator matching the emphasis ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleEmphasis(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.EMPHASIS, options);
  }

  /**
   * Returns a locator matching the feed ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleFeed(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.FEED, options);
  }

  /**
   * Returns a locator matching the figure ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleFigure(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.FIGURE, options);
  }

  /**
   * Returns a locator matching the form ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleForm(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.FORM, options);
  }

  /**
   * Returns a locator matching the generic ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleGeneric(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.GENERIC, options);
  }

  /**
   * Returns a locator matching the grid ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleGrid(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.GRID, options);
  }

  /**
   * Returns a locator matching the gridcell ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleGridCell(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.GRID_CELL, options);
  }

  /**
   * Returns a locator matching the group ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleGroup(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.GROUP, options);
  }

  /**
   * Returns a locator matching the heading ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleHeading(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.HEADING, options);
  }

  /**
   * Returns a locator matching the img ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleImg(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.IMG, options);
  }

  /**
   * Returns a locator matching the insertion ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleInsertion(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.INSERTION, options);
  }

  /**
   * Returns a locator matching the link ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleLink(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.LINK, options);
  }

  /**
   * Returns a locator matching the list ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleList(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.LIST, options);
  }

  /**
   * Returns a locator matching the listbox ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleListbox(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.LISTBOX, options);
  }

  /**
   * Returns a locator matching the listitem ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleListItem(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.LIST_ITEM, options);
  }

  /**
   * Returns a locator matching the log ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleLog(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.LOG, options);
  }

  /**
   * Returns a locator matching the main ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleMain(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.MAIN, options);
  }

  /**
   * Returns a locator matching the marquee ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleMarquee(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.MARQUEE, options);
  }

  /**
   * Returns a locator matching the math ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleMath(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.MATH, options);
  }

  /**
   * Returns a locator matching the menu ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleMenu(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.MENU, options);
  }

  /**
   * Returns a locator matching the menubar ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleMenuBar(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.MENU_BAR, options);
  }

  /**
   * Returns a locator matching the menuitem ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleMenuItem(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.MENU_ITEM, options);
  }

  /**
   * Returns a locator matching the menuitemcheckbox ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleMenuItemCheckbox(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.MENU_ITEM_CHECKBOX, options);
  }

  /**
   * Returns a locator matching the menuitemradio ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleMenuItemRadio(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.MENU_ITEM_RADIO, options);
  }

  /**
   * Returns a locator matching the meter ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleMeter(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.METER, options);
  }

  /**
   * Returns a locator matching the navigation ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleNavigation(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.NAVIGATION, options);
  }

  /**
   * Returns a locator matching the none ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleNone(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.NONE, options);
  }

  /**
   * Returns a locator matching the note ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleNote(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.NOTE, options);
  }

  /**
   * Returns a locator matching the option ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleOption(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.OPTION, options);
  }

  /**
   * Returns a locator matching the presentation ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRolePresentation(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.PRESENTATION, options);
  }

  /**
   * Returns a locator matching the progressbar ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleProgressbar(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.PROGRESSBAR, options);
  }

  /**
   * Returns a locator matching the radio ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleRadio(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.RADIO, options);
  }

  /**
   * Returns a locator matching the radiogroup ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleRadioGroup(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.RADIO_GROUP, options);
  }

  /**
   * Returns a locator matching the region ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleRegion(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.REGION, options);
  }

  /**
   * Returns a locator matching the row ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleRow(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.ROW, options);
  }

  /**
   * Returns a locator matching the rowgroup ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleRowGroup(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.ROW_GROUP, options);
  }

  /**
   * Returns a locator matching the rowheader ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleRowHeader(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.ROW_HEADER, options);
  }

  /**
   * Returns a locator matching the scrollbar ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleScrollbar(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.SCROLLBAR, options);
  }

  /**
   * Returns a locator matching the search ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleSearch(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.SEARCH, options);
  }

  /**
   * Returns a locator matching the searchbox ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleSearchbox(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.SEARCH_BOX, options);
  }

  /**
   * Returns a locator matching the separator ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleSeparator(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.SEPARATOR, options);
  }

  /**
   * Returns a locator matching the slider ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleSlider(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.SLIDER, options);
  }

  /**
   * Returns a locator matching the spinbutton ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleSpinbutton(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.SPINBUTTON, options);
  }

  /**
   * Returns a locator matching the status ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleStatus(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.STATUS, options);
  }

  /**
   * Returns a locator matching the strong ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleStrong(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.STRONG, options);
  }

  /**
   * Returns a locator matching the subscript ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleSubscript(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.SUBSCRIPT, options);
  }

  /**
   * Returns a locator matching the superscript ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleSuperscript(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.SUPERSCRIPT, options);
  }

  /**
   * Returns a locator matching the switch ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleSwitch(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.SWITCH, options);
  }

  /**
   * Returns a locator matching the tab ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTab(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TAB, options);
  }

  /**
   * Returns a locator matching the table ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTable(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TABLE, options);
  }

  /**
   * Returns a locator matching the tablist ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTablist(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TABLIST, options);
  }

  /**
   * Returns a locator matching the tabpanel ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTabpanel(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TABPANEL, options);
  }

  /**
   * Returns a locator matching the term ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTerm(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TERM, options);
  }

  /**
   * Returns a locator matching the textbox ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTextbox(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TEXTBOX, options);
  }

  /**
   * Returns a locator matching the time ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTime(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TIME, options);
  }

  /**
   * Returns a locator matching the timer ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTimer(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TIMER, options);
  }

  /**
   * Returns a locator matching the toolbar ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleToolbar(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TOOLBAR, options);
  }

  /**
   * Returns a locator matching the tooltip ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTooltip(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TOOLTIP, options);
  }

  /**
   * Returns a locator matching the tree ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTree(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TREE, options);
  }

  /**
   * Returns a locator matching the treegrid ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTreegrid(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TREEGRID, options);
  }

  /**
   * Returns a locator matching the treeitem ARIA role.
   * @param options - Optional getByRole options.
   */
  getLocatorByRoleTreeitem(options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.getLocatorByRole(LocatorRole.TREEITEM, options);
  }

  /**
   * Returns the nth locator matching the selector.
   * @param selector - The selector string.
   * @param index - The zero-based index.
   * @param options - Optional locator options.
   */
  getNthLocator(
    selector: Parameters<Page['locator']>[0],
    index: number,
    options?: Parameters<Page['locator']>[1]
  ): Locator {
    return this.getLocator(selector, options).nth(index);
  }

  /**
   * Returns the first locator matching the selector.
   * @param selector - The selector string.
   * @param options - Optional locator options.
   */
  getFirstLocator(selector: Parameters<Page['locator']>[0], options?: Parameters<Page['locator']>[1]): Locator {
    return this.getLocator(selector, options).first();
  }

  /**
   * Returns the last locator matching the selector.
   * @param selector - The selector string.
   * @param options - Optional locator options.
   */
  getLastLocator(selector: Parameters<Page['locator']>[0], options?: Parameters<Page['locator']>[1]): Locator {
    return this.getLocator(selector, options).last();
  }

  /**
   * Returns all locators matching the selector as an array.
   * @param selector - The selector string.
   * @param options - Optional locator options.
   */
  async getAllLocators(
    selector: Parameters<Page['locator']>[0],
    options?: Parameters<Page['locator']>[1]
  ): Promise<Array<Locator>> {
    return await this.getLocator(selector, options).all();
  }
}
