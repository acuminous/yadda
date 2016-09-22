/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

function *flatten(steps) {
    for (const step of steps) {
        const pattern = /^Sing (.*?) (.*?) bottles$/;

        const match = step.match(pattern);
        if (match) {
            const [ , num, color ] = match;
            yield *flatten([
                `Given ${num} ${color} bottles are standing on the wall`,
                `When 1 ${color} bottle accidentally falls`,
                `Then there are ${num - 1} ${color} bottles standing on the wall`
            ]);
        }
        else {
            yield step;
        }
    }
}

new Yadda.FeatureFileSearch('features').each(function(file) {

    featureFile(file, function(feature) {

        var library = require('./bottles-library');
        var yadda = Yadda.createInstance(library);

        scenarios(feature.scenarios, function(scenario) {
            steps([...flatten(scenario.steps)], function(step, done) {
                yadda.run(step, done);
            });
        });
    });
});
