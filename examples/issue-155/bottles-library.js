/* jslint node: true */
"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var assert = require('assert');

module.exports = (function() {

    var dictionary = new Dictionary()
        .define('NUM', /(\d+)/);

    var library = English.library(dictionary)

    .given("I visit $url", function(url) {
    })

    .when("I type in $word", function() {
    })

    .when("I click $button", function() {
    })

    .then("'$word' exists in the page", function() {
    })

    return library;
})();
