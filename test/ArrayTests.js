/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var $ = require('../lib/Array');

describe('Array', function() {
    it('Flattens a nested array', function() {
        assert.deepEqual($([1, 2, 3]).flatten().naked(), [1, 2, 3]);
        assert.deepEqual($([1, [2], 3]).flatten().naked(), [1, 2, 3]);
        assert.deepEqual($([1, [[2], 3]]).flatten().naked(), [1, 2, 3]);
        assert.deepEqual($([1, [[2], 3]], []).flatten().naked(), [1, 2, 3]);
    });

    it('Flattens an empty array', function() {
        assert.deepEqual($([]).flatten().naked(), []);
    });

    it('Should iterate asynchronously', function() {
        var items = [1, 2, 3];
        var iterations = 0;
        $(items).each_async(function(item, index, callback) {
            assert.equal(item, items[iterations]);
            assert.equal(index, iterations);
            iterations++;
            callback(null, item);
        }, function(err, result) {
            assert.equal(result, 3);
        });
    });
});
