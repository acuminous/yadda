const { describe, it } = require('node:test');
const { equal: eq, ok, ifError } = require('node:assert');
const convert = require('../../lib/converters/date-converter');

describe('Date Converter', () => {
  it('Should convert strings to date', (_t, done) => {
    convert('2015-07-24T09:23:31.283Z', (err, value) => {
      ifError(err);
      eq(value.toISOString(), '2015-07-24T09:23:31.283Z');
      done();
    });
  });

  it('Should error on invalid date', (_t, done) => {
    convert('a', (err, _value) => {
      ok(err);
      eq(err.message, 'Cannot convert [a] to a date');
      done();
    });
  });
});
