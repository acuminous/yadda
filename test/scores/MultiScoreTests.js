"use strict";

var assert = require('assert');
var MultiScore = require('../../lib/scores/MultiScore');

describe('MultiScore', function() {

    it('should return true when first sub score wins', function() {
        var m1 = new MultiScore([
            new SimpleScore(1)
        ]);
        var m2 = new MultiScore([
            new SimpleScore(0)
        ]);

        assert.ok(m1.compare(m2) > 0);
    });

    it('should return false when first sub score loses', function() {
        var m1 = new MultiScore([
            new SimpleScore(0)
        ]);
        var m2 = new MultiScore([
            new SimpleScore(1)
        ]);

        assert.ok(m1.compare(m2) < 0);
    });

    it('should ignore subsequent scores after a win', function() {
        var m1 = new MultiScore([
            new SimpleScore(1),
            new SimpleScore(0)
        ]);
        var m2 = new MultiScore([
            new SimpleScore(0),
            new SimpleScore(1)
        ]);

        assert.ok(m1.compare(m2) > 0);
    });

    it('should ignore subsequent scores after a loss', function() {
        var m1 = new MultiScore([
            new SimpleScore(0),
            new SimpleScore(1)
        ]);
        var m2 = new MultiScore([
            new SimpleScore(1),
            new SimpleScore(0)
        ]);

        assert.ok(m1.compare(m2) < 0);
    });

    it('should return true when first sub score draws but second wins', function() {
        var m1 = new MultiScore([
            new SimpleScore(0),
            new SimpleScore(1)
        ]);
        var m2 = new MultiScore([
            new SimpleScore(0),
            new SimpleScore(0)
        ]);

        assert.ok(m1.compare(m2) > 0);
    });


    function SimpleScore(value) {
        this.value = value;
        this.compare = function(other) {
            return this.value - other.value;
        };
    }

});
