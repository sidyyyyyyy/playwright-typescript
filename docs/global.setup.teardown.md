# Global Setup & Teardown Guide

_Author: Anand Sogalad_

## 📖 Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Global Setup](#global-setup)
4. [Global Teardown](#global-teardown)
5. [Configuration](#configuration)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Examples](#examples)

## 🌟 Overview

Global Setup and Teardown are the "opening and closing ceremonies" of your test runs. They prepare everything your tests need before they start and clean up afterward, ensuring your testing environment is always ready and clean.

### What Are Global Setup & Teardown?

Global Setup & Teardown are special functions that:

- **Setup**: Prepare the test environment before any tests run
- **Teardown**: Clean up resources after all tests complete
- **Initialize services**: Start Redis connections, user pools, and other services
- **Ensure isolation**: Prevent tests from interfering with each other

### Why Do We Need Them?

**Simple analogy:**
Think of global setup like setting up a classroom before students arrive - arranging desks, preparing materials, and turning on equipment. Global teardown is like cleaning up after class - putting away materials, turning off equipment, and leaving the room ready for the next class.

**Location:**

- Global Setup: `src/global.setup.ts`
- Global Teardown: `src/global.teardown.ts`

---

## 🚀 Getting Started

### How They Work

```
Test Run Lifecycle:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Global Setup   │ -> │   Run Tests     │ -> │ Global Teardown │
│                 │    │                 │    │                 │
│ • Start Redis   │    │ • Test 1        │    │ • Clean Redis   │
│ • Create Users  │    │ • Test 2        │    │ • Close Pools   │
│ • Initialize    │    │ • Test 3        │    │ • Disconnect    │
│   Pools         │    │ • ...           │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Automatic Execution

Both setup and teardown run automatically:

- **Setup runs**: Before the first test starts
- **Teardown runs**: After the last test finishes
- **Even on failure**: Teardown runs even if tests fail

---

## ⚡ Global Setup

### What Does Global Setup Do?

Global Setup prepares your test environment by:

1. **Initializing User Pool**: Creates a pool of test users for parallel testing
2. **Starting Services**: Establishes Redis connections
3. **Preparing Resources**: Sets up shared test data and configurations
4. **Validation**: Ensures everything is ready before tests begin

### How It Works

```typescript
// src/global.setup.ts
async function globalSetup() {
  console.log('[Global Setup] Starting test run initialization...');

  try {
    // Initialize test run with users
    await userPool.initializeTestRun();

    // Get initial stats
    const stats = await userPool.getStats();

    console.log(`[Global Setup] Initial pool: ${stats.available} users available`);
  } catch (error) {
    console.error('[Global Setup] Failed to initialize test run:', error);
    throw error;
  }
}
```

### What Happens Step by Step

1. **Start Message**: Logs that setup is beginning
2. **Initialize User Pool**: Creates or reuses existing user pool
3. **Check Statistics**: Verifies pool is ready with available users
4. **Success Confirmation**: Logs successful initialization
5. **Error Handling**: Stops execution if setup fails

### Key Operations

| Operation                      | Purpose            | What It Does                              |
| ------------------------------ | ------------------ | ----------------------------------------- |
| `userPool.initializeTestRun()` | Create user pool   | Sets up test users for parallel execution |
| `userPool.getStats()`          | Verify setup       | Checks pool status and available users    |
| Error handling                 | Ensure reliability | Stops tests if setup fails                |

---

## 🧹 Global Teardown

### What Does Global Teardown Do?

Global Teardown cleans up your test environment by:

1. **Cleaning User Pool**: Removes test users and pool data
2. **Closing Connections**: Disconnects from Redis
3. **Freeing Resources**: Releases memory and connections
4. **Final Cleanup**: Ensures no resources are left hanging

### How It Works

```typescript
// src/global.teardown.ts
async function globalTeardown() {
  console.log('[Global Teardown] Starting test run cleanup...');

  try {
    // Cleanup test run
    await userPool.cleanupTestRun();

    // Disconnect Redis client
    await redisClient.disconnect();

    console.log('[Global Teardown] Redis connection closed and cleanup completed');
  } catch (error) {
    console.error('[Global Teardown] Error during cleanup:', error);
  }
}
```

### What Happens Step by Step

1. **Start Message**: Logs that cleanup is beginning
2. **Clean User Pool**: Removes test users and pool data
3. **Disconnect Redis**: Closes Redis connection properly
4. **Success Confirmation**: Logs successful cleanup
5. **Error Handling**: Logs errors but doesn't stop (best effort cleanup)

### Key Operations

| Operation                   | Purpose          | What It Does                           |
| --------------------------- | ---------------- | -------------------------------------- |
| `userPool.cleanupTestRun()` | Clean user pool  | Removes test users and pool data       |
| `redisClient.disconnect()`  | Close Redis      | Properly disconnects from Redis server |
| Error handling              | Graceful cleanup | Logs errors but continues cleanup      |

---

## ⚙️ Configuration

### Playwright Configuration

Global setup and teardown are configured in your Playwright config:

```typescript
// playwright.config.ts
export default defineConfig({
  // Global setup runs before all tests
  globalSetup: require.resolve('./src/global.setup.ts'),

  // Global teardown runs after all tests
  globalTeardown: require.resolve('./src/global.teardown.ts'),

  // Other configuration...
});
```

### Environment Variables

Set these for proper operation:

```bash
# Redis connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password

# Test environment
BASE_URL=https://your-test-environment.com
```

### User Pool Configuration

```typescript
// Configured in constants
export const UserPoolConfig = {
  INITIAL_SIZE: 200, // Number of users to create
  MAX_SIZE: 1000, // Maximum pool size
  DEFAULT_TTL: 3600, // Pool expiration time
};
```

---

## 💡 Best Practices

### ✅ Do's

- **Keep setup simple** - Only initialize what's absolutely necessary
- **Handle errors gracefully** - Fail fast if setup can't complete
- **Log important steps** - Make it easy to debug setup issues
- **Use environment variables** - Make configuration flexible
- **Test setup independently** - Ensure setup works in isolation

### ❌ Don'ts

- **Don't run tests in setup** - Setup should only prepare, not test
- **Don't ignore teardown errors** - Log them for debugging
- **Don't make setup too complex** - Keep it focused and simple
- **Don't hardcode values** - Use configuration and environment variables
- **Don't skip teardown** - Always clean up resources

### 🎯 Setup Guidelines

```typescript
// ✅ Good - Simple, focused setup
async function globalSetup() {
  console.log('[Setup] Initializing...');

  try {
    await userPool.initializeTestRun();
    console.log('[Setup] Ready!');
  } catch (error) {
    console.error('[Setup] Failed:', error);
    throw error; // Fail fast
  }
}

// ❌ Avoid - Complex setup with tests
async function globalSetup() {
  await userPool.initializeTestRun();
  await runSomeTest(); // Don't do this!
  await checkSomething(); // Too complex!
}
```

### 🧹 Teardown Guidelines

```typescript
// ✅ Good - Comprehensive cleanup
async function globalTeardown() {
  console.log('[Teardown] Cleaning up...');

  try {
    await userPool.cleanupTestRun();
    await redisClient.disconnect();
    console.log('[Teardown] Complete!');
  } catch (error) {
    console.error('[Teardown] Error:', error);
    // Continue cleanup - don't throw
  }
}

// ❌ Avoid - Throwing errors in teardown
async function globalTeardown() {
  await userPool.cleanupTestRun();
  throw new Error('This stops cleanup!'); // Don't do this!
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### Setup Fails to Initialize

```
[Global Setup] Failed to initialize test run: Redis connection failed
```

**Solutions:**

1. Check Redis server is running
2. Verify environment variables
3. Check network connectivity
4. Verify Redis credentials

#### Pool Creation Errors

```
[Global Setup] Failed to create user pool
```

**Solutions:**

1. Check Redis has enough memory
2. Verify pool configuration
3. Check for existing pools
4. Increase timeout values

#### Teardown Errors

```
[Global Teardown] Error during cleanup: Connection already closed
```

**Solutions:**

1. Check if Redis is still running
2. Verify teardown order
3. Handle connection states
4. Use try/catch blocks

### Debugging Tips

```typescript
// Add debug logging
async function globalSetup() {
  console.log('[Setup] Environment:', process.env.NODE_ENV);
  console.log('[Setup] Redis host:', process.env.REDIS_HOST);
  console.log('[Setup] Base URL:', process.env.BASE_URL);

  // Your setup code...
}

// Check Redis connection
const status = redisClient.getStatus();
console.log('[Setup] Redis status:', status);

// Verify pool creation
const stats = await userPool.getStats();
console.log('[Setup] Pool stats:', stats);
```

---

## 📝 Examples

### Example 1: Basic Setup & Teardown

```typescript
// global.setup.ts
async function globalSetup() {
  console.log('[Setup] Starting...');

  try {
    // Initialize with specific user count
    await userPool.initializeTestRun(100);

    const stats = await userPool.getStats();
    console.log(`[Setup] Created pool with ${stats.available} users`);
  } catch (error) {
    console.error('[Setup] Failed:', error);
    throw error;
  }
}

// global.teardown.ts
async function globalTeardown() {
  console.log('[Teardown] Starting cleanup...');

  try {
    // Clean up pool
    await userPool.cleanupTestRun();

    // Close Redis
    await redisClient.disconnect();

    console.log('[Teardown] Cleanup complete');
  } catch (error) {
    console.error('[Teardown] Error:', error);
  }
}
```

### Example 2: Enhanced Setup with Validation

```typescript
// global.setup.ts
async function globalSetup() {
  console.log('[Setup] Initializing test environment...');

  try {
    // Check Redis connection first
    const status = redisClient.getStatus();
    if (!status.connected) {
      throw new Error('Redis not connected');
    }

    // Initialize user pool
    await userPool.initializeTestRun(200);

    // Validate pool
    const stats = await userPool.getStats();
    if (stats.available === 0) {
      throw new Error('No users available in pool');
    }

    console.log(`[Setup] Ready with ${stats.available} users`);
    console.log(`[Setup] Environment: ${stats.baseURL}`);
  } catch (error) {
    console.error('[Setup] Initialization failed:', error);
    throw error;
  }
}
```

### Example 3: Environment-Specific Setup

```typescript
// global.setup.ts
async function globalSetup() {
  const environment = process.env.NODE_ENV || 'local';
  console.log(`[Setup] Initializing for ${environment} environment...`);

  try {
    // Different pool sizes for different environments
    let poolSize;
    switch (environment) {
      case 'ci':
        poolSize = 50; // Smaller pool for CI
        break;
      case 'staging':
        poolSize = 100; // Medium pool for staging
        break;
      case 'production':
        poolSize = 200; // Large pool for production
        break;
      default:
        poolSize = 25; // Small pool for local
    }

    await userPool.initializeTestRun(poolSize);

    const stats = await userPool.getStats();
    console.log(`[Setup] ${environment} environment ready with ${stats.available} users`);
  } catch (error) {
    console.error(`[Setup] ${environment} setup failed:`, error);
    throw error;
  }
}
```

### Example 4: Setup with Additional Services

```typescript
// global.setup.ts
async function globalSetup() {
  console.log('[Setup] Initializing all services...');

  try {
    // Initialize user pool
    await userPool.initializeTestRun();

    // Setup shared test data
    await redisClient.pushMultiple('test-products', ['laptop', 'mouse', 'keyboard', 'monitor']);

    // Set expiration for test data
    await redisClient.setTTL('test-products', 7200); // 2 hours

    // Verify everything is ready
    const userStats = await userPool.getStats();
    const productCount = await redisClient.getLength('test-products');

    console.log(`[Setup] Ready - ${userStats.available} users, ${productCount} products`);
  } catch (error) {
    console.error('[Setup] Service initialization failed:', error);
    throw error;
  }
}

// global.teardown.ts
async function globalTeardown() {
  console.log('[Teardown] Cleaning up all services...');

  try {
    // Clean up test data
    await redisClient.destroyKey('test-products');

    // Clean up user pool
    await userPool.cleanupTestRun();

    // Disconnect Redis
    await redisClient.disconnect();

    console.log('[Teardown] All services cleaned up');
  } catch (error) {
    console.error('[Teardown] Cleanup error:', error);
  }
}
```

---

## Quick Reference

### Setup Checklist

- [ ] Initialize user pool
- [ ] Verify Redis connection
- [ ] Check pool statistics
- [ ] Log success/failure
- [ ] Handle errors properly

### Teardown Checklist

- [ ] Clean user pool
- [ ] Disconnect Redis
- [ ] Clean temporary data
- [ ] Log completion
- [ ] Handle errors gracefully

### Common Commands

| What You Want     | Code                                    | Purpose               |
| ----------------- | --------------------------------------- | --------------------- |
| Initialize pool   | `await userPool.initializeTestRun(100)` | Create 100 test users |
| Check pool status | `await userPool.getStats()`             | Get pool statistics   |
| Clean pool        | `await userPool.cleanupTestRun()`       | Remove pool data      |
| Close Redis       | `await redisClient.disconnect()`        | Disconnect from Redis |

### Getting Help

- **Setup failing?** → Check Redis connection and environment variables
- **Pool problems?** → Verify pool configuration and Redis memory
- **Teardown errors?** → Check logs and handle errors gracefully
- **Want more users?** → Increase pool size in `initializeTestRun()`

---

**Remember:** Global Setup and Teardown are the foundation of reliable test execution. They ensure your tests start with a clean, prepared environment and leave no mess behind!
