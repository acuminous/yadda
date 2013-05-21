var assert = require('assert');
var $ = require('../lib/Array');

describe('Array', function() {
    it('Flattens a nested array', function() {
        assert.deepEqual($([1, 2, 3]).flatten().naked(), [1, 2, 3]);
        assert.deepEqual($([1, [2], 3]).flatten().naked(), [1, 2, 3]);
        assert.deepEqual($([1, [[2], 3]]).flatten().naked(), [1, 2, 3]);
        assert.deepEqual($([1, [[2], 3]], []).flatten().naked(), [1, 2, 3]);
    })
});