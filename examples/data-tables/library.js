"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var assert = require('assert');

module.exports = (function () {

    var list_total;
    var table_totals;

    var dictionary = new Dictionary()
        .define('totals', /(\d+)/, Yadda.converters.integer)
        .define('list', /([^\u0000]*)/, Yadda.converters.list)
        .define('table', /([^\u0000]*)/, Yadda.converters.table);

    var library = English.library(dictionary)

    .given("a list of integers\n$list", function(list) {
        list_total = 0;
        for (var i = 0; i < list.length; i++) {
            list_total += parseInt(list[i]);
        }
    })

    .then('the total should be $total', function(expected) {
        assert.equal(list_total, expected);
    })

    .given('a table of data\n$table', function(table) {
        table_totals = { left: 0, right: 0 };
        for (var i = 0; i < table.length; i++) {
            table_totals.left += parseInt(table[i].left);
            table_totals.right += parseInt(table[i].right);
        }
    })

    .then('the $key total should be $total', function(key, expected) {
        assert.equal(table_totals[key], expected);
    })

    .given('some Shakespeare\n$table', function(table) {
        table_totals = { 'Henry V': 0, 'Romeo and Juliet': 0 };
        for (var i = 0; i < table.length; i++) {
            table_totals['Henry V'] += table['Henry V'].split(/\s/).length;
            table_totals['Romeo and Juliet'] += table['Romeo and Juliet'].split(/\s/).length;
        }
    })

    .then('the $extract extract should have $total words', function(extract, expected) {
        assert.equal(extract.split(/\W/).length, expected);
    });

    return library;
})();
