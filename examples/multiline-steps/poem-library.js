"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var parse = require('csv-parse');
var assert = require('assert');

module.exports = (function () {

    var poem;
    var dictionary = new Dictionary()
        .define('NUM', /(\d+)/, Yadda.converters.integer)
        .define('poem', /([^\u0000]*)/);

    var library = English.library(dictionary)

    .define("Good Times\n$poem", function (_poem, next) {
        poem = _poem;
        next();
    })

    .define("Has $NUM verses", function (verses, next) {
        assert(poem.split(/\n\n/).length === 2);
        next();
    });

    return library;
})();
