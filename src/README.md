# Enterprise Test Automation Framework

A comprehensive test automation framework built with Playwright and TypeScript, designed for enterprise-level testing across UI, API, Accessibility, Security, and Performance testing.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Run all tests
npm test

# Run UI tests only
npm run test:ui

# Run tests with headed browser
npm run test:headed
```

## 📋 Table of Contents

- [Framework Overview](#framework-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Writing Tests](#writing-tests)
- [Testing Types](#testing-types)
- [Scripts](#scripts)
- [Best Practices](#best-practices)
- [Contributing](#contributing)

## 🎯 Framework Overview

This enterprise-grade test automation framework provides:

### ✅ **Multi-Type Testing Support**

- **UI Testing**: Web application testing with Playwright
- **API Testing**: REST/GraphQL API testing and validation
- **Accessibility Testing**: WCAG compliance and accessibility validation
- **Security Testing**: Security vulnerability scanning and validation
- **Performance Testing**: Web performance and load testing

### ✅ **Enterprise Features**

- **Multi-Environment Support**: Dev, Staging, Production configurations
- **Scalable Architecture**: Modular design with separated concerns
- **Type Safety**: Full TypeScript support with comprehensive types
- **Advanced Reporting**: Multiple report formats and custom dashboards
- **CI/CD Integration**: GitHub Actions and enterprise CI/CD support
- **Parallel Execution**: Efficient test execution with configurable workers

### ✅ **Modern Development**

- **Path Mappings**: Clean imports with TypeScript path mappings
- **Configuration Management**: Centralized, environment-aware configuration
- **Code Quality**: Prettier, ESLint, and TypeScript strict mode
- **Documentation**: Comprehensive documentation and examples

## 📁 Project Structure

```
src/
├── core/                     # Core framework components
│   ├── constants.ts          # Framework constants and enums
│   ├── types.ts              # TypeScript type definitions
│   └── index.ts              # Core module exports
├── tests/                    # Test suites organized by type
│   ├── ui/                   # UI tests (Playwright)
│   ├── api/                  # API tests
│   ├── accessibility/        # Accessibility tests
│   ├── security/             # Security tests
│   └── performance/          # Performance tests
├── pages/                    # Page Object Models
├── data/                     # Test data and fixtures
├── fixtures/                 # Test fixtures and mocks
├── utils/                    # Utility functions and helpers
├── reports/                  # Custom reporting components
└── integrations/             # Third-party integrations
```

## 🏗️ Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd enterprise-test-automation-framework
   ```

2. **Install dependencies**

   ```bash
   npm run setup
   ```

3. **Configure environment**

   ```bash
   # Set your environment (optional, defaults to 'dev')
   export NODE_ENV=dev
   ```

4. **Run your first test**
   ```bash
   npm run test:ui
   ```

## ⚙️ Configuration

The framework uses a centralized configuration system supporting multiple environments:

### Environment Configuration

- `configs/base.config.ts` - Base configuration shared across environments
- `configs/dev.config.ts` - Development environment settings
- `configs/staging.config.ts` - Staging environment settings (TODO)
- `configs/production.config.ts` - Production environment settings (TODO)

### Using Configuration

```typescript
import { getCurrentConfig } from '@config/index';

// Get current environment configuration
const config = getCurrentConfig();

// Access configuration values
const baseURL = config.environment.baseURL;
const timeout = config.execution.timeout;
```

### Environment Variables

```bash
# Set environment
NODE_ENV=dev|staging|production

# Override specific settings
TEST_ENV=dev
BASE_URL=https://custom.example.com
```

## 📝 Writing Tests

### UI Tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';

test.describe('Login Tests', () => {
  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'password');
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### API Tests

```typescript
import { test, expect } from '@playwright/test';
import { APIRequest } from '@core/types';

test.describe('API Tests', () => {
  test('should get user data', async ({ request }) => {
    const response = await request.get('/api/users/1');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.id).toBe(1);
  });
});
```

### Test Organization

- Use descriptive test names
- Group related tests with `test.describe()`
- Add appropriate tags: `@smoke`, `@regression`, `@critical`
- Include test metadata and documentation

## 🧪 Testing Types

### UI Testing

- Cross-browser testing (Chrome, Firefox, Safari)
- Responsive design testing
- Visual regression testing
- End-to-end workflows

### API Testing

- REST API testing
- GraphQL testing
- Authentication testing
- Response validation
- Schema validation

### Accessibility Testing

- WCAG compliance testing
- Screen reader compatibility
- Color contrast validation
- Keyboard navigation testing

### Security Testing

- Vulnerability scanning
- Authentication testing
- Authorization testing
- Data validation testing

### Performance Testing

- Page load performance
- Core Web Vitals
- Network performance
- Resource optimization

## 📜 Scripts

### Test Execution

```bash
npm test                     # Run all tests
npm run test:ui              # Run UI tests only
npm run test:api             # Run API tests only
npm run test:accessibility   # Run accessibility tests
npm run test:security        # Run security tests
npm run test:performance     # Run performance tests
```

### Environment-Specific

```bash
npm run test:dev             # Run tests in dev environment
npm run test:staging         # Run tests in staging environment
npm run test:production      # Run tests in production environment
```

### Test Types

```bash
npm run test:smoke           # Run smoke tests
npm run test:regression      # Run regression tests
npm run test:headed          # Run with headed browser
npm run test:debug           # Run in debug mode
```

### Utilities

```bash
npm run report:open          # Open test report
npm run format               # Format code
npm run lint                 # Check code quality
npm run type-check           # Check TypeScript types
npm run clean                # Clean test artifacts
```

## 🎯 Best Practices

### Code Organization

- Use Page Object Model for UI tests
- Keep tests focused and independent
- Use meaningful test descriptions
- Group related tests logically

### Configuration

- Use environment-specific configurations
- Externalize test data and credentials
- Use feature flags for conditional testing
- Validate configurations before test execution

### Error Handling

- Use appropriate assertions
- Handle timeouts gracefully
- Provide meaningful error messages
- Log relevant debugging information

### Performance

- Run tests in parallel when possible
- Use efficient selectors
- Minimize test dependencies
- Clean up test data

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make your changes**
4. **Run tests and validation**
   ```bash
   npm run validate
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add new feature"
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/new-feature
   ```
7. **Create a Pull Request**

## 📚 Documentation

- [Foundation Setup](../docs/FOUNDATION_SETUP.md) - Framework architecture and setup
- [Configuration Guide](../docs/CONFIGURATION.md) - Configuration management (TODO)
- [API Testing Guide](../docs/API_TESTING.md) - API testing documentation (TODO)
- [Accessibility Testing Guide](../docs/ACCESSIBILITY.md) - Accessibility testing guide (TODO)
- [Security Testing Guide](../docs/SECURITY.md) - Security testing documentation (TODO)
- [Performance Testing Guide](../docs/PERFORMANCE.md) - Performance testing guide (TODO)

## 🔧 Troubleshooting

### Common Issues

1. **Import Errors**

   - Ensure path mappings are configured in `tsconfig.json`
   - Check that files exist in the expected locations

2. **Configuration Errors**

   - Validate configuration with `npm run validate`
   - Check environment variables are set correctly

3. **Test Failures**
   - Review test logs and screenshots
   - Check environment-specific configurations
   - Verify test data and dependencies

### Getting Help

- Check the documentation in `docs/`
- Review configuration examples in `configs/`
- Examine existing tests for patterns
- Open an issue for bug reports or feature requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Enterprise Test Automation Framework** - Building reliable, scalable, and maintainable test automation for enterprise applications.


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

