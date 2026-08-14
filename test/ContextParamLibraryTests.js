const { describe, it } = require('node:test');
const { equal: eq, deepEqual: deq, ok } = require('node:assert');
const { ContextParamLibrary, Interpreter, localisation } = require('../lib/index');
const { English } = localisation;

describe('ContextParamLibrary', () => {
  it('should pass the context as the first argument to steps', () => {
    let captured;
    const library = new ContextParamLibrary().define('a wall with (\\d+) bottles', (ctx, count) => {
      captured = { ctx: ctx, count: count };
    });

    new Interpreter(library).interpret(['a wall with 100 bottles'], { colour: 'green' });

    eq(captured.count, 100);
    eq(captured.ctx.colour, 'green');
  });

  it('should be localisable like a standard library', () => {
    const executed = [];
    const library = English.localise(new ContextParamLibrary())
      .given('a wall with (\\d+) bottles', (ctx) => executed.push(ctx.step))
      .when('(\\d+) bottle accidentally falls', (ctx) => executed.push(ctx.step))
      .then('there are (\\d+) bottles left', (ctx) => executed.push(ctx.step));

    new Interpreter(library).interpret(['Given a wall with 100 bottles', 'When 1 bottle accidentally falls', 'Then there are 99 bottles left']);

    deq(executed, ['Given a wall with 100 bottles', 'When 1 bottle accidentally falls', 'Then there are 99 bottles left']);
  });

  it('should still index and find macros like a standard library', () => {
    const library = new ContextParamLibrary().define(/^foo.*$/).define(/^f.*$/);
    ok(library.get_macro(/^foo.*$/), 'Macro should have been defined');
    eq(library.find_compatible_macros('food').length, 2);
  });
});
