/* jslint node: true */
"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var assert = require('assert');

module.exports = (function() {

    var wall;

    var dictionary = new Dictionary()
        .define('NUM', /(\d+)/);

    var library = English.library(dictionary)

    .given("$NUM green bottles are standing on the wall", function(number_of_bottles) {
        wall = new Wall(number_of_bottles);
    })

    .when("$NUM green bottle accidentally falls", function(number_of_falling_bottles) {
        wall.fall(number_of_falling_bottles);
    })

    .then("there (?:are|are still) $NUM green bottles standing on the wall", function(number_of_bottles) {
        assert.equal(number_of_bottles, wall.bottles);
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
