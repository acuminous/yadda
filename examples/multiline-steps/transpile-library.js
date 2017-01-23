"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var babel = require("babel");

module.exports = (function () {

    var case_description;
    var es6_code;
    var cases = {};

    var dictionary = new Dictionary()
        .define('CASE', /(\w+)/, unique)
        .define('CODE', /([^\u0000]*)/);
    var library = English.library(dictionary)

    .given("I need to transpile $CASE", function (s, next) {
        case_description = s;
        next();
    })

    .when("EcmaScript6=$CODE", function (code, next) {
        es6_code = code;
        next();
    })

    .then("EcmaScript5=$CODE", function (expected_es5_code, next) {

        var result = babel.transform(es6_code, {
            filename: case_description,
            compact: false,
        });

        var actual_es5_code = result.code;

        if (expected_es5_code.trim() != actual_es5_code.trim())
            throw new Error(
                       ["transpile fail on " + case_description,
                       "expected:",
                       expected_es5_code,
                       "actual",
                       actual_es5_code].join('\n'));

        next();
    });

    function unique(key, next) {
        if (Object.keys(cases).indexOf(key) >= 0) return next(new Error('case: ' + key + ' is not unique'));
        cases[key] = key;
        next(null, key);
    }

    return library;
})();
