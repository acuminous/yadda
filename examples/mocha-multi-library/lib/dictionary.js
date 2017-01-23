"use strict";

var Yadda = require('yadda');
var Dictionary = Yadda.Dictionary;

module.exports = (function() {
    return new Dictionary().define('NUM', /(\d+)/);
})();
