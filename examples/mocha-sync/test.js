/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
Yadda.plugins.mocha.SyncStepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {
    featureFile(file, function(feature) {

        var library = require('./bottles-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step) {
                yadda.yadda(step);
            });
        });
    });
});
