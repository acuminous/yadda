/* jslint node: true */
"use strict";

var Pirate = require('../../lib/localisation/Pirate');
var Dictionary = require('../../lib/Dictionary');
var assert = require('assert');

module.exports = (function() {

    var wall;

    var dictionary = new Dictionary()
        .define('NUM', /(\d+)/);

    var library = Pirate.library(dictionary)

    .given("$NUM green bottles are standing on the wall", function(number_of_bottles, next) {
        wall = new Wall(number_of_bottles);
        next();
    })

    .when("$NUM green bottle accidentally falls", function(number_of_falling_bottles, next) {
        wall.fall(number_of_falling_bottles);
        next();
    })

    .then("there (?:are|are still) $NUM green bottles standing on the wall", function(number_of_bottles, next) {
        assert.equal(number_of_bottles, wall.bottles);
        next();
    });

    var Wall = function(bottles) {
        this.bottles = bottles;
        this.fall = function(n) {
            this.bottles -= n;
        };
        this.returned = function() {
            this.bottles++;
        };
    };

    return library;
})();
