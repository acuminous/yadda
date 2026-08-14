/* jslint node: true */
/* global featureFile, scenarios, steps */
var Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function (file) {
  featureFile(file, function (feature) {
    var library = require('./lib/bottles-library');
    var yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, function (scenario) {
      // A mutable object shared by reference across the scenario's steps.
      // Yadda flattens the context afresh for each step, so state has to live
      // on a nested object rather than a top-level key.
      var wall = {};
      steps(scenario.steps, function (step, done) {
        // `this` is the Mocha runnable. Thread it through as ctx.mocha.step so
        // arrow-function steps can call ctx.mocha.step.skip() at runtime.
        yadda.run(step, { wall: wall, mocha: { step: this } }, done);
      });
    });
  });
});
