# Configuration System Guide 🔧

_Author: Anand Sogalad_

A friendly guide to understanding and using the test framework configuration system. Whether you're a developer, QA engineer, or new to testing frameworks - this guide will help you get started quickly and confidently.

---

## Table of Contents

- [🚀 Quick Start](#-quick-start)
- [📋 What is Configuration?](#-what-is-configuration)
- [🏗️ Configuration Structure](#️-configuration-structure)
- [🎯 Running Tests with Different Settings](#-running-tests-with-different-settings)
- [🛠️ Configuration Files Explained](#️-configuration-files-explained)
- [⚙️ How Configuration Works Behind the Scenes](#️-how-configuration-works-behind-the-scenes)
- [✅ Configuration Validation](#-configuration-validation)
- [📚 Common Scenarios & Examples](#-common-scenarios--examples)
- [🔍 Troubleshooting](#-troubleshooting)
- [📖 Best Practices](#-best-practices)

---

## 🚀 Quick Start

**Just want to run tests? Here are the most common commands:**

```bash
# Run all tests (uses default CI settings)
npm test

# Run tests locally (fewer parallel tests, better for development)
npm test -- --env=local

# Run tests against a specific URL
npm test -- --baseURL=https://your-app.com

# Run tests locally against your local development server
npm test -- --env=local --baseURL=http://localhost:3000

# Run only UI tests locally
npm run test:local:ui
```

**That's it!** The framework handles all the configuration automatically.

---

## 📋 What is Configuration?

Think of configuration as the "settings" for your test framework - just like adjusting settings on your phone or computer. These settings control:

- **Where tests run**: On your local machine or in CI/CD pipelines
- **How many tests run at once**: More parallel tests = faster execution (but uses more resources)
- **What gets recorded**: Screenshots, videos, traces for debugging
- **Which browsers to use**: Chrome, Firefox, Safari, etc.
- **Where to save results**: Test reports, screenshots, videos

**Why do we need different configurations?**

- **Local Development**: You want to see what's happening, run fewer tests at once, maybe run in headed mode
- **CI/CD Pipelines**: You want maximum speed, run many tests in parallel, save results for later review

---

## 🏗️ Configuration Structure

Our framework uses a simple, organized approach:

```
configs/
├── base.config.ts      # 📋 Common settings for all environments
├── ci.config.ts        # 🏭 CI/CD pipeline specific settings
├── local.config.ts     # 💻 Local development specific settings
├── config.schema.ts    # ✅ Validation rules (ensures configs are correct)
└── index.ts           # 🎯 Smart loader (picks the right config)
```

**Think of it like this:**

- **Base Config**: The foundation - common settings everyone uses
- **CI Config**: Base + adjustments for automated pipelines (lots of parallel tests)
- **Local Config**: Base + adjustments for development (fewer parallel tests, easier debugging)

---

## 🎯 Running Tests with Different Settings

### Simple Commands (Recommended)

```bash
# Use default settings (CI configuration)
npm test

# Use local development settings
npm test -- --env=local

# Test against a specific website
npm test -- --baseURL=https://staging.yourapp.com

# Combine environment and URL
npm test -- --env=local --baseURL=http://localhost:3000
```

### Test Type Specific Commands

```bash
# UI Tests
npm run test:ui              # CI environment
npm run test:local:ui        # Local environment

# API Tests
npm run test:api             # CI environment
npm run test:local:api       # Local environment

# Other test types available:
# test:accessibility, test:performance, test:security, test:e2e, etc.
```

### Advanced: Using Environment Variables

```bash
# Alternative way to set environment
TEST_ENV=local npm test

# Set base URL via environment variable
BASE_URL=https://staging.app.com npm test

# Combine both
TEST_ENV=local BASE_URL=http://localhost:3000 npm test
```

**💡 Tip**: CLI arguments (`--env`, `--baseURL`) always override environment variables.

---

## 🛠️ Configuration Files Explained

### `base.config.ts` - The Foundation

This file contains settings that **everyone uses**, regardless of environment:

```typescript
// Key settings include:
{
  testDir: "src/tests",           // Where test files are located
  timeout: 30000,                 // How long each test can run (30 seconds)
  retries: 1,                     // Retry failed tests once
  forbidOnly: true,               // Prevent accidentally committing test.only()
  fullyParallel: true,            // Run tests in parallel for speed

  // Recording settings (for debugging)
  screenshot: "only-on-failure",  // Take screenshots when tests fail
  video: "retain-on-failure",     // Keep videos only when tests fail
  trace: "retain-on-failure",     // Keep detailed traces only when tests fail

  // Browsers to test against
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
}
```

### `ci.config.ts` - CI/CD Pipeline Settings

Extends base config with CI-specific adjustments:

```typescript
{
  ...baseConfig,           // Inherit all base settings
  environment: "ci",       // Mark as CI environment
  workers: 500            // Run up to 500 tests in parallel (fast!)
}
```

**Why 500 workers?** CI environments have powerful machines and we want maximum speed.

### `local.config.ts` - Local Development Settings

Extends base config with local development adjustments:

```typescript
{
  ...baseConfig,           // Inherit all base settings
  environment: "local",    // Mark as local environment
  workers: 10             // Run only 10 tests in parallel (easier on your machine)
}
```

**Why only 10 workers?** Your local machine has limited resources, and you might want to use it for other things while tests run.

### `config.schema.ts` - Configuration Validation

This file ensures all configurations are valid and complete. Think of it as a "spell checker" for configuration files.

### `index.ts` - Smart Configuration Loader

This is the "brain" that:

1. Figures out which environment you want (`ci` or `local`)
2. Loads the appropriate configuration
3. Adds any URL overrides you specified
4. Validates everything is correct

---

## ⚙️ How Configuration Works Behind the Scenes

**When you run a test command, here's what happens:**

1. **You run a command**: `npm test -- --env=local --baseURL=http://localhost:3000`

2. **Wrapper script processes arguments**:

   - Extracts `--env=local` → sets `TEST_ENV=local`
   - Extracts `--baseURL=http://localhost:3000` → sets `BASE_URL=http://localhost:3000`
   - Passes other arguments to Playwright

3. **Configuration loader (`index.ts`) runs**:

   - Reads `TEST_ENV` (value: `local`)
   - Loads `local.config.ts`
   - Merges in the `BASE_URL` override
   - Validates the final configuration

4. **Playwright starts with your configuration**:
   - Uses local settings (10 parallel workers)
   - Tests against `http://localhost:3000`
   - All other settings from base config

### Environment Selection Priority

The framework chooses environment in this order:

1. `--env` CLI argument (highest priority)
2. `TEST_ENV` environment variable
3. `NODE_ENV` environment variable
4. Defaults to `ci` (if nothing is set)

### URL Selection Priority

The framework chooses base URL in this order:

1. `--baseURL` CLI argument (highest priority)
2. `BASE_URL` environment variable
3. No base URL (if nothing is set)

---

## ✅ Configuration Validation

Every configuration is automatically validated to ensure:

- ✅ All required settings are present
- ✅ Settings have valid values (e.g., timeout must be a number)
- ✅ Environment is either `ci` or `local`
- ✅ URLs are properly formatted
- ✅ File paths exist

**If validation fails**, you'll see a clear error message explaining what's wrong.

---

## 📚 Common Scenarios & Examples

### Scenario 1: New Developer Setup

```bash
# First time setup
npm run setup  # Installs dependencies and browsers

# Run a few tests to make sure everything works
npm test -- --env=local src/tests/ui/login.spec.ts

# Run against your local development server
npm test -- --env=local --baseURL=http://localhost:3000
```

### Scenario 2: Testing Different Environments

```bash
# Test against staging environment
npm test -- --baseURL=https://staging.yourapp.com

# Test against production environment
npm test -- --baseURL=https://app.yourapp.com

# Test locally with a specific test suite
npm run test:local:api -- --grep="authentication"
```

### Scenario 3: CI/CD Pipeline

```bash
# Typical CI command (maximum parallel execution)
npm test -- --baseURL=$STAGING_URL

# Run specific test types in CI
npm run test:api -- --baseURL=$API_BASE_URL
npm run test:e2e -- --baseURL=$APP_URL
```

### Scenario 4: Debugging Failed Tests

```bash
# Run with local settings for easier debugging
npm test -- --env=local --headed --grep="failing test name"

# Run single test file locally
npm test -- --env=local src/tests/ui/specific-test.spec.ts
```

---

## 🔍 Troubleshooting

### Problem: "Environment 'xyz' not recognized"

**Solution**: Only `ci` and `local` are supported. Use:

```bash
npm test -- --env=local  # ✅ Correct
npm test -- --env=ci     # ✅ Correct
npm test -- --env=dev    # ❌ Not supported
```

### Problem: "Configuration validation failed"

**Cause**: Usually a typo in custom configuration
**Solution**: Check the error message - it will tell you exactly what's wrong

### Problem: Tests running too slowly locally

**Solution**: Make sure you're using local environment:

```bash
npm test -- --env=local  # Uses 10 workers instead of 500
```

### Problem: Can't connect to application

**Solution**: Make sure your base URL is correct:

```bash
# Check if your app is running at this URL
npm test -- --baseURL=http://localhost:3000
```

### Problem: "Command not found" errors

**Solution**: Check available commands:

```bash
npm run  # Shows all available scripts
```

---

## 📖 Best Practices

### ✅ Do's

- **Use `--env=local` for development** - It's easier on your machine
- **Always specify `--baseURL`** when testing against specific environments
- **Use specific test commands** - `npm run test:ui` instead of running all tests
- **Keep configuration files simple** - Only override what you need to change
- **Use meaningful base URLs** - `https://staging.app.com` instead of `https://abc123.herokuapp.com`

### ❌ Don'ts

- **Don't modify `base.config.ts` frequently** - It affects everyone
- **Don't use unsupported CLI arguments** - Only `--env` and `--baseURL` are supported
- **Don't run CI settings locally** - Your machine will struggle with 500 parallel tests
- **Don't commit `.only()` or `.skip()`** - The configuration prevents this, but be aware
- **Don't hardcode URLs in tests** - Use the base URL from configuration

### 🎯 For New Contributors

1. **Start with local environment**: Always use `--env=local` when developing
2. **Test one thing at a time**: Use specific test commands like `npm run test:local:ui`
3. **Check your setup**: Run `npm run setup` if you encounter browser issues
4. **Ask for help**: If configuration seems complex, ask a team member - they've been there!

### 🏢 For Project Maintainers

1. **Keep base config stable**: Changes affect everyone
2. **Document custom settings**: If you add new configuration options
3. **Validate changes**: The schema will catch errors, but test thoroughly
4. **Consider backwards compatibility**: When changing configuration structure

---

**Remember**: Configuration might seem complex at first, but it's designed to make your life easier. The framework handles the complicated parts automatically - you just need to tell it what environment you want and where your application is running! 🚀
