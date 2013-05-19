# Yadda

Yadda brings _real_ BDD to JavaScript test frameworks such as [Mocha](http://visionmedia.github.io/mocha/), 
[QUnit](http://qunitjs.com), [Nodeunit](https://github.com/caolan/nodeunit) and [CasperJS](http://casperjs.org). 
By _real_ BDD we mean that the ordinary language (e.g. English) steps are mapped to code, as opposed to merely 
decorating it. This is important because _decorative_ steps such as those used by 
[Jasmine](http://pivotal.github.com/jasmine),  [Mocha](http://visionmedia.github.io/mocha) and [Vows](http://vowsjs.org), 
can fall out of date and are a form of duplication. If your code is easily readable you they offer little benefit 
beyond some nice reporting.

Yadda's BDD implementation is like [Cucumber's](http://cukes.info/) in that it maps the originary language steps to code. 
Not only are the steps less likely to go stale, but they also provide a valuable abstraction layer and encourage re-use. 
You could of course just use [CucumberJS](https://github.com/cucumber/cucumber-js), but we find Yadda less invasive and 
prefer it's flexible syntax to Gherkin's.

## Feature Files

Since JavaScript has no native file system access and we wanted Yadda to make no assumptions about how it is used, 
test scenarios are interpreted from arrays of strings. This doesn't mean that you can't use feature files from 
environments that support them (e.g. [node](http://nodejs.org)), just that you must parse the file into an array of 
steps first. 

## Quick Start

### Step 1 - Pick your testing framework (e.g. QUnit)

```html
<html>
    <head>
        <link rel="stylesheet" href="./lib/qunit.css">
        <script src="./lib/qunit.js"></script>   
        <script>
            test("100 green bottles", function() {
                // TODO - Write the test
            });
        </script>
    </head>
    <body>
        <div id="qunit"></div>
    </body>
</html>
```

### Step 2 - Implement your test using yadda

```html
<html>
    <head>
        <link rel="stylesheet" href="./lib/qunit.css">
        <script src="./lib/qunit.js"></script>   
        <script src="./lib/yadda-0.2.2.js"></script>
        <script src="./lib/yadda-0.2.2-localisation.js"></script>
        <script>
            test("100 green bottles", function() {
                new Yadda.yadda(/* TODO - Create the step library */).yadda([
                    "Given 100 green bottles are standing on the wall",
                    "when 1 green bottle accidentally falls",
                    "then there are 99 green bottles standing on the wall"
                ]);
            });
        </script>
    </head>
    <body>
        <div id="qunit"></div>
    </body>
</html>
```

### Step 3 - Implement the test steps

```html
<html>
    <head>
        <link rel="stylesheet" href="./lib/qunit.css">
        <script src="./lib/qunit.js"></script>   
        <script src="./lib/yadda-0.2.2.js"></script>
        <script src="./lib/yadda-0.2.2-localisation.js"></script>
        <script src="./lib/wall.js"></script>
        <script>
           var library = new Yadda.Library.English()
                .given("$NUM green bottles are standing on the wall", function(number) {
                    wall = new Wall(number);
                })                
                .when("$NUM green bottle accidentally falls", function(number) { 
                    wall.fall(number);
                })
                .then("there are $NUM green bottles standing on the wall", function(number) {
                    equal(number, wall.bottles);
                });
                
            test("100 green bottles", function() {
                new Yadda.yadda(library).yadda([
                    "Given 100 green bottles are standing on the wall",
                    "when 1 green bottle accidentally falls",
                    "then there are 99 green bottles standing on the wall"
                ]);
            });                
        </script>
    </head>
    <body>
        <div id="qunit"></div>
    </body>
</html>
```
## Features

### Supported Libraries
Yadda works with QUnit, Nodeunit, Mocha and CasperJS. See the examples for details.

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
However we think that Given/When/Then (along with And/But/With) is a good starting point, so we recommend including yadda-0.2.2-localisation.js and using Yadda.Library.English instead of the vanilla Yadda.Library. This adds 'given', 'when', 'then', 'and', 'but' and 'with' helper methods, enabling you to define your steps as follows...
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
### Step Anatomy
A step is made up of a regular expression, a function and context. 

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

#### Functions
The function is the code you want to execute for a specific line of text. If you don't specify a function then a no-op function will be used.

#### Contexts (Shared State)
The context will be bound with the function before it is executed and provides a non global way to share state between steps, or pass in define time variables such as an assertion library. The context is also optional.

It can be a chore to add a context to every step, so a common context can be specified at the interpreter and scenario levels too...
```js
 // Shared between all scenarios
new Yadda.yadda(library, ctx);

// Shared between all steps in this scenario
new Yadda.yadda(library).yadda('Some scenario', ctx);
```
If you specify multiple contexts they will be merged before executing the step.

#### Terms
Regular expressions can get pretty ugly, so it's often preferable to relax the regex and use a $term variable which will be replaced with a wildcard i.e. '(.+)'.

```js
var library = new Yadda.Library.English()
    .given(/$NUM green bottles standing on the wall/, function(n) {
        // some code
    }); 
```
Using $term variables can relax the regular expression too much and cause clashes between steps. Yadda 0.2.0 provides greater control over the expansion through use of a dictionary, e.g.

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
#### Step Management
One issue you find with BDD libraries, is that two steps might match the same input text. Usually this results in an error, and you end up having to add some extra text to one of the steps in order to differentiate it. Yadda attempts to minimise this in three ways.

1. By using the Levenshtein Distance to determine which step is the best match when clashes occur.

2. By allowing you to define steps in multiple libraries. Grouping steps into libraries not only helps keep a tidy code base, but also prevents clashes if you scenario doesn't require the library with the alternative step.

2. If you still have problems with clashing, you can use the term dictionary to make your regular expression more specific without affecting the readability of your step.

#### Before and After callbacks
It is often useful to run some code before and/or after each scenario. Yadda supports this with before and after callbacks. e.g.
```js
var yadda = new Yadda.yadda(libraries)
    .before(function() {
        // some code
    })
    .after(function() {
        // some code
    });
```
The .before and .after functions are bound to the context if one is supplied.
```js
var yadda = new Yadda.yadda(libraries, {msg1: 'hello'})
    .before(function() {
        this.msg1 == 'hello';
        this.msg2 == 'goodbye';
    })
    .after(function() {
        this.msg1 == 'hello';
        this.msg2 == 'goodbye';        
    })
    .yadda('Some scenario', {msg2: 'goodbye'});
```

## 0.2.2 Release Notes

## 0.2.1 Release Notes

- Added a CoffeeScript example
- Added a Nodeunit example
- Added a Mocha example
- Added a new context variable to the interpret method. See Nodeunit example for usage.
- Ensured that Yadda.after is called even if an error occurs
- Fixed distance_table typo

## 0.2.0 Release Notes

### Breaking API Changes

In Yadda 0.1.0 you invoked yadda with 
```js
new Yadda(steps).yadda(["some scenario"]);
```
The equivalent syntax in 0.2.2 is
```js
new Yadda.yadda(library).yadda(["some scenario"]);
```
where library is an instance of Yadda.Library
#### Combining Steps / Libraries
```js
var steps = new Steps();
steps.importSteps(other_steps);
var yadda = new Yadda(steps);
```
Now you pass yadda an array of libraries instead of a single merged one
```js
var lib1 = new Yadda.Library();
var lib2 = new Yadda.Library();
var yadda = new Yadda().yadda([lib1, lib2]);
```
alternatively you can do
```js
var yadda = new Yadda.yadda();
yadda.requires(lib1);
yadda.requires(lib2);
```
or
```js
var yadda = new Yadda.yadda();
yadda.requires([lib1, lib2]);
```
#### Defining Steps
Previously you defined steps using the addStep method, or a given, when, then helper method, e.g.
```js
steps.addStep('some text', function() {
    // some code    
})
```
Step.addStep has been replaced with Library.define
```js
library.define('some text', function() {
    // some code    
})
```
The helper methods are no longer available by default, but you can restore them by including yadda-0.2.2-localisation.js and creating your libraries as instances of Yadda.Library.English, e.g.
```js
var library = new Yadda.Library.English()
    .given('a (\\d+) green bottles', function() {
        // some code
    }).when('(\\d+) falls', function() {
        // some code
    }).then('there are (\\d+) green bottles', function() {
        // some code
    }); 
```
