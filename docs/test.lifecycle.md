# 🔄 Test Lifecycle & Data Flow Guide

*Author: Anand Sogalad*

**Complete guide to the test execution lifecycle from command entry to report generation in the Enterprise Test Automation Framework**

---

## 📋 Table of Contents

1. [Lifecycle Overview](#lifecycle-overview)
2. [Command Entry Phase](#command-entry-phase)
3. [Configuration Resolution](#configuration-resolution)
4. [Global Setup Phase](#global-setup-phase)
5. [Test Discovery & Preparation](#test-discovery--preparation)
6. [User Pool Management](#user-pool-management)
7. [Parallel Test Execution](#parallel-test-execution)
8. [Test Data Flow](#test-data-flow)
9. [Browser Lifecycle Management](#browser-lifecycle-management)
10. [API Testing Lifecycle](#api-testing-lifecycle)
11. [Error Handling & Recovery](#error-handling--recovery)
12. [Global Teardown Phase](#global-teardown-phase)
13. [Report Generation](#report-generation)
14. [Artifact Collection](#artifact-collection)
15. [Complete Flow Examples](#complete-flow-examples)

---

## 🎯 Lifecycle Overview

The test execution lifecycle is a sophisticated, multi-phase process that ensures reliable, scalable, and comprehensive test execution. The entire journey from command entry to report viewing follows a carefully orchestrated sequence.

### High-Level Lifecycle Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Command   │───▶│    Config   │───▶│   Global    │───▶│    Test     │
│    Entry    │    │ Resolution  │    │   Setup     │    │ Discovery   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Argument    │    │Environment  │    │Redis Pool   │    │Test File    │
│ Processing  │    │Detection    │    │Initialization│   │Scanning     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │───▶│  Parallel   │───▶│   Report    │───▶│   Report    │
│    Pool     │    │   Test      │    │ Generation  │    │  Viewing    │
│ Management  │    │ Execution   │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│User         │    │Browser      │    │Artifact     │    │Interactive  │
│Allocation   │    │Management   │    │Collection   │    │HTML Report  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Lifecycle Phases

1. **🚀 Initialization Phase**: Command processing and configuration
2. **⚙️ Setup Phase**: Global setup and resource preparation
3. **🔍 Discovery Phase**: Test file scanning and preparation
4. **🏃 Execution Phase**: Parallel test execution with user management
5. **📊 Collection Phase**: Result aggregation and artifact collection
6. **🧹 Cleanup Phase**: Global teardown and resource cleanup
7. **📋 Reporting Phase**: Report generation and presentation

---

## 🚀 Command Entry Phase

### 1. Command Input Processing

When you execute a test command, the system processes it through multiple layers:

```bash
# User enters command
npm run test:ui

# NPM processes package.json script
"test:ui": "node run-playwright.cjs src/tests/ui"

# Custom runner processes arguments
node run-playwright.cjs src/tests/ui
```

### 2. Custom Runner Execution

The `run-playwright.cjs` script acts as a preprocessor:

```javascript
// run-playwright.cjs Flow
┌─────────────────────────────────────────────────────────┐
│                Command Processing                       │
│                                                         │
│  Input: npm run test:ui --env=local                     │
│                          ↓                              │
│  1. Extract --env argument → Set TEST_ENV=local         │
│  2. Extract --baseURL argument → Set BASE_URL           │
│  3. Remove custom args from process.argv                │
│  4. Pass remaining args to Playwright                   │
│                          ↓                              │
│  Output: npx playwright test src/tests/ui               │
│          (with TEST_ENV=local in environment)           │
└─────────────────────────────────────────────────────────┘
```

**Step-by-step Processing**:

1. **Argument Extraction**:

   ```javascript
   // Extract --env argument
   const envArgIndex = process.argv.findIndex((arg) => arg.startsWith('--env='));
   if (envArgIndex !== -1) {
     process.env.TEST_ENV = process.argv[envArgIndex].split('=')[1];
     process.argv.splice(envArgIndex, 1);
   }
   ```

2. **Environment Variable Setting**:

   ```javascript
   // Set environment variables for config system
   process.env.TEST_ENV = 'local'; // From --env=local
   process.env.BASE_URL = 'https://staging.example.com'; // From --baseURL
   ```

3. **Playwright Invocation**:
   ```javascript
   // Spawn Playwright with processed arguments
   const args = process.argv.slice(2);
   const pw = spawn('npx', ['playwright', 'test', ...args], {
     stdio: 'inherit',
     env: process.env,
   });
   ```

### 3. Command Examples and Processing

```bash
# Example 1: Basic UI test
npm run test:ui
# Processed as: npx playwright test src/tests/ui

# Example 2: Local environment with custom URL
npm run test:local:ui --baseURL=http://localhost:3000
# Processed as: npx playwright test src/tests/ui
# Environment: TEST_ENV=local, BASE_URL=http://localhost:3000

# Example 3: Direct Playwright with filtering
npm run test:ui -- --grep "@smoke"
# Processed as: npx playwright test src/tests/ui --grep "@smoke"

# Example 4: Debug mode
npm run test:ui -- --debug --headed
# Processed as: npx playwright test src/tests/ui --debug --headed
```

---

## ⚙️ Configuration Resolution

### 1. Configuration Loading Sequence

The configuration system resolves settings in a specific order:

```
┌─────────────────────────────────────────────────────────┐
│              Configuration Resolution Flow              │
│                                                         │
│  1. Load Base Configuration (configs/base.config.ts)    │
│                          ↓                              │
│  2. Detect Environment (TEST_ENV, NODE_ENV)             │
│                          ↓                              │
│  3. Load Environment Config (configs/[env].config.ts)   │
│                          ↓                              │
│  4. Apply CLI Arguments (--baseURL, etc.)               │
│                          ↓                              │
│  5. Apply Environment Variables (BASE_URL, etc.)        │
│                          ↓                              │
│  6. Validate Configuration Schema                       │
│                          ↓                              │
│  7. Return Final Configuration                          │
└─────────────────────────────────────────────────────────┘
```

**Configuration Flow Example**:

```typescript
// configs/index.ts - Configuration Resolution
export function getCurrentConfig(): PlaywrightConfig {
  // Step 1: Load base configuration
  const baseConfig = require('./base.config').default;

  // Step 2: Detect environment
  const environment = getEnvironment(); // 'local', 'ci', 'production'

  // Step 3: Load environment-specific overrides
  const envConfig = loadEnvironmentConfig(environment);

  // Step 4: Apply CLI and environment variable overrides
  const cliOverrides = {
    baseURL: process.env.BASE_URL,
    workers: process.env.WORKERS ? parseInt(process.env.WORKERS) : undefined,
  };

  // Step 5: Merge configurations (base → env → cli)
  const mergedConfig = deepMerge(baseConfig, envConfig, cliOverrides);

  // Step 6: Validate against schema
  const validatedConfig = validateConfig(mergedConfig);

  return validatedConfig;
}
```

### 2. Environment Detection Logic

```typescript
function getEnvironment(): string {
  // Priority order for environment detection
  if (process.env.TEST_ENV) {
    return process.env.TEST_ENV; // Explicit test environment
  }

  if (process.env.NODE_ENV === 'development') {
    return 'local'; // Development defaults to local
  }

  if (process.env.CI === 'true') {
    return 'ci'; // CI environment detection
  }

  return 'production'; // Default to production
}
```

### 3. Configuration Examples

**Local Development Configuration**:

```typescript
// configs/local.config.ts
export default {
  baseURL: 'http://localhost:3000',
  headed: true, // Show browser
  workers: 1, // Serial execution for debugging
  retries: 0, // No retries for fast feedback
  timeout: 120000, // Longer timeout for debugging
  video: 'on', // Always record videos
  trace: 'on', // Always capture traces
};
```

**Production Configuration**:

```typescript
// configs/base.config.ts (used for production)
export default {
  baseURL: 'https://app.example.com',
  headed: false, // Headless execution
  workers: 4, // Parallel execution
  retries: 2, // Retry failed tests
  timeout: 30000, // Standard timeout
  video: 'retain-on-failure', // Videos only on failure
  trace: 'retain-on-failure', // Traces only on failure
};
```

---

## 🛠️ Global Setup Phase

### 1. Global Setup Execution

Before any tests run, the global setup phase prepares the test environment:

```typescript
// src/global.setup.ts - Execution Flow
async function globalSetup() {
  console.log('[Global Setup] Starting test run initialization...');

  try {
    // Step 1: Initialize Redis user pool
    await userPool.initializeTestRun();

    // Step 2: Verify pool status
    const stats = await userPool.getStats();

    // Step 3: Log initialization success
    console.log(`[Global Setup] Pool ready: ${stats.available} users available`);

    return; // Success
  } catch (error) {
    console.error('[Global Setup] Failed:', error);
    throw error; // Fail fast if setup cannot complete
  }
}
```

### 2. User Pool Initialization Flow

```
┌─────────────────────────────────────────────────────────┐
│               User Pool Initialization                  │
│                                                         │
│  1. Check if Pool Already Exists                        │
│                          ↓                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Pool Exists?                                    │    │
│  │  ├─ YES → Check User Count                      │    │
│  │  │   ├─ Users Available → Reuse Pool            │    │
│  │  │   └─ No Users → Create Fresh Pool            │    │
│  │  └─ NO → Create Fresh Pool                      │    │
│  └─────────────────────────────────────────────────┘    │
│                          ↓                              │
│  2. Generate Test Users (if creating fresh pool)        │
│                          ↓                              │
│  3. Store Users in Redis List                           │
│                          ↓                              │
│  4. Set Pool Metadata and Expiration                    │
│                          ↓                              │
│  5. Return Pool Statistics                              │
└─────────────────────────────────────────────────────────┘
```

**User Pool Initialization Code Flow**:

```typescript
// src/utils/redis/user.pool.ts
public async initializeTestRun(userCount: number = UserPoolConfig.INITIAL_SIZE): Promise<void> {
  // Check if pool already exists
  const metadata = await this.getPoolMetadata();

  if (metadata.exists && metadata.userCount > 0) {
    console.log(`[UserPool] Using existing pool: ${metadata.userCount} users available`);
    this.initialUserCount = metadata.userCount;
    return;
  }

  // Create fresh pool
  console.log(`[UserPool] Creating fresh pool with ${userCount} users`);
  await this.createFreshPool(userCount);
  this.initialUserCount = (await this.getPoolMetadata()).userCount;
}

private async createFreshPool(userCount: number): Promise<void> {
  // Generate users
  const users = this.generateUsers(userCount);
  const userStrings = users.map(user => JSON.stringify(user));

  // Store in Redis
  await this.redisClient.createKey(this.testRunKey!, userStrings);

  console.log(`[UserPool] Created pool with ${userCount} users`);
}
```

### 3. Global Setup Data Flow

```
User Command → Custom Runner → Playwright → Global Setup
     │              │              │              │
     ▼              ▼              ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ npm run │──▶│ Process │──▶│Config   │──▶│Redis    │
│test:ui  │   │Args &   │   │Load &   │   │Pool     │
│         │   │Env Vars │   │Validate │   │Init     │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
                                              │
                                              ▼
                                        ┌─────────┐
                                        │Test     │
                                        │Discovery│
                                        │& Prep   │
                                        └─────────┘
```

---

## 🔍 Test Discovery & Preparation

### 1. Test File Discovery

Playwright discovers and prepares test files based on configuration and arguments:

```
┌─────────────────────────────────────────────────────────┐
│                Test Discovery Process                   │
│                                                         │
│  1. Scan Test Directories (based on CLI args)           │
│                          ↓                              │
│  2. Filter by File Patterns (*.spec.ts, *.test.ts)      │
│                          ↓                              │
│  3. Apply Test Filtering (--grep, --grep-invert)        │
│                          ↓                              │
│  4. Group Tests by Project (chromium, firefox, etc.)    │
│                          ↓                              │
│  5. Calculate Test Distribution for Workers             │
│                          ↓                              │
│  6. Prepare Test Queue for Execution                    │
└─────────────────────────────────────────────────────────┘
```

**Discovery Examples**:

```bash
# Example 1: Discover all UI tests
npm run test:ui
# Discovers: src/tests/ui/**/*.spec.ts

# Example 2: Discover specific test file
npm run test:ui src/tests/ui/login.spec.ts
# Discovers: src/tests/ui/login.spec.ts only

# Example 3: Discover with filtering
npm run test:ui -- --grep "@smoke"
# Discovers: All UI tests, filters to @smoke tagged tests

# Example 4: Discover multiple projects
npm run test:ui -- --project=chromium --project=firefox
# Discovers: UI tests for both Chromium and Firefox browsers
```

### 2. Test Queue Preparation

```
┌─────────────────────────────────────────────────────────┐
│              Test Queue Preparation                     │
│                                                         │
│  Worker 1 Queue    Worker 2 Queue    Worker N Queue     │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │
│  │ Test A      │   │ Test D      │   │ Test G      │    │
│  │ Test B      │   │ Test E      │   │ Test H      │    │
│  │ Test C      │   │ Test F      │   │ Test I      │    │
│  └─────────────┘   └─────────────┘   └─────────────┘    │
│                                                         │
│  Load Balancing: Tests distributed based on:            │
│  • Estimated execution time                             │
│  • Test dependencies                                    │
│  • Browser requirements                                 │
│  • Resource requirements                                │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 User Pool Management

### 1. User Allocation Process

The user pool manages parallel test execution by allocating unique users to each test:

```
┌─────────────────────────────────────────────────────────┐
│              User Allocation Flow                       │
│                                                         │
│  Test Worker Requests User                              │
│                          ↓                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Redis User Pool (List Structure)                │    │
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │    │
│  │ │User1│ │User2│ │User3│ │User4│ │UserN│         │    │
│  │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘         │    │
│  │                                                 │    │
│  │ LPOP (Atomic Operation)                         │    │
│  │    ↓                                            │    │
│  │ Returns User1 (removes from list)               │    │
│  └─────────────────────────────────────────────────┘    │
│                          ↓                              │
│  User Allocated to Test Worker                          │
│                          ↓                              │
│  Test Executes with Allocated User                      │
│                          ↓                              │
│  User Returned to Pool (RPUSH)                          │
└─────────────────────────────────────────────────────────┘
```

### 2. User Pool State Management

```typescript
// User allocation in test fixture
export const userFixture = base.extend<{ testUser: UserCredential }>({
  testUser: async ({}, use) => {
    // Allocate user from pool
    const user = await userPool.getUser();
    if (!user) {
      throw new Error('No users available in pool');
    }

    try {
      // Use the allocated user for the test
      await use(user);
    } finally {
      // Return user to pool for reuse
      await userPool.returnUser(user);
    }
  },
});
```

### 3. Parallel Test Execution with User Management

```
Time: T1    T2    T3    T4    T5    T6
      │     │     │     │     │     │
Worker 1: [Get User1] ──── [Test A] ──── [Return User1]
Worker 2:       [Get User2] ──── [Test B] ──── [Return User2]
Worker 3: [Get User3] ──── [Test C] ──── [Return User3]
Worker 4:             [Get User4] ──── [Test D] ──── [Return User4]

Redis Pool State:
T1: [User2, User3, User4, User5, ...] (User1 allocated)
T2: [User3, User4, User5, User6, ...] (User2 allocated)
T3: [User4, User5, User6, User7, ...] (User3 allocated)
T4: [User5, User6, User7, User1, ...] (User4 allocated, User1 returned)
T5: [User6, User7, User1, User2, ...] (User5 allocated, User2 returned)
T6: [User7, User1, User2, User3, ...] (User6 allocated, User3 returned)
```

---

## 🏃 Parallel Test Execution

### 1. Worker Process Management

Each test worker operates independently with its own browser context and user allocation:

```
┌─────────────────────────────────────────────────────────┐
│                Worker Process Flow                      │
│                                                         │
│  Worker Process Starts                                  │
│                          ↓                              │
│  1. Load Configuration                                  │
│                          ↓                              │
│  2. Initialize Browser Context                          │
│                          ↓                              │
│  3. Allocate User from Pool                             │
│                          ↓                              │
│  4. Execute Test with Page Object                       │
│                          ↓                              │
│  5. Capture Artifacts (screenshots, traces, videos)     │
│                          ↓                              │
│  6. Return User to Pool                                 │
│                          ↓                              │
│  7. Close Browser Context                               │
│                          ↓                              │
│  8. Report Results                                      │
└─────────────────────────────────────────────────────────┘
```

### 2. Browser Context Lifecycle

Each worker manages its own browser context:

```typescript
// Browser context lifecycle per worker
test.describe('Login Tests', () => {
  test('should login successfully', async ({ page, testUser }) => {
    // Worker has isolated browser context
    // testUser is allocated from pool for this specific test

    // Step 1: Navigate to application
    await page.goto('/login');

    // Step 2: Use page objects for interaction
    const loginPage = new LoginPage(page);
    await loginPage.login(testUser.email, testUser.password);

    // Step 3: Verify login success
    await expect(page).toHaveURL('/home');

    // Step 4: User automatically returned to pool after test
  });
});
```

### 3. Parallel Execution Timeline

```
Master Process: [Global Setup] ──────────────────────────────────[Global Teardown]
                       │                                            │
Worker 1:              ├─[Browser]─[Test A]─[Test D]─[Close]────────┤
Worker 2:              ├─[Browser]─[Test B]─[Test E]─[Close]────────┤
Worker 3:              ├─[Browser]─[Test C]─[Test F]─[Close]────────┤
Worker 4:              ├─[Browser]─────────[Test G]─[Close]───────-─┤

User Pool:    [Initialize] ←──────────────────────────────────→ [Cleanup]
              Users: 200 → [Allocate/Return continuously] → Users: 200

Artifacts:             [Collect Screenshots, Videos, Traces] ──→ [Reports]
```

---

## 📊 Test Data Flow

### 1. Data Flow Through Test Layers

```
┌─────────────────────────────────────────────────────────┐
│                  Test Data Flow                         │
│                                                         │
│  Configuration Data                                     │
│  ┌─────────────┐                                        │
│  │Environment  │ ──------┐                              │
│  │Settings     │         │                              │
│  └─────────────┘         │                              │
│                          ▼                              │
│  User Pool Data    ┌─────────────┐     Page Objects     │
│  ┌─────────────┐   │   Test      │    ┌─────────────┐   │
│  │Test Users   │──▶│  Execution  │◀──▶│Page Elements│   │
│  │Credentials  │   │             │    │& Actions    │   │
│  └─────────────┘   └─────────────┘    └─────────────┘   │
│                          │                              │
│                          ▼                              │
│  Test Results      ┌──-──────────┐     Browser Data     │
│  ┌─────────────┐   │   Report    │    ┌─────────────┐   │
│  │Pass/Fail    │◀──│ Generation  │◀──▶│Screenshots  │   │
│  │Metrics      │   │             │    │Videos/Traces│   │
│  └─────────────┘   └─────────────┘    └─────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2. Data Transformation Pipeline

```
Raw Input → Processing → Validation → Execution → Collection → Reporting
    │           │           │            │           │           │
    ▼           ▼           ▼            ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│CLI Args │ │Config   │ │Schema   │ │Test     │ │Artifact │ │HTML     │
│Env Vars │ │Merging  │ │Check    │ │Results  │ │Files    │ │Report   │
│User     │ │Override │ │Type     │ │Page     │ │Videos   │ │JSON     │
│Input    │ │Apply    │ │Safety   │ │Data     │ │Traces   │ │JUnit    │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 🌐 Browser Lifecycle Management

### 1. Browser Context Lifecycle

Each test runs in an isolated browser context:

```typescript
// Browser lifecycle per test
test('example test', async ({ page, testUser }) => {
  // ┌─ Browser Context Created ─┐
  // │ Fresh browser state       │
  // │ No cookies, no storage    │
  // │ Clean environment         │
  // └───────────────────────────┘

  // Navigation and interaction
  await page.goto('/login');
  const loginPage = new LoginPage(page);

  // ┌─ Page Object Interaction ─┐
  // │ Element location          │
  // │ User input simulation     │
  // │ Action execution          │
  // └───────────────────────────┘

  await loginPage.login(testUser.email, testUser.password);

  // ┌─ Assertion and Validation ─┐
  // │ Page state verification    │
  // │ Element presence checks    │
  // │ Content validation         │
  // └────────────────────────────┘

  await expect(page).toHaveURL('/home');

  // ┌─ Automatic Cleanup ─┐
  // │ Screenshots saved  │
  // │ Videos recorded    │
  // │ Traces captured    │
  // │ Context closed     │
  // └────────────────────┘
});
```

### 2. Browser State Management

```
Test Start → Browser Context → Page Navigation → User Interaction → Assertion → Test End
     │              │                │               │              │            │
     ▼              ▼                ▼               ▼              ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Fresh    │  │Isolated │  │Clean    │ │Simulate │ │Verify   │ │Clean    │
│Browser  │  │Context  │  │Page     │ │User     │ │Expected │ │Teardown │
│Instance │  │Created  │  │Load     │ │Actions  │ │State    │ │         │
└─────────┘  └─────────┘  └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 🔌 API Testing Lifecycle

### 1. API Test Execution Flow

API tests follow a similar but streamlined lifecycle:

```
┌─────────────────────────────────────────────────────────┐
│                API Test Execution                       │
│                                                         │
│  1. Initialize API Client                               │
│                          ↓                              │
│  2. Allocate Test User from Pool                        │
│                          ↓                              │
│  3. Prepare Request Data                                │
│                          ↓                              │
│  4. Execute API Call                                    │
│                          ↓                              │
│  5. Validate Response                                   │
│                          ↓                              │
│  6. Assert Expected Results                             │
│                          ↓                              │
│  7. Return User to Pool                                 │
│                          ↓                              │
│  8. Log Results                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. API Client Lifecycle

```typescript
// API test execution example
test('should authenticate user successfully', async ({ request, testUser }) => {
  // Step 1: Initialize API client
  const authApi = new AuthApi(request);

  // Step 2: Prepare request data
  const loginRequest = {
    email: testUser.email,
    password: testUser.password,
    forceLogin: true,
  };

  // Step 3: Execute API call
  const response = await authApi.login(loginRequest);

  // Step 4: Validate response
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  // Step 5: Validate response data
  const responseData = await response.json();
  expect(responseData.tokenId).toBeDefined();
  expect(responseData.emailId).toBe(testUser.email);

  // User automatically returned to pool after test
});
```

---

## 🚨 Error Handling & Recovery

### 1. Error Handling Hierarchy

The framework implements multi-level error handling:

```
┌─────────────────────────────────────────────────────────┐
│               Error Handling Layers                     │
│                                                         │
│  Global Setup Error → Fail Fast (Stop All Tests)        │
│                          ↓                              │
│  Configuration Error → Validation Failure               │
│                          ↓                              │
│  User Pool Error → Retry Logic / Fallback               │
│                          ↓                              │
│  Test Execution Error → Retry / Capture Artifacts       │
│                          ↓                              │
│  Browser Error → Screenshot / Trace Capture             │
│                          ↓                              │
│  Assertion Error → Test Failure / Continue              │
│                          ↓                              │
│  Global Teardown Error → Log / Continue Cleanup         │
└─────────────────────────────────────────────────────────┘
```

### 2. Retry Mechanisms

```typescript
// Test-level retry configuration
test.describe('Login Tests', () => {
  test.describe.configure({ retries: 2 }); // Retry failed tests up to 2 times

  test('should login successfully', async ({ page, testUser }) => {
    // Test implementation
    // If this test fails, it will be retried up to 2 times
    // Each retry gets a fresh browser context and potentially a different user
  });
});

// Global retry configuration in config
export default {
  retries: process.env.CI ? 2 : 0, // Retry in CI, no retry locally
  maxFailures: 10, // Stop after 10 failures
};
```

### 3. Artifact Capture on Failure

```
Test Failure Detected
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Failure Artifact Collection                │
│                                                         │
│  1. Capture Screenshot                                  │
│  2. Record Video (if enabled)                           │
│  3. Save Trace File                                     │
│  4. Capture Console Logs                                │
│  5. Save Page HTML                                      │
│  6. Record Network Activity                             │
│  7. Store Error Stack Trace                             │
│                                                         │
│  All artifacts saved to: reports/test-results/          │
└─────────────────────────────────────────────────────────┘
```

---

## 🧹 Global Teardown Phase

### 1. Cleanup Sequence

After all tests complete, the global teardown ensures proper cleanup:

```typescript
// src/global.teardown.ts
async function globalTeardown() {
  console.log('[Global Teardown] Starting cleanup...');

  try {
    // Step 1: Clean up user pool
    await userPool.cleanupTestRun();

    // Step 2: Disconnect Redis client
    await redisClient.disconnect();

    // Step 3: Log completion
    console.log('[Global Teardown] Cleanup complete');
  } catch (error) {
    // Log errors but don't fail - best effort cleanup
    console.error('[Global Teardown] Error during cleanup:', error);
  }
}
```

### 2. Cleanup Decision Logic

```
┌─────────────────────────────────────────────────────────┐
│               Cleanup Decision Flow                     │
│                                                         │
│  Check Pool Usage                                       │
│                          ↓                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Pool Active? (users < initial count)            │    │
│  │  ├─ YES → Skip cleanup (other processes using)  │    │
│  │  └─ NO → Proceed with cleanup                   │    │
│  └─────────────────────────────────────────────────┘    │
│                          ↓                              │
│  Delete Pool Data                                       │
│                          ↓                              │
│  Close Redis Connections                                │
│                          ↓                              │
│  Reset Singleton Instances                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Report Generation

### 1. Report Generation Pipeline

```
Test Results → Aggregation → Format Generation → File Output
      │             │              │                 │
      ▼             ▼              ▼                 ▼
┌─────────┐   ┌─────────┐   ┌─────────┐      ┌─────────┐
│Individual│  │Combined │   │Multiple │      │Report   │
│Test     │──▶│Result   │──▶│Format   │────▶ │Files    │
│Results  │   │Data     │   │Writers  │      │Created  │
│         │   │         │   │         │      │         │
│• Pass   │   │• Summary│   │• HTML   │      │• reports/│
│• Fail   │   │• Stats  │   │• JSON   │      │  html/  │
│• Timing │   │• Errors │   │• JUnit  │      │• *.json │
│• Traces │   │• Metrics│   │         │      │• *.xml  │
└─────────┘   └─────────┘   └─────────┘      └─────────┘
```

### 2. HTML Report Structure

```
reports/html/
├── index.html                   # Main report entry point
├── data/
│   ├── test-results.json        # Test result data
│   ├── attachments/             # Screenshots, videos
│   └── traces/                  # Trace files
├── assets/
│   ├── app.css                  # Report styling
│   ├── app.js                   # Report functionality
│   └── icons/                   # UI icons
└── trace/                       # Trace viewer files
```

### 3. Report Generation Trigger

```bash
# Automatic report generation after test run
npm test                         # Runs tests + generates HTML report

# Manual report generation
npm run report:generate          # Generate HTML report from existing results
npx playwright test --reporter=html  # Generate during test execution

# View existing reports
npm run report:open              # Open HTML report in browser
npx playwright show-report       # Show default report location
```

---

## 📦 Artifact Collection

### 1. Artifact Collection Flow

```
┌─────────────────────────────────────────────────────────┐
│              Artifact Collection Process                │
│                                                         │
│  During Test Execution:                                 │
│  ├─ Screenshots → Captured on failure/action            │
│  ├─ Videos → Recorded per test (configurable)           │
│  ├─ Traces → Detailed execution timeline                │
│  ├─ Console Logs → Browser console output               │
│  └─ Network Logs → HTTP requests/responses              │
│                          ↓                              │
│  After Test Completion:                                 │
│  ├─ Organize by test/timestamp                          │
│  ├─ Compress large files                                │
│  ├─ Generate index files                                │
│  └─ Link to HTML report                                 │
│                          ↓                              │
│  Final Structure:                                       │
│  reports/                                               │
│  ├─ html/ (Interactive reports)                         │
│  ├─ test-results/ (Raw data)                            │
│  ├─ screenshots/ (PNG files)                            │
│  ├─ videos/ (WebM files)                                │
│  └─ traces/ (ZIP files)                                 │
└─────────────────────────────────────────────────────────┘
```

### 2. Artifact Organization

```
reports/test-results/
├── login-should-login-successfully-chromium/
│   ├── test-failed-1.png        # Screenshot on failure
│   ├── video.webm               # Test execution video
│   ├── trace.zip                # Detailed execution trace
│   └── test-finished-1.png      # Final screenshot
├── home-should-display-dashboard-chromium/
│   ├── video.webm
│   ├── trace.zip
│   └── test-finished-1.png
└── [other-test-results]/
```

---

## 🎯 Complete Flow Examples

### 1. Full UI Test Execution Flow

```bash
# Command executed by user
npm run test:ui -- --grep "@smoke"
```

**Complete execution trace:**

```
1. Command Processing:
   npm run test:ui -- --grep "@smoke"
   ↓
   node run-playwright.cjs src/tests/ui --grep "@smoke"
   ↓
   npx playwright test src/tests/ui --grep "@smoke"

2. Configuration Resolution:
   ├─ Load base.config.ts
   ├─ Detect environment (TEST_ENV or default)
   ├─ Load environment-specific overrides
   ├─ Apply CLI arguments
   └─ Validate final configuration

3. Global Setup:
   ├─ Initialize Redis connection
   ├─ Create/verify user pool (200 users)
   ├─ Set pool expiration
   └─ Report pool status

4. Test Discovery:
   ├─ Scan src/tests/ui/**/*.spec.ts
   ├─ Filter tests with @smoke tag
   ├─ Organize by browser project
   └─ Distribute across 4 workers

5. Parallel Execution:
   Worker 1: ├─ Get User1 → Run Test A → Return User1
   Worker 2: ├─ Get User2 → Run Test B → Return User2
   Worker 3: ├─ Get User3 → Run Test C → Return User3
   Worker 4: ├─ Get User4 → Run Test D → Return User4

6. Test Execution (per worker):
   ├─ Create browser context
   ├─ Navigate to page
   ├─ Execute page object actions
   ├─ Perform assertions
   ├─ Capture artifacts (on failure)
   └─ Close browser context

7. Global Teardown:
   ├─ Clean up user pool (if appropriate)
   ├─ Disconnect Redis client
   └─ Log cleanup completion

8. Report Generation:
   ├─ Aggregate test results
   ├─ Generate HTML report
   ├─ Organize artifacts
   └─ Create index files

9. Report Access:
   "Report generated: reports/html/index.html"
   ↓
   npm run report:open
   ↓
   Browser opens interactive HTML report
```

### 2. API Test Execution Flow

```bash
# Command executed by user
npm run test:api
```

**API-specific execution trace:**

```
1. Command Processing:
   npm run test:api
   ↓
   node run-playwright.cjs src/tests/api
   ↓
   npx playwright test src/tests/api

2-3. Configuration & Global Setup:
   (Same as UI test flow)

4. Test Discovery:
   ├─ Scan src/tests/api/**/*.spec.ts
   ├─ No browser context needed
   └─ Distribute across workers

5. API Test Execution (per worker):
   ├─ Get user from pool
   ├─ Initialize API client
   ├─ Prepare request data
   ├─ Execute HTTP request
   ├─ Validate response
   ├─ Assert expected results
   └─ Return user to pool

6-9. Teardown, Reporting, Access:
   (Same as UI test flow, but with API-specific results)
```

### 3. Local Development Flow

```bash
# Command executed by developer
npm run test:local:ui -- --headed --debug
```

**Development-optimized execution:**

```
1. Command Processing:
   npm run test:local:ui -- --headed --debug
   ↓
   TEST_ENV=local set
   ↓
   npx playwright test src/tests/ui --headed --debug

2. Configuration Resolution:
   ├─ Load base.config.ts
   ├─ Detect environment: local
   ├─ Load local.config.ts overrides:
   │  ├─ headed: true
   │  ├─ workers: 1 (serial execution)
   │  ├─ retries: 0 (fast feedback)
   │  └─ timeout: 120000 (longer for debugging)
   └─ Apply --headed --debug flags

3. Global Setup:
   ├─ Initialize local Redis (if available)
   ├─ Create smaller user pool (25 users)
   └─ Enable debug logging

4. Test Discovery:
   ├─ Scan UI tests
   └─ Single worker execution (serial)

5. Debug Execution:
   ├─ Show browser (headed mode)
   ├─ Open Playwright Inspector
   ├─ Step through test execution
   ├─ Capture all artifacts
   └─ Keep browser open on failure

6. Local Reporting:
   ├─ Generate report with debug info
   ├─ Include all traces and videos
   └─ Open report automatically

Result: Developer can see browser, step through tests, and debug issues
```

---

## 📈 Performance and Metrics

### 1. Execution Metrics Collection

Throughout the lifecycle, the framework collects performance metrics:

```
┌─────────────────────────────────────────────────────────┐
│                 Metrics Collection                      │
│                                                         │
│  Setup Phase:                                           │
│  ├─ Global setup time                                   │
│  ├─ User pool initialization time                       │
│  └─ Configuration resolution time                       │
│                                                         │
│  Execution Phase:                                       │
│  ├─ Test discovery time                                 │
│  ├─ Individual test execution time                      │
│  ├─ Browser startup time                                │
│  ├─ Page load times                                     │
│  └─ User allocation/return time                         │
│                                                         │
│  Teardown Phase:                                        │
│  ├─ Global teardown time                                │
│  ├─ Pool cleanup time                                   │
│  └─ Report generation time                              │
│                                                         │
│  Overall Metrics:                                       │
│  ├─ Total execution time                                │
│  ├─ Parallel efficiency                                 │
│  ├─ Success/failure rates                               │
│  └─ Resource utilization                                │
└─────────────────────────────────────────────────────────┘
```

### 2. Performance Optimization Points

The framework optimizes performance at multiple levels:

- **Configuration Level**: Environment-specific worker counts and timeouts
- **Pool Level**: Efficient user allocation/return with Redis
- **Browser Level**: Context reuse and resource management
- **Test Level**: Smart test distribution and parallel execution
- **Reporting Level**: Async report generation and artifact compression

---

## 🎯 Summary

The test lifecycle in the Enterprise Test Automation Framework is a sophisticated, multi-layered process that ensures:

1. **🔧 Reliable Configuration**: Environment-aware configuration resolution
2. **🚀 Efficient Setup**: Fast global setup with user pool initialization
3. **⚡ Parallel Execution**: True parallel testing with user isolation
4. **🛡️ Error Resilience**: Comprehensive error handling and recovery
5. **📊 Rich Reporting**: Multi-format reports with comprehensive artifacts
6. **🧹 Clean Teardown**: Proper resource cleanup and pool management

From command entry to report viewing, every step is optimized for enterprise-scale testing with developer-friendly debugging capabilities and CI/CD integration.

The lifecycle seamlessly handles everything from simple smoke tests to complex parallel execution scenarios, ensuring consistent, reliable, and scalable test automation across all environments.

**The result is a framework that "just works" - from `npm test` to interactive HTML reports - while providing the power and flexibility needed for enterprise test automation.** 🔄✨
