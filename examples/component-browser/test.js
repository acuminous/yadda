/* jslint node: true */
/* global mocha, featureFiles, scenarios */
"use strict";

(function() {

    var Yadda = require('yadda');
    var English = Yadda.localisation.English;
    var FeatureParser = Yadda.parsers.FeatureParser;
    var parser = new FeatureParser(English);
    var bottles = require('yadda-component-browser-example/features/bottles.feature.js');
    var library = require('yadda-component-browser-example/bottles-library.js');
    var yadda = Yadda.createInstance(library);

    mocha.setup('bdd');
    Yadda.plugins.mocha.ScenarioLevelPlugin.init({ parser: parser });

    featureFiles(bottles, function(feature) {
        scenarios(feature.scenarios, function(scenario, done) {
            yadda.run(scenario.steps, done);
        });
    });
})();
