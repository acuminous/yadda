/* jslint node: true */
/* global featureFile, scenarios, steps, jasmine */
"use strict";

var SpecReporter = require('jasmine-spec-reporter').SpecReporter;
jasmine.getEnv().addReporter(new SpecReporter());

var Yadda = require('yadda');
Yadda.plugins.jasmine.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {
    featureFile(file, function(feature) {

        var library = require('../bottles-library');
        var yadda = Yadda.createInstance(library);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                yadda.run(step, done);
            });
        });
    });
});
