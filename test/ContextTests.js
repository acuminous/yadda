const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const Context = require('../lib/Context');

describe('Context', () => {
  it('should merge objects', () => {
    assert_merge_context({ a: 1 }, undefined, { a: 1 });
    assert_merge_context({ a: 1 }, null, { a: 1 });
    assert_merge_context({ a: 1 }, {}, { a: 1 });
    assert_merge_context({ a: 1 }, { b: 2 }, { a: 1, b: 2 });
    assert_merge_context({ a: 1 }, { a: 2 }, { a: 2 });

    assert_merge_context(undefined, { a: 1 }, { a: 1 });
    assert_merge_context(null, { a: 1 }, { a: 1 });
    assert_merge_context({}, { a: 1 }, { a: 1 });
    assert_merge_context({ b: 2 }, { a: 1 }, { a: 1, b: 2 });
    assert_merge_context({ a: 2 }, { a: 1 }, { a: 1 });
  });

  it('should merge contexts', () => {
    assert.deepEqual(new Context({ a: 1 }).merge(new Context({ b: 2 })).properties, new Context({ a: 1, b: 2 }).properties);
  });

  const assert_merge_context = (thing1, thing2, expected) => {
    assert.deepEqual(new Context(thing1).merge(thing2).properties, expected);
  };
});
