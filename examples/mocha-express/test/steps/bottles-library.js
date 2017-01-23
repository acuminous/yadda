"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var Dictionary = Yadda.Dictionary;
var assert = require('assert');
var request = require('request');
var _ = require('underscore');
var async = require('async');
var url = require('url');

module.exports = (function() {

    var bottles;
    var dictionary = new Dictionary().define('NUM', /(\d+)/);
    var library = English.library(dictionary)

        .given("$NUM green bottles are standing on the wall", function(number_of_bottles, next) {
            var data = _.chain(number_of_bottles).range().map(function(data) {
                return { colour: 'green' };
            }).value();

            request.put({ url: url.resolve(this.baseUrl, '/api/bottles'), json: data }, function(err, response, body) {
                assert.ifError(err);
                assert.equal(response.statusCode, 200);
                bottles = body;
                next();
            });
        })

        .when("$NUM green bottle accidentally falls", function(number_of_falling_bottles, next) {
            var _this = this;
            var urls = _.chain(number_of_falling_bottles).range().map(function() {
                return url.resolve(_this.baseUrl, bottles.pop().uri);
            }).value();
            async.each(urls, function(url, callback) {
                request.del(url, function(err, response, body) {
                    assert.ifError(err);
                    assert.equal(response.statusCode, 204);
                    callback();
                });
            }, next);
        })

        .then("there (?:are|are still) $NUM green bottles standing on the wall", function(number_of_bottles, next) {
            request.get({ url: url.resolve(this.baseUrl, '/api/bottles'), json:true }, function(err, response, body) {
                assert.ifError(err);
                assert.equal(response.statusCode, 200);
                assert.equal(body.length, parseInt(number_of_bottles));
                next(err);
            });
        });

    return library;
})();
