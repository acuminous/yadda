const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
jasmine.getEnv().addReporter(new SpecReporter());

const Yadda = require('yadda');
Yadda.plugins.jasmine.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function (file) {
  featureFile(file, function (feature) {
    const library = require('../bottles-library');
    const yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, function (scenario) {
      steps(scenario.steps, function (step, done) {
        yadda.run(step, done);
      });
    });
  });
});
