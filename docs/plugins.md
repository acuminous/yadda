# Plugins

Yadda ships plugins that wire feature files into a test runner, so scenarios and steps appear as native tests. Plugins live under `Yadda.plugins`:

- `Yadda.plugins.nodetest` — Node.js's built-in [node:test](https://nodejs.org/api/test.html) runner
- `Yadda.plugins.mocha` — [Mocha](https://mochajs.org/)
- `Yadda.plugins.jasmine` — [Jasmine](https://jasmine.github.io/) (an alias of the mocha plugin)

Each comes in two levels:

- **StepLevelPlugin** — every step becomes its own test, giving fine-grained output. This is the usual choice.
- **ScenarioLevelPlugin** — each scenario becomes a single test.

## node:test

The node:test plugin's `init()` **returns** the helper functions, so you destructure them rather than relying on globals:

```js
import Yadda from 'yadda';
import library from './test/steps/bottles-library.js';

const { plugins: { nodetest }, FeatureFileSearch, createInstance } = Yadda;
const { featureFile, scenarios, steps } = nodetest.StepLevelPlugin.init();

new FeatureFileSearch('./test/features').each((file) => {
  featureFile(file, (feature) => {
    const yadda = createInstance(library);

    scenarios(feature.scenarios, (scenario) => {
      const ctx = {};
      steps(scenario.steps, (step, done) => {
        yadda.run(step, ctx, done);
      });
    });
  });
});
```

Run it with `node --test`.

### Skipping steps at runtime

node:test's `t.skip()` marks a test skipped without throwing, so on its own it would not stop the rest of a scenario. The step-level plugin passes each step to your callback as a runnable exposing a `skip()` that both skips and aborts the remaining steps. With a `ContextParamLibrary`, thread the step through the context so arrow-function steps can reach it:

```js
steps(scenario.steps, (step, done) => {
  yadda.run(step, { ctx, step }, done);
});
```

```js
.given('the supplier is unavailable', (ctx) => {
  ctx.step.skip();
});
```

## Mocha and Jasmine

The mocha/jasmine plugin's `init()` installs its helpers as **globals** (`featureFile`, `scenarios`, `steps`, `rule`, `rules`, …):

```js
import Yadda from 'yadda';
import library from './test/steps/bottles-library.js';

const { plugins: { mocha }, FeatureFileSearch, createInstance } = Yadda;
mocha.StepLevelPlugin.init();

new FeatureFileSearch('./test/features').each((file) => {
  featureFile(file, (feature) => {
    const yadda = createInstance(library);

    scenarios(feature.scenarios, (scenario) => {
      steps(scenario.steps, (step, done) => {
        yadda.run(step, done);
      });
    });
  });
});
```

Pass `{ container }` to `init()` if you'd rather the helpers were attached to an object other than `global`.

## Rules

Every plugin also exposes `rule`/`rules` helpers so [feature-file rules](feature-files.md#rules) nest as their own group. Iterate `feature.rules` alongside `feature.scenarios`:

```js
import Yadda from 'yadda';
import library from './test/steps/bottles-library.js';

const { plugins: { nodetest }, FeatureFileSearch, createInstance } = Yadda;
const { featureFile, scenarios, steps, rules } = nodetest.StepLevelPlugin.init();

new FeatureFileSearch('./test/features').each((file) => {
  featureFile(file, (feature) => {
    const yadda = createInstance(library);

    scenarios(feature.scenarios, (scenario) => {
      steps(scenario.steps, (step, done) => yadda.run(step, done));
    });

    rules(feature.rules, (rule) => {
      scenarios(rule.scenarios, (scenario) => {
        steps(scenario.steps, (step, done) => yadda.run(step, done));
      });
    });
  });
});
```

See the runnable [examples](../examples) for node:test, Mocha, Jasmine, Puppeteer and Playwright setups.
