/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

/*
Please note this is just one way to import different libraries per feature
The downsides of this approach are that it pollutes the specification
and doesn't support running the same specification with different libraries,
which can be useful if the application under test supports multiple
interfaces (Rest, Web, CLI, etc)
*/

var path = require('path');
var Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {

    featureFile(file, function(feature) {

        var libraries = require_feature_libraries(feature);
        var yadda = Yadda.createInstance(libraries);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                yadda.run(step, done);
            });
        });
    });
});

function require_feature_libraries(feature) {
    return feature.annotations.libraries.split(', ').reduce(require_library, []);
}

function require_library(libraries, library) {
    return libraries.concat(require('./lib/' + library + '-steps'));
}
