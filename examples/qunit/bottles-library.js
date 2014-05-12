/* jslint node: true */
/* global equal */
"use strict";

var Dictionary = require('yadda').Dictionary;
var English = require('yadda').localisation.English;

var wall;
var dictionary = new Dictionary().define('NUM', /(\d+)/);
var library = English.library(dictionary)

    .given("$NUM green bottles are standing on the wall", function(number_of_bottles) {
        wall = new Wall(number_of_bottles);
    })

    .when("$NUM green bottle accidentally falls", function(number_of_falling_bottles) {
        wall.fall(number_of_falling_bottles);
    })

    .then("there (?:are|are still) $NUM green bottles standing on the wall", function(number_of_bottles) {
        equal(number_of_bottles, wall.bottles);
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
