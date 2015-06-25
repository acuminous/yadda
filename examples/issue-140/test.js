/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var library = English.library();
var fs = require('fs')


for (var i = 1; i <= 2000; i++) {

    var feature = [
        'Feature: Feature ' + i,
        '',
        'Scenario: Scenario ' + i,
        'Given some step ' + i,
        ''
    ].join('\n')

    fs.writeFileSync('./features/feature-' + i + '.feature', feature)

    library.given('some step ' + i, function(next) {
        setImmediate(function() {
            next()
        })
    })
}

Yadda.plugins.mocha.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {

    featureFile(file, function(feature) {

        var yadda = Yadda.createInstance(library);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                yadda.run(step, done);
            });
        });
    });
});
