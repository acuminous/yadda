# Yadda

[![NPM version](https://img.shields.io/npm/v/yadda.svg?style=flat-square)](https://www.npmjs.com/package/yadda)
[![NPM downloads](https://img.shields.io/npm/dm/yadda.svg?style=flat-square)](https://www.npmjs.com/package/yadda)
[![Node.js CI](https://github.com/acuminous/yadda/workflows/Node.js%20CI/badge.svg)](https://github.com/acuminous/yadda/actions?query=workflow%3A%22Node.js+CI%22)
[![codecov](https://codecov.io/gh/acuminous/yadda/graph/badge.svg?token=Sg3wvzHCp6)](https://codecov.io/gh/acuminous/yadda)
[![Code Style](https://img.shields.io/badge/code%20style-biome-brightgreen.svg)](https://biomejs.dev/)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://github.com/acuminous/yadda/blob/master/package.json)

Yadda brings _true_ BDD to JavaScript test frameworks such as [node:test](https://nodejs.org/api/test.html), [Mocha](https://mochajs.org/) and [Jasmine](https://jasmine.github.io/). By _true_ BDD we mean that the ordinary language (e.g. English) steps are **mapped to code**, rather than merely decorating it. This matters because just like comments the decorative steps used by tools such as Jasmine and Mocha can fall out of date and are a form of duplication.

## Why Yadda?

- **Mature and stable.** Yadda has been around since 2012 and its API has long since settled. It's battle-tested in real-world suites.
- **Zero dependencies.** Yadda installs nothing else into your `node_modules`. No transitive supply chain, no version conflicts, less maintenance.
- **Small, well-factored codebase.** Just over 2,000 lines of source (excluding tests and examples), built from deliberately tiny functions averaging a few lines each — mostly the feature parser and runner plugins, atop a smaller interpreter core. It is easy to read, easy to reason about, and easy to extend.
- **High test coverage.** Covered by ~200 meaningful tests at ~87% line / ~98% branch coverage, run against current LTS and current Node.js releases.
- **True BDD.** Steps map to real functions, so your specifications cannot silently drift away from the behaviour they describe.
- **Unopinionated.** Yadda is not a test runner or a test framework — its one job is to map lines of text to function calls. It plugs into the runner you already use.

## Yadda vs. Cucumber

Yadda's BDD implementation is like [Cucumber's](https://cucumber.io/) in that it maps ordinary language steps to code. You could of course use [CucumberJS](https://github.com/cucumber/cucumber-js), but we find Yadda less invasive, and prefer its flexible syntax to Gherkin's rigidity.

| | Yadda | CucumberJS |
|---|---|---|
| **Dependencies** | 0 | 30+ transitive dependencies |
| **Source size** | ~2,000 lines (zero deps) | Substantially larger, plus its dependency tree |
| **Runner** | Bring your own (node:test, Mocha, Jasmine, …) | Ships its own runner |
| **Language syntax** | Flexible — steps need not follow rigid Given/When/Then | Gherkin only |
| **Step conflicts** | Reduced via [dynamic library selection](docs/step-libraries.md) and [dictionaries](docs/dictionaries.md) | More prone to clashes across a large step catalogue |
| **Step data** | [Dictionaries](docs/dictionaries.md) can _source_ values (e.g. from a remote system), not just match literals | Literal capture groups |

Three things in particular set Yadda apart:

- **Dynamic library selection.** You can compose different step libraries per scenario, so the same phrase can mean different things in different contexts without conflicting. See [Step Libraries](docs/step-libraries.md).
- **Dictionaries.** Named, reusable terms that both reduce step conflicts and let step parameters be _converted_ or _sourced_ — turning matched text into integers, dates, parsed tables, or even entities fetched from a remote system. See [Dictionaries](docs/dictionaries.md).
- **A more flexible language.** Steps do not have to start with Given/When/Then, terms can be aliased, and localisation is built in for many languages. See [Feature Files](docs/feature-files.md) and [Localisation](docs/localisation.md).

## Installation

```
npm install --save-dev yadda
```

Yadda 3.0 is **Node-only** and requires **Node.js >= 20**. In-browser bundles were removed in 3.0 — see [Migrating to 3.0](docs/migrating-to-3.md).

## tl;dr

### 1. Decide upon a directory structure

```
.
├── test.js
├── lib
│   └── wall.js
└── test
    ├── features
    │   └── bottles.feature
    └── steps
        └── bottles-library.js
```

### 2. Write your first feature

`test/features/bottles.feature`

```
Feature: 100 Green Bottles

Scenario: Should fall from the wall

  Given 100 green bottles are standing on the wall
  When 1 green bottle accidentally falls
  Then there are 99 green bottles standing on the wall
```

### 3. Implement the step library

`test/steps/bottles-library.js`

```js
const assert = require('node:assert');
const Yadda = require('yadda');
const { English } = Yadda.localisation;
const Wall = require('../../lib/wall');

// A ContextParamLibrary passes the scenario context as the first argument to
// every step, so steps can be plain arrow functions and never need `this`.
module.exports = English.localise(new Yadda.ContextParamLibrary())
  .given('$NUM green bottles are standing on the wall', (ctx, number) => {
    ctx.wall = new Wall(Number(number));
  })
  .when('$NUM green bottle accidentally falls', (ctx, number) => {
    ctx.wall.fall(Number(number));
  })
  .then('there are $NUM green bottles standing on the wall', (ctx, number) => {
    assert.equal(Number(number), ctx.wall.bottles);
  });
```

### 4. Integrate Yadda with your test runner (here, `node:test`)

`test.js`

```js
const Yadda = require('yadda');
const { nodetest } = Yadda.plugins;
const { featureFile, scenarios, steps } = nodetest.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('./test/features').each((file) => {
  featureFile(file, (feature) => {
    const library = require('./test/steps/bottles-library');
    const yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, (scenario) => {
      const ctx = {};
      steps(scenario.steps, (step, done) => {
        yadda.run(step, ctx, done);
      });
    });
  });
});
```

### 5. Write the code under test

`lib/wall.js`

```js
module.exports = function (bottles) {
  this.bottles = bottles;
  this.fall = function (n) {
    this.bottles -= n;
  };
};
```

### 6. Run your tests

```
node --test
```

## Documentation

- [Getting Started](docs/getting-started.md) — installation, the interpreter, and your first suite
- [Step Libraries](docs/step-libraries.md) — mapping text to functions, sync/async/promise steps, aliases, dynamic selection
- [Dictionaries](docs/dictionaries.md) — reusable terms, converters, and sourcing step data
- [Managing State](docs/managing-state.md) — sharing context across steps and libraries
- [Localisation](docs/localisation.md) — writing features in other languages
- [Events](docs/events.md) — hooking into scenario/step/execute events for debugging
- [Feature Files](docs/feature-files.md) — the full feature-file syntax reference
- [Plugins](docs/plugins.md) — integrating with node:test, Mocha and Jasmine
- [API Reference](docs/api-reference.md) — the public API surface
- [Migrating to 3.0](docs/migrating-to-3.md) — breaking changes from 2.x

## Examples

The [examples](examples) directory demonstrates every key feature and how to integrate Yadda with common test runners. To run one:

```
git clone https://github.com/acuminous/yadda.git
cd yadda
npm install
npm link
cd examples/<desired-example>
npm install
npm test
```

## Contributing

Pull requests are welcome. Please read [CONTRIBUTORS.md](CONTRIBUTORS.md) first — it describes the principles and conventions that keep the Yadda codebase small and consistent.

## License

[ISC](LICENSE)
