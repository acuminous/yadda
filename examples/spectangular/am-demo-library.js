/* globals browser, element, by, expect */
/* jslint node: true */
"use strict";
var Yadda = require('yadda');
var Dictionary = Yadda.Dictionary;
var English = Yadda.localisation.English;

module.exports = (function () {


    var list_actions;
    var grid_actions;

    var dictionary = new Dictionary()
        .define('table', /([^\u0000]*)/, Yadda.converters.table)
        .define('actions')

    var actions;

    var library = English.library(dictionary)
        .given("a table of actions\n$table",function(table){
            for (var i = 0; i < table.length; i++) {
                list_actions.push(table[i].left);
                grid_actions.push(table[i].right);
            }
        })

        .when("I open Google's $LOCALE search page", function (locale, next) {
            browser.driver.get("http://www.google." + locale + "/");
        })

        .then("the title is $TITLE", function (title) {
            return browser.driver.getTitle().then(function (value) {
                return value === title;
            });
        })

        .then("the $ACTION form exists", function (action) {
            return browser.driver.isElementPresent(by.css('form[action="/' + action + '"]'));
        })

        .when("I search for $TERM", function (term) {
            browser.driver.findElement(by.name('q')).then(function (el) {
                el.sendKeys(term + '\n');
            });
        })

        .then("the search for $TERM was made", function (term) {
            return browser.driver.getCurrentUrl().then(function (value) {
                return new RegExp('q=' + term).test(value);
            });
        })

        .then("$NUM or more results were returned", function (number) {
            browser.driver.findElements(by.css('h3.r')).then(function (elements) {
                return elements.length >= number;
            });
        });

    return library;
})();
