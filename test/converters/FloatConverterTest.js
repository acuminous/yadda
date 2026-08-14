const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const convert = require('../../lib/converters/float-converter');

describe('Float Converter', () => {
  it('Should convert strings to float', (_t, done) => {
    convert('1.1', (err, value) => {
      assert.ifError(err);
      assert.equal(value, 1.1);
      assert.equal(typeof value, 'number');
      done();
    });
  });

  it('Should error on NaN', (_t, done) => {
    convert('a', (err, _value) => {
      assert(err);
      assert.equal(err.message, 'Cannot convert [a] to a float');
      done();
    });
  });
});
