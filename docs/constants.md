# Constants Guide

_Author: Anand Sogalad_

This guide explains how to work with constants in our automation framework. Whether you're a developer, QA engineer, or new contributor, this will help you understand and use constants effectively.

## Table of Contents

- [What Are Constants?](#what-are-constants)
- [Why Do We Use Constants?](#why-do-we-use-constants)
- [Getting Started](#getting-started)
- [Available Constants](#available-constants)
- [How to Use Constants](#how-to-use-constants)
- [Adding New Constants](#adding-new-constants)
- [Common Scenarios](#common-scenarios)
- [Best Practices](#best-practices)

---

## What Are Constants?

Constants are predefined values that never change throughout the application. Think of them as a central storage for all the important settings, paths, messages, and configurations that our testing framework uses.

**Simple Example:**
Instead of writing `'/api/rest/v2/accounts/login'` in multiple test files, we define it once as `ApiEndpoints.LOGIN` and use that everywhere. If the URL changes, we only update it in one place.

**Location:** All constants live in `src/core/constants/`

---

## Why Do We Use Constants?

**Why do we need them?**

- **Consistency** - Everyone uses the same values
- **Easy to change** - Update once, changes everywhere
- **Prevents mistakes** - No typos in URLs or file paths
- **Self-documenting** - Clear, meaningful names

---

## Getting Started

### Quick Start

To use any constants in your tests, simply import them:

```typescript
import { ApiEndpoints, TimeoutValues, FilePaths } from '@core/constants';
```

That's it! No need to worry about individual file paths.

### What's Available

Our constants are organized into categories:

```
src/core/constants/
├── api.constants.ts          # API endpoints and headers
├── boolean.constants.ts      # True/false values
├── browser.constants.ts      # Viewport sizes
├── filepath.constants.ts     # File and folder paths
├── message.constants.ts      # Error and success messages
├── performance.constants.ts  # Performance metrics
├── redis.constants.ts        # Database settings
├── test.constants.ts         # Timeouts and test config
├── ushur/page.constants.ts   # Page URLs and content
└── index.ts                  # Main export file
```

---

## Available Constants

### 🌐 **API Constants** (`api.constants.ts`)

Settings for API calls and web requests

| Constant             | What It Does                      | Example                                |
| -------------------- | --------------------------------- | -------------------------------------- |
| `ApiDefaultHeaders`  | Standard headers for API requests | `{'Content-Type': 'application/json'}` |
| `ApiEndpoints.LOGIN` | Login API endpoint URL            | `'/api/rest/v2/accounts/login'`        |

**Use when:** Making API calls, setting up requests

### ✅ **Boolean Constants** (`boolean.constants.ts`)

Consistent true/false values

| Constant              | What It Does             | Value       |
| --------------------- | ------------------------ | ----------- |
| `BooleanValues.TRUE`  | Standard true value      | `true`      |
| `BooleanValues.FALSE` | Standard false value     | `false`     |
| `UndefinedValue`      | Standard undefined value | `undefined` |

**Use when:** Configuration settings, feature toggles

### 🌍 **Browser Constants** (`browser.constants.ts`)

Standard screen sizes for testing

| Constant                   | What It Does        | Value                         |
| -------------------------- | ------------------- | ----------------------------- |
| `DefaultViewports.DESKTOP` | Desktop screen size | `{width: 1920, height: 1080}` |
| `DefaultViewports.MOBILE`  | Mobile screen size  | `{width: 375, height: 667}`   |

**Use when:** Setting up responsive tests, browser configuration

### 📁 **File Path Constants** (`filepath.constants.ts`)

Locations of folders and files

| Constant                      | What It Does        | Value                   |
| ----------------------------- | ------------------- | ----------------------- |
| `FilePaths.TESTS_DIR`         | Test files location | `'src/tests'`           |
| `FilePaths.REPORTS_DIR`       | Reports folder      | `'reports'`             |
| `FilePaths.SCREENSHOTS_DIR`   | Screenshots folder  | `'reports/screenshots'` |
| `FilePaths.GLOBAL_SETUP_FILE` | Setup file location | `'src/global.setup.ts'` |

**Use when:** File operations, configuring test runs, reports

### 💬 **Message Constants** (`message.constants.ts`)

Standardized error and success messages

| Category                     | What It Contains               | Examples                              |
| ---------------------------- | ------------------------------ | ------------------------------------- |
| `CommonErrorMessages`        | General errors                 | `'Test execution failed'`             |
| `UIErrorMessages`            | UI-specific errors             | `'UI element not found'`              |
| `APIErrorMessages`           | API-related errors             | `'Invalid API request'`               |
| `AccessibilityErrorMessages` | Accessibility errors           | `'Accessibility violations detected'` |
| Success message variants     | Corresponding success messages | `'Test passed successfully'`          |

**Use when:** Error handling, logging, consistent messaging

### 📄 **Page Constants** (`ushur/page.constants.ts`)

Page URLs and content specific to the application

| Constant                            | What It Does          | Value                              |
| ----------------------------------- | --------------------- | ---------------------------------- |
| `PageUrls.LOGIN`                    | Login page URL        | `'/mob3.0/ushur-ui/?route=signin'` |
| `LoginPageConfig.LOGIN_BUTTON_TEXT` | Login button text     | `'Login'`                          |
| `LoginPageConfig.WELCOME_TEXT`      | Welcome message       | `'Welcome back to'`                |
| `ReportPageConfig.TABS`             | Report page tab names | Object with tab identifiers        |

**Use when:** Navigation, UI validation, page testing

### ⚡ **Performance Constants** (`performance.constants.ts`)

Performance testing metrics

| Constant                                 | What It Does       | Contains                     |
| ---------------------------------------- | ------------------ | ---------------------------- |
| `PerformanceMetricGroups.WEB_VITALS`     | Core web vitals    | Critical performance metrics |
| `PerformanceMetricGroups.NON_WEB_VITALS` | Additional metrics | Supplementary metrics        |

**Use when:** Performance testing, monitoring web vitals

### 🗄️ **Redis Constants** (`redis.constants.ts`)

Database connection and user pool settings

| Category      | What It Contains         | Examples                      |
| ------------- | ------------------------ | ----------------------------- |
| `RedisConfig` | Connection settings      | Host, port, timeouts          |
| `RedisKeys`   | Key generation functions | Session and user keys         |
| `RedisErrors` | Error type definitions   | Connection failures, timeouts |

**Use when:** Database operations, user session management

### ⏱️ **Test Constants** (`test.constants.ts`)

Test timing and configuration

| Constant                       | What It Does            | Value                |
| ------------------------------ | ----------------------- | -------------------- |
| `TimeoutValues.TEST_TIMEOUT`   | Maximum test duration   | `60000` (60 seconds) |
| `TimeoutValues.EXPECT_TIMEOUT` | Assertion timeout       | `5000` (5 seconds)   |
| `UserPoolConfig.INITIAL_SIZE`  | Starting user pool size | `200`                |
| `UserPoolConfig.MAX_SIZE`      | Maximum user pool size  | `1000`               |

**Use when:** Configuring test behavior, setting timeouts

---

## How to Use Constants

### Basic Usage

```typescript
// Import what you need
import { ApiEndpoints, TimeoutValues, FilePaths } from '@core/constants';

// Use in your code
const response = await api.post(ApiEndpoints.LOGIN, loginData);
await page.waitForTimeout(TimeoutValues.EXPECT_TIMEOUT);
```

### In Test Files

```typescript
import { LoginPageConfig, PageUrls } from '@core/constants';

test('Login page should display correctly', async ({ page }) => {
  // Navigate using constant URL
  await page.goto(PageUrls.LOGIN);

  // Check text using constants
  await expect(page.locator('button')).toHaveText(LoginPageConfig.LOGIN_BUTTON_TEXT);
});
```

### In Configuration Files

```typescript
import { FilePaths, TimeoutValues } from '@core/constants';

export const config = {
  testDir: FilePaths.TESTS_DIR,
  timeout: TimeoutValues.TEST_TIMEOUT,
  outputDir: FilePaths.REPORTS_DIR,
};
```

---

## Adding New Constants

### Step 1: Choose the Right File

Decide which category your constant belongs to:

- **API endpoints/headers** → `api.constants.ts`
- **File/folder paths** → `filepath.constants.ts`
- **Error/success messages** → `message.constants.ts`
- **Page URLs/content** → `ushur/page.constants.ts`
- **Timeouts/test config** → `test.constants.ts`
- **Other categories** → Appropriate existing file

### Step 2: Add Your Constant

```typescript
// Example: Adding a new API endpoint
export const ApiEndpoints = {
  LOGIN: '/api/rest/v2/accounts/login',
  LOGOUT: '/api/rest/v2/accounts/logout', // ← New constant
} as const;
```

### Step 3: Add Type (if needed)

```typescript
// Add to the existing type definition
export type ApiEndpoint = (typeof ApiEndpoints)[keyof typeof ApiEndpoints];
```

### Step 4: Update Documentation

Add your new constant to this guide so others can find it!

---

## Common Scenarios

### Setting Up Tests

```typescript
import { PageUrls, TimeoutValues } from '@core/constants';

test('Login test', async ({ page }) => {
  await page.goto(PageUrls.LOGIN);
  await page.waitForTimeout(TimeoutValues.EXPECT_TIMEOUT);
});
```

### Making API Calls

```typescript
import { ApiEndpoints, ApiDefaultHeaders } from '@core/constants';

const response = await request.post(ApiEndpoints.LOGIN, {
  headers: ApiDefaultHeaders,
  data: loginData,
});
```

### Error Handling

```typescript
import { CommonErrorMessages } from '@core/constants';

if (!response.ok()) {
  throw new Error(CommonErrorMessages.TEST_FAILED);
}
```

### File Operations

```typescript
import { FilePaths } from '@core/constants';

const reportPath = `${FilePaths.REPORTS_DIR}/test-results.json`;
```

---

## Best Practices

### ✅ Do's

- **Always import from `@core/constants`** - Don't import from individual files
- **Use descriptive names** - Make purpose clear
- **Group related constants** - Keep similar values together
- **Add `as const`** - Ensures type safety
- **Add comments** - Explain complex or important values

### ❌ Don'ts

- **Don't use magic numbers** - Use named constants instead
- **Don't duplicate values** - Reference existing constants
- **Don't use unclear names** - Avoid abbreviations
- **Don't hardcode values** - Use constants everywhere

---

## Quick Reference

### Most Commonly Used Constants

| What You Need  | Import This           | Use This                          |
| -------------- | --------------------- | --------------------------------- |
| Test timeout   | `TimeoutValues`       | `TimeoutValues.TEST_TIMEOUT`      |
| API endpoint   | `ApiEndpoints`        | `ApiEndpoints.LOGIN`              |
| Page URL       | `PageUrls`            | `PageUrls.LOGIN`                  |
| File paths     | `FilePaths`           | `FilePaths.TESTS_DIR`             |
| True/False     | `BooleanValues`       | `BooleanValues.TRUE`              |
| Error messages | `CommonErrorMessages` | `CommonErrorMessages.TEST_FAILED` |

### Getting Help

- **Which constant to use?** → Check this documentation
- **How to add new constants?** → Follow the "Adding New Constants" section
- **Where is a constant defined?** → Look in `src/core/constants/`

---

**Remember:** Constants make our framework consistent and maintainable. When in doubt, use a constant!
