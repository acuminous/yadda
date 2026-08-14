var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var assert = require('node:assert');
var convert = require('../../lib/converters/float-converter');

describe('Float Converter', () => {
  it('Should convert strings to float', (t, done) => {
    convert('1.1', (err, value) => {
      assert.ifError(err);
      assert.equal(value, 1.1);
      assert.equal(typeof value, 'number');
      done();
    });
  });

  it('Should error on NaN', (t, done) => {
    convert('a', (err, value) => {
      assert(err);
      assert.equal(err.message, 'Cannot convert [a] to a float');
      done();
    });
  });
});
