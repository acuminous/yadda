/* jslint node: true */
/* global jasmine, describe, beforeAll, afterAll, featureFile, scenarios, steps */
"use strict";

require('jasmine-before-all');
var webdriver = require('selenium-webdriver');
var Yadda = require('yadda');
var library = require('../google-library');
var fs = require('fs');

Yadda.plugins.jasmine.StepLevelPlugin.init();
jasmine.getEnv().defaultTimeoutInterval = 10000;

var driver;

describe('Google', function() {

    beforeAll(function(done) {
        executeInFlow(function() {
            driver = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();
            driver.manage().timeouts().implicitlyWait(10000);
        }, done);
    });

    new Yadda.FeatureFileSearch('features').each(function(file) {
        featureFile(file, function(feature) {
            scenarios(feature.scenarios, function(scenario) {
                steps(scenario.steps, function(step, done) {
                    executeInFlow(function() {
                        Yadda.createInstance(library, { driver: driver }).run(step);
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
    webdriver.promise.controlFlow().execute(fn).then(function() {
        done();
    }, function(err) {
        if (err) takeScreenshot();
    });
}

function takeScreenshot(step) {
    var path = 'screenshots/' + step.replace(/\W+/g, '_').toLowerCase() + '.png';
    driver.takeScreenshot().then(function(data) {
        fs.writeFileSync(path, data, 'base64');
    });
}
