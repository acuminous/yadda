var url = require('url');
var request = require('request');
var app = require('../app');
var assert = require('assert');
var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

var hostname = 'localhost';
var port = 3000;
var baseUrl = url.format({protocol: 'http', hostname: hostname, port: port});
var serverUrl = url.resolve(baseUrl, '/api/server');

before(function(next) {

    // Stop the application in case it's already running
    request.del({url: serverUrl}, function(err, response, body) {

        app.start(hostname, port, function() {
            request.get({url: serverUrl}, function(err, response, body) {
                assert.ifError(err);
                assert.equal(response.statusCode, 200);
                next();
            });
        });
    });
});

after(function(next) {
    app.stop(next);
})

new Yadda.FeatureFileSearch('test/features').each(function(file) {

    featureFile(file, function(feature) {

        var library = require('./steps/bottles-library');
        var yadda = new Yadda.Yadda(library, {baseUrl: baseUrl});

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                yadda.yadda(step, done);
            });
        });
    });
});
