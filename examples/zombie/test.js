/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
Yadda.plugins.mocha.ScenarioLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {

    featureFile(file, function(feature) {

        var library = require('./google-library');
        var yadda = Yadda.createInstance(library);

        scenarios(feature.scenarios, function(scenario, done) {
            yadda.run(scenario.steps, done);
        });
    });
});
