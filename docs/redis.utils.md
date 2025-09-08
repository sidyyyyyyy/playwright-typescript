# Redis Utilities Guide

_Author: Anand Sogalad_

## 📖 Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Redis Client](#redis-client)
5. [User Pool Management](#user-pool-management)
6. [Configuration](#configuration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Examples](#examples)

## 🌟 Overview

The Redis Utilities provide powerful data management and user pool capabilities for our test automation framework. Think of Redis as a super-fast, shared notebook that all your tests can read from and write to simultaneously.

### What Are Redis Utilities?

Redis utilities are specialized tools that:

- **Store and retrieve data**: Keep test data accessible across multiple test runs
- **Manage user pools**: Automatically handle test user allocation for parallel testing
- **Ensure test isolation**: Prevent tests from interfering with each other
- **Provide fast access**: Deliver lightning-fast data operations

### Why Use Redis?

**Simple analogy:**
Imagine you have 100 tests running at the same time, and each needs a unique test user account. Without Redis, tests might try to use the same user and conflict with each other. Redis acts like a smart librarian who hands out books (users) to students (tests) and makes sure no two students get the same book at the same time.

**Location:** All Redis utilities are in `src/utils/redis/`

---

## 🚀 Getting Started

### Quick Start

To use Redis utilities, simply import what you need:

```typescript
import { redisClient, userPool } from '@utils/redis';
```

That's it! The utilities are ready to use with automatic connection handling.

### What's Available

| Utility         | Purpose         | What It Does                                         |
| --------------- | --------------- | ---------------------------------------------------- |
| **redisClient** | Data operations | Store, retrieve, and manage data in Redis            |
| **userPool**    | User management | Automatically allocate test users for parallel tests |

---

## 🏗️ Architecture

### How It Works

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Test 1        │    │   Test 2        │    │   Test 3        │
│ (needs user)    │    │ (needs user)    │    │ (needs user)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    User Pool (Redis)                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ User 1  │ │ User 2  │ │ User 3  │ │ User 4  │ │ User 5  │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Components

1. **Redis Client**: Handles all Redis operations (connect, store, retrieve)
2. **User Pool**: Manages test user allocation and cleanup
3. **Configuration**: Environment-specific settings for Redis connection

---

## 🔧 Redis Client

### What Is Redis Client?

The Redis Client is your gateway to Redis operations. It handles connections, data storage, and retrieval automatically.

### Basic Operations

#### Storing Data

```typescript
import { redisClient } from '@utils/redis';

// Store a single value
await redisClient.push('shopping-cart', 'laptop');
await redisClient.push('shopping-cart', 'mouse');

// Store multiple values at once
await redisClient.pushMultiple('products', ['laptop', 'mouse', 'keyboard']);
```

#### Retrieving Data

```typescript
// Get one item
const item = await redisClient.pop('shopping-cart');
console.log(item); // 'laptop'

// Get multiple items
const items = await redisClient.popMultiple('products', 2);
console.log(items); // ['laptop', 'mouse']

// Check how many items are left
const count = await redisClient.getLength('products');
console.log(count); // 1
```

#### Managing Keys

```typescript
// Check if a key exists
const exists = await redisClient.keyExists('shopping-cart');

// Delete a key
await redisClient.destroyKey('old-data');

// Delete multiple keys
await redisClient.destroyKeys(['temp1', 'temp2', 'temp3']);
```

#### Key Expiration

```typescript
// Set a key to expire in 1 hour (3600 seconds)
await redisClient.setTTL('session-data', 3600);

// Check how much time is left
const timeLeft = await redisClient.getTTL('session-data');
console.log(`${timeLeft} seconds remaining`);
```

### Available Methods

| Method                 | Purpose                        | Example                                              |
| ---------------------- | ------------------------------ | ---------------------------------------------------- |
| `push(key, value)`     | Add item to end of list        | `await redisClient.push('list', 'item')`             |
| `pop(key)`             | Remove item from start of list | `const item = await redisClient.pop('list')`         |
| `getLength(key)`       | Count items in list            | `const count = await redisClient.getLength('list')`  |
| `keyExists(key)`       | Check if key exists            | `const exists = await redisClient.keyExists('list')` |
| `destroyKey(key)`      | Delete key and data            | `await redisClient.destroyKey('list')`               |
| `setTTL(key, seconds)` | Set expiration time            | `await redisClient.setTTL('list', 3600)`             |

---

## 👥 User Pool Management

### What Is User Pool?

The User Pool automatically manages test user accounts for your tests. It ensures each test gets its own user and handles cleanup automatically.

### How It Works

1. **Pool Creation**: Creates a pool of test users in Redis
2. **User Allocation**: Gives each test a unique user account
3. **Automatic Return**: Returns users to the pool when tests finish
4. **Smart Cleanup**: Cleans up unused pools intelligently

### Basic Usage

#### Initialize User Pool

```typescript
import { userPool } from '@utils/redis';

// Create pool with 50 users (done once per test run)
await userPool.initializeTestRun(50);
```

#### Using in Tests

```typescript
import { test } from '@fixtures/user.fixture';

test('Login test', async ({ page, user }) => {
  // 'user' is automatically provided by the fixture
  // No setup or cleanup needed!

  await page.goto('/login');
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.click('#login-button');

  // User is automatically returned to pool when test finishes
});
```

#### Manual User Management

```typescript
import { userPool } from '@utils/redis';

// Get a user manually
const user = await userPool.getUser();
console.log(`Using user: ${user.email}`);

// Use the user in your test...

// Return the user when done
await userPool.returnUser(user);
```

#### Pool Statistics

```typescript
// Check pool status
const stats = await userPool.getStats();
console.log(`Available users: ${stats.available}`);
console.log(`Pool key: ${stats.testRunKey}`);
console.log(`Environment: ${stats.baseURL}`);
```

### User Object Structure

```typescript
interface UserCredential {
  email: string; // 'test_admin1@ushurdummy.me'
  password: string; // 'Ushur@123'
  username?: string; // 'test_admin1'
  role?: string; // 'admin'
  permissions?: string[]; // ['read', 'write', 'admin']
  description?: string; // 'Auto-generated test user #1'
  loginSuccess?: boolean; // true
}
```

### Available Methods

| Method                     | Purpose             | Example                                   |
| -------------------------- | ------------------- | ----------------------------------------- |
| `initializeTestRun(count)` | Create user pool    | `await userPool.initializeTestRun(50)`    |
| `getUser()`                | Get available user  | `const user = await userPool.getUser()`   |
| `returnUser(user)`         | Return user to pool | `await userPool.returnUser(user)`         |
| `getStats()`               | Get pool statistics | `const stats = await userPool.getStats()` |
| `cleanupTestRun()`         | Clean up pool       | `await userPool.cleanupTestRun()`         |

---

## ⚙️ Configuration

### Redis Configuration

Redis settings are managed in `src/core/constants/redis.constants.ts`:

```typescript
export const RedisConfig = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: parseInt(process.env.REDIS_PORT || '6379'),
  PASSWORD: process.env.REDIS_PASSWORD || '',
  DB: parseInt(process.env.REDIS_DB || '0'),
  // ... other settings
};
```

### Environment Variables

Set these in your environment:

```bash
# Redis connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0

# Test environment
BASE_URL=https://your-test-environment.com
```

### User Pool Configuration

```typescript
export const UserPoolConfig = {
  INITIAL_SIZE: 200, // Default number of users to create
  MAX_SIZE: 1000, // Maximum pool size
  DEFAULT_TTL: 3600, // Default expiration (1 hour)
};
```

---

## 💡 Best Practices

### ✅ Do's

- **Use the user fixture** - It handles allocation and cleanup automatically
- **Initialize pools once** - Create pools at the start of your test run
- **Let Redis handle connections** - The client manages connections automatically
- **Use meaningful key names** - Make Redis keys descriptive and organized
- **Check pool statistics** - Monitor pool usage to optimize size

### ❌ Don'ts

- **Don't manually manage users** - Let the user pool handle allocation
- **Don't forget to return users** - Always return users to maintain pool size
- **Don't hardcode Redis settings** - Use environment variables
- **Don't create pools per test** - Share pools across test runs
- **Don't ignore cleanup** - Proper cleanup prevents resource leaks

### 🎯 Performance Tips

```typescript
// ✅ Good - Use batch operations
await redisClient.pushMultiple('batch-data', ['item1', 'item2', 'item3']);

// ❌ Avoid - Multiple single operations
await redisClient.push('batch-data', 'item1');
await redisClient.push('batch-data', 'item2');
await redisClient.push('batch-data', 'item3');

// ✅ Good - Set appropriate TTL
await redisClient.setTTL('temporary-data', 3600); // 1 hour

// ✅ Good - Clean up when done
await redisClient.destroyKey('test-data');
```

---

## 🔍 Troubleshooting

### Common Issues

#### Redis Connection Failed

```
Error: Redis connection failed
```

**Solutions:**

1. Check Redis server is running
2. Verify environment variables (HOST, PORT)
3. Check network connectivity
4. Verify authentication credentials

#### Pool Exhausted

```
Pool exhausted, no users available
```

**Solutions:**

1. Increase pool size: `await userPool.initializeTestRun(100)`
2. Check if tests are returning users properly
3. Reduce parallel test workers
4. Monitor pool statistics

#### Key Already Exists

```
Error: Key already exists
```

**Solutions:**

1. Use `keyExists()` to check before creating
2. Use `destroyKey()` to clean up old keys
3. Use unique key names per test run

### Debugging Tips

```typescript
// Check Redis client status
const status = redisClient.getStatus();
console.log('Redis status:', status);

// Monitor pool statistics
const stats = await userPool.getStats();
console.log('Pool stats:', stats);

// Check key existence
const exists = await redisClient.keyExists('your-key');
console.log('Key exists:', exists);
```

---

## 📝 Examples

### Example 1: Simple Data Storage

```typescript
import { redisClient } from '@utils/redis';

test('Store and retrieve test data', async () => {
  // Store test results
  await redisClient.push(
    'test-results',
    JSON.stringify({
      testName: 'login-test',
      status: 'passed',
      duration: 1500,
    })
  );

  // Retrieve results later
  const resultString = await redisClient.pop('test-results');
  const result = JSON.parse(resultString);

  expect(result.status).toBe('passed');
});
```

### Example 2: Parallel Test User Management

```typescript
import { userPool } from '@utils/redis';

// In global setup
export default async function globalSetup() {
  await userPool.initializeTestRun(50);
}

// In your tests
import { test } from '@fixtures/user.fixture';

test.describe('Parallel login tests', () => {
  test('User 1 login', async ({ page, user }) => {
    await page.goto('/login');
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    // Test continues...
  });

  test('User 2 login', async ({ page, user }) => {
    // Gets a different user automatically
    await page.goto('/login');
    await page.fill('#email', user.email);
    // Test continues...
  });
});
```

### Example 3: Session Management

```typescript
import { redisClient } from '@utils/redis';

test('Manage user sessions', async ({ page }) => {
  // Store session data
  const sessionData = {
    userId: '12345',
    token: 'abc123xyz',
    expires: Date.now() + 3600000, // 1 hour
  };

  await redisClient.push('user-sessions', JSON.stringify(sessionData));

  // Set expiration
  await redisClient.setTTL('user-sessions', 3600);

  // Use session in test...

  // Clean up
  await redisClient.destroyKey('user-sessions');
});
```

### Example 4: Test Data Sharing

```typescript
import { redisClient } from '@utils/redis';

// Test 1: Create shared data
test('Setup shared test data', async () => {
  const sharedData = ['product1', 'product2', 'product3'];
  await redisClient.pushMultiple('products', sharedData);
});

// Test 2: Use shared data
test('Use shared test data', async () => {
  const products = await redisClient.popMultiple('products', 2);
  expect(products).toHaveLength(2);

  // Use products in test...
});

// Test 3: Clean up shared data
test('Cleanup shared data', async () => {
  await redisClient.destroyKey('products');
});
```

---

## Quick Reference

### Most Common Operations

| What You Want     | Use This              | Example                                         |
| ----------------- | --------------------- | ----------------------------------------------- |
| Store data        | `redisClient.push()`  | `await redisClient.push('key', 'value')`        |
| Get data          | `redisClient.pop()`   | `const value = await redisClient.pop('key')`    |
| Use test user     | User fixture          | `import { test } from '@fixtures/user.fixture'` |
| Check pool status | `userPool.getStats()` | `const stats = await userPool.getStats()`       |

### Getting Help

- **Need test users?** → Use `@fixtures/user.fixture`
- **Want to store data?** → Use `redisClient.push()` and `redisClient.pop()`
- **Having connection issues?** → Check environment variables and Redis server
- **Pool problems?** → Check pool statistics and increase size if needed

---

**Remember:** Redis utilities are like having a super-smart assistant that manages all your test data and users automatically, so you can focus on writing great tests!
