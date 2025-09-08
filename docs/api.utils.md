# API Utilities Guide

This guide explains how to work with API utilities in our automation framework. Whether you're new to API testing or an experienced developer, this will help you understand and use our API tools effectively.

_Author: Anand Sogalad_

## Table of Contents

- [What Are API Utilities?](#what-are-api-utilities)
- [Why Do We Use API Utilities?](#why-do-we-use-api-utilities)
- [Getting Started](#getting-started)
- [Available Tools](#available-tools)
- [How to Use API Utilities](#how-to-use-api-utilities)
- [Creating API Tests](#creating-api-tests)
- [Common Examples](#common-examples)
- [Best Practices](#best-practices)

---

## What Are API Utilities?

API utilities are helper tools that make it easier to test websites and web services. Think of them as translators that help your tests talk to websites and handle any problems that might occur.

**Simple analogy:**
When you use a food delivery app, you don't directly call the restaurant. The app handles the communication, deals with busy signals or wrong numbers, and gives you clear updates. API utilities work the same way - they handle the technical communication with websites so your tests don't have to.

**Example:**

```typescript
// Without API utilities - lots of manual work and error handling:
test('Get user data', async ({ request }) => {
  try {
    const response = await request.get('/api/users/123');
    if (!response.ok()) {
      if (response.status() === 404) {
        throw new Error('User not found');
      } else if (response.status() === 500) {
        throw new Error('Server error');
      }
      // ... handle many more error cases
    }
    const userData = await response.json();
  } catch (error) {
    // Handle network errors too
    console.error('Request failed:', error);
  }
});

// With API utilities - simple and automatic:
test('Get user data', async ({ request }) => {
  const apiClient = new ApiClient(request);
  const response = await apiClient.get('/api/users/123'); // ✅ Errors handled automatically
  const userData = await response.json();
}); // ✅ Clear error messages if something goes wrong
```

**Location:** All API utilities are stored in `src/utils/api/`

---

## Why Do We Use API Utilities?

API utilities act like helpful assistants that make testing websites easier:

- **Automatic error handling** - Converts confusing error codes into clear messages
- **Consistent behavior** - All API calls work the same way across tests
- **Less repetitive code** - No need to write error handling over and over
- **Better error messages** - Know exactly what went wrong and where
- **Reliable testing** - Handles network problems and server issues gracefully

**Real problem they solve:**

```typescript
// Without utilities - confusing and inconsistent:
test('Login user', async ({ request }) => {
  const response = await request.post('/api/login', { data: loginData });
  if (response.status() === 400) {
    console.log('Bad request, but what exactly?'); // ❌ Unclear
  } else if (response.status() === 401) {
    console.log('Unauthorized, but why?'); // ❌ Vague
  }
  // ... more confusing error codes
});

// With utilities - clear and helpful:
test('Login user', async ({ request }) => {
  const apiClient = new ApiClient(request);
  try {
    const response = await apiClient.post('/api/login', { data: loginData });
    // Success! Continue with test
  } catch (error) {
    // ✅ Clear error: "POST request failed: /api/login - Invalid API request (Status: 400)"
    console.log(error.message); // ✅ Tells you exactly what happened
  }
});
```

---

## Getting Started

### Quick Start

To use API utilities, simply import and create an API client:

```typescript
import { ApiClient } from '@utils/api';

test('My API test', async ({ request }) => {
  const apiClient = new ApiClient(request);
  const response = await apiClient.get('/api/data');
});
```

That's it! Now you have automatic error handling and consistent behavior.

### What's Available

Currently, we have these helpful tools:

| Tool          | What It Does                                                      | When You Need It                               |
| ------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| **ApiClient** | Handles all types of web requests with automatic error management | Any time you need to test APIs or web services |

---

## Available Tools

### 🌐 **ApiClient** (`api.client.ts`)

Complete HTTP client with automatic error handling and logging

**What it provides:**

- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, FETCH)
- Automatic error detection and clear error messages
- Network problem handling
- Request logging and debugging
- Storage state management

**HTTP Methods Supported:**

| Method   | What It's For             | Common Use Cases                             |
| -------- | ------------------------- | -------------------------------------------- |
| `GET`    | Getting data              | Retrieving user info, fetching lists         |
| `POST`   | Creating data             | User registration, creating records          |
| `PUT`    | Updating entire records   | Replacing user profile, updating settings    |
| `DELETE` | Removing data             | Deleting users, removing records             |
| `PATCH`  | Updating parts of records | Changing email, updating specific fields     |
| `HEAD`   | Getting metadata only     | Checking if resource exists, getting headers |
| `FETCH`  | General purpose           | Custom requests, complex scenarios           |

**Error Handling:**

- **400 Bad Request** → "Invalid API request"
- **401 Unauthorized** → "Unauthorized API access"
- **403 Forbidden** → "Forbidden API operation"
- **404 Not Found** → "API resource not found"
- **405 Method Not Allowed** → "HTTP method not allowed"
- **500 Server Error** → "API returned internal server error"
- **Network Issues** → "Network error: [details]"

**Example:**

```typescript
import { ApiClient } from '@utils/api';

test('User API test', async ({ request }) => {
  const apiClient = new ApiClient(request);

  // Create a new user
  const createResponse = await apiClient.post('/api/users', {
    data: { name: 'John', email: 'john@example.com' },
  });

  // Get the created user
  const getResponse = await apiClient.get('/api/users/123');
  const userData = await getResponse.json();

  // Update user email
  const updateResponse = await apiClient.patch('/api/users/123', {
    data: { email: 'newemail@example.com' },
  });

  // Delete the user
  await apiClient.delete('/api/users/123');
});
```

---

## How to Use API Utilities

### Basic Setup

```typescript
import { ApiClient } from '@utils/api';

test('API test', async ({ request }) => {
  // Create the client
  const apiClient = new ApiClient(request);

  // Use it for requests
  const response = await apiClient.get('/api/endpoint');
});
```

### Making Different Types of Requests

```typescript
import { ApiClient } from '@utils/api';

test('All HTTP methods', async ({ request }) => {
  const apiClient = new ApiClient(request);

  // Get data
  const users = await apiClient.get('/api/users');

  // Create new data
  const newUser = await apiClient.post('/api/users', {
    data: { name: 'Alice', email: 'alice@example.com' },
  });

  // Update entire record
  const updatedUser = await apiClient.put('/api/users/123', {
    data: { name: 'Alice Smith', email: 'alice.smith@example.com' },
  });

  // Update part of record
  const patchedUser = await apiClient.patch('/api/users/123', {
    data: { email: 'new.email@example.com' },
  });

  // Delete data
  await apiClient.delete('/api/users/123');

  // Check if resource exists (headers only)
  const headResponse = await apiClient.head('/api/users/123');
  console.log('Content-Type:', headResponse.headers()['content-type']);
});
```

### Working with Response Data

```typescript
import { ApiClient } from '@utils/api';

test('Handle response data', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.get('/api/users');

  // Get response details
  console.log('Status:', response.status());
  console.log('Headers:', response.headers());

  // Get data in different formats
  const jsonData = await response.json(); // For JSON responses
  const textData = await response.text(); // For text responses
  const buffer = await response.body(); // For binary data

  // Use the data in your test
  expect(jsonData.users).toHaveLength(5);
  expect(response.status()).toBe(200);
});
```

### Error Handling

```typescript
import { ApiClient } from '@utils/api';

test('Handle errors gracefully', async ({ request }) => {
  const apiClient = new ApiClient(request);

  try {
    const response = await apiClient.get('/api/nonexistent');
    // This won't run if the endpoint doesn't exist
  } catch (error) {
    // Automatic error with clear message
    console.log(error.message); // "GET request failed: /api/nonexistent - API resource not found (Status: 404)"

    // You can check specific error types
    if (error.message.includes('not found')) {
      console.log('Resource does not exist');
    }
  }
});
```

---

## Creating API Tests

### Step 1: Plan Your Test

Ask yourself:

- What API endpoint am I testing?
- What data do I need to send?
- What response do I expect?
- What could go wrong?

### Step 2: Set Up the Test

```typescript
import { test, expect } from '@playwright/test';
import { ApiClient } from '@utils/api';

test('User registration API', async ({ request }) => {
  const apiClient = new ApiClient(request);

  // Your test logic here
});
```

### Step 3: Write Your Test Logic

```typescript
test('User can register successfully', async ({ request }) => {
  const apiClient = new ApiClient(request);

  // Prepare test data
  const userData = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'SecurePassword123!',
  };

  // Make the API call
  const response = await apiClient.post('/api/register', {
    data: userData,
  });

  // Verify the response
  expect(response.status()).toBe(201); // Created

  const responseData = await response.json();
  expect(responseData.user.email).toBe(userData.email);
  expect(responseData.user.id).toBeDefined();
});
```

### Step 4: Test Error Cases

```typescript
test('Registration fails with invalid email', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const invalidData = {
    name: 'Test User',
    email: 'not-an-email', // Invalid email
    password: 'SecurePassword123!',
  };

  // Expect this to fail
  try {
    await apiClient.post('/api/register', { data: invalidData });
    // If we get here, the test should fail
    expect(false).toBe(true); // Force failure
  } catch (error) {
    // This is expected - verify it's the right error
    expect(error.message).toContain('Invalid API request');
  }
});
```

---

## Common Examples

### User Authentication Flow

```typescript
import { ApiClient } from '@utils/api';

test('Complete user auth flow', async ({ request }) => {
  const apiClient = new ApiClient(request);

  // 1. Register new user
  const registerResponse = await apiClient.post('/api/register', {
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'MyPassword123!',
    },
  });

  const userData = await registerResponse.json();
  expect(userData.user.email).toBe('test@example.com');

  // 2. Login with new user
  const loginResponse = await apiClient.post('/api/login', {
    data: {
      email: 'test@example.com',
      password: 'MyPassword123!',
    },
  });

  const loginData = await loginResponse.json();
  expect(loginData.token).toBeDefined();

  // 3. Access protected resource
  const profileResponse = await apiClient.get('/api/profile', {
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  });

  const profile = await profileResponse.json();
  expect(profile.email).toBe('test@example.com');
});
```

### CRUD Operations Testing

```typescript
import { ApiClient } from '@utils/api';

test('Complete CRUD operations', async ({ request }) => {
  const apiClient = new ApiClient(request);
  let userId: string;

  // CREATE - Add new user
  const createResponse = await apiClient.post('/api/users', {
    data: { name: 'John Doe', email: 'john@example.com' },
  });

  const createdUser = await createResponse.json();
  userId = createdUser.id;
  expect(createdUser.name).toBe('John Doe');

  // READ - Get the user
  const readResponse = await apiClient.get(`/api/users/${userId}`);
  const userData = await readResponse.json();
  expect(userData.email).toBe('john@example.com');

  // UPDATE - Modify user
  const updateResponse = await apiClient.put(`/api/users/${userId}`, {
    data: { name: 'John Smith', email: 'johnsmith@example.com' },
  });

  const updatedUser = await updateResponse.json();
  expect(updatedUser.name).toBe('John Smith');

  // DELETE - Remove user
  const deleteResponse = await apiClient.delete(`/api/users/${userId}`);
  expect(deleteResponse.status()).toBe(204); // No Content

  // Verify deletion
  try {
    await apiClient.get(`/api/users/${userId}`);
    expect(false).toBe(true); // Should not reach here
  } catch (error) {
    expect(error.message).toContain('not found');
  }
});
```

### File Upload Testing

```typescript
import { ApiClient } from '@utils/api';

test('File upload via API', async ({ request }) => {
  const apiClient = new ApiClient(request);

  // Create form data for file upload
  const formData = new FormData();
  formData.append('file', new Blob(['test content'], { type: 'text/plain' }), 'test.txt');
  formData.append('description', 'Test file upload');

  const response = await apiClient.post('/api/upload', {
    multipart: formData,
  });

  const result = await response.json();
  expect(result.filename).toBe('test.txt');
  expect(result.size).toBeGreaterThan(0);
});
```

---

## Best Practices

### ✅ Do's

- **Always use ApiClient** - Don't make raw API calls
- **Handle both success and error cases** - Test what should work AND what shouldn't
- **Use meaningful test data** - Make it easy to understand what you're testing
- **Clean up after tests** - Delete created data when possible
- **Check response status codes** - Verify you got the expected response
- **Test authentication** - Include both authenticated and unauthenticated scenarios

### ❌ Don'ts

- **Don't ignore errors** - Always handle potential failures
- **Don't use real user data** - Use fake data that won't affect real users
- **Don't test production APIs** - Use test environments only
- **Don't forget cleanup** - Remove test data to avoid interference
- **Don't hardcode URLs** - Use configuration for different environments

### 💡 API Testing Guidelines

```typescript
// ✅ Good - Complete test with error handling
import { ApiClient } from '@utils/api';

test('User creation with validation', async ({ request }) => {
  const apiClient = new ApiClient(request);

  // Test successful creation
  const validUser = {
    name: 'Valid User',
    email: 'valid@example.com',
    password: 'SecurePass123!',
  };

  const response = await apiClient.post('/api/users', { data: validUser });
  expect(response.status()).toBe(201);

  const userData = await response.json();
  expect(userData.email).toBe(validUser.email);

  // Test validation error
  try {
    await apiClient.post('/api/users', {
      data: { name: '', email: 'invalid', password: '123' },
    });
    expect(false).toBe(true); // Should not reach here
  } catch (error) {
    expect(error.message).toContain('Invalid API request');
  }

  // Cleanup
  if (userData.id) {
    await apiClient.delete(`/api/users/${userData.id}`);
  }
});

// ❌ Avoid - No error handling, no cleanup
test('User creation', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'User', email: 'user@example.com' },
  });

  expect(response.status()).toBe(201);
  // Missing: error cases, cleanup, response validation
});
```

### 🔄 Environment Configuration

```typescript
// Use environment-specific URLs
const baseURL = process.env.API_BASE_URL || 'https://api-test.example.com';

test('Environment-aware test', async ({ request }) => {
  const apiClient = new ApiClient(request);

  const response = await apiClient.get(`${baseURL}/api/users`);
  // Test logic here
});
```

---

## Quick Reference

### Common API Client Methods

| Method                          | Purpose       | Example                             |
| ------------------------------- | ------------- | ----------------------------------- |
| `apiClient.get(url)`            | Retrieve data | Getting user list, fetching details |
| `apiClient.post(url, options)`  | Create data   | User registration, creating records |
| `apiClient.put(url, options)`   | Replace data  | Updating entire user profile        |
| `apiClient.patch(url, options)` | Update data   | Changing specific fields            |
| `apiClient.delete(url)`         | Remove data   | Deleting users, removing records    |

### Response Methods

| Method               | What It Returns   | When to Use                   |
| -------------------- | ----------------- | ----------------------------- |
| `response.json()`    | JavaScript object | For JSON APIs (most common)   |
| `response.text()`    | String content    | For text responses            |
| `response.status()`  | HTTP status code  | Checking if request succeeded |
| `response.headers()` | Response headers  | Getting metadata              |

### Getting Help

- **Need to test an API?** → Use `ApiClient` from `@utils/api`
- **Getting confusing errors?** → Check the error message - it tells you exactly what went wrong
- **Want to see examples?** → Look in the "Common Examples" section above

---

**Remember:** API utilities handle the complicated stuff so you can focus on testing your application's behavior. When in doubt, let the utilities do the heavy lifting!
