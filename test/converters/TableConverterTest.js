"use strict";

var assert = require('assert');
var convert = require('../../lib/converters/table-converter');

describe('Table Converter', function() {

    it("Should convert strings to data tables", function(next) {

        var text = [
            'left | right',
            '1    | 3',
            '2    | 4'
        ].join('\n');

        convert(text, function(err, value) {
            assert.ifError(err);
            assert.equal(value.length, 2);
            assert.deepEqual(value[0], { left: '1', right: '3'});
            assert.deepEqual(value[1], { left: '2', right: '4'});
            next();
        });
    });

    it("Should maintain indentation", function(next) {

        var text = [
            'left | middle | right',
            '  1  |   2    |   3  '
        ].join('\n');

        convert(text, function(err, value) {
            assert.ifError(err);
            assert.equal(value.length, 1);
            assert.deepEqual(value[0], { left: '  1', middle: '  2', right: '  3'});
            next();
        });
    });

    it("Should support multiline rows", function(next) {

        var text = [
            'Henry V                     | Romeo and Juliet',
            '----------------------------|------------------------',
            'Once more unto the          | What light from yonder',
            'breech dear friends         | window breaks',
            '----------------------------|------------------------',
            'And sheathed their          | It is the East',
            'swords for lack of argument | and Juliet is the sun'
        ].join('\n');

        convert(text, function(err, value) {
            assert.ifError(err);
            assert.equal(value.length, 2);
            assert.deepEqual(value[0], { 'Henry V': 'Once more unto the\nbreech dear friends', 'Romeo and Juliet': 'What light from yonder\nwindow breaks'});
            assert.deepEqual(value[1], { 'Henry V': 'And sheathed their\nswords for lack of argument', 'Romeo and Juliet': 'It is the East\nand Juliet is the sun'});
            next();
        });
    });

    it("Should maintain indentation for multiline rows", function(next) {

        var text = [
            'Henry V                       | Romeo and Juliet',
            '------------------------------|------------------------',
            '  Once more unto the          |  What light from yonder',
            '                              |  ',
            '  breech dear friends         |  window breaks',
            '------------------------------|------------------------',
            '  And sheathed their          |  It is the East',
            '  swords for lack of argument |  and Juliet is the sun'
        ].join('\n');

        convert(text, function(err, value) {
            assert.ifError(err);
            assert.equal(value.length, 2);
            assert.deepEqual(value[0], { 'Henry V': '  Once more unto the\n\n  breech dear friends', 'Romeo and Juliet': ' What light from yonder\n\n window breaks'});
            assert.deepEqual(value[1], { 'Henry V': '  And sheathed their\n  swords for lack of argument', 'Romeo and Juliet': ' It is the East\n and Juliet is the sun'});
            next();
        });
    });

    it("Should support outer borders", function(next) {

        var text = [
            ' Henry V                     | Romeo and Juliet       |',
            '-----------------------------|------------------------|',
            ' Once more unto the          | What light from yonder |',
            ' breech dear friends         | window breaks          |',
            '-----------------------------|------------------------|',
            ' And sheathed their          | It is the East         |',
            ' swords for lack of argument | and Juliet is the sun  |'
        ].join('\n');

        convert(text, function(err, value) {
            assert.ifError(err);
            assert.equal(value.length, 2);
            assert.deepEqual(value[0], { 'Henry V': 'Once more unto the\nbreech dear friends', 'Romeo and Juliet': 'What light from yonder\nwindow breaks'});
            assert.deepEqual(value[1], { 'Henry V': 'And sheathed their\nswords for lack of argument', 'Romeo and Juliet': 'It is the East\nand Juliet is the sun'});
            next();
        });
    });

    it("Should report indentation errors", function(next) {

        var text = [
            'left | middle | right',
            '  1  |2       |   3  '
        ].join('\n');

        convert(text, function(err, value) {
            assert(err);
            assert.equal(err.message, 'Indentation error');
            next();
        });
    });
});
