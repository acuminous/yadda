# Events

Debugging BDD tests is typically harder than debugging unit tests — not least because you can't step through a feature file. You can make life easier by adding event listeners that log each step as it runs.

```js
const { EventBus } = require('yadda');

EventBus.instance().on(EventBus.ON_EXECUTE, (event) => {
  console.log(event.name, event.data);
});
```

Yadda emits three events, all carrying the current context as `ctx`.

## ON_SCENARIO

Fired when the interpreter is about to process a scenario.

```js
{
  scenario: ['100 green bottles', 'should fall from the wall', /* ...steps */],
  ctx: context,
}
```

## ON_STEP

Fired when the interpreter is about to process a step.

```js
{
  step: '100 green bottles are standing on the wall',
  ctx: context,
}
```

## ON_EXECUTE

Fired when the interpreter is about to execute the function associated with a step. This event also carries the matched `pattern` and the parsed `args`.

```js
{
  step: '100 green bottles are standing on the wall',
  pattern: '/(\\d+) green bottles.../',
  args: ['100'],
  ctx: context,
}
```
