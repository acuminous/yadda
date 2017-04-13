/* jslint node: true */
/* global browser, describe, featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
var library = require('../am-demo-library');
var fs = require('fs');

Yadda.plugins.jasmine.StepLevelPlugin.init();

describe('Angular-material', function () {

    new Yadda.FeatureFileSearch('features').each(function (file) {
        featureFile(file, function (feature) {
            scenarios(feature.scenarios, function (scenario) {
                steps(scenario.steps, function (step, done) {
                    executeInFlow(function () {
                        Yadda.createInstance(library, {driver: browser.driver}).run(step);
                    }, function (err) {
                        if (err) console.log('error: ' + err.message);
                        done(err);
                    });
                });
            });
        });
    });
});

function executeInFlow(fn, done) {
    browser.driver.controlFlow().execute(fn).then(function () {
        done();
    }, function (err) {
        if (err) console.log('error: ' + err.message);
    });
}

