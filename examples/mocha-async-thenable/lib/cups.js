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

    .given("$NUM green cups are standing on the wall", function(number_of_cups, cup_type) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                wall.cups = number_of_cups;
                resolve(true);
            }, 100);
        });
    })

    .when("$NUM green cup accidentally falls", function(number_of_falling_cups, cup_type) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                wall.fall(number_of_falling_cups);
                resolve(true);
            }, 100);
        });
    })

    .then("there (?:are|are still) $NUM green cups standing on the wall", function(number_of_cups, cup_type) {
        return new Promise(function(resolve, reject) {
            assert.equal(number_of_cups, wall.cups);
            resolve(true);
        });
    });

    var Wall = function(cups) {
        this.cups = cups;
        this.fall = function(n) {
            this.cups -= n;
        };
        this.returned = function() {
            this.cups++;
        };
    };

    return library;
})();
