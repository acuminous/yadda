# Release Notes

## Yadda 0.11.5
* Russian language support kindly contributed by [vectart](https://github.com/vectart)

## Yadda 0.11.4
* Added a friendlier syntax

## Yadda 0.11.3
* Node is fixed. Removing warning about failing travis build from readme

## Yadda 0.11.2
* Fix for [issue 120](https://github.com/acuminous/yadda/issues/120) - False positives with the new StepLevelPlugin

## Yadda 0.11.1
* Scenarios created from example tables no longer share annotations. See [PR #119](https://github.com/acuminous/yadda/pull/119)

## Yadda 0.11.0
* Removal of scenario descriptions which forced a blank line between scenario title and steps. See [issue #55](https://github.com/acuminous/yadda/issues/55)
* Deprecation of AsyncScenarioLevelPlugin, SyncScenarioLevelPlugin, AsyncStepLevelPlugin, SyncStepLevelPlugin. Use the new ScenarioLevelPlugin or StepLevelPlugin replacements instead
* Improved readme - Thanks [prokls](https://github.com/prokls)

## Yadda 0.10.14
* Adding German language support - Thanks [prokls](https://github.com/prokls)

## Yadda 0.10.13
* Locking down the webdriver examples to 2.41.x as (problems)[https://github.com/acuminous/yadda/issues/105] where reported with 2.42

## Yadda 0.10.12
* Adds support for mocha's only feature to the Mocha plugin - see [issue-98](https://github.com/acuminous/yadda/issues/98)

## Yadda 0.10.11
* Fixes [issue-97](https://github.com/acuminous/yadda/issues/97) - scenario annotations after a background caused the parser to fail.

## Yadda 0.10.10
* Added a really basic example
* Added jshint

## Yadda 0.10.9
* Fix for [issue-93](https://github.com/acuminous/yadda/issue/93). Thanks [simoami](https://github.com/simoami)

## Yadda 0.10.8
* Fix for [issue-88](https://github.com/acuminous/yadda/issues/88)
* Removal of incorrect French translation for 'background'

## Yadda 0.10.7
* The new mocha plugins can be passed a custom parser
* Polish language support - Thanks [macie](https://github.com/macie)
* A fix for multiline commments

## Yadda 0.10.6
* Fix for [issue-82](https://github.com/acuminous/yadda/issues/82)
* Jasmine webdriver example

## Yadda 0.10.5
* Supporting multiple variations of Pending annotation. See [issue 78](https://github.com/acuminous/yadda/issues/78)

## Yadda 0.10.4
* Annotations can now be prefixed with a space. See [issue79](https://github.com/acuminous/yadda/issues/79)

## Yadda 0.10.3
* The webdriver example uses new mocha plugin

## Yadda 0.10.2
* Fixes to the mocha-sync and mocha-express examples
* Bower support - Thanks [jeffreytgilbert](http://github.com/jeffreytgilbert)
* Improved French localisation - Thanks [poum](http://github.com/poum)
* Improved README - Thanks [gblosser42](http://github.com/gblosser42)

## Yadda 0.10.1
- Improved nodejs detection - Thanks [eXon](http://github.com/eXon)

## Yadda 0.10.0
 - Added support for backgrounds - Thanks [mucsi](http://github.com/mucsi)
 - Added support for step level output in mocha tests - Thanks [simoami](http://github.com/simoami)
 - Fixed a few minor bugs in the FeatureParser
 - This release involves a complete rewrite of the mocha/jasmine plugin. The old plugin will be deprecated in 0.12.0.
   The replacement syntax is:
```
var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncScenarioLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {

    // Previously features(file, function(feature))
    featureFile(file, function(feature) {

        var library = require('./bottles-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario, done) {
            yadda.yadda(scenario.steps, done);
        });
    });
});
```
To get step level output use SyncStepLevelPlugin or AsyncStepLevelPlugin as appropriate, e.g.
```
var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {

    // Previously features(file, function(feature))
    featureFile(file, function(feature) {

        var library = require('./bottles-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                yadda.yadda(step, done);
            })
        });
    });
});
```

## Yadda 0.9.11
 - Updated French translations - Thanks [poum](https://github.com/poum)

## Yadda 0.9.10
 - You can use Scenario and Scenario Outline interchangeably

## Yadda 0.9.9
 - Added an example using mocha and express

## Yadda 0.9.8
 - Added support for component - thanks [johntron](https://github.com/johntron).

## Yadda 0.9.7
 - Spanish localisation - thanks [feliun](https://github.com/feliun).

## Yadda 0.9.6
 - Fix for [issue 43 - @Pending not working](https://github.com/acuminous/yadda/issues/43)
 - Improvements to French localsation and examples - thanks [ami44](https://github.com/ami44).

## Yadda 0.9.5
 - Added Zombie JS example
 - Added Multi library example
 - Generally improved other examples

## Yadda 0.9.4
 - Added FeatureFileSearch as discussed in https://github.com/acuminous/yadda/issues/47
 - Using npm link to install yadda for the examples
 - Yadda now lists undefined and ambiguous steps as discussed in https://github.com/acuminous/yadda/issues/30

## Yadda 0.9.3
 - French localisation for example tables - thanks [ami44](https://github.com/ami44).

## Yadda 0.9.2
 - Added package.json to the example projects so than can be run with ```npm install; npm test```

## Yadda 0.9.1
 - French Localisation - thanks [ami44](https://github.com/ami44).

## Yadda 0.9.0
 - Adds support for example tables
 - Fixes a bug in the MochaPlugin which didn't recognise non English @Pending annotations on scenarios
 - Adds both original and lowercase annotations to the feature / scenarios, so that code which accesses them looks more normal

## Yadda 0.8.6
 - Fixes bug in qunit example contributed by [RaulMB](https://github.com/RaulMB

## Yadda 0.8.5
 - Fixes to localisation contributed by [kjell](https://github.com/kjelloe).

## Yadda 0.8.4
 - Improvements to localisation suggested by [kjell](https://github.com/kjelloe).

## Yadda 0.8.3
 - Adds a FileSearch class so you can slurp feature files by directory and pattern instead of having to explicitly list them in your tests.

## Yadda 0.8.2
 - Fixeds a bug in the mocha plugin output

## Yadda 0.8.1
 - Any text between a Feature line and a Scenario line is ignored.
 - Added support for multiline comments
 - Norwegian Localisation - thanks [kjelloe](https://github.com/kjelloe).

## Yadda 0.8.0
 - FeatureParser can be localised. Unfortunately this involved a breaking change to the Yadda.localisation.English API.
 Thankfully the adjustment is simple.
 ```js
// Old Code (< 0.8.0)
var library = new Yadda.localisation.English(optional_dictionary);

// New Code  (>= 0.8.0)
var library = Yadda.localisation.English.library(optional_dictionary);
```

## Yadda 0.7.2
 - FeatureParser supports single line comments (any line where the first non whitespace character is #)

## Yadda 0.7.1
 - Localised libraries slurp whitespace from the start of steps [Pull 31](https://github.com/acuminous/yadda/pull/31). Thanks [Hans](https://github.com/hans-d).

## Yadda 0.7.0
 - TextParser renamed to FeatureParser as per [Issue 12](https://github.com/acuminous/yadda/issues/12).
 - StepParser added

## Yadda 0.6.5
 - Dictionaries can now be merged

## Yadda 0.6.4
 - This release adds jasmine examples

## Yadda 0.6.3
 - This release adds selenium / webdriver examples, based on those created by [mrwiggles](https://github.com/mrwiggles) for [Issue 18](https://github.com/acuminous/yadda/issues/18).

## Yadda 0.6.2
 - This release adds support for annotations on scenarios. Theses were previously only available on features. Support for simple annoations, e.g. @Pending, is also included.

## Yadda 0.6.1
 - Yadda now throws Error objects instead of Strings. See [Issue #24](https://github.com/acuminous/yadda/issues/24).

## Yadda 0.6.0
 - Fix for [Issue #23](https://github.com/acuminous/yadda/issues/23) which prevented the scenario context being shared between steps when using the Mocha plugin. The plugin API was made clearer at the same time, which unfortunately necessitated breaking changes. The following demonstrates how to migrate < 0.6 mocha tests to the 0.6 api.

&lt; 0.6.0
```js
var Yadda = require('yadda');
Yadda.plugins.mocha();
var library = require('./bottles-library');
var yadda = new Yadda.Yadda(library);

yadda.mocha('Bottles', './spec/bottles-spec.txt');
```
&gt;= 0.6.0

```js
var Yadda = require('yadda');
Yadda.plugins.mocha();

feature('./features/bottles.feature', function(feature) {

    var library = require('./bottles-library');
    var yadda = new Yadda.Yadda(library);

    scenarios(feature.scenarios, function(scenario, done) {
        yadda.yadda(scenario.steps, done);
    });
});
```
## Yadda 0.5.2
 - Adds annoations to features in feature files. Thanks [mrwiggles](https://github.com/mrwiggles).

## Yadda 0.5.1
 - Yadda now emits events, which can be useful for debugging. See the README.md for more details.

## Yadda 0.5.0
 - This adds the feature title to the output from the text parser contributed by [akikhtenko](https://github.com/akikhtenko) (thanks). Since this changes the object structure returned by TextParser.parse() if you're using the TextParser directly rather than via the Mocha or Casper plugins, it's a breaking change, but the change is very minor...

```js
        var scenarios = parser.parse(text); // < 0.5.0
        var scenarios = parser.parse(text).scenarios; // >= 0.5.0
```

## Yadda 0.4.7
 - The stable version of casperjs is no longer recommended by the casperjs author. It's also problematic to require modules. The latest version of casperjs (installed from master after 13th September 2013) fixes these problems, so I've updated the example to reflect this.

## Yadda 0.4.6
 - Accepted pull request for feature blocks. See [Issue 8](https://github.com/acuminous/yadda/pull/8). Thanks [mrwiggles](https://github.com/mrwiggles).

## Yadda 0.4.5
 - Fixed scenario parsing on windows bug. See [Issue 6](https://github.com/acuminous/yadda/issues/6). Thanks [grofit](https://github.com/grofit).

## Yadda 0.4.4
 - Changed the CasperPlugin API

## Yadda 0.4.3
 - Changed the MochaPlugin API

## Yadda 0.4.2
 - TextParser no longer maintains state between parses

## Yadda 0.4.1
 - Stopped pending asynchronous steps hanging the test run
 - Added mocha plugin

## Yadda 0.4.0
 - Yadda now supports both asynchronous and synchronous usage
 - Deleted the before and after hook (after cannot be guaranteed to run when asynchronous)

### Breaking API Changes
#### Removal of before and after hooks
The before and after hooks have been removed because after cannot be guaranteed to run when yadda
is asynchronous. Use your test runner's before and after mechanism instead.

#### Removal of non-object contexts
You can no longer pass non-object contexts to yadda, i.e. instead of...
```js
library.define('blah blah blah') function() {
    this.assert();
});
new Yadda(library).('blah blah blah', test);
```
Do...
```js
library.define('blah blah blah') function() {
    this.test.assert();
});
new Yadda(library).('blah blah blah', { test: test });
```

## Yadda 0.3.0
  - Re-implemented as a nodejs module
  - Used browserify for compatability with browser test frameworks like qunit

### Breaking API Changes
Yadda has been re-implemented as a nodejs module. This means that the
global 'Yadda' prefixed class names are no longer exposed and that
all Yadda classes must be explicitly 'required'

In a node environment this is straightforward...
```
npm install yadda
```
```js
var Yadda = require('yadda').Yadda;
var Library = require('yadda').Library;

var library = new Library();
library.given('$NUM bottles of beer', function(n) {
  console.log(n + ' ' + 'bottles of beer');
})
new Yadda(library).yadda('100 bottles of beer');
```

Thanks to browserify it straightforward from a browser environment too...

```html
<head>
  <script src="http://www.github.com/acuminous/yadda/dist/yadda-0.3.0.js"></script>
  <script type="text/javascript">
    var Yadda = require('yadda').Yadda;
    var Library = require('yadda').Library;

    var library = new Library();
    library.given('$NUM bottles of beer', function(n) {
      console.log(n + ' ' + 'bottles of beer');
    })
    new Yadda(library).yadda('100 bottles of beer');
  </script>
</head>
```

In a CasperJS environment it's less straightforward. We haven't found how to get casper to
understand commonjs or umd node modules and Casper's 'require' function clashes with the one created by browserify. For the moment we're working around this with the following ugly hack...
```
var oldRequire = require;
phantom.injectJs('../../dist/yadda-0.3.0.js');
window.Yadda = require('yadda').Yadda;
window.CasperPlugin = require('yadda').plugins.CasperPlugin;
window.Library = require('yadda').Library;
window.require = oldRequire;

library.given('$NUM bottles of beer', function(n) {
  console.log(n + ' ' + 'bottles of beer');
};
var yadda = new Yadda(library).yadda('100 bottles of beer');
casper = new CasperPlugin(yadda, casper).init();
```

## Yadda  0.2.2

- Added a feature file parser
- Improved documentation and examples

## Yadda  0.2.1

- Added a CoffeeScript example
- Added a Nodeunit example
- Added a Mocha example
- Added a new context variable to the interpret method. See Nodeunit example for usage.
- Ensured that Yadda.after is called even if an error occurs
- Fixed distance_table typo

## Yadda  0.2.0

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
var library = Yadda.Library.English.library()
    .given('a (\\d+) green bottles', function() {
        // some code
    }).when('(\\d+) falls', function() {
        // some code
    }).then('there are (\\d+) green bottles', function() {
        // some code
    });
```
