/**
 * @fileoverview Boolean Constants - Consistent boolean and undefined values
 * @description Standard boolean constants for configuration and flags
 * @author Anand Sogalad
 */

/**
 * Boolean values for configuration toggles and flags.
 * @description Consistent boolean constants across the framework
 */
export const BooleanValues = {
  FALSE: false,
  TRUE: true,
} as const;

/**
 * Undefined value constant.
 * @description Consistent undefined constant for configuration
 */
export const UndefinedValue: undefined = undefined;

/**
 * Boolean value type.
 * @description Type representing valid boolean values
 */
export type BooleanValue = (typeof BooleanValues)[keyof typeof BooleanValues];
