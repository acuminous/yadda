const nodeTest = require('node:test');
const describe = nodeTest.describe;
const it = nodeTest.it;
const assert = require('node:assert');
const $ = require('../lib/Array');

describe('Array', () => {
  it('should flatten a nested array', () => {
    assert.deepEqual($([1, 2, 3]).flatten().naked(), [1, 2, 3]);
    assert.deepEqual(
      $([1, [2], 3])
        .flatten()
        .naked(),
      [1, 2, 3],
    );
    assert.deepEqual(
      $([1, [[2], 3]])
        .flatten()
        .naked(),
      [1, 2, 3],
    );
    assert.deepEqual(
      $([1, [[2], 3]], [])
        .flatten()
        .naked(),
      [1, 2, 3],
    );
  });

  it('should flatten an empty array', () => {
    assert.deepEqual($([]).flatten().naked(), []);
  });

  it('should iterate asynchronously', () => {
    const items = [1, 2, 3];
    let iterations = 0;
    $(items).each_async(
      (item, index, callback) => {
        assert.equal(item, items[iterations]);
        assert.equal(index, iterations);
        iterations++;
        callback(null, item);
      },
      (err, result) => {
        assert.ifError(err);
        assert.equal(result, 3);
      },
    );
  });

  it('should return the last item', () => {
    assert.equal($([1, 2, 3]).last(), 3);
  });

  it('should fill an array with n items', () => {
    assert.deepEqual($([]).fill('A', 3).naked(), ['A', 'A', 'A']);
  });
});
