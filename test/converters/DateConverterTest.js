var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var assert = require('assert');
var convert = require('../../lib/converters/date-converter');

describe('Date Converter', function () {
  it('Should convert strings to date', function (t, done) {
    convert('2015-07-24T09:23:31.283Z', function (err, value) {
      assert.ifError(err);
      assert.equal(value.toISOString(), '2015-07-24T09:23:31.283Z');
      done();
    });
  });

  it('Should error on invalid date', function (t, done) {
    convert('a', function (err, value) {
      assert(err);
      assert.equal(err.message, 'Cannot convert [a] to a date');
      done();
    });
  });
});
