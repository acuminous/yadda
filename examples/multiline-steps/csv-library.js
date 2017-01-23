"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var parse = require('csv-parse');
var _ = require('lodash');
var assert = require('assert');

module.exports = (function () {

    var csv;

    var dictionary = new Yadda.Dictionary()
            .define('csv', /([^\u0000]*)/, csvConverter)
            .define('name', /(\w+)/, nameConverter);

    var library = English.library(dictionary)

    .given("a csv file\n$csv", function (_csv, next) {
        csv = _csv;
        next();
    })

    .then("$name is older than $name", function (user1, user2, next) {
        assert(user1.Age > user2.Age);
        next();
    });

    function csvConverter(text, cb) {
        parse(text, { auto_parse: true, columns: true }, cb);
    }

    function nameConverter(name, cb) {
        cb(null, _.find(csv, function(row) {
            return row['First Name'] === name;
        }));
    }

    return library;
})();
