const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const convert = require('../../lib/converters/date-converter');

describe('Date Converter', () => {
  it('Should convert strings to date', (_t, done) => {
    convert('2015-07-24T09:23:31.283Z', (err, value) => {
      assert.ifError(err);
      assert.equal(value.toISOString(), '2015-07-24T09:23:31.283Z');
      done();
    });
  });

  it('Should error on invalid date', (_t, done) => {
    convert('a', (err, _value) => {
      assert(err);
      assert.equal(err.message, 'Cannot convert [a] to a date');
      done();
    });
  });
});
