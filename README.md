# Yadda
Yadda brings _true_ BDD to JavaScript test frameworks such as [Jasmine](http://pivotal.github.io/jasmine/), [Mocha](http://visionmedia.github.io/mocha/), [QUnit](http://qunitjs.com), [Nodeunit](https://github.com/caolan/nodeunit), [WebDriverJs](code.google.com/p/selenium/wiki/WebDriverJs) and [CasperJS](http://casperjs.org). By _true_ BDD we mean that the ordinary language (e.g. English) steps are mapped to code, as opposed to simply decorating it. This is important because just like comments, the decorative steps such as those used by
[Jasmine](http://pivotal.github.com/jasmine), [Mocha](http://visionmedia.github.io/mocha) and [Vows](http://vowsjs.org), can fall out of date and are a form of duplication.

Yadda's BDD implementation is like [Cucumber's](http://cukes.info/) in that it maps the ordinary language steps to code. Not only are the steps less likely to go stale, but they also provide a valuable abstraction layer and encourage re-use. You could of course just use [CucumberJS](https://github.com/cucumber/cucumber-js), but we find Yadda less invasive and prefer it's flexible syntax to Gherkin's. Yadda's conflict resolution is smarter too.

## Installation
Yadda 0.8.0 is the current verison. It contains breaking changes to Yadda.localisation.English that were required to localise Feature files.
```js
// Old Code (< 0.8.0)
var library = new Yadda.localisation.English();

// After  (>= 0.8.0)
var library = Yadda.localisation.English.library();
```

### Node based environments (e.g. Mocha)
```
npm install yadda
```
### Browser based environments (e.g. QUnit)
```html
<script src="./lib/yadda-0.7.2.js"></script>
```
## Writing Yadda Tests
### Step 1 - Write your scenarios
bottles.feature
```
Feature: 100 Green Bottles

Scenario: should fall from the wall

   Given 100 green bottles are standing on the wall
   When 1 green bottle accidentally falls
   Then there are 99 green bottles standing on the wall

@Pending
Scenario: No bottles are left

    Given 1 green bottles are standing on the wall
    when 1 green bottle accidentally falls
    then there are 0 green bottles standing on the wall
```
### Step 2 - Implement the step library
bottles-library.js
```js
var assert = require('assert');
var English = require('yadda').localisation.English;

module.exports = (function() {
  var library = English.library()
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


### Step 3 - Integrate Yadda with your testing framework (e.g. Mocha)
bottles-test.js
```js
var Yadda = require('yadda');
Yadda.plugins.mocha();

feature('./bottles.feature', function(feature) {

  var library = require('./bottles-library');
  var yadda = new Yadda.Yadda(library);

  scenarios(feature.scenarios, function(scenario, done) {
    yadda.yadda(scenario.steps, done);
  });
});
```

### Step 4 - Run your tests
```
  mocha --reporter spec bottles-test.js

  100 Green Bottles
    ✓ should fall from the wall
    - No bottles are left
```

## Features
### Supported Libraries
Yadda works with Mocha, Jasmine, QUnit, Nodeunit, ZombieJS, CasperJS and WebDriver. See the examples for details.

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
new Yadda.yadda(library).yadda([
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
new Yadda.yadda(library).yadda([
    "Given 100 green bottles standing on the wall",
    "when 1 green bottle should accidentally fall",
    "then there are 99 green bottles standing on the wall"
]);
```
Because the localisatised definitions for 'given', 'when' and 'then' are loose you could also re-write the above scenario as
```js
new Yadda.yadda(library).yadda([
    "given 100 green bottles standing on the wall",
    "but 1 green bottle should accidentally fall",
    "expect there are 99 green bottles standing on the wall"
]);
```
We'd be delighted to accept pull requests for more languages and dialects.

### Feature Descriptions
You can add an optional feature description at the top of your file to give some context about the scenarios contained within
bottles.feature
```
Feature: As a bystander, I can watch bottles falling from a wall so that I can be mildly amused

Scenario: should fall from the wall

   Given 100 green bottles are standing on the wall
   When 1 green bottle accidentally falls
   Then there are 99 green bottles standing on the wall
```

There can only be a single feature present in a file - it really doesn't make sense to have two, and you will be issued with an error if you try to include more than one.

### Annotations
Annotations can be added to a feature or scenario to enable you to do any kind of pre-processing required.  These take the form of either single value tags or key/value pairs and can be added like this:

bottles.feature
```
@Browser=chrome
@Theme=bottles

Feature: As a bystander
    I can watch bottles falling from a wall
    So that I can be mildly amused

@Pending
Scenario: should fall from the wall

   Given 100 green bottles are standing on the wall
   When 1 green bottle accidentally falls
   Then there are 99 green bottles standing on the wall
```

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
The regular expression is used to identify which steps are compatible with the input text, and to provide arguments to the function. You can specify step signatures using true RegExp object, which is handy if they contain lots of backslash characters. e.g.
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
An alternative way to make your regular expressions more rediable is to alias them. So instead of...
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
steps, or pass in define time variables such as an assertion library or 'done' function. The context is also optional.

It can be a chore to add a context to every step, so a common context can be specified at the interpreter and scenario levels too...
```js
 // Shared between all scenarios
new Yadda.yadda(library, ctx);

// Shared between all steps in this scenario
new Yadda.yadda(library).yadda('Some scenario', ctx, done);
```
If you specify multiple contexts they will be merged before executing the step.

#### Step Conflicts
One issue you find with BDD libraries, is that two steps might match the same input text. Usually this results in an error, and you end up having to add some extra text to one of the steps in order to differentiate it. Yadda attempts to minimise this in three ways.

1. By using the Levenshtein Distance to determine which step is the best match when clashes occur.

2. By allowing you to define steps in multiple libraries. Grouping steps into libraries not only helps keep a tidy code base, but also prevents clashes if you scenario doesn't require the library with the alternative step.

3. If you still have problems with clashing, you can use the term dictionary to make your regular expression more specific without affecting the readability of your step.

#### Events
Debugging BDD tests is typically harder than debugging unit tests, not least because you usually can't step through a feature file. You can make things a bit easier by adding event listeners, which log the step that is being executed.

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
