"use strict";

var assert = require('assert');
var convert = require('../../lib/converters/date-converter');

describe('Date Converter', function() {

    it("Should convert strings to date", function(next) {
        convert('2015-07-24T09:23:31.283Z', function(err, value) {
            assert.ifError(err);
            assert.equal(value.toISOString(), '2015-07-24T09:23:31.283Z');
            next();
        });
    });

    it("Should error on invalid date", function(next) {
        convert("a", function(err, value) {
            assert(err);
            assert.equal(err.message, 'Cannot convert [a] to a date');
            next();
        });
    });

});
