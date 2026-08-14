const { describe, it } = require('node:test');
const { equal: eq, ok, ifError } = require('node:assert');
const convert = require('../../lib/converters/float-converter');

describe('Float Converter', () => {
  it('Should convert strings to float', (_t, done) => {
    convert('1.1', (err, value) => {
      ifError(err);
      eq(value, 1.1);
      eq(typeof value, 'number');
      done();
    });
  });

  it('Should error on NaN', (_t, done) => {
    convert('a', (err, _value) => {
      ok(err);
      eq(err.message, 'Cannot convert [a] to a float');
      done();
    });
  });
});
