/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var parse = require('csv-parse');
var Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {

    featureFile(file, function(feature) {

        var transpileLibrary = require('./transpile-library');
        var csvLibrary = require('./csv-library.js');

        var yadda = Yadda.createInstance([transpileLibrary, csvLibrary]);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                yadda.run(step, done);
            });
        });
    });
});
