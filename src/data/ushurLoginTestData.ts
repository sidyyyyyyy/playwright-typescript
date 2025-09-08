// Core framework imports
import type { UserCredential } from '@core/interfaces';

/**
 * @fileoverview Ushur Login Test Data - Comprehensive test credentials for login scenarios
 * @description Test data covering valid logins, validation errors, and security testing
 * @author Anand Sogalad
 */

/**
 * Test login credentials for various scenarios.
 * @description Comprehensive test data including valid credentials, validation tests, and security scenarios
 */
export const ushurTestLoginCredentials: UserCredential[] = [
  // Valid credentials
  {
    email: 'test_admin@ushurdummy.me',
    password: 'Ushur@123',
    description: 'Valid user credentials',
    loginSuccess: true,
  },

  // Invalid email formats
  {
    email: 'userexample.com',
    password: 'Ushur@123',
    description: 'Missing @ in email',
    loginSuccess: false,
  },
  {
    email: 'user@.com',
    password: 'Ushur@123',
    description: 'Missing domain name',
    loginSuccess: false,
  },
  {
    email: 'user@com',
    password: 'Ushur@123',
    description: 'Missing dot in domain',
    loginSuccess: false,
  },

  // Invalid password formats
  {
    email: 'test_admin@ushurdummy.me',
    password: 'short',
    description: 'Password too short',
    loginSuccess: false,
  },
  {
    email: 'test_admin@ushurdummy.me',
    password: 'alllowercase',
    description: 'Password lacks uppercase, number, symbol',
    loginSuccess: false,
  },
  {
    email: 'test_admin@ushurdummy.me',
    password: 'ALLUPPERCASE123',
    description: 'Password lacks lowercase, symbol',
    loginSuccess: false,
  },
  {
    email: 'test_admin@ushurdummy.me',
    password: 'NoNumber!',
    description: 'Password lacks number',
    loginSuccess: false,
  },
  {
    email: 'test_admin@ushurdummy.me',
    password: 'NoSymbol123',
    description: 'Password lacks symbol',
    loginSuccess: false,
  },

  // SQL Injection attempt
  {
    email: 'test_admin@ushurdummy.me',
    password: "' OR '1'='1",
    description: 'SQL injection in password',
    loginSuccess: false,
  },
  {
    email: "' OR 1=1--@ushurdummy.me",
    password: 'ValidPass123!',
    description: 'SQL injection in email',
    loginSuccess: false,
  },

  // XSS attempt
  {
    email: '<script>alert(1)</script>@example.com',
    password: 'ValidPass123!',
    description: 'XSS in email',
    loginSuccess: false,
  },

  // Empty fields
  {
    email: '',
    password: 'Ushur@123',
    description: 'Empty email',
    loginSuccess: false,
  },
  {
    email: 'test_admin@ushurdummy.me',
    password: '',
    description: 'Empty password',
    loginSuccess: false,
  },
  {
    email: '',
    password: '',
    description: 'Both fields empty',
    loginSuccess: false,
  },

  // Whitespace issues
  {
    email: ' test_admin@ushurdummy.me ',
    password: ' Ushur@123 ',
    description: 'Leading/trailing spaces',
    loginSuccess: false,
  },

  // Unicode/Internationalization
  {
    email: 'üser@exämple.com',
    password: 'ValidPass123!',
    description: 'Unicode characters in email',
    loginSuccess: false,
  },
  {
    email: 'user@example.com',
    password: 'Pässwörd123!',
    description: 'Unicode characters in password',
    loginSuccess: false,
  },
];
