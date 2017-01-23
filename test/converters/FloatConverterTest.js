"use strict";

var assert = require('assert');
var convert = require('../../lib/converters/float-converter');

describe('Float Converter', function() {

    it("Should convert strings to float", function(next) {
        convert("1.1", function(err, value) {
            assert.ifError(err);
            assert.equal(value, 1.1);
            assert.equal(typeof value, 'number');
            next();
        });
    });

    it("Should error on NaN", function(next) {
        convert("a", function(err, value) {
            assert(err);
            assert.equal(err.message, 'Cannot convert [a] to a float');
            next();
        });
    });

});
