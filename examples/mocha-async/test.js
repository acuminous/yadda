const Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each((file) => {
  featureFile(file, (feature) => {
    const library = require('./bottles-library');
    const yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, (scenario) => {
      steps(scenario.steps, (step, done) => {
        yadda.run(step, { step }, done);
      });
    });

    rules(feature.rules, (rule) => {
      scenarios(rule.scenarios, (scenario) => {
        steps(scenario.steps, (step, done) => {
          yadda.run(step, { step }, done);
        });
      });
    });
  });
});
