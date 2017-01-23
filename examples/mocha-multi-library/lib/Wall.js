"use strict";

var Wall = function(items) {
    this.items = items;
    this.fall = function(n) {
        this.items -= n;
    };
    this.returned = function() {
        this.items++;
    };
};

module.exports = Wall;
