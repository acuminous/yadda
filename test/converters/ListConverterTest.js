"use strict";

var assert = require('assert');
var convert = require('../../lib/converters/list-converter');

describe('List Converter', function() {

    it("Should convert strings to lists", function(next) {
        convert("a\nb\nc", function(err, value) {
            assert.ifError(err);
            assert.deepEqual(value, ['a', 'b', 'c']);
            next();
        });
    });
});
