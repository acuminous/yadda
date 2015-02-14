# Yadda
[![Build Status](https://travis-ci.org/acuminous/yadda.png)](https://travis-ci.org/acuminous/yadda) [![Dependencies](https://david-dm.org/acuminous/yadda.svg)](https://david-dm.org/acuminous/yadda) [![Coverage Status](https://img.shields.io/coveralls/acuminous/yadda.svg)](https://coveralls.io/r/acuminous/yadda?branch=master)

[![NPM](https://nodei.co/npm/yadda.png?downloads=true)](https://nodei.co/npm/yadda/)

Yadda brings _true_ BDD to JavaScript test frameworks such as [Jasmine](http://pivotal.github.io/jasmine/), [Mocha](http://visionmedia.github.io/mocha/), [QUnit](http://qunitjs.com), [Nodeunit](https://github.com/caolan/nodeunit), [WebDriverJs](http://code.google.com/p/selenium/wiki/WebDriverJs) and [CasperJS](http://casperjs.org). By _true_ BDD we mean that the ordinary language (e.g. English) steps are mapped to code, as opposed to simply decorating it. This is important because just like comments, the decorative steps such as those used by
[Jasmine](http://pivotal.github.com/jasmine), [Mocha](http://visionmedia.github.io/mocha) and [Vows](http://vowsjs.org) can fall out of date and are a form of duplication.

Yadda's BDD implementation is like [Cucumber's](http://cukes.info/) in that it maps the ordinary language steps to code. Not only are the steps less likely to go stale, but they also provide a valuable abstraction layer and encourage re-use. You could of course just use [CucumberJS](https://github.com/cucumber/cucumber-js), but we find Yadda less invasive and prefer it's flexible syntax to Gherkin's. Yadda's conflict resolution is smarter too.

It's also worth checking out the following tools which use Yadda to provide their BDD functionality.

* [moonraker](https://github.com/LateRoomsGroup/moonraker) by LateRooms - An out of the box solution for bdd web testing using the page object pattern.
* [mimik](https://www.npmjs.com/package/mimik) - Mimik is a behavior-driven testing framework and UI automation platform.
* [massah](https://www.npmjs.com/package/massah) - Making BDD style automated browser testing with node.js very simple.
* [y2nw](https://www.npmjs.com/package/y2nw) - Yadda to [NightWatch](http://nightwatchjs.org) integraction

## Latest Version
The current version of Yadda is 0.11.5. Recent changes include:
* Russian language support kindly contributed by [vectart](https://github.com/vectart)
* Alternative "non-recurisve" api - see [issue 111](https://github.com/acuminous/yadda/issues/111).

## Installation

### Node based environments (e.g. Mocha)
```
npm install yadda
```
### Browser based environments (e.g. QUnit)
```html
<script src="./lib/yadda-0.11.5.js"></script>
```
## Writing Yadda Tests
### Step 1 - Decide upon a directory structure, e.g.
```
.
├── index.js
├── package.json
├── lib
└── test
    ├── features
    └── steps
```

For this tutorial we are going to use:
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
### Examples
Yadda works with Mocha, Jasmine, QUnit, Nodeunit, ZombieJS, CasperJS and WebDriver. There are examples for most of these, which can be run as follows...

```bash
git clone https://github.com/acuminous/yadda.git
cd yadda
npm install
npm link
npm run examples
```

Alternatively you can run them individually

```bash
git clone https://github.com/acuminous/yadda.git
cd yadda
npm install
npm link
cd examples/<desired-example-folder>
npm install
npm test
```

**Please note:**
* The Zombie example doesn't install on windows
* The webdriver example may fail depending on how google detects your locale.
* Your operating system must support ```npm link```.

### More Examples
There's a great example of how to use Yadda on large scale projects [here](https://github.com/adlnet/xAPI_LRS_Test/tree/master/src). Thanks very much to [brianjmiller](https://github.com/brianjmiller) for sharing.

## Yadda In Depth

### Flexible BDD Syntax
It's common for BDD libraries to limit syntax to precondition (given) steps, action (when) steps and assertion (then) steps. Yadda doesn't. This allows for more freedom of expression. e.g.
```js
var library = new Yadda.Library()
    .define("$NUM green bottle(?:s){0,1} standing on the wall", function(number) {
        // some code
    })
    .define("if $NUM green bottle(?:s){0,1} should accendentally fall", function(number) {
        // some code
    })
    .define("there are $NUM green bottle(?:s){0,1} standing on the wall", function(number) {
        // some code
    });
Yadda.createInstance(library).run([
    "100 green bottles standing on the wall",
    "if 1 green bottle should accidentally fall",
    "there are 99 green bottles standing on the wall"
]);
```
However we think that Given/When/Then (along with And/But/With/If) is a good starting point, so we recommend using Yadda.localisation.English instead of the vanilla Yadda.Library. This adds 'given', 'when' and 'then' helper methods, enabling you to define your steps as follows...
```js
var library = new Yadda.Library()
    .given("$NUM green bottle(?:s){0,1} standing on the wall", function(number) {
        // some code
    })
    .when("$NUM green bottle(?:s){0,1} should accendentally fall", function(number) {
        // some code
    })
    .then("there are $NUM green bottle(?:s){0,1} standing on the wall", function(number) {
        // some code
    });
Yadda.createInstance(library).run([
    "Given 100 green bottles standing on the wall",
    "when 1 green bottle should accidentally fall",
    "then there are 99 green bottles standing on the wall"
]);
```
Because the localised definitions for 'given', 'when' and 'then' are loose you could also re-write the above scenario as
```js
Yadda.createInstance(library).run([
    "given 100 green bottles standing on the wall",
    "but 1 green bottle should accidentally fall",
    "expect there are 99 green bottles standing on the wall"
]);
```

### Localisation
We'd be delighted to accept pull requests for more languages and dialects. Many thanks to the following language contributors

 - [ami44](https://github.com/ami44) - French
 - [feliun](https://github.com/feliun) - Spanish
 - [kjelloe](https://github.com/kjelloe) - Norwegian
 - [macie](https://github.com/macie) - Polish
 - [prokls](https://github.com/prokls) - German
 - [vectart](https://github.com/vectart) - Russian

### Step Anatomy
A step is made up of a regular expression, a function and some context.
```js
var ctx = { assert: assert };
library.given('^(\\d+) green bottle(?:s){0,1} standing on the wall$', function(n) {
   wall = new Wall(n);
   this.assert.equals(wall.bottles, n);
}, ctx);
```

#### Regular Expressions
The regular expression is used to identify which steps are compatible with the input text, and to provide arguments to the function. You can specify step signatures using true RegExp objects, which is handy if they contain lots of backslash characters. e.g.
```js
var library = Yadda.Library.English.library()
    .given(/^(\d+) green bottle(?:s){0,1} standing on the wall$/, function(n) {
        // some code
    });
```
Regular expressions can get pretty ugly, so it's often preferable to relax the regex and use a $term variable which will be replaced with a wildcard i.e. '(.+)'.
```js
var library = Yadda.Library.English.library()
    .given(/$NUM green bottles standing on the wall/, function(n) {
        // some code
    });
```
Using $term variables can relax the regular expression too much and cause clashes between steps. Yadda provides greater control over the expansion through use of a dictionary, e.g.
```js
var dictionary = new Yadda.Dictionary()
    .define('gender', '(male|female)')
    .define('speciaility', '(cardio|elderly|gastro)');

var library = Yadda.localisation.English.library(dictionary)
    .given('a $gender, $speciality patient called $name', function(gender, speciality, name) { /* some code */ });
```
will expand to
```js
"(?:[Gg]iven|[Aa]nd|[Ww]ith]|[Bb]ut) a (male|female), (cardio|elderly|gastro) patient called (.+)"
```
and therefore match "Given a female, elderly patient called Carol". The expansions can also contain $terms so
```js
var dictionary = new Yadda.Dictionary()
    .define('address_line_1', '$number $street')
    .define('number', /(\d+)/)
    .define('street', /(\w+)/);

var library = Yadda.Library.English.localisation(dictionary)
    .given('a street address of $address_line_1', function(number, street) { /* some code */ });
```
will expand to
```js
"(?:[Gg]iven|[Aa]nd|[Ww]ith]|[Bb]ut) a street address of (\d+) (\w+)"
```
Dictionaries can also be merged...
```js
var shared_dictionary = new Yadda.Dictionary()
    .define('number', /(\d+1/));

var feature_specific_dictionary = new Yadda.Dictionary()
    .merge(shared_dictionary)
    .define('speciality', /(cardio|elderly|gastro)/);
```
An alternative way to make your regular expressions more readable is to alias them. So instead of...
```js
    .given('$patient is (?:still )awaiting discharge', function(patient) {
        // some code
    });
```
You could write
```js
    .given(['$patient is awaiting discharge', '$patient is still waiting discharge'], function(patient) {
        // some code
    });
```

#### Functions
The function is the code you want to execute for a specific line of text. If you don't specify a function then a no-op
function will be used, which is one way of implementing a 'Pending' step.

#### Contexts (Shared State)
The context will be bound with the function before it is executed and provides a non global way to share state between
steps, or pass in "define-time" variables such as an assertion library or 'done' function. The context is optional.

It can be a chore to add a context to every step, so a common context can be specified at the interpreter and scenario levels too. If you specify multiple contexts (as in the following example) they will be merged before executing the step.

```js
var interpreter_context = { foo: 1, masked: 2 }; // Shared between all scenarios
var scenario_context = { bar: 3, masked: 4 };    // Shared between all steps in this scenario
var step_context = { meh: 5, masked: 6 };        // Not shared between steps

var library = new Library()
    .define('Context Demonstration', function() {
        assert(this.foo == 1);
        assert(this.bar == 3);
        assert(this.meh == 5);
        assert(this.masked == 6);
    }, step_context);

Yadda.createInstance(library, interpeter_context).run('Context Demonstration', scenario_context);

```

#### Step Conflicts
One issue you find with BDD libraries, is that two steps might match the same input text. Usually this results in an error, and you end up having to add some extra text to one of the steps in order to differentiate it. Yadda attempts to minimise this in three ways.

1. By using the Levenshtein Distance to determine which step is the best match when clashes occur.

2. By allowing you to define steps in multiple libraries. Grouping steps into libraries not only helps keep a tidy code base, but also prevents clashes if your scenario doesn't require the library with the alternative step.

3. If you still have problems with clashing, you can use the term dictionary to make your regular expression more specific without affecting the readability of your step.

#### Events
Debugging BDD tests is typically harder than debugging unit tests for a number of reasons, not the least of which is because you can't step through a feature file. You can make things a bit easier by adding event listeners, which log the step that is being executed.

```js
var EventBus = require('Yadda').EventBus;
EventBus.instance().on(EventBus.ON_EXECUTE, function(event) {
    console.log(event.name, event.data);
});

```
The following events are available...
<table>
  <tr>
    <th>Event Name</th><th>Event Data</th>
  </tr>
  <tr>
    <td>ON_SCENARIO</td><td>{ scenario: [ '100 green bottles', 'should 1 green bottle...', ...], ctx: context }</td>
  </tr>
  <tr>
    <td>ON_STEP</td><td>{ step: '100 green bottles...', ctx: context }</td>
  </tr>
  <tr>
    <td>ON_EXECUTE</td><td>{ step: '100 green bottles...', pattern: '/(\d+) green bottles.../', args: ['100'], ctx: context }</td>
  </tr>
</table>

#### Coverage
Please note coverage may appear to hang on OSX, while causing the CPU to thrash. This is because the Yadda examples use symbolic links back to the top level directory,
creating an infinite loop. Istanbul follows these links indefinitely. The problem doesn't present itself on other linux-based distributions.
```
npm install istanbul -g
npm install mocha -g
npm run istanbul
```
Open ```coverage/lcov-report/lib/localisation/index.html``` with your browser

## Feature Files
While Yadda can interpret any text you write steps for, it also comes with a Gherkin-like feature file parser.

### Backgrounds
A background is a set of steps that are executed before each scenario in the corresponding feature file.
```
Feature: 100 Green Bottles

Background:

   Given a 6ft wall
   With a healthy amount of moss

Scenario: Bottles should fall from the wall

   Given 100 green bottles are standing on the wall
   When 1 green bottles accidentally falls
   Then there are 99 green bottles standing on the wall

Scenario: Plastic bottles should not break

   Given 100 plastic bottles are standing on the wall
   When 1 plastic bottles accidentally falls
   It does not break
```
Backgrounds have the following limitations:

* They cannot be shared between features
* A feature can only have one background
* A background will be added to every scenario in a feature

A more flexible approach would be to support [re-use of scenarios](http://github.com/acuminous/yadda/issue/27).
The implications of this are more complicated and are still under consideration.

### Feature Descriptions
You can add an optional feature description at the top of your file to give some context about the scenarios contained within
```
Feature: Bystander is amused by watching falling bottles
As a bystander,
I can watch bottles falling from a wall
so that I can be mildly amused

Scenario: should fall from the wall

   Given 100 green bottles are standing on the wall
   When 1 green bottle accidentally falls
   Then there are 99 green bottles standing on the wall
```

There can only be a single feature present in a file - it really doesn't make sense to have two, and you will be issued an error if you try to include more than one.

### Annotations
Annotations can be added to a feature or scenario and may take the form of either single-value tags or key/value pairs.
```
@Browser=chrome
@Theme=bottles
Feature: As a bystander
    I can watch bottles falling from a wall
    So that I can be mildly amused

@Teardown
Scenario: should fall from the wall

   Given 100 green bottles are standing on the wall
   When 1 green bottle accidentally falls
   Then there are 99 green bottles standing on the wall
```
Next you'll need to write the code that processes the annotations from the parsed feature or scenario, e.g.

```js
var Yadda = require('yadda');

var all_features = new Yadda.FileSearch('features').list();

features(all_features, function(feature) {

    console.log(feature.annotations.theme);

    var library = require('./test/steps/bottles-library');
    var yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, function(scenario) {
        if (scenario.annotations.teardown) library.teardown();
        yadda.run(scenario.steps);
    });
});
```
The mocha and jasmine plugins already support @Pending annotations on features and scenarios out of the box, although [skipping tests in jasmine causes them to be excluded from the report](https://github.com/pivotal/jasmine/issues/274).

### Comments
You can add single line or block comments too.
```
###
  This is  a
  block comment
###
Feature: As a bystander
    I can watch bottles falling from a wall
    So that I can be mildly amused

# Marked as pending until verified by customer - SC 300BC
@Pending
Scenario: should fall from the wall

   Given 100 green bottles are standing on the wall
   When 1 green bottle accidentally falls
   Then there are 99 green bottles standing on the wall
```
But you can't do this...
```
Feature: As a bystander
    I can watch bottles falling from a wall

    # A blank line will always terminate a feature or scenario description

    So that I can be mildly amused
```
### Example Tables
Example Tables are supported as of 0.9.0. When the following feature file is parsed

bottles.feature
```
Feature: 100 Green Bottles

Scenario: should fall in groups of [Falling]

   Given 100 green bottles are standing on the wall
   When [Falling] green bottles accidentally fall
   Then there are [Remaining] green bottles standing on the wall

   Where:
      Falling | Remaining
      2       | 98
      10      | 90
      100     | 0
```
it will produce three scenarios, identical to
```
Feature: 100 Green Bottles

Scenario: should fall in groups of 2

   Given 100 green bottles are standing on the wall
   When 2 green bottles accidentally fall
   Then there are 98 green bottles standing on the wall

Scenario: should fall in groups of 10

   Given 100 green bottles are standing on the wall
   When 10 green bottles accidentally fall
   Then there are 90 green bottles standing on the wall

Scenario: should fall in groups of 100

   Given 100 green bottles are standing on the wall
   When 100 green bottles accidentally fall
   Then there are 0 green bottles standing on the wall
```
