# Test Data Guide

_Author: Anand Sogalad_

This guide explains how to work with test data in our automation framework. Whether you're a developer, QA engineer, or new contributor, this will help you understand and use test data effectively.

## Table of Contents

- [What is Test Data?](#what-is-test-data)
- [Getting Started](#getting-started)
- [Available Test Data](#available-test-data)
- [How to Use Test Data](#how-to-use-test-data)
- [Adding New Test Data](#adding-new-test-data)
- [Common Scenarios](#common-scenarios)
- [Best Practices](#best-practices)

---

## What is Test Data?

Test data is pre-defined information used to test different scenarios in our application. Think of it as a collection of usernames, passwords, and other inputs that help us verify if our login system works correctly.

**Why do we need it?**

- Ensures consistent testing across the team
- Saves time by not creating test data repeatedly
- Covers various scenarios (valid logins, invalid passwords, security attacks, etc.)

**Location:** All test data lives in `src/data/`

---

## Getting Started

### Quick Start

To use any test data in your tests, simply import it:

```typescript
import { ushurTestLoginCredentials } from '@data';
```

That's it! No need to worry about file paths or complex imports.

### What's Available

Currently, we have:

- **Login credentials** - Various username/password combinations for testing

---

## Available Test Data

### Login Test Data (`ushurTestLoginCredentials`)

This contains different types of login scenarios:

#### ✅ Valid Scenarios

- Working username and password combinations
- Use when testing successful logins

#### ❌ Invalid Scenarios

- **Bad email formats**: Missing @, wrong domains
- **Weak passwords**: Too short, missing symbols
- **Empty fields**: Blank username or password
- **Security tests**: SQL injection attempts, XSS attacks
- **Edge cases**: Spaces, special characters

Each test case includes:

- `email` - The username to test with
- `password` - The password to test with
- `description` - What this test case is for
- `loginSuccess` - Whether this should work (true/false)

---

## How to Use Test Data

### Basic Usage

```typescript
import { ushurTestLoginCredentials } from '@data';

// Use all test data
ushurTestLoginCredentials.forEach((credential) => {
  console.log(credential.email, credential.password);
});
```

### Filter for Specific Scenarios

```typescript
// Get only valid credentials
const validLogins = ushurTestLoginCredentials.filter((cred) => cred.loginSuccess === true);

// Get only invalid email tests
const emailTests = ushurTestLoginCredentials.filter(
  (cred) => cred.description.includes('email') && cred.loginSuccess === false
);

// Get security test cases
const securityTests = ushurTestLoginCredentials.filter(
  (cred) => cred.description.includes('injection') || cred.description.includes('XSS')
);
```

### In Test Files

```typescript
import { ushurTestLoginCredentials } from '@data';

describe('Login Tests', () => {
  ushurTestLoginCredentials.forEach((credential) => {
    test(`Should handle: ${credential.description}`, async () => {
      // Your test logic here using credential.email and credential.password
    });
  });
});
```

---

## Adding New Test Data

### Step 1: Identify the Scenario

Before adding new test data, ask:

- What am I trying to test?
- Is this scenario already covered?
- Will other team members benefit from this?

### Step 2: Add to the Right File

- **Login scenarios** → Add to `ushurLoginTestData.ts`
- **New types of test data** → Create a new file and update `index.ts`

### Step 3: Follow the Pattern

```typescript
{
  email: 'your_test_email@example.com',
  password: 'YourTestPassword',
  description: 'Clear description of what this tests',
  loginSuccess: true, // or false
}
```

### Step 4: Test Your Addition

- Run existing tests to ensure nothing breaks
- Add the new data to appropriate test files

---

## Common Scenarios

### Testing Valid Logins

```typescript
const validCredentials = ushurTestLoginCredentials.filter((cred) => cred.loginSuccess);
// Use validCredentials[0] for a working login
```

### Testing Password Validation

```typescript
const passwordTests = ushurTestLoginCredentials.filter(
  (cred) => cred.description.includes('password') && !cred.loginSuccess
);
```

### Testing Email Validation

```typescript
const emailTests = ushurTestLoginCredentials.filter((cred) => cred.description.includes('email') && !cred.loginSuccess);
```

### Security Testing

```typescript
const securityTests = ushurTestLoginCredentials.filter(
  (cred) => cred.description.includes('injection') || cred.description.includes('XSS')
);
```

---

## Best Practices

### ✅ Do's

- **Always import from `@data`** - Don't import from individual files
- **Use descriptive names** - Make it clear what each test case does
- **Include both positive and negative cases** - Test what should work AND what shouldn't
- **Add comments** - Help others understand your test scenarios
- **Keep credentials realistic** - Use formats that match real-world scenarios

### ❌ Don'ts

- **Don't use real credentials** - Always use dummy/test accounts
- **Don't duplicate existing scenarios** - Check what's already available first
- **Don't make it too complex** - Keep test data simple and focused
- **Don't forget to update tests** - When you add data, use it in actual tests

### 🔒 Security Notes

- All test credentials are dummy data
- Never commit real passwords or sensitive information
- Use realistic but fake email addresses (like `@example.com`)

---

**Remember**: Good test data makes testing easier for everyone. When in doubt, ask a team member or look at existing examples!
