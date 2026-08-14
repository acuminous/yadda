# Yadda

[![Gitter](https://badges.gitter.im/acuminous/yadda.svg)](https://gitter.im/acuminous/yadda?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![NPM version](https://img.shields.io/npm/v/yadda.svg?style=flat-square)](https://www.npmjs.com/package/yadda)
[![NPM downloads](https://img.shields.io/npm/dm/yadda.svg?style=flat-square)](https://www.npmjs.com/package/yadda)
[![Node.js CI](https://github.com/acuminous/yadda/workflows/Node.js%20CI/badge.svg)](https://github.com/acuminous/yadda/actions?query=workflow%3A%22Node.js+CI%22)
[![Code Style](https://img.shields.io/badge/code%20style-biome-brightgreen.svg)](https://biomejs.dev/)

Yadda brings _true_ BDD to JavaScript test frameworks such as [Jasmine](https://jasmine.github.io/), [Mocha](http://mochajs.org/) and [WebdriverIO](http://webdriver.io/). By _true_ BDD we mean that the ordinary language (e.g. English) steps are mapped to code, as opposed to simply decorating it. This is important because just like comments, the decorative steps such as those used by [Jasmine](https://jasmine.github.io/), [Mocha](http://mochajs.org/) and [Vows](http://vowsjs.org) can fall out of date and are a form of duplication.

Yadda's BDD implementation is like [Cucumber's](http://cukes.info/) in that it maps the ordinary language steps to code. Not only are the steps less likely to go stale, but they also provide a valuable abstraction layer and encourage re-use. You could of course just use [CucumberJS](https://github.com/cucumber/cucumber-js), but we find Yadda less invasive and prefer its flexible syntax to Gherkin's. Yadda's conflict resolution is smarter too.

## Documentation

Please refer to the the [Yadda User Guide](http://acuminous.gitbooks.io/yadda-user-guide).

## tl;dr

### Step 1 - Decide upon a directory structure, e.g.

```
.
├── bottles-test.js
├── lib
│    └── wall.js
└── test
    ├── features
    │   └── bottles.feature
    └── steps
        └── bottles-library.js
```

### Step 2 - Write your first scenario

./test/features/bottles.feature

```
Feature: 100 Green Bottles

Scenario: Should fall from the wall

   Given 100 green bottles are standing on the wall
   When 1 green bottle accidentally falls
   Then there are 99 green bottles standing on the wall

```

### Step 3 - Implement the step library

./test/steps/bottles-library.js

```js
const assert = require('assert');
const Yadda = require('yadda');
const English = Yadda.localisation.English;
const Wall = require('../../lib/wall'); // The library that you wish to test

module.exports = (function () {
  return English.localise(new Yadda.ContextBoundLibrary())
    .given('$NUM green bottles are standing on the wall', function (number, next) {
      wall = new Wall(number);
      next();
    })
    .when('$NUM green bottle accidentally falls', function (number, next) {
      wall.fall(number);
      next();
    })
    .then('there are $NUM green bottles standing on the wall', function (number, next) {
      assert.equal(number, wall.bottles);
      next();
    });
})();
```

(If your test runner & code are synchronous you can omit the calls to 'next')

### Step 4 - Integrate Yadda with your testing framework (e.g. Mocha)

./bottles-test.js

```js
const Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('./test/features').each(function (file) {
  featureFile(file, function (feature) {
    const library = require('./test/steps/bottles-library');
    const yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, function (scenario) {
      steps(scenario.steps, function (step, done) {
        yadda.run(step, done);
      });
    });
  });
});
```

### Step 5 - Write your code

./lib/wall.js

```js
module.exports = function (bottles) {
  this.bottles = bottles;
  this.fall = function (n) {
    this.bottles -= n;
  };
};
```

### Step 6 - Run your tests

```
  mocha --reporter spec bottles-test.js

  100 Green Bottles
    Should fall from the wall
      ✓ Given 100 green bottles are standing on the wall
      ✓ When 1 green bottle accidentally falls
      ✓ Then there are 99 green bottles standing on the wall
```

## Rules

Yadda supports the Gherkin `Rule` keyword for grouping scenarios that belong to a single business rule. A `Rule` may declare its own `Background`, whose steps are prepended (after any feature-level `Background`) to each of the rule's scenarios.

```
Feature: Highlander

  Background:

    Given a game with 2 immortals

  Rule: There can be only one

    Background:

      Given the immortals fight

    Scenario: One remains

      Then there is 1 immortal left
```

Parsed features expose a `rules` array alongside the top level `scenarios` array (scenarios declared before the first `Rule` remain in `scenarios`). The mocha/jasmine plugins provide `rule`/`rules` globals so rules nest as their own `describe` block:

```js
featureFile(file, function (feature) {
  const yadda = Yadda.createInstance(library);

  scenarios(feature.scenarios, function (scenario) {
    steps(scenario.steps, function (step, done) {
      yadda.run(step, done);
    });
  });

  rules(feature.rules, function (rule) {
    scenarios(rule.scenarios, function (scenario) {
      steps(scenario.steps, function (step, done) {
        yadda.run(step, done);
      });
    });
  });
});
```
