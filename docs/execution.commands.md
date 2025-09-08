# 🚀 Test Execution Commands Guide

*Author: Anand Sogalad*

**Complete reference for all test execution commands in the Enterprise Test Automation Framework**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Reference](#quick-reference)
3. [NPM Script Commands](#npm-script-commands)
4. [Direct Playwright Commands](#direct-playwright-commands)
5. [Environment-Specific Execution](#environment-specific-execution)
6. [Test Category Execution](#test-category-execution)
7. [Advanced Execution Options](#advanced-execution-options)
8. [Development Commands](#development-commands)
9. [Reporting and Artifacts](#reporting-and-artifacts)
10. [Interactive and Debug Commands](#interactive-and-debug-commands)
11. [CI/CD Commands](#cicd-commands)
12. [Troubleshooting Commands](#troubleshooting-commands)

---

## 🎯 Overview

The Enterprise Test Automation Framework provides multiple ways to execute tests, from simple one-command runs to sophisticated CI/CD pipeline integrations. This guide covers every available command and execution pattern.

### Command Types

- **🎯 NPM Scripts**: Pre-configured commands via `package.json`
- **🎭 Direct Playwright**: Native Playwright CLI commands
- **🌍 Environment-Aware**: Commands that automatically adapt to environments
- **🔧 Development Tools**: Commands for debugging and development
- **📊 Reporting**: Commands for generating and viewing reports

### Report Locations

All test execution automatically generates reports in organized locations:

```
reports/
├── html/                    # Interactive HTML reports
├── test-results/           # Raw Playwright test results
├── screenshots/            # Screenshot artifacts
├── videos/                # Video recordings of test runs
├── traces/                # Detailed execution traces
└── logs/                  # Test execution logs
```

---

## ⚡ Quick Reference

### Most Common Commands

```bash
# Essential commands for daily use
npm test                           # Run all tests (production environment)
npm run test:local                 # Run all tests (local environment)
npm run test:ui                    # Run UI tests only
npm run report:open                # View latest test results

# Development and debugging
npm run test:ui -- --headed        # Run UI tests with visible browser
npm run test:ui -- --debug         # Debug UI tests step by step
npm run validate                   # Validate code quality and types
npm run clean                      # Clean all artifacts
```

### Emergency Commands

```bash
# When things go wrong
npm run clean && npm run setup     # Complete reset and reinstall
DEBUG=pw:* npm test -- --workers=1 # Full debug with no parallelization
npm test -- --max-failures=1 --headed  # Stop on first failure, show browser
npx playwright install --with-deps # Reinstall browsers with dependencies
```

---

## 📦 NPM Script Commands

### Basic Test Execution

```bash
# Run all tests in default (production) environment
npm test
npm run test                       # Alternative syntax

# Run all tests in local environment
npm run test:local
```

### Environment-Specific Commands

```bash
# Local Environment Testing (Development)
npm run test:local                 # All tests locally
npm run test:local:ui              # UI tests locally
npm run test:local:api             # API tests locally
npm run test:local:accessibility   # Accessibility tests locally
npm run test:local:security        # Security tests locally
npm run test:local:performance     # Performance tests locally
npm run test:local:integration     # Integration tests locally
npm run test:local:e2e             # E2E tests locally
npm run test:local:customer        # Customer tests locally

# Production Environment Testing (Default)
npm run test:ui                    # UI tests in production
npm run test:api                   # API tests in production
npm run test:accessibility         # Accessibility tests in production
npm run test:security              # Security tests in production
npm run test:performance           # Performance tests in production
npm run test:integration           # Integration tests in production
npm run test:e2e                   # E2E tests in production
npm run test:customer              # Customer tests in production
```

### Development and Quality Commands

```bash
# Code Quality
npm run validate                   # Run type-check + lint (recommended before commit)
npm run type-check                 # TypeScript validation only
npm run lint                       # Check code formatting with Prettier
npm run format                     # Auto-format code with Prettier
npm run eslint                     # Run ESLint checks
npm run eslint:fix                 # Fix ESLint issues automatically

# Build and Setup
npm run build                      # Compile TypeScript to JavaScript
npm run setup                      # Complete setup (install + browsers)
npm run install:browsers           # Install Playwright browsers only

# Maintenance
npm run clean                      # Clean all artifacts and build outputs
npm run node:version              # Display Node.js version
```

### Reporting Commands

```bash
# Generate and View Reports
npm run report:generate            # Generate HTML report from last run
npm run report:open                # Open HTML report in browser
```

---

## 🎭 Direct Playwright Commands

### Basic Execution

```bash
# Run all tests
npx playwright test                # All tests with default config
npx playwright test --headed       # All tests with visible browser
npx playwright test --debug        # All tests in debug mode

# Run specific test files
npx playwright test src/tests/ui/login.spec.ts
npx playwright test src/tests/api/auth.api.spec.ts
npx playwright test src/tests/ui/                # All UI tests
npx playwright test src/tests/api/               # All API tests
```

### Test Filtering and Selection

```bash
# Filter by test name or pattern
npx playwright test --grep "login"              # Tests matching "login"
npx playwright test --grep "auth.*positive"     # Tests matching pattern
npx playwright test --grep "@smoke"             # Tests with @smoke tag
npx playwright test --grep "@regression"        # Tests with @regression tag

# Exclude tests
npx playwright test --grep-invert "@slow"       # Exclude slow tests
npx playwright test --grep-invert "@skip"       # Exclude skipped tests

# Complex filtering
npx playwright test --grep "^(?=.*@smoke)(?=.*@ui).*$"  # Smoke AND UI tests
npx playwright test --grep "@smoke.*@api"       # Smoke tests for API
```

### Browser and Project Selection

```bash
# Run on specific browser
npx playwright test --project=chromium          # Chromium only
npx playwright test --project=firefox           # Firefox only
npx playwright test --project=webkit            # WebKit (Safari) only

# Run on multiple browsers
npx playwright test --project=chromium --project=firefox
npx playwright test --project=chromium --project=webkit

# List available projects
npx playwright test --list                      # Show all available test projects
```

### Execution Control

```bash
# Parallel execution
npx playwright test --workers=1                 # Serial execution (no parallelization)
npx playwright test --workers=4                 # Use 4 workers
npx playwright test --workers=50%               # Use 50% of CPU cores
npx playwright test --workers=8 --max-failures=3  # Stop after 3 failures

# Retry and failure handling
npx playwright test --retries=3                 # Retry failed tests 3 times
npx playwright test --max-failures=1            # Stop after first failure
npx playwright test --max-failures=5            # Stop after 5 failures
npx playwright test --last-failed               # Only run previously failed tests

# Timeouts
npx playwright test --timeout=60000             # 60 second timeout per test
npx playwright test --global-timeout=600000     # 10 minute global timeout
```

### Output and Reporting

```bash
# Reporter formats
npx playwright test --reporter=list             # List format (detailed)
npx playwright test --reporter=dot              # Dot format (minimal)
npx playwright test --reporter=line             # Line format (compact)
npx playwright test --reporter=json             # JSON format
npx playwright test --reporter=junit            # JUnit format
npx playwright test --reporter=html             # HTML format
npx playwright test --reporter=github           # GitHub Actions format

# Multiple reporters
npx playwright test --reporter=list,json        # List + JSON
npx playwright test --reporter=html,junit       # HTML + JUnit
npx playwright test --reporter=list,json,junit  # Three formats

# Output directories
npx playwright test --reporter=json --output-dir=reports/json
npx playwright test --reporter=junit --output-dir=reports/junit
```

### Tracing and Debugging

```bash
# Tracing options
npx playwright test --trace=on                  # Always capture traces
npx playwright test --trace=retain-on-failure   # Capture traces only on failure
npx playwright test --trace=on-first-retry      # Capture traces on first retry
npx playwright test --trace=on-all-retries      # Capture traces on all retries

# Screenshot options
npx playwright test --screenshot=on             # Always take screenshots
npx playwright test --screenshot=only-on-failure  # Screenshots only on failure
npx playwright test --screenshot=on-first-failure # Screenshots on first failure

# Video recording
npx playwright test --video=on                  # Always record videos
npx playwright test --video=retain-on-failure   # Record videos only on failure
npx playwright test --video=on-first-retry      # Record videos on first retry
```

---

## 🌍 Environment-Specific Execution

### Environment Variables

```bash
# Environment selection
TEST_ENV=local npm test                        # Force local environment
TEST_ENV=staging npm test                      # Force staging environment
NODE_ENV=development npm test                  # Development mode

# URL overrides
BASE_URL=https://staging.example.com npm test  # Override base URL
BASE_URL=http://localhost:3000 npm run test:ui # Test against local server

# Custom environment combinations
TEST_ENV=local BASE_URL=https://dev.example.com npm run test:ui
```

### Environment-Aware Commands

```bash
# Using custom environments
npx playwright test --env=staging              # If supported by framework
TEST_ENV=custom BASE_URL=https://test.app.com npm test

# Development environments
NODE_ENV=development npm run test:local:ui     # Development with local config
NODE_ENV=production npm run test:ui            # Production mode
```

---

## 🗂️ Test Category Execution

### By Test Type

```bash
# UI Testing
npm run test:ui                                # All UI tests (production)
npm run test:local:ui                          # All UI tests (local)
npx playwright test src/tests/ui/              # Direct Playwright execution

# API Testing
npm run test:api                               # All API tests (production)
npm run test:local:api                         # All API tests (local)
npx playwright test src/tests/api/             # Direct Playwright execution

# Accessibility Testing
npm run test:accessibility                     # All accessibility tests
npm run test:local:accessibility               # Accessibility tests locally
npx playwright test src/tests/accessibility/   # Direct execution

# Security Testing
npm run test:security                          # All security tests
npm run test:local:security                    # Security tests locally
npx playwright test src/tests/security/        # Direct execution

# Performance Testing
npm run test:performance                       # All performance tests
npm run test:local:performance                 # Performance tests locally
npx playwright test src/tests/performance/     # Direct execution

# Integration Testing
npm run test:integration                       # All integration tests
npm run test:local:integration                 # Integration tests locally
npx playwright test src/tests/integration/     # Direct execution

# End-to-End Testing
npm run test:e2e                              # All E2E tests
npm run test:local:e2e                        # E2E tests locally
npx playwright test src/tests/e2e/            # Direct execution

# Customer-Specific Testing
npm run test:customer                          # All customer tests
npm run test:local:customer                    # Customer tests locally
npx playwright test src/tests/customer/        # Direct execution
```

### By Test Tags

```bash
# Common test tags
npx playwright test --grep "@smoke"            # Smoke tests
npx playwright test --grep "@regression"       # Regression tests
npx playwright test --grep "@critical"         # Critical tests
npx playwright test --grep "@sanity"           # Sanity tests

# Functional tags
npx playwright test --grep "@authentication"   # Authentication tests
npx playwright test --grep "@authorization"    # Authorization tests
npx playwright test --grep "@payment"          # Payment tests
npx playwright test --grep "@checkout"         # Checkout tests

# Test type tags
npx playwright test --grep "@positive"         # Positive test cases
npx playwright test --grep "@negative"         # Negative test cases
npx playwright test --grep "@boundary"         # Boundary tests
npx playwright test --grep "@load"             # Load tests

# Combined tags
npx playwright test --grep "@smoke.*@ui"       # Smoke tests for UI
npx playwright test --grep "@regression.*@api" # Regression tests for API
npx playwright test --grep "@critical.*@security" # Critical security tests
```

---

## 🔧 Advanced Execution Options

### Performance and Optimization

```bash
# Optimize for speed
npx playwright test --workers=100% --retries=0  # Maximum parallelization, no retries
WORKERS=8 npm test                              # Custom worker count via environment

# Optimize for reliability
npx playwright test --workers=1 --retries=3     # Serial execution with retries
npx playwright test --workers=2 --timeout=120000 # Fewer workers, longer timeout

# Resource management
npx playwright test --workers=4 --max-failures=10 # Balanced approach
```

### Custom Configuration

```bash
# Use custom config files
npx playwright test --config=configs/ci.config.ts
npx playwright test --config=custom.playwright.config.ts

# Override specific settings
npx playwright test --timeout=90000             # 90 second test timeout
npx playwright test --global-timeout=1800000    # 30 minute global timeout
npx playwright test --workers=2 --retries=1     # Custom worker and retry settings
```

### Execution Patterns

```bash
# Test specific files with patterns
npx playwright test "**/*.login.spec.ts"        # All login specs
npx playwright test "src/tests/ui/**/*.spec.ts" # All UI specs
npx playwright test "**/auth*.spec.ts"          # All auth-related specs

# Line-specific execution
npx playwright test src/tests/ui/login.spec.ts:45  # Specific line in file

# Test name patterns
npx playwright test --grep "should.*login.*successfully"
npx playwright test --grep "validate.*form.*validation"
```

---

## 👨‍💻 Development Commands

### Code Quality and Validation

```bash
# Pre-commit validation
npm run validate                               # Complete validation (type-check + lint)
npm run type-check && npm run lint            # Manual validation steps

# TypeScript validation
npm run type-check                             # Check TypeScript compilation
tsc --noEmit                                  # Direct TypeScript check

# Linting and formatting
npm run lint                                   # Check code formatting
npm run format                                 # Auto-format code
npm run eslint                                 # ESLint checks
npm run eslint:fix                             # Fix ESLint issues

# Build process
npm run build                                  # Compile TypeScript
npm run clean && npm run build                # Clean rebuild
```

### Local Development

```bash
# Quick development cycle
npm run format && npm run validate && npm run test:local:ui

# Development with specific features
npm run test:local:ui -- --grep "new feature"
npm run test:local:api -- --headed --debug

# Watch mode (if available)
npm run test:local:ui -- --headed --timeout=0  # Keep browser open
```

### Dependencies and Setup

```bash
# Complete setup
npm run setup                                  # Install dependencies + browsers
npm install && npm run install:browsers       # Manual setup steps

# Browser management
npm run install:browsers                       # Install all browsers
npx playwright install                         # Direct browser install
npx playwright install chromium                # Install specific browser
npx playwright install --with-deps             # Install with system dependencies

# Dependency management
npm install                                    # Install dependencies
npm ci                                         # Clean install (CI/CD)
npm audit                                      # Security audit
npm outdated                                   # Check outdated packages
```

---

## 📊 Reporting and Artifacts

### Report Generation

```bash
# Generate reports
npm run report:generate                        # Generate HTML report
npx playwright test --reporter=html            # Generate HTML report directly

# Multiple report formats
npx playwright test --reporter=html,json,junit
npx playwright test --reporter=html --reporter=json # Alternative syntax
```

### View Reports

```bash
# Open reports
npm run report:open                            # Open HTML report in browser
npx playwright show-report                     # Show default report
npx playwright show-report reports/html        # Show specific report location

# Show traces
npx playwright show-trace reports/traces/trace.zip
npx playwright show-trace "reports/test-results/*/trace.zip"
```

### Artifact Management

```bash
# Clean artifacts
npm run clean                                  # Clean all artifacts
rm -rf reports/test-results                    # Clean test results only
rm -rf reports/screenshots                     # Clean screenshots only
rm -rf reports/videos                          # Clean videos only
rm -rf reports/traces                          # Clean traces only

# Artifact locations
ls -la reports/                                # List all report artifacts
find reports/ -name "*.png"                   # Find all screenshots
find reports/ -name "*.webm"                  # Find all videos
find reports/ -name "trace.zip"               # Find all traces
```

### Custom Reports

```bash
# Custom reporter configurations
npx playwright test --reporter=./custom-reporter.js
npx playwright test --reporter=@custom/playwright-reporter

# Report merging (for sharded execution)
npx playwright merge-reports --reporter=html ./blob-reports
npx playwright merge-reports --reporter=json ./blob-reports
```

---

## 🎮 Interactive and Debug Commands

### Interactive Test Runner

```bash
# UI Mode (Interactive test runner)
npx playwright test --ui                       # Interactive test runner
npx playwright test --ui src/tests/ui/         # UI mode for specific folder
npx playwright test --ui --headed              # UI mode with visible browser

# UI Mode configuration
npx playwright test --ui-host=0.0.0.0         # Allow external connections
npx playwright test --ui-port=9323             # Custom port
npx playwright test --ui-host=localhost --ui-port=8080
```

### Debug Mode

```bash
# Debug execution
npx playwright test --debug                    # Debug all tests
npx playwright test --debug src/tests/ui/login.spec.ts  # Debug specific test
PWDEBUG=1 npm test                             # Debug via environment variable

# Stepped debugging
npx playwright test --debug --headed           # Debug with visible browser
npx playwright test --debug --headed --timeout=0  # Debug without timeout

# Debug specific scenarios
npx playwright test --debug --grep "failing test"
npx playwright test --debug --last-failed      # Debug previously failed tests
```

### Test Recording and Generation

```bash
# Record new tests
npx playwright codegen                          # Record against current page
npx playwright codegen https://example.com     # Record against specific URL
npx playwright codegen --device="iPhone 13"    # Record mobile tests
npx playwright codegen --browser=firefox       # Record with specific browser

# Recording options
npx playwright codegen --save-as=my-test.spec.ts
npx playwright codegen --target=javascript     # Generate JavaScript instead of TypeScript
npx playwright codegen --device="Pixel 4"      # Mobile device recording
```

### Inspector and Analysis

```bash
# Playwright Inspector
npx playwright test --debug                    # Opens inspector
npx playwright inspector                       # Standalone inspector

# Trace analysis
npx playwright show-trace trace.zip            # Analyze trace file
npx playwright show-trace "test-results/**/trace.zip"  # Multiple traces
```

---

## 🚀 CI/CD Commands

### GitHub Actions Integration

```bash
# CI-optimized execution
CI=true npm test                               # Enable CI mode
CI=true npm test --reporter=json,junit         # CI with multiple reports

# Parallel CI execution
npm test --workers=4 --max-failures=20        # Balanced CI execution
npm test --workers=2 --retries=3 --reporter=github  # Conservative CI approach
```

### Sharded Execution

```bash
# Manual sharding for distributed CI
npx playwright test --shard=1/4                # Run 1st quarter of tests
npx playwright test --shard=2/4                # Run 2nd quarter of tests
npx playwright test --shard=3/4                # Run 3rd quarter of tests
npx playwright test --shard=4/4                # Run 4th quarter of tests

# Shard with specific configurations
npx playwright test --shard=1/3 --project=chromium
npx playwright test --shard=2/3 --project=firefox
npx playwright test --shard=3/3 --project=webkit
```

### Report Collection

```bash
# Collect distributed reports
npx playwright merge-reports ./shard-reports   # Merge sharded reports
npx playwright merge-reports --reporter=html ./blob-reports

# Artifact upload preparation
tar -czf test-results.tar.gz reports/          # Compress all reports
zip -r test-artifacts.zip reports/ screenshots/ videos/
```

### Environment-Specific CI

```bash
# Staging CI
TEST_ENV=staging npm test --reporter=json,junit
BASE_URL=https://staging.example.com npm test

# Production CI
TEST_ENV=production npm test --reporter=html,json
BASE_URL=https://app.example.com npm test --workers=8
```

---

## 🔍 Troubleshooting Commands

### Health Checks

```bash
# Verify installation
npm run validate                               # Complete framework validation
npx playwright --version                      # Check Playwright version
npm run node:version                          # Check Node.js version
npm doctor                                     # NPM health check

# Browser verification
npx playwright install --dry-run              # Check what would be installed
npx playwright test --list                    # List all available tests
npx playwright test --project=chromium --list # List tests for specific browser
```

### Debug Information

```bash
# Debug environment
DEBUG=pw:api npm test                          # Debug API calls
DEBUG=pw:browser npm test                     # Debug browser interactions
DEBUG=pw:* npm test                           # Debug everything
DEBUG=pw:browser:network npm test             # Debug network requests

# Verbose output
npm test -- --reporter=list --workers=1       # Detailed sequential output
npx playwright test --verbose                 # Verbose Playwright output
```

### Common Issues Resolution

```bash
# Browser issues
npx playwright install --with-deps            # Reinstall browsers with dependencies
npx playwright install chromium --force       # Force reinstall specific browser

# Permission issues
sudo npx playwright install-deps              # Install system dependencies (Linux)
chmod +x ./run-playwright.cjs                 # Fix script permissions

# Clean reinstall
npm run clean                                  # Clean artifacts
rm -rf node_modules package-lock.json         # Clean dependencies
npm install                                    # Reinstall dependencies
npm run install:browsers                      # Reinstall browsers
```

### Performance Debugging

```bash
# Identify slow tests
npx playwright test --reporter=json | jq '.suites[].tests[] | select(.duration > 10000)'

# Resource monitoring
npx playwright test --workers=1 --timeout=120000  # Single worker, long timeout
WORKERS=1 npm test                             # Force single worker via environment

# Memory issues
node --max-old-space-size=4096 ./node_modules/.bin/playwright test
```

### Network and Connectivity

```bash
# Network debugging
DEBUG=pw:browser:network npm test             # Debug network requests
npx playwright test --trace=on --workers=1    # Capture all network in traces

# Proxy and firewall
HTTP_PROXY=http://proxy:8080 npm test         # Use HTTP proxy
HTTPS_PROXY=https://proxy:8080 npm test       # Use HTTPS proxy
NO_PROXY=localhost,127.0.0.1 npm test         # Bypass proxy for local
```

---

## 🎯 Best Practices

### Daily Development Workflow

```bash
# Before starting work
npm run validate                               # Ensure codebase is healthy
npm run test:local:ui -- --grep "@smoke"      # Quick smoke test

# During development
npm run test:local:ui -- --headed --grep "feature-name"  # Test your feature
npm run format                                 # Format code

# Before committing
npm run validate                               # Full validation
npm run test:local:ui                         # Run UI tests locally
npm run clean                                  # Clean artifacts
```

### CI/CD Best Practices

```bash
# Fast feedback loop
npm test -- --grep "@smoke" --workers=4       # Quick smoke tests first
npm test -- --grep "@regression" --workers=8  # Full regression suite

# Comprehensive testing
npm test --workers=4 --retries=2 --reporter=html,json,junit

# Environment testing
TEST_ENV=staging npm test --reporter=json     # Staging validation
TEST_ENV=production npm test --reporter=html  # Production validation
```

### Performance Optimization

```bash
# Find bottlenecks
npm test -- --reporter=json | jq '.suites[].tests[] | select(.duration > 5000)'

# Optimize execution
npm test -- --workers=50% --grep-invert "@slow"  # Skip slow tests
WORKERS=8 npm test                             # Optimize worker count

# Resource management
npm test -- --workers=4 --max-failures=10     # Balance speed and resources
```

---

## 📚 Command Reference Summary

### Essential Commands

| Command                 | Purpose            | Environment |
| ----------------------- | ------------------ | ----------- |
| `npm test`              | Run all tests      | Production  |
| `npm run test:local`    | Run all tests      | Local       |
| `npm run test:ui`       | Run UI tests       | Production  |
| `npm run test:local:ui` | Run UI tests       | Local       |
| `npm run report:open`   | View test results  | Any         |
| `npm run validate`      | Code quality check | Any         |

### Debug Commands

| Command                       | Purpose            | Use Case        |
| ----------------------------- | ------------------ | --------------- |
| `npm run test:ui -- --headed` | Visual browser     | Development     |
| `npm run test:ui -- --debug`  | Step-through debug | Debugging       |
| `DEBUG=pw:* npm test`         | Full debug output  | Troubleshooting |
| `npx playwright test --ui`    | Interactive runner | Development     |

### Quality Commands

| Command            | Purpose          | When to Use        |
| ------------------ | ---------------- | ------------------ |
| `npm run validate` | Full validation  | Before commit      |
| `npm run lint`     | Check formatting | During development |
| `npm run format`   | Auto-format      | Before commit      |
| `npm run clean`    | Clean artifacts  | Maintenance        |

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the basics**: `npm run validate`
2. **Review setup**: `npm run setup`
3. **Try debug mode**: `npm run test:ui -- --debug`
4. **Check documentation**: Review `docs/` directory
5. **Clean and retry**: `npm run clean && npm run setup`

For more detailed guides, see:

- **[Project Architecture](ARCHITECTURE.md)**
- **[Test Lifecycle](TEST_LIFECYCLE.md)**
- **[Configuration Guide](configs.md)**
- **[Global Setup & Teardown](global.setup.teardown.md)**

---

**Enterprise Test Automation Framework** - Master every command for efficient, reliable test execution! 🚀✨
