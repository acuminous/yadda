/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var fs = require('fs');
var Yadda = require('../../lib/index');
var parser = new Yadda.parsers.FeatureParser();
var library = require('./bottles-library');
var yadda = new Yadda.Yadda(library);

new Yadda.FeatureFileSearch('features').each(function(file) {
    featureFile(file, function(feature) {
        scenarios(feature.scenarios, function(scenario) {
            exports[scenario.title] = function(test) {
                yadda.yadda(scenario.steps, { test: test }, test.done);
            };
        });
    });
});
