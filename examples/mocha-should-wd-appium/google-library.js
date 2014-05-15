/* jslint node: true */
'use strict';

var should = require('should');
var Yadda = require('yadda');

module.exports = (function() {
  var dictionary = new Yadda.Dictionary()
    .define('LOCALE', /(fr|es|ie)/)
    .define('NUM', /(\d+)/);

  var library = new Yadda.localisation.English.library(dictionary)

  .when('I open Google\'s $LOCALE search page', function (locale, done) {
    this.browser
      .get('http://www.google.' + locale + '/')
      .nodeify(done);
  })

  .then('the title is $TITLE', function (title, done) {
    this.browser.title()
      .then(function (pageTitle) {
        pageTitle.should.eql(title);
      })
      .nodeify(done);
  })

  .then("the $ACTION form exists", function (action, done) {
    this.browser.elementByCss('form[action="/' + action + '"]')
      .then(function (form) {
        should(form).ok;
      })
      .nodeify(done);
  })

  .when('I search for $TERM', function (term, done) {
    var browser = this.browser;
    this.browser.elementByName('q')
      .then(function (input) {
        // type search, and submit.
        input.type(term + '\n');
        // wait for page load after submit.
        browser.waitForElementByCss('#rcnt', 5000)
          .nodeify(done);
      });
  })

  .then('the search for $TERM was made', function (term, done) {
      this.browser.url()
        .then(function (url) {
          new RegExp('q=' + term).test(url);
        })
        .nodeify(done);
  })

  .then('$NUM or more results were returned', function (number, done) {
    this.browser.elementsByCss('h3.r')
      .then(function (elements) {
        should(elements.length >= parseInt(number)).ok;
      })
      .nodeify(done);
  });

  return library;
})();
