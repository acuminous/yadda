"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var assert = require('assert');
var format = require('util').format;

module.exports = (function() {

    var wall;
    var dictionary = new Dictionary().define('NUM', /(\d+)/);
    var library = English.library(dictionary)

    .define("Sing $NUM $COLOUR bottles", function(number_of_bottles, colour, next) {
        this.yadda.run([
            format('Given %d %s bottles are standing on the wall', number_of_bottles, colour),
            format('When 1 %s bottle accidentally falls', colour),
            format('Then there are %d %s bottles standing on the wall', number_of_bottles - 1, colour)
        ], next);
    })

    .given("$NUM $COLOUR bottles are standing on the wall", function(number_of_bottles, colour, next) {
        wall = wall || new Wall();
        wall.bottles = number_of_bottles;
        wall.bottleColour = colour;
        next();
    })

    .when("$NUM $COLOUR bottle accidentally falls", function(number_of_falling_bottles, colour, next) {
        wall.fall(number_of_falling_bottles);
        next();
    })

    .then("there (?:are|are still) $NUM $COLOUR bottles standing on the wall", function(number_of_bottles, colour, next) {
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
