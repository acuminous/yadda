var Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function (file) {
  featureFile(file, function (feature) {
    var library = require('./bottles-library');
    var yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, function (scenario) {
      steps(scenario.steps, function (step) {
        yadda.run(step);
      });
    });

    rules(feature.rules, function (rule) {
      scenarios(rule.scenarios, function (scenario) {
        steps(scenario.steps, function (step) {
          yadda.run(step);
        });
      });
    });
  });
});
