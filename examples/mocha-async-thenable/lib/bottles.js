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
            setTimeout(function() {
                wall = new Wall();
                resolve(true);
            }, 100);
        });
    })

    .given("$NUM green bottles are standing on the wall", function(number_of_bottles, bottle_type) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                wall.bottles = number_of_bottles;
                resolve(true);
            }, 100);
        });
    })

    .when("$NUM green bottle accidentally falls", function(number_of_falling_bottles, bottle_type) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                wall.fall(number_of_falling_bottles);
                resolve(true);
            }, 100);
        });
    })

    .then("there (?:are|are still) $NUM green bottles standing on the wall", function(number_of_bottles, bottle_type) {
        return new Promise(function(resolve, reject) {
            assert.equal(number_of_bottles, wall.bottles);
            resolve(true);
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
