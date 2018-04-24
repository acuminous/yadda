"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var assert = require('assert');

module.exports = (function() {

    var wall;
    var dictionary = new Dictionary().define('NUM', /(\d+)/);
    var library = English.library(dictionary)

    .given("a $NUM foot wall", function(height) {
        return new Promise(function(resolve, reject) {
            wall = new Wall();
            setTimeout(function() {
                resolve(true);
            }, 500);
        });
    })

    .given("$NUM green bottles are standing on the wall", function(number_of_bottles) {
        return new Promise(function(resolve, reject) {
            wall.bottles = number_of_bottles;
            setTimeout(function() {
                resolve(true);
            }, 250);
        });
    })

    .when("$NUM green bottle accidentally falls", function(number_of_falling_bottles) {
        return new Promise(function(resolve, reject) {
            wall.fall(number_of_falling_bottles);
            setTimeout(function() {
                resolve(true);
            }, 125);
        });
    })

    .then("there (?:are|are still) $NUM green bottles standing on the wall", function(number_of_bottles) {
        return new Promise(function(resolve, reject) {
            assert.equal(number_of_bottles, wall.bottles);
            setTimeout(function() {
                resolve(true);
            }, 75);
        });
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
