# Yadda

[![Join the chat at https://gitter.im/acuminous/yadda](https://badges.gitter.im/acuminous/yadda.svg)](https://gitter.im/acuminous/yadda?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/acuminous/yadda.png)](https://travis-ci.org/acuminous/yadda) [![Dependencies](https://david-dm.org/acuminous/yadda.svg)](https://david-dm.org/acuminous/yadda)
[![Gitter](https://badges.gitter.im/acuminous/yadda.svg)](https://gitter.im/acuminous/yadda?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![NPM](https://nodei.co/npm/yadda.png?downloads=true)](https://nodei.co/npm/yadda/)

Yadda brings _true_ BDD to JavaScript frameworks such as [Jasmine](https://jasmine.github.io/), [Mocha](http://mochajs.org/), [QUnit](http://qunitjs.com), [Nodeunit](https://github.com/caolan/nodeunit), [WebdriverIO](http://webdriver.io/) and [CasperJS](http://casperjs.org). By _true_ BDD we mean that the ordinary language (e.g. English) steps are mapped to code, as opposed to simply decorating it. This is important because just like comments, the decorative steps such as those used by
[Jasmine](https://jasmine.github.io/), [Mocha](http://mochajs.org/) and [Vows](http://vowsjs.org) can fall out of date and are a form of duplication.

Yadda's BDD implementation is like [Cucumber's](http://cukes.info/) in that it maps the ordinary language steps to code. Not only are the steps less likely to go stale, but they also provide a valuable abstraction layer and encourage re-use. You could of course just use [CucumberJS](https://github.com/cucumber/cucumber-js), but we find Yadda less invasive and prefer it's flexible syntax to Gherkin's. Yadda's conflict resolution is smarter too.

## Latest Version
The current version of Yadda is 0.22.1</br>
There are breaking changes (steps default to async rather than synchronous when variadic arguments are used in steps). Please refer to the [Release Notes](./release-notes.md) for more details.

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
var assert = require('assert');
var English = require('yadda').localisation.English;
var Wall = require('../../lib/wall'); // The library that you wish to test

module.exports = (function() {
  return English.library()
    .given("$NUM green bottles are standing on the wall", function(number, next) {
       wall = new Wall(number);
       next();
    })
    .when("$NUM green bottle accidentally falls", function(number, next) {
       wall.fall(number);
       next();
    })
    .then("there are $NUM green bottles standing on the wall", function(number, next) {
       assert.equal(number, wall.bottles);
       next();
    });
})();
```
(If your test runner & code are synchronous you can omit the calls to 'next')

### Step 4 - Integrate Yadda with your testing framework (e.g. Mocha)
./bottles-test.js
```js
var Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('./test/features').each(function(file) {

  featureFile(file, function(feature) {

    var library = require('./test/steps/bottles-library');
    var yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, function(scenario) {
      steps(scenario.steps, function(step, done) {
        yadda.run(step, done);
      });
    });
  });
});
```
### Step 5 - Write your code
./lib/wall.js
```js
module.exports = function(bottles) {
  this.bottles = bottles;
  this.fall = function(n) {
    this.bottles -= n;
  }
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
