const Yadda = require('yadda');
const { featureFile, scenarios, steps } = Yadda.plugins.nodetest.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each((file) => {
  featureFile(file, (feature) => {
    const transpileLibrary = require('./transpile-library');

    const yadda = Yadda.createInstance(transpileLibrary);

    scenarios(feature.scenarios, (scenario) => {
      steps(scenario.steps, (step, done) => {
        yadda.run(step, done);
      });
    });
  });
});
