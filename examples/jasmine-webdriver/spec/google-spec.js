require('jasmine-before-all');
var webdriver = require('selenium-webdriver');
var Yadda = require('yadda');
var library = require('../google-library');
var fs = require('fs');

Yadda.plugins.mocha.AsyncStepLevelPlugin.init();
jasmine.getEnv().defaultTimeoutInterval = 10000;

var driver;


describe('Google', function() {

    beforeAll(function() {
        driver = new webdriver.Builder()
            .withCapabilities(webdriver.Capabilities.chrome())
            .build();
    })

    new Yadda.FeatureFileSearch('features').each(function(file) {
        featureFile(file, function(feature) {
            scenarios(feature.scenarios, function(scenario) {
                steps(scenario.steps, function(step, done) {
                    executeInFlow(function() {
                        new Yadda.Yadda(library, {driver: driver}).yadda(step);
                    }, function(err) {
                        if (err) takeScreenshot(step);
                        done(err);
                    });
                });
            });
        });
    });

    afterAll(function(done) {
        driver.quit().then(function() {
            done();
        }, done);
    });
});

function executeInFlow(fn, done) {
    webdriver.promise.controlFlow().execute(fn).then(
        function() {
            done();
        },
        function(err) {
            if (err) takeScreenshotOnFailure();
        }
    );
}

function takeScreenshot(step) {
    var path = 'screenshots/' +
                step.replace(/\W+/g, '_').toLowerCase() +
                '.png';
    driver.takeScreenshot().then(function(data) {
        fs.writeFileSync(path, data, 'base64');
    });
}
