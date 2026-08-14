var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var assert = require('assert');
var convert = require('../../lib/converters/list-converter');

describe('List Converter', () => {
  it('Should convert strings to lists', (t, done) => {
    convert('a\nb\nc', (err, value) => {
      assert.ifError(err);
      assert.deepEqual(value, ['a', 'b', 'c']);
      done();
    });
  });
});
