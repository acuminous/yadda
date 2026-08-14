const path = require('node:path');
const { test } = require('@playwright/test');
const Yadda = require('yadda');

const library = require('./steps/bottles-library');
const parser = new Yadda.parsers.FeatureFileParser();

// The page under test is a static file, loaded straight from disk.
const url = `file://${path.join(__dirname, 'app', 'bottles.html')}`;

// Yadda's asynchronous steps return promises, but yadda.run reports completion
// through a done-callback. Wrap it so Playwright can await each step.
const runStep = (yadda, step) => new Promise((resolve, reject) => yadda.run(step, (err) => (err ? reject(err) : resolve())));

// Playwright owns the runner. Rather than a Yadda plugin, we drive Yadda from
// inside Playwright's own test(): one test per scenario (so Playwright gives us
// a fresh, isolated page each time) and one test.step per Yadda step (so each
// step shows up in Playwright's report).
new Yadda.FeatureFileSearch('features').each((file) => {
  const feature = parser.parse(file);

  test.describe(feature.title, () => {
    feature.scenarios.forEach((scenario) => {
      test(scenario.title, async ({ page }) => {
        const yadda = Yadda.createInstance(library, { page, url });
        for (const step of scenario.steps) {
          await test.step(step, () => runStep(yadda, step));
        }
      });
    });
  });
});
