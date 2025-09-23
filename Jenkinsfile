pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        PLAYWRIGHT_BROWSERS_PATH = '0'
        CI = 'true'
    }
    
    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['both', 'client-services', 'robo-sim'],
            description: 'Select which test suite to run'
        )
        choice(
            name: 'BROWSER',
            choices: ['chromium', 'firefox', 'webkit', 'all'],
            description: 'Select browser(s) to run tests on'
        )
        booleanParam(
            name: 'HEADLESS',
            defaultValue: true,
            description: 'Run tests in headless mode'
        )
        booleanParam(
            name: 'GENERATE_REPORT',
            defaultValue: true,
            description: 'Generate HTML report after test completion'
        )
        string(
            name: 'TEST_TIMEOUT',
            defaultValue: '300000',
            description: 'Test timeout in milliseconds (default: 5 minutes)'
        )
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '🔍 Checking out source code...'
                checkout scm
            }
        }
        
        stage('Environment Setup') {
            steps {
                echo '🔧 Setting up environment...'
                script {
                    // Check if .env file exists
                    if (!fileExists('.env')) {
                        error '❌ .env file not found. Please ensure environment variables are configured.'
                    }
                    
                    // Display environment info
                    sh '''
                        echo "📋 Environment Information:"
                        echo "Node.js version: $(node --version)"
                        echo "NPM version: $(npm --version)"
                        echo "Working directory: $(pwd)"
                        echo "Available memory: $(free -h | grep Mem)"
                        echo "Available disk space: $(df -h .)"
                    '''
                }
            }
        }
        
        stage('Dependencies Installation') {
            steps {
                echo '📦 Installing dependencies...'
                sh '''
                    echo "Installing Node.js dependencies..."
                    npm ci
                    
                    echo "Installing Playwright browsers..."
                    npx playwright install --with-deps
                    
                    echo "Verifying Playwright installation..."
                    npx playwright --version
                '''
            }
        }
        
        stage('Environment Validation') {
            steps {
                echo '🔐 Validating environment variables...'
                sh '''
                    echo "Checking required environment variables..."
                    if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
                        echo "❌ Missing required environment variables: EMAIL, PASSWORD"
                        echo "Please ensure these are set in Jenkins credentials or environment"
                        exit 1
                    fi
                    echo "✅ Environment variables validated"
                '''
            }
        }
        
        stage('Test Execution') {
            parallel {
                stage('Client Services Agent Evaluation') {
                    when {
                        anyOf {
                            params.TEST_SUITE == 'both'
                            params.TEST_SUITE == 'client-services'
                        }
                    }
                    steps {
                        echo '🤖 Running Client Services Agent Evaluation...'
                        script {
                            def browserList = params.BROWSER == 'all' ? ['chromium', 'firefox', 'webkit'] : [params.BROWSER]
                            
                            for (browser in browserList) {
                                echo "🌐 Running tests on ${browser}..."
                                
                                sh """
                                    echo "Starting Client Services test on ${browser}..."
                                    npx playwright test src/tests/faq-evaluation/client-services-agent-evaluation.spec.ts \\
                                        --project=${browser} \\
                                        --timeout=${params.TEST_TIMEOUT} \\
                                        ${params.HEADLESS ? '--headed=false' : '--headed=true'} \\
                                        --reporter=html,json \\
                                        --output-dir=reports/client-services-${browser}
                                """
                            }
                        }
                    }
                    post {
                        always {
                            echo '📊 Client Services test completed'
                            archiveArtifacts artifacts: 'reports/client-services-*/**', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('RoboSim Agent Preview Integration') {
                    when {
                        anyOf {
                            params.TEST_SUITE == 'both'
                            params.TEST_SUITE == 'robo-sim'
                        }
                    }
                    steps {
                        echo '🤖 Running RoboSim Agent Preview Integration...'
                        script {
                            def browserList = params.BROWSER == 'all' ? ['chromium', 'firefox', 'webkit'] : [params.BROWSER]
                            
                            for (browser in browserList) {
                                echo "🌐 Running tests on ${browser}..."
                                
                                sh """
                                    echo "Starting RoboSim test on ${browser}..."
                                    npx playwright test src/tests/faq-evaluation/robo-sim-agent-preview-integration.spec.ts \\
                                        --project=${browser} \\
                                        --timeout=${params.TEST_TIMEOUT} \\
                                        ${params.HEADLESS ? '--headed=false' : '--headed=true'} \\
                                        --reporter=html,json \\
                                        --output-dir=reports/robo-sim-${browser}
                                """
                            }
                        }
                    }
                    post {
                        always {
                            echo '📊 RoboSim test completed'
                            archiveArtifacts artifacts: 'reports/robo-sim-*/**', allowEmptyArchive: true
                        }
                    }
                }
            }
        }
        
        stage('Report Generation') {
            when {
                params.GENERATE_REPORT == true
            }
            steps {
                echo '📊 Generating comprehensive test reports...'
                sh '''
                    echo "Generating consolidated HTML report..."
                    
                    # Create consolidated report directory
                    mkdir -p reports/consolidated
                    
                    # Copy all HTML reports to consolidated directory
                    find reports -name "*.html" -exec cp {} reports/consolidated/ \\;
                    
                    # Generate summary report
                    cat > reports/consolidated/summary.html << 'EOF'
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Test Execution Summary</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
                            .test-suite { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                            .success { border-left: 5px solid #4CAF50; }
                            .failure { border-left: 5px solid #f44336; }
                            .info { background-color: #e3f2fd; padding: 10px; border-radius: 3px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>🤖 Agent Evaluation Test Suite</h1>
                            <p><strong>Execution Time:</strong> $(date)</p>
                            <p><strong>Test Suite:</strong> ${TEST_SUITE}</p>
                            <p><strong>Browser(s):</strong> ${BROWSER}</p>
                            <p><strong>Headless Mode:</strong> ${HEADLESS}</p>
                        </div>
                        
                        <div class="test-suite success">
                            <h2>✅ Client Services Agent Evaluation</h2>
                            <p>Tests agent's ability to handle FAQ questions using traditional and enhanced evaluation metrics.</p>
                            <p><strong>Features:</strong> PDF-based question generation, multi-metric evaluation, comprehensive reporting</p>
                        </div>
                        
                        <div class="test-suite success">
                            <h2>✅ RoboSim Agent Preview Integration</h2>
                            <p>Tests dynamic conversation simulation using RoboSim framework with similarity detection.</p>
                            <p><strong>Features:</strong> Fresh agent creation, dynamic user simulation, conversation evaluation, early exit on repetitive responses</p>
                        </div>
                        
                        <div class="info">
                            <h3>📊 Test Artifacts</h3>
                            <ul>
                                <li>HTML Reports: Available in individual test directories</li>
                                <li>Screenshots: Captured during test execution</li>
                                <li>JSON Results: Detailed test results in JSON format</li>
                                <li>Traces: Playwright traces for debugging (if enabled)</li>
                            </ul>
                        </div>
                    </body>
                    </html>
                    EOF
                    
                    echo "✅ Consolidated report generated"
                '''
            }
        }
        
        stage('Artifact Collection') {
            steps {
                echo '📦 Collecting test artifacts...'
                script {
                    // Collect all reports
                    sh '''
                        echo "Collecting test artifacts..."
                        
                        # Create final artifacts directory
                        mkdir -p artifacts
                        
                        # Copy all reports
                        cp -r reports/* artifacts/ 2>/dev/null || true
                        
                        # Copy package files for reference
                        cp package.json package-lock.json artifacts/ 2>/dev/null || true
                        
                        # Create test summary
                        echo "Test Execution Summary" > artifacts/test-summary.txt
                        echo "=====================" >> artifacts/test-summary.txt
                        echo "Execution Time: $(date)" >> artifacts/test-summary.txt
                        echo "Test Suite: ${TEST_SUITE}" >> artifacts/test-summary.txt
                        echo "Browser: ${BROWSER}" >> artifacts/test-summary.txt
                        echo "Headless: ${HEADLESS}" >> artifacts/test-summary.txt
                        echo "" >> artifacts/test-summary.txt
                        
                        # List all generated files
                        echo "Generated Artifacts:" >> artifacts/test-summary.txt
                        find artifacts -type f -name "*.html" -o -name "*.json" -o -name "*.png" | sort >> artifacts/test-summary.txt
                        
                        echo "✅ Artifacts collected successfully"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up...'
            sh '''
                echo "Cleaning up temporary files..."
                # Keep reports but clean up temporary files
                find . -name "*.tmp" -delete 2>/dev/null || true
                find . -name "playwright-report" -type d -exec rm -rf {} + 2>/dev/null || true
            '''
        }
        
        success {
            echo '✅ All tests completed successfully!'
            script {
                // Archive all artifacts
                archiveArtifacts artifacts: 'artifacts/**', allowEmptyArchive: true
                
                // Publish HTML reports if available
                if (fileExists('artifacts/consolidated/summary.html')) {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'artifacts/consolidated',
                        reportFiles: 'summary.html',
                        reportName: 'Agent Evaluation Test Report'
                    ])
                }
            }
        }
        
        failure {
            echo '❌ Test execution failed!'
            script {
                // Still archive artifacts for debugging
                archiveArtifacts artifacts: 'artifacts/**', allowEmptyArchive: true
                
                // Archive screenshots and traces for debugging
                archiveArtifacts artifacts: 'reports/**/*.png', allowEmptyArchive: true
                archiveArtifacts artifacts: 'reports/**/*.zip', allowEmptyArchive: true
            }
        }
        
        unstable {
            echo '⚠️ Some tests were unstable!'
        }
    }
}
