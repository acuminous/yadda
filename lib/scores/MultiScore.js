"use strict";

var $ = require('../Array');

var MultiScore = function(scores) {

    this.scores = $(scores);
    this.type = 'MultiScore';

    this.compare = function(other) {
        for (var i = 0; i < this.scores.length; i++) {
            var difference = this.scores[i].compare(other.scores[i]);
            if (difference) return difference;
        }
        return 0;
    };

    this.equals = function(other) {
        if (!other) return false;
        if (this.type !== other.type) return false;
        return this.compare(other) === 0;
    };
};

module.exports = MultiScore;
