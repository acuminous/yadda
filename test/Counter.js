"use strict";

module.exports = function() {

    var tally = 0;

    this.count = function(next) {
        tally++;
        next && next();
    };

    this.total = function() {
        return tally;
    };

};
