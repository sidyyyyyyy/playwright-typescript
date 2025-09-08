import { HomePageConfig } from '@core/constants/ushur';

/**
 * Test data for navigation tests
 * @description Test data for navigation tests
 * @example const subSectionNavigationTestData = [
 *   { name: 'Projects', section: 'projects' },
 *   { name: 'Canvas', section: 'canvas' },
 *   { name: 'Launchpad', section: 'launchpad' },
 *   { name: 'Ushur Hub', section: 'ushurHub' },
 *   { name: 'Insights', section: 'insights' },
 *   { name: 'Campaign', section: 'campaign' },
 *   { name: 'Reports', section: 'reports' },
 *   { name: 'Data Tables', section: 'dataTables' },
 *   { name: 'AI Studio', section: 'aiStudio' },
 *   { name: 'Contacts', section: 'contacts' },
 *   { name: 'Shortlinks', section: 'shortlinks' },
 *   { name: 'Integrations', section: 'integrations' },
 *   { name: 'Settings', section: 'settings' },
 *   { name: 'Admin Tools', section: 'adminTools' },
 * ] as const;
 */
export const subSectionNavigationTestData = [
  { name: HomePageConfig.SUB_SECTIONS.PROJECTS, section: 'projects' },
  { name: HomePageConfig.SUB_SECTIONS.CANVAS, section: 'canvas' },
  { name: HomePageConfig.SUB_SECTIONS.CAMPAIGNS, section: 'campaigns' },
  { name: HomePageConfig.SUB_SECTIONS.LAUNCHPAD, section: 'launchpad' },
  { name: HomePageConfig.SUB_SECTIONS.USHUR_HUB, section: 'ushurHub' },
  { name: HomePageConfig.SUB_SECTIONS.INSIGHTS, section: 'insights' },
  { name: HomePageConfig.SUB_SECTIONS.CAMPAIGN_ANALYTICS, section: 'campaignAnalytics' },
  { name: HomePageConfig.SUB_SECTIONS.REPORTS, section: 'reports' },
  { name: HomePageConfig.SUB_SECTIONS.DATA_TABLES, section: 'dataTables' },
  { name: HomePageConfig.SUB_SECTIONS.AI_STUDIO, section: 'aiStudio' },
  { name: HomePageConfig.SUB_SECTIONS.CONTACTS, section: 'contacts' },
  { name: HomePageConfig.SUB_SECTIONS.SHORTLINKS, section: 'shortlinks' },
  { name: HomePageConfig.SUB_SECTIONS.INTEGRATIONS, section: 'integrations' },
  { name: HomePageConfig.SUB_SECTIONS.SETTINGS, section: 'settings' },
  { name: HomePageConfig.SUB_SECTIONS.ADMIN_TOOLS, section: 'adminTools' },
] as const;

export type SubSectionNavigationTestData = (typeof subSectionNavigationTestData)[number];
