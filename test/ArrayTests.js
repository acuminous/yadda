"use strict";

var assert = require('assert');
var $ = require('../lib/Array');

describe('Array', function() {
    it('should flatten a nested array', function() {
        assert.deepEqual($([1, 2, 3]).flatten().naked(), [1, 2, 3]);
        assert.deepEqual($([1, [2], 3]).flatten().naked(), [1, 2, 3]);
        assert.deepEqual($([1, [[2], 3]]).flatten().naked(), [1, 2, 3]);
        assert.deepEqual($([1, [[2], 3]], []).flatten().naked(), [1, 2, 3]);
    });

    it('should flatten an empty array', function() {
        assert.deepEqual($([]).flatten().naked(), []);
    });

    it('should iterate asynchronously', function() {
        var items = [1, 2, 3];
        var iterations = 0;
        $(items).each_async(function(item, index, callback) {
            assert.equal(item, items[iterations]);
            assert.equal(index, iterations);
            iterations++;
            callback(null, item);
        }, function(err, result) {
            assert.ifError(err)
            assert.equal(result, 3);
        });
    });

    it('should return the last item', function() {
        assert.equal($([1, 2, 3]).last(), 3);
    });

    it('should fill an array with n items', function() {
        assert.deepEqual($([]).fill('A', 3).naked(), ['A', 'A', 'A']);
    });
});
