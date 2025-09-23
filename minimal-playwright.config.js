module.exports = {
  testDir: 'src/tests',
  outputDir: './temp-test-results',
  reporter: [['line']],
  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
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
