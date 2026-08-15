# Migrating to 3.0

Yadda 3.0 is a **breaking modernization**. It sheds a large amount of dead tooling and becomes **Node-only**. The step-authoring API is unchanged, so most upgrades are a matter of dropping features you were no longer using.

## Node-only

- **In-browser support was removed.** There is no bundler and no `dist/yadda-*.js` build any more. The old `<script src="…/dist/yadda-*.js">` usage is gone. (Historical `dist/` files remain in the git repository for anyone hotlinking old versions, but no new ones are produced.)
- End-to-end browser testing is still fully supported — you run your test code in Node and drive a browser with [Puppeteer](../examples/puppeteer) or [Playwright](../examples/playwright). See those examples.
- **Node.js >= 20 is required.** The `engines` field enforces this.
- **Yadda ships as CommonJS.** The package itself still uses `require`/`module.exports` internally — it has not been rewritten as ESM. You can consume it from either module system: `require('yadda')` from CommonJS, or `import Yadda from 'yadda'` from ESM via Node's interop (a default import, then destructure what you need). The examples in these docs use the `import` form.

## Removed integrations and tooling

The following were removed. If you relied on any of them, stay on 2.x or migrate off them:

- Bower and Component package definitions.
- Karma and PhantomJS support.
- The nightwatch, qunit and nodeunit examples.
- `Platform.js` and `lib/shims` (browser-compatibility shims).

## Test-runner guidance

- **node:test is now a first-class target.** The new `Yadda.plugins.nodetest` plugin integrates with Node's built-in runner. See [Plugins](plugins.md). If you're starting fresh, prefer it — no extra dependency required.
- The Mocha and Jasmine plugins are unchanged.

## Recommended: prefer arrow-friendly steps

2.x steps typically bound the context to `this` (via `Yadda.Library` / `ContextBoundLibrary`), forcing `function` expressions. 3.0 keeps that working, but also offers `ContextParamLibrary`, which passes the context as the first argument so steps can be arrow functions:

```js
import Yadda from 'yadda';

const { ContextBoundLibrary, ContextParamLibrary, localisation: { English } } = Yadda;

// 2.x style (still supported)
English.localise(new ContextBoundLibrary())
  .given('a user called $name', function (name) {
    this.ctx.users[name] = new User(name);
  });

// 3.0 recommended
English.localise(new ContextParamLibrary())
  .given('a user called $name', (ctx, name) => {
    ctx.users[name] = new User(name);
  });
```

`Yadda.Library` remains a deprecated alias for `ContextBoundLibrary`, so existing code keeps working. Migrate to `ContextParamLibrary` at your leisure.

## Removed: the localisation `.library()` shorthand

2.x let you construct and localise a library in a single call:

```js
// 2.x — no longer works
const library = English.library(dictionary)
  .given('a user called $name', function (name) { /* ... */ });
```

That `.library([dictionary])` factory has been **removed**. Construct the library yourself and pass it to `localise()`:

```js
import Yadda from 'yadda';

const { ContextParamLibrary, localisation: { English } } = Yadda;

// 3.0
const library = English.localise(new ContextParamLibrary(dictionary))
  .given('a user called $name', (ctx, name) => { /* ... */ });
```

`localise()` returns the same library, so the chained `given`/`when`/`then`/`define` calls are unchanged. This is also the point at which you choose between [`ContextParamLibrary` and `ContextBoundLibrary`](step-libraries.md#choosing-a-library-type); the old shorthand always produced a context-bound library.

## Metadata

- The package is now licensed **ISC** (previously declared Apache-2.0) and ships a `LICENSE` file.
- A `files` allowlist means only `lib/` is published to npm.
- The homepage now points at the GitHub README rather than the retired GitBook site.
