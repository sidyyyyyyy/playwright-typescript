# Interfaces Guide

_Author: Anand Sogalad_

This guide explains how to work with interfaces in our automation framework. Whether you're new to programming or an experienced developer, this will help you understand and contribute effectively.

## Table of Contents

- [What Are Interfaces?](#what-are-interfaces)
- [Why Do We Use Interfaces?](#why-do-we-use-interfaces)
- [Getting Started](#getting-started)
- [Available Interfaces](#available-interfaces)
- [How to Use Interfaces](#how-to-use-interfaces)
- [Adding New Data Structures](#adding-new-data-structures)
- [Common Examples](#common-examples)
- [Best Practices](#best-practices)

---

## What Are Interfaces?

Interfaces are like templates that define what information should look like. Think of them as forms with specific fields that must be filled out correctly.

**Simple analogy:**
When you fill out a contact form on a website, it expects your "Name" (text), "Phone" (numbers), and "Email" (email format). An interface works the same way - it tells the computer exactly what information to expect and in what format.

**Example:**

```typescript
// Without a template - easy to forget important information:
const user = { name: 'John', age: 25 }; // ❌ Where's the email?

// With an interface template - nothing gets forgotten:
interface User {
  name: string; // Required: person's name
  age: number; // Required: person's age
  email: string; // Required: contact email
}

const user: User = {
  name: 'John',
  age: 25,
  email: 'john@example.com',
}; // ✅ Complete and correct
```

**Location:** All interfaces are stored in `src/core/interfaces/`

---

## Why Do We Use Interfaces?

Interfaces act like helpful assistants that keep us organized:

- **Nothing gets forgotten** - Ensures all required information is included
- **Catches typos immediately** - Computer warns you if something's wrong
- **Self-explanatory** - Anyone can understand what data is needed
- **Helpful suggestions** - Your editor shows you what options are available

**Real problem they solve:**

```typescript
// Without a template - easy to make mistakes:
const loginInfo = {
  username: 'john@example.com', // ❌ Wrong field name
  pass: 'secret123', // ❌ Missing letters
};

// With an interface template - mistakes become impossible:
interface LoginRequest {
  email: string; // ← Must be called 'email'
  password: string; // ← Must be called 'password'
  forceLogin: boolean; // ← Required: true or false
}

const loginInfo: LoginRequest = {
  email: 'john@example.com', // ✅ Correct name
  password: 'secret123', // ✅ Correct name
  forceLogin: false, // ✅ Nothing forgotten
}; // ✅ Computer checks everything is right
```

---

## Getting Started

### Quick Start

To use any interface templates, simply import them:

```typescript
import type { UserCredential, ApiResponse } from '@core/interfaces';
```

That's all you need! No complex file paths to remember.

### What's Available

We organize our interface templates by what they're used for:

| Category   | Purpose           | What You Can Create             |
| ---------- | ----------------- | ------------------------------- |
| **API**    | Web communication | Login forms, server responses   |
| **Data**   | Test information  | User accounts, test details     |
| **UI**     | Website elements  | Buttons, menus, forms           |
| **Config** | Settings          | Jira connections, notifications |
| **Redis**  | Data storage      | User sessions, cached data      |

---

## Available Interfaces

### 🌐 **Web Communication** (`api.types.ts`)

Templates for talking to websites and servers

| Template Name   | What It Creates        | When You Need It          |
| --------------- | ---------------------- | ------------------------- |
| `LoginRequest`  | Login form information | When users sign in        |
| `LoginResponse` | Server's response      | After login attempts      |
| `ApiResponse`   | Standard web response  | Any website communication |

**Example:**

```typescript
const loginData: LoginRequest = {
  email: 'user@example.com',
  password: 'myPassword123',
  forceLogin: false,
};
```

### 📊 **Test Information** (`data.types.ts`)

Templates for test data and user accounts

| Template Name    | What It Creates      | When You Need It                |
| ---------------- | -------------------- | ------------------------------- |
| `UserCredential` | Test user accounts   | Creating fake users for testing |
| `TestMetadata`   | Test case details    | Documenting what tests do       |
| `TestDataConfig` | Data source settings | Connecting to data sources      |

**Example:**

```typescript
const testUser: UserCredential = {
  email: 'test@example.com',
  password: 'Test123!',
  description: 'Sample test user',
  loginSuccess: true,
};
```

### 🎯 **Website Elements** (`ui.types.ts`)

Templates for buttons, menus, and page elements

| Template Name    | What It Creates    | When You Need It          |
| ---------------- | ------------------ | ------------------------- |
| `NavigationItem` | Menu links         | Creating navigation tests |
| `ElementLocator` | Button/form finder | Locating page elements    |

**Example:**

```typescript
const loginButton: ElementLocator = {
  selector: '#login-btn',
  type: 'css',
  description: 'Main login button',
  timeout: 5000,
};
```

### ⚙️ **Settings & Connections** (`config.types.ts`)

Templates for connecting to external tools

| Template Name | What It Creates          | When You Need It              |
| ------------- | ------------------------ | ----------------------------- |
| `JiraConfig`  | Jira connection info     | Linking to bug tracking       |
| `SlackConfig` | Slack notification setup | Sending test results to Slack |
| `EmailConfig` | Email settings           | Sending test reports          |

**Example:**

```typescript
const jiraConnection: JiraConfig = {
  url: 'https://company.atlassian.net',
  username: 'test-user',
  password: 'api-token',
  projectKey: 'TEST',
  issueType: 'Bug',
};
```

---

## How to Use Interfaces

### Basic Example

```typescript
import type { UserCredential, LoginRequest } from '@core/interfaces';

// Create a test user using the template
const testUser: UserCredential = {
  email: 'test@example.com',
  password: 'Test123!',
  description: 'Sample test user',
  loginSuccess: true,
};

// Use the user info to create login data
const loginData: LoginRequest = {
  email: testUser.email,
  password: testUser.password,
  forceLogin: false,
};
```

### In Your Tests

```typescript
import type { ApiResponse, LoginResponse } from '@core/interfaces';

test('User login test', async ({ request }) => {
  // Make login request with structured data
  const response: ApiResponse<LoginResponse> = await apiClient.login({
    email: 'test@example.com',
    password: 'Test123!',
    forceLogin: false,
  });

  // Check the response using known structure
  expect(response.data.tokenId).toBeDefined();
  expect(response.data.emailId).toBe('test@example.com');
});
```

---

## Adding New Data Structures

### Step 1: Choose the Right File

Pick the file that matches what you're creating:

- **Web requests** → `api.types.ts`
- **Test data** → `data.types.ts`
- **Page elements** → `ui.types.ts`
- **Settings** → `config.types.ts`
- **Something completely new** → Create a new file

### Step 2: Create Your Template

```typescript
// Example: Template for test results
export interface TestResult {
  testId: string; // Required: test identifier
  status: 'passed' | 'failed' | 'skipped'; // Required: what happened
  duration: number; // Required: how long it took
  errorMessage?: string; // Optional: error details
  screenshots?: string[]; // Optional: image files
}
```

### Step 3: Add a Description

```typescript
/**
 * Template for test execution results.
 * @description Contains all information about how a test performed
 * @example const result: TestResult = { testId: 'TC001', status: 'passed', duration: 1500 };
 */
export interface TestResult {
  // ... your template fields
}
```

### Step 4: Make It Available

Add your new template to `types.ts` so others can use it:

```typescript
export * from './your-new-file.types';
```

---

## Common Examples

### Creating Test Users

```typescript
import type { UserCredential } from '@core/interfaces';

// Create a working test user
const workingUser: UserCredential = {
  email: 'good@example.com',
  password: 'GoodPass123!',
  description: 'User that should work',
  loginSuccess: true,
};

// Create a broken test user
const brokenUser: UserCredential = {
  email: 'bad@example.com',
  password: 'wrong',
  description: 'User that should fail',
  loginSuccess: false,
};
```

### Testing Website Communication

```typescript
import type { LoginRequest, ApiResponse, LoginResponse } from '@core/interfaces';

// Prepare login information
const loginInfo: LoginRequest = {
  email: 'user@example.com',
  password: 'password123',
  forceLogin: true,
};

// Send login and check response
const response: ApiResponse<LoginResponse> = await apiClient.post('/login', loginInfo);
if (response.status === 200) {
  console.log(`Login worked for ${response.data.emailId}`);
}
```

### Finding Page Elements

```typescript
import type { ElementLocator } from '@core/interfaces';

// Define how to find the search box
const searchBox: ElementLocator = {
  selector: 'input[data-testid="search"]',
  type: 'css',
  description: 'Main search box',
  timeout: 3000,
  waitForState: 'visible',
};
```

---

## Best Practices

### ✅ Do's

- **Always import from `@core/interfaces`** - One simple import for everything
- **Use clear names** - Make it obvious what the template is for
- **Add helpful comments** - Explain what each field does
- **Mark optional fields** - Use `?` for fields that might be empty
- **Be specific** - Use exact options like `'success' | 'error'` instead of just `string`

### ❌ Don'ts

- **Don't use `any`** - Be specific about what type of data you expect
- **Don't make templates too complex** - Keep them simple and focused
- **Don't forget documentation** - Always explain what your template does

### 💡 Simple Guidelines

```typescript
// ✅ Good - Clear and well-explained
/**
 * Template for user login information.
 * @description Everything needed for a user to sign in
 */
interface LoginInfo {
  email: string; // Required: user's email
  password: string; // Required: user's password
  rememberMe?: boolean; // Optional: stay logged in
  loginType: 'standard' | 'google'; // Required: how they log in
}

// ❌ Avoid - Unclear and vague
interface UserStuff {
  data: any; // What kind of data?
  info: string; // What information?
}
```

---

## Quick Reference

### Most Common Templates

| What You Need | Use This Template | Example Use               |
| ------------- | ----------------- | ------------------------- |
| User accounts | `UserCredential`  | Creating test users       |
| Web responses | `ApiResponse<T>`  | Handling server replies   |
| Page elements | `ElementLocator`  | Finding buttons and forms |
| Login data    | `LoginRequest`    | User sign-in information  |

### Getting Help

- **Can't find what you need?** → Check this documentation
- **Want to create new templates?** → Follow the "Adding New Data Structures" section
- **Need to see examples?** → Look in `src/core/interfaces/`

---

**Remember:** Interface templates are like forms that ensure your data is complete and correct. They help prevent mistakes and make your code more reliable!
