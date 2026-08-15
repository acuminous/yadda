const { describe, it } = require('node:test');
const { equal: eq, ifError } = require('node:assert');
const { ContextBoundLibrary, Yadda } = require('../lib/index');

describe('Yadda', () => {
  it('should interpret synchronous scenarios', () => {
    let executions = 0;
    const library = new ContextBoundLibrary().define('foo', () => {
      executions++;
    });
    new Yadda(library).yadda('foo');
    eq(executions, 1);
  });

  it('should interpret asynchronous scenarios', (_t, done) => {
    let executions = 0;
    const library = new ContextBoundLibrary().define('foo', (next) => {
      executions++;
      next();
    });
    new Yadda(library).yadda('foo', (err) => {
      ifError(err);
      eq(executions, 1);
      done();
    });
  });

  it('should interpret a mix of asynchronous and synchronous scenarios', (_t, done) => {
    let executions = 0;
    const library = new ContextBoundLibrary()
      .define('foo', (next) => {
        executions++;
        next();
      })
      .define('bar', () => {
        executions++;
      });
    new Yadda(library).yadda(['foo', 'bar'], (err) => {
      ifError(err);
      eq(executions, 2);
      done();
    });
  });

  it('should interpret asynchronous returning promises', (_t, done) => {
    let executions = 0;
    const library = new ContextBoundLibrary().define('foo', () => {
      executions++;
      return {
        then: (cb) => {
          cb();
          return {
            catch: () => {},
          };
        },
      };
    });
    new Yadda(library).yadda('foo', (err) => {
      ifError(err);
      eq(executions, 1);
      done();
    });
  });

  it('should interpret asynchronous returning promises', (_t, done) => {
    let executions = 0;
    const library = new ContextBoundLibrary().define('foo', () => {
      executions++;
      return {
        then: (cb) => {
          cb();
          return {
            catch: () => {},
          };
        },
      };
    });
    new Yadda(library).yadda('foo', (err) => {
      ifError(err);
      eq(executions, 1);
      done();
    });
  });

  it('should cater for people who dont find the recursive api amusing', () => {
    const Yadda = require('../lib/index');
    let executions = 0;
    const library = new Yadda.ContextBoundLibrary().define('foo', () => {
      executions++;
    });
    const yadda = Yadda.createInstance(library);
    yadda.run('foo');
    eq(executions, 1);
  });

  it('should interpret a step object by its name', () => {
    let executed;
    const library = new ContextBoundLibrary().define('foo', () => {
      executed = true;
    });
    new Yadda(library).run({ name: 'foo', skip: () => {} });
    eq(executed, true);
  });

  it('should interpret an array of step objects by their names', (_t, done) => {
    const executed = [];
    const library = new ContextBoundLibrary()
      .define('foo', () => {
        executed.push('foo');
      })
      .define('bar', () => {
        executed.push('bar');
      });
    const steps = [
      { name: 'foo', skip: () => {} },
      { name: 'bar', skip: () => {} },
    ];
    new Yadda(library).run(steps, (err) => {
      ifError(err);
      eq(executed.join(','), 'foo,bar');
      done();
    });
  });

  it('should interpret asynchronous variadic steps', (_t, done) => {
    let executions = 0;
    const library = new ContextBoundLibrary().define(
      'foo',
      function () {
        const next = arguments[arguments.length - 1];
        eq(typeof next, 'function');
        executions++;
        next();
      },
      {},
      { mode: 'async' },
    );
    new Yadda(library).yadda('foo', (err) => {
      ifError(err);
      eq(executions, 1);
      done();
    });
  });

  it('should interpret asynchronous localised variadic steps', (_t, done) => {
    let executions = 0;
    const { English } = require('../lib').localisation;
    const library = English.localise(new ContextBoundLibrary()).given(
      'foo',
      function () {
        const next = arguments[arguments.length - 1];
        eq(typeof next, 'function');
        executions++;
        next();
      },
      {},
      { mode: 'async' },
    );

    new Yadda(library).yadda('Given foo', (err) => {
      ifError(err);
      eq(executions, 1);
      done();
    });
  });
});
