var path = require('path');
var Yadda = require('yadda');
Yadda.plugins.mocha();

new Yadda.FeatureFileSearch('features').each(function(file) {
    feature(file, function(feature) {

        var libraries = require_feature_libraries(feature);
        var yadda = new Yadda.Yadda(libraries);

        scenarios(feature.scenarios, function(scenario, done) {
            yadda.yadda(scenario.steps, done);
        });
    });
});

function require_feature_libraries(feature) {
    return feature.annotations.libraries.split(', ').reduce(require_library, []);
};

function require_library(libraries, library) {
    return libraries.concat(require('./lib/' + library + '-steps'));
};