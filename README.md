# Yadda

Yadda is BDD library for javascript. It integrates with other javascript testing frameworks such as QUnit and CasperJS.

## Usage

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
        <script src="./lib/yadda-0.2.0.js"></script>
        <script src="./lib/yadda-0.2.0-localisation.js"></script>
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
        <script src="./lib/yadda-0.2.0.js"></script>
        <script src="./lib/yadda-0.2.0-localisation.js"></script>
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

## 0.2.0 Release Notes

### Breaking API Changes

In previous version you invoked yadda with 
```js
    new Yadda(steps).yadda(["some scenario"]);
```
The equivalent syntax in 0.2.0 is
```js
    new Yadda().yadda(library).yadda(["some scenario"]);
```
where library is an instance of Yadda.Library
#### Combining Steps / Libraries
```js
    steps.importSteps(steps)
```
has been replaced with
```js
    new Yadda().yadda(libraries) // where libraries can be a single library or an array
```
alternatively you can do
```js
    var yadda = new Yadda().yadda();
    yadda.requires(libraries); // where libraries can be a single library or an array
```
#### Defining Steps
Previously you defined steps using the addStep method, or a given, when, then helper method, e.g.
```js
    steps.addStep('some text', function() {
        // Some code    
    })
```
Step.addStep has been replaced with Library.define
```js
    library.define('some text', function() {
        // Some code    
    })
```
and the helper methods are no longer available by default, but you can add them by including yadda-0.2.0-localisations.js and creating your libraries as instances of Yadda.Library.English, e.g.
```js
    var library = new Yadda.Library.English();
    library.given('a (\\d+) green bottles', function() {
        // TODO
    }).when('(\\d+) falls', function() {
        // TODO
    }).then('there are (\\d+) green bottles', function() {
        // TODO
    }); 
```
### New Features

#### Term Dictionary
The concept of a dictionary has been added to expand $terms embedded in step signatures. By defaut a $term expands to a wildcard group, i.e. (.+) but now you can define your own expansions, e.g.

```js
    var dictionary = new Yadda.Dictionary()
        .define('gender', '(male|female)')
        .define('speciaility', '(cardio|elderly|gastro)');

    var library = new Yadda.Library.English(dictionary)
        .given('a $gender, $speciality patient called $name', function() { /* TODO */ });
```
will expand to 
```js
"(?:[Gg]iven|[Aa]nd|[Ww]ith]|[Bb]ut) a (male|female), (cardio|elderly|gastro) patient called (.+)"
```
and therefore match "Given a female, elderly patient called Carol"

#### Step Signatures as RegEx objects
You can now specify step signatures using true RegExp (which is handy if they contain lots of backslash characters). This means that
```js
    var library = new Yadda.Library.English();
    library.given('a (\\d+) green bottles', function() {
        // TODO
    }).when('(\\d+) falls', function() {
        // TODO
    }).then('there are (\\d+) green bottles', function() {
        // TODO
    }); 
```
can be rewritten as 
```js
    var library = new Yadda.Library.English();
    library.given(/a (\d+) green bottles/, function() {
        // TODO
    }).when(/(\d+) falls/, function() {
        // TODO
    }).then(/there are (\d+) green bottles/, function() {
        // TODO
    }); 
```
#### Before and After callbacks
It is often useful to run some code before and/or after each scenario. Yadda supports this with before and after callbacks. e.g.
```js
    var yadda = new Yadda.yadda(patient_lib)
        .before(function() {
            // TODO
        })
        .after(function() {
            // TODO
        });
```
