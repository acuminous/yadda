const { describe, it } = require('node:test');
const { equal: eq, deepEqual: deq, ifError } = require('node:assert');
const $ = require('../lib/Array');

describe('Array', () => {
  it('should flatten a nested array', () => {
    deq($([1, 2, 3]).flatten().naked(), [1, 2, 3]);
    deq(
      $([1, [2], 3])
        .flatten()
        .naked(),
      [1, 2, 3],
    );
    deq(
      $([1, [[2], 3]])
        .flatten()
        .naked(),
      [1, 2, 3],
    );
    deq(
      $([1, [[2], 3]], [])
        .flatten()
        .naked(),
      [1, 2, 3],
    );
  });

  it('should flatten an empty array', () => {
    deq($([]).flatten().naked(), []);
  });

  it('should iterate asynchronously', () => {
    const items = [1, 2, 3];
    let iterations = 0;
    $(items).each_async(
      (item, index, callback) => {
        eq(item, items[iterations]);
        eq(index, iterations);
        iterations++;
        callback(null, item);
      },
      (err, result) => {
        ifError(err);
        eq(result, 3);
      },
    );
  });

  it('should return the last item', () => {
    eq($([1, 2, 3]).last(), 3);
  });

  it('should fill an array with n items', () => {
    deq($([]).fill('A', 3).naked(), ['A', 'A', 'A']);
  });
});
