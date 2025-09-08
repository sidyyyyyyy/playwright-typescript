// External library imports
import { Page, Locator } from '@playwright/test';

// Core framework imports
import type { SubSection } from '@core/interfaces';
import { BasePage } from '@pages/index';
import { HomePageConfig } from '@core/constants/ushur/page.constants';

/**
 * @fileoverview Home Page - Page object for main dashboard functionality and navigation
 * @description Provides comprehensive home page interactions, navigation management, and element validation operations
 * @author Anand Sogalad
 *
 * @example Basic usage:
 * ```typescript
 * import { HomePage } from '@pages/HomePage';
 *
 * test('Home page navigation', async ({ page }) => {
 *   const homePage = new HomePage(page);
 *
 *   await homePage.validateAllElementsVisibilityOnLeftPanel();
 *   await homePage.navigateToSubSection('projects');
 *   await homePage.toggleStudioMode();
 * });
 * ```
 */
/**
 * Page object class for home page functionality and navigation management.
 *
 * @description Handles all home page interactions including navigation between sections,
 * element validation, project management, and user controls. Extends BasePage to inherit
 * common page functionality and browser utilities.
 *
 * @class HomePage
 * @extends BasePage
 *
 * @example Creating and using HomePage:
 * ```typescript
 * import { test } from '@playwright/test';
 * import { HomePage } from '@pages/HomePage';
 *
 * test('Complete home page workflow', async ({ page }) => {
 *   const homePage = new HomePage(page);
 *
 *   // Validate page structure
 *   await homePage.validateAllElementsVisibilityOnLeftPanel();
 *
 *   // Navigate to different sections
 *   await homePage.navigateToSubSection('projects');
 *   await homePage.navigateToSubSection('reports');
 *
 *   // Interact with page features
 *   await homePage.toggleStudioMode();
 *   await homePage.openCreateProject();
 * });
 * ```
 */
export class HomePage extends BasePage {
  /** Pre-configured locators for all home page elements */
  private readonly elements: Record<string, Locator> = {};

  /** Navigation configuration for all home page sub-sections */
  private readonly subSections: Record<string, SubSection> = {};

  /**
   * Creates an instance of HomePage with pre-configured element locators and navigation.
   *
   * @param {Page} page - The Playwright Page instance for browser interactions
   *
   * @description Initializes the home page with all necessary element locators and
   * sub-section navigation configurations using constants. Elements are organized
   * by functionality for optimal performance and maintainability.
   *
   * @example
   * ```typescript
   * const homePage = new HomePage(page);
   * // All elements and navigation are now ready for interaction
   * await homePage.validateHeaderElementsVisibility();
   * ```
   */
  constructor(page: Page) {
    super(page);

    // Initialize all page elements using configuration constants
    this.elements = {
      // Header elements
      ushurLogo: this.locatorUtil.getLocatorByRoleImg({ name: HomePageConfig.HEADER.USHUR_LOGO_ALT_TEXT }),
      studioModeToggle: this.locatorUtil.getLocatorByRoleSwitch({ name: HomePageConfig.HEADER.STUDIO_TOGGLE_TEXT }),
      createProjectButton: this.locatorUtil.getLocatorByText(HomePageConfig.HEADER.CREATE_PROJECT_BUTTON_TEXT),

      // Main section elements
      automation: this.locatorUtil.getLocatorByRoleHeading({ name: HomePageConfig.SECTIONS.AUTOMATION, level: 2 }),
      analytics: this.locatorUtil.getLocatorByRoleHeading({ name: HomePageConfig.SECTIONS.ANALYTICS, level: 2 }),
      manage: this.locatorUtil.getLocatorByRoleHeading({ name: HomePageConfig.SECTIONS.MANAGE, level: 2 }),
      account: this.locatorUtil.getLocatorByRoleHeading({ name: HomePageConfig.SECTIONS.ACCOUNT, level: 2 }),

      // Utility elements
      supportLink: this.locatorUtil.getLocatorByRoleLink({ name: HomePageConfig.SUB_SECTIONS.SUPPORT }),
      logoutButton: this.locatorUtil.getLocatorByTestId(HomePageConfig.LOGOUT_BUTTON_TEST_ID),

      // Project management elements
      grid: this.locatorUtil.getLocatorByRoleGrid(),
      modalHeader: this.locatorUtil.getLocator(HomePageConfig.MODAL_HEADER_TITLE_SELECTOR),
      customProjectButton: this.locatorUtil.getLocatorByText(HomePageConfig.CUSTOM_PROJECT_BUTTON_TEXT),
      viewAllButton: this.locatorUtil.getLocatorByText(HomePageConfig.VIEW_ALL_PROJECTS_TEXT),
    };

    // Initialize sub-section navigation configuration
    this.subSections = this.getSubSections();
  }

  /**
   * Gets the Ushur logo element locator.
   *
   * @returns {Locator} The Ushur logo locator
   *
   * @example
   * ```typescript
   * const logo = homePage.ushurLogo;
   * await homePage.elementUtil.click(logo);
   * ```
   */
  get ushurLogo(): Locator {
    return this.elements.ushurLogo;
  }

  /**
   * Gets the create project button element locator.
   *
   * @returns {Locator} The create project button locator
   *
   * @example
   * ```typescript
   * const createButton = homePage.createProjectButton;
   * await homePage.elementUtil.click(createButton);
   * ```
   */
  get createProjectButton(): Locator {
    return this.elements.createProjectButton;
  }

  /**
   * Gets the automation section element locator.
   *
   * @returns {Locator} The automation section locator
   *
   * @example
   * ```typescript
   * const automationSection = homePage.automationSection;
   * await homePage.locatorAssertionUtil.assertElementIsVisible(automationSection);
   * ```
   */
  get automationSection(): Locator {
    return this.elements.automation;
  }

  /**
   * Gets the studio mode toggle element locator.
   *
   * @returns {Locator} The studio mode toggle locator
   *
   * @example
   * ```typescript
   * const toggle = homePage.studioModeToggle;
   * await homePage.elementUtil.click(toggle);
   * ```
   */
  get studioModeToggle(): Locator {
    return this.elements.studioModeToggle;
  }

  /**
   * Creates and configures navigation sub-sections with locators and URL patterns.
   *
   * @returns {Record<string, SubSection>} Map of sub-section configurations
   *
   * @description Builds navigation configuration for all home page sub-sections including
   * projects, analytics, management tools, and administrative functions. Each sub-section
   * contains a locator and expected URL pattern for navigation validation.
   *
   * @private
   *
   * @example
   * ```typescript
   * // Internal usage - creates navigation configuration
   * const subSections = this.getSubSections();
   * await this.elementUtil.click(subSections.projects.link);
   * ```
   */
  private getSubSections(): Record<string, SubSection> {
    /**
     * Helper function to create sub-section configuration objects.
     *
     * @param {string} text - The visible text of the navigation link
     * @param {string} urlPattern - The regex pattern to match expected URL
     * @returns {SubSection} Configuration object with link locator and URL pattern
     */
    const subSection = (text: string, urlPattern: string): SubSection => ({
      link: this.locatorUtil.getLocator(HomePageConfig.SUB_SECTION_LINK_SELECTOR, { hasText: text }),
      expectedUrl: new RegExp(urlPattern),
    });

    return {
      // Automation section
      projects: subSection(HomePageConfig.SUB_SECTIONS.PROJECTS, '.*project'),
      canvas: subSection(HomePageConfig.SUB_SECTIONS.CANVAS, '.*canvas'),
      campaigns: subSection(HomePageConfig.SUB_SECTIONS.CAMPAIGNS, '.*campaigns'),
      launchpad: subSection(HomePageConfig.SUB_SECTIONS.LAUNCHPAD, '.*launchpad'),
      ushurHub: subSection(HomePageConfig.SUB_SECTIONS.USHUR_HUB, '.*hub_settings'),

      // Analytics section
      insights: subSection(HomePageConfig.SUB_SECTIONS.INSIGHTS, '.*analytics'),
      campaignAnalytics: subSection(HomePageConfig.SUB_SECTIONS.CAMPAIGN_ANALYTICS, '.*campaign_analytics'),
      reports: subSection(HomePageConfig.SUB_SECTIONS.REPORTS, '.*reports'),
      dataTables: subSection(HomePageConfig.SUB_SECTIONS.DATA_TABLES, '.*datatables'),
      aiStudio: subSection(HomePageConfig.SUB_SECTIONS.AI_STUDIO, '.*ml_studio'),

      // Management section
      contacts: subSection(HomePageConfig.SUB_SECTIONS.CONTACTS, '.*contacts'),
      shortlinks: subSection(HomePageConfig.SUB_SECTIONS.SHORTLINKS, '.*short_links'),
      integrations: subSection(HomePageConfig.SUB_SECTIONS.INTEGRATIONS, '.*integration'),

      // Account section
      settings: subSection(HomePageConfig.SUB_SECTIONS.SETTINGS, '.*settings'),
      adminTools: subSection(HomePageConfig.SUB_SECTIONS.ADMIN_TOOLS, '.*admin_tools'),
    };
  }

  /**
   * Navigates to a specific sub-section of the home page.
   *
   * @param {string} section - The name of the sub-section to navigate to
   * @returns {Promise<void>} A promise that resolves when navigation is complete
   *
   * @description Clicks on the specified sub-section link and waits for URL change
   * and page load completion. Supports all configured sub-sections including projects,
   * reports, settings, etc.
   *
   * @throws {Error} If the specified section is not found in configuration
   *
   * @example
   * ```typescript
   * // Navigate to different sections
   * await homePage.navigateToSubSection('projects');
   * await homePage.navigateToSubSection('reports');
   * await homePage.navigateToSubSection('settings');
   * await homePage.navigateToSubSection('adminTools');
   * ```
   */
  async navigateToSubSection(section: string): Promise<void> {
    const subSection = this.subSections[section];
    if (!subSection) {
      throw new Error(`Navigation item '${section}' not found`);
    }
    await this.elementUtil.click(subSection.link);
    await this.navigationUtil.waitForURL(subSection.expectedUrl);
    await this.navigationUtil.waitForLoadStateLoad();
  }

  /**
   * Validates the visibility of all header elements.
   *
   * @returns {Promise<void>} A promise that resolves when all header validations pass
   *
   * @description Checks that the Ushur logo, studio mode toggle, and create project
   * button are visible and properly rendered in the header section.
   *
   * @throws {AssertionError} If any header element is not visible
   *
   * @example
   * ```typescript
   * await homePage.validateHeaderElementsVisibility();
   * // Confirms: logo, studio toggle, and create button are visible
   * ```
   */
  async validateHeaderElementsVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementsAreVisible([
      this.elements.ushurLogo,
      this.elements.studioModeToggle,
      this.elements.createProjectButton,
    ]);
  }

  /**
   * Validates the visibility of all main section headings.
   *
   * @returns {Promise<void>} A promise that resolves when all section validations pass
   *
   * @description Verifies that automation, analytics, manage, and account section
   * headings are visible and accessible in the navigation panel.
   *
   * @throws {AssertionError} If any section heading is not visible
   *
   * @example
   * ```typescript
   * await homePage.validateSectionsVisibility();
   * // Confirms: all main section headings are displayed
   * ```
   */
  async validateSectionsVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementsAreVisible([
      this.elements.automation,
      this.elements.analytics,
      this.elements.manage,
      this.elements.account,
    ]);
  }

  /**
   * Validates the visibility of all sub-section navigation links.
   *
   * @returns {Promise<void>} A promise that resolves when all sub-section validations pass
   *
   * @description Checks that all configured sub-section links (projects, reports,
   * settings, etc.) are visible and available for navigation.
   *
   * @throws {AssertionError} If any sub-section link is not visible
   *
   * @example
   * ```typescript
   * await homePage.validateSubSectionsVisibility();
   * // Confirms: projects, reports, settings, and other sub-sections are visible
   * ```
   */
  async validateSubSectionsVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementsAreVisible(Object.values(this.subSections).map((item) => item.link));
  }

  /**
   * Validates the visibility of the support link.
   *
   * @returns {Promise<void>} A promise that resolves when support link validation passes
   *
   * @description Verifies that the support link is visible and accessible to users
   * for help and assistance.
   *
   * @throws {AssertionError} If the support link is not visible
   *
   * @example
   * ```typescript
   * await homePage.validateSupportLinkVisibility();
   * // Confirms: support link is available for user assistance
   * ```
   */
  async validateSupportLinkVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.supportLink);
  }

  /**
   * Validates the visibility of the logout button.
   *
   * @returns {Promise<void>} A promise that resolves when logout button validation passes
   *
   * @description Checks that the logout button is visible and accessible for
   * user session termination.
   *
   * @throws {AssertionError} If the logout button is not visible
   *
   * @example
   * ```typescript
   * await homePage.validateLogoutButtonVisibility();
   * // Confirms: logout button is available for session management
   * ```
   */
  async validateLogoutButtonVisibility(): Promise<void> {
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.logoutButton);
  }

  /**
   * Validates the visibility of all elements in the left navigation panel.
   *
   * @returns {Promise<void>} A promise that resolves when all panel validations pass
   *
   * @description Comprehensive validation method that checks all navigation panel
   * elements including header, sections, sub-sections, support link, and logout button.
   * Provides a single entry point for complete left panel validation.
   *
   * @throws {AssertionError} If any navigation panel element is not visible
   *
   * @example
   * ```typescript
   * await homePage.validateAllElementsVisibilityOnLeftPanel();
   * // Confirms: entire left navigation panel is properly displayed
   * ```
   */
  async validateAllElementsVisibilityOnLeftPanel(): Promise<void> {
    await this.validateHeaderElementsVisibility();
    await this.validateSectionsVisibility();
    await this.validateSubSectionsVisibility();
    await this.validateSupportLinkVisibility();
    await this.validateLogoutButtonVisibility();
  }

  /**
   * Toggles the studio mode switch on the home page.
   *
   * @returns {Promise<void>} A promise that resolves when the toggle action is complete
   *
   * @description Clicks the studio mode toggle switch and waits for page load completion.
   * Studio mode may change the interface behavior or available features.
   *
   * @example
   * ```typescript
   * await homePage.toggleStudioMode();
   * // Studio mode is now toggled and page has loaded
   * ```
   */
  async toggleStudioMode(): Promise<void> {
    await this.elementUtil.click(this.elements.studioModeToggle);
    await this.navigationUtil.waitForLoadStateLoad();
  }

  /**
   * Opens the create project dialog.
   *
   * @returns {Promise<void>} A promise that resolves when the dialog is opened and validated
   *
   * @description Clicks the create project button, waits for page load, and validates
   * that the create project dialog and custom project button are visible.
   *
   * @throws {AssertionError} If the create dialog or custom project button is not visible
   *
   * @example
   * ```typescript
   * await homePage.openCreateProject();
   * // Create project dialog is now open and ready for interaction
   * ```
   */
  async openCreateProjectModal(): Promise<void> {
    await this.elementUtil.click(this.elements.createProjectButton);
    await this.navigationUtil.waitForLoadStateLoad();
  }

  /**
   * Opens the create custom project dialog workflow.
   *
   * @returns {Promise<void>} A promise that resolves when the custom project dialog is opened
   *
   * @description Combines opening the create project dialog and then clicking the
   * custom project button to initiate the custom project creation workflow.
   *
   * @throws {AssertionError} If any step in the workflow fails validation
   *
   * @example
   * ```typescript
   * await homePage.openCreateCustomProjectDialog();
   * // Custom project creation dialog is now open
   * ```
   */
  async openCreateCustomProjectModal(): Promise<void> {
    await this.elementUtil.click(this.elements.customProjectButton);
    await this.navigationUtil.waitForLoadStateLoad();
  }

  /**
   * Clicks the support link to access help resources.
   *
   * @returns {Promise<void>} A promise that resolves when the support link is clicked
   *
   * @description Opens the support link which may navigate to help documentation,
   * contact forms, or external support resources.
   *
   * @example
   * ```typescript
   * await homePage.openSupportLink();
   * // Support resources are now accessible
   * ```
   */
  async openSupportLink(): Promise<void> {
    await this.elementUtil.click(this.elements.supportLink);
  }

  /**
   * Performs user logout from the application.
   *
   * @returns {Promise<void>} A promise that resolves when the logout action is initiated
   *
   * @description Clicks the logout button to terminate the user session and
   * redirect to the login page or logout confirmation.
   *
   * @example
   * ```typescript
   * await homePage.logout();
   * // User session is terminated and logout process initiated
   * ```
   */
  async logout(): Promise<void> {
    await this.elementUtil.click(this.elements.logoutButton);
  }
}
