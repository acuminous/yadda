const { describe, it } = require('node:test');
const { equal: eq, deepEqual: deq, ok } = require('node:assert');
const ContextParamMacro = require('../lib/ContextParamMacro');
const Context = require('../lib/Context');
const Dictionary = require('../lib/Dictionary');

describe('ContextParamMacro', () => {
  it('should pass the context as the first argument, followed by the step arguments', () => {
    const execution = new Execution();

    new ContextParamMacro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }));

    ok(execution.executed, 'The step was not executed');
    eq(execution.args.length, 4);
    deq(execution.args[0], { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
    deq(execution.args.slice(1), [1, 2, 3]);
  });

  it('should still bind the context to this for backwards compatibility', () => {
    const execution = new Execution();

    new ContextParamMacro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }));

    deq(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
    eq(execution.ctx, execution.args[0]);
  });

  it('should detect a synchronous step even though the signature has an extra context parameter', () => {
    const execution = new Execution();

    new ContextParamMacro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), () => {
      ok(execution.executed, 'The step was not executed');
      eq(execution.args.length, 4);
    });
  });

  it('should detect an asynchronous step and append next after the context and step arguments', (_t, done) => {
    const execution = new Execution();

    new ContextParamMacro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.afn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), () => {
      ok(execution.executed, 'The step was not executed');
      eq(execution.args.length, 5);
      deq(execution.args[0], { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
      deq(execution.args.slice(1, 4), [1, 2, 3]);
      done();
    });
  });

  it('should work with arrow function steps that never reference this', () => {
    let captured;

    new ContextParamMacro(
      'Easy',
      parsed_signature(/Easy as (\d), (\d), (\d)/),
      (ctx, a, b, c) => {
        captured = { ctx: ctx, digits: [a, b, c] };
      },
      { a: 1 },
    ).interpret('Easy as 1, 2, 3', new Context({ b: 2 }));

    deq(captured.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
    deq(captured.digits, ['1', '2', '3']);
  });

  function parsed_signature(pattern) {
    return new Dictionary().define('foo', pattern).expand('$foo');
  }

  function Execution() {
    this.executed = false;
    this.args = undefined;
    this.ctx = undefined;
    const _this = this;

    this.fn = function (_ctx, _a, _b, _c) {
      _this.executed = true;
      _this.captureArguments(arguments);
      _this.ctx = this;
    };
    this.afn = function (_ctx, _a, _b, _c, next) {
      _this.executed = true;
      _this.captureArguments(arguments);
      _this.ctx = this;
      next();
    };
    this.captureArguments = (args) => {
      _this.args = [].slice.call(args, 0);
    };
  }
});
