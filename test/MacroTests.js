const { describe, it } = require('node:test');
const { equal: eq, deepEqual: deq, ok, throws } = require('node:assert');
const Macro = require('../lib/Macro');
const Context = require('../lib/Context');
const EventBus = require('../lib/EventBus');
const Dictionary = require('../lib/Dictionary');
const $ = require('../lib/Array');
const fn = require('../lib/fn');

describe('Macro', () => {
  it('should interpret a synchronous step synchronously', () => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }));

    ok(execution.executed, 'The step was not executed');
    eq(execution.args.length, 3);
    deq(execution.args, [1, 2, 3]);
    deq(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
  });

  it('should tolerate too many step arguments for synchronous steps', () => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as 1, 2, 3/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }));

    ok(execution.executed, 'The step was not executed');
    eq(execution.args.length, 0);
  });

  it('should tolerate too few step arguments for synchronous steps', () => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3, 4', new Context({ b: 2 }));

    ok(execution.executed, 'The step was not executed');
    eq(execution.args.length, 4);
  });

  it('should interpret a synchronous step asynchronously', (_t, done) => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), () => {
      ok(execution.executed, 'The step was not executed');
      eq(execution.args.length, 3);
      deq(execution.args, [1, 2, 3]);
      deq(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
      done();
    });
  });

  it('should interpret an asynchronous step', (_t, done) => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.afn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), () => {
      ok(execution.executed, 'The step was not executed');
      eq(execution.args.length, 4);
      deq(execution.args.splice(0, 3), [1, 2, 3]);
      deq(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
      done();
    });
  });

  it('should fail when too few step arguments for asynchronous steps', (_t, done) => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), 3/), execution.afn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), (err) => {
      ok(err);
      done();
    });
  });

  it('should fail when too many step arguments for asynchronous steps', (_t, done) => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d), (\d)/), execution.afn, { a: 1 }).interpret('Easy as 1, 2, 3, 4', new Context({ b: 2 }), (err) => {
      ok(err);
      done();
    });
  });

  it('should support variadic async functions', (_t, done) => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d), (\d)/), execution.vafn, { a: 1 }, undefined, { mode: 'async' }).interpret('Easy as 1, 2, 3, 4', new Context({ b: 2 }), () => {
      ok(execution.executed, 'The step was not executed');
      eq(execution.args.length, 5);
      deq(execution.args.splice(0, 4), [1, 2, 3, 4]);
      deq(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3, 4' });
      done();
    });
  });

  it('should execute a promisified step', (_t, done) => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.promise, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), () => {
      ok(execution.executed, 'The step was not executed');
      eq(execution.args.length, 3);
      deq(execution.args, [1, 2, 3]);
      deq(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
      done();
    });
  });

  it('should include step name in the context', () => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), fn.noop);

    eq(execution.ctx.step, 'Easy as 1, 2, 3');
  });

  it('should not override step name in the context if explicitly set', () => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2, step: 'Do not override' }), fn.noop);

    eq(execution.ctx.step, 'Do not override');
  });

  it('should provide a signature that can be used to compare levenshtein distance', () => {
    $([/the quick brown fox/, /the quick.* brown.* fox/, /the quick(.*) brown(?:.*) fox/, /the quick[xyz] brown[^xyz] fox/, /the quick{0,1} brown{1} fox/, /the quick\d brown\W fox/]).each((pattern) => {
      eq(new Macro('Quick brown fox', parsed_signature(pattern)).levenshtein_signature(), 'the quick brown fox');
    });
  });

  it('should default to a no operation function', (_t, done) => {
    new Macro('blah $a', parsed_signature(/blah (.*)/)).interpret('blah 1', {}, () => {
      done();
    });
  });

  it('should notify listeners of execute events', (_t, done) => {
    const listener = new Listener();

    EventBus.instance().on(/EXECUTE/, listener.listen);

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), fn.noop, { a: 1 }).interpret('Easy as 1, 2, 3', { b: 2 });

    eq(1, listener.events.length);

    const event = listener.events[0];
    eq(event.name, EventBus.ON_EXECUTE);
    eq(event.data.step, 'Easy as 1, 2, 3');
    deq(event.data.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
    eq(event.data.pattern, '/Easy as (\\d), (\\d), (\\d)/');
    done();
  });

  it('should notify listeners of define events', (_t, done) => {
    const listener = new Listener();

    EventBus.instance().on(/DEFINE/, listener.listen);

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), fn.noop, { a: 1 }).interpret('Easy as 1, 2, 3', { b: 2 });

    eq(1, listener.events.length);

    const event = listener.events[0];
    eq(event.name, EventBus.ON_DEFINE);
    eq(event.data.pattern, '/Easy as (\\d), (\\d), (\\d)/');
    done();
  });

  it('should interpret a multiline', () => {
    const execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as ([^\u0000]*)/), execution.fn, { a: 1 }).interpret('Easy as 1\n2\n3', new Context({ b: 2 }), fn.noop);

    ok(execution.executed, 'The step was not executed');
    deq(execution.args.splice(0, 1), ['1\n2\n3']);
    deq(execution.ctx, { a: 1, b: 2, step: 'Easy as 1\n2\n3' });
  });

  it('should convert parameters', () => {
    const execution = new Execution();

    new Macro(
      'Easy',
      {
        pattern: /Easy as (\d), (\d), (\d)/,
        converters: [
          (value, cb) => {
            cb(null, value * 2);
          },
          (value, cb) => {
            cb(null, value * 3);
          },
          (value, cb) => {
            cb(null, value * 4);
          },
        ],
      },
      execution.fn,
      { a: 1 },
    ).interpret('Easy as 1, 2, 3', fn.noop);

    ok(execution.executed, 'The step was not executed');
    deq(execution.args.splice(0, 3), [2, 6, 12]);
  });

  it('should convert parameters with multi-arg converters', () => {
    const execution = new Execution();

    new Macro(
      'Easy',
      {
        pattern: /Easy as (\d), (\d), (\d), (\d)/,
        converters: [
          (value, cb) => {
            cb(null, value * 2);
          },
          (value1, value2, cb) => {
            cb(null, parseInt(value1, 10) + parseInt(value2, 10));
          },
          (value, cb) => {
            cb(null, value * 3);
          },
        ],
      },
      execution.fn,
      { a: 1 },
    ).interpret('Easy as 1, 2, 3, 4', fn.noop);

    ok(execution.executed, 'The step was not executed');
    deq(execution.args.splice(0, 3), [2, 5, 12]);
  });

  it('should convert parameters with multi-result converters', () => {
    const execution = new Execution();

    new Macro(
      'Easy',
      {
        pattern: /Easy as (\d), (\d), (\d), (\d)/,
        converters: [
          (value, cb) => {
            cb(null, value * 2);
          },
          (value1, value2, cb) => {
            cb(null, parseInt(value1, 10), parseInt(value2, 10), parseInt(value1, 10));
          },
          (value, cb) => {
            cb(null, value * 3);
          },
        ],
      },
      execution.fn,
      { a: 1 },
    ).interpret('Easy as 1, 2, 3, 4', fn.noop);

    ok(execution.executed, 'The step was not executed');
    deq(execution.args.splice(0, 5), [2, 2, 3, 2, 12]);
  });

  it('should yield errors when called asynchronously', () => {
    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), (_a, _b, _c, _cb) => {
      throw new Error('Oh Noes!');
    }).interpret('Easy as 1, 2, 3', {}, (err) => {
      ok(err);
      eq(err.message, 'Oh Noes!');
    });
  });

  it('should throw errors when called synchronously', () => {
    throws(() => {
      new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), (_a, _b, _c) => {
        throw new Error('Oh Noes!');
      }).interpret('Easy as 1, 2, 3', {});
    }, /Oh Noes!/);
  });

  function parsed_signature(pattern) {
    return new Dictionary().define('foo', pattern).expand('$foo');
  }

  function Execution() {
    this.executed = false;
    this.args = undefined;
    this.ctx = undefined;
    const _this = this;

    this.fn = function (_a, _b, _c) {
      _this.executed = true;
      _this.captureArguments(arguments);
      _this.ctx = this;
    };
    this.afn = function (_a, _b, _c, next) {
      _this.executed = true;
      _this.captureArguments(arguments);
      _this.ctx = this;
      next();
    };
    this.vafn = function () {
      _this.executed = true;
      _this.captureArguments(arguments);
      _this.ctx = this;
      arguments[arguments.length - 1]();
    };
    this.promise = function (_a, _b, _c) {
      _this.executed = true;
      _this.captureArguments(arguments);
      _this.ctx = this;
      return {
        then: (cb) => {
          cb();
          return {
            catch: (_cb) => {
              _this.caught = true;
            },
          };
        },
      };
    };
    this.captureArguments = function (args) {
      _this.args = this.toArray(args);
    };
    this.toArray = (obj) => [].slice.call(obj, 0);
  }

  function Listener() {
    this.events = [];
    this.listen = (event) => {
      this.events.push(event);
    };
  }
});
