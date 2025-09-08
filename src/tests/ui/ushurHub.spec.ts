import { test } from '@fixtures/user.fixture';
import { LoginPage, HomePage, UshurHubPage } from '@pages/index';
import { expect } from '@playwright/test';
import { PerformanceThreshold } from '@core/enums';

test.describe('Ushur Hub Tests', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let ushurHubPage: UshurHubPage;

  test.beforeEach(async ({ page, user }) => {
    await test.step('Setup and Login', async () => {
      loginPage = new LoginPage(page);
      homePage = new HomePage(page);
      ushurHubPage = new UshurHubPage(page);

      await loginPage.goto();

      await loginPage.login(user.email, user.password);
      await homePage.waitForPageLoad();
      await homePage.navigateTo('ushurHub');
      await ushurHubPage.waitForPageLoad();
    });
  });

  // Basic page structure validation
  test('validate all tabs in Ushur Hub @smoke', async () => {
    await test.step('Validate all tabs', async () => {
      await ushurHubPage.validateNavigationStructure();
    });
  });

  // Tab navigation tests
  const tabTests = ['GENERAL', 'ADDONS', 'USECASES', 'REMINDERS', 'ROLESUSERS'] as const;

  for (const tab of tabTests) {
    test(`navigate to ${tab} tab @navigation`, async () => {
      await test.step(`Navigate to ${tab} tab`, async () => {
        await ushurHubPage.navigateToTab(tab);
      });
    });
  }

  // Status section tests
  test('validate hub status toggle @functionality', async () => {
    await test.step('Toggle hub status', async () => {
      await ushurHubPage.setHubStatus(false);
      await ushurHubPage.setHubStatus(true);
    });
  });

  test('update inactive message @functionality', async () => {
    await test.step('Set inactive message', async () => {
      const message = 'Hub is under maintenance. Please try again later.';
      await ushurHubPage.setInactiveMessage(message);
    });
  });

  // General section tests
  test('update general information @functionality', async () => {
    const testData = {
      hubName: 'Test Hub',
      description: 'Test Hub Description',
      email: 'test@example.com',
      privacyUrl: 'https://example.com/privacy',
      termsUrl: 'https://example.com/terms',
    };

    await test.step('Update hub name', async () => {
      await ushurHubPage.updateHubName(testData.hubName);
    });

    await test.step('Update hub description', async () => {
      await ushurHubPage.updateHubDescription(testData.description);
    });

    await test.step('Update support email', async () => {
      await ushurHubPage.setSupportEmail(testData.email);
    });

    await test.step('Update privacy policy link', async () => {
      await ushurHubPage.setPrivacyPolicyLink(testData.privacyUrl);
    });

    await test.step('Update terms link', async () => {
      await ushurHubPage.setTermsLink(testData.termsUrl);
    });

    await test.step('save changes', async () => {
      await ushurHubPage.saveChanges();
    });
  });

  // Authentication section tests
  test('configure authentication settings @functionality', async () => {
    await test.step('Toggle MFA', async () => {
      await ushurHubPage.toggleMFA(true);
    });

    await test.step('Set password requirements', async () => {
      await ushurHubPage.setPasswordRequirements({
        lowercase: true,
        uppercase: true,
        special: true,
        numbers: true,
      });
    });
  });

  // Section validation tests
  test('validate general section @validation', async () => {
    await ushurHubPage.validateGeneralSection();
  });

  test('validate branding section @validation', async () => {
    await ushurHubPage.validateBrandingSection();
  });

  test('validate authentication section @validation', async () => {
    await ushurHubPage.validateAuthenticationSection();
  });

  // Error handling tests
  test('handle invalid hub name @error-handling', async () => {
    await test.step('Try to set empty hub name', async () => {
      await ushurHubPage.updateHubName('');
      // Add assertions for error state once we know the exact behavior
    });
  });

  test('handle invalid email @error-handling', async () => {
    await test.step('Try to set invalid email', async () => {
      await ushurHubPage.setSupportEmail('invalid-email');
      // Add assertions for error state once we know the exact behavior
    });
  });

  test('handle invalid URL @error-handling', async () => {
    await test.step('Try to set invalid URLs', async () => {
      await ushurHubPage.setPrivacyPolicyLink('invalid-url');
      await ushurHubPage.setTermsLink('invalid-url');
      // Add assertions for error state once we know the exact behavior
    });
  });

  // Performance test
  test('validate page load performance @performance', async ({ page }) => {
    const performanceThreshold = PerformanceThreshold.TIME_TO_INTERACTIVE;

    await test.step('Measure page load time', async () => {
      const startTime = Date.now();
      await page.reload();
      await ushurHubPage.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(performanceThreshold);
    });
  });
});
