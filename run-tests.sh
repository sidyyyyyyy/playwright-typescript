#!/bin/bash

# Agent Evaluation Test Runner
# Usage: ./run-tests.sh [test-suite] [browser] [headless]

set -e

# Default values
TEST_SUITE=${1:-"both"}
BROWSER=${2:-"chromium"}
HEADLESS=${3:-"true"}
TIMEOUT=${4:-"300000"}

echo "🚀 Starting Agent Evaluation Test Suite"
echo "========================================"
echo "Test Suite: $TEST_SUITE"
echo "Browser: $BROWSER"
echo "Headless: $HEADLESS"
echo "Timeout: $TIMEOUT ms"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with the following variables:"
    echo "EMAIL=your-email@example.com"
    echo "PASSWORD=your-password"
    echo "INSTANCE=r2d2demo.ushur.dev"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Install Playwright browsers if not already installed
echo "🌐 Ensuring Playwright browsers are installed..."
npx playwright install --with-deps

# Create reports directory
mkdir -p reports

# Function to run a test
run_test() {
    local test_file=$1
    local test_name=$2
    local output_dir="reports/${test_name}-${BROWSER}"
    
    echo ""
    echo "🤖 Running $test_name..."
    echo "Test file: $test_file"
    echo "Output directory: $output_dir"
    echo "----------------------------------------"
    
    if npx playwright test "$test_file" \
        --project="$BROWSER" \
        --timeout="$TIMEOUT" \
        $([ "$HEADLESS" = "true" ] && echo "--headed=false" || echo "--headed=true") \
        --reporter=html,json \
        --output-dir="$output_dir"; then
        echo "✅ $test_name completed successfully!"
    else
        echo "❌ $test_name failed!"
        return 1
    fi
}

# Track test results
CLIENT_SERVICES_RESULT=0
ROBOSIM_RESULT=0

# Run Client Services test
if [ "$TEST_SUITE" = "both" ] || [ "$TEST_SUITE" = "client-services" ]; then
    if run_test "src/tests/faq-evaluation/client-services-agent-evaluation.spec.ts" "client-services"; then
        CLIENT_SERVICES_RESULT=0
    else
        CLIENT_SERVICES_RESULT=1
    fi
fi

# Run RoboSim test
if [ "$TEST_SUITE" = "both" ] || [ "$TEST_SUITE" = "robo-sim" ]; then
    if run_test "src/tests/faq-evaluation/robo-sim-agent-preview-integration.spec.ts" "robo-sim"; then
        ROBOSIM_RESULT=0
    else
        ROBOSIM_RESULT=1
    fi
fi

# Generate summary report
echo ""
echo "📊 Test Execution Summary"
echo "========================="
echo "Execution Time: $(date)"
echo "Test Suite: $TEST_SUITE"
echo "Browser: $BROWSER"
echo "Headless: $HEADLESS"
echo ""

if [ "$TEST_SUITE" = "both" ] || [ "$TEST_SUITE" = "client-services" ]; then
    if [ $CLIENT_SERVICES_RESULT -eq 0 ]; then
        echo "✅ Client Services Agent Evaluation: PASSED"
    else
        echo "❌ Client Services Agent Evaluation: FAILED"
    fi
fi

if [ "$TEST_SUITE" = "both" ] || [ "$TEST_SUITE" = "robo-sim" ]; then
    if [ $ROBOSIM_RESULT -eq 0 ]; then
        echo "✅ RoboSim Agent Preview Integration: PASSED"
    else
        echo "❌ RoboSim Agent Preview Integration: FAILED"
    fi
fi

echo ""
echo "📁 Reports generated in:"
find reports -name "*.html" -type f | head -5

# Exit with error if any test failed
if [ $CLIENT_SERVICES_RESULT -ne 0 ] || [ $ROBOSIM_RESULT -ne 0 ]; then
    echo ""
    echo "❌ Some tests failed. Check the reports for details."
    exit 1
else
    echo ""
    echo "🎉 All tests passed successfully!"
    exit 0
fi
