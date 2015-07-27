/* globals browser, element, by, expect */
/* jslint node: true */
"use strict";
var Yadda = require('yadda');

/**
 * In all the steps Selenium web-driver (browser.driver) is used, because Google is not an Angular application.
 */
module.exports = (function () {

    var dictionary = new Yadda.Dictionary()
        .define('LOCALE', /(fr|es|ie)/)
        .define('NUM', /(\d+)/);

    var library = new Yadda.localisation.English.library(dictionary)

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
