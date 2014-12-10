/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var fs = require('fs');
var Yadda = require('../../lib/index');
var parser = new Yadda.parsers.FeatureParser();
var library = require('./bottles-library');
var yadda = new Yadda.createInstance(library);

new Yadda.FeatureFileSearch('features').each(function(file) {

    var text = fs.readFileSync(file, 'utf8');
    var feature = parser.parse(text);

    feature.scenarios.forEach(function(scenario) {
        exports[scenario.title] = function(test) {
            yadda.run(scenario.steps, { test: test }, test.done);
        };
    });
});
