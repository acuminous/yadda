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
      steps(scenario.steps, (step, done) => {
        // `step` is the runnable supplied by the plugin. Thread it through the
        // context so arrow-function steps can call ctx.step.skip() at runtime.
        yadda.run(step, { wall: wall, step }, done);
      });
    });
  });
});
