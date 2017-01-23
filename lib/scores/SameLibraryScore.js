"use strict";

var SameLibraryScore = function(m1, m2) {

    this.value = m1.is_sibling(m2) ? 1 : 0;
    this.type = 'SameLibraryScore';

    this.compare = function(other) {
        return this.value - other.value;
    };

    this.equals = function(other) {
        if (!other) return false;
        return (this.type === other.type && this.value === other.value);
    };
};

module.exports = SameLibraryScore;
