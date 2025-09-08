/**
 * @fileoverview Browser Constants - Viewport sizes and browser configuration
 * @description Standard viewport configurations for consistent cross-device testing
 * @author Anand Sogalad
 */

/**
 * Default viewport sizes for desktop and mobile devices.
 * @description Standard viewport configurations for consistent testing
 */
export const DefaultViewports = {
  DESKTOP: { width: 1920, height: 1080 },
  MOBILE: { width: 375, height: 667 },
} as const;

/**
 * Viewport type.
 * @description Type representing viewport configuration
 */
export type ViewportType = (typeof DefaultViewports)[keyof typeof DefaultViewports];
