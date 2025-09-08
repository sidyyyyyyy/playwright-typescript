# 🎭 Enterprise Test Automation Framework

_Author: Anand Sogalad_

**A comprehensive, enterprise-grade test automation framework built with Playwright and TypeScript for UI, API, Accessibility, Security, and Performance testing.**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Project Setup](#project-setup)
4. [Quick Start](#quick-start)
5. [Test Execution](#test-execution)
6. [Project Structure](#project-structure)
7. [Configuration](#configuration)
8. [Development](#development)
9. [Documentation](#documentation)
10. [Contributing](#contributing)
11. [Support](#support)

---

## 🌟 Overview

This framework is designed for enterprise-scale test automation with the following principles:

- **Scalability**: Supports parallel execution with user pool management
- **Reliability**: Built-in retry mechanisms and robust error handling
- **Maintainability**: Clean architecture with comprehensive documentation
- **Flexibility**: Environment-specific configurations and multiple test types
- **Enterprise Ready**: Redis integration, comprehensive reporting, and CI/CD support

### What Makes This Framework Special?

- **🚀 Multi-Type Testing**: UI, API, Accessibility, Security, Performance all in one place
- **⚡ Parallel Execution**: Redis-based user pool for true parallel testing without conflicts
- **🔧 Smart Configuration**: Environment-aware configuration management system
- **📊 Rich Reporting**: Comprehensive HTML reports with traces, videos, and screenshots
- **🎯 Developer Experience**: Type-safe utilities, comprehensive JSDoc, and intuitive APIs
- **🏢 Enterprise Features**: Integration-ready, scalable architecture, monitoring support

---

## ✨ Features

### Core Capabilities

- **Multi-Browser Testing**: Chromium, Firefox, and WebKit support
- **Cross-Platform**: Windows, macOS, and Linux compatibility
- **Parallel Execution**: Redis-managed user pools for conflict-free parallel testing
- **Environment Management**: Staging, development, production, and custom environments
- **Smart Utilities**: Comprehensive browser utilities for interactions and assertions

### Testing Types

- **🌐 UI Testing**: Component, integration, and end-to-end web application testing
- **🔌 API Testing**: RESTful API validation with schema validation
- **♿ Accessibility Testing**: WCAG compliance and accessibility standards validation
- **🔒 Security Testing**: Security vulnerability scanning and validation
- **⚡ Performance Testing**: Lighthouse integration and performance metrics

### Enterprise Features

- **📈 Comprehensive Reporting**: HTML, JSON, JUnit formats with rich media
- **🔄 CI/CD Integration**: GitHub Actions ready with artifact support
- **📊 Monitoring Ready**: Built-in metrics and logging for monitoring systems
- **🗄️ Redis Integration**: Distributed user management and session handling
- **🔧 Configuration Management**: Environment-specific settings with validation

---

## 🛠️ Project Setup

### Prerequisites

- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 10.0.0 or higher
- **Redis**: For user pool management (optional for local development)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd playwright-typescript
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install Playwright browsers**:

   ```bash
   npm run install:browsers
   ```

4. **Verify installation**:
   ```bash
   npm run validate
   ```

### Alternative: Complete Setup

For a one-command setup:

```bash
npm run setup
```

This will install dependencies and browsers automatically.

---

## 🚀 Quick Start

### Run Your First Test

```bash
# Run all tests (recommended first run)
npm test:local -- --baseURL=<baseurl>

# Run UI tests only
npm run test:local:ui -- --baseURL=<baseurl>

# Run with visible browser (great for first-time setup)
npm run test:ui -- -- --baseURL=<baseurl> --headed
```

### View Test Results

```bash
# Open HTML report
npm run report:open

# Generate fresh report
npm run report:generate
```

### Basic Example Commands

```bash
# Quick smoke tests
npm run test:local:ui -- --baseURL=<baseurl> --grep "@smoke"

# Debug mode for troubleshooting
npm run test:local:ui -- --baseURL=<baseurl> --debug

# Run specific test file
npm run test:local:ui src/tests/ui/login.spec.ts -- --baseURL=<baseurl>

# Run with custom environment
npm run test:local:ui
```

---

## 🎯 Test Execution

### Environment-Specific Testing

The framework supports multiple environments with automatic configuration:

```bash
# Local environment (development)
npm run test:local                    # All tests locally
npm run test:local:ui                 # UI tests locally
npm run test:local:api                # API tests locally

# Default environment (production - ci)
npm test                              # All tests in production
npm run test:ui                       # UI tests in production
npm run test:api                      # API tests in production
```

### Test Categories

```bash
# UI Testing
npm run test:ui                       # All UI tests
npm run test:local:ui                 # UI tests locally

# API Testing
npm run test:api                      # All API tests
npm run test:local:api                # API tests locally

# Accessibility Testing
npm run test:accessibility            # All accessibility tests
npm run test:local:accessibility      # Accessibility tests locally

# Security Testing
npm run test:security                 # All security tests
npm run test:local:security           # Security tests locally

# Performance Testing
npm run test:performance              # All performance tests
npm run test:local:performance        # Performance tests locally

# Integration Testing
npm run test:integration              # All integration tests
npm run test:local:integration        # Integration tests locally

# End-to-End Testing
npm run test:e2e                      # All E2E tests
npm run test:local:e2e                # E2E tests locally

# Customer Testing
npm run test:customer                 # All customer tests
npm run test:local:customer           # Customer tests locally
```

### Advanced Execution Options

```bash
# Debugging and Development
npm run test:ui -- --headed          # Run with visible browser
npm run test:ui -- --debug           # Debug mode with inspector
npm run test:ui -- --trace=on        # Always capture traces

# Performance and Parallel Execution
WORKERS=10 npm run test:ui           # Use 10 parallel workers
npm run test:ui -- --workers=50%    # Use 50% of CPU cores

# Filtering and Selection
npm run test:ui -- --grep "login"   # Run tests matching "login"
npm run test:ui -- --grep "@smoke"  # Run smoke tests only
npm run test:ui -- --grep-invert "@slow"  # Exclude slow tests

# Reporting Options
npm run test:ui -- --reporter=list  # List format output
npm run test:ui -- --reporter=json  # JSON format output
npm run test:ui -- --reporter=html,json  # Multiple formats
```

### Environment Variables

```bash
# Custom environment settings
TEST_ENV=staging npm test            # Use staging environment
BASE_URL=https://custom.com npm test # Override base URL

# Debug settings
PWDEBUG=1 npm test                   # Enable debug mode
DEBUG=pw:api npm test               # Debug API calls
DEBUG=pw:* npm test                 # Debug everything

# Performance settings
WORKERS=8 npm test                   # Override worker count
TIMEOUT=60000 npm test              # Custom timeout
```

---

## 📁 Project Structure

```
playwright-typescript/
├── configs/                      # Configuration management
│   ├── base.config.ts            # Base configuration
│   ├── ci.config.ts              # CI-specific overrides
│   ├── local.config.ts           # Local development overrides
│   ├── config.schema.ts          # Configuration validation
│   ├── types.ts                  # Configuration types
│   └── index.ts                  # Configuration loader
├── docs/                         # Comprehensive documentation
│   ├── api.utils.md              # API utilities guide
│   ├── browser.utils.md          # Browser utilities guide
│   ├── global.setup.teardown.md  # Global lifecycle guide
│   ├── integrations.md           # API integrations guide
│   ├── redis.utils.md            # Redis utilities guide
│   └── TEST_COMMANDS.md          # Complete command reference
├── src/
│   ├── core/                     # Core framework components
│   │   ├── constants/            # Application constants
│   │   ├── enums/                # Type-safe enumerations
│   │   └── interfaces/           # TypeScript interfaces
│   ├── data/                     # Test data management
│   ├── fixtures/                 # Playwright fixtures
│   ├── integrations/             # API integration layer
│   ├── pages/                    # Page Object Models
│   ├── tests/                    # Test suites by category
│   │   ├── ui/                   # UI tests
│   │   ├── api/                  # API tests
│   │   ├── accessibility/        # Accessibility tests
│   │   ├── security/             # Security tests
│   │   ├── performance/          # Performance tests
│   │   ├── integration/          # Integration tests
│   │   ├── e2e/                  # End-to-end tests
│   │   └── customer/             # Customer-specific tests
│   └── utils/                    # Utility libraries
│       ├── api/                  # API utilities
│       ├── browser/              # Browser interaction utilities
│       └── redis/                # Redis and user pool management
├── reports/                      # Test execution reports
│   ├── html/                     # HTML reports
│   ├── test-results/             # Raw test results
│   ├── screenshots/              # Screenshot artifacts
│   ├── videos/                   # Video recordings
│   └── traces/                   # Playwright traces
├── global.setup.ts               # Global test setup
├── global.teardown.ts            # Global test cleanup
├── playwright.config.ts          # Main Playwright configuration
└── run-playwright.cjs            # Custom test runner
```

---

## ⚙️ Configuration

### Environment Configuration

The framework uses a sophisticated configuration system that automatically loads the right settings based on your environment:

1. **Base Configuration** (`configs/base.config.ts`): Default settings for all environments
2. **Environment Overrides**: Specific configurations for different environments
3. **Local Overrides** (`configs/local.config.ts`): Local development customizations

### Environment Variables

Key environment variables the framework recognizes:

```bash
# Environment Selection
TEST_ENV=local|staging|production    # Target environment
NODE_ENV=development|production      # Node environment

# URL Configuration
BASE_URL=https://your-app.com       # Override base URL

# Test Execution
WORKERS=4                           # Number of parallel workers
TIMEOUT=30000                       # Default timeout in milliseconds
RETRIES=2                          # Number of retry attempts

# Debug and Development
PWDEBUG=1                          # Enable Playwright debug mode
DEBUG=pw:*                         # Debug Playwright internals
HEADED=true                        # Show browser during execution

# CI/CD
CI=true                            # Enable CI mode
```

### Redis Configuration

For parallel testing with user pools:

```bash
# Redis Connection
REDIS_HOST=localhost               # Redis server host
REDIS_PORT=6379                   # Redis server port
REDIS_PASSWORD=your-password       # Redis password (if required)
REDIS_DB=0                        # Redis database number
```

---

## 👨‍💻 Development

### Code Quality

```bash
# Type checking
npm run type-check                 # Validate TypeScript

# Linting and formatting
npm run lint                       # Check code formatting
npm run format                     # Auto-format code
npm run eslint                     # Run ESLint checks
npm run eslint:fix                 # Fix ESLint issues

# Comprehensive validation
npm run validate                   # Run type-check + lint
```

### Building

```bash
# Build TypeScript
npm run build                      # Compile to JavaScript

# Check Node.js version
npm run node:version              # Display Node.js version
```

### Cleanup

```bash
# Clean artifacts
npm run clean                      # Remove all generated files

# Clean specific artifacts
rm -rf reports/test-results        # Clean test results only
rm -rf reports/screenshots         # Clean screenshots only
rm -rf reports/videos              # Clean videos only
```

### Interactive Development

```bash
# Record new tests
npx playwright codegen             # Record interactions
npx playwright codegen https://example.com  # Record on specific site

# Interactive test runner
npx playwright test --ui           # Run tests interactively

# Debug specific tests
npx playwright test --debug src/tests/ui/login.spec.ts
```

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Core Documentation

- **[Test Commands Reference](docs/TEST_COMMANDS.md)**: Complete guide to all available commands
- **[Configuration Guide](docs/configs.md)**: Environment and configuration management
- **[Global Setup & Teardown](docs/global.setup.teardown.md)**: Test lifecycle management

### Utility Guides

- **[API Utilities](docs/api.utils.md)**: API testing and integration utilities
- **[Browser Utilities](docs/browser.utils.md)**: Browser interaction and assertion utilities
- **[Redis Utilities](docs/redis.utils.md)**: User pool and Redis management
- **[Integrations Guide](docs/integrations.md)**: API integration layer

### Framework Guides

- **[Constants Guide](docs/constants.md)**: Framework constants and configurations
- **[Enums Guide](docs/enums.md)**: Type-safe enumerations
- **[Interfaces Guide](docs/interfaces.md)**: TypeScript interfaces and types
- **[Data Management](docs/data.md)**: Test data handling
- **[Fixtures Guide](docs/fixtures.md)**: Playwright fixtures and setup

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the established patterns
4. **Run validation**: `npm run validate`
5. **Run tests**: `npm test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Standards

- **TypeScript**: Use strict typing and interfaces
- **Documentation**: Follow JSDoc patterns established in the codebase
- **Testing**: Add tests for new functionality
- **Formatting**: Use `npm run format` before committing
- **Validation**: Ensure `npm run validate` passes

### Architecture Principles

- **Single Responsibility**: Each utility class has a focused purpose
- **Type Safety**: Leverage TypeScript for compile-time safety
- **Extensibility**: Design for easy extension and customization
- **Documentation**: Code should be self-documenting with comprehensive JSDoc

---

## 🆘 Support

### Getting Help

1. **Documentation**: Check the comprehensive docs in the `docs/` directory
2. **Issues**: Create an issue in the repository for bugs or feature requests
3. **Discussions**: Use GitHub Discussions for questions and community help

### Troubleshooting

**Common Issues:**

1. **Browser Installation Problems**:

   ```bash
   npm run install:browsers         # Reinstall browsers
   npx playwright install --with-deps  # Install with system dependencies
   ```

2. **Configuration Issues**:

   ```bash
   npm run type-check              # Validate configuration
   npm run validate                # Check overall setup
   ```

3. **Test Failures**:

   ```bash
   npm run test:ui -- --debug      # Debug specific failures
   npm run test:ui -- --trace=on   # Capture detailed traces
   npx playwright show-report      # View detailed reports
   ```

4. **Performance Issues**:
   ```bash
   WORKERS=1 npm test              # Disable parallel execution
   npm run test:ui -- --workers=2  # Reduce worker count
   ```

### Health Checks

```bash
# Verify framework setup
npm run validate                    # Complete validation
npm run node:version               # Check Node.js version
npx playwright --version          # Check Playwright version

# Test basic functionality
npm run test:ui -- --grep "@smoke"  # Run smoke tests
npm run report:generate            # Test report generation
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Playwright Team**: For the amazing testing framework
- **TypeScript Team**: For type safety and developer experience
- **Enterprise Test Community**: For best practices and patterns
- **Contributors**: All who have contributed to making this framework better

---

**Happy Testing! 🎭✨**

_For detailed command references, architecture guides, and advanced usage, please refer to the comprehensive documentation in the `docs/` directory._


Agent Creation [R2D2]
**Execution command to create agent of default configuration : 
   npx playwright test src/tests/api/agent.api.spec.ts

**Initiate an already existing agent:
   AGENT_HANDLE=3157054 npx playwright test src/tests/api/agent.api.spec.ts

**Execution command for creating dynamic agents [get input from command line]

--HealthPlan--

AGENT_TYPE=HealthPlan \
AGENT_DESCRIPTION="The Health Plan Member Engagement System is designed to efficiently manage member inquiries and enhance the experience of health plan services. Whether members need assistance with benefits, claims, billing, or any other aspect of their health plan, this intuitive system is ready to help. Members can simply submit their inquiries, and the advanced AI technology will swiftly connect them with the information and support they need. The system is committed to ensuring that interactions with the health plan are seamless, informative, and satisfying." \
FRIENDLY_NAME="Friendly Farah" \
GREET_MESSAGE="Hi there! I'm here to make navigating your health journey simple and stress-free—how can I help today?" \
USE_CASE_TEMPLATE=healthplan_001 \
CAP_NAME="Knowledge Base" \
CAP_INDEX=0 \
TASK_ID=task_002 \
TASK_NAME="Update Address" \
PERSONA_ID=persona_001 \
TONE=Friendly \
FORMALITY=Casual \
EMPATHY=High \
READABILITY="Grade 6" \
npx playwright test src/tests/api/agent.api.spec.ts

--ClientServices--

AGENT_TYPE=ClientServices \
AGENT_DESCRIPTION="The Client Services Engagement System supports banking customers by answering questions about account features, fee explanations, debit or credit card issues, basic product comparisons, and everyday transaction guidance. Clients simply ask their questions and the system promptly provides accurate information or next‑step directions. The goal is to make every interaction with the financial institution seamless, informative, and satisfying for each client." \
FRIENDLY_NAME="Gentle Jamie" \
GREET_MESSAGE="Hello! Finding your way through the complexities of your options can be tough. I'm here to help." \
USE_CASE_TEMPLATE=clientservices_001 \
CAP_NAME="Knowledge Base" \
CAP_INDEX=0 \
TASK_ID=task_002 \
TASK_NAME="Update Address" \
PERSONA_ID=persona_006 \
TONE=Professional FORMALITY=Casual EMPATHY=Low READABILITY="College Readability" \
npx playwright test src/tests/api/agent.api.spec.ts

--PolicyHolder--

AGENT_TYPE=PolicyHolder \
AGENT_DESCRIPTION="The Policyholder Engagement System helps insurance customers navigate their policies by clarifying coverage, explaining billing, guiding them on claim filing and status timelines, and answering endorsement questions. Policyholders can ask any policy-related question and receive precise information or step-by-step guidance. The system is committed to making every interaction with the insurer seamless, informative, and satisfying for policyholders." \
FRIENDLY_NAME="Factual Fred" \
GREET_MESSAGE="Hello. I'm ready to provide information — what do you need assistance with?" \
USE_CASE_TEMPLATE=policyholder_001 \
CAP_NAME="Knowledge Base" \
CAP_INDEX=0 \
TASK_ID=task_002 \
TASK_NAME="Update Address" \
PERSONA_ID=persona_002 \
TONE=Professional FORMALITY=Casual EMPATHY=Low READABILITY="College Readability" \
npx playwright test src/tests/api/agent.api.spec.ts

