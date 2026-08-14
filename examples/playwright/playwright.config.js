const { defineConfig } = require('@playwright/test');

// Headless on CI (GitHub sets CI=true); headed locally so you can watch it run.
module.exports = defineConfig({
  testMatch: 'test.js',
  use: {
    headless: !!process.env.CI,
  },
});
