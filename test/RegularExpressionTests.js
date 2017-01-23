"use strict";

var assert = require('assert');
var RegularExpression = require('../lib/RegularExpression');

describe('RegularExpression', function() {

    it('should base equality on underlying RegExp source', function() {
        assert.ok(new RegularExpression(/abc/).equals(new RegularExpression(/abc/)));
        assert.ok(new RegularExpression('abc').equals(new RegularExpression('abc')));
        assert.ok(new RegularExpression(/abc/).equals(new RegularExpression('abc')));
        assert.ok(new RegularExpression('abc').equals(new RegularExpression(/abc/)));
    });

    it('should provide matching groups', function() {
        var words = new RegularExpression(/(\d+) (\w+)/g);
        var groups = words.groups('1 the 2 quick 3 brown 4 fox');
        assert.equal(groups.length, 8);
        assert.equal(groups[0], '1');
        assert.equal(groups[1], 'the');
        assert.equal(groups[3], 'quick');
    });

    it('should provide multiline', function() {
        var words = new RegularExpression(/text: ([^\u0000]*)/);
        var groups = words.groups('text: 1\n2\n3');
        assert.equal(groups.length, 1);
        assert.equal(groups[0], '1\n2\n3');
    });
});
