# API Reference

Everything is reached through the single entry point:

```js
import Yadda from 'yadda';
```

## Top-level

| Member | Description |
|---|---|
| `Yadda.Yadda` | The interpreter constructor. Usually created via `createInstance`. |
| `Yadda.createInstance(libraries, [interpreterContext])` | Creates a `Yadda` interpreter for one or more libraries. `libraries` may be a single library or an array. |
| `Yadda.ContextParamLibrary` | Step library that passes the context as the first step argument (arrow-friendly). |
| `Yadda.ContextBoundLibrary` | Step library that binds the context to `this`. |
| `Yadda.Library` | Deprecated alias for `ContextBoundLibrary`. |
| `Yadda.Dictionary` | Reusable terms and converters. |
| `Yadda.Interpreter` | The lower-level scenario interpreter. |
| `Yadda.Context` | The context object merged and handed to steps. |
| `Yadda.EventBus` | Singleton event bus for scenario/step/execute events. |
| `Yadda.FeatureFileSearch` | Finds `.feature` files under a directory. |
| `Yadda.FileSearch` | Generic file search used by `FeatureFileSearch`. |
| `Yadda.localisation` | Localisations (see [Localisation](localisation.md)). |
| `Yadda.converters` | Built-in dictionary converters. |
| `Yadda.parsers` | Feature-file parsers. |
| `Yadda.plugins` | Test-runner plugins (see [Plugins](plugins.md)). |

## Yadda (the interpreter)

```js
import Yadda from 'yadda';

const { createInstance } = Yadda;

const yadda = createInstance(library);
```

| Method | Description |
|---|---|
| `yadda.run(scenario, [context], [next])` | Interprets an array of steps (or a single step). `context` merges over the interpreter context; omit `next` for synchronous runs. Alias: `yadda.yadda`. |
| `yadda.requires(libraries)` | Adds more libraries to the interpreter. Returns `this`. |

## Step Libraries

Constructors: `new Yadda.ContextParamLibrary([dictionary])`, `new Yadda.ContextBoundLibrary([dictionary])`.

| Method | Description |
|---|---|
| `.define(signatures, [fn], [macroContext], [options])` | Maps a signature (string, `RegExp`, or array of either) to a function. Omit `fn` for a pending (skipped) step. `options.mode` may be `'sync'`, `'async'` or `'promise'` for variadic steps. Returns the library. |
| `.get_macro(signature)` | Returns the macro identified by a signature, if any. |
| `.find_compatible_macros(step)` | Returns the macros that can interpret a step. |

After wrapping with a [localisation](localisation.md), a library also gains `given`, `when` and `then`, which behave like `define` with the keyword prefixed.

## Dictionary

```js
import Yadda from 'yadda';

const { Dictionary } = Yadda;

const dictionary = new Dictionary();
```

| Method | Description |
|---|---|
| `.define(name, [regexp], [converter])` | Defines a term. The pattern may reference other terms (e.g. `'$street, $postcode'`). A converter reshapes or sources the matched value. Returns the dictionary. |
| `.expand(signature)` | Expands terms within a signature into their underlying patterns. |

### Converters (`Yadda.converters`)

`integer`, `float`, `date`, `list`, `table`, `pass_through`. A custom converter is either a callback function `(group1, group2, …, cb)` that calls `cb(err, value)`, or an `async` function `(group1, group2, …)` that returns (or resolves to) the value.

## FeatureFileSearch

```js
import Yadda from 'yadda';

const { FeatureFileSearch } = Yadda;

new FeatureFileSearch('./test/features').each((file) => { /* ... */ });
```

| Method | Description |
|---|---|
| `.each(iterator)` | Invokes `iterator(file)` for every `.feature` file found under the path. |

## FeatureParser

```js
import Yadda from 'yadda';

const { parsers } = Yadda;

const feature = new parsers.FeatureParser([options]).parse(text, [next]);
```

`options` may be a localisation (or `{ language, leftPlaceholderChar, rightPlaceholderChar }`). `parse` returns — or passes to `next` — a feature object:

```js
{
  title: string,
  annotations: { [name]: value },
  scenarios: [{ title, annotations, steps: string[] }],
  rules: [{ title, annotations, scenarios: [...] }],
}
```

## EventBus

```js
import Yadda from 'yadda';

const { EventBus } = Yadda;
EventBus.instance().on(EventBus.ON_STEP, (event) => {});
```

Events: `EventBus.ON_SCENARIO`, `EventBus.ON_STEP`, `EventBus.ON_EXECUTE`. See [Events](events.md) for their payloads.
