var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var assert = require('node:assert');
var Library = require('../lib/index').Library;
var Yadda = require('../lib/index').Yadda;

describe('Yadda', () => {
  it('should interpret synchronous scenarios', () => {
    var executions = 0;
    var library = new Library().define('foo', () => {
      executions++;
    });
    new Yadda(library).yadda('foo');
    assert.equal(executions, 1);
  });

  it('should interpret asynchronous scenarios', (t, done) => {
    var executions = 0;
    var library = new Library().define('foo', (next) => {
      executions++;
      next();
    });
    new Yadda(library).yadda('foo', (err) => {
      assert.ifError(err);
      assert.equal(executions, 1);
      done();
    });
  });

  it('should interpret a mix of asynchronous and synchronous scenarios', (t, done) => {
    var executions = 0;
    var library = new Library()
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

  it('should interpret asynchronous returning promises', (t, done) => {
    var executions = 0;
    var library = new Library().define('foo', () => {
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

  it('should interpret asynchronous returning promises', (t, done) => {
    var executions = 0;
    var library = new Library().define('foo', () => {
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
    var Yadda = require('../lib/index');
    var executions = 0;
    var library = new Yadda.Library().define('foo', () => {
      executions++;
    });
    var yadda = Yadda.createInstance(library);
    yadda.run('foo');
    assert.equal(executions, 1);
  });

  it('should interpret asynchronous variadic steps', (t, done) => {
    var executions = 0;
    var library = new Library().define(
      'foo',
      function () {
        var next = arguments[arguments.length - 1];
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

  it('should interpret asynchronous localised variadic steps', (t, done) => {
    var executions = 0;
    var English = require('../lib').localisation.English;
    var library = English.library().given(
      'foo',
      function () {
        var next = arguments[arguments.length - 1];
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
