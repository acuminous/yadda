const Yadda = require('yadda');
const { featureFile, scenarios, steps } = Yadda.plugins.nodetest.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each((file) => {
  featureFile(file, (feature) => {
    const csvLibrary = require('./csv-library');
    const poemLibrary = require('./poem-library');

    const yadda = Yadda.createInstance([csvLibrary, poemLibrary]);

    scenarios(feature.scenarios, (scenario) => {
      steps(scenario.steps, (step, done) => {
        yadda.run(step, done);
      });
    });
  });
});
