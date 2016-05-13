/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
var EventBus = Yadda.EventBus;
Yadda.plugins.mocha.StepLevelPlugin.init();

var unused = {};

EventBus.instance()
    .on(EventBus.ON_DEFINE, function(event) {
        unused[event.data.pattern] = event.data.signature;
    }).on(EventBus.ON_EXECUTE, function(event) {
        delete unused[event.data.pattern];
    });

new Yadda.FeatureFileSearch('features').each(function(file) {

    featureFile(file, function(feature) {

        var library = require('./bottles-library');
        var yadda = Yadda.createInstance(library);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                yadda.run(step, done);
            });
        });
    });
});

after(function() {
    console.log('Unused steps');
    for (var pattern in unused) {
        console.log(pattern)
    }
})