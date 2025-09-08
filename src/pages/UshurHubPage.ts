import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/index';

/**
 * Configuration constants for the Ushur Hub page
 */
const HUB_CONFIG = {
  TABS: {
    GENERAL: 'General',
    ADDONS: 'Add-Ons',
    USECASES: 'Use-Cases',
    ROLESUSERS: 'Roles & Users',
    REMINDERS: 'Reminders',
  },
  HEADINGS: {
    STATUS: 'Status',
    GENERAL: 'General',
    BRANDING: 'Branding',
    AUTH: 'Ushur IAM Authentication Options',
    BUSINESS_ADDONS: 'Business Add-Ons',
  },
} as const;

/**
 * Page object representing the Ushur Hub functionality
 */
export class UshurHubPage extends BasePage {
  private readonly elements: {
    saveChangesButton: Locator;
    navigation: {
      title: Locator;
      generalTab: Locator;
      addonsTab: Locator;
      usecasesTab: Locator;
      rolesusersTab: Locator;
      remindersTab: Locator;
    };
    status: {
      heading: Locator;
      toggle: Locator;
      inactiveMessage: Locator;
      hubUrl: Locator;
    };
    general: {
      heading: Locator;
      hubName: Locator;
      hubDescription: Locator;
      supportEmail: Locator;
      privacyPolicyLink: Locator;
      termsLink: Locator;
      idleTimeDropdown: Locator;
      copyrightToggle: Locator;
      copyrightNotice: Locator;
    };
    branding: {
      heading: Locator;
      backgroundStyle: Locator;
      brandColor: Locator;
      logoUpload: Locator;
      browseFiles: Locator;
    };
    authentication: {
      heading: Locator;
      loginMethods: {
        email: Locator;
        phone: Locator;
        username: Locator;
      };
      passwordLength: Locator;
      passwordRequirements: {
        lowercase: Locator;
        uppercase: Locator;
        special: Locator;
        numbers: Locator;
      };
      mfaToggle: Locator;
      tenantId: Locator;
      appRegistrationId: Locator;
    };
    businessAddOns: {
      heading: Locator;
      addOnsLink: Locator;
    };
  };

  constructor(page: Page) {
    super(page);
    this.elements = {
      saveChangesButton: this.locatorUtil.getLocatorByRoleButton({ name: 'Save Changes' }),
      navigation: {
        title: this.locatorUtil.getLocatorByRoleHeading({ name: 'Ushur Hub', level: 1 }),
        generalTab: this.locatorUtil.getLocatorByRoleButton({ name: HUB_CONFIG.TABS.GENERAL }),
        addonsTab: this.locatorUtil.getLocatorByRoleButton({ name: HUB_CONFIG.TABS.ADDONS }),
        usecasesTab: this.locatorUtil.getLocatorByRoleButton({ name: HUB_CONFIG.TABS.USECASES }),
        rolesusersTab: this.locatorUtil.getLocatorByRoleButton({
          name: HUB_CONFIG.TABS.ROLESUSERS,
        }),
        remindersTab: this.locatorUtil.getLocatorByRoleButton({ name: HUB_CONFIG.TABS.REMINDERS }),
      },
      status: {
        heading: this.locatorUtil.getLocatorByRoleHeading({
          name: HUB_CONFIG.HEADINGS.STATUS,
          level: 6,
        }),
        toggle: this.locatorUtil.getLocator(
          'div[class="Switch_withLabel__sHGWk"] div[class="react-switch-bg"]',
          {
            hasText: 'Active',
          }
        ),
        inactiveMessage: this.locatorUtil.getLocator('#offlineMessage'),
        hubUrl: this.locatorUtil
          .getLocator('div', { hasText: /^https:\/\/.*\.ushur\.dev/ })
          .first(),
      },
      general: {
        heading: this.locatorUtil.getLocatorByRoleHeading({
          name: HUB_CONFIG.HEADINGS.GENERAL,
          level: 6,
        }),
        hubName: this.locatorUtil.getLocator('#name'),
        hubDescription: this.locatorUtil.getLocator('#description'),
        supportEmail: this.locatorUtil.getLocator('#supportEmail'),
        privacyPolicyLink: this.locatorUtil.getLocator('#privacyPolicy'),
        termsLink: this.locatorUtil.getLocator('#termsConditions'),
        idleTimeDropdown: this.locatorUtil.getLocatorByText(
          'Idle time before Hub session is ended'
        ),
        copyrightToggle: this.locatorUtil.getLocatorByText('Include a copyright notice'),
        copyrightNotice: this.locatorUtil.getLocatorByText('Copyright notice'),
      },
      branding: {
        heading: this.locatorUtil.getLocatorByRoleHeading({
          name: HUB_CONFIG.HEADINGS.BRANDING,
          level: 6,
        }),
        backgroundStyle: this.locatorUtil.getLocatorByText('Background Style'),
        brandColor: this.locatorUtil.getLocatorByText('Brand Color'),
        logoUpload: this.locatorUtil.getLocatorByText('Company Logo'),
        browseFiles: this.locatorUtil.getLocatorByText('Browse files'),
      },
      authentication: {
        heading: this.locatorUtil.getLocatorByRoleHeading({
          name: HUB_CONFIG.HEADINGS.AUTH,
          level: 6,
        }),
        loginMethods: {
          email: this.locatorUtil.getLocatorByText('Email Address'),
          phone: this.locatorUtil.getLocatorByText('Phone Number'),
          username: this.locatorUtil.getLocatorByText('User Name'),
        },
        passwordLength: this.locatorUtil.getLocatorByText('Password minimum length'),
        passwordRequirements: {
          lowercase: this.locatorUtil.getLocatorByLabel('Lowercase'),
          uppercase: this.locatorUtil.getLocatorByLabel('Uppercase'),
          special: this.locatorUtil.getLocatorByLabel('Special Characters'),
          numbers: this.locatorUtil.getLocatorByLabel('Numbers'),
        },
        mfaToggle: this.locatorUtil.getLocatorByText('Multi-Factor Authentication (MFA)'),
        tenantId: this.locatorUtil.getLocatorByText('Tenant ID'),
        appRegistrationId: this.locatorUtil.getLocatorByText('App registration ID'),
      },
      businessAddOns: {
        heading: this.locatorUtil.getLocatorByRoleHeading({
          name: HUB_CONFIG.HEADINGS.BUSINESS_ADDONS,
          level: 6,
        }),
        addOnsLink: this.locatorUtil.getLocatorByRoleLink({ name: 'Add-Ons' }),
      },
    };
  }

  // Navigation methods
  async navigateToTab(tabName: keyof typeof HUB_CONFIG.TABS): Promise<void> {
    const tab =
      this.elements.navigation[
        `${tabName.toLowerCase()}Tab` as keyof typeof this.elements.navigation
      ];
    await this.elementUtil.click(tab);
    await this.navigationUtil.waitForLoadStateNetworkIdle();
  }

  // Status methods
  async setHubStatus(active: boolean): Promise<void> {
    const isActive = (await this.elementUtil.textContent(this.elements.status.toggle)) === 'Active';
    if (active !== isActive) {
      await this.elementUtil.click(this.elements.status.toggle);
      await this.navigationUtil.waitForLoadStateNetworkIdle();
    }
  }

  async setInactiveMessage(message: string): Promise<void> {
    await this.elementUtil.fill(this.elements.status.inactiveMessage, message);
  }

  // General section methods
  async updateHubName(name: string): Promise<void> {
    await this.elementUtil.fill(this.elements.general.hubName, name);
  }

  async updateHubDescription(description: string): Promise<void> {
    await this.elementUtil.fill(this.elements.general.hubDescription, description);
  }

  async setSupportEmail(email: string): Promise<void> {
    await this.elementUtil.fill(this.elements.general.supportEmail, email);
  }

  async setPrivacyPolicyLink(url: string): Promise<void> {
    await this.elementUtil.fill(this.elements.general.privacyPolicyLink, url);
  }

  async setTermsLink(url: string): Promise<void> {
    await this.elementUtil.fill(this.elements.general.termsLink, url);
  }

  // Branding methods
  async uploadLogo(filePath: string): Promise<void> {
    await this.elementUtil.uploadFiles(this.elements.branding.browseFiles, [filePath]);
    await this.navigationUtil.waitForLoadStateNetworkIdle();
  }

  // Authentication methods
  async toggleMFA(enable: boolean): Promise<void> {
    const isMFAEnabled = await this.elements.authentication.mfaToggle.isChecked();
    if (enable !== isMFAEnabled) {
      await this.elementUtil.click(this.elements.authentication.mfaToggle);
      await this.navigationUtil.waitForLoadStateNetworkIdle();
    }
  }

  async setPasswordRequirements(requirements: {
    lowercase?: boolean;
    uppercase?: boolean;
    special?: boolean;
    numbers?: boolean;
  }): Promise<void> {
    for (const [requirement, value] of Object.entries(requirements)) {
      const checkbox =
        this.elements.authentication.passwordRequirements[
          requirement as keyof typeof this.elements.authentication.passwordRequirements
        ];
      const isChecked = await checkbox.isChecked();
      if (value !== isChecked) {
        await checkbox.click();
      }
    }
    await this.navigationUtil.waitForLoadStateNetworkIdle();
  }

  // Validation methods
  async validateNavigationStructure(): Promise<void> {
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.navigation.title);
    for (const tab of Object.values(this.elements.navigation)) {
      await this.locatorAssertionUtil.assertElementIsVisible(tab);
    }
  }

  async saveChanges(): Promise<void> {
    await this.elementUtil.click(this.elements.saveChangesButton);
  }

  async validateGeneralSection(): Promise<void> {
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.general.heading);
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.general.hubName);
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.general.hubDescription);
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.general.supportEmail);
  }

  async validateBrandingSection(): Promise<void> {
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.branding.heading);
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.branding.backgroundStyle);
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.branding.brandColor);
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.branding.logoUpload);
  }

  async validateAuthenticationSection(): Promise<void> {
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.authentication.heading);
    await this.locatorAssertionUtil.assertElementIsVisible(this.elements.authentication.mfaToggle);
    for (const method of Object.values(this.elements.authentication.loginMethods)) {
      await this.locatorAssertionUtil.assertElementIsVisible(method);
    }
  }

  async validateAllSections(): Promise<void> {
    await this.validateNavigationStructure();
    await this.validateGeneralSection();
    await this.validateBrandingSection();
    await this.validateAuthenticationSection();
  }

  // Utility methods
  async waitForPageLoad(): Promise<void> {
    await this.navigationUtil.waitForLoadStateNetworkIdle();
    await this.validateNavigationStructure();
  }
}
