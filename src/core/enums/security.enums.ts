/**
 * @fileoverview Security Enums - Security scan types, risk levels, and scoring
 * @description Security testing configuration and risk assessment enums
 * @author Anand Sogalad
 */

/**
 * Security scan types.
 * @description Security scan types for security testing
 */
export enum SecurityScanType {
  PASSIVE = 'passive',
  ACTIVE = 'active',
  BASELINE = 'baseline',
}

/**
 * Security risk levels.
 * @description Security risk levels for security testing
 */
export enum SecurityRiskLevel {
  INFORMATIONAL = 'informational',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Security scan modes.
 * @description Security scan modes for security testing
 */
export enum SecurityScanMode {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  PRE_DEPLOYMENT = 'pre-deployment',
  POST_DEPLOYMENT = 'post-deployment',
}

/**
 * Security risk scores.
 * @description Security risk scores for security testing
 */
export enum SecurityRiskScore {
  INFORMATIONAL = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

/**
 * Security severity colors.
 * @description Security severity colors for security testing
 */
export enum SecuritySeverityColors {
  INFORMATIONAL = 'gray',
  LOW = 'yellow',
  MEDIUM = 'orange',
  HIGH = 'red',
}
