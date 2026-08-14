const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const Library = require('../lib/index').Library;
const Yadda = require('../lib/index').Yadda;

describe('Yadda', () => {
  it('should interpret synchronous scenarios', () => {
    let executions = 0;
    const library = new Library().define('foo', () => {
      executions++;
    });
    new Yadda(library).yadda('foo');
    assert.equal(executions, 1);
  });

  it('should interpret asynchronous scenarios', (_t, done) => {
    let executions = 0;
    const library = new Library().define('foo', (next) => {
      executions++;
      next();
    });
    new Yadda(library).yadda('foo', (err) => {
      assert.ifError(err);
      assert.equal(executions, 1);
      done();
    });
  });

  it('should interpret a mix of asynchronous and synchronous scenarios', (_t, done) => {
    let executions = 0;
    const library = new Library()
      .define('foo', (next) => {
        executions++;
        next();
      })
      .define('bar', () => {
        executions++;
      });
    new Yadda(library).yadda(['foo', 'bar'], (err) => {
      assert.ifError(err);
      assert.equal(executions, 2);
      done();
    });
  });

  it('should interpret asynchronous returning promises', (_t, done) => {
    let executions = 0;
    const library = new Library().define('foo', () => {
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
      assert.ifError(err);
      assert.equal(executions, 1);
      done();
    });
  });

  it('should interpret asynchronous returning promises', (_t, done) => {
    let executions = 0;
    const library = new Library().define('foo', () => {
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
      assert.ifError(err);
      assert.equal(executions, 1);
      done();
    });
  });

  it('should cater for people who dont find the recursive api amusing', () => {
    const Yadda = require('../lib/index');
    let executions = 0;
    const library = new Yadda.Library().define('foo', () => {
      executions++;
    });
    const yadda = Yadda.createInstance(library);
    yadda.run('foo');
    assert.equal(executions, 1);
  });

  it('should interpret asynchronous variadic steps', (_t, done) => {
    let executions = 0;
    const library = new Library().define(
      'foo',
      function () {
        const next = arguments[arguments.length - 1];
        assert.equal(typeof next, 'function');
        executions++;
        next();
      },
      {},
      { mode: 'async' },
    );
    new Yadda(library).yadda('foo', (err) => {
      assert.ifError(err);
      assert.equal(executions, 1);
      done();
    });
  });

  it('should interpret asynchronous localised variadic steps', (_t, done) => {
    let executions = 0;
    const English = require('../lib').localisation.English;
    const library = English.library().given(
      'foo',
      function () {
        const next = arguments[arguments.length - 1];
        assert.equal(typeof next, 'function');
        executions++;
        next();
      },
      {},
      { mode: 'async' },
    );

    new Yadda(library).yadda('Given foo', (err) => {
      assert.ifError(err);
      assert.equal(executions, 1);
      done();
    });
  });
});
