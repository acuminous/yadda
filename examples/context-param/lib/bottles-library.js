var Yadda = require('yadda');
var assert = require('assert');

// A ContextParamLibrary passes the scenario context as the first argument to
// every step, so steps can be written as arrow functions and never need `this`.
module.exports = Yadda.localisation.English.localise(new Yadda.ContextParamLibrary())

  .given('a wall with $NUM green bottles', (ctx, number) => {
    ctx.wall.bottles = Number(number);
  })

  .when('$NUM green bottle accidentally falls', (ctx, number) => {
    ctx.wall.bottles -= Number(number);
  })

  .then('there are $NUM green bottles standing on the wall', (ctx, number) => {
    assert.equal(ctx.wall.bottles, Number(number));
  })

  .given('the bottle supplier is unavailable', (ctx) => {
    // The real Mocha runnable is threaded in as ctx.mocha.step (see test.js),
    // so an arrow-function step can skip itself at runtime.
    ctx.mocha.step.skip();
  })

  .then('the delivery is recorded', () => {
    assert.fail('This step should have been skipped');
  });
