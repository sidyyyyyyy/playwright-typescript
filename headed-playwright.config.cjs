module.exports = {
  testDir: 'src/tests',
  outputDir: './reports/test-results',
  reporter: [['line']],
  use: {
    headless: false, // Force headed mode
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        viewport: { width: 1920, height: 1080 }
      },
    },
  ],
};
