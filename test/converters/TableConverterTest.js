/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var convert = require('../../lib/converters/table-converter');

describe('Table Converter', function() {

    it("Should convert strings to data tables", function(next) {

        var text = [
            'left | right',
            '1    | 3',
            '2    | 4'
        ].join('\n')

        convert(text, function(err, value) {
            assert.ifError(err);
            assert.deepEqual(value, [
                { left: '1', right: '3'},
                { left: '2', right: '4'}
            ]);
            next();
        });
    });

    it("Should maintain indentation", function(next) {

        var text = [
            'left | middle | right',
            '  1  |   2    |   3  '
        ].join('\n')

        convert(text, function(err, value) {
            assert.ifError(err);
            assert.deepEqual(value, [
                { left: '  1', middle: '  2', right: '  3'}
            ]);
            next();
        });
    });
});
