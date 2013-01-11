# Yadda

Yadda is BDD library for javascript. It integrates with other javascript testing frameworks such as QUnit and CasperJS.

## Usage

### Step 1 - Pick your testing framework (e.g. QUnit)

```js
<html>
    <head>
        <link rel="stylesheet" href="./lib/qunit.css">
        <script src="./lib/qunit.js"></script>   
        <script>
            test("100 green bottles", function() {
                // TODO 
            });
        </script>
    </head>
    <body>
        <div id="qunit"></div>
    </body>
</html>
```

### Step 2 - Implement your test using yadda

```js
<html>
    <head>
        <link rel="stylesheet" href="./lib/qunit.css">
        <script src="./lib/qunit.js"></script>   
        <script src="./lib/yadda.js"></script>
        <script>
            var steps = new Steps();
            var yadda = new Yadda(steps);
            test("100 green bottles", function() {
                yadda.yadda([
                    "given that there are 100 green bottles sitting on the wall",
                    "when 1 bottle accidentally falls",
                    "then there should be 99 green bottles sitting on the wall"
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

```js
<html>
    <head>
        <link rel="stylesheet" href="./lib/qunit.css">
        <script src="./lib/qunit.js"></script>   
        <script src="./lib/yadda.js"></script>
        <script>

            var steps = new Steps();
            steps.given("(\\d+) green bottles are standing on the wall", function(initial) { 
                numBottles = initial;
            });
            steps.when("(\\d+) green bottle should accidentally fall", function(falling) { 
                numBottles = numBottles - falling;
            });
            steps.then("there are (\\d+) green bottles standing on the wall", function(remaining) { 
                ok(remaining == count);
            });

            var yadda = new Yadda(steps);
            test("100 green bottles", function() {
                yadda.yadda([
                    "given that there are 100 green bottles sitting on the wall",
                    "when 1 bottle accidentally falls",
                    "then there should be 99 green bottles sitting on the wall"
                ]);
            });
        </script>
    </head>
    <body>
        <div id="qunit"></div>
    </body>
</html>
```
