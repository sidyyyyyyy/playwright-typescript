# Jenkins Setup for Agent Evaluation Test Suite

This document provides comprehensive instructions for setting up Jenkins to run the Agent Evaluation Test Suite.

## 📋 Prerequisites

### System Requirements
- Jenkins 2.400+ with Pipeline plugin
- Node.js 18+ installed on Jenkins agent
- Docker (optional, for containerized execution)
- Git access to the repository

### Required Jenkins Plugins
- Pipeline
- HTML Publisher
- Workspace Cleanup
- Timestamper
- AnsiColor

## 🚀 Quick Setup

### 1. Create New Pipeline Job

1. Go to Jenkins Dashboard
2. Click "New Item"
3. Enter job name: `agent-evaluation-tests`
4. Select "Pipeline" and click OK

### 2. Configure Pipeline

#### Option A: Use Jenkinsfile (Recommended)
1. In the Pipeline section, select "Pipeline script from SCM"
2. Choose "Git" as SCM
3. Enter repository URL
4. Set branch to `main` or your desired branch
5. Set script path to `Jenkinsfile`

#### Option B: Use Job Configuration XML
1. Copy the contents of `jenkins-job-config.xml`
2. In Jenkins, go to "Manage Jenkins" → "Manage Nodes"
3. Select your agent and click "Configure"
4. Use the XML configuration

### 3. Environment Setup

#### Required Environment Variables
Create a `.env` file in your repository root with:

```bash
EMAIL=your-email@example.com
PASSWORD=your-password
INSTANCE=r2d2demo.ushur.dev
```

#### Jenkins Credentials (Recommended)
1. Go to "Manage Jenkins" → "Manage Credentials"
2. Add new credentials:
   - Kind: "Secret text"
   - ID: `ushur-email`
   - Secret: your email
3. Repeat for password with ID: `ushur-password`

### 4. Configure Job Parameters

The pipeline supports the following parameters:

| Parameter | Description | Default | Options |
|-----------|-------------|---------|---------|
| `TEST_SUITE` | Which test suite to run | `both` | `both`, `client-services`, `robo-sim` |
| `BROWSER` | Browser to run tests on | `chromium` | `chromium`, `firefox`, `webkit`, `all` |
| `HEADLESS` | Run in headless mode | `true` | `true`, `false` |
| `GENERATE_REPORT` | Generate HTML reports | `true` | `true`, `false` |
| `TEST_TIMEOUT` | Test timeout in ms | `300000` | Any positive integer |

## 🏃‍♂️ Running Tests

### Manual Execution
1. Go to the job page
2. Click "Build with Parameters"
3. Select desired parameters
4. Click "Build"

### Scheduled Execution
Add a cron trigger in the job configuration:
```groovy
triggers {
    cron('0 2 * * *') // Run daily at 2 AM
}
```

### Webhook Trigger
Configure webhook to trigger on code changes:
1. In job configuration, add "GitHub hook trigger for GITScm polling"
2. Configure webhook in your Git repository

## 📊 Test Reports

### HTML Reports
- **Location**: `reports/` directory
- **Access**: Available in Jenkins build artifacts
- **Content**: Detailed test results, screenshots, traces

### JSON Reports
- **Location**: `reports/*/results.json`
- **Usage**: For programmatic analysis
- **Content**: Structured test data

### Screenshots
- **Location**: `reports/*/screenshots/`
- **Content**: Visual evidence of test execution
- **Naming**: `test-name-timestamp.png`

## 🔧 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Found
```bash
Error: .env file not found
```
**Solution**: Ensure `.env` file exists in repository root with required variables.

#### 2. Playwright Browsers Not Installed
```bash
Error: Browser not found
```
**Solution**: The pipeline automatically installs browsers, but ensure the Jenkins agent has sufficient disk space.

#### 3. Test Timeouts
```bash
Error: Test timeout exceeded
```
**Solution**: Increase `TEST_TIMEOUT` parameter or check network connectivity.

#### 4. Permission Issues
```bash
Error: Permission denied
```
**Solution**: Ensure Jenkins agent has proper permissions to create files and directories.

### Debug Mode

To run tests in debug mode (headed browser):
1. Set `HEADLESS` parameter to `false`
2. Ensure Jenkins agent has display capabilities
3. Consider using Docker with X11 forwarding

## 🐳 Docker Support

### Using Docker Compose
```bash
# Run all tests
docker-compose up agent-evaluation-tests

# Run specific test suite
docker-compose up client-services-test
docker-compose up robo-sim-test

# Run in debug mode
docker-compose up debug-tests
```

### Using Dockerfile
```bash
# Build image
docker build -t agent-evaluation-tests .

# Run tests
docker run --env-file .env agent-evaluation-tests

# Run with custom parameters
docker run --env-file .env agent-evaluation-tests ./run-tests.sh both chromium true
```

## 📈 Monitoring and Alerts

### Build Notifications
Configure email notifications:
1. In job configuration, add "Post-build Actions"
2. Select "Email Notification"
3. Configure recipients and conditions

### Slack Integration
Add Slack notifications:
1. Install "Slack Notification" plugin
2. Configure Slack webhook
3. Add notification in pipeline

### Performance Monitoring
Monitor test execution:
- Build duration trends
- Test success rates
- Resource usage patterns

## 🔄 Continuous Integration

### Branch Protection
Configure branch protection rules:
1. Require status checks to pass
2. Require up-to-date branches
3. Include the Jenkins job as required check

### Parallel Execution
The pipeline runs tests in parallel by default:
- Client Services and RoboSim tests run simultaneously
- Each browser runs in separate stage
- Optimizes execution time

### Artifact Management
- Reports are automatically archived
- Screenshots and traces preserved
- HTML reports published for easy access

## 📚 Additional Resources

### Test Documentation
- [Client Services Test](./src/tests/faq-evaluation/client-services-agent-evaluation.spec.ts)
- [RoboSim Test](./src/tests/faq-evaluation/robo-sim-agent-preview-integration.spec.ts)

### Configuration Files
- [Jenkinsfile](./Jenkinsfile) - Main pipeline definition
- [run-tests.sh](./run-tests.sh) - Local test runner
- [docker-compose.yml](./docker-compose.yml) - Docker configuration

### Support
For issues or questions:
1. Check Jenkins build logs
2. Review test reports
3. Consult troubleshooting section
4. Contact development team

---

**Last Updated**: $(date)
**Version**: 1.0.0
