const Yadda = require('yadda');
const { featureFile, scenarios, steps } = Yadda.plugins.nodetest.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each((file) => {
  featureFile(file, (feature) => {
    const library = require('./lib/bottles-library');
    const yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, (scenario) => {
      // A mutable object shared by reference across the scenario's steps.
      // Yadda flattens the context afresh for each step, so state has to live
      // on a nested object rather than a top-level key.
      const wall = {};
      steps(scenario.steps, function (step, done) {
        // `this` is the node:test runnable supplied by the plugin. Thread it
        // through as ctx.test so arrow-function steps can call ctx.test.skip()
        // at runtime.
        yadda.run(step, { wall: wall, test: this }, done);
      });
    });
  });
});
