/**
 * @fileoverview Configuration Types - Integration and service configuration interfaces
 * @description Type definitions for external service integrations and configurations
 * @author Anand Sogalad
 */

/**
 * Integration configuration for third-party services.
 * @description Configuration for external service integrations like Jira, Slack, monitoring tools
 * @example const config: IntegrationConfig = { jira: { url: 'https://company.atlassian.net', projectKey: 'TEST' } };
 */
export interface IntegrationConfig {
  jira?: JiraConfig;
  slack?: SlackConfig;
  teams?: TeamsConfig;
  email?: EmailConfig;
  monitoring?: MonitoringConfig;
}

/**
 * Jira integration configuration.
 * @description Settings for connecting to Jira for issue tracking
 * @example const jira: JiraConfig = { url: 'https://company.atlassian.net', username: 'user', password: 'pass', projectKey: 'TEST', issueType: 'Bug' };
 */
export interface JiraConfig {
  url: string;
  username: string;
  password: string;
  projectKey: string;
  issueType: string;
}

/**
 * Slack integration configuration.
 * @typedef SlackConfig
 */
export interface SlackConfig {
  webhook: string;
  channel: string;
  username?: string;
  iconEmoji?: string;
}

/**
 * Microsoft Teams integration configuration.
 * @typedef TeamsConfig
 */
export interface TeamsConfig {
  webhook: string;
  title?: string;
  themeColor?: string;
}

/**
 * Email integration configuration.
 * @typedef EmailConfig
 */
export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
}

/**
 * Monitoring integration configuration.
 * @typedef MonitoringConfig
 */
export interface MonitoringConfig {
  type: 'grafana' | 'datadog' | 'newrelic' | 'custom';
  url: string;
  apiKey: string;
  dashboardId?: string;
}
