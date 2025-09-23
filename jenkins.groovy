#!/usr/bin/env groovy

pipeline {
    agent any
    
    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['both', 'client-services', 'robo-sim'],
            description: 'Select which test suite to run'
        )
        choice(
            name: 'BROWSER',
            choices: ['chromium', 'firefox', 'webkit'],
            description: 'Select browser to run tests on'
        )
        booleanParam(
            name: 'HEADLESS',
            defaultValue: true,
            description: 'Run tests in headless mode'
        )
    }
    
    environment {
        NODE_VERSION = '18'
        CI = 'true'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '🔍 Checking out source code...'
                checkout scm
            }
        }
        
        stage('Setup') {
            steps {
                echo '🔧 Setting up environment...'
                sh '''
                    echo "Installing dependencies..."
                    npm ci
                    
                    echo "Installing Playwright browsers..."
                    npx playwright install --with-deps
                '''
            }
        }
        
        stage('Client Services Test') {
            when {
                anyOf {
                    params.TEST_SUITE == 'both'
                    params.TEST_SUITE == 'client-services'
                }
            }
            steps {
                echo '🤖 Running Client Services Agent Evaluation...'
                sh """
                    npx playwright test src/tests/faq-evaluation/client-services-agent-evaluation.spec.ts \\
                        --project=${params.BROWSER} \\
                        --timeout=300000 \\
                        ${params.HEADLESS ? '--headed=false' : '--headed=true'} \\
                        --reporter=html,json \\
                        --output-dir=reports/client-services
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/client-services/**', allowEmptyArchive: true
                }
            }
        }
        
        stage('RoboSim Test') {
            when {
                anyOf {
                    params.TEST_SUITE == 'both'
                    params.TEST_SUITE == 'robo-sim'
                }
            }
            steps {
                echo '🤖 Running RoboSim Agent Preview Integration...'
                sh """
                    npx playwright test src/tests/faq-evaluation/robo-sim-agent-preview-integration.spec.ts \\
                        --project=${params.BROWSER} \\
                        --timeout=300000 \\
                        ${params.HEADLESS ? '--headed=false' : '--headed=true'} \\
                        --reporter=html,json \\
                        --output-dir=reports/robo-sim
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/robo-sim/**', allowEmptyArchive: true
                }
            }
        }
    }
    
    post {
        always {
            echo '📦 Archiving all reports...'
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
        
        success {
            echo '✅ All tests completed successfully!'
        }
        
        failure {
            echo '❌ Test execution failed!'
        }
    }
}
