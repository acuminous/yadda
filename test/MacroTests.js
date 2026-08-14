var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var assert = require('node:assert');
var Macro = require('../lib/Macro');
var Context = require('../lib/Context');
var EventBus = require('../lib/EventBus');
var Dictionary = require('../lib/Dictionary');
var $ = require('../lib/Array');
var fn = require('../lib/fn');

describe('Macro', () => {
  it('should interpret a synchronous step synchronously', () => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }));

    assert.ok(execution.executed, 'The step was not executed');
    assert.equal(execution.args.length, 3);
    assert.deepEqual(execution.args, [1, 2, 3]);
    assert.deepEqual(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
  });

  it('should tolerate too many step arguments for synchronous steps', () => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as 1, 2, 3/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }));

    assert.ok(execution.executed, 'The step was not executed');
    assert.equal(execution.args.length, 0);
  });

  it('should tolerate too few step arguments for synchronous steps', () => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3, 4', new Context({ b: 2 }));

    assert.ok(execution.executed, 'The step was not executed');
    assert.equal(execution.args.length, 4);
  });

  it('should interpret a synchronous step asynchronously', (t, done) => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), () => {
      assert.ok(execution.executed, 'The step was not executed');
      assert.equal(execution.args.length, 3);
      assert.deepEqual(execution.args, [1, 2, 3]);
      assert.deepEqual(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
      done();
    });
  });

  it('should interpret an asynchronous step', (t, done) => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.afn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), () => {
      assert.ok(execution.executed, 'The step was not executed');
      assert.equal(execution.args.length, 4);
      assert.deepEqual(execution.args.splice(0, 3), [1, 2, 3]);
      assert.deepEqual(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
      done();
    });
  });

  it('should fail when too few step arguments for asynchronous steps', (t, done) => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), 3/), execution.afn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), (err) => {
      assert.ok(err);
      done();
    });
  });

  it('should fail when too many step arguments for asynchronous steps', (t, done) => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d), (\d)/), execution.afn, { a: 1 }).interpret('Easy as 1, 2, 3, 4', new Context({ b: 2 }), (err) => {
      assert.ok(err);
      done();
    });
  });

  it('should support variadic async functions', (t, done) => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d), (\d)/), execution.vafn, { a: 1 }, undefined, { mode: 'async' }).interpret('Easy as 1, 2, 3, 4', new Context({ b: 2 }), () => {
      assert.ok(execution.executed, 'The step was not executed');
      assert.equal(execution.args.length, 5);
      assert.deepEqual(execution.args.splice(0, 4), [1, 2, 3, 4]);
      assert.deepEqual(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3, 4' });
      done();
    });
  });

  it('should execute a promisified step', (t, done) => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.promise, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), () => {
      assert.ok(execution.executed, 'The step was not executed');
      assert.equal(execution.args.length, 3);
      assert.deepEqual(execution.args, [1, 2, 3]);
      assert.deepEqual(execution.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
      done();
    });
  });

  it('should include step name in the context', () => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2 }), fn.noop);

    assert.equal(execution.ctx.step, 'Easy as 1, 2, 3');
  });

  it('should not override step name in the context if explicitly set', () => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.fn, { a: 1 }).interpret('Easy as 1, 2, 3', new Context({ b: 2, step: 'Do not override' }), fn.noop);

    assert.equal(execution.ctx.step, 'Do not override');
  });

  it('should provide a signature that can be used to compare levenshtein distance', () => {
    $([/the quick brown fox/, /the quick.* brown.* fox/, /the quick(.*) brown(?:.*) fox/, /the quick[xyz] brown[^xyz] fox/, /the quick{0,1} brown{1} fox/, /the quick\d brown\W fox/]).each((pattern) => {
      assert.equal(new Macro('Quick brown fox', parsed_signature(pattern)).levenshtein_signature(), 'the quick brown fox');
    });
  });

  it('should default to a no operation function', (t, done) => {
    new Macro('blah $a', parsed_signature(/blah (.*)/)).interpret('blah 1', {}, () => {
      done();
    });
  });

  it('should notify listeners of execute events', (t, done) => {
    var listener = new Listener();

    EventBus.instance().on(/EXECUTE/, listener.listen);

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), fn.noop, { a: 1 }).interpret('Easy as 1, 2, 3', { b: 2 });

    assert.equal(1, listener.events.length);

    var event = listener.events[0];
    assert.equal(event.name, EventBus.ON_EXECUTE);
    assert.equal(event.data.step, 'Easy as 1, 2, 3');
    assert.deepEqual(event.data.ctx, { a: 1, b: 2, step: 'Easy as 1, 2, 3' });
    assert.equal(event.data.pattern, '/Easy as (\\d), (\\d), (\\d)/');
    done();
  });

  it('should notify listeners of define events', (t, done) => {
    var listener = new Listener();

    EventBus.instance().on(/DEFINE/, listener.listen);

    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), fn.noop, { a: 1 }).interpret('Easy as 1, 2, 3', { b: 2 });

    assert.equal(1, listener.events.length);

    var event = listener.events[0];
    assert.equal(event.name, EventBus.ON_DEFINE);
    assert.equal(event.data.pattern, '/Easy as (\\d), (\\d), (\\d)/');
    done();
  });

  it('should interpret a multiline', () => {
    var execution = new Execution();

    new Macro('Easy', parsed_signature(/Easy as ([^\u0000]*)/), execution.fn, { a: 1 }).interpret('Easy as 1\n2\n3', new Context({ b: 2 }), fn.noop);

    assert.ok(execution.executed, 'The step was not executed');
    assert.deepEqual(execution.args.splice(0, 1), ['1\n2\n3']);
    assert.deepEqual(execution.ctx, { a: 1, b: 2, step: 'Easy as 1\n2\n3' });
  });

  it('should convert parameters', () => {
    var execution = new Execution();

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

    assert.ok(execution.executed, 'The step was not executed');
    assert.deepEqual(execution.args.splice(0, 3), [2, 6, 12]);
  });

  it('should convert parameters with multi-arg converters', () => {
    var execution = new Execution();

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

    assert.ok(execution.executed, 'The step was not executed');
    assert.deepEqual(execution.args.splice(0, 3), [2, 5, 12]);
  });

  it('should convert parameters with multi-result converters', () => {
    var execution = new Execution();

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

    assert.ok(execution.executed, 'The step was not executed');
    assert.deepEqual(execution.args.splice(0, 5), [2, 2, 3, 2, 12]);
  });

  it('should yield errors when called asynchronously', () => {
    new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), (a, b, c, cb) => {
      throw new Error('Oh Noes!');
    }).interpret('Easy as 1, 2, 3', {}, (err) => {
      assert.ok(err);
      assert.equal(err.message, 'Oh Noes!');
    });
  });

  it('should throw errors when called synchronously', () => {
    assert.throws(() => {
      new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), (a, b, c) => {
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
    var _this = this;

    this.fn = function (a, b, c) {
      _this.executed = true;
      _this.captureArguments(arguments);
      _this.ctx = this;
    };
    this.afn = function (a, b, c, next) {
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
    this.promise = function (a, b, c) {
      _this.executed = true;
      _this.captureArguments(arguments);
      _this.ctx = this;
      return {
        then: (cb) => {
          cb();
          return {
            catch: (cb) => {
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
