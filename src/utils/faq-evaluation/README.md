# FAQ Evaluation Utilities

This directory contains refactored utilities for running FAQ evaluation tests across different agent types (PolicyHolder, ClientServices, HealthPlan) in a unified and maintainable way.

## Overview

The refactoring eliminates code duplication by providing:
- **Common test runner** that handles all agent types
- **Reusable utility classes** for PDF processing, question generation, and evaluation
- **Centralized configuration** for easy maintenance
- **Unified test execution** with comprehensive reporting

## Architecture

```
src/utils/faq-evaluation/
├── index.ts              # Main exports
├── test.utils.ts         # Test runner and execution logic
├── synthesis.utils.ts    # PDF processing and question generation
├── metrics.utils.ts      # Response evaluation and scoring
├── login.utils.ts        # Authentication utilities
├── config.ts             # Configuration management
└── README.md             # This documentation
```

## Key Components

### 1. BaseFAQTestRunner
The main test runner class that handles:
- Test setup and configuration
- PDF content loading and question generation
- Agent navigation and login
- Chat interface interaction
- Response evaluation and scoring
- Report generation

### 2. Utility Classes
- **MockPDFLoader**: Simulates PDF loading for testing
- **QuestionGeneratorFactory**: Creates question generators for different agent types
- **FAQEvaluatorFactory**: Creates evaluators for different agent types
- **FAQReportGenerator**: Generates comprehensive evaluation reports

### 3. Configuration Management
- **Environment-specific configs**: Development, staging, production
- **Agent-specific configs**: PolicyHolder, ClientServices, HealthPlan
- **Custom configs**: High-volume, quick test, comprehensive testing

## Usage Examples

### Basic Single Agent Test
```typescript
import { FAQTestRunnerFactory, getAgentConfig } from '@utils/faq-evaluation';

test('PolicyHolder FAQ Evaluation', async ({ page }) => {
  const config = getAgentConfig('policyholder', 'development');
  const testRunner = FAQTestRunnerFactory.createRunner(page, config);
  
  const results = await testRunner.runTest();
  console.log(`Score: ${results.overallScore}/5.0`);
});
```

### Custom Configuration
```typescript
import { createCustomConfig, CUSTOM_AGENT_CONFIGS } from '@utils/faq-evaluation';

const config = createCustomConfig(
  'policyholder',
  CUSTOM_AGENT_CONFIGS.highVolume,
  'development'
);
```

### Unified Multi-Agent Testing
```typescript
import { getAllAgentConfigs } from '@utils/faq-evaluation';

const agentConfigs = getAllAgentConfigs('development');

for (const config of agentConfigs) {
  test(`${config.agentType} Evaluation`, async ({ page }) => {
    const testRunner = FAQTestRunnerFactory.createRunner(page, config);
    const results = await testRunner.runTest();
    // Process results...
  });
}
```

## Test Files

### Refactored Test Files
- `policyholder-faq-evaluation.spec.ts` - Uses utilities instead of duplicated code
- `clientservices-faq-evaluation.spec.ts` - Uses utilities instead of duplicated code
- `unified-faq-evaluation.spec.ts` - New unified test runner for all agent types

### Before vs After
**Before**: Each test file had ~500+ lines with duplicated mock classes, evaluators, and test logic
**After**: Each test file is ~50 lines, using shared utilities and configuration

## Benefits of Refactoring

1. **Eliminated Code Duplication**: Reduced from ~1000+ lines to ~200 lines
2. **Improved Maintainability**: Changes to test logic only need to be made in one place
3. **Better Configuration Management**: Centralized agent and environment configurations
4. **Enhanced Reusability**: Utilities can be used across different test scenarios
5. **Consistent Test Execution**: All agent types use the same test flow and evaluation logic
6. **Easier Debugging**: Common issues can be fixed in the utility classes
7. **Better Testing**: Utilities can be unit tested independently

## Configuration Options

### Environment Configurations
- **Development**: 3 questions, 5-minute timeout
- **Staging**: 5 questions, 5-minute timeout  
- **Production**: 5 questions, 10-minute timeout

### Custom Configurations
- **High Volume**: 10 questions, 10-minute timeout
- **Quick Test**: 1 question, 2-minute timeout
- **Comprehensive**: 5 questions, 15-minute timeout

### Agent Types
- **PolicyHolder**: Insurance policy management and support
- **ClientServices**: General customer service and support
- **HealthPlan**: Healthcare plan specific questions

## Running Tests

### Individual Agent Tests
```bash
# Run specific agent test
npx playwright test src/tests/faq-evaluation/policyholder-faq-evaluation.spec.ts

# Run client services test
npx playwright test src/tests/faq-evaluation/clientservices-faq-evaluation.spec.ts
```

### Unified Testing
```bash
# Run all agent tests individually
npx playwright test src/tests/faq-evaluation/unified-faq-evaluation.spec.ts

# Run comprehensive multi-agent test
npx playwright test src/tests/faq-evaluation/unified-faq-evaluation.spec.ts -g "Comprehensive"
```

## Extending the Framework

### Adding New Agent Types
1. Add agent configuration to `config.ts`
2. Create question generator in `synthesis.utils.ts`
3. Create evaluator in `metrics.utils.ts`
4. Update factory classes to handle the new agent type

### Adding New Evaluation Metrics
1. Extend the base evaluator class in `metrics.utils.ts`
2. Add new scoring methods
3. Update the evaluation logic in the test runner

### Custom Test Scenarios
1. Create new configuration presets in `config.ts`
2. Use `createCustomConfig()` to build custom test configurations
3. Extend `BaseFAQTestRunner` for specialized test scenarios

## Troubleshooting

### Common Issues
1. **Chat Interface Not Found**: Check iframe selectors in `waitForChatInterface()`
2. **Login Failures**: Verify environment variables and login selectors
3. **Response Timeouts**: Adjust timeout values in configuration
4. **PDF Loading Errors**: Check file paths and mock data

### Debug Mode
Enable verbose logging by setting environment variables:
```bash
export PLAYWRIGHT_DEBUG=1
export FAQ_EVALUATION_DEBUG=true
```

## Future Enhancements

1. **Parallel Execution**: Run multiple agent tests simultaneously
2. **Performance Metrics**: Add response time and throughput measurements
3. **Data Export**: Export results to CSV/JSON for analysis
4. **Visual Reports**: Generate HTML reports with charts and graphs
5. **Integration Testing**: Add API-level testing capabilities
6. **Mock Data Management**: Centralized mock data and test scenarios
