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
    new Yadda(steps).yadda("some scenario");
```
The equivalent syntax in 0.2.0 is
```js
    new Yadda().yadda(library).yadda("some scenario");
```
Where library is an instance of Yadda.Library (or Yadda.Library.English if you want the given/when/then helper methods)
Combining Steps / Libraries
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
Furthermore
```js
    steps.addStep('some text', function() {
        // Some code    
    })
```
has been replaced with 
```js
    library.define('some text', function() {
        // Some code    
    })
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
and therefore match "Given a male, cardiovascular patient called Steve"

#### Step Signatures can be RegEx objects
You can now specify step signatures using true regexs (which is handy if they contain lots of backslash characters)
```js
    var library = new Yadda.Library.English(dictionary)
        .given(/(\d+) (\w+) bottles standing on a wall/, function() { /* TODO */ });
```
