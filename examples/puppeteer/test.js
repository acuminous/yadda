const path = require('node:path');
const { before, after } = require('node:test');
const puppeteer = require('puppeteer');
const Yadda = require('yadda');

const library = require('./steps/bottles-library');
const { featureFile, scenarios, steps } = Yadda.plugins.nodetest.StepLevelPlugin.init();

// The page under test is a static file, loaded straight from disk.
const url = `file://${path.join(__dirname, 'app', 'bottles.html')}`;

// Unlike Playwright, Puppeteer is just a browser library with no test runner of
// its own — so we bring one: Yadda's node:test plugin. The plugin turns feature
// files into describe/it blocks; we own the browser lifecycle through node:test
// hooks. The browser launches once; each scenario gets a fresh page, which is
// how state is cleared between scenarios.
let browser;
before(async () => {
  // CI runners (Ubuntu 23.10+) disable unprivileged user namespaces, so
  // Chromium's sandbox can't start — disable it when running headless on CI.
  const args = process.env.CI ? ['--no-sandbox'] : [];
  browser = await puppeteer.launch({ headless: !!process.env.CI, args });
});
after(async () => {
  await browser.close();
});

const yadda = Yadda.createInstance(library);

new Yadda.FeatureFileSearch('features').each((file) => {
  featureFile(file, (feature) => {
    scenarios(feature.scenarios, (scenario) => {
      // A fresh page per scenario, opened once (not once per step), which is how
      // state is cleared between scenarios. before/after run inside the
      // scenario's describe block, so they fire once around its steps.
      const session = {};
      before(async () => {
        session.page = await browser.newPage();
      });
      after(async () => {
        await session.page.close();
      });
      steps(scenario.steps, (step, done) => {
        yadda.run(step, { page: session.page, url }, done);
      });
    });
  });
});
