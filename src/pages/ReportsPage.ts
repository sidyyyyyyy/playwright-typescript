import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/index';
import { ReportTabs } from '@core/enums/ushur';

/**
 * Page object representing the Reports page functionality
 */
export class ReportsPage extends BasePage {
  private readonly elements: {
    header: {
      reportsHeading: Locator;
      tabs: {
        reportTemplates: Locator;
        presets: Locator;
        generatedReports: Locator;
        scheduledReports: Locator;
      };
    };
    reportTemplates: Locator;
  };

  constructor(page: Page) {
    super(page);
    this.elements = {
      header: {
        reportsHeading: this.locatorUtil.getLocatorByRoleHeading({ name: 'Reports', level: 1 }),
        tabs: {
          reportTemplates: this.locatorUtil.getLocatorByRoleTab({ name: 'Report Templates' }),
          presets: this.locatorUtil.getLocatorByRoleTab({ name: 'Presets' }),
          generatedReports: this.locatorUtil.getLocatorByRoleTab({ name: 'Generated Reports' }),
          scheduledReports: this.locatorUtil.getLocatorByRoleTab({ name: 'Scheduled Reports' }),
        },
      },
      reportTemplates: this.locatorUtil.getLocator('div[role="tabpanel"] div[role="button"]'),
    };
  }

  /**
   * Validates the presence of all header elements.
   */
  async validateHeaderElements(): Promise<void> {
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.header.reportsHeading);
    await this.locatorAssertionUtil.assertElementIsVisible(
      this.elements.header.tabs.reportTemplates
    );
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.header.tabs.presets);
    await this.locatorAssertionUtil.assertElementIsVisible(
      this.elements.header.tabs.generatedReports
    );
    await this.locatorAssertionUtil.assertElementIsVisible(
      this.elements.header.tabs.scheduledReports
    );
  }

  /**
   * Validates the presence of all report templates.
   */
  async validateReportTemplates(): Promise<void> {
    const templates = await this.elements.reportTemplates.all();
    for (const template of templates) {
      await this.locatorAssertionUtil.assertElementIsVisible(template);
    }
  }

  /**
   * Navigates to a specific tab.
   * @param tabName The name of the tab to navigate to.
   */
  async navigateToTab(tabName: ReportTabs): Promise<void> {
    const tab = this.elements.header.tabs[tabName as keyof typeof this.elements.header.tabs];
    await this.elementUtil.click(tab);
  }

  /**
   * Validates that the specified tab is selected.
   * @param tabName The name of the tab to validate.
   */
  async validateSelectedTab(tabName: ReportTabs): Promise<void> {
    const tab = this.elements.header.tabs[tabName as keyof typeof this.elements.header.tabs];
    await this.locatorAssertionUtil.assertElementIsVisible(tab);
  }
}
