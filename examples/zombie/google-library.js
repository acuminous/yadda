/* jslint node: true */
"use strict";

var Browser = require("zombie");
var assert = require("assert");
var Yadda = require('yadda');

module.exports = (function() {

    var browser = new Browser();

    var dictionary = new Yadda.Dictionary()
        .define('LOCALE', /(fr|es|ie)/)
        .define('NUM', /(\d+)/);

    var library = Yadda.localisation.English.library(dictionary)

    .when("I open Google's $LOCALE search page", function(locale, next) {
        browser.visit("http://www.google." + locale + "/", function(err) {
            assert.ok(browser.success);
            next(err);
        });
    })

    .then("the title is $TITLE", function(title, next) {
        assert.equal(browser.text("title"), title);
        next();
    })

    .then("the $ACTION form exists", function(action, next) {
        assert(browser.query('form[action="/' + action + '"]'));
        next();
    })

    .when("I search for $TERM", function(term, next) {
        browser.fill('q', term).pressButton('btnG', function(err) {
            assert.ok(browser.success);
            next(err);
        });
    })

    .then("the search for $TERM was made", function(term, next) {
        assert.ok(new RegExp('q=' + term).test(browser.location.toString()), 'Search term does not appear in the url');
        next();
    })

    .then("$NUM or more results were returned", function(number, next) {
        assert.ok(browser.queryAll('.web_result').length >= parseInt(number), 'Insufficient search results');
        next();
    });

    return library;
})();
