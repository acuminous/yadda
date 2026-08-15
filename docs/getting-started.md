# Getting Started

Yadda's job is to translate arrays of text (usually called _steps_) into function calls.

```js
import Yadda from 'yadda';

const { ContextParamLibrary, createInstance } = Yadda;

const steps = ['Step 1', 'Step 2', 'Step 3'];

const library = new ContextParamLibrary().define(/Step (\d+)/, (ctx, number) => {
  console.log('Step', number);
});

createInstance(library).run(steps);
```

Running the above from a [Node.js](https://nodejs.org/) shell (after installing Yadda) is the minimum it takes to get Yadda working. To get the most out of it, though, you'll usually integrate it with a test runner such as [node:test](https://nodejs.org/api/test.html), [Mocha](https://mochajs.org/) or [Jasmine](https://jasmine.github.io/).

## Installation

```
npm install --save-dev yadda
```

Yadda 3.0 requires **Node.js >= 20** and is **Node-only** — the in-browser bundles that shipped with 2.x were removed. If you are upgrading, see [Migrating to 3.0](migrating-to-3.md).

## The Core Objects

Yadda is designed to be used programmatically and plugged into your application or test runner. There are three core objects.

### The Interpreter

The interpreter iterates over arrays of strings, executing the function associated with each string, passing it parameters parsed from that string.

```js
import Yadda from 'yadda';

const { createInstance } = Yadda;

const steps = ['Step 1', 'Step 2', 'Step 3'];
createInstance(library).run(steps);
```

### Step Libraries

Step libraries hold the mapping between strings and functions. The mapping key is a regular expression, which can also parse parameters out of the incoming string.

```js
import Yadda from 'yadda';

const { ContextParamLibrary } = Yadda;

const library = new ContextParamLibrary().define(/Step (\d+)/, (ctx, number) => {
  console.log('Step', number);
});
```

See [Step Libraries](step-libraries.md) for the full story.

### Dictionaries

Dictionaries simplify steps, let you re-use regular expressions, and convert parameters to a desired type.

```js
import Yadda from 'yadda';

const { Dictionary, ContextParamLibrary, converters } = Yadda;

const dictionary = new Dictionary().define('num', /(\d+)/, converters.integer);

const library = new ContextParamLibrary(dictionary).define('Step $num', (ctx, number) => {
  // `number` is a real integer, not a string
});
```

See [Dictionaries](dictionaries.md) for more.

## The Feature Parser

Yadda's most frequent use case is BDD testing, where instead of arrays of strings you supply feature specifications. The `FeatureParser` converts a text-based feature specification into a feature object whose scenarios and steps can be iterated over and passed to the interpreter.

```js
import fs from 'node:fs';
import Yadda from 'yadda';

const { createInstance, parsers } = Yadda;

const yadda = createInstance(library);
const specification = fs.readFileSync('path/to/example.feature', 'utf8');
const feature = new parsers.FeatureParser().parse(specification);

console.log(feature.title);
feature.scenarios.forEach((scenario) => {
  console.log(scenario.title);
  yadda.run(scenario.steps, {});
});
```

In practice you rarely wire this up by hand — the [plugins](plugins.md) do it for you and integrate the results with your test runner. See the [examples](../examples) directory for complete, runnable setups.
