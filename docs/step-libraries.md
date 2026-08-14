# Step Libraries

Step libraries map step text to executable functions. Yadda supports synchronous, asynchronous (callback) and promise-based steps.

```js
new Yadda.Library()
  .define('A synchronous step', () => {
    // Code goes here
  })
  .define('An asynchronous step', (next) => {
    // Code goes here
    next();
  });
```

## Choosing a Library Type

Yadda ships two step-library flavours. They behave identically except for how the scenario context reaches your steps.

### ContextParamLibrary (recommended)

A `ContextParamLibrary` passes the scenario context as the **first argument** to every step. Because nothing is bound to `this`, steps can be plain arrow functions.

```js
const library = Yadda.localisation.English.localise(new Yadda.ContextParamLibrary())
  .given('a user called $name', (ctx, name) => {
    ctx.users[name] = new User(name);
  });
```

### ContextBoundLibrary

A `ContextBoundLibrary` binds the scenario context to `this`. Steps must therefore be `function` expressions, not arrow functions.

```js
const library = Yadda.localisation.English.localise(new Yadda.ContextBoundLibrary())
  .given('a user called $name', function (name) {
    this.ctx.users[name] = new User(name);
  });
```

> `Yadda.Library` is a deprecated alias for `ContextBoundLibrary`, retained for backwards compatibility. New code should prefer `ContextParamLibrary`. See [Managing State](managing-state.md) for how the context is populated.

## Given / When / Then

You can write whatever steps you like, but because "Given", "When" and "Then" are so common, Yadda provides localised shorthand methods. Wrap a library with a [localisation](localisation.md) to get them:

```js
Yadda.localisation.English.localise(new Yadda.ContextParamLibrary())
  .given('some precondition', (ctx) => {})
  .when('I do something', (ctx) => {})
  .then('expect some result', (ctx) => {});
```

Under the hood these are all just `define` with a localised keyword prefixed onto the signature. Several [languages](localisation.md) are supported.

## Regular Expressions

Use regular expressions for fuzzy matching:

```js
new Yadda.Library().define('[Ss]etup a new user', () => {});
```

Use actual `RegExp` objects to avoid escaping backslashes:

```js
new Yadda.Library().define(/[Ss]etup a new user/, () => {});
```

## Parameterised Steps

Use matching groups to extract parameters from the step text:

```js
Yadda.localisation.English.localise(new Yadda.ContextParamLibrary())
  .given('a user called (\\w+)', (ctx, name) => {});
```

Or use dictionary _terms_ to make steps friendlier (see [Dictionaries](dictionaries.md)):

```js
Yadda.localisation.English.localise(new Yadda.ContextParamLibrary())
  .given('a user called $name', (ctx, name) => {});
```

All of the above are equivalent.

## Multiline Steps

```
Scenario: Some title

  Given some csv
  --------------
  First Name,Last Name,Age
  Joe,Bloggs,23
  John,Smith,41
  --------------
```

```js
const dictionary = new Yadda.Dictionary().define('csv', /([\s\S]*)/, csvConverter);

Yadda.localisation.English.localise(new Yadda.ContextParamLibrary(dictionary))
  .given('some csv\n$csv', (ctx, csv) => {});
```

Multiline content is appended to the preceding single-line step, and is best paired with a dictionary definition and an optional converter. See [Feature Files](feature-files.md#multiline-steps) for the syntax rules.

## Step Aliases

```
Given Bob has 1 book
And Alice has 2 books
```

```js
Yadda.localisation.English.localise(new Yadda.ContextParamLibrary())
  .given(['$name has $num book', '$name has $num books'], (ctx, name, count) => {});
```

Use aliases when you want to map several phrasings to the same function without writing a complicated regular expression.

## Pending Steps

```js
new Yadda.Library().define('Some step');
```

Steps defined without a function are skipped.

## Synchronous, Asynchronous or Promise-Based

Yadda decides whether a step is synchronous or asynchronous by comparing the number of arguments the step function declares against the number of parameters the step captures.

- If they **match**, the step is synchronous.
- If the function declares **one more** argument than the step captures, that extra argument is a callback and the step is asynchronous.
- If the function returns a _thenable_, Yadda treats it as a promise and awaits it.

(With a `ContextParamLibrary`, remember that the leading `ctx` argument counts too.)

### Synchronous

```js
.given('a user called $name', (ctx, name) => {
  // Code goes here
});
```

### Asynchronous (callback)

```js
.given('a user called $name', (ctx, name, next) => {
  // Code goes here
  next();
});
```

### Promise-based

```js
.given('a user called $name', (ctx, name) => {
  return new Promise((resolve, reject) => {
    // Code goes here
  });
});
```

### Variadic Steps

Occasionally you may want a variadic step, in which case Yadda cannot count arguments to determine the mode. Specify it explicitly via the options parameter:

```js
.given('a user called $name', function () {
  // Code goes here
  arguments[arguments.length - 1]();
}, {}, { mode: 'async' });
```

## Dynamic Library Selection

Yadda can run a scenario against several libraries at once, and it will pick the best-matching step from whichever library provides it. This lets the same phrase mean different things in different contexts without conflicting.

```js
const yadda = Yadda.createInstance([bottleSteps, vaseSteps, commonSteps]);
```

When more than one library can interpret a step, Yadda scores the candidates (favouring, among other things, the library that satisfied the previous step) and picks a clear winner — dramatically reducing step conflicts on large suites. See the [multi-library example](../examples/multi-library).
