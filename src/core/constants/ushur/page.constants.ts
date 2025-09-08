/**
 * @fileoverview Ushur Page Constants - Application page URLs and configuration
 * @description Page routes, selectors, and configuration for Ushur application testing
 * @author Anand Sogalad
 */

/**
 * Application page URLs.
 * @description Page routes for navigation and testing
 */
export const PageUrls = {
  LOGIN: '/mob3.0/ushur-ui/?route=signin',
} as const;

/**
 * Login page configuration.
 * @description Text content, selectors, and settings for login page testing
 */
export const LoginPageConfig = {
  // Text Content
  AUTOMATION_TEXT: 'Automation that Understands!',
  EMAIL_PLACEHOLDER: 'Email',
  FORGOT_PASSWORD_TEXT: 'Forgot password',
  LOGIN_BUTTON_TEXT: 'Login',
  LOGIN_ERROR_MESSAGE: 'Incorrect username or password',
  PASSWORD_PLACEHOLDER: 'Password',
  SIGNUP_LINK_TEXT: 'Sign up',
  USHUR_LOGO_ALT_TEXT: 'Ushur Logo',
  WELCOME_TEXT: 'Welcome back to',

  // Selectors and Configuration
  EXPECTED_TILE_COUNT: 4,
  TILE_BUTTONS: '//ul[@class="slick-dots"]',
  TILE_ITEMS: '//ul[@class="slick-dots"]/li',
} as const;

/**
 * Home page configuration.
 * @description Text content, selectors, and settings for home page testing
 */
export const HomePageConfig = {
  HEADER: {
    USHUR_LOGO_ALT_TEXT: 'Ushur Logo',
    STUDIO_TOGGLE_TEXT: 'Studio',
    CREATE_PROJECT_BUTTON_TEXT: 'Create Project',
  },
  SECTIONS: {
    AUTOMATION: 'AUTOMATION',
    ANALYTICS: 'ANALYTICS',
    MANAGE: 'Manage',
    ACCOUNT: 'Account',
  },
  SUB_SECTIONS: {
    PROJECTS: 'Projects',
    CANVAS: 'Canvas',
    CAMPAIGNS: 'Campaigns',
    LAUNCHPAD: 'Launchpad',
    USHUR_HUB: 'Ushur Hub',
    INSIGHTS: 'Insights',
    CAMPAIGN_ANALYTICS: 'Campaign Analytics',
    REPORTS: 'Reports',
    DATA_TABLES: 'Data Tables',
    AI_STUDIO: 'AI Studio',
    CONTACTS: 'Contacts',
    SHORTLINKS: 'Shortlinks',
    INTEGRATIONS: 'Integrations',
    SETTINGS: 'Settings',
    ADMIN_TOOLS: 'Admin Tools',
    SUPPORT: 'Support',
  },
  SUB_SECTION_LINK_SELECTOR: 'div.menu-item.text-dark-blue',
  LOGOUT_BUTTON_TEST_ID: 'logout-button',
  MODAL_HEADER_TITLE_SELECTOR: '.modal-header-title-container.text-h2.h4',
  CUSTOM_PROJECT_BUTTON_TEXT: 'Custom project',
  CREATE_WORKFLOW_TEXT: 'Create Workflow',
  VIEW_ALL_PROJECTS_TEXT: 'View all Projects',
} as const;

/**
 * Report page configuration.
 * @description Configuration and settings for report page testing
 */
export const ReportPageConfig = {
  TABS: {
    REPORT_TEMPLATES: 'reportTemplates',
    PRESETS: 'presets',
    GENERATED_REPORTS: 'generatedReports',
    SCHEDULED_REPORTS: 'scheduledReports',
  },
} as const;

/**
 * Page URL type.
 * @description Type representing valid page URLs
 */
export type PageUrl = (typeof PageUrls)[keyof typeof PageUrls];

/**
 * Login page configuration key type.
 * @description Type representing login page configuration keys
 */
export type LoginPageConfigKey = keyof typeof LoginPageConfig;

/**
 * Report page configuration key type.
 * @description Type representing report page configuration keys
 */
export type ReportPageConfigKey = keyof typeof ReportPageConfig;
