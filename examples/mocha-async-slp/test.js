const Yadda = require('yadda');
Yadda.plugins.mocha.ScenarioLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function (file) {
  featureFile(file, function (feature) {
    const library = require('./bottles-library');
    const yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, function (scenario, done) {
      yadda.run(scenario.steps, done);
    });
  });
});
