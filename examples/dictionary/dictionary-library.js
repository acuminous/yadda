/* jslint node: true */
'use strict';

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var converters = Yadda.converters;
var assert = require('assert');

module.exports = (function() {

    var dictionary = new Dictionary()
        .define('integer', /(\d+)/, converters.integer)
        .define('float', /(\d+.\d+)/, converters.float)
        .define('date', /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/, converters.date)
        .define('period', /(\d+) (days|months|years)/, function(quantity, units, cb) {
            cb(null, { quantity: parseInt(quantity), units: units });
        });
    var library = English.library(dictionary)

    .define('Expect $integer to be an integer', function(i, next) {
        assert.equal(typeof i, 'number');
        assert(i % 1 === 0);
        next();
    })

    .define('Expect $float to be a float', function(f, next) {
        assert.equal(typeof f, 'number');
        assert(f % 1 !== 0);
        next();
    })

    .define('Expect $date to be a date', function(d, next) {
        assert.equal(Object.prototype.toString.call(d), '[object Date]');
        next();
    })

    .define('Expect $period to have a quantity of $integer and units of $units', function(period, quantity, units, next) {
        assert.equal(period.quantity, quantity);
        assert.equal(period.units, units);
        next();
    });

    return library;
})();
