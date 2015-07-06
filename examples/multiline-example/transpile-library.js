/* jslint node: true */
"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var babel = require("babel");

module.exports = (function() {

    var case_description;
    var es6_code;

    var dictionary = new Dictionary();
    dictionary.define('CASE', /(.*)/);
    dictionary.define('CODE', /([^\0000]*)/);
    var library = English.library(dictionary)

        .given("I need to transpile $CASE", function(s, next) {
            case_description = s;
            next();
        })

        .when("EcmaScript6=$CODE", function(code, next) {
            es6_code = code;
            next();
        })

        .then("EcmaScript5=$CODE", function(expected_es5_code, next) {

            debugger;

            var result = babel.transform(es6_code, {
                filename: case_description,
                compact: false,
            });

            var actual_es5_code=result.code;

            if (expected_es5_code.trim() != actual_es5_code.trim())
                throw new Error(
                       ["transpile fail on "+case_description,
                       "expected:",
                       expected_es5_code,
                       "actual",
                       actual_es5_code].join('\n'));

            next();
        });

    return library;
})();

