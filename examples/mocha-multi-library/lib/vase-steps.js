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

        .given("$NUM green vases are standing on the wall", function(number_of_vases, next) {
            wall = new Wall(number_of_vases);
            next();
        })

        .when("$NUM green vase accidentally falls", function(number_of_falling_vases, next) {
            wall.fall(number_of_falling_vases);
            next();
        })

        .then("there (?:are|are still) $NUM green vases standing on the wall", function(number_of_vases, next) {
            assert.equal(number_of_vases, wall.items);
            next();
        });

    return library;
})();
