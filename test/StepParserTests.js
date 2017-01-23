"use strict";

var assert = require("assert");
var StepParser = require('../lib/index').parsers.StepParser;

describe('StepParser', function() {

    it('should parse steps', function() {
        var parser = new StepParser();
        var text = ['Given A', '', '   When B   ', '   ', 'Then C'].join('\n');
        var steps = parser.parse(text);

        assert.equal(steps.length, 3);
        assert.equal(steps[0], 'Given A');
        assert.equal(steps[1], '   When B   ');
        assert.equal(steps[2], 'Then C');
    });
});
