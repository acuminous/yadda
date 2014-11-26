/* jslint node: true */
"use strict";

var Yadda = require('yadda');
var assert = require('assert');

module.exports = (function() {
    return new Yadda.Library().define('context string').define("step A").define("step B")
})();
