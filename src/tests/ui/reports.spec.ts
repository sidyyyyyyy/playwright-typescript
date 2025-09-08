import { test } from '@fixtures/user.fixture';
import { ReportsPage, LoginPage, HomePage } from '@pages/index';
import { ReportTabs } from '@core/enums/ushur';

test.describe('Reports Page Tests', () => {
  let reportsPage: ReportsPage;

  test.beforeEach(async ({ page, user }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    reportsPage = new ReportsPage(page);

    // Navigate to the signin page and perform login
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Navigate to the reports page using HomePage navigation method
    await homePage.navigateTo('reports');
  });

  test('validate header elements @smoke', async () => {
    await test.step('Validate all header elements', async () => {
      await reportsPage.validateHeaderElements();
    });
  });

  test('validate report templates @smoke', async () => {
    await test.step('Validate all report templates are visible', async () => {
      await reportsPage.validateReportTemplates();
    });
  });

  test('navigate between tabs @navigation', async () => {
    const tabs = ['reportTemplates', 'presets', 'generatedReports', 'scheduledReports'];
    for (const tab of tabs) {
      await test.step(`Navigate to ${tab} tab`, async () => {
        await reportsPage.navigateToTab(tab as ReportTabs);
        await reportsPage.validateSelectedTab(tab as ReportTabs);
      });
    }
  });
});
