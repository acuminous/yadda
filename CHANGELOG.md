# Change Log

## [2.1.0]
- Update dependencies

## [2.0.1]
- Fix broken requires. See https://github.com/acuminous/yadda/pull/244. Thanks [nonlux](https://github.com/nonlux)

## [2.0.0]
- Fixes [bug](https://github.com/acuminous/yadda/issues/#243)
- No longer testing on node 4 and 5

## [1.5.1]
- Update dependencies
- Remove examples with insecure depenencies

## [1.5.0]
- Add support of programatically skipping mocha tests when using the step level plugin
- Fix examples in npm 5

## [1.4.0]
- Updated more dev deps including browserify

## [1.3.1]
- Updated dev dependencies
- Automated codeclimate

## [1.3.0]
- Ukranian Localisation - thanks [dedmazayukr](https://github.com/dedmazayukr).

## [1.2.0]
- Passing options through localised steps definition. See #232. Thanks [bogus34](https://github.com/bogus34).

## [1.1.1]
- npms didn't pick up the build

## [1.1.0]
- Switching to eslint

## [1.0.0]
- Tidy up
- Configuring Code Climate

## [0.22.1]
- Fixes [bug](https://github.com/acuminous/yadda/issues/#225) where errors returned by steps in jasmine were swallowed.
- Removed webdriver examples (webdriver.js is not longer maintained)

## [0.22.0]
- Fixes [bug](https://github.com/acuminous/yadda/issues/223) where errors thrown by synchronous steps were swallowed.

## [0.21.0]
- Converters can yield multiple values

## [0.20.0]
- Working around [this](https://github.com/mochajs/mocha/issues/2465) issue with mocha 3.

## [0.19.0]
- Removed dist from npm package

## [0.18.0]
- Closes #217 (using catch with promises)
- Closes #216 (improves step sync/async detection)

## [0.17.10]
- GLOBAL is dead. Long live global. Fixes [#215](https://github.com/acuminous/yadda/issues/215)

## [0.17.9]
- Registering in bower repo.

## [0.17.8]
- Adding the ability to report unused steps. See the report-unused-steps-example.

## [0.17.7]
- [simonihmig](https://github.com/simonihmig) reported and fixed a bug with the step selection routines which caused different behaviour in chrome and phantom.

## [0.17.6]
- Fixing a bug where the interpreter wasn't favoring an ambiguous step from the same library as the previous step

## [0.17.5]
- Supports mixed async and sync - Thanks [chrisns](https://github.com/chrisns)
- Steps can return promises - Thanks [chrisns](https://github.com/chrisns)
- Stopped casper integration throwing an exception when path module could not be found

## [0.17.4]
- Fixing a typo

## [0.17.3]
- Configurable placeholder characters used in example tables. Requested in [#203](https://github.com/acuminous/yadda/issues/203)

## [0.17.2]
- Karma support courtesy of [inf3rno](https://github.com/inf3rno). Thanks very much.
- Removed NODE_ENV=test which caused failures on windows.

## [0.17.1]
- Chinese Localisation - thanks [snowyu](https://github.com/snowyu).

## [0.17.0]
* Fixed a [bug](https://github.com/acuminous/yadda/issues/188) which discarded blank lines at the end of a multline step. If the scenario had multiple multline steps, then an ending blank line in the first step, was injected into the second step.

## [0.16.3]
* Fixed a [bug](https://github.com/acuminous/yadda/issues/187) introduced in 0.16.2 which meant Yadda picked the more undesirable step when two step implementations in the same library matches the step text.

## [0.16.2]
* When yadda find two matching steps with the same Levenshtein distance, it will prefer the one defined in the same library as the previous step.

## [0.16.1]
* Removed bind so phantom works without polyfill

## [0.16.0]
* Outer borders on data tables are ignored

## [0.15.5]
* Fixed but with the mocha ScenarioLevelPlugin which cased all tests to timeout

## [0.15.4]
* Dutch language support courtesy of [https://github.com/remkoboschker](remkoboschker). Thanks.

## [0.15.3]
* Step name included in context automatically courtesy of [remkoboschker](https://github.com/remkoboschker). Thanks.

## [0.15.2]
* Multiline Steps and data-table converters (multiline data tables are still a work in progress)
* Protractor example courtesy of [mgijsbertihodenpijl])[https://github.com/mgijsbertihodenpijl]. Thanks

## [0.15.1]
* Converted README into a gitbook
* Fixed a minor bug with example tables

## [0.15.0]
* Breaking Change: Multiline steps in scenarios and backgrounds

## [0.14.2]
* Example table meta fields for incorporating index, line and column values into your scenarios.

## [0.14.1]
* Dictionary converters can take multilpe arguments.

## [0.14.0]
* Dictionaries can be used to convert arguments into arbitary types. Integer, float and date converters are provided out of the box.

## [0.13.1]
* Fixes an issues where the new Annotations class broke moonraker

## [0.13.0]
* An amazing amount of work adding multiline example tables be [thr0w](http://github.com/thr0w).
* [thr0w](http://github.com/thr0w) also added annotation support to example tables.
* Breaking Change: In reworking some of [thr0w's](http://github.com/thr0w) example table code we added a breaking change around example table formating. You'll only notice if you centered column headings. If this feature is important to you then we suggest adding column separators to the outer left and right edges table, e.g.
```
|   one  |   two   |  three  |
| banana | orange  | apricot |
```
* Breaking Change: Annotations have been reworked into a class. If you access annotations you need to do so via the get method
```js
// Instead of
feature.annotations.pending
// Do
feature.annotations.get('pending')
```
Annotations can be requested using any case but are stored internally in lowercase. It is not longer valid for annotation names to contain spaces and non alhpanumerics are no longer converted to an underscore.
* Breaking Change: Removed deprecated mocha plugin
* Breaking Change: Background can no longer have descriptions
* If you're using a recent version of mocha in combination with the StepLevelPlugin aborted steps will be marked as Pending.

## [0.12.1]
* Adding @Only support to jasmine plugin

## [0.12.0]
* Removing deprecated mocha plugin.
* Allow the default language to be overriden. See https://github.com/acuminous/yadda/issues/102.

## [0.11.7]
* Portuguese language support courtesy of [https://github.com/thr0w](thr0w). Thanks.

## [0.11.6]
* Added console.log to request user feedback on whether [background descriptions](https://github.com/acuminous/yadda/issues/146) can be decprecated
* Improved examples

## [0.11.5]
* Russian language support kindly contributed by [vectart](https://github.com/vectart)

## [0.11.4]
* Added a friendlier syntax

## [0.11.3]
* Node is fixed. Removing warning about failing travis build from readme

## [0.11.2]
* Fix for [issue 120](https://github.com/acuminous/yadda/issues/120) - False positives with the new StepLevelPlugin

## [0.11.1]
* Scenarios created from example tables no longer share annotations. See [PR #119](https://github.com/acuminous/yadda/pull/119)

## [0.11.0]
* Removal of scenario descriptions which forced a blank line between scenario title and steps. See [issue #55](https://github.com/acuminous/yadda/issues/55)
* Deprecation of AsyncScenarioLevelPlugin, SyncScenarioLevelPlugin, AsyncStepLevelPlugin, SyncStepLevelPlugin. Use the new ScenarioLevelPlugin or StepLevelPlugin replacements instead
* Improved readme - Thanks [prokls](https://github.com/prokls)

## [0.10.14]
* Adding German language support - Thanks [prokls](https://github.com/prokls)

## [0.10.13]
* Locking down the webdriver examples to 2.41.x as (problems)[https://github.com/acuminous/yadda/issues/105] where reported with 2.42

## [0.10.12]
* Adds support for mocha's only feature to the Mocha plugin - see [issue-98](https://github.com/acuminous/yadda/issues/98)

## [0.10.11]
* Fixes [issue-97](https://github.com/acuminous/yadda/issues/97) - scenario annotations after a background caused the parser to fail.

## [0.10.10]
* Added a really basic example
* Added jshint

## [0.10.9]
* Fix for [issue-93](https://github.com/acuminous/yadda/issue/93). Thanks [simoami](https://github.com/simoami)

## [0.10.8]
* Fix for [issue-88](https://github.com/acuminous/yadda/issues/88)
* Removal of incorrect French translation for 'background'

## [0.10.7]
* The new mocha plugins can be passed a custom parser
* Polish language support - Thanks [macie](https://github.com/macie)
* A fix for multiline commments

## [0.10.6]
* Fix for [issue-82](https://github.com/acuminous/yadda/issues/82)
* Jasmine webdriver example

## [0.10.5]
* Supporting multiple variations of Pending annotation. See [issue 78](https://github.com/acuminous/yadda/issues/78)

## [0.10.4]
* Annotations can now be prefixed with a space. See [issue79](https://github.com/acuminous/yadda/issues/79)

## [0.10.3]
* The webdriver example uses new mocha plugin

## [0.10.2]
* Fixes to the mocha-sync and mocha-express examples
* Bower support - Thanks [jeffreytgilbert](http://github.com/jeffreytgilbert)
* Improved French localisation - Thanks [poum](http://github.com/poum)
* Improved README - Thanks [gblosser42](http://github.com/gblosser42)

## [0.10.1]
- Improved nodejs detection - Thanks [eXon](http://github.com/eXon)

## [0.10.0]
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

## [0.9.11]
 - Updated French translations - Thanks [poum](https://github.com/poum)

## [0.9.10]
 - You can use Scenario and Scenario Outline interchangeably

## [0.9.9]
 - Added an example using mocha and express

## [0.9.8]
 - Added support for component - thanks [johntron](https://github.com/johntron).

## [0.9.7]
 - Spanish localisation - thanks [feliun](https://github.com/feliun).

## [0.9.6]
 - Fix for [issue 43 - @Pending not working](https://github.com/acuminous/yadda/issues/43)
 - Improvements to French localsation and examples - thanks [ami44](https://github.com/ami44).

## [0.9.5]
 - Added Zombie JS example
 - Added Multi library example
 - Generally improved other examples

## [0.9.4]
 - Added FeatureFileSearch as discussed in https://github.com/acuminous/yadda/issues/47
 - Using npm link to install yadda for the examples
 - Yadda now lists undefined and ambiguous steps as discussed in https://github.com/acuminous/yadda/issues/30

## [0.9.3]
 - French localisation for example tables - thanks [ami44](https://github.com/ami44).

## [0.9.2]
 - Added package.json to the example projects so than can be run with ```npm install; npm test```

## [0.9.1]
 - French Localisation - thanks [ami44](https://github.com/ami44).

## [0.9.0]
 - Adds support for example tables
 - Fixes a bug in the MochaPlugin which didn't recognise non English @Pending annotations on scenarios
 - Adds both original and lowercase annotations to the feature / scenarios, so that code which accesses them looks more normal

## [0.8.6]
 - Fixes bug in qunit example contributed by [RaulMB](https://github.com/RaulMB

## [0.8.5]
 - Fixes to localisation contributed by [kjell](https://github.com/kjelloe).

## [0.8.4]
 - Improvements to localisation suggested by [kjell](https://github.com/kjelloe).

## [0.8.3]
 - Adds a FileSearch class so you can slurp feature files by directory and pattern instead of having to explicitly list them in your tests.

## [0.8.2]
 - Fixeds a bug in the mocha plugin output

## [0.8.1]
 - Any text between a Feature line and a Scenario line is ignored.
 - Added support for multiline comments
 - Norwegian Localisation - thanks [kjelloe](https://github.com/kjelloe).

## [0.8.0]
 - FeatureParser can be localised. Unfortunately this involved a breaking change to the Yadda.localisation.English API.
 Thankfully the adjustment is simple.
 ```js
// Old Code (< 0.8.0)
var library = new Yadda.localisation.English(optional_dictionary);

// New Code  (>= 0.8.0)
var library = Yadda.localisation.English.library(optional_dictionary);
```

## [0.7.2]
 - FeatureParser supports single line comments (any line where the first non whitespace character is #)

## [0.7.1]
 - Localised libraries slurp whitespace from the start of steps [Pull 31](https://github.com/acuminous/yadda/pull/31). Thanks [Hans](https://github.com/hans-d).

## [0.7.0]
 - TextParser renamed to FeatureParser as per [Issue 12](https://github.com/acuminous/yadda/issues/12).
 - StepParser added

## [0.6.5]
 - Dictionaries can now be merged

## [0.6.4]
 - This release adds jasmine examples

## [0.6.3]
 - This release adds selenium / webdriver examples, based on those created by [mrwiggles](https://github.com/mrwiggles) for [Issue 18](https://github.com/acuminous/yadda/issues/18).

## [0.6.2]
 - This release adds support for annotations on scenarios. Theses were previously only available on features. Support for simple annoations, e.g. @Pending, is also included.

## [0.6.1]
 - Yadda now throws Error objects instead of Strings. See [Issue #24](https://github.com/acuminous/yadda/issues/24).

## [0.6.0]
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
## [0.5.2]
 - Adds annoations to features in feature files. Thanks [mrwiggles](https://github.com/mrwiggles).

## [0.5.1]
 - Yadda now emits events, which can be useful for debugging. See the README.md for more details.

## [0.5.0]
 - This adds the feature title to the output from the text parser contributed by [akikhtenko](https://github.com/akikhtenko) (thanks). Since this changes the object structure returned by TextParser.parse() if you're using the TextParser directly rather than via the Mocha or Casper plugins, it's a breaking change, but the change is very minor...

```js
        var scenarios = parser.parse(text); // < 0.5.0
        var scenarios = parser.parse(text).scenarios; // >= 0.5.0
```

## [0.4.7]
 - The stable version of casperjs is no longer recommended by the casperjs author. It's also problematic to require modules. The latest version of casperjs (installed from master after 13th September 2013) fixes these problems, so I've updated the example to reflect this.

## [0.4.6]
 - Accepted pull request for feature blocks. See [Issue 8](https://github.com/acuminous/yadda/pull/8). Thanks [mrwiggles](https://github.com/mrwiggles).

## [0.4.5]
 - Fixed scenario parsing on windows bug. See [Issue 6](https://github.com/acuminous/yadda/issues/6). Thanks [grofit](https://github.com/grofit).

## [0.4.4]
 - Changed the CasperPlugin API

## [0.4.3]
 - Changed the MochaPlugin API

## [0.4.2]
 - TextParser no longer maintains state between parses

## [0.4.1]
 - Stopped pending asynchronous steps hanging the test run
 - Added mocha plugin

## [0.4.0]
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

## [0.3.0]
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
