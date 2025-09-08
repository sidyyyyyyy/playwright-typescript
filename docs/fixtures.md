# Fixtures Guide

_Author: Anand Sogalad_

This guide explains how to work with fixtures in our automation framework. Whether you're new to testing or an experienced developer, this will help you understand and use fixtures effectively.

## Table of Contents

- [What Are Fixtures?](#what-are-fixtures)
- [Why Do We Use Fixtures?](#why-do-we-use-fixtures)
- [Getting Started](#getting-started)
- [Available Fixtures](#available-fixtures)
- [How to Use Fixtures](#how-to-use-fixtures)
- [Creating New Fixtures](#creating-new-fixtures)
- [Common Examples](#common-examples)
- [Best Practices](#best-practices)

---

## What Are Fixtures?

Fixtures are like helpful assistants that automatically set up and clean up everything your tests need. Think of them as stage crews that prepare the stage before a performance and clean up afterward.

**Simple analogy:**
When you go to a restaurant, the staff sets up your table with plates, utensils, and napkins before you arrive, and they clean everything up after you leave. Fixtures work the same way - they prepare what your tests need and clean up when done.

**Example:**

```typescript
// Without fixtures - you have to do everything manually:
test('Login test', async ({ page }) => {
  const user = await createTestUser(); // ❌ Manual setup
  await page.goto('/login');
  await page.fill('#email', user.email);
  await deleteTestUser(user); // ❌ Manual cleanup
});

// With fixtures - everything is automatic:
test('Login test', async ({ page, user }) => {
  // ✅ User provided automatically
  await page.goto('/login');
  await page.fill('#email', user.email); // ✅ No cleanup needed
}); // ✅ Cleanup happens automatically
```

**Location:** All fixtures are stored in `src/fixtures/`

---

## Why Do We Use Fixtures?

Fixtures act like reliable assistants that make testing easier:

- **Automatic setup** - Everything you need is prepared before your test starts
- **Automatic cleanup** - Everything is cleaned up after your test finishes
- **No conflicts** - Each test gets its own fresh resources
- **Less work** - You focus on testing, not on setup and cleanup
- **Safer tests** - Cleanup happens even if tests fail

**Real problem they solve:**

```typescript
// Without fixtures - lots of manual work and potential problems:
test('User can update profile', async ({ page }) => {
  const user = await createUser(); // ❌ Manual setup
  await loginUser(user); // ❌ More manual work

  // Your actual test
  await page.goto('/profile');
  await page.fill('#name', 'New Name');

  await logoutUser(); // ❌ Manual cleanup
  await deleteUser(user); // ❌ More manual cleanup
  // ❌ What if test fails? Cleanup might not happen!
});

// With fixtures - clean and automatic:
test('User can update profile', async ({ page, user }) => {
  // ✅ User is already logged in and ready

  // Your actual test
  await page.goto('/profile');
  await page.fill('#name', 'New Name');

  // ✅ Cleanup happens automatically, even if test fails
});
```

---

## Getting Started

### Quick Start

To use fixtures, simply import the enhanced test function:

```typescript
import { test } from '@fixtures/user.fixture';
```

That's it! Now your tests automatically get a ready-to-use test user.

### What's Available

Currently, we have these helpful fixtures:

| Fixture          | What It Provides          | What It Does                                                     |
| ---------------- | ------------------------- | ---------------------------------------------------------------- |
| **User Fixture** | Ready-to-use test account | Gets a test user, provides it to your test, returns it when done |

---

## Available Fixtures

### 👤 **User Fixture** (`user.fixture.ts`)

Automatic test user management for login and user-related tests

**What it provides:**

- A `user` object with email, password, and other account details
- Automatic user allocation from a pool of test accounts
- Automatic user cleanup and return to the pool

**When you need it:**

- Testing login functionality
- Testing user-specific features
- Any test that needs a user account

**What it does automatically:**

1. **Gets a user** - Picks an available test user from the pool
2. **Provides the user** - Makes it available in your test as `user`
3. **Tracks usage** - Logs which worker and test is using the user
4. **Cleans up** - Returns the user to the pool when test finishes
5. **Handles errors** - Ensures cleanup even if test fails

**Example:**

```typescript
import { test } from '@fixtures/user.fixture';

test('User login test', async ({ page, user }) => {
  // user is automatically provided - no setup needed!
  await page.goto('/login');
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('#login-button');

  // Expect successful login
  await expect(page.locator('#welcome')).toBeVisible();

  // No cleanup needed - happens automatically!
});
```

---

## How to Use Fixtures

### Basic Usage

```typescript
import { test } from '@fixtures/user.fixture';

test('My test', async ({ page, user }) => {
  // user is ready to use immediately
  console.log(`Testing with user: ${user.email}`);

  // Use the user in your test
  await page.goto('/login');
  await page.fill('#email', user.email);
});
```

### Multiple Tests

```typescript
import { test } from '@fixtures/user.fixture';

test.describe('User Profile Tests', () => {
  test('User can view profile', async ({ page, user }) => {
    // Each test gets its own user automatically
    await page.goto('/login');
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.click('#login-button');

    await page.goto('/profile');
    await expect(page.locator('#user-email')).toHaveText(user.email);
  });

  test('User can edit profile', async ({ page, user }) => {
    // This test gets a different user - no conflicts!
    await page.goto('/login');
    await page.fill('#email', user.email);
    // ... rest of test
  });
});
```

### Accessing User Properties

```typescript
import { test } from '@fixtures/user.fixture';

test('Check user properties', async ({ page, user }) => {
  console.log('User email:', user.email);
  console.log('User password:', user.password);
  console.log('Should login succeed?', user.loginSuccess);
  console.log('Test description:', user.description);

  // Use any property you need
  if (user.loginSuccess) {
    // Test successful login
  } else {
    // Test failed login
  }
});
```

---

## Creating New Fixtures

### Step 1: Identify What You Need

Ask yourself:

- What do my tests need that requires setup and cleanup?
- Do multiple tests need the same type of resource?
- Would automatic management make testing easier?

**Common examples:**

- Database connections
- API authentication tokens
- Test data files
- Browser configurations

### Step 2: Create the Fixture File

Create a new file in `src/fixtures/` following this pattern:

```typescript
import { test as base } from '@playwright/test';

/**
 * Extended test with [your resource] management.
 * @description Provides automatic [resource] setup and cleanup
 * @example import { test } from '@fixtures/your-fixture';
 */
export const test = base.extend<{ yourResource: YourResourceType }>({
  /**
   * Your resource fixture.
   * @param use - Playwright's fixture use function
   * @param testInfo - Test execution information
   */
  yourResource: async ({}, use, testInfo) => {
    let resource = null;

    try {
      // Setup: Create or get your resource
      resource = await setupYourResource();

      // Provide it to the test
      await use(resource);
    } finally {
      // Cleanup: Always clean up, even if test fails
      if (resource) {
        await cleanupYourResource(resource);
      }
    }
  },
});
```

### Step 3: Add Documentation

```typescript
/**
 * @fileoverview [Your fixture name] for automated [resource] management
 * @description Provides automatic [resource] allocation and cleanup
 * @example import { test } from '@fixtures/your-fixture';
 */
```

### Step 4: Test Your Fixture

```typescript
import { test } from '@fixtures/your-fixture';

test('Test your fixture', async ({ page, yourResource }) => {
  // Use your resource
  console.log('Got resource:', yourResource);
});
```

---

## Common Examples

### Login Tests

```typescript
import { test } from '@fixtures/user.fixture';

test('Successful login', async ({ page, user }) => {
  await page.goto('/login');
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('#login-button');

  await expect(page.locator('#dashboard')).toBeVisible();
});

test('Failed login with wrong password', async ({ page, user }) => {
  await page.goto('/login');
  await page.fill('#email', user.email);
  await page.fill('#password', 'wrong-password');
  await page.click('#login-button');

  await expect(page.locator('#error-message')).toBeVisible();
});
```

### User Profile Tests

```typescript
import { test } from '@fixtures/user.fixture';

test('User can update their name', async ({ page, user }) => {
  // Login with provided user
  await page.goto('/login');
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('#login-button');

  // Go to profile and update name
  await page.goto('/profile');
  await page.fill('#name', 'Updated Name');
  await page.click('#save-button');

  await expect(page.locator('#success-message')).toBeVisible();
});
```

### Parallel Test Execution

```typescript
import { test } from '@fixtures/user.fixture';

// All these tests can run at the same time
// Each gets its own user - no conflicts!

test('Test 1', async ({ page, user }) => {
  console.log(`Test 1 using user: ${user.email}`);
  // ... test logic
});

test('Test 2', async ({ page, user }) => {
  console.log(`Test 2 using user: ${user.email}`);
  // ... test logic
});

test('Test 3', async ({ page, user }) => {
  console.log(`Test 3 using user: ${user.email}`);
  // ... test logic
});
```

---

## Best Practices

### ✅ Do's

- **Always import from `@fixtures`** - Use the enhanced test function
- **Trust the fixtures** - Don't try to do manual cleanup
- **Use descriptive test names** - Make it clear what you're testing
- **Focus on your test logic** - Let fixtures handle setup and cleanup
- **Check fixture properties** - Use `user.loginSuccess` to know what to expect

### ❌ Don'ts

- **Don't do manual user management** - Let fixtures handle it
- **Don't worry about cleanup** - Fixtures handle it automatically
- **Don't share users between tests** - Each test gets its own
- **Don't modify fixture code** - unless you're adding new fixtures

### 💡 Fixture Guidelines

```typescript
// ✅ Good - Let fixtures do their job
import { test } from '@fixtures/user.fixture';

test('Login test', async ({ page, user }) => {
  // Use the provided user
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);

  // Test your functionality
  await page.click('#login-button');
  await expect(page.locator('#welcome')).toBeVisible();

  // No cleanup needed!
});

// ❌ Avoid - Manual management defeats the purpose
import { test } from '@playwright/test';

test('Login test', async ({ page }) => {
  const user = await createUser(); // Manual setup
  await page.fill('#email', user.email);

  await page.click('#login-button');
  await expect(page.locator('#welcome')).toBeVisible();

  await deleteUser(user); // Manual cleanup
});
```

### 🔄 Understanding User Pool

The user fixture manages a pool of test users:

- **Pool of users** - Multiple test accounts available
- **One user per test** - Each test gets exclusive access
- **Automatic return** - Users go back to pool when test finishes
- **Parallel safe** - Multiple tests can run simultaneously
- **No conflicts** - Tests never interfere with each other

---

## Quick Reference

### How to Use Fixtures

| What You Want     | Import This                                     | Get This                   |
| ----------------- | ----------------------------------------------- | -------------------------- |
| Test user account | `import { test } from '@fixtures/user.fixture'` | `user` object in your test |

### User Object Properties

| Property            | What It Contains          | Example                     |
| ------------------- | ------------------------- | --------------------------- |
| `user.email`        | Test user's email address | `'test_user_1@example.com'` |
| `user.password`     | Test user's password      | `'TestPassword123!'`        |
| `user.loginSuccess` | Whether login should work | `true` or `false`           |
| `user.description`  | What this user is for     | `'Valid test user'`         |

### Getting Help

- **Need a test user?** → Use `@fixtures/user.fixture`
- **Want to create new fixtures?** → Follow the "Creating New Fixtures" section
- **Having issues?** → Check the console logs for user allocation messages

---

**Remember:** Fixtures are like helpful assistants that handle the boring setup and cleanup work, so you can focus on writing great tests!
