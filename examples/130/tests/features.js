/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();
var path = require('path')

new Yadda.FeatureFileSearch(path.join(__dirname, 'features')).each(function(file) {

    featureFile(file, function(feature) {

        var library = require('./steps/bottles-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                yadda.yadda(step, done);
            });
        });
    });
});
