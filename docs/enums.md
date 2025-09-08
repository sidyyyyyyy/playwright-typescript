# Enums Guide

_Author: Anand Sogalad_

This guide explains how to work with enums in our automation framework. Whether you're a developer, QA engineer, or completely new to coding, this will help you understand and contribute effectively.

## Table of Contents

- [What Are Enums?](#what-are-enums)
- [Why Do We Use Enums?](#why-do-we-use-enums)
- [Getting Started](#getting-started)
- [Available Enums](#available-enums)
- [How to Use Enums](#how-to-use-enums)
- [Adding New Options](#adding-new-options)
- [Common Examples](#common-examples)
- [Best Practices](#best-practices)

---

## What Are Enums?

Enums are like dropdown menus in code. They give us a list of valid options to choose from, preventing mistakes and typos.

**Real-world analogy:**
Think of ordering coffee - instead of saying "I want a hot caffeinated beverage made from beans," you say "I want a latte." Enums work the same way - they give us simple, clear names for things.

**Code example:**

```typescript
// Instead of typing strings that might have typos:
browser: 'chrome'; // ❌ Could be misspelled as 'chrom' or 'Chrome'

// We use enums for consistency:
browser: BrowserName.CHROME; // ✅ Clear, no typos possible
```

**Location:** All enums live in `src/core/enums/`

---

## Why Do We Use Enums?

Think of enums as guardrails that keep us safe:

- **No more typos** - Can't misspell `BrowserName.CHROME`
- **Shows available options** - Your editor suggests what you can choose
- **Catches mistakes early** - Computer tells you if something's wrong
- **Makes code readable** - Anyone can understand what `TestPriority.HIGH` means

**Example of the problem they solve:**

```typescript
// Without enums - easy to make mistakes:
priority: 'hgh'; // ❌ Typo!
browser: 'Chrome'; // ❌ Wrong capitalization
status: 'complete'; // ❌ Should be 'completed'

// With enums - impossible to make these mistakes:
priority: TestPriority.HIGH; // ✅ Clear and correct
browser: BrowserName.CHROME; // ✅ Consistent
status: TestStatus.COMPLETED; // ✅ Obvious
```

---

## Getting Started

### Quick Start

To use any enums, just import what you need:

```typescript
import { BrowserName, TestPriority } from '@core/enums';
```

That's it! No complicated file paths to remember.

### What's Available

We organize our enums by purpose:

| Category            | What It's For          | Examples                   |
| ------------------- | ---------------------- | -------------------------- |
| **Browser**         | Different web browsers | Chrome, Firefox, Safari    |
| **Test Management** | Organizing tests       | High priority, Smoke tests |
| **API**             | Web requests           | GET, POST, Authentication  |
| **User Actions**    | Keyboard/mouse         | Enter key, Left click      |
| **Performance**     | Speed testing          | Load time, Page speed      |
| **Accessibility**   | Web standards          | WCAG compliance levels     |
| **Security**        | Safety testing         | Risk levels, Scan types    |

---

## Available Enums

### 🌍 **Browser Options** (`browser.enums.ts`)

Choose which browser and device to test with

| What You Get    | Examples                      | When to Use                   |
| --------------- | ----------------------------- | ----------------------------- |
| `BrowserName`   | Chrome, Firefox, Safari       | Picking which browser to test |
| `BrowserDevice` | Desktop Chrome, Mobile Safari | Testing on different devices  |
| `ColorScheme`   | Light mode, Dark mode         | Testing website themes        |

### 🧪 **Test Organization** (`test.enums.ts`)

Organize and prioritize your tests

| What You Get   | Examples               | When to Use                    |
| -------------- | ---------------------- | ------------------------------ |
| `TestPriority` | High, Critical, Low    | Deciding which tests run first |
| `TestTag`      | Smoke, Regression, E2E | Grouping similar tests         |
| `TestType`     | UI, API, Performance   | Categorizing test types        |

### 🌐 **API Testing** (`api.enums.ts`)

Make web requests and handle authentication

| What You Get | Examples               | When to Use                     |
| ------------ | ---------------------- | ------------------------------- |
| `ApiMethod`  | GET, POST, DELETE      | Different types of web requests |
| `AuthType`   | Bearer, Basic, API Key | How to authenticate requests    |

### ⌨️ **User Actions** (`key.enums.ts`)

Simulate keyboard and mouse interactions

| What You Get  | Examples                | When to Use              |
| ------------- | ----------------------- | ------------------------ |
| `KeyboardKey` | Enter, Tab, Arrow keys  | Simulating user typing   |
| `MouseButton` | Left click, Right click | Simulating mouse actions |

### 🎯 **Finding Elements** (`locator.enums.ts`)

Locate buttons, forms, and other page elements

| What You Get  | Examples                    | When to Use                              |
| ------------- | --------------------------- | ---------------------------------------- |
| `LocatorRole` | Button, Textbox, Navigation | Finding elements by their purpose        |
| `WaitState`   | Visible, Hidden             | Waiting for elements to appear/disappear |

### ⚡ **Performance Testing** (`performance.enums.ts`)

Measure how fast your website loads

| What You Get           | Examples                | When to Use               |
| ---------------------- | ----------------------- | ------------------------- |
| `PerformanceMetric`    | Load time, Layout shift | Measuring website speed   |
| `PerformanceThreshold` | Speed limits            | Setting performance goals |

### 🔒 **Security Testing** (`security.enums.ts`)

Check for security vulnerabilities

| What You Get        | Examples          | When to Use                       |
| ------------------- | ----------------- | --------------------------------- |
| `SecurityRiskLevel` | Low, Medium, High | Categorizing security issues      |
| `SecurityScanType`  | Passive, Active   | Different types of security scans |

---

## How to Use Enums

### Basic Example

```typescript
import { BrowserName, TestPriority } from '@core/enums';

// Set up test configuration
const config = {
  browser: BrowserName.CHROME, // ✅ Clear which browser
  priority: TestPriority.HIGH, // ✅ Clear importance level
};
```

### In Your Tests

```typescript
import { LocatorRole, KeyboardKey } from '@core/enums';

test('Login form test', async ({ page }) => {
  // Find the login button
  const button = page.getByRole(LocatorRole.BUTTON, { name: 'Login' });

  // Press Enter key
  await page.keyboard.press(KeyboardKey.ENTER);
});
```

### API Testing

```typescript
import { ApiMethod } from '@core/enums';

// Make different types of requests
const response = await request.fetch('/api/users', {
  method: ApiMethod.GET, // ✅ Clear it's a GET request
});
```

---

## Adding New Options

### Step 1: Find the Right File

Pick the file that matches your new options:

- **Browser stuff** → `browser.enums.ts`
- **API/web requests** → `api.enums.ts`
- **Test organization** → `test.enums.ts`
- **User actions** → `key.enums.ts`
- **Something new** → Create a new file

### Step 2: Add Your Options

```typescript
// Example: Adding test statuses
export enum TestStatus {
  WAITING = 'waiting',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
}
```

### Step 3: Add a Description

```typescript
/**
 * Test execution statuses.
 * @description Shows what state a test is in
 * @example const status = TestStatus.PASSED;
 */
export enum TestStatus {}
// ... your options here
```

### Step 4: Make It Available

Add your new enum to `index.ts` so others can use it:

```typescript
export * from './your-new-file.enums';
```

---

## Common Examples

### Testing Different Browsers

```typescript
import { BrowserName, ColorScheme } from '@core/enums';

// Test on multiple browsers
const browsers = [BrowserName.CHROME, BrowserName.FIREFOX];

// Test dark mode
await page.emulateMedia({ colorScheme: ColorScheme.DARK });
```

### Organizing Tests

```typescript
import { TestTag, TestPriority } from '@core/enums';

// Mark important tests
test('Critical login test', async ({ page }) => {
  // This test has high priority
  test.info().annotations.push({
    type: TestTag.SMOKE,
    description: 'Important test that runs first',
  });
});
```

### Making Web Requests

```typescript
import { ApiMethod } from '@core/enums';

// Different types of requests
await request.fetch('/api/users', { method: ApiMethod.GET }); // Get data
await request.fetch('/api/users', { method: ApiMethod.POST }); // Create data
await request.fetch('/api/users/1', { method: ApiMethod.DELETE }); // Delete data
```

---

## Best Practices

### ✅ Do's

- **Always import from `@core/enums`** - One simple import for everything
- **Use descriptive names** - Make it obvious what each option does
- **Add helpful comments** - Explain what your enum is for
- **Keep related options together** - Group similar choices in one enum

### ❌ Don'ts

- **Don't type strings manually** - Use enum values instead
- **Don't create overly complex enums** - Keep them simple and focused
- **Don't forget to share** - Add new enums to the index file

### 💡 Simple Guidelines

```typescript
// ✅ Good - Clear and consistent
export enum TestResult {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

// ❌ Avoid - Numbers are harder to understand
export enum Priority {
  LOW = 1,
  HIGH = 2,
}
```

---

## Quick Reference

### Most Common Enums

| What You Need   | Use This             | Example           |
| --------------- | -------------------- | ----------------- |
| Browser choice  | `BrowserName.CHROME` | Testing in Chrome |
| Test importance | `TestPriority.HIGH`  | Important test    |
| Web request     | `ApiMethod.POST`     | Sending data      |
| Button click    | `LocatorRole.BUTTON` | Finding buttons   |
| Key press       | `KeyboardKey.ENTER`  | Pressing Enter    |

### Getting Help

- **Can't find the right enum?** → Check this documentation
- **Want to add new options?** → Follow the "Adding New Options" section
- **Need to see the code?** → Look in `src/core/enums/`

---

**Remember:** Enums are like dropdown menus for your code - they give you safe, reliable choices and prevent mistakes!
