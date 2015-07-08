/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var Macro = require('../lib/Macro');
var Competition = require('../lib/Competition');

describe('Competition', function() {

    it("should decide winner by Levenshtein distance", function() {
        var best_match = new Macro('best', /given 1 (.*) patient/);
        var middle_match = new Macro('middle', /given (\d+) (.*) patient(?:s{0,1})/);
        var worst_match = new Macro('worse', /given (\d+) (.*) (?:patient|patients)/);
        var competition = new Competition('given 1 male patient', [worst_match, best_match, middle_match]);

        assert.equal(competition.clear_winner().signature, best_match.signature);
    });

    it("should decide winner by Levenshtein distance on multiline", function() {
        var best_match = new Macro('best', /given 1 ([^\u0000]*) text/);
        var middle_match = new Macro('middle', /given (\d+) ([^\u0000]*) text (?:s{0,1})/);
        var worst_match = new Macro('worse', /given (\d+) ([^\u0000]*) (?:text|code)/);
        var competition = new Competition('given 1 a\nb\nc text', [worst_match, best_match, middle_match]);

        assert.equal(competition.clear_winner().signature, best_match.signature);
    });

    it("should support joint winners", function() {
        var best_match = new Macro('best', /given 1 (.*) patient/);
        var equal_match = new Macro('equal', /given 1 (.+) patient/);
        var competition = new Competition('given 1 male patient', [best_match, equal_match]);

        assert.throws(function() {
            competition.clear_winner();
        }, /Ambiguous Step: \[given 1 male patient\]. Patterns \[\/best\/, \/equal\/\] match equally well./);
    });

    it("should support multiline joint winners", function() {
        var best_match = new Macro('best', /given ([^\u0000]*) text/);
        var equal_match = new Macro('equal', /given ([^\u0000]+) text/);
        var competition = new Competition('given 1\n2\n3 text', [best_match, equal_match]);

        assert.throws(function() {
            competition.clear_winner();
        }, /Ambiguous Step: \[given 1\n2\n3 text\]. Patterns \[\/best\/, \/equal\/\] match equally well./);
    });

    it("Should support no winner", function() {
        var competition = new Competition('given 1 male patient', []);

        assert.throws(function() {
            competition.clear_winner();
        }, /Undefined Step: \[given 1 male patient\]/);
    });
});
