# Yadda
Yadda brings _true_ BDD to JavaScript test frameworks such as [Jasmine](http://pivotal.github.io/jasmine/), [Mocha](http://visionmedia.github.io/mocha/), [QUnit](http://qunitjs.com), [Nodeunit](https://github.com/caolan/nodeunit) and [CasperJS](http://casperjs.org). By _true_ BDD we mean that the ordinary language (e.g. English) steps are mapped to code, as opposed to simply decorating it. This is important because just like comments, the decorative steps such as those used by 
[Jasmine](http://pivotal.github.com/jasmine), [Mocha](http://visionmedia.github.io/mocha) and [Vows](http://vowsjs.org), can fall out of date and are a form of duplication.

Yadda's BDD implementation is like [Cucumber's](http://cukes.info/) in that it maps the ordinary language steps to code. Not only are the steps less likely to go stale, but they also provide a valuable abstraction layer and encourage re-use. You could of course just use [CucumberJS](https://github.com/cucumber/cucumber-js), but we find Yadda less invasive and prefer it's flexible syntax to Gherkin's. Yadda's conflict resolution is smarter too.

## Installation
Yadda 0.4.2 is the current verison. It contains breaking API changes from the previous minor version (0.3.0). See the release notes for more details.

### Node based environments (e.g. Mocha)
```
npm install yadda
```
### Browser based environments (e.g. QUnit)
```html
<script src="./lib/yadda-0.4.2.js"></script>
```
## Writing Yadda Tests
### Step 1 - Write your scenarios
bottles-spec.txt
```
Scenario: should fall from the wall

   Given 100 green bottles are standing on the wall
   When 1 green bottle accidentally falls
   Then there are 99 green bottles standing on the wall	
```
(You aren't restricted to just Given/When/Then. You can use any words you like)

### Step 2 - Implement the step library
bottles-library.js
```js
var assert = require('assert');
var Library = require('yadda').localisation.English;

module.exports = (function() {
  var library = new Library()
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

### Step 3 - Integrate Yadda with your testing framework (e.g. Mocha)
bottles-test.js
```js
var Yadda = requre('yadda').Yadda;
var feature = ('yadda').plugins.MochaPlugin().feature;
var library = require('./bottles-library');
var yadda = new Yadda(library);

feature(yadda, 'Bottles', './bottles-spec.txt');
```

### Step 4 - Run your tests
```
  mocha --reporter spec bottles-test.js

  Bottles
    ✓ should fall from the wall 
```

## Features
### Supported Libraries
Yadda works with Mocha, Jasmine, QUnit, Nodeunit, ZombieJS and CasperJS. See the examples for details.

### Synchronous or Asynchronous
Yadda is designed to work synchronously or asynchronously. If your steps and test framework are synchronous you don't need to specify the 'done' callback
```js
    var library = new Library()
      .given("$NUM green bottles are standing on the wall", function(number) {
         wall = new Wall(number);
      })                
      .when("$NUM green bottle accidentally falls", function(number) { 
         wall.fall(number);
      })
      .then("there are $NUM green bottles standing on the wall", function(number) {
         assert.equal(number, wall.bottles);
      });
    ...
    yadda.yadda(scenario.steps);
```

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
However we think that Given/When/Then (along with And/But/With) is a good starting point, so we recommend using Yadda.localisation.English instead of the vanilla Yadda.Library. This adds 'given', 'when', 'then', 'and', 'but' and 'with' helper methods, enabling you to define your steps as follows...
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
We'd be delighted to accept pull requests for more languages and dialects.

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
var library = new Yadda.Library.English()
    .given(/^(\d+) green bottle(?:s){0,1} standing on the wall$/, function(n) {
        // some code
    }); 
```
Regular expressions can get pretty ugly, so it's often preferable to relax the regex and use a $term variable which will be replaced with a wildcard i.e. '(.+)'.
```js
var library = new Yadda.Library.English()
    .given(/$NUM green bottles standing on the wall/, function(n) {
        // some code
    }); 
```
Using $term variables can relax the regular expression too much and cause clashes between steps. Yadda provides greater control over the expansion through use of a dictionary, e.g.
```js
var dictionary = new Yadda.Dictionary()
    .define('gender', '(male|female)')
    .define('speciaility', '(cardio|elderly|gastro)');

var library = new Yadda.Library.English(dictionary)
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

var library = new Yadda.Library.English(dictionary)
    .given('a street address of $address_line_1', function(number, street) { /* some code */ });   
```
will expand to
```js
"(?:[Gg]iven|[Aa]nd|[Ww]ith]|[Bb]ut) a street address of (\d+) (\w+)"
```

#### Functions
The function is the code you want to execute for a specific line of text. If you don't specify a function then a no-op 
function will be used, which is Yadda's way of implementing a 'Pending' step.

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
