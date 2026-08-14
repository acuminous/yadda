var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var assert = require('node:assert');
var convert = require('../../lib/converters/integer-converter');

describe('Integer Converter', () => {
  it('Should convert strings to integers', (t, done) => {
    convert('1', (err, value) => {
      assert.ifError(err);
      assert.equal(value, 1);
      assert.equal(typeof value, 'number');
      done();
    });
  });

  it('Should error on NaN', (t, done) => {
    convert('a', (err, value) => {
      assert(err);
      assert.equal(err.message, 'Cannot convert [a] to an integer');
      done();
    });
  });
});
