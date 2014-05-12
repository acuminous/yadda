/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var assert = require('assert');
var dictionary = require('./dictionary');
var Wall = require('./wall');

module.exports = (function() {

    var wall;

    var library = English.library(dictionary)

        .given("$NUM green bottles are standing on the wall", function(number_of_bottles, next) {
            wall = new Wall(number_of_bottles);
            next();
        })

        .when("$NUM green bottle accidentally falls", function(number_of_falling_bottles, next) {
            wall.fall(number_of_falling_bottles);
            next();
        })

        .then("there (?:are|are still) $NUM green bottles standing on the wall", function(number_of_bottles, next) {
            assert.equal(number_of_bottles, wall.items);
            next();
        });

    return library;
})();
