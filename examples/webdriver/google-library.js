var webdriver = require('selenium-webdriver');
var assert = require('assert');
var Yadda = require('yadda');

module.exports = (function() {

    var dictionary = new Yadda.Dictionary()
        .define('LOCALE', /(fr|es|ie)/)
        .define('NUM', /(\d+)/);

    var library = new Yadda.localisation.English(dictionary)

    .when("I open Google's $LOCALE search page", function(locale, next) {  
        this.driver.get("http://www.google." + locale + "/").then(next);
    })

    .then("the title is $TITLE", function(title, next) {
        var driver = this.driver;
        driver.wait(function() {
            return driver.getTitle().then(function(value) {
                return value === title;
            }); 
        }, 5000).then(function() {
            next();
        });
    })

    .then("the $ACTION form exists", function(action, next) {
        this.driver.findElement(webdriver.By.css('form[action="/' + action + '"]')).then(function(form) {
            assert.ok(form);
            next();
        });
    })

    .when("I search for $TERM", function(term, next) {
        this.driver.findElement(webdriver.By.name('q')).then(function(input) {
            input.sendKeys(term + '\n').then(next);
        });
    })

    .then("the search for $TERM was made", function(term, next) {
        var driver = this.driver;
        driver.wait(function() {
            return driver.getCurrentUrl().then(function(value) {
                return new RegExp('q=' + term).test(value);
            }); 
        }, 5000).then(function() {
            next();
        });
    })

    .then("$NUM or more results were returned", function(number, next) {
        this.driver.findElements(webdriver.By.css('h3.r')).then(function(elements) {
            assert.ok(elements.length >= parseInt(number));
            next();
        });
    });

    return library;
})();