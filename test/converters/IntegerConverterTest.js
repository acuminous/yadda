var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var assert = require('assert');
var convert = require('../../lib/converters/integer-converter');

describe('Integer Converter', function () {
  it('Should convert strings to integers', function (t, done) {
    convert('1', function (err, value) {
      assert.ifError(err);
      assert.equal(value, 1);
      assert.equal(typeof value, 'number');
      done();
    });
  });

  it('Should error on NaN', function (t, done) {
    convert('a', function (err, value) {
      assert(err);
      assert.equal(err.message, 'Cannot convert [a] to an integer');
      done();
    });
  });
});
