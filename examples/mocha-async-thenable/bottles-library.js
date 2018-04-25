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

    .given("$NUM green $ITEMS are standing on the wall", function(number_of_items, item_type) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                wall.items = number_of_items;
                resolve(true);
            }, 100);
        });
    })

    .when("$NUM green $ITEM accidentally falls", function(number_of_falling_items, item_type) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                wall.fall(number_of_falling_items);
                resolve(true);
            }, 100);
        });
    })

    .then("there (?:are|are still) $NUM green $ITEMS standing on the wall", function(number_of_items, item_type) {
        return new Promise(function(resolve, reject) {
            assert.equal(number_of_items, wall.items);
            resolve(true);
        });
    });

    var Wall = function(items) {
        this.items = items;
        this.fall = function(n) {
            this.items -= n;
        };
        this.returned = function() {
            this.items++;
        };
    };

    return library;
})();
