const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const convert = require('../../lib/converters/integer-converter');

describe('Integer Converter', () => {
  it('Should convert strings to integers', (_t, done) => {
    convert('1', (err, value) => {
      assert.ifError(err);
      assert.equal(value, 1);
      assert.equal(typeof value, 'number');
      done();
    });
  });

  it('Should error on NaN', (_t, done) => {
    convert('a', (err, _value) => {
      assert(err);
      assert.equal(err.message, 'Cannot convert [a] to an integer');
      done();
    });
  });
});
