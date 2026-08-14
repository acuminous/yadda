const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const convert = require('../../lib/converters/list-converter');

describe('List Converter', () => {
  it('Should convert strings to lists', (_t, done) => {
    convert('a\nb\nc', (err, value) => {
      assert.ifError(err);
      assert.deepEqual(value, ['a', 'b', 'c']);
      done();
    });
  });
});
