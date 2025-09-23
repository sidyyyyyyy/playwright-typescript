# Dockerfile for Agent Evaluation Test Suite
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create reports directory
RUN mkdir -p reports

# Set environment variables
ENV NODE_ENV=production
ENV CI=true
ENV PLAYWRIGHT_BROWSERS_PATH=0

# Make the test runner executable
RUN chmod +x run-tests.sh

# Default command
CMD ["./run-tests.sh", "both", "chromium", "true"]
