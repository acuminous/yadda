/* jslint node: true */
/* global mocha, feature, scenarios */
"use strict";

(function() {

    var Yadda = require('yadda');
    var English = Yadda.localisation.English;
    var FeatureParser = Yadda.parsers.FeatureParser;
    var parser = new FeatureParser(English);
    var bottles = require('yadda-component-browser-example/features/bottles.feature.js');
    var library = require('yadda-component-browser-example/bottles-library.js');
    var yadda = new Yadda.Yadda(library);

    mocha.setup('bdd');
    Yadda.plugins.mocha();

    feature(bottles, function(feature) {
        scenarios(feature.scenarios, function(scenario, done) {
            yadda.yadda(scenario.steps, done);
        });
    });
})();
