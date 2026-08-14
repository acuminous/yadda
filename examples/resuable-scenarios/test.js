const Yadda = require('yadda');
const { featureFile, scenarios, steps } = Yadda.plugins.nodetest.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each((file) => {
  featureFile(file, (feature) => {
    const library = require('./bottles-library');
    const yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, (scenario) => {
      const ctx = { yadda: yadda };
      steps(scenario.steps, (step, done) => {
        yadda.run(step, ctx, done);
      });
    });
  });
});
