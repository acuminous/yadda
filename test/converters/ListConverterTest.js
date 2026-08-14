const { describe, it } = require('node:test');
const { deepEqual: deq, ifError } = require('node:assert');
const convert = require('../../lib/converters/list-converter');

describe('List Converter', () => {
  it('Should convert strings to lists', (_t, done) => {
    convert('a\nb\nc', (err, value) => {
      ifError(err);
      deq(value, ['a', 'b', 'c']);
      done();
    });
  });
});
