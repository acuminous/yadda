# Managing State

It's common to set up data in one step and refer to it in a later one. The simplest approach is a property on the library closure, but when you need to share state _between steps in separate libraries_ you should use Yadda's scenario context.

## The Scenario Context

You supply a context object when you run a scenario. Yadda makes it available to every step.

### With a ContextParamLibrary (recommended)

The context arrives as the **first argument** to each step, so steps can be arrow functions:

```js
const library = Yadda.localisation.English.localise(new Yadda.ContextParamLibrary())
  .given('a user called $name', (ctx, name) => {
    ctx.users[name] = new User(name);
  })
  .when('$name logs in', (ctx, name) => {
    ctx.users[name].login();
  });

Yadda.createInstance(library).run(steps, { users: {} });
```

### With a ContextBoundLibrary

The context is bound to `this.ctx`, so steps must be `function` expressions:

```js
const library = Yadda.localisation.English.localise(new Yadda.ContextBoundLibrary())
  .given('a user called $name', function (name) {
    this.ctx.users[name] = new User(name);
  })
  .when('$name logs in', function (name) {
    this.ctx.users[name].login();
  });

Yadda.createInstance(library).run(steps, { ctx: { users: {} } });
```

## How the Context Is Assembled

`Yadda.createInstance(libraries, interpreterContext)` accepts an optional _interpreter_ context that applies to every scenario. `yadda.run(steps, scenarioContext, done)` accepts a _scenario_ context for that run. The two are merged, with the scenario context taking precedence.

```js
const yadda = Yadda.createInstance(library, { config: globalConfig });

yadda.run(scenario.steps, { users: {} }, done);
// Steps see { config: globalConfig, users: {} }
```

## A Gotcha: Fresh Context Per Step

Yadda flattens a fresh context for each step. If you assign a top-level primitive in one step, a later step may not see it. Keep shared, mutable state on a **nested object** so every step mutates the same reference:

```js
scenarios(feature.scenarios, (scenario) => {
  const wall = {}; // mutable, shared by reference across the scenario's steps
  steps(scenario.steps, (step, done) => {
    yadda.run(step, { wall }, done);
  });
});
```

See the [context-param](../examples/context-param) and [context-bound](../examples/context-bound) examples for complete, runnable versions.
